$(document).ready(function () {

    var socket = io();

    var table = $("#shoppingListTable").DataTable({
        ajax: {
            dataSrc: "",
            url: '/getShoppingList'
        },

        scrollY:280,
        bScrollCollapse : true,
        bPaginate: false,
        searching: false,
        info: false,
        ordering: false,
        lengthChange: false,
        columns: [
            {data: "product", title:"Handleliste"},
            {defaultContent: "<button  class='removeProduct btn btn-info glyphicon glyphicon-ok-sign'> Hentet</button>"}
        ]
    });

    $('#shoppingListTable tbody').on('click', 'tr', 'removeProduct', function () {

        var data = table.row(this).data();
        console.log("ID: " + data.id);
        $.post("/removeProduct", {
            id: data.id
        });
        $('#shoppingListTable').DataTable().ajax.reload();

    });

    $("#openAddProductModalButton").click(function () {
        $("#addProductModal").modal("show");
        $("#addProductButton").click(function () {
            $.post("/addProduct", {
                description: $("#productInfo").val()
            });
            $('#shoppingListTable').DataTable().ajax.reload();
        });
    })
});
