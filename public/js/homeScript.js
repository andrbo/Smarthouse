var socket = io();
var celsius = '&#8451;';

// Socket event listning to emitted data from socket located in alarmActivated.js
socket.on('serialEvent', function (data) {

    var soilValue = $('#soilValue');
    soilReading(data);

    var tempValue = $('#tempValue');
    tempReading(data);

    var humValue = $('#humValue');
    humReading(data);
});
// Functions below uses the json data emitted from the socket inside alarmActivated.js to display sensor values used in the home view.

// Function for reading the soil moisture value from the Arduino.
function soilReading(data) {
    var dry = 500;
    var soil = data.SoilMoisture;
    if (soil > dry) {
        $('#soilWarning').css("display","block");
    }
};

// Function for reading the temperature value of the DHT11 sensor
function tempReading(data) {
    var tempSensorValue = data.Temperature;
    if (tempSensorValue < 5) {
        $('#tempValue').html(tempSensorValue + celsius);
        $('#tempValue').css("color", "#42a7f4");
    }
    if (tempSensorValue > 5 && tempSensorValue < 30) {
        $('#tempValue').html(tempSensorValue + celsius);
        $('#tempValue').css("color", "#40bf43");
    }
    if (tempSensorValue > 30) {
        $('#tempValue').html(tempSensorValue + celsius);
        $('#tempValue').css("color", "#f46e41");
    }
};

// Function for reading the humidity value of the  DHT11 sensor
function humReading(data) {
    var humSensorValue = data.Humidity;
    $('#humValue').html(humSensorValue+"%");
}

