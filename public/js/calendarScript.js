$(document).ready(function () {

    $('#calendar').fullCalendar({
        locale: "nb",
        height: 700,
        header: {
            left: 'addEvent',
            center: 'title',
            right: 'today, prev, next'
        },
        events: '/getUserEvents',

        customButtons: {
            addEvent: {
                text: $("#newEvent").text(),
                click: function () {
                    $("#addEventModal").modal('show');
                }
            }
        },

        eventClick: function (calEvent) {
            $("#viewDescriptionModal").modal("show");
            $("#description").html(calEvent.description);

            //DELETE EVENT MODAL
            $("#deleteEventButton").click(function () {
                $("#viewDescriptionModal").modal('hide');
                $("#deleteEventModal").modal('show');
                $("#confirmDelete").click(function () {
                    deleteEvent(calEvent.id)
                });
            });
            //DELETE EVENT MODAL END

            //UPDATE EVENT MODAL
            $("#updateEventButton").click(function () {
                $("#viewDescriptionModal").modal('hide');
                $("#updateEventModal").modal('show');
                $("#updateEventTitle").val(calEvent.title);
                $("#updateEventDescription").val(calEvent.description);
                $("#updateEventStart").val(calEvent.start.format("YYYY-MM-DD HH:MM"));
                $("#updateEventEnd").val(calEvent.end.format("YYYY-MM-DD HH:MM"));

                var participants = "";
                $.post("/getParticipants", {
                    id: calEvent.id
                }).done(function (data) {

                    var dataString = data[0].participants;
                    var allParticipants = [];
                    var temp = dataString.split(",");


                    $(".updateParticipants").each(function () {
                        var elements = "";
                        $(this).find("a").each(function () {
                            var current = $(this);
                            elements += current.text();
                        });
                        allParticipants.push(elements);
                    });

                    for (var i = 0; i < allParticipants.length; i++) {
                        $(".updateParticipants a").each(function () {
                            if(temp[i] === $(this).text()){
                                $(this).find(":checkbox").prop("checked", true);
                            }
                        });
                    }
                });


                $("#confirmUpdate").click(function () {
                    $(".updateParticipants a").each(function () {
                        if($(this).find(":checkbox").prop("checked") === true){
                            participants += $(this).text() + ",";
                        }
                    });

                    var title = $("#updateEventTitle").val();
                    var description = $("#updateEventDescription").val();
                    var start = $("#updateEventStart").val();
                    var end = $("#updateEventEnd").val();

                    console.log("start - end : " + (start-end));
                    console.log("Start = end: " + start + end);

                    if(start > end){
                        console.log("START > END");
                    }else if(start == end){
                        console.log("START = END")
                    }else{
                        updateEvent(title, description, start, end, calEvent.id, participants);
                    }

                })
            });
            //UPDATE EVENT MODAL END
        },

        editable: true,
        eventDrop: function (event) {
            var start = event.start.format("YYYY-MM-DD HH:MM");
            var end = event.end.format("YYYY-MM-DD HH:MM") || start;
            updateDate(event.id, start, end);
        }
    });

    $("#eventStartCalendarGlyph, #eventEndCalendarGlyph, #updateEventStartCalendarGlyph, #updateEventEndCalendarGlyph").datetimepicker({
        format: "YYYY-MM-DD HH:mm"
    });


    var table = $("#calendarEventList").DataTable({
        ajax: {
            dataSrc: "",
            url: '/getAllEvents'
        },

        scrollY: 280,
        bScrollCollapse: true,
        bPaginate: false,
        searching: false,
        info: false,
        lengthChange: false,
        columns: [
            {data: "firstname", title: "Name"},
            {data: "title", title: "Title"},
            {data: "start", title: "Start"},
            {data: "end", title: "End"}
        ]
    });

    $('#calendarEventList tbody').on('click', 'tr', function () {

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            var data = table.row(this).data();
            $("#showDescriptionModal").modal("show");
            $("#eventDescription").text(data.description);
            console.log("data: " + JSON.stringify(data));
            $("#eventParticipants").text(data.participants);
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });

    $.get("/getAllUsers", function (data) {
        console.log("DATA: " + JSON.stringify(data));
        for (var i = 0; i < data.length; i++) {
            var user = data[i].firstname;
            $("#participantsList").append('<li class="participants"><a href="#" class="small">' + '<input type="checkbox"/>' + user + '</a>' + '</li>');
            $("#updateParticipantsList").append('<li class="updateParticipants"><a href="#" class="small">' + '<input type="checkbox"/>' + user + '</a>' + '</li>');
        }
    });

    $("#participantsListButton, #updateParticipantsListButton").click(function () {
        selectParticipants();
    })
});


var participants = [];
function selectParticipants() {

    $('.participants a, .updateParticipants a').on('click', function () {

        var current = $(this).parent().find(":checkbox");
        if (!current.prop("checked")) {
            current.prop("checked", true);
            participants.push($(this).text());
        } else {
            current.prop("checked", false);
            participants.pop($(this).text());
        }
        return false;
    });
}

function addEvent() {
    var temp = [];
    for (var i = 0; i < participants.length; i++) {
        temp += participants[i] + ",";
    }

    var title = $("#eventTitle").val();
    var description = $("#eventDescription").val();
    var start = $("#eventStart").val();
    var end = $("#eventEnd").val();

    console.log("start - end : " + (start-end));
    console.log("Start = end: " + start + end);

    if(start > end){
        console.log("START > END");
    }else if(start == end){
        console.log("START = END")
    }else{
        $.post("/addEvent", {
            title: $("#eventTitle").val(),
            start: $("#eventStart").val(),
            end: $("#eventEnd").val(),
            description: $("#eventDescription").val(),
            participants: temp
        });
        //window.location.reload(true);
    }
}

function deleteEvent(eventId) {
    $.post("/deleteEvent", {
        id: eventId
    });
    //window.location.reload(true);
}

function updateEvent(title, description, start, end, id, participants) {
    $.post("/updateEvent", {
        title: title,
        description: description,
        start: start,
        end: end,
        id: id,
        participants: participants
    });
    //window.location.reload(true);
}

function updateDate(id, start, end) {
    $.post("/updateDate", {
        id: id,
        start: start,
        end: end
    });
    //window.location.reload(true);
}