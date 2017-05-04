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
        $("#addNewItemButton").click(function () {
            var html = '<li class="productInput"><div class="form-group">' + '<input type="text" class="form-control" placeholder="Vare">' + '</div>' + '</li>';
            $(".itemsList").append(html);
        });
        $("#addProductButton").click(function () {
            $(".productInput input").each(function () {
                console.log("THIS: " + $(this).val());
                $.post("/addProduct", {
                    description: $(this).val()
                });
            });
            window.location.reload(true);
        });
    })
});
