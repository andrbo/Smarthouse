/*
 * The Script is used in units.hbs, and takes care of filling the datatables and controlling the tabs
 */

var socket = io();
$(function () {
    // Socket function for reloading the page, if another has made changes. This ensures that the system is displaying the correct state, descriptions and so on.
    socket.on("deviceChange", function () {
        window.location.reload(true);
    });

    // Creating the DataTable which contains the different units
    var table = $("#unitTable").DataTable({
        ajax: {
            dataSrc: '',
            url: '/getUnits',
        },
        scrollY: "385px",
        bPaginate: true,
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
            {data: "luxstate", visible: false},
            {data: "luxvalue", visible: false},
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
            var newState = 0;
            $.post('/toggleUnit', {
                unitId: unitId,
                state: newState
            }).done(function (data) {
                function toggleDeviceOff(callback) {
                    if (callback) {
                        socket.emit('deviceOff', {unitno: data.id});
                    }
                }

                toggleDeviceOff(function () {
                })
            });
        } else {
            var newState = 1;
            $.post('/toggleUnit', {
                unitId: unitId,
                state: newState
            }).done(function (data) {
                function toggleDeviceOn(callback) {
                    if (callback) {
                        socket.emit('deviceOn', {unitno: data.id});
                    }
                }

                toggleDeviceOn(function () {
                })
            });
        }
    });

    // Function for displaying a summary modal for each row, which also contains methods for deleting, changing group or description
    $('table tbody').on('click', ' tr [type!=button]', function () {
        var data = table.row(this).data();
        var unit = data.id;
        var desc = data.description;
        var group = data.groupid;
        var luxState = data.luxstate;
        var luxValue = data.luxvalue;
        $('#editUnitModal').modal('show');
        $('#editDevUnitno').html(unit);
        $('#editDevDescript').html(desc);
        $('#editDevGroup').html(group);
        if (luxState == 1) {
            $('#editDevLuxCheck').bootstrapToggle('on');
            $('#editDevLuxValue').slider('setValue', luxValue);
        } else {
            $('#editDevLuxCheck').bootstrapToggle('off');
            $('#editDevLuxValue').slider('disable');
        }

    });

    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        localStorage.setItem('lastTab', $(e.target).attr('href'));
    });
    var lastTab = localStorage.getItem('lastTab');
    if (lastTab) {
        $('#controlTabs a[href="' + lastTab + '"]').tab('show');
    }
    var mySlider = $("input.slider").bootstrapSlider();
});

// Function used for adding new groups in the edit group and add device modal
function addNewGroup(newGroup, callback) {
    var groupInput = newGroup;
    var test = 0;
    if (callback) {
        $.post('/groups', {
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
            window.location.reload(true);
        });
    }
}