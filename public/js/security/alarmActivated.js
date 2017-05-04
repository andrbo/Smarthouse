var nodemailer = require('nodemailer');

var serialData = require("../middlewars/arduinoData");
var alarmState = 0; //When server starting.
serialData = "";
var tempData = [];


module.exports = function (app, io, mailGroup) {
    var currentTime = getDate();


    io.sockets.emit('serialEvent', serialData);
    switch (alarmState) {
        case 0:
            generalAlarm(data)
            break;
        case 1:
            alarmOn(data);
            generalAlarm(data)
            break;
    }
    var alarmJson = [];
    var generalJson = [];

    function alarmOn(data) {
        console.log('alarm er på');
        var sensorData = JSON.parse(data);
        var vibe = sensorData.VibeValue;
        var ir = sensorData.IRBarrierValue;
        var pir = sensorData.PirValue;
        var laser = sensorData.Laser;

        if (vibe == 1) {
            ifAlarmSendMail("Vibe", getDate());
        }
        if (ir == 0) {
            ifAlarmSendMail("IR", getDate());
        }
        if (pir == 1) {
            ifAlarmSendMail("PIR", getDate());
        }
        if (laser == 1) {
            ifAlarmSendMail("Laser", getDate());
        }
        console.log("ALARMJSON: " + JSON.stringify(alarmJson));
    }

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
                console.log("SENDER MAIL");
                getMailGroup(function (err, res) {
                    for (var i = 0; i < res.length; i++) {
                        sendMail(res[i].email, name);
                    }
                });
            }
        }

        if (!exist) {
            console.log("Eksisterer ikke");
            alarmJson.push({name: name, time: getDate()});
        }
    }

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
                console.log("SENDER MAIL");
                getMailGroup(function (err, res) {
                    for (var i = 0; i < res.length; i++) {
                        sendMail(res[i].email, name);
                    }
                });
            }
        }

        if (!exist) {
            console.log("Eksisterer ikke");
            generalJson.push({name: name, time: getDate()});
        }
    }

    function generalAlarm(data) {
        var sensorData = JSON.parse(data);
        var gas = sensorData.Gas;
        var flame = sensorData.Flame;
        var leak = sensorData.LeakValue;
        //Thresholds
        var gasThreshold = 300;
        var leakThreshold = 1000;

        if (gas > gasThreshold) {
            // Gass registrert
            ifGeneralAlarmSendMail("Gas", getDate());
            console.log('Gass registrert');
        }
        if (flame == 0) {
            // Flamme registeert
            ifGeneralAlarmSendMail("Flame", getDate());
            console.log('flamme registrert');
            console.log(JSON.stringify(generalJson));
        }
        if (leak < leakThreshold) {
            // Lekasje detektert
            console.log('lekasje detektert');
            ifGeneralAlarmSendMail("Leak", getDate());

        }
        //console.log("GENEREAL JSJON" + JSON.stringify(generalJson));
    }

    function getDate() {
        var date = new Date().toISOString().slice(14, 19);
        return date;
    }

    io.sockets.on('connection', function (socket) {
        socket.on('alarmToggle', function (data) {
            console.log("STATE: " + data.state);
            alarmState = data.state;
        });
        socket.emit('serialEvent', serialData);
        console.log("DARTA:  " + serialData)
    });

    function sendMail(email, name) {
        var temp = "Følgende alarm er blitt aktivert: ";
        var temp2 = name;

        console.log("TEMP2: " + temp2);

        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",  //Automatically sets host, port and connection security settings
            auth: {
                user: "Smarthus2017@gmail.com",
                pass: "Smarthus"
            }
        });
        smtpTransport.sendMail({
            from: "<Smarthus2017@gmail.com>", //Sender address. Must be the same as authenticated user if using Gmail.
            to: email, // receiver
            subject: "Alarm aktivert!", //TODO: Fiks internasjonalisering
            text: temp + temp2// body
        }, function (error, response) {  //callback
            if (error) {
                console.log(error);
            } else {
                console.log("Message sent: " + response.message);
                res.redirect('/home');
            }
            smtpTransport.close(); //Shut down the connection, no more messages.
        });
    }
};