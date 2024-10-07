var express = require('express');
var router = express.Router();

const DataBase = require("../db"); // db.js
const db = new DataBase();

const multer = require('multer');
const upload = multer({ dest: '/Users/matteobarbieri/Documents/Uni/ProgettoWeb/uploads' });

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

 // Cartella di destinazione per i file caricati

 router.post('/inserisci-ristorante', upload.fields([
  { name: 'immagineCopertinaInput' },
  { name: 'menuPDFInput' }
]), (req, res) => {

  // Verifica se l'utente è loggato
  if (!req.session || !req.session.username) {
      return res.status(403).send('Utente non autorizzato');
  }

  // Recupera i dati dal corpo della richiesta
  const {
      nomeRistorante, // Aggiornato
      categoria,
      citta, // Aggiornato
      indirizzo, // Aggiornato
      telefono, // Aggiornato
      paroleChiave, // Aggiornato
      descrizione, // Aggiornato
      orarioAperturaPranzo,
      orarioChiusuraPranzo,
      orarioAperturaCena,
      orarioChiusuraCena,
      promo // Aggiornato
  } = req.body;

  // Ottieni i percorsi dei file caricati
  const immagineCopertina = req.files['immagineCopertinaInput'][0].path;
  const menuPDF = req.files['menuPDFInput'] ? req.files['menuPDFInput'][0].path : null;

  // Ottieni il nome dell'utente dalla sessione
  const proprietario = req.session.username;

  // Genera la stringa degli orari
  let orari = [];
  if (orarioAperturaPranzo && orarioChiusuraPranzo) {
      orari.push(`${orarioAperturaPranzo}-${orarioChiusuraPranzo}`);
  }
  if (orarioAperturaCena && orarioChiusuraCena) {
      orari.push(`${orarioAperturaCena}-${orarioChiusuraCena}`);
  }
  const orariString = orari.length > 0 ? orari.join(', ') : '';

  // Aggiungi i dati al database
  db.addRistorante({
      nome: nomeRistorante,
      indirizzo,
      orari: orariString,
      descrizione,
      copertina: immagineCopertina,
      menu: menuPDF,
      proprietario,
      categoria,
      paroleChiave,
      promo,
      citta,
      telefono
  })
  .then(() => {
      res.redirect('/'); // Reindirizza a una pagina di successo
  })
  .catch(err => {
      console.error(err);
      res.status(500).send('Errore durante l\'inserimento del ristorante');
  });
});

module.exports = router;