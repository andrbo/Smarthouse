/*This script controlls the information that is shown in information.hbs*/

var socket = io();
var celsius = '&#8451;';

// Socket event listning to emitted data from socket located in alarmAndLuxController.js
socket.on('serialEvent', function (data) {

    var soilValue = $('#soilValue');
    soilReading(data);

    flameReading(data);

    tempReading(data);

    var humValue = $('#humValue');
    humReading(data);

    noErrors();

    laserReading(data);
});

// Functions below uses the json data emitted from the socket inside alarmAndLuxController.js to display sensor values used in the home view.

// Function for reading the soil moisture value from the Arduino.
function soilReading(data) {
    var dry = 500;
    var soil = data.SoilMoisture;
    var laserAlert = $("#soilAlarm").html();
    var content = '<tr id="laserAlert" class="bg-danger"><td>' + laserAlert + '</td>' + '</tr>';
    if (soil > dry && !$("#laserAlert").length) {
        $('#sensorWarningsTable tbody').append(content);
        $('#sensorWarningGlyphicon').addClass("glyphicon-remove").css({
            "color": "red",
            "font-size": "100px",
            "opacity": "0.8"
        }).removeClass("glyphicon-ok");
        $('#noWarningsHeader').hide();
    }
    if (soil <  dry) {
        $('#sensorWarningsTable #laserAlert').remove();
        noErrors();
    }
}

// Function for reading the soil moisture value from the Arduino.
function laserReading(data) {
    var laser = data.Laser;
    var laserAlert = $("#laserAlarm").html();
    var content = '<tr id="laserAlert" class="bg-danger"><td>' + laserAlert + '</td>' + '</tr>';
    if (laser == 1 && !$("#laserAlert").length) {
        $('#sensorWarningsTable tbody').append(content);
        $('#sensorWarningGlyphicon').addClass("glyphicon-remove").css({
            "color": "red",
            "font-size": "100px",
            "opacity": "0.8"
        }).removeClass("glyphicon-ok");
        $('#noWarningsHeader').hide();
    }
    if (laser == 0) {
        $('#sensorWarningsTable #laserAlert').remove();
        noErrors();
    }
}

// Function used for updating the value for the flame sensor
function flameReading(data) {
    var flameSensorValue = data.Flame;
    var flameAlert = $("#flameAlarm").html();
    var content = '<tr id="flameAlert" class="bg-danger"><td>' + flameAlert + '</td>' + '</tr>';
    if (flameSensorValue == 0 && !$("#flameAlert").length) {
        $('#sensorWarningsTable tbody').append(content);
        $('#sensorWarningGlyphicon').addClass("glyphicon-remove").css({
            "color": "red",
            "font-size": "100px",
            "opacity": "0.8"
        }).removeClass("glyphicon-ok");
        $('#noWarningsHeader').hide();
    }
    if (flameSensorValue == 1) {
        $('#sensorWarningsTable #flameAlert').remove();
        noErrors();
    }
}

//If all sensors are ok.
function noErrors() {
    var length = $("#sensorWarningsTable tr").length;
    if (length == 0) {
        $('#sensorWarningGlyphicon').addClass("glyphicon-ok").css({
            "color": "green",
            "font-size": "100px",
            "opacity": "0.8"
        }).removeClass("glyphicon-remove");
        $('#noWarningsHeader').show();
    }
}

// Function for reading the temperature value of the DHT11 sensor
function tempReading(data) {
    var tempSensorValue = data.Temperature;
    var outTemp1 = data.Ds1Value;
    var outTemp2 = data.Ds2Value;
    $('#tempOut1').html(outTemp1 + celsius);
    $('#tempOut2').html(outTemp2 + celsius);
    $('#tempValue').html(tempSensorValue + celsius);
}

// Function for reading the humidity value of the  DHT11 sensor
function humReading(data) {
    var humSensorValue = data.Humidity;
    $('#humValue').html(humSensorValue + "%");
}