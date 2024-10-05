var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();

const { generateToken } = require('../public/javascripts/tokenGenerator');


/* GET home page. */
router.get('/login', function(req, res, next) {
  const errorMessage = req.session.errorMessage;
  
  // Cancella il messaggio di errore dopo averlo usato
  req.session.errorMessage = null;
  
  // Passa il messaggio alla view
  res.render('login', { title: 'Auth', message: errorMessage });
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

      try {
        if (err) {
          console.error("Error during login:", err);
          return next(err);
        }

        await db.addTokenToUser(user.id, generateToken(user.id));
        return res.redirect('/');
      } catch (err) {
        console.error("Error while adding token to user:", err);
      }
    });
  })(req, res, next);
});

module.exports = router;
