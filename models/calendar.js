var db = require('../middlewares/db');

exports.addEvent = function (email, title, description, start, end, callback) {
    var values = [email, title, description, start, end];
    var sql = 'INSERT INTO events (email, title, description, start, end) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        };
    });
};


exports.getEventsFromUser = function (email, callback) {
    var sql = 'SELECT * FROM events WHERE email = ?';
    db.query(sql, email, function(err, res){
        if(callback){
            callback(err, res);
        };
    });
};

exports.deleteEvent = function (id, callback) {
    var sql = 'DELETE FROM events WHERE id = ?';
    db.query(sql, id, function(err, res){
        if(callback){
            callback(err, res);
        };
    });
};

exports.updateEvent = function(start, end, id, callback){
    var values = [start, end, id];
    var sql = 'UPDATE events SET start = ?, end = ? WHERE id = ?';

    db.query(sql, values, function(err, res){
        if(callback){
            callback(err, res);
        };
    });
}