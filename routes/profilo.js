var express = require('express');
var router = express.Router();

const DataBase = require("../db"); // db.js
const db = new DataBase();
const path = require('path'); // Importa il modulo 'path'

const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../public/uploads') });

 const fs = require('fs');

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

      const ristorante = await db.possiedeRistorante(username);
      const possiedeRistorante = !!ristorante; // true se esiste, false altrimenti
      const ristoranti = await db.getRistoranteUsername(username); // Assicurati che questa funzione ritorni un array

      // Renderizza la pagina del profilo con i dati dell'utente e le categorie
      res.render('profilo', { 
        title: 'Profilo', 
        username: username,
        email: email,
        nome: nome,
        cognome: cognome,
        cellulare: cellulare,
        categorie: categorie,
        possiedeRistorante: possiedeRistorante,
        ristoranti: ristoranti
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

 


router.post('/inserisci-ristorante', upload.fields([
  { name: 'immagineCopertinaInput' },
  { name: 'menuPDFInput' }
]), async (req, res) => {
  
  // Verifica se l'utente è loggato
  if (!req.session || !req.session.username) {
      return res.status(403).send('Utente non autorizzato');
  }

  // Recupera i dati dal corpo della richiesta
  const {
      nomeRistorante,
      categoria,
      citta,
      indirizzo,
      telefono,
      paroleChiave,
      descrizione,
      orarioAperturaPranzo,
      orarioChiusuraPranzo,
      orarioAperturaCena,
      orarioChiusuraCena,
      promo
  } = req.body;

  const immagineCopertina = req.files['immagineCopertinaInput'][0];
  const menuPDF = req.files['menuPDFInput'] ? req.files['menuPDFInput'][0] : null;

  const estensioneCopertina = path.extname(immagineCopertina.originalname);
  const estensioneMenu = menuPDF ? path.extname(menuPDF.originalname) : '';

  const nomeImmagine = `${immagineCopertina.filename}${estensioneCopertina}`;
  const nuovoPercorsoImmagine = path.join(__dirname, '../public/uploads', nomeImmagine);

  try {
      if (fs.existsSync(immagineCopertina.path)) {
          fs.renameSync(immagineCopertina.path, nuovoPercorsoImmagine);
      } else {
          return res.status(400).send('File immagine non trovato');
      }
  } catch (err) {
      console.error('Errore nel rinominare l\'immagine:', err);
      return res.status(500).send('Errore durante il caricamento dell\'immagine');
  }

  let percorsoMenuRelativo = null;
  if (menuPDF) {
      const nomeMenu = `${menuPDF.filename}${estensioneMenu}`;
      const nuovoPercorsoMenu = path.join(__dirname, '../public/uploads', nomeMenu);

      try {
          if (fs.existsSync(menuPDF.path)) {
              fs.renameSync(menuPDF.path, nuovoPercorsoMenu);
              percorsoMenuRelativo = `/uploads/${nomeMenu}`;
          }
      } catch (err) {
          console.error('Errore nel rinominare il menu:', err);
          return res.status(500).send('Errore durante il caricamento del menu');
      }
  }

  const percorsoImmagineRelativo = `/uploads/${nomeImmagine}`;
  const proprietario = req.session.username;

  let orari = [];
  if (orarioAperturaPranzo && orarioChiusuraPranzo) {
      orari.push(`${orarioAperturaPranzo}-${orarioChiusuraPranzo}`);
  }
  if (orarioAperturaCena && orarioChiusuraCena) {
      orari.push(`${orarioAperturaCena}-${orarioChiusuraCena}`);
  }
  const orariString = orari.length > 0 ? orari.join(', ') : '';

  try {
      await db.addRistorante({
          nome: nomeRistorante,
          indirizzo,
          orari: orariString,
          descrizione,
          copertina: percorsoImmagineRelativo,
          menu: percorsoMenuRelativo,
          proprietario,
          categoria,
          paroleChiave,
          promo,
          citta,
          telefono
      });
      res.redirect('/'); // Reindirizza a una pagina di successo
  } catch (err) {
      console.error(err);
      res.status(500).send('Errore durante l\'inserimento del ristorante');
  }
});






router.get('/modifica-ristorante', (req, res) => {
  const username = req.session.username;
  db.getRistoranteUsername(username)
      .then(ristoranti => {
          if (!ristoranti || ristoranti.length === 0) {
              return res.status(404).send('Nessun ristorante trovato');
          }
          res.render('inserisci-ristorante', { ristoranti });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Errore durante il recupero dei ristoranti');
      });
});



router.post('/modifica-ristorante', upload.fields([
  { name: 'immagineCopertinaInput' },
  { name: 'menuPDFInput' }
]), async (req, res) => {
  // Verifica se l'utente è loggato
  if (!req.session || !req.session.username) {
      return res.status(403).send('Utente non autorizzato');
  }


    const ristorante = await db.getRistoranteUsername(req.session.username);

  



  const {
      id = ristorante[0].id,
      nomeRistorante,
      categoria,
      citta,
      indirizzo,
      telefono,
      paroleChiave,
      descrizione,
      orarioAperturaPranzo,
      orarioChiusuraPranzo,
      orarioAperturaCena,
      orarioChiusuraCena,
      promo
  } = req.body;

  const immagineCopertina = req.files['immagineCopertinaInput'] ? req.files['immagineCopertinaInput'][0] : null;
  const menuPDF = req.files['menuPDFInput'] ? req.files['menuPDFInput'][0] : null;

  let percorsoImmagineRelativo = null;
  if (immagineCopertina) {
      const estensioneCopertina = path.extname(immagineCopertina.originalname);
      const nomeImmagine = `${immagineCopertina.filename}${estensioneCopertina}`;
      const nuovoPercorsoImmagine = path.join(__dirname, '../public/uploads', nomeImmagine);

      try {
          if (fs.existsSync(immagineCopertina.path)) {
              await fs.promises.rename(immagineCopertina.path, nuovoPercorsoImmagine);
              percorsoImmagineRelativo = `/uploads/${nomeImmagine}`;
          } else {
              return res.status(400).send('File immagine non trovato');
          }
      } catch (err) {
          console.error('Errore nel rinominare l\'immagine:', err);
          return res.status(500).send('Errore durante il caricamento dell\'immagine');
      }
  }

  let percorsoMenuRelativo = null;
  if (menuPDF) {
      const estensioneMenu = path.extname(menuPDF.originalname);
      const nomeMenu = `${menuPDF.filename}${estensioneMenu}`;
      const nuovoPercorsoMenu = path.join(__dirname, '../public/uploads', nomeMenu);

      try {
          if (fs.existsSync(menuPDF.path)) {
              await fs.promises.rename(menuPDF.path, nuovoPercorsoMenu);
              percorsoMenuRelativo = `/uploads/${nomeMenu}`;
          }
      } catch (err) {
          console.error('Errore nel rinominare il menu:', err);
          return res.status(500).send('Errore durante il caricamento del menu');
      }
  }

  const proprietario = req.session.username;
  const orari = [];
  if (orarioAperturaPranzo && orarioChiusuraPranzo) {
      orari.push(`${orarioAperturaPranzo}-${orarioChiusuraPranzo}`);
  }
  if (orarioAperturaCena && orarioChiusuraCena) {
      orari.push(`${orarioAperturaCena}-${orarioChiusuraCena}`);
  }
  const orariString = orari.length > 0 ? orari.join(', ') : '';

  try {
      await db.modRistorante({
          id,
          nome: nomeRistorante,
          indirizzo,
          orari: orariString,
          descrizione,
          copertina: percorsoImmagineRelativo,
          menu: percorsoMenuRelativo,
          proprietario,
          categoria,
          paroleChiave,
          promo,
          citta,
          telefono
      });
      res.redirect('/profilo'); // Modifica la pagina di successo se necessario
  } catch (err) {
      console.error('Errore durante l\'inserimento del ristorante:', err);
      res.status(500).send('Errore durante l\'inserimento del ristorante');
  }
});



module.exports = router;