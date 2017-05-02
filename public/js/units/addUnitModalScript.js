/*
 *  This script contains functions used in the add unit modal located in units.hbs.
 */

// Click function for the add new device button
$('#addDeviceBtn').click(function () {
    $('#addUnitModal').modal('show');
    $.get('/getGroups').done(function (data) {
        var dropdownAddDevice = $("#groupValues");
        var dropdownChangeDevice = $("#groupValuesTest");
        for (var i = 0; i < data.length; i++) {
            dropdownAddDevice.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
            dropdownChangeDevice.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
        }
    });
});

// Functions for adding a new group. Show hidden field with a input field and save and cancel buttons
$('#addNewGroup').click(function () {
    $('#newGroupInput').css("display", "block");
    $('#addNewGroupBtns').css("display", "block");
});

$('#saveNewGroup').click(function () {
    var groupInput = $('#newGroup').val().trim();
    addNewGroup(groupInput, function (err, result) {
    });
});

$('#cancelNewGroup').click(function () {
    $('#newGroupInput').css("display", "none");
    $('#addNewGroupBtns').css("display", "none");
});

// function for storing the values set by user in the modal. Later for use in the save and pair modal
$('#activateNewDevice').click(function () {
    var description = $('#descriptInput').val().trim();
    var group = $('#groupDropSelected').text();
    $('#addUnitModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#saveUnitModal').modal('show');
    $('#sumDescript').html(description);
    $('#sumGroup').html(group);
});


// The function gathers the values from the add device modal, and posts the input values to the DB
// and emits a message to unitControl.js for pairing the new device
$('#saveAndPair').click(function () {
    var description = $('#descriptInput').val().trim();
    var groupname = $('#groupDropSelected').text();
    if (groupname == "Select group") {
        groupname == "";
    }
    ;
    $.post('/addUnit', {
        description: description,
        groupname: groupname
    }).done(function (data) {
        $('#saveUnitModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
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