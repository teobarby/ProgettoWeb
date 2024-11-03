const express = require('express');
const router = express.Router();
const DataBase = require("../db"); 
const db = new DataBase();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../public/uploads') });
const fs = require('fs'); 


// Rotta per la pagina di un ristorante
router.get('/ristorante/:id', async function(req, res, next) {
  const ristoranteId = req.params.id;
  const username = req.session.username;
  const recensione = await db.possiedeRecensione(username, ristoranteId);
  const possiedeRecensione = !!recensione;
  const possiedeRistorante = await db.possiedeRistoranteUsername(username, ristoranteId);
  const isFavorite = await db.isFavorite(username, ristoranteId);

  

  try {

    
   
    const ristorante = await db.getInfoRistorante(ristoranteId);
    const preferiti = await db.getNPreferiti(ristoranteId);

    const nPreferiti = preferiti[0].count;

    if (!ristorante || ristorante.length === 0) {
      return res.render('error', {title: 'Errore', message: 'Non esiste il ristorante che stai cercando', username: username});
    }


    return res.render('paginaRistorante', { title: 'Ristorante', ristorante, username, possiedeRecensione, nPreferiti, isFavorite, possiedeRistorante});

  } catch (err) {
    console.log("Errore nel caricamento del ristorante:", err);
    return res.status(500).send('Errore durante il recupero dei dati');
  }
});



// Rotta per l'inserimento di una recensione
router.post('/inserisci-recensione', upload.fields([
  { name: 'immagine' },
]), async (req, res) => {

 
  if (!req.isAuthenticated()) {
      return res.status(403).send('Utente non autorizzato');
  }

 
  const {
    ristoranteId = req.params.ristoranteId,
    valutazione,
    testo,
    titolo
  } = req.body;


  console.log('Dati della richiesta:', req.body); 
  console.log('ristoranteId:', ristoranteId);

  
  if (!req.files || !req.files['immagine']) {
    return res.status(400).send('Nessun file immagine caricato');
  }

  
  const immagineRecInput = req.files['immagine'][0];
  const estensioneImmagine = path.extname(immagineRecInput.originalname);
  const nomeImmagine = `${immagineRecInput.filename}${estensioneImmagine}`;
  const nuovoPercorsoImmagine = path.join(__dirname, '../public/uploads', nomeImmagine);

  try {
      if (fs.existsSync(immagineRecInput.path)) {
         
          fs.renameSync(immagineRecInput.path, nuovoPercorsoImmagine);
      } else {
          return res.status(400).send('File immagine non trovato');
      }
  } catch (err) {
      console.error('Errore nel rinominare l\'immagine:', err);
      return res.status(500).send('Errore durante il caricamento dell\'immagine');
  }

  
  const percorsoImmagineRelativo = `uploads/${nomeImmagine}`;
  const scrittore = req.session.username; 
  const dataora = new Date().toISOString(); 

  try {
      
      await db.addRecensione({
          scrittore,
          ristoranteId,
          testo,
          valutazione,
          dataora,
          immagine: percorsoImmagineRelativo,
          titolo
      });

      res.redirect(`/ristorante/${ristoranteId}`);
  } catch (err) {
      console.error('Errore durante l\'inserimento della recensione:', err);
      res.status(500).send('Errore durante l\'inserimento della recensione');
  }
});




// Rotta per eliminare una recensione
router.delete('/delete-rec/:username/:ristoranteId', async (req, res) => {
  const username = req.params.username;
  const ristoranteId = req.params.ristoranteId; 
  console.log('Eliminazione richiesta per utente:', username);

  const db = new DataBase();

  try {
      await db.deleteRec(username, ristoranteId);
      return res.json({ message: 'Recensione eliminata con successo.' }); 
  } catch (err) {
      console.error('Errore durante l\'eliminazione:', err);
      return res.status(500).json({ message: 'Errore durante l\'eliminazione.' });
  }
});

// Rotta per l'inserimento di una prenotazione
router.post('/prenota', async (req, res) => {
  const ristoranteId = req.body.ristoranteId;
  const dataPrenotazione = req.body.dataPrenotazione;
  const oraPrenotazione = req.body.oraPrenotazione;
  const numeroPersone = req.body.numeroPersone;

  console.log('Dati della richiesta:', req.body);
  console.log('ristoranteId:', ristoranteId);

  try {
    
      await db.addPrenotazione({
          cliente: req.session.username,
          ristoranteId,
          data: dataPrenotazione,
          orario: oraPrenotazione,
          npersone: numeroPersone
      });

      res.redirect(`/ristorante/${ristoranteId}`);
  } catch (err) {
      console.error('Errore durante l\'inserimento della prenotazione:', err);
      res.status(500).send('Errore durante l\'inserimento della prenotazione');
  }
});
  

// Rotta per aggiungere o rimuovere un ristorante dai preferiti
router.post('/aggiungiPreferiti/:ristoranteId', async (req, res) => {
  const ristoranteId = req.params.ristoranteId;
  const userId = req.session.username;

  if (!req.isAuthenticated()) {
    return res.redirect('/login'); 
  }

  try {
    const isFavorite = await db.isFavorite(userId, ristoranteId); 

    if (isFavorite) {
    
      await db.rimuoviDaPreferiti(userId, ristoranteId);
      console.log(`Ristorante ${ristoranteId} rimosso dai preferiti per l'utente ${userId}`);
    } else {
    
      await db.aggiungiAiPreferiti(userId, ristoranteId);
      console.log(`Ristorante ${ristoranteId} aggiunto ai preferiti per l'utente ${userId}`);
    }
     
    res.redirect('/ristorante/' + ristoranteId);

  } catch (error) {
    console.error('Errore durante la gestione dei preferiti:', error);
    res.status(500).send('Errore durante la gestione dei preferiti');
  }
});



// Rotta per inviare una risposta
router.post('/inviaRisposta', async (req, res) => {
  const scrittore = req.body.scrittore;
  const proprietario = req.session.username; 

  

  if (!proprietario) {
      return res.status(401).json({ message: 'Utente non autorizzato.' });
  }

  try {
      const ristorante = await db.getRistoranteUsername(proprietario); 
      const ristoranteId = ristorante[0].id;

      const Risposto = await db.haRisposto(scrittore, ristoranteId, proprietario);
      const haRisposto = !!Risposto;

      if(haRisposto) {
        return res.render('error', {title: 'Errore', message: 'Hai già risposto a questa recensione', username: proprietario});
      }

      if (!ristoranteId) {
          return res.status(404).json({ message: 'Nessun ristorante trovato per questo proprietario.' });
      }

      const { testo } = req.body;
      if (!testo || testo.trim() === '') {
          return res.status(400).json({ message: 'Il messaggio non può essere vuoto.' });
      }

      await db.salvaRispostaAllaRecensione(scrittore, ristoranteId, proprietario, testo);
      
      res.redirect(`/ristorante/${ristoranteId}`);

    } catch (err) {
      console.error('Errore durante l\'invio della risposta:', err);
      res.status(500).json({ message: 'Errore durante l\'invio della risposta.' });
  }
});




module.exports = router;