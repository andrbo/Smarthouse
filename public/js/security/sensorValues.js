var socket = io();

// Socket functions
socket.on('serialEvent', function (data) {
    var flameValue = $('#flameValue');
    flameReading(data);
    var gasValue = $('#gasValue');
    gasReading(data);
    var leakValue = $('#leakValue');
    leakReading(data);
    var laserValue = $('#laserValue');
    laserReading(data);
    var vibeValue = $('#vibeValue');
    vibeReading(data);
    var irValue = $('#irValue');
    irReading(data);
});

socket.on('streamCam', function (url) {
    $('#webCam').attr('src', url);
    $('.start').hide();
});

socket.emit('streamCam');

// Function used for updating the value for the flame sensor
function flameReading(data) {
    var flameSensorValue = data.Flame;
    if (flameSensorValue == 1) {
        $('#flameValue').html("OK").css("color", "green");
    } else {
        $('#flameValue').html("Synlig flamme").css("color", "red");
    }
}

// Function used for updating the value for the gas sensor
function gasReading(data) {
    var gasSensorValue = data.Gas;
    if (gasSensorValue <= 300) {
        $('#gasValue').html("OK").css("color", "green");
    } else {
        $('#gasValue').html("Gas detektert").css("color", "red");
    }
}
// Function for reading the value of the leak sensor
function leakReading(data) {
    var leakSensorValue = data.LeakValue;
    if (leakSensorValue < 800) {
        $('#leakValue').html("OK").css("color", "green");
    } else {
        $('#leakValue').html("Lekasje detektert").css("color", "red");
    }
}

// Function for reading the value of the photoresistor used for sensing the laser beam
function laserReading(data) {
    console.log("KLASER: " + data.Laser);
    var laserSensorValue = data.Laser;
    if (laserSensorValue == 0) {
        $('#laserValue').html("OK").css("color", "green");
    } else {
        $('#laserValue').html("Laser brutt").css("color", "red");
    }
}


// Function for reading the value of the vibration sensor
function vibeReading(data) {
    var vibeSensorValue = data.VibeValue;
    if (vibeSensorValue == 0) {
        $('#vibeValue').html("OK").css("color", "green");
    } else {
        $('#vibeValue').html("__", "Vibe-Detection").css("color", "red");
    }

}

// Function for reading the value of the IR barrier sensor module
function irReading(data) {
    var irSensorValue = data.IRBarrierValue;
    if (irSensorValue == 1) {
        $('#irValue').html("OK").css("color", "green");
    } else {
        $('#irValue').html("{{__(IR-Detection)}}").css("color", "red");
    }
}