/*This scripts lets the users communicate with each other through sockets.*/

module.exports = function(io) {
    io.sockets.on('connection', function (socket) {

        //Listen if message received and emits to all connected clients.
        socket.on('message', function(user, msg){
            io.emit('message', user, msg);
        });
    });
};