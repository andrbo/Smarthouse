$(document).ready(function () {

    $('#calendar').fullCalendar({
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


                $("#confirmUpdate").click(function () {
                    var title = $("#updateEventTitle").val();
                    var description = $("#updateEventDescription").val();
                    var start = $("#updateEventStart").val();
                    var end = $("#updateEventEnd").val();
                    updateEvent(title, description, start, end, calEvent.id);
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

        scrollY:280,
        bScrollCollapse : true,
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
            $("#eventDescription").text(data.description)
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });

});


function addEvent() {
    $.post("/addEvent", {
        title: $("#eventTitle").val(),
        start: $("#eventStart").val(),
        end: $("#eventEnd").val(),
        description: $("#eventDescription").val()
    });
    window.location.reload(true);
}

function deleteEvent(eventId) {
    $.post("/deleteEvent", {
        id: eventId
    });
    window.location.reload(true);
}

function updateEvent(title, description, start, end, id) {
    $.post("/updateEvent", {
        title: title,
        description: description,
        start: start,
        end: end,
        id: id
    });
    window.location.reload(true);
}

function updateDate(id, start, end) {
    $.post("/updateDate", {
        id: id,
        start: start,
        end: end
    });
    window.location.reload(true);
}