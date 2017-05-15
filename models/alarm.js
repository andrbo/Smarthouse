var db = require('../middlewares/db');


exports.getAlarmState = function (id, callback) {
    var sql = 'SELECT * FROM sensors WHERE id = ?';
    db.query(sql, id, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

exports.getAlarm = function (id, callback) {
    var sql = 'SELECT * FROM alarm WHERE id = ?';
    db.query(sql, id, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

exports.activateAlarm = function (id, callback) {
    var values = [id];
    var sql = 'UPDATE sensors SET value=1 WHERE id=?';
    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

exports.deActivateAlarm = function (id, callback) {
    var sql = 'UPDATE sensors SET value=0 WHERE id=?';
    db.query(sql, id, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

exports.getAlarmPassword=function(id, callback){
    var sql = 'SELECT password FROM alarm WHERE id = ?';
    db.query(sql, id, function (err, res) {
        if(callback){
            callback(err, res);
        }
    })
};

exports.updateAlarmPassword=function(newPassword, id, callback){
    var values = [newPassword, id];
    var sql = 'UPDATE alarm SET password = ? WHERE id = ?';
    db.query(sql,values, function (err, res) {
        if(callback){
            callback(err, res);
        }
    })
};