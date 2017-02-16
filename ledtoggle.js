/**
 * Created by markusmarkussen on 16.02.2017.
 */
var ledToggle = function(button){
    $.get("home/ledToggle", {button:button});
};

$("#lightOn").click(function() {
    ledToggle("on");
});
$("#lightOff").click(function(){
    ledToggle("off");
});