/*
 *  Script used in security.hbs
 * Most of its functionality is based around the fetching and updating of the sensor values coming from the arduino.
 * The rest is based on the updating of the alarm status for all the connected users, and activating/ deactivating the alarm.
 */



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

// Function for updating the css of the alarm activation button.
function buttonState(value) {
    if (value == 1) {
        $('#alarmButton').html('Deaktiver');//("{{__ "Deac-Alarmbtn"}}");
        $('#alarmButton').css("background-color", "red");
    } else {
        $('#alarmButton').html('Aktiver');//('{{__ "Act-Alarmbtn"}}');
        $('#alarmButton').css("background-color", "green");
    }
}

// Click function for the activate alarm button inside the activate alarm modal
// The function checks for valid input password from the user by comparing input with the hashed value stored in db.
// If the password is correct, the value of alarm state in db is updated, the button in the view is updated and other connected users is updated.
$('#activateAlarmModal').click(function () {
    var pwInput = $('#pwAct').val().trim();
    console.log('PW fra bruker: ' + pwInput);
    $.post('/alarmPw', {pw: pwInput}, function (data) {
        var pwCheck = JSON.stringify(data);
        console.log(pwCheck);
        if (pwCheck === '"ok"') {
            $.post('/alarmToggle', {alarm: 'on'});
            $('#activateAlarmPw').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            buttonState(1);
            updateToggleState();
            socket.emit('alarmToggle', {state: 1});
            window.location.reload(true);
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
            $('#deactivateAlarmPw').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            buttonState(0);
            updateToggleState();
            socket.emit('alarmToggle', {state: 0});
            window.location.reload(true);
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