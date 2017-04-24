var socket = io();

var toggleState; // Used for storing the value of on/off for the alarm in db
$(function () { // on load function makes the connected users get the correct value of activate/deactivate alarm
    updateToggleState();
});

socket.on('alarmDeac', function () {
    buttonState(0);
});

socket.on('alarmAct', function () {
    buttonState(1);
});

// The function updates the local variable of toggle state, by connecting to the database and reads the value.
// This value is the emitted with a socket to the server, which in turn broadcasts a message to all connected user with the current value of toggleState
function updateToggleState() {
    $.post('/alarmState').done(function (data) {
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
function activateAlarmModal(){
    $('#activateAlarmModal').modal('show');

    $("#buttonActivateAlarm").click(function () {
        var pwInput = $('#passwordInputActivate').val();
        console.log("INPUT: " + pwInput);

        $.post('/alarmPw', {pw: pwInput}, function (data) {
            var pwCheck = JSON.stringify(data);
            console.log("Password: " + pwCheck);
            if (pwCheck === "true") {
                $.post('/alarmToggle', {alarm: true});
                $('#activateAlarmModal').modal('hide');
                //$('body').removeClass('modal-open');
                //$('.modal-backdrop').remove();
                buttonState(1);
                updateToggleState();
                socket.emit('alarmActivate', {state: 1});
                window.location.reload(true);
            } else {
                $('#pwErrorAct').show();
            }
        });
    });
}


// Click function for the deactivate alarm button in the deactivate alarm modal
// The opposite function of the ones described in #btnActivateAlarm function
function deActivateAlarmModal(){
    $('#deactivateAlarmModal').modal('show');
    $("#buttonDeactivateAlarm").click(function () {
        var pwInput = $('#passwordInputDeactivate').val();

        $.post('/alarmPw', {pw: pwInput}, function (data) {
            var pwCheck = JSON.stringify(data);
            if (pwCheck === "true") {
                $.post('/alarmToggle', {alarm: false});
                $('#deactivateAlarmModal').modal('hide');
                //$('body').removeClass('modal-open');
                //$('.modal-backdrop').remove();
                buttonState(1);
                updateToggleState();
                socket.emit('alarmDeactivate');
                window.location.reload(true);
            } else {
                $('#pwErrorAct').show();
            }
        });
    });
}
