/*
 *  This script contains functions used in the add unit modal located in units.hbs.
 */

//Get all groups when window is initalized.
$.get('/getGroups').done(function (data) {
    var dropdownAddDevice = $("#groupValues");
    var dropdownChangeDevice = $("#groupValuesTest");
    for (var i = 0; i < data.length; i++) {
        dropdownAddDevice.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
        dropdownChangeDevice.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
    }
});

// Click function for the add new device button
$('#addDeviceBtn').click(function () {
    $('#addUnitModal').modal('show');
});

// Functions for adding a new group. Show hidden field with a input field and save and cancel buttons
$('#addNewGroup').click(function () {
    $('#newGroupInput').css("display", "block");
    $('#addNewGroupBtns').css("display", "block");
});

$('#saveNewGroup').click(function () {
    var groupInput = $('#newGroup').val().trim();
    addNewGroup(groupInput, function (err, result) {});
});

$('#cancelNewGroup').click(function () {
    $('#newGroupInput').css("display", "none");
    $('#addNewGroupBtns').css("display", "none");
});


// The function gathers the values from the add device modal, and posts the input values to the DB
// and emits a message to unitControl.js for pairing the new device
$('#saveAndPair').click(function () {
    var description = $('#descriptInput').val().trim();
    var groupname = $('#groupDropSelected').text();
    if (groupname == "Select group") {
        groupname == "";
    }
    $.post('/units/'+groupname, {
        description: description,
    }).done(function (data) {
        var unitId = data.insertId;
        socket.emit('pairDevice', {unitno: unitId});
        window.location.reload(true);
    });
});


// Function for setting the text of the button from the selected value in the dropdown
$("#groupDropSelected").click(function () {
    $('.listGroups').click(function () {
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    });
});