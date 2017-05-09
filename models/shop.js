var db = require('../middlewares/db');

//Get shopping list
exports.getShoppingList = function (callback) {
    var sql = 'SELECT * FROM shoppingList';
    db.query(sql, function(err, res){
        if(callback){
            callback(err, res);
        }
    });
};

//Add product to shopping list.
exports.addProduct = function (description, callback) {
    var values = [description];
    var sql = 'INSERT INTO shoppingList (product) VALUES (?)';

    db.query(sql, values, function (err, result) {
        if (callback) {
            callback(err, result);
        }
    });
};

//Delete product when clicking "delete"
exports.removeProduct = function (id, callback) {
    var sql = 'DELETE FROM shoppingList WHERE id = ?';
    db.query(sql, id, function(err, res){
        if(callback){
            callback(err, res);
        }
    });
};
