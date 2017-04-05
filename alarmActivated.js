var serialport = require('serialport');
var SerialPort = serialport; // make a local instance of it
var arduinoPort = 'COM3';
//var arduinoPort = '/dev/ttyACM0';

var arduinoSerial = new SerialPort(arduinoPort, {
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});

module.exports = function(io){

    io.sockets.on('connection', function (socket) {
        socket.on('alarmActivated', function () {
            console.log('alarmActivated.js triggered .....Alarm på server aktiveres');
            socket.broadcast.emit('alarmAct');
            arduinoSerial.on('data', function (data) {
                var serialData = JSON.parse(data);
                if(serialData.Laser == 1){
                    console.log('ALARM ALARM ALARM')
                }
                socket.emit('serialEvent', serialData);
            });
        });

        socket.on('alarmDeactivated', function () {
            console.log('alarm deaktiver server');
            socket.broadcast.emit('alarmDeac');
            arduinoSerial.on('data', function (data) {
                var serialData = JSON.parse(data);
                console.log(data);
                socket.emit('serialEvent', serialData);
            });
        });

    });
};






