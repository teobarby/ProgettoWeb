var express = require('express');
var passport = require('passport');
var router = express.Router();


router.get('/login', function(req, res, next) {
  const errorMessage = req.session.errorMessage;
  
  req.session.errorMessage = null;
  
  res.render('login', { title: 'Auth', message: errorMessage, username: req.session.username });
});



router.post('/login/password', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      console.error("Error during authentication:", err);
      return next(err);
    }

    if (!user) {
      console.log("User not found:", info ? info.message : 'No additional info available');
      req.session.errorMessage = 'Username o Password errati.';
      return res.redirect('/login');
    }

    req.login(user, async function (err) {
      if (err) {
        console.error("Error during login:", err);
        return next(err);
      }

      req.session.username = user.username; 
      req.session.nome = user.nome;
      req.session.cognome = user.cognome;
      req.session.email = user.email;
      req.session.cellulare = user.cellulare;

      return res.redirect('/');
    });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
