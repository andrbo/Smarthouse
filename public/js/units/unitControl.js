var rfTransmitter = require('nexa');

//Transmitter module is connected to wiringPi pin 15
rfTransmitter.nexaInit(15, function () {
    console.info("RF transmitter initialized");
});
var remote = 23328130;

module.exports = function (io) {


    io.sockets.on('connection', function (socket) {


        socket.on('deviceOn', function (data) {
            var unit = data.unitno;
            console.log('DEVICE ON------' + unit);
            rfTransmitter.nexaOn(remote, unit, function () {
            });
            socket.broadcast.emit('deviceChange');
        });

        socket.on('deviceOff', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaOff(remote, unit, function () {
            });
            console.log('DEVICE OFF-----' + unit)
            socket.broadcast.emit('deviceChange');
        });

        socket.on('groupDeviceOn', function (data) {
            var unit = parseInt(data.unitno);
            console.log("FØR");
            rfTransmitter.nexaOn(remote, unit, function () {
                console.log("BRUKER NEXA");
            });
            console.log('GroupDeviceON---------' + unit);
        });

        socket.on('groupDeviceOff', function (data) {
            var unit = parseInt(data.unitno);
            console.log("FØR");
            rfTransmitter.nexaOff(remote, unit, function () {
                console.log("BRUKER NEXA");
            });
            console.log('GroupDEVICEOFF-------=' + unit);
        });

        socket.on('groupToggleDone', function () {
            socket.broadcast.emit('deviceChange'); // Muligens noe annet dersom refresh for tab er mulig
        })

        socket.on('pairDevice', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaPairing(remote, unit, function () {
            });
            socket.broadcast.emit('deviceChange');
        });

        socket.on('unpairDevice', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaUnpairing(remote, unit, function () {
            })
            socket.broadcast.emit('deviceChange');
        })

    });

};
  var toggleUnitLux = function (id, toggle) {
        console.log("TOGGLE: " + toggle);
        console.log("ID: " + id)
        if (toggle == 1) {
            rfTransmitter.nexaOn(23328130, id, function () {
                console.log(" Skrur på id " + id +" med rf")
            });

            console.log('Inne i controlUnit.js, skal slå PÅ lys med id: ' + id);
        } else {
            console.log('Inne i controlUnit.js, skal slå AV lys med id: ' + id);
             rfTransmitter.nexaOff(23328130, id, function () {
                 console.log('skrur av id '+id +" med rf");
             })
        }
    };


module.exports = toggleUnitLux;