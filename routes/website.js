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
        
        res.json(trifusion(result));
        
    });
});


function triFusion(tab) {
  var tabL = tab.length;
  if(tabL < 2) {
    return tab;
  } else {
    var q = Math.ceil(tabL / 2);
    var left = triFusion(tab.slice(0,q));
    console.log("left: " +left);
    var right = triFusion(tab.slice(q, tabL));
    return fusion(left, right); 
  }
}
 
function fusion(tabLeft, tabRight) {
  var ans = [];
  var tabLeftL = tabLeft.length;
  var tabRightL = tabRight.length;
  var cpteurL = 0;
  var cpteurR = 0;
 
  while((cpteurL < tabLeftL) && (cpteurR < tabRightL)) {
    if(tabLeft[cpteurL].elo === null){
        tabLeft[cpteurL].elo = 1000;
    }
    if(tabRight[cpteurR].elo === null){
        tabRight[cpteurR].elo = 1000;
    }
    
    if(tabLeft[cpteurL].elo > tabRight[cpteurR].elo) {
      ans.push(tabLeft[cpteurL]);
      cpteurL += 1;

    } else {
      ans.push(tabRight[cpteurR]);
      cpteurR +=1;

    }
  } 
  
  for(var i = cpteurL; i < tabLeftL; i++) {
    ans.push(tabLeft[i]);
  }
 
  for(var j = cpteurR; j < tabRightL; j++) {
    ans.push(tabRight[j]);
  }
 
  return ans;
}

module.exports = router;
