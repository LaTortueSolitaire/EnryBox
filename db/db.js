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
function getUser(cardId, callback){
    console.log("ingetUSer");
    MongoClient.connect(url, function(err, client){
        console.log("connectDatabase");
        //assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("players").findOne({
            $or: [
                {RFID:cardId}, 
                {NFC:cardId}
            ],
        }, 
        function(err,result){
            if (err) throw err;
            callback(result);
        });
        client.close();
    });
};

function createTemporaryUser(cardId, pin, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("players").insertOne({
            username:null,
            email:null,
            password:null,
            pin_code:pin,
            wins:0,
            games:0,
            RFID:cardId,
            NFC:null,
            elo:null,
            rank:null
        },
        function(err,result){
            if (err) throw err;
            callback();
        });
        
        client.close();
    });
}

function getGameUser(RFID, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("games").findOne({
            $or : [
                { playerOne:RFID },
                { playerTwo:RFID }
            ],
            status:{ 
                $in : [
                    "playing",
                    "building"
                ]            
            }  
        }, function(err,result){
            if (err) throw err;
            
            callback(result);
        });
        client.close();
    });
};

function getGameBox(cardReader, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("games").findOne({
            cardReader_id:cardReader,
            status:"building" 
        }, function(err,result){
            if (err) throw err;
            
            callback(result);
        });
        client.close();
    });
};

function finishedGame(RFID, game, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("games").updateOne({
            _id:game._id 
        },
        {
            $set : {
                status:"finished",
                winner:RFID 
            },
            $currentDate: {
                time_end: true
            }            
        },function(err, result){
            if (err) throw err;
            db.collection("players").updateOne({
                RFID:RFID
            },
            {
                $inc : {
                    wins: 1,
                    games: 1
                }
            },
            function(err, res){
                if (err) throw err;
                var loser;
                if(game.playerOne.includes(RFID)){
                    loser = game.playerTwo;
                }
                else{
                    loser = game.playerOne;
                }
                db.collection("players").updateOne({
                    RFID:loser
                },
                {
                    $inc : {
                        games: 1
                    }
                },
                function(err, res){
                    if (err) throw err;
                    callback();
                    client.close();
                });
            });
        });
    });
};

function addPlayerGame(RFID, game, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("games").updateOne({
            _id:game._id 
        },
        {
            $set: {
                status:"playing",
                playerTwo:RFID
            },
            $currentDate:{
                time_start:true
            }
        },
        function(err,result){
            if (err) throw err;
            callback();
        });
        
        client.close();
    });
};

function createGame(RFID, cardReader, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("games").insertOne({
            playerOne:RFID,
            playerTwo:null,
            status:"building",
            winner:null,
            cardReader_id:cardReader
        },
        function(err,result){
            if (err) throw err;
            callback();
        });
        
        client.close();
    });
};

module.exports =  {
    getUser,
    createTemporaryUser,
    getGameUser,
    getGameBox,
    finishedGame,
    addPlayerGame,
    createGame
};
