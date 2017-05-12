/*
 * This script contains functions used by the edit unit modal located in units.hbs
 * The modal is triggered from within unitControlScript.js, but click functions ++ for the modal is located here
 */

// Functions for changing the description of the device
$('#changeDescription').click(function () {
    $('#changeDescripInput').css('display', 'block');
    $('#saveNewDescript').click(function () {
        var newDescription = $('#newDescriptInput').val();
        $('#editDevDescript').html(newDescription);
        $('#changeDescripInput').css('display', 'none');
    });
    $('#cancelNewDescript').click(function () {
        $('#changeDescripInput').css('display', 'none');
    });
});

// Functions for changing the group of the unit
$('#changeGroup').click(function () {
    $("#changeGroupInput").css("display", "block")
    $('.listGroups').click(function () {
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    });
    $('#saveChangeGroup').click(function () {
        var newGroup = $('#changeGroupSelected').text();
        $('#editDevGroup').html(newGroup);
        $('#changeGroupInput').css('display', 'none');
    });
    $('#cancelChangeGroup').click(function () {
        $('#changeGroupInput').css('display', 'none');
    });
});


// Function for saving the new settings
$('#saveChangeDevice').click(function () {
    var descript = $('#editDevDescript').text();
    var unitno = $('#editDevUnitno').text();
    var group = $('#editDevGroup').text();
    var luxState;
    if ($('#editDevLuxCheck').prop("checked") == true) {
        luxState = 1;
    } else {
        luxState = 0;
    }
    var luxTreshold = $('#editDevLuxValue').slider('getValue');
    $.post('/changeDevice', {
        unitno: unitno,
        groupid: group,
        description: descript,
        luxstate: luxState,
        luxtresh: luxTreshold
    }).done(function () {

        window.location.reload(true);
    });
});

// Function for deleting a device
$('#deleteDevice').click(function () {
    var descript = $('#editDevDescript').text();
    var unitno = $('#editDevUnitno').text();
    var group = $('#editDevGroup').text();
    $('#editUnitModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#deleteUnitModal').modal('show');
    $('#deleteDevUnitno').html(unitno);
    $('#deleteDevDescript').html(descript);
    $('#deleteDevGroup').html(group);
    $('#deleteDeviceBtn').click(function () {
        $.post('/deleteDevice', {
            unitno: unitno,
        }).done(function () {
            /*$('#deleteUnitModal').modal('hide');
             $('body').removeClass('modal-open');
             $('.modal-backdrop').remove();*/
            socket.emit('unpairDevice', {unitno: unitno});
            window.location.reload(true);
        });
    });
});

$('#editDevLuxValue').slider({
    formatter: function (value) {
        return value;
    }
});