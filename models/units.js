var db = require('../middlewares/db');

//Get all units.
exports.getUnits = function (callback) {
    var sql = 'SELECT * FROM units';
    db.query(sql, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Get unit by id
exports.getUnit = function (id, callback) {
    var sql = 'SELECT * FROM units WHERE id=?';
    db.query(sql, id, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Get id by description for test purposes, do not use otherwise.
exports.getId = function (description, callback) {
    var sql = 'SELECT id FROM units WHERE description = ?';
    db.query(sql, description, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Toggles unit on/off
exports.toggleUnit = function (state, id, callback) {
    var values = [state, id];
    var sql = 'UPDATE units SET state = ? WHERE id=?';
    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Add a new unit.
exports.addUnit = function (description, groupid, callback) {
    var values = [description, groupid];
    var sql = 'INSERT INTO units (description, state, controller, groupid, luxstate, luxvalue) VALUES (?,DEFAULT,DEFAULT,?, DEFAULT, DEFAULT)';
    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Delete a unit.
exports.deleteDevice = function (id, callback) {
    var sql = 'DELETE FROM units WHERE id = ?';
    db.query(sql, id, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};


//Update a unit
exports.changeDevice = function (id, description, groupid, luxstate, luxtresh, callback) {
    var values = [description, groupid, luxstate, luxtresh, id];
    var sql = 'UPDATE units SET description=?,groupid=?, luxstate=?, luxvalue=? WHERE id=?';
    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Remove group from unit.
exports.removeGroupFromUnit = function (id, callback) {
    var sql = 'UPDATE units SET groupid=DEFAULT WHERE id=?';
    db.query(sql, id, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Get all units belonging to a specific group
exports.getUnitsOfGroup = function (groupname, callback) {
    console.log("GROUPNAME; " + groupname)
    var sql = 'SELECT * FROM units WHERE groupid = ?';
    db.query(sql, groupname, function (err, result) {
        if (callback) {
            console.log("ERR: " + err);
            console.log("RES: " + JSON.stringify(result));
            callback(err, result);
        }
    });
};

//Toggles group on/off.
exports.toggleGroup = function (groupname, groupstate, callback) {
    var values = [groupstate, groupname];
    var sql = 'UPDATE groups SET groupstate = ? WHERE groupname=?';
    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};


//Create a new group.
exports.createGroup = function (groupname, callback) {
    var sql = 'INSERT INTO groups VALUES (?,DEFAULT)';
    db.query(sql, groupname, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Get all groups.
exports.listGroup = function (callback) {
    var sql = 'SELECT * FROM groups';
    db.query(sql, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};


//Delete a specific group.
exports.deleteGroup = function (groupid, callback) {
    var sql = 'DELETE FROM groups WHERE groupname=?';
    db.query(sql, groupid, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Get all units where lux state = 1.
exports.getLuxUnits = function (callback) {
    var sql = 'SELECT id, state, luxvalue FROM units WHERE luxstate = ?';
    db.query(sql, 1, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};