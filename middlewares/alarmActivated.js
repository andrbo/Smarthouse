var serialport = require('serialport');
var SerialPort = serialport; // make a local instance of it
//var arduinoPort = '/dev/cu.wchusbserial14210';
//var arduinoPort = '/dev/ttyACM0';
var arduinoPort = 'COM4';
var arduinoSerial = new SerialPort(arduinoPort, {
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});
var alarmState;
var serialData ="";
var tempData = [];


module.exports = function (app, io) {

    getState();

    arduinoSerial.on('data', function (data) {
        serialData = JSON.parse(data);
        switch(alarmState){
            case 0:
                generalAlarm(data)
                break;
            case 1:
                 alarmOn(data);
                 generalAlarm(data)
                 break;
        }
    });



function alarmOn(data){
    var alarmJson = [];
    console.log('alarm er på')
    var sensorData = JSON.parse(data);
    var vibe = sensorData.VibeValue;
    var ir = sensorData.IRBarrierValue;
    var pir = sensorData.PirValue;
    var laser = sensorData.Laser;

    if(vibe == 1){
        alarmJson.push({Vibe: 1});
    };
    if(ir == 0){
        alarmJson.push({IR: 1});
    }
    if(pir == 1){
        alarmJson.push({PIR: 1});
    }
    if(laser == 1){
        alarmJson.push({Laser: 1, Time: getDate()});
    }
    if(alarmJson.length > 0){
        sendAlert(alarmJson);
        console.log('Sender epost med følgende innbruddsdata: '+ JSON.stringify(alarmJson));
    }
}

function generalAlarm(data) {
    var generalJson = [];
    console.log('JSON oppretter har lengde: '+generalJson.length);
    var sensorData = JSON.parse(data);
    var gas = sensorData.Gas;
    var flame = sensorData.Flame;
    var leak = sensorData.LeakValue;
    //Thresholds
    var gasThreshold = 200;
    var leakThreshold = 1000;

    if(gas>gasThreshold){
       // Gass registrert
        generalJson.push({Gas: 1});
        console.log('Gass registrert');
    }
    if(flame == 0){
       // Flamme registeert
        generalJson.push({Flame: 1 });
        console.log('flamme registrert');
        console.log(JSON.stringify(generalJson));
        console.log('JSON har nå lengde: '+generalJson.length);
    }
    if(leak < leakThreshold){
        // Lekasje detektert
        console.log('lekasje detektert');
        generalJson.push({Leak: 1});
        console.log()

    }
    if(generalJson.length > 0){
        if(tempData.length==0) {
            tempData = generalJson;
        }
        // Gå gjennom begge tabellene og let etter sensor med tid
        // sammenlign om disse er mer enn 5min fra hverandre ( eller mer)
        console.log('sender epost med følgende data: '+JSON.stringify(generalJson));
        sendAlert(generalJson);
    }
    //    ((sendEpost("Følgende alarmer har gått: " + strong)
   // }
};

function getDate(){
  var date = new Date();
  return date;
}
io.sockets.on('connection', function (socket) {
    socket.on('alarmToggle', function (data){
        getState();
    });
    socket.emit('serialEvent', serialData);
});

function sendAlert(data){
    console.log('Recieved data in sendAlert()' + JSON.stringify(data));
    //for(i=0; i<data.length; i++){
    //    for(keys in )
   // }
}

function getState(){
   // app.post('/alarmState',function(){
   //     console.log('kjøreer spørring');
   // });
    alarmState = 1;
   // Bruke denne?
   // $.post('/alarmState').done(function (data) {
   //     var state = JSON.stringify(data[0].value);
   //     alarmState = state;
   // });
};


};