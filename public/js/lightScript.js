var socket = io();

socket.on('deviceChange', function () {
    window.location.reload(true);
});

// Funksjon for å liste ut tabell av enheter fra db

// Funksjon for å slette fjernkontroller fra en kontakt

// Styring av grupper

// Tidsbestemt styring

// Socket for å oppdatere status for de andre klientene

// Generelle funksjoner for å styre enheter av og på

// Redigere en enhet


$(function () {
    // Function used for getting the different groups from DB, for use in the dropdown when selecting group for a device
    $.post('/getGroups').done(function (data) {
        var dropdownAddDevice = $("#groupValues");
        var dropdownChangeDevice = $("#groupValuesTest");
        for (var i = 0; i < data.length; i++) {
            dropdownAddDevice.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
            dropdownChangeDevice.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
        }
    });

    // Creating the DataTable which contains the different units
    var table = $("#unitTable").DataTable({
        ajax: {
            dataSrc: '',
            url: '/getUnits',
        },
        scrollY: "430px",
        searching: false,
        info: false,
        lengthChange: false,
        "rowCallback": function (row, data, index) {
            if (data.state == 1) {
                $('td button', row).html("ON").css({"background-color": "green"});
            } else {
                $('td button', row).html("OFF").css({"background-color": "red"});
            }
        },
        columns: [
            {data: "id"},
            {data: "description"},
            {data: "state"},
            {data: "groupid"},
            {defaultContent: "<button></button>"}
        ]
    });


    // Click function for the on/off toggle button in the DataTable. Function updates the DB with new state of the device,
    // and emitts a socket message to lightControl.js which in turn turns on/off the unit.
    $('table tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        var state = data.state;
        var unitId = data.id;
        if (state === 1) {
            console.log('lampe er på, skrur den av');
            var newState = 0;
            $.post('/toggleUnit', {
                unitId: unitId,
                state: newState
            }).done(function (data) {
                socket.emit('deviceOff', {unitno: unitId});
                window.location.reload(true);
            });
        } else {
            var newState = 1;
            $.post('/toggleUnit', {
                unitId: unitId,
                state: newState
            }).done(function (data) {
                console.log('lampe er av, skrur den på');
                socket.emit('deviceOn', {unitno: unitId});
                window.location.reload(true);
            });
        }
    });

    // Function for displaying a summary modal for each row, which also contains methods for deleting, changing group or description
    $('#unitTable').on('click', ' tr', function () {
        var data = table.row(this).data();
        var unit = data.id;
        var desc = data.description;
        var group = data.groupid;
        $('#editDeviceModal').modal('show');
        $('#editDevUnitno').html(unit);
        $('#editDevDescript').html(desc);
        $('#editDevGroup').html(group);
    });

});

/*
*  Following functions is used in the change device modal
 */

// Functions for changing the description of the device
$('#changeDescription').click(function () {
    $('#changeDescripInput').css('display', 'block');
    $('#saveNewDescript').click(function(){
        var newDescription = $('#newDescriptInput').val();
        $('#editDevDescript').html(newDescription);
        $('#changeDescripInput').css('display','none');
    });
    $('#cancelNewDescript').click(function () {
        $('#changeDescripInput').css('display', 'none');
    });
});


// Functions for changing the group of the device
$('#changeGroup').click(function () {
    $("#changeGroupInput").css("display", "block")
    $('.listGroups').click(function () {
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    });
    $('#saveChangeGroup').click(function(){
        var newGroup = $('#changeGroupSelected').text();
        $('#editDevGroup').html(newGroup);
        $('#changeGroupInput').css('display','none');
    });
    $('#cancelChangeGroup').click(function(){
        $('#changeGroupInput').css('display','none');
    });
});

$('#saveChangeDevice').click(function () {
    var descript = $('#editDevDescript').text();
    var unitno = $('#editDevUnitno').text();
    var group = $('#editDevGroup').text();
    $.post('/changeDevice', {
        unitno: unitno,
        groupid: group,
        description: descript
    }).done(function (data) {
        $('#editDeviceModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        window.location.reload(true);
    });
})
// Functions for deleting a device
$('#deleteDevice').click(function(){
    var descript = $('#editDevDescript').text();
    var unitno = $('#editDevUnitno').text();
    var group = $('#editDevGroup').text();
    $('#editDeviceModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#deleteDeviceModal').modal('show');
    $('#deleteDevUnitno').html(unitno);
    $('#deleteDevDescript').html(descript);
    $('#deleteDevGroup').html(group);
    $('#deleteDeviceBtn').click(function(){
        $.post('/deleteDevice', {
            unitno: unitno,
        }).done(function (data) {
            $('#deleteDeviceModal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            socket.emit('unpairDevice', {unitno: unitno});
            window.location.reload(true);
        });
    })
})





/*
 *  Following functions is used in the add device modal
 */

// Click function for the add new device button
$('#addDeviceBtn').click(function () {
    $('#addDeviceModal').modal('show');
});

// function for adding a new group
$('#addNewGroup').click(function () {
    $('#newGroupInput').css("display", "block");
    $('#addNewGroupBtns').css("display", "block");

    $('#saveNewGroup').click(function () {
        var groupInput = $('#newGroup').val().trim();
        $.post('/addGroup', {
            name: groupInput
        }).done(function (data) {
            var retur = JSON.stringify(data);
            if (retur === '""') {
                $('#groupErr').css("display", "block");
                if ($('#newGroupInput').click(function () {
                        $('#groupErr').css("display", "none");
                    }));
            } else {
                $('#newGroupInput').css("display", "none");
                $('#addNewGroupBtns').css("display", "none");
            }
        });
    });

    $('#cancelNewGroup').click(function () {
        $('#newGroupInput').css("display", "none");
        $('#addNewGroupBtns').css("display", "none");
    });
});





// function for storing the values set by user in the modal. Later for use in the save and pair modal
$('#activateNewDevice').click(function () {
    var description = $('#descriptInput').val().trim();
    var group = $('#groupDropSelected').text();
    $('#addDeviceModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#saveDeviceModal').modal('show');
    $('#sumDescript').html(description);
    $('#sumGroup').html(group);
});
// Function for setting the text of the button from the selected value in the dropdown
$("#groupDropSelected").click(function () {
    $('.listGroups').click(function () {
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    });
});



/*
*  Functions used in the save and pair device modal
 */

// The function gathers the values from the add device modal, and posts the input values to the DB
// and emits a message to lightControl.js for pairing the new device
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
        $('#saveDeviceModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        var unitId = data.insertId;
        socket.emit('pairDevice', {unitno: unitId});
        window.location.reload(true);
    });
});


