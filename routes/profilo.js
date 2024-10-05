var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/profilo', function(req, res, next) {
  res.render('profilo', { title: 'Profilo', username: req.session.username  });
});

module.exports = router;