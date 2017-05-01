/*
var socket = io();

socket.on('deviceChange', function () {
    window.location.reload(true);
});

// Styring av grupper

// Tidsbestemt styring

// Fjerning av en gruppe

/*
$('#editGroupBtn').click(function(){
    $('#editGroupModal').modal('show');
    var editGroupTable = $("#editGroupTable").DataTable({
        ajax: {
            dataSrc: '',
            url: '/getGroups',
        },
        scrollY: "430px",
        searching: false,
        info: false,
        lengthChange: false,
        columns: [
            {data: "groupname"},
            {defaultContent: "<button class='btn btn-danger'>Delete</button>"} // add locales
        ]
    });
    $('#editGroupSaveNew').click(function(){
        var groupInput= $('#editGroupNewGroupInput').val().trim();
        addNewGroup(groupInput);
    })
})
*/
// Function used for adding new groups in the edit group and add device modal
/*
function addNewGroup(newGroup){
    var groupInput = newGroup;
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
}
*/