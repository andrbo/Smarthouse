/**
 * Created by Anbor on 03.04.2017.
 */
var socket = io();

socket.on('serialEvent', function (data) {

    var flameValue = document.getElementById('flameValue');
    flameReading(data);
    var gasValue = document.getElementById('gasValue');
    gasReading(data);
    var leakValue = document.getElementById('leakValue');
    leakReading(data);
    var laserValue = document.getElementById('laserValue');
    laserReading(data);
    var vibeValue = document.getElementById('vibeValue');
    vibeReading(data);
    var irValue = document.getElementById('irValue');
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

function flameReading(data) {
    var flameSensorValue = data.Flame;
    if (flameSensorValue == 1) {
        flameValue.innerHTML = "OK";
        flameValue.style.color = "green";
    } else {
        flameValue.innerHTML = 'synlig flamme';//"{{__ "Visible-Flame"}}";
        flameValue.style.color = "red";
    }
}
;


// Må kalibreres mot en gass
function gasReading(data) {
    var gasSensorValue = data.Gas;
    if (gasSensorValue <= 300) {
        gasValue.innerHTML = "OK";
        gasValue.style.color = "green";
    } else {
        gasValue.innerHTML = 'Gas detektert';//"{{__ "Gas-Detection"}}";
        gasValue.style.color = "red";
    }
}
;

function leakReading(data) {
    var leakSensorValue = data.LeakValue;
    if (leakSensorValue > 970) {
        leakValue.innerHTML = "OK";
        leakValue.style.color = "green";
    } else {
        leakValue.innerHTML = 'Lekasje detektert';//"{{__ "Leak-Detection"}}";
        leakValue.style.color = "red";
    }
}
;

function laserReading(data) {
    var laserSensorValue = data.Laser;
    if (laserSensorValue == 0) {
        laserValue.innerHTML = "OK";
        laserValue.style.color = "green";
    } else {
        laserValue.innerHTML = 'Laser brutt';//"{{__ "Laser-Trip"}}";
        laserValue.style.color = "red";
    }
}
;

function vibeReading(data) {
    var vibeSensorValue = data.VibeValue;
    if (vibeSensorValue == 0) {
        vibeValue.innerHTML = "OK";
        vibeValue.style.color = "green";
    } else {
        vibeValue.innerHTML = 'vibrasjon detektert';//"{{__ "Vibe-Detection"}}";
        vibeValue.style.color = "red";
    }

}
;

function irReading(data) {
    var irSensorValue = data.IRBarrierValue;
    if (irSensorValue == 1) {
        irValue.innerHTML = "OK";
        irValue.style.color = "green";
    } else {
        irValue.innerHTML = 'IR brutt';//"{{__ "IR-Detection"}}";
        irValue.style.color = "red";
    }
}
;

// Script for aktivering/deaktivering av alarm, skal sørge for at slideren holdes oppdatert

var toggleState;
$(function () {
    updateToggleState();
});

function updateToggleState() {
    $.post('/alarmState').done(function (data) {
        var state = JSON.stringify(data[0].value);
        buttonState(state);
        toggleState = state;
    });
}
;

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

function passwordCheck(input) {

}

function buttonState(value) {
    if (value == 1) {
        $('#toggle').html('{{__ "Deac-Alarmbtn"}}');
        $('#toggle').css("background-color", "red");
    } else {
        $('#toggle').html('Aktiver');//('{{__ "Act-Alarmbtn"}}');
        $('#toggle').css("background-color", "green");
    }
}
;


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

// Cancel knapp i aktiver alarm modal
$('#btnCancelAcAlarm').click(function () {

    //$('#toggle').bootstrapToggle('off');
    $('#activateAlarmPw').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});

// Deaktiver alarm knapp i deaktiver alarm modal
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

// Cancel knapp i deaktiver alarm modal
$('#btnCancelDeacAlarm').click(function () {
    $('#deactivateAlarmPw').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});
