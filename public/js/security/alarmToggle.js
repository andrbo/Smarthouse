/*This script lets the user toggle the alarm. It also controlls the alarmToggle.hbs view*/

var socket = io();

var toggleState = 0; // Used for storing the value of on/off for the alarm in db

socket.on('alarmChange', function () {
    window.location.reload(true);
});

$(function () { // on load function makes the connected users get the correct value of activate/deactivate alarm
    updateToggleState();

});

// The function updates the local variable of toggle state, by connecting to the database and reads the value.
// This value is the emitted with a socket to the server, which in turn broadcasts a message to all connected user with the current value of toggleState
function updateToggleState() {
    $.get('/alarm').done(function (data) {
        var state = JSON.stringify(data[0].value);
        buttonState(state);
        toggleState = state;
    });
}

// Function for updating the css of the alarm activation button.
function buttonState(value) {
    if (value == 1) {
        $('#alarmButton').html('Deaktiver').css("background-color", "red").click(function () {
            deActivateAlarmModal();
        });
    } else {
        $('#alarmButton').html('Aktiver').css("background-color", "green").click(function () {
            activateAlarmModal();
        });
    }
}


// Click function for the activate alarm button inside the activate alarm modal
// The function checks for valid input password from the user by comparing input with the hashed value stored in db.
// If the password is correct, the value of alarm state in db is updated, the button in the view is updated and other connected users is updated.
function activateAlarmModal() {
    $('#activateAlarmModal').modal('show');

    $("#buttonActivateAlarm").click(function () {
        var pwInput = $('#passwordInputActivate').val();
        $.post('/alarmPw', {
            pw: pwInput
        }).done(function (data) {
            var pwCheck = JSON.stringify(data);
            if (pwCheck === "true") {
                $.post('/alarm', {alarm: true});
                buttonState(1);
                updateToggleState();
                socket.emit('alarmToggle', {state: 1});
                window.location.reload(true);
            } else {
                $('#pwErrorAct').show();
            }
        });
    });
}


// Click function for the deactivate alarm button in the deactivate alarm modal
// The opposite function of the ones described in #btnActivateAlarm function
function deActivateAlarmModal() {
    $('#deactivateAlarmModal').modal('show');
    $("#buttonDeactivateAlarm").click(function () {
        var pwInput = $('#passwordInputDeactivate').val();

        $.post('/alarmPw', {pw: pwInput}, function (data) {
            var pwCheck = JSON.stringify(data);
            if (pwCheck === "true") {
                $.post('/alarm', {alarm: false});
                buttonState(1);
                updateToggleState();
                socket.emit('alarmToggle', {state: 0});
                window.location.reload(true);
            } else {
                $('#pwErrorAct').show();
            }
        });
    });
};

