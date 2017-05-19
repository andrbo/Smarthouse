var rfTransmitter = require('nexa');

//Transmitter module is connected to wiringPi pin 15
rfTransmitter.nexaInit(15, function () {});

//Remote id.
var remote = 23328130;

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {

        //Listens to message from client for turning device on. Uses RF-transmitter.
        socket.on("deviceOn", function (data) {
            var unit = parseInt(data.unitno);
            rfTransmitter.nexaOn(remote, unit, function (err, res) {
                if(err){
                    console.log("ERROR");
                }
            });
            socket.emit("deviceChange");
        });

        //Listens to message from client for turning device off. Uses RF-transmitter.
        socket.on("deviceOff", function (data) {
            var unit = parseInt(data.unitno);
            rfTransmitter.nexaOff(remote, unit, function (err, res) {
                if(err){
                    console.log("ERROR");
                }
            });
            socket.emit("deviceChange");
        });

        //Listens to message from client for turning group on. Uses RF-transmitter.
        socket.on('groupDeviceOn', function (data) {
            var unit = parseInt(data.unitno);
            rfTransmitter.nexaOn(remote, unit, function (err, res) {
                if(err){
                    console.log("ERROR");
                }
            });
            socket.emit('deviceChange');
        });

        //Listens to message from client for turning group off. Uses RF-transmitter.
        socket.on('groupDeviceOff', function (data) {
            var unit = parseInt(data.unitno);
            rfTransmitter.nexaOff(remote, unit, function (err, res) {
                if(err){
                    console.log("ERROR");
                }
            });
            socket.emit('deviceChange');
        });

        socket.on('groupToggleDone', function () {
            socket.emit('deviceChange'); //TODO: Muligens noe annet dersom refresh for tab er mulig
        });

        //Pairing a new unit when unit is in pairing mode. Remote id and unit id is stored on the device.
        socket.on('pairDevice', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaPairing(remote, unit, function (err, res) {
                if(err){
                    console.log("ERROR");
                }
            });
            socket.emit('deviceChange');
        });

        //Unpairing a unit.
        socket.on('unpairDevice', function (data) {
            var unit = data.unitno;
            console.log("UNIT NR: " + unit)
            rfTransmitter.nexaUnpairing(remote, unit, function (err, res) {
                console.log("ERR: " +err);
                console.log("Res: " + res);
                if(err){
                    console.log("ERROR " + err);
                }
            });
            socket.broadcast.emit('deviceChange');
        })
    });
};