var express = require('express');
var router = express.Router();

const DataBase = require("../db"); // db.js
const db = new DataBase();

/* GET home page. */
router.get('/profilo', async (req, res, next) => {
  // Verifica se l'utente è loggato
  if (req.session && req.session.username) {
    try {
      // Recupera altre informazioni dell'utente dalla sessione (se presenti)
      const username = req.session.username;
      const email = req.session.email; // esempio
      const nome = req.session.nome; // esempio
      const cognome = req.session.cognome;
      const cellulare = req.session.cellulare;

      // Recupera le categorie dal database
      const categorie = await db.getCategorie();

      // Renderizza la pagina del profilo con i dati dell'utente e le categorie
      res.render('profilo', { 
        title: 'Profilo', 
        username: username,
        email: email,
        nome: nome,
        cognome: cognome,
        cellulare: cellulare,
        categorie: categorie // Passa anche le categorie
      });
    } catch (err) {
      res.status(500).send('Errore durante il recupero delle categorie');
    }
  } else {
    // Se l'utente non è loggato, reindirizza alla pagina di login
    res.redirect('/login');
  }
});

router.get('/inserisci-ristorante', (req, res) => {
  db.getCategorie((err, categorie) => {
      if (err) {
          return res.status(500).send('Errore durante il recupero delle categorie');
      }
      res.render('inserisci-ristorante', { categorie });
  });
});

module.exports = router;