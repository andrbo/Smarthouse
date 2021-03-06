/*This script controlls the information that is shown in shoppingList.hbs*/

$(document).ready(function () {

    var itemPicked = $("#itemPicked").html();

    //Creates data table with shopping list elements from DB.
    var table = $("#shoppingListTable").DataTable({
        ajax: {
            dataSrc: "",
            url: '/shoppingList'
        },

        scrollY: "223px",
        bScrollCollapse : true,
        bPaginate: false,
        searching: false,
        info: false,
        ordering: false,
        lengthChange: false,
        columns: [
            {data: "product", title:"Handleliste"},
            {defaultContent: "<button  class='removeProduct btn btn-info glyphicon glyphicon-ok-sign'>" + itemPicked + "</button>"}
        ]
    });

    //If row is clicked.
    $('#shoppingListTable tbody').on('click', 'tr', "removeProduct", function () {
        var data = table.row(this).data();
        $.ajax({
            url: "/shoppingList/" + data.id,
            type: 'DELETE'
        });

        $('#shoppingListTable').DataTable().ajax.reload();
    });

    //Opens addProductModal
    $("#openAddProductModalButton").click(function () {
        $("#addProductModal").modal("show");
        $("#addNewItemButton").click(function () {
            var html = '<li class="productInput"><div class="form-group">' + '<input type="text" class="form-control" placeholder="Vare">' + '</div>' + '</li>';
            $(".itemsList").append(html);
        });
        $("#addProductButton").click(function () {
            $(".productInput input").each(function () {
                $.post("/shoppingList", {
                    description: $(this).val()
                });
            });
            window.location.reload(true);
        });
    });
});