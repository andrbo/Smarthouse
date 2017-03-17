/**
 * Created by markusmarkussen on 14.02.2017.
 */


var mysql = require('mysql');

//DATABASE CONNECTION STARTS HERE
var connection = mysql.createConnection({
    host: 'mysql.stud.iie.ntnu.no',
    user: 'markuma',
    password: 'lflVg4Nc',
    database: 'markuma'
});

connection.connect(function (err){
    if(err) throw err
    console.log('connected to database from db.js');
});


module.exports = connection;
exports.connection = connection;
//DATABASE CONNECTION ENDS HERE
