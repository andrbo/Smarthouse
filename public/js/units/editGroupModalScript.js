/*
 * This script contains functions used in the edit group modal.
  * The modal is shown when clicking the edit group button in the control group tab, og units.hbs
 */
$('#editGroupBtn').click(function(){
    $('#editGroupModal').modal('show');

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

    // Function for saving the new group specified in the modal. Calls function in unitControlScript.js for posting to DB.
    $('#editGroupSaveNew').click(function(){
        var groupInput= $('#editGroupNewGroupInput').val().trim();
        addNewGroup(groupInput);
    })
})