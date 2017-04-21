var serialport = require('serialport');
var SerialPort = serialport; // make a local instance of it
var arduinoPort = '/dev/cu.wchusbserial14210';
//var arduinoPort = '/dev/ttyACM0';

var arduinoSerial = new SerialPort(arduinoPort, {
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});

module.exports = function(io){

    io.sockets.on('connection', function (socket) {
        socket.on('alarmToggle', function (jsonData) {
            socket.broadcast.emit('alarmAct');
            arduinoSerial.on('data', function (data) {
                var serialData = JSON.parse(data);
                if(serialData.Laser == 1 && jsonData.state == 1){
                    console.log('ALARM')
                    socket.emit('serialEvent', serialData);
                    socket.emit("alarmAct");
                }else{
                    console.log('DEAKTIVERT')
                    socket.emit('serialEvent', serialData);
                    socket.emit("alarmDeac");
                }
            });
        });


        arduinoSerial.on('data', function (data) {
            var serialData = JSON.parse(data);
            console.log(data);
            socket.emit('serialEvent', serialData);
        });
    });
};






