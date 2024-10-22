var express = require('express');
var router = express.Router();

const DataBase = require("../db"); 
const db = new DataBase();
const path = require('path'); 

const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../public/uploads') });

 const fs = require('fs');


router.get('/profilo', async (req, res, next) => {
  
  if (req.session && req.session.username) {
    try {
     
      const username = req.session.username;
      const email = req.session.email; 
      const nome = req.session.nome; 
      const cognome = req.session.cognome;
      const cellulare = req.session.cellulare;

      const statistiche = await db.getPreferenzeStatistiche(username);
     
      const categorie = await db.getCategorie();

      const ristorante = await db.possiedeRistorante(username);
      const possiedeRistorante = !!ristorante; 
      const ristoranti = await db.getRistoranteUsername(username); 

      res.render('profilo', { 
        title: 'Profilo', 
        username: username,
        email: email,
        nome: nome,
        cognome: cognome,
        cellulare: cellulare,
        categorie: categorie,
        possiedeRistorante: possiedeRistorante,
        ristoranti: ristoranti,
        statistiche: statistiche
      });
    } catch (err) {
      res.status(500).send('Errore durante il recupero delle categorie');
    }
  } else {
    
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
  
  if (!req.session || !req.session.username) {
      return res.status(403).send('Utente non autorizzato');
  }

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

  const paroleChiaveArray = (JSON.parse(paroleChiave).map((word) => word['value'])).join(', ');



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
          paroleChiave: paroleChiaveArray,
          promo,
          citta,
          telefono
      });
      res.redirect('/'); 
  } catch (err) {
      console.error(err);
      res.status(500).send('Errore durante l\'inserimento del ristorante');
  }
});




router.post('/modifica-ristorante', upload.fields([
  { name: 'immagineCopertinaInput' },
  { name: 'menuPDFInput' }
]), async (req, res) => {
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

  const paroleChiaveArray = (JSON.parse(paroleChiave).map((word) => word['value'])).join(', ');


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
          paroleChiave: paroleChiaveArray,
          promo,
          citta,
          telefono
      });
      res.redirect('/profilo');
  } catch (err) {
      console.error('Errore durante l\'inserimento del ristorante:', err);
      res.status(500).send('Errore durante l\'inserimento del ristorante');
  }
});



router.delete('/delete-user/:username', async (req, res) => {
  const username = req.params.username;
  console.log('Eliminazione richiesta per utente:', username);

  const db = new DataBase();

  try {
      const ristorante = await db.getRistoranteUsername(username);
      if (ristorante && ristorante.length > 0) {
          const ristoranteId = ristorante[0].id;
          console.log(`Eliminazione del ristorante con ID: ${ristoranteId}`);

          await db.deleteRistorante(ristoranteId); 
      }

      await db.deleteUserByUsername(username);
      req.session.destroy(err => {
          if (err) {
              console.error('Errore durante il logout:', err);
              return res.status(500).json({ message: 'Errore durante il logout.' });
          }
          res.status(200).json({ message: 'Utente e ristorante eliminati con successo, logout eseguito.' }); // Risposta di successo
      });
  } catch (err) {
      console.error('Errore durante l\'eliminazione dell\'utente:', err);
      res.status(500).json({ message: 'Errore durante l\'eliminazione dell\'utente.' });
  }
});



router.delete('/delete-rest/:username', async (req, res) => {
  const username = req.params.username;
  console.log('Eliminazione richiesta per utente:', username);

  const db = new DataBase();

  try {
      const ristorante = await db.getRistoranteUsername(username);
      if (ristorante && ristorante.length > 0) {
          const ristoranteId = ristorante[0].id;
          console.log(`Eliminazione del ristorante con ID: ${ristoranteId}`);

          await db.deleteRistorante(ristoranteId);
      }
      res.status(200).json({ message: 'Utente e ristorante eliminati con successo, logout eseguito.' });

  } catch (err) {
      console.error('Errore durante l\'eliminazione del ristorante:', err);
      res.status(500).json({ message: 'Errore durante l\'eliminazione del ristorante.' });
  }
});


router.post('/update-profilo', (req, res) => {
  const { nuovoUsername, nome, cognome, email, cellulare } = req.body;
  const username = req.session.username;
  console.log(`Username attuale: ${username}`);


  if (!nuovoUsername || !nome || !cognome || !email || !cellulare) {
      return res.status(400).send('Tutti i campi sono obbligatori.');
  }


  db.updateProfilo(username, nome, cognome, email, cellulare, nuovoUsername)
      .then(changes => {
          if (changes > 0) {
            req.session.username = null; 

             res.redirect('/login');
          } else {
              res.status(404).send('Nessun utente trovato con questo username.');
          }
      })
      .catch(err => {
          console.error('Errore durante l\'aggiornamento del profilo:', err);
          res.status(500).send('Errore interno del server.');
      });
});



module.exports = router;