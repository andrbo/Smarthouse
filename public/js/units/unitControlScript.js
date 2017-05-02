/*
 * The Script is used in units.hbs, and takes care of filling the datatables and controlling the tabs
 */

var socket = io();

// Socket function for reloading the page, if another has made changes. This ensures that the system is displaying the correct state, descriptions and so on.
socket.on('deviceChange', function () {
    window.location.reload(true);
});

$(function () {

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
    // and emitts a socket message to unitControl.js which in turn turns on/off the unit.
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
        $('#editUnitModal').modal('show');
        $('#editDevUnitno').html(unit);
        $('#editDevDescript').html(desc);
        $('#editDevGroup').html(group);
    });

    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        localStorage.setItem('lastTab', $(e.target).attr('href'));
    });
    var lastTab = localStorage.getItem('lastTab');
    if (lastTab) {
        $('#controlTabs a[href="' + lastTab + '"]').tab('show');
    }

});

// Function used for adding new groups in the edit group and add device modal
function addNewGroup(newGroup, callback) {
    var groupInput = newGroup;
    var test = 0;
    if(callback) {
        $.post('/addGroup', {
            name: groupInput
        }).done(function (data) {
            var error = data.addError;
            if (error === 1) {
                $('#groupErr').css("display", "block");
                if ($('#newGroupInput').click(function () {
                        $('#groupErr').css("display", "none");
                    }));
            } else {
                $('#newGroupInput').css("display", "none");
                $('#addNewGroupBtns').css("display", "none");
                $('#groupValues').append("<li><a class='listGroups'>" + groupInput + "</a></li>")
            }
        });
    }
    console.log(test);
}