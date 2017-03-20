/**
 * Created by markusmarkussen on 14.02.2017.
 */


var mysql = require('mysql');

//DATABASE CONNECTION STARTS HERE
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
//DATABASE CONNECTION ENDS HERE
