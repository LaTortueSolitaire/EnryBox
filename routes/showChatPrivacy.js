/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* GET privacy page policy */
router.get('/', function(req, res, next) {
  res.render('privacyPage');
});

module.exports = router;
