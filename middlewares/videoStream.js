module.exports = function(app ,io){

var fs = require('fs');
var v4l2camera = require("v4l2camera");

// Webcam used for live video, connected to usb port on raspberry pi
var webcam = new v4l2camera.Camera("/dev/video0");
webcam.start();


// Functions used for the video streaming // Will be moved to security.js when socket.io is implemented
function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
        webcam.stop();
    }
}
function startWebcamStream(io) {
    if (app.get('watchingFile')) {
        io.sockets.emit('streamCam', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }
    Capture();
    app.set('watchingFile', true);
    console.log('Start watching......');
}
// Capture function 200 means 30fps
function Capture() {
    setInterval(function () {
        webcam.capture(function (success) {
            var frame = webcam.frameRaw();
            io.emit('streamCam', "data:image/png;base64," + Buffer(frame).toString('base64'));
        });
    }, 50);
}

var sockets = {}; // Variable used to define if videostream should bi stopped



    io.sockets.on('connection', function (socket) {

        //console.log('a user connected');
        //sockets[socket.id] = socket;
        //console.log("Total clients connected : ", Object.keys(sockets).length);


       // socket.on('disconnect', function () {
       //     delete sockets[socket.id];

            // no more sockets, kill the stream
           // if (Object.keys(sockets).length == 0) {
           //     app.set('watchingFile', false);
           //     fs.unwatchFile('./stream/image_stream.jpg');
           // }
       // });

        socket.on('streamCam', function () {
            startWebcamStream(io);
        });
    });
};