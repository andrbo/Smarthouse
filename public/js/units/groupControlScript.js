/*
*  This scripts contains functions used in the control group tab of units.hbs
 */
$(function () {

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
        "rowCallback": function (row, data, index) {
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
                $.post('/getUnitsOfGroup',{ // Retrieving the units belonging to the group
                    groupId: groupname
                }).done(function(data){
                    for(var i=0; i<data.length; i++){ // Turning the devices in the group off
                        $.post('/toggleUnit', {
                            unitId: data[i].id,
                            state: newState
                        }).done(function (data) {
                            console.log('Sender id = '+data.id+ 'til unitControl.js');
                            setTimeout(function(){
                                socket.emit('groupDeviceOff', {unitno: data.id});
                            },1500);
                        });
                        console.log('venter 1,5sek');
                        //setTimeout(1500);
                    }
                    //console.log('FERDIG med å skru på, kaller socket for refresh');
                    //socket.emit('groupToggleDone');
                    //window.location.reload(true); // Må lage refresh for kun den aktive tab'en
                    setTimeout(function(){
                        window.location.reload(true);
                    },10000);
                })
            });
        // The group is off, turning it on
        } else {
            var newState = 1;
            $.post('/toggleGroup', { // Turning the group on
                groupId: groupname,
                state: newState
            }).done(function () {
                $.post('/getUnitsOfGroup',{ // Getting the devices belonging to the group
                    groupId: groupname
                }).done(function(data){ // Turning the devices in the group on
                    for(var i=0; i<data.length; i++){
                        $.post('/toggleUnit', {
                            unitId: data[i].id,
                            state: newState
                        }).done(function (data) {
                            setTimeout(function(){
                                console.log('Sender id = '+data.id+ 'til unitControl.js');
                                socket.emit('groupDeviceOn', {unitno: data.id});
                            },1500);
                        });
                        console.log('Venter 1,5sek')
                        //setTimeout(1500);

                    };
                    //console.log('FERDIG med å skru på, kaller socket for refresh');
                    //socket.emit('groupToggleDone');
                    //console.log('Sender id = '+data.id+ 'til unitControl.js');
                    setTimeout(function(){
                        window.location.reload(true);
                    },10000); // Må lage refresh for kun den aktive tab'en
                });
            });
        };
    });
});

// Opens the edit group modal
$('#editGroupBtn').click(function () {
    $('#editGroupModal').modal('show');

});