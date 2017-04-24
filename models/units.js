var db = require('../middlewares/db');

exports.getUnits = function(callback){
    var sql = 'SELECT * FROM units';
    db.query(sql, function(err, result){
        if(callback){
            callback(err, result);
            console.log(result);
        };
    });
};

exports.toggleUnit = function(state, id,callback){
    var values = [state, id];
    var sql = 'UPDATE units SET state = ? WHERE id=?';
    db.query(sql,values, function(err, result){
        if(callback){
            callback(err, result);
            console.log(result);
            console.log('ERROR UNITS'+err);
        };
    });
};


// MAL
exports.updateEvent = function (title, description, start, end, id, callback) {
    var values = [title, description, start, end, id];
    var sql = 'UPDATE events SET title = ?, description = ?, start = ?, end = ? WHERE id = ?';

    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        };
    });
};
//
exports.addUnit = function (description,groupid,callback){
    var values = [description,groupid];
    console.log("DESC: " + description);
    console.log("ID: " + groupid);
    var sql = 'INSERT INTO units (description, state, controller, groupid) VALUES (?,DEFAULT,DEFAULT,?)';
    db.query(sql,values, function (err, result) {
        if(callback){
            callback(err,result);
        };
    });
};

exports.createGroup = function (groupname,callback) {
    var sql = 'INSERT INTO groups VALUES (?)';
    db.query(sql, groupname, function (err, result) {
        if (callback) {
            callback(err, result);
        };
    });
};

exports.listGroup = function (callback){
    var sql = 'SELECT * FROM groups';
    db.query(sql, function(err, result){
        if (callback) {
            callback(err, result);
            console.log(result);
        };
    });
};

// remove group

