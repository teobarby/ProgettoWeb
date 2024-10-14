var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const DataBase = require("../db"); 
const db = new DataBase();

router.get('/iscrizione', function(req, res, next) {
  res.render('iscrizione', { title: 'Iscrizione', username: req.session.username });
});


router.get('/signup', function(req, res, next) {
  res.render('signup');
});





router.post('/signup', async function(req, res, next) {
  const saltRounds = 10;

  try {
      // Calcola l'hash della password
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      usernameTemp = req.body.username;
      const userExists = await db.trovaUtenteUsername(usernameTemp);

      const mailExists = await db.trovaUtenteEmail(req.body.email);

      const cellExists = await db.trovaUtenteCellulare(req.body.cellulare);


      if(userExists) {
        return res.render('iscrizione', {
          errorMessage: 'Questo username è già in uso, scegline un altro.', username: req.session.username, title: 'Iscrizione'});
      }

      if(mailExists) {
        return res.render('iscrizione', {
          errorMessage: 'Questa email è già in uso, scegline un\'altra.', username: req.session.username, title: 'Iscrizione'});
      }

      if(cellExists) {
        return res.render('iscrizione', {
          errorMessage: 'Questo numero è già in uso, scegline un\'altro.', username: req.session.username, title: 'Iscrizione'});
      }

      // Esegui la query di inserimento
      await db.run('INSERT INTO Registrati (username, nome, cognome, email, cellulare, password) VALUES (?, ?, ?, ?, ?, ?)', [
          req.body.username,
          req.body.nome,
          req.body.cognome,
          req.body.email,
          req.body.cellulare,
          hashedPassword 
      ]);

     
      const user = {
          id: this.lastID,
          username: req.body.username
      };

     
      req.login(user, function(err) {
          if (err) {
              return next(err);
          }
          res.redirect('/login');
      });
  } catch (err) {
      return next(err);
  }
});

module.exports = router;
