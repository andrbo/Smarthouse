//var rfTransmitter = require('nexa');

//Transmitter module is connected to wiringPi pin 15
// rfTransmitter.nexaInit(15, function() {
//    console.info("RF transmitter initialized");
//});
var remote = 23328130;

module.exports = function (io) {


    io.sockets.on('connection', function (socket) {


        socket.on('deviceOn', function (data) {
            var unit = data.unitno;
            console.log('DEVICE ON------'+unit);
             rfTransmitter.nexaOn(remote, unit, function () {
            });
            socket.broadcast.emit('deviceChange');
        });

        socket.on('deviceOff', function (data) {
            var unit = data.unitno;
            rfTransmitter.nexaOff(remote, unit, function () {
            });
            console.log('DEVICE OFF-----'+unit)
            socket.broadcast.emit('deviceChange');
        });

        socket.on('groupDeviceOn', function (data) {
            var unit = parseInt(data.unitno);
            console.log("FØR");
            rfTransmitter.nexaOn(remote, unit, function(){
                console.log("BRUKER NEXA");
            });
            console.log('GroupDeviceON---------'+unit);
        });

        socket.on('groupDeviceOff', function (data) {
            var unit = parseInt(data.unitno);
            console.log("FØR");
            rfTransmitter.nexaOff(remote, unit, function(){
                console.log("BRUKER NEXA");
            });
            console.log('GroupDEVICEOFF-------=' + unit);
        });

        socket.on('groupToggleDone', function(){
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

var toggleUnitLux= function (id, toggle){
    console.log('Bruker funksjonen i unitControl.js, sender med id: '+id + 'og toggle' +1)
/*
    if(toggle == 1){
        rfTransmitter.nexaOn(remote,id, function(){

        });
    }else{
        rfTransmitter.nexaOff(remote, id, function(){

        })
    }
    */
};

module.exports = toggleUnitLux;