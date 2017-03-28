/**
 * Created by Anbor on 07.02.2017.
 */

var express = require('express');
var session = require('../session');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('security');
});

module.exports = router;
