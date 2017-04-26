var socket = io();
var celsius = '&#8451;';

// Socket event listning to emitted data from socket located in alarmActivated.js
socket.on('serialEvent', function (data) {

    var soilValue = $('#soilValue');
    //soilReading(data);

    flameReading(data);

    var tempValue = $('#tempValue');
    tempReading(data);

    var humValue = $('#humValue');
    humReading(data);

    noErrors();

    laserReading(data);
});
// Functions below uses the json data emitted from the socket inside alarmActivated.js to display sensor values used in the home view.

// Function for reading the soil moisture value from the Arduino.
/*function soilReading(data) {
    var dry = 500;
    var soil = data.SoilMoisture;
    if (soil > dry) {
        var content = "<tr><td>Vann planta</td></tr>"
        $('#sensorWarningsTable tbody').html(content);
        $('#sensorWarningGlyphicon').addClass("glyphicon-remove").css({"color": "red", "font-size": "100px", "opacity": "0.8"}).removeClass("glyphicon-ok");
        $('#noWarningsHeader').hide();
    }
}*/

// Function for reading the soil moisture value from the Arduino.
function laserReading(data) {
    var laser = data.Laser;
    console.log("DATA: " + laser);
    if (laser == 1) {
        var content = "<tr><td>Laser brutt</td></tr>"
        $('#sensorWarningsTable tbody').html(content);
        $('#sensorWarningGlyphicon').addClass("glyphicon-remove").css({"color": "red", "font-size": "100px", "opacity": "0.8"}).removeClass("glyphicon-ok");
        $('#noWarningsHeader').hide();
    }
}

// Function used for updating the value for the flame sensor
function flameReading(data) {
    var flameSensorValue = data.Flame;
    console.log("FLAMME: " + flameSensorValue)
    if (flameSensorValue == 0) {
        var content = "<tr><td>FLAMME</td></tr>"
        $('#sensorWarningsTable tbody').html(content);
        $('#sensorWarningGlyphicon').addClass("glyphicon-remove").css({"color": "red", "font-size": "100px", "opacity": "0.8"}).removeClass("glyphicon-ok");
        $('#noWarningsHeader').hide();
    }
}

function noErrors(){
    var length = $("#sensorWarningsTable tr").length;
    console.log("LENGTH:" + length);
    if(length == 0){
        $('#sensorWarningGlyphicon').addClass("glyphicon-ok").css({"color": "green", "font-size": "100px", "opacity": "0.8"}).removeClass("glyphicon-remove");
        $('#noWarningsHeader').show();
    }
}

// Function for reading the temperature value of the DHT11 sensor
function tempReading(data) {
    var tempSensorValue = data.Temperature;
    if (tempSensorValue < 5) {
        $('#tempValue').html(tempSensorValue + celsius).css("color", "#42a7f4");
    }
    if (tempSensorValue > 5 && tempSensorValue < 30) {
        $('#tempValue').html(tempSensorValue + celsius).css("color", "#40bf43");
    }
    if (tempSensorValue > 30) {
        $('#tempValue').html(tempSensorValue + celsius).css("color", "#f46e41");
    }
}

// Function for reading the humidity value of the  DHT11 sensor
function humReading(data) {
    var humSensorValue = data.Humidity;
    $('#humValue').html(humSensorValue+"%");
}

