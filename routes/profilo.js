var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/profilo', function(req, res, next) {
  // Verifica se l'utente è loggato
  if (req.session && req.session.username) {
    // Recupera altre informazioni dell'utente dalla sessione (se presenti)
    const username = req.session.username;
    const email = req.session.email; // esempio
    const nome = req.session.nome; // esempio
    const cognome = req.session.cognome;
    const cellulare = req.session.cellulare;
    // Renderizza la pagina del profilo con i dati dell'utente
    res.render('profilo', { 
      title: 'Profilo', 
      username: username,
      email: email,
      nome: nome,
      cognome: cognome,
      cellulare: cellulare

    });
  } else {
    // Se l'utente non è loggato, reindirizza alla pagina di login
    res.redirect('/login');
  }
});

module.exports = router;