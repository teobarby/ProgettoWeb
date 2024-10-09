const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();
const multer = require('multer');
const path = require('path'); // Importa il modulo 'path'
const upload = multer({ dest: path.join(__dirname, '../public/uploads') });
const fs = require('fs'); // Aggiungi questa riga


// Aggiungi questa route per gestire la visualizzazione di un ristorante specifico
router.get('/ristorante/:id', async function(req, res, next) {
  const ristoranteId = req.params.id;
  const username = req.session.username;
  const recensioneRelativa = db.getRecRestUsername(username, ristoranteId);
  const recensione = await db.possiedeRecensione(username, ristoranteId);
  const possiedeRecensione = !!recensione;
  try {
    // Esegui una query per ottenere le informazioni del ristorante specifico
    const ristorante = await db.getInfoRistorante(ristoranteId); // Passa l'ID del ristorante alla funzione

    if (!ristorante || ristorante.length === 0) {
      return res.status(404).send('Ristorante non trovato'); // Se non esiste, ritorna un 404
    }

    return res.render('paginaRistorante', { title: 'Ristorante', ristorante, username, possiedeRecensione });

  } catch (err) {
    console.log("Errore nel caricamento del ristorante:", err);
    return res.status(500).send('Errore durante il recupero dei dati');
  }
});




router.post('/inserisci-recensione', upload.fields([
  { name: 'immagine' }, // Coerente con il nome del campo nel form HTML
]), async (req, res) => {

  // Verifica se l'utente è loggato
  if (!req.session || !req.session.username) {
      return res.status(403).send('Utente non autorizzato');
  }

  // Recupera i dati dal corpo della richiesta
  const {
    ristoranteId = req.params.ristoranteId,
    valutazione,
    testo,
    titolo
  } = req.body;


  console.log('Dati della richiesta:', req.body); // Controlla cosa contiene req.body
  console.log('ristoranteId:', ristoranteId); // Aggiungi questo log

  
  if (!req.files || !req.files['immagine']) {
    return res.status(400).send('Nessun file immagine caricato');
  }

  // Recupera il file immagine caricato
  const immagineRecInput = req.files['immagine'][0];
  const estensioneImmagine = path.extname(immagineRecInput.originalname);
  const nomeImmagine = `${immagineRecInput.filename}${estensioneImmagine}`;
  const nuovoPercorsoImmagine = path.join(__dirname, '../public/uploads', nomeImmagine);

  try {
      if (fs.existsSync(immagineRecInput.path)) {
          // Rinominare e spostare l'immagine caricata nella cartella public/uploads
          fs.renameSync(immagineRecInput.path, nuovoPercorsoImmagine);
      } else {
          return res.status(400).send('File immagine non trovato');
      }
  } catch (err) {
      console.error('Errore nel rinominare l\'immagine:', err);
      return res.status(500).send('Errore durante il caricamento dell\'immagine');
  }

  // Percorso relativo da salvare nel database
  const percorsoImmagineRelativo = `uploads/${nomeImmagine}`;
  const scrittore = req.session.username; // Cambiato da recensore a scrittore
  const dataora = new Date().toISOString(); // Restituisce una stringa nel formato 'YYYY-MM-DDTHH:mm:ss.sssZ'

  try {
      // Aggiungi la recensione al database
      await db.addRecensione({
          scrittore, // Cambiato da recensore a scrittore
          ristoranteId,
          testo,
          valutazione,
          dataora,
          immagine: percorsoImmagineRelativo, // Utilizzato lo stesso nome del campo immagine nel database
          titolo
      });

      res.redirect(`/ristorante/${ristoranteId}`);
  } catch (err) {
      console.error('Errore durante l\'inserimento della recensione:', err);
      res.status(500).send('Errore durante l\'inserimento della recensione');
  }
});





router.delete('/delete-rec/:username/:ristoranteId', async (req, res) => {
  const username = req.params.username;
  const ristoranteId = req.params.ristoranteId; // Aggiungi questo
  console.log('Eliminazione richiesta per utente:', username);

  const db = new DataBase();

  try {
      await db.deleteRec(username, ristoranteId);
      return res.json({ message: 'Recensione eliminata con successo.' }); // Rispondi con un messaggio JSON
  } catch (err) {
      console.error('Errore durante l\'eliminazione:', err);
      return res.status(500).json({ message: 'Errore durante l\'eliminazione.' });
  }
});



module.exports = router;