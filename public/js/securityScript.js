/*
 *  Script used in security.hbs
 * Most of its functionality is based around the fetching and updating of the sensor values coming from the arduino.
 * The rest is based on the updating of the alarm status for all the connected users, and activating/ deactivating the alarm.
 */

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

socket.on('alarmDeac', function () {
    buttonState(0);
});

socket.on('alarmAct', function () {
    buttonState(1);
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
        $('#flameValue').html("OK");
        $('#flameValue').css("color", "green");
    } else {
        $('#flameValue').html("Synlig flamme");
        $('#flameValue').css("color", "red");
    }
}
;

// Function used for updating the value for the gas sensor
function gasReading(data) {
    var gasSensorValue = data.Gas;
    if (gasSensorValue <= 300) {
        $('#gasValue').html("OK");
        $('#gasValue').css("color", "green");
    } else {
        $('#gasValue').html("Gas detektert");//"{{__ "Gas-Detection"}}";
        $('#gasValue').css("color", "red");
    }
}
;
// Function for reading the value of the leak sensor
function leakReading(data) {
    var leakSensorValue = data.LeakValue;
    if (leakSensorValue < 800) {
        $('#leakValue').html("OK");
        $('#leakValue').css("color", "green");
    } else {
        $('#leakValue').html("Lekasje detektert");//"{{__ "Leak-Detection"}}";
        $('#leakValue').css("color", "red");
    }
}
;

// Function for reading the value of the photoresistor used for sensing the laser beam
function laserReading(data) {
    var laserSensorValue = data.Laser;
    if (laserSensorValue == 0) {
        $('#laserValue').html("OK");
        $('#laserValue').css("color", "green");
    } else {
        $('#laserValue').html("Laser brutt");//"{{__ "Laser-Trip"}}";
        $('#laserValue').css("color", "green");
    }
}
;


// Function for reading the value of the vibration sensor
function vibeReading(data) {
    var vibeSensorValue = data.VibeValue;
    if (vibeSensorValue == 0) {
        $('#vibeValue').html("OK");
        $('#vibeValue').css("color", "green");
    } else {
        $('#vibeValue').html("__", "Vibe-Detection");
        $('#vibeValue').css("color", "red");
    }

}
;

// Function for reading the value of the IR barrier sensor module
function irReading(data) {
    var irSensorValue = data.IRBarrierValue;
    if (irSensorValue == 1) {
        $('#irValue').html("OK");
        $('#irValue').css("color", "green");
    } else {
        $('#irValue').html("{{__(IR-Detection)}}");
        $('#irValue').css("color", "red");
    }
}
;

// Scripts used for updating the view with the current value of the alarm status

var toggleState; // Used for storing the value of on/off for the alarm in db
$(function () { // on load function makes the connected users get the correct value of activate/deactivate alarm
    updateToggleState();
});

// The function updates the local variable of toggle state, by connecting to the database and reads the value.
// This value is the emitted with a socket to the server, which in turn broadcasts a message to all connected user with the current value of toggleState
function updateToggleState() {
    $.post('/alarmState').done(function (data) {
        var state = JSON.stringify(data[0].value);
        if (state == 1) {
            socket.emit('alarmActivated');
        } else {
            socket.emit('alarmDeactivated');
        }
        buttonState(state);
        toggleState = state;
    });
}
;

// This function uses the toggleState to show the correct modal for activating/ deactivating the alarm
function alarmToggle() {
    if (toggleState == 0) {
        $('#activateAlarmPw').modal('show');
        $('#pwErrorAct').hide();
    } else {
        $('#deactivateAlarmPw').modal('show');
        $('#pwErrorDeac').hide();
    }
}
;

// Function for updating the css of the alarm activation button.
function buttonState(value) {
    if (value == 1) {
        $('#toggle').html('Deaktiver');//("{{__ "Deac-Alarmbtn"}}");
        $('#toggle').css("background-color", "red");
    } else {
        $('#toggle').html('Aktiver');//('{{__ "Act-Alarmbtn"}}');
        $('#toggle').css("background-color", "green");
    }
}
;

// Click function for the activate alarm button inside the activate alarm modal
// The function checks for valid input password from the user by comparing input with the hashed value stored in db.
// If the password is correct, the value of alarm state in db is updated, the button in the view is updated and other connected users is updated.
$('#btnActivateAlarm').click(function () {
    var pwInput = $('#pwAct').val().trim();
    console.log('PW fra bruker: ' + pwInput);
    $.post('/alarmPw', {pw: pwInput}, function (data) {
        var pwCheck = JSON.stringify(data);
        console.log(pwCheck);
        if (pwCheck === '"ok"') {
            $('#activateAlarmPw').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $.post('/alarmToggle', {alarm: 'on'});
            buttonState(1);
            updateToggleState();
            socket.emit('alarmActivated');
        } else {
            $('#pwErrorAct').show();
        }
    });

});

// Click function for the cancel button i activate alarm modal
$('#btnCancelAcAlarm').click(function () {
    $('#activateAlarmPw').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});

// Click function for the deactivate alarm button in the deactivate alarm modal
// The opposite function of the ones described in #btnActivateAlarm function
$('#btnDeactivateAlarm').click(function () {
    var pwInput = $('#pwDeac').val().trim();
    $.post('/alarmPw', {pw: pwInput}, function (data) {
        var pwCheck = JSON.stringify(data);
        if (pwCheck === '"ok"') {
            $.post('/alarmToggle', {alarm: 'off'});
            buttonState(0);
            updateToggleState();
            $('#deactivateAlarmPw').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            socket.emit('alarmDeactivated');

        } else {
            $('#pwErrorDeac').show();
        }
    });
});

// Click function for the cancel button i deactivate alarm modal
$('#btnCancelDeacAlarm').click(function () {
    $('#deactivateAlarmPw').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});