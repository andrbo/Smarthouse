/*
 *  This scripts contains functions used in the control group tab of units.hbs
 */
var socket = io();

$(function () {
// Socket function for reloading the page, if another has made changes. This ensures that the system is displaying the correct state, descriptions and so on.
    socket.on('deviceChange', function () {
        window.location.reload(true);
    });

    // Creating the DataTable with groups that exists in DB.
    var groupTable = $("#groupTable").DataTable({
        ajax: {
            dataSrc: '',
            url: '/getGroups',
        },
        scrollY: "430px",
        searching: false,
        info: false,
        lengthChange: false,
        "rowCallback": function (row, data) {
            if (data.groupstate == 1) {
                $('td button', row).html("ON").css({"background-color": "green"});
            } else {
                $('td button', row).html("OFF").css({"background-color": "red"});
            }
        },
        columns: [
            {data: "groupname"},
            {data: "groupstate"},
            {defaultContent: "<button></button>"}
        ]
    });

    // Click function for toggling a group on/off
    $('#groupTable tbody').on('click', 'button', function () {
        var data = groupTable.row($(this).parents('tr')).data();
        var state = data.groupstate;
        var groupname = data.groupname;
        // If group is on, turn it off
        if (state === 1) {
            var newState = 0;
            $.post('/toggleGroup', { // Turning the group off
                groupId: groupname,
                state: newState
            }).done(function () {
                $.post('/getUnitsOfGroup', { // Retrieving the units belonging to the group
                    groupId: groupname
                }).done(function (data) {
                    for (var i = 0; i < data.length; i++) { // Turning the devices in the group off
                        $.post('/toggleUnit', {
                            unitId: data[i].id,
                            state: newState
                        }).done(function (data) {
                            function toggleGroupDeviceOff(callback) {
                                if (callback) {
                                    socket.emit('groupDeviceOff', {unitno: data.id});
                                }
                            }

                            toggleGroupDeviceOff(function () {
                            })
                        });
                    }
                    $('#groupTable').DataTable().ajax.reload();

                })
            });
            // The group is off, turning it on
        } else {
            var newState = 1;
            $.post('/toggleGroup', { // Turning the group on
                groupId: groupname,
                state: newState
            }).done(function () {
                $.post('/getUnitsOfGroup', { // Getting the devices belonging to the group
                    groupId: groupname
                }).done(function (data) { // Turning the devices in the group on
                    for (var i = 0; i < data.length; i++) {
                        $.post('/toggleUnit', {
                            unitId: data[i].id,
                            state: newState
                        }).done(function (data) {
                            function toggleGroupDeviceOn(callback) {
                                if (callback) {
                                    socket.emit('groupDeviceOn', {unitno: data.id});
                                }
                            }

                            toggleGroupDeviceOn(function () {
                            })
                        });

                    }

                    $('#groupTable').DataTable().ajax.reload();
                });
            });
        }
    });
});

// Opens the edit group modal
$('#editGroupBtn').click(function () {
    $('#editGroupModal').modal('show');
});