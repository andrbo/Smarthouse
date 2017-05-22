/*This file controls the video stream which is shown at the "security" page*/

module.exports = function (app, io) {

    var fs = require('fs');
    var v4l2camera = require("v4l2camera");

// Webcam used for live video, connected to usb port on raspberry pi
    var webcam = new v4l2camera.Camera("/dev/video0");
    webcam.start();

    function startWebcamStream(io) {
        if (app.get('watchingFile')) {
            io.sockets.emit('streamCam', 'image_stream.jpg?_t=' + (Math.random() * 100000));
            return;
        }
        Capture();
        app.set('watchingFile', true);
    }

// Capture function 200 means 30fps
    function Capture() {
        setInterval(function () {
            webcam.capture(function () {
                var frame = webcam.frameRaw();
                io.emit('streamCam', "data:image/png;base64," + Buffer(frame).toString('base64'));
            });
        }, 50);
    }

    io.sockets.on('connection', function (socket) {
        socket.on('streamCam', function () {
            startWebcamStream(io);
        });
    });
};