/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var express = require('express');
var router = express.Router();
var db = require('../db/website.js');

/* GET users listing. */
router.get('/users', function(req, res, next) {
    db.getAllUsers(function(result){
        res.json(result);
    });
});

module.exports = router;
