var serialport = require('serialport');
var SerialPort = serialport; // make a local instance of it
var arduinoPort = '/dev/cu.wchusbserial14230';
//var arduinoPort = '/dev/ttyACM0';

var arduinoSerial = new SerialPort(arduinoPort, {
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {

        /*socket.on('alarmToggle', function (jsonData) {
         console.log("JSON DATA: " + jsonData.state);
         var state = jsonData.state;
         //socket.broadcast.emit('alarmAct');
         arduinoSerial.on('data', function (data) {
         var serialData = JSON.parse(data);
         var laser = serialData.Laser;

         if(laser == 1 && state == 1){
         console.log('ALARM');
         //socket.emit('serialEvent', serialData);
         socket.emit("alarmAct");
         }else{
         console.log('DEAKTIVERT');
         //socket.emit('serialEvent', serialData);
         socket.emit("alarmDeac");
         }
         });
         });*/


        socket.on('alarmActivate', function (jsonData) {
            console.log("JSON DATA: " + jsonData.state);
            var state = jsonData.state;
            //socket.broadcast.emit('alarmAct');
            arduinoSerial.on('data', function (data) {
                var serialData = JSON.parse(data);
                var laser = serialData.Laser;
                if (laser == 1 && state == 1) {
                    console.log('ALARM **************');
                    //socket.emit('serialEvent', serialData);
                    socket.broadcast.emit("alarmAct");
                }
            });
        });



        socket.on('alarmDeactivate', function () {
            socket.removeAllListeners('alarmActivate');
            console.log("REMOVED ************************");
            //socket.broadcast.emit('alarmAct');
        });
        arduinoSerial.on('data', function (data) {
            //console.log("KJØRER VANLIG DATA")
            var serialData = JSON.parse(data);
            console.log(data);
            socket.emit('serialEvent', serialData);
        });
    });
};