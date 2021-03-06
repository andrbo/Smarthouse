/*This scripts controls the alarm and lux. The lux can toggle the lights.
 * If turning the alarm on, the user will be notified if there is a burglary*/

var nodemailer = require('nodemailer');
var serialport = require('serialport');
var rfTransmitter = require('nexa');
var wpi = require('wiringpi-node');
var modelUnits = require('../models/units');
var mailGroup = require("../models/User.js");

wpi.setup('wpi');
var pin = 1;
wpi.pinMode(pin, wpi.OUTPUT);

var SerialPort = serialport; // make a local instance of it
var remote = 23328130;
var arduinoPort = '/dev/ttyUSB0'; //Arduino port
var arduinoSerial = new SerialPort(arduinoPort, {
    baudrate: 9600,
    // defaults for Arduino serial communication
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});
var alarmState = 0; //When server starts.
var serialData = "";
var luxUnits;


module.exports = function (app, io) {
    var currentTime = getDate();

    getLuxUnits(function (err, result) {
        luxUnits = result;
    });
    arduinoSerial.on('open', openPort);
    arduinoSerial.on('data', function (data) {
        serialData = JSON.parse(data);
        console.log(serialData);
        io.sockets.emit('serialEvent', serialData);
        switch (alarmState) {
            case 0:
                generalAlarm(data);
                alarmLedToggle();
                luxControl(data, function (err, res) {
                });
                break;
            case 1:
                alarmOn(data);
                generalAlarm(data);
                luxControl(data, function (err, res) {});
                break;
        }
    });


    var alarmJson = [];
    var generalJson = [];

    //If alarm is on
    function alarmOn(data) {
        var sensorData = JSON.parse(data);
        var vibe = sensorData.VibeValue;
        var ir = sensorData.IRBarrierValue;
        var pir = sensorData.PirValue;
        var laser = sensorData.Laser;

        if (vibe == 1) {
            //Send mail with message and date
            ifAlarmSendMail("Vibe", getDate());
            alarmLedToggle();
        }
        if (ir == 0) {
            ifAlarmSendMail("IR", getDate());
            alarmLedToggle();
        }
        if (pir == 1) {
            ifAlarmSendMail("PIR", getDate());
            alarmLedToggle();
        }
        if (laser == 1) {
            ifAlarmSendMail("LASER", getDate());
            alarmLedToggle();
        }
    }

    function alarmLedToggle() {
        if (alarmState == 1) {
            wpi.digitalWrite(pin, 1);
        } else {
            wpi.digitalWrite(pin, 0);
        }
    }

    //Send mail to all registered users.
    function ifAlarmSendMail(name, time) {
        function getMailGroup(callback) {
            mailGroup.getAllEmails(function (err, result) {
                callback(err, result);
            })
        }

        var exist = false;
        for (var i = 0; i < alarmJson.length; i++) {
            currentTime = getDate();
            if (alarmJson[i].name == name) {
                exist = true;
            }

            if (exist && (parseInt(currentTime) - parseInt(alarmJson[i].time)) > 0) {
                if (alarmJson[i].name == name) {
                    alarmJson.splice(i, 1);
                }
                alarmJson.push({name: name, time: time});
                getMailGroup(function (err, res) {
                    for (var i = 0; i < res.length; i++) {
                        sendMail(res[i].email, name);
                    }
                });
            }
        }

        //If alarm is not registered in the array.
        if (!exist) {
            alarmJson.push({name: name, time: getDate()});
        }
    }

    //If general data is trigged, send mail
    function ifGeneralAlarmSendMail(name, time) {
        function getMailGroup(callback) {
            mailGroup.getAllEmails(function (err, result) {
                callback(err, result);
            })
        }

        var exist = false;
        for (var i = 0; i < generalJson.length; i++) {
            currentTime = getDate();
            if (generalJson[i].name == name) {
                exist = true;
            }

            if (exist && (parseInt(currentTime) - parseInt(generalJson[i].time)) > 0) {
                if (generalJson[i].name == name) {
                    generalJson.splice(i, 1);
                }
                generalJson.push({name: name, time: time});
                getMailGroup(function (err, res) {
                    for (var i = 0; i < res.length; i++) {
                        sendMail(res[i].email, name);
                    }
                });
            }
        }

        if (!exist) {
            generalJson.push({name: name, time: getDate()});
        }
    }

    function generalAlarm(data) {
        var sensorData = JSON.parse(data);
        var gas = sensorData.Gas;
        var flame = sensorData.Flame;
        var leak = sensorData.LeakValue;
        //Thresholds
        var gasThreshold = 500;
        var leakThreshold = 1000;

        if (gas > gasThreshold) {
            //Gas registered
            ifGeneralAlarmSendMail("Gas", getDate());
        }
        if (flame == 0) {
            //Flame registered
            ifGeneralAlarmSendMail("Flame", getDate());
        }
        if (leak < leakThreshold) {
            //Leak registered
            ifGeneralAlarmSendMail("Leak", getDate());

        }
    }

    function getDate() {
        var date = new Date().toISOString().slice(14, 19);
        return date;
    }

    io.sockets.on('connection', function (socket) {
        //Socket listen to alarmToggle.
        socket.on('alarmToggle', function (data) {
            alarmState = data.state;
            socket.broadcast.emit('alarmChange');
        });

        //Socket listen to deviceChange
        socket.on('deviceChange', function () {
            getLuxUnits(function (err, result) {
                luxUnits = result;
            })
        });

        socket.emit('serialEvent', serialData);
    });

    function sendMail(email, name) {
        var temp = "Følgende alarm er blitt aktivert: ";
        var temp2 = name;

        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",  //Automatically sets host, port and connection security settings
            auth: {
                user: "Smarthus2017@gmail.com",
                pass: "basf2DDX"
            }
        });
        smtpTransport.sendMail({
            from: "<Smarthus2017@gmail.com>", //Sender address. Must be the same as authenticated user if using Gmail.
            to: email, // receiver
            subject: "Alarm aktivert!",
            text: temp + temp2// body
        }, function (error) {  //callback
            if (error) {
                console.log(error);
            } else {
                res.redirect('/home');
            }
            smtpTransport.close(); //Shut down the connection, no more messages.
        });
    }
};

