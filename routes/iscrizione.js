var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const DataBase = require("../db"); // db.js
const db = new DataBase();

/* GET home page. */
router.get('/iscrizione', function(req, res, next) {
  res.render('iscrizione', { title: 'Iscrizione', username: req.session.username });
});


router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', function(req, res, next) {
  const iterations = 310000; // Numero di iterazioni per PBKDF2
  const keyLength = 32; // Lunghezza della chiave
  const digest = 'sha256'; // Algoritmo di hash

  // Calcola l'hash della password
  crypto.pbkdf2(req.body.password, '', iterations, keyLength, digest, async function(err, hashedPassword) {
    if (err) {
      return next(err);
    }

    try {
      // Esegui la query di inserimento
      await db.run('INSERT INTO Registrati (username, nome, cognome, email, cellulare, password) VALUES (?, ?, ?, ?, ?, ?)', [
        req.body.username,
        req.body.nome,
        req.body.cognome,
        req.body.email,
        req.body.cellulare,
        hashedPassword.toString('hex') // Converti hashedPassword in stringa esadecimale
      ]);

      // Crea un oggetto utente
      const user = {
        id: this.lastID,
        username: req.body.username
      };

      // Esegui il login
      req.login(user, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    } catch (err) {
      return next(err);
    }
  });
});

module.exports = router;
