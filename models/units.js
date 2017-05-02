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

exports.getUnitsOfGroup = function(groupname,callback){
    var sql = 'SELECT id FROM units WHERE groupid = ?';
    db.query(sql,groupname, function (err, result){
        if(callback){
            callback(err, result);
        };
    });
};

exports.toggleGroup = function (groupname, groupstate, callback){
    var values = [groupstate,groupname];
    var sql = 'UPDATE groups SET groupstate = ? WHERE groupname=?';
    db.query(sql,values, function (err, result){
        if(callback){
            callback(err, result);
        };
    });
};

exports.toggleUnit = function(state, id,callback){
    var values = [state, id];
    var sql = 'UPDATE units SET state = ? WHERE id=?';
    db.query(sql,values, function(err, result){
        if(callback){
            callback(err, result);
        };
    });
};

exports.addUnit = function (description,groupid,callback){
    var values = [description,groupid];
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
        };
    });
};

exports.deleteDevice = function(id, callback){
    var sql= 'DELETE FROM units WHERE id = ?';
    db.query(sql,id, function(err, result){
        if(callback){
            callback(err, result);
        };
    });
};

exports.changeDevice = function(id, description, groupid, callback){
    var values = [description,groupid, id];
    var sql = 'UPDATE units SET description=?,groupid=? WHERE id=?'
    db.query(sql,values, function(err, result){
        if(callback){
            callback(err, result);
        };
    });
};

// remove group

