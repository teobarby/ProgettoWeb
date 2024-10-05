var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/iscrizione', function(req, res, next) {
  res.render('iscrizione', { title: 'Iscrizione', username: req.session.username });
});

module.exports = router;
