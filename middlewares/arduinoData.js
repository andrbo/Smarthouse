var serialport = require('serialport');
var SerialPort = serialport; // make a local instance of it
var arduinoPort = '/dev/cu.wchusbserial14230';
//var arduinoPort = '/dev/ttyACM0';
//var arduinoPort = 'COM4';
var arduinoSerial = new SerialPort(arduinoPort, {
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\r\n")
});

arduinoSerial.on('data', function (data) {
    serialData = JSON.parse(data);
});