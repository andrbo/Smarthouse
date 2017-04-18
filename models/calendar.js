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


exports.getUserEvents = function (email, callback) {
    var sql = 'SELECT * FROM events WHERE email = ?';
    db.query(sql, email, function(err, res){
        if(callback){
            callback(err, res);
        };
    });
};

//Delete event when clicking "delete"
exports.deleteEvent = function (id, callback) {
    var sql = 'DELETE FROM events WHERE id = ?';
    db.query(sql, id, function(err, res){
        if(callback){
            callback(err, res);
        };
    });
};

//Update event when clicking "update".
exports.updateEvent = function (title, description, start, end, id, callback) {
    var values = [title, description, start, end, id];
    var sql = 'UPDATE events SET title = ?, description = ?, start = ?, end = ? WHERE id = ?';

    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        };
    });
};

//Update event when dragging it.
exports.updateDate = function(start, end, id, callback){
    var values = [start, end, id];
    var sql = 'UPDATE events SET start = ?, end = ? WHERE id = ?';

    db.query(sql, values, function(err, res){
        if(callback){
            callback(err, res);
        };
    });
};

exports.getAllEvents = function(callback){
    var sql = 'SELECT events.description, events.title, events.start, events.end, users.firstname FROM events JOIN users ON events.email = users.email';
    db.query(sql, function(err, res){
        if(callback){
            callback(err, res);
        }
    })
}