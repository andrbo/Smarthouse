/*
 * This script contains functions used in the edit group modal.
 * The modal is shown when clicking the edit group button in the control group tab, og units.hbs
 */
$(function () {
    // Creating a table of the existing groups in DB.
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

    // Click function for the delete buttons in the table.
    $('#editGroupTable tbody').on('click', 'button', function () {
        var data = editGroupTable.row($(this).parents('tr')).data();
        var id = data.groupname;
        console.log(' Klikker slett, skal slette id: '+id);
        editGroupTable.row( $(this).parents('tr') ).remove().draw();
        $.post('/deleteGroupUnit', { // Deleting group from unitis using them
            groupId: id
        }).done(function () {
            $.post('/deleteGroup', { // Deleting the group from DB
                groupId: id
            }).done(function () {
            });
        });
    });
});


// Function for saving the new group specified in the modal. Calls function in unitControlScript.js for posting to DB.
$('#editGroupSaveNew').click(function () {
    var groupInput = $('#editGroupNewGroupInput').val().trim();
    addNewGroup(groupInput, function (err, result) {
        $('#editGroupNewGroupInput').val("");
        $('#editGroupTable').DataTable().ajax.reload();
    });
});
