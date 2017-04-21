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
            dropdown.append("<li><a href='#'>" + data[i].groupname + "</a></li>");
        }
    });
    // lister ut enheter i tabell
    $.post('/getUnits').done(function (data) {
        $('#unitTable').bootstrapTable({
            data: data,
            insertRow: '<button>click</button>'
        });
    })
});

$('#unitTable td.row-link').each(function(){
    $(this).css('cursor','pointer').hover(
        function(){
            $(this).parent().addClass('active');
        },
        function(){
            $(this).parent().removeClass('active');
        }).click( function(){
            document.location = $(this).parent().attr('data-href');
        }
    );
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

$('#saveAndPair').click(function () {
    var description = $('#descriptInput').val().trim();
    var groupname = $('#groupDropSelected').text();
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

$('#groupValues li a').click(function () {
    var selText = $(this).text();
    $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
});
