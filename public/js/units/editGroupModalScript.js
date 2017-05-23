/*
 * This script contains functions used in the edit group modal.
 * The modal is shown when clicking the edit group button in the control group tab, og units.hbs
 */
$(function () {
    // Creating a table of the existing groups in DB.
    var editGroupTable = $("#editGroupTable").DataTable({
        ajax: {
            dataSrc: '',
            url: '/groups'
        },
        scrollY: "200px",
        searching: false,
        info: false,
        lengthChange: false,
        columns: [
            {data: "groupname"},
            {defaultContent: "<button class='btn btn-danger'> Slett</button>"}
        ]
    });

    // Click function for the delete buttons in the table.
    $('#editGroupTable tbody').on('click', 'button', function () {
        var data = editGroupTable.row($(this).parents('tr')).data();
        var id = data.groupname;
        editGroupTable.row( $(this).parents('tr') ).remove().draw();
        $.post('/deleteGroupUnit', { // Deleting group from unitis using them
            groupId: id
        }).done(function () {
            $.ajax({ // Deleting the group from DB
                url: "/groups/" + id,
                type: 'DELETE'
            })
        });
    });
});

// Function for saving the new group specified in the modal. Calls function in unitControlScript.js for posting to DB.
$('#editGroupSaveNew').click(function () {
    var groupInput = $('#editGroupNewGroupInput').val().trim();
    addNewGroup(groupInput, function () {
        $('#editGroupNewGroupInput').val("");
        $('#editGroupTable').DataTable().ajax.reload();
    });
});