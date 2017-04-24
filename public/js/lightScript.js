var socket = io();

// Funksjon for å liste ut tabell av enheter fra db

// Funksjon for å slette fjernkontroller fra en kontakt

// Styring av grupper

// Tidsbestemt styring

// Socket for å oppdatere status for de andre klientene

// Generelle funksjoner for å styre enheter av og på

// Redigere en enhet


$(function () {
    // Liste ut grupper til dropdown
    $.post('/getGroups').done(function (data) {
        var dropdown = $("#groupValues");
        for (var i = 0; i < data.length; i++) {
            dropdown.append("<li><a class='listGroups'>" + data[i].groupname + "</a></li>");
        }
    });
    // lister ut enheter i tabell


    var table = $("#unitTable").DataTable({
        ajax: {
            dataSrc: '',
            url: '/getUnits',
        },
        scrollY: "430px",
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

            {defaultContent: "<button></button>"}
        ]
    });


    $('table tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        var state = data.state;
        var unitId = data.id;
        if (state === 1) {
            console.log('lampe er på, skrur den av');
            var newState = 0;
            $.post('/toggleUnit', {
                unitId: unitId,
                state: newState
            }).done(function (data) {
                socket.emit('lightOff', {unitno: unitId});
                window.location.reload(true);
            });
        } else {
            var newState = 1;
            $.post('/toggleUnit', {
                unitId: unitId,
                state: newState
            }).done(function (data) {
                console.log('lampe er av, skrur den på');
                socket.emit('lightOn', {unitno: unitId});
                window.location.reload(true);
            });
        }
    });

});


$('#light1on').click(function () {
    console.log('lys på trykket av bruker');
    socket.emit('lyspaa');

});

$('#light1off').click(function () {
    console.log('lys på trykket av bruker');
    socket.emit('lysav');

});

$('#addDeviceBtn').click(function () {
    $('#addDeviceModal').modal('show');
});

$('#addNewGroup').click(function () {
    $('#newGroupInput').css("display", "block");
    $('#addNewGroupBtns').css("display", "block");
});

$('#saveNewGroup').click(function () {
    var groupInput = $('#newGroup').val().trim();
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
});

$('#cancelNewGroup').click(function () {
    $('#newGroupInput').css("display", "none");
    $('#addNewGroupBtns').css("display", "none");
});


$('#activateNewDevice').click(function () {
    var description = $('#descriptInput').val().trim();
    var group = $('#groupDropSelected').text();
    // Sjekk at dette ikke allerede er i bruk i DB
    $('#addDeviceModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#saveDeviceModal').modal('show');
    $('#sumDescript').html(description);
    $('#sumGroup').html(group);
});
$("#groupDropSelected").click(function () {
    $('.listGroups').click(function () {
        var selText = $(this).text();
        console.log("***********************************" + selText);
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
        //$("#groupDropdownLabel").html(selText);

    });
});

$('#saveAndPair').click(function () {
    var description = $('#descriptInput').val().trim();
    var groupname = $('#groupDropSelected').text();
    if (groupname == "Select group") {
        groupname == "";
    }
    ;
    $.post('/addUnit', {
        description: description,
        groupname: groupname
    }).done(function (data) {
        $('#saveDeviceModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        var unitId = data.insertId;
        socket.emit('pairDevice', {unitno: unitId});
    });
});


