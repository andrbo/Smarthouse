/**
 * Created by markusmarkussen on 26.04.2017.
 */


module.exports = function (io) {
    io.sockets.on('connection', function (socket) {
        console.log("User connected");


        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
};