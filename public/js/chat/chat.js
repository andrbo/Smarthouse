/**
 * Created by markusmarkussen on 26.04.2017.
 */


module.exports = function(io) {
    io.sockets.on('connection', function (socket) {

        socket.on('message', function(user, msg){
            io.emit('message', user, msg);
        });
    });
};