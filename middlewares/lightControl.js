//var rfTransmitter = require('nexa');

//Transmitter module is connected to wiringPi pin 15
//rfTransmitter.nexaInit(15, function() {
//    console.info("RF transmitter initialized");
//});

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {


        socket.on('lyspaa', function () {
            console.log('nexa påscript kjøres');
            rfTransmitter.nexaOn(controller_id,device, function(){
                console.log('lys paa');
            });
        });

        socket.on('lightOff', function(data){
            console.log('nexa avscript kjøres');
            var controller_id = 23328130;
            var unitId = JSON.stringify(data.unitno).trim();
            rfTransmitter.nexaOff(controller_id,device, function(){
                console.log('lys av');
            });
        });

        socket.on('pairDevice', function(data){

            var remote = 23328130;
            var unit = JSON.stringify(data.unitno).trim();
            // rfTransmitter.nexaParing(remote,unit, function() {
            //    console.log("Done paring unit with remote: "+remote + "and unit code: "+unit);
           // });)
        });
    });
};