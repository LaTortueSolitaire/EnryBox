// Empty JS for your own code to be here

var db = require('../../db/website.js');

$(document).ready(function(){
    console.log("ready");
   fillTable(); 
});

function fillTable(){
    db.getAllUsers(function(result){
        
        console.log(result);
        for(var i = 0; i< result.length; i++){
            var res = result[i];
            var rankNb = i+1;
            
            var nbGames = res.games;
            var nbWins = res.wins;
            var percents = Math.round((nbWins/nbGames)*100);
            
            $("#rank_table tbody").append(
                    "<tr>"+
                        "<td>"+rankNb.toString()+"</td>"+
                        "<td>"+res.username+"</td>"+
                        "<td>"+res.elo.toString()+"</td>"+
                        "<td>"+percents.toString()+"</td>"+
                       "</tr>"
               );
        }
                
    });
}
