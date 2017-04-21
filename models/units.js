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

// link with group