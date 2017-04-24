var rfTransmitter = require('nexa');

//Transmitter module is connected to wiringPi pin 15
rfTransmitter.nexaInit(15, function() {
    console.info("RF transmitter initialized");
});

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {
        var remote = 23328130;

        socket.on('deviceOn', function () {
            var unit = JSON.stringify(data.unitno).trim();
            rfTransmitter.nexaOn(remote, unit, function () {
                console.log('Enhet: ' + unit + " på");
            });
        });

        socket.on('deviceOff', function (data) {
            var unit = JSON.stringify(data.unitno).trim();
            rfTransmitter.nexaOff(remote, unit, function () {
                console.log('Enhet: ' + unit + " av");
            });
        });

        socket.on('pairDevice', function (data) {
            var unit = JSON.stringify(data.unitno).trim();
            rfTransmitter.nexaParing(remote,unit, function() {
                console.log("Done paring unit with remote: "+remote + "and unit code: "+unit);
             });
        });

    });

};