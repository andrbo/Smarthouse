var rfTransmitter = require('nexa');

//Transmitter module is connected to wiringPi pin 15
rfTransmitter.nexaInit(15, function() {
    console.info("RF transmitter initialized");
});

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {
        var remote = 23328130;

        socket.on('deviceOn', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaOn(remote, unit, function () {
            });
            socket.broadcast.emit('deviceChange');
        });

        socket.on('deviceOff', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaOff(remote, unit, function () {
            });
            socket.broadcast.emit('deviceChange');
        });

        socket.on('pairDevice', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaPairing(remote,unit, function() {
             });
            socket.broadcast.emit('deviceChange');
        });

        socket.on('unpairDevice', function(data){
            var unit = data.unitno;
            rfTransmitter.nexaUnpairing(remote,unit, function(){
            })
            socket.broadcast.emit('deviceChange');
        })
    });

};