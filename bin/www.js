#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('enrydraft:server');
var http = require('http');
var settings = require('../config/settings.js');
var mqtt = require('mqtt');
var db = require('../db/db.js');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || settings.www.port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, 'localhost');
server.on('error', onError);
server.on('listening', onListening);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}


/* Broker client to deal with the messages from the box */

var client  = mqtt.connect('mqqt://188.166.126.183', {clientId:"serverOrigin", clean:true, username:"lucas", password:"jolekoala1"} );



client.on('connect', function () {
  client.subscribe("cardReader/+", function (err) {
    if (!err) {
      console.log("Subscription to cardReader/+");
    }
  });
});
 
client.on('message', function (topic, message) {
    // message is Buffer
    console.log(topic);
    console.log(message.toString());
    var cardReader = topic.split('/')[1];

    var pubTop = "server/"+cardReader;

    db.getUser(message.toString(), function(user){
        if(!user){
            onNewUser(message, pubTop, cardReader);            
        }
        else if(user.username===null){
                if(!user.pin_code){
                    onNewPin(message, pubTop, cardReader);
                }
                else{
                    client.publish(pubTop, "You are not registered yet, to register on the chatbot use this code : "+user.pin_code.toString());
                    db.getGameUser(user.RFID, function(game){
                        if(game){
                            if(game.status.includes("building")){
                              client.publish(pubTop, "You are already starting a new game");
                            }
                            else{
                                db.finishedGame(user.RFID, game, function(){
                                    client.publish(pubTop, "Well played ");
                                });
                            }
                        }
                        else{
                            db.getGameBox(cardReader, function(game){
                                if(game){
                                    db.addPlayerGame(user.RFID, game, function(){
                                        client.publish(pubTop, "Good luck ");
                                    });
                                }
                                else{
                                    db.createGame(user.RFID, cardReader, function(){
                                        client.publish(pubTop, "A game had just been created ask your partner to swipe is card to join your game");
                                    });
                                }
                            });
                        }
                    });
                }
        }
        else{
            db.getGameUser(user.RFID, function(game){
                if(game){
                    if(game.status.includes("building")){
                      client.publish(pubTop, "You are already starting a new game");
                    }
                    else{
                        db.finishedGame(user.RFID, game, function(){
                            client.publish(pubTop, "Well played ");
                        });
                    }
                }
                else{
                    db.getGameBox(cardReader, function(game){
                        if(game){
                            db.addPlayerGame(user.RFID, game, function(){
                                client.publish(pubTop, "Good luck ");
                            });
                        }
                        else{
                            db.createGame(user.RFID, cardReader, function(){
                                client.publish(pubTop, "A game had just been created ask your partner to swipe is card to join your game");
                            });
                        }
                    });
                }
            });
        }
        
    });
    
});


function onNewUser(message, pubTop, cardReader){
    var pin = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    db.checkPin(pin, function(res){
        if(!res){
            db.createTemporaryUser(message.toString(), pin, function(){
                client.publish(pubTop, "You are not registered yet, to register on the chatbot use this code : "+pin.toString()+". This code will be available 10 min");
                db.getUser(message.toString(), function(user){
                    db.getGameUser(user.RFID, function(game){
                        if(game){
                            if(game.status.includes("building")){
                              client.publish(pubTop, "You already started an other game");
                            }
                            else{
                                db.finishedGame(user.RFID, game, function(){
                                    client.publish(pubTop, "Well played ");
                                });
                            }
                        }
                        else{
                            db.getGameBox(cardReader, function(game){
                                if(game){
                                    db.addPlayerGame(user.RFID, game, function(){
                                        client.publish(pubTop, "Good luck ");
                                    });
                                }
                                else{
                                    db.createGame(user.RFID, cardReader, function(){
                                        client.publish(pubTop, "A game had just been created ask your partner to swipe is card to join your game");
                                    });
                                }
                            });
                        }
                    });
                });
            }); 
        }
        else{
            onNewUser(message, pubTop);
        }
    });
}

function onNewPin(message, pubTop, cardReader){
    var pin = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    db.checkPin(pin, function(res){
        if(!res){
            db.createTemporaryPin(message.toString(), pin, function(){
                client.publish(pubTop, "You are not registered yet, to register on the chatbot use this code : "+pin.toString()+". This code will be available 10 min");
                db.getUser(message.toString(), function(user){
                    db.getGameUser(user.RFID, function(game){
                        if(game){
                            if(game.status.includes("building")){
                              client.publish(pubTop, "You already started an other game");
                            }
                            else{
                                db.finishedGame(user.RFID, game, function(){
                                    client.publish(pubTop, "Well played ");
                                });
                            }
                        }
                        else{
                            db.getGameBox(cardReader, function(game){
                                if(game){
                                    db.addPlayerGame(user.RFID, game, function(){
                                        client.publish(pubTop, "Good luck ");
                                    });
                                }
                                else{
                                    db.createGame(user.RFID, cardReader, function(){
                                        client.publish(pubTop, "A game had just been created ask your partner to swipe is card to join your game");
                                    });
                                }
                            });
                        }
                    });
                });
            }); 
        }
        else{
            onNewPin(message, pubTop);
        }
    });
}

var resetPin = setInterval(function(){
    db.resetPin();
}, 10*60*1000)

var resetBuildingParty = setInterval(function(){
    db.resetBuildingParty();
}, 15*1000)
