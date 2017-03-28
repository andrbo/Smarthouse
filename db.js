/**
 * Created by markusmarkussen on 14.02.2017.
 */


var mysql = require('mysql');

//Database connection. Uses pool for multiple users.
var pool = mysql.createPool({
    host: 'mysql.stud.iie.ntnu.no',
    user: 'markuma',
    password: 'lflVg4Nc',
    database: 'markuma'
});

pool.getConnection(function (err){
    if(err) throw err;
    console.log('connected to database from db.js');
});

module.exports = pool;
exports.connection = pool;