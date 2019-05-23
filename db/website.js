/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var settings = require('../config/settings.js');

// Connection URL
var { db : { host, port, name} } = settings;
var url = 'mongodb://localhost:27017';

// Database Name
var dbName = 'enryChat';

// Connection to the server

function getAllUsers(callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("players").find(
            {
        },
        {
            projection: { _id:0, username: 1, elo:1, games:1, wins:1}
        }).toArray(function(err, result){
            if (err) throw err;
            callback(result);
            client.close();
        })
    });
}

module.exports =  {
    getAllUsers
};