//Get all units where lux state = 1
function getLuxUnits(callback) {
    if (callback) {
        modelUnits.getLuxUnits(function (err, result) {
            callback(err, result);
        })
    }
}

function luxControl(data, callback) {
    if (callback) {
        var serialData = JSON.parse(data);
        var lux = serialData.LightValue;
        for (var i = 0; i < luxUnits.length; i++) {
            var state = luxUnits[i].state; //Unit state on/off
            var luxTreshold = luxUnits[i].luxvalue; //Unit treshold
            var id = luxUnits[i].id; //Unit id

            luxToggleState(state, lux, luxTreshold, id, function (err, res) {})
        }
    }
}

//Toggle unit on/off
function luxToggleState(state, lux, luxTreshold, id, callback) {
    if (callback) {
        if (state == 0 && lux < luxTreshold) { // The selected luxvalue for the device is lower or equal to the lux value read by the sensor. Turning the device on.
            var toggle = 1;
            console.log("1 if");
            modelUnits.toggleUnit(toggle, id, function (err) {
                if (err) {
                } else {
                    toggleUnitLux(id, toggle, function (err, res) {
                    });
                    getLuxUnits(function (err, result) {
                        luxUnits = result;
                    });
                }
            })
        } else if (state == 1 && lux > luxTreshold) {
            console.log("2 if")
            var toggle = 0;
            modelUnits.toggleUnit(toggle, id, function (err) {
                if (err) {
                } else {
                    toggleUnitLux(id, toggle, function (err, res) {
                    });
                    getLuxUnits(function (err, result) {
                        luxUnits = result;
                    });
                }
            })
        }
    }
}
//Turn on and off units based on lux value.
var toggleUnitLux = function (id, toggle, callback) {
    if (callback) {
        if (toggle == 1) {
            rfTransmitter.nexaOn(remote, id, function () {
            });
        } else {
            rfTransmitter.nexaOff(remote, id, function () {
            })
        }
    }
};

//Function used when opening port for communication with arduino. Sends character which ard listenes to and starts printing.
function openPort() {
    var startToken = 'c';

    function sendData() {
        arduinoSerial.write(startToken.toString());
    }

    setInterval(sendData, 1000);
}
