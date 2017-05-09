var mysql = require('mysql');

//Database connection. Uses pool for multiple users.
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'mysql.stud.iie.ntnu.no',
    user: 'markuma',
    password: 'lflVg4Nc',
    database: 'markuma'
});

pool.getConnection(function (err){
    if(err) throw err;
});

module.exports = pool;
exports.connection = pool;