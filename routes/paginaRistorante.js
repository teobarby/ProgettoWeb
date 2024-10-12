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
  const recensione = await db.possiedeRecensione(username, ristoranteId);
  const possiedeRecensione = !!recensione;
  const possiedeRistorante = await db.possiedeRistoranteUsername(username, ristoranteId);
  const isFavorite = await db.isFavorite(username, ristoranteId);
// Recupera il numero di preferiti per un ristorante specifico
  

  try {

    
    // Esegui una query per ottenere le informazioni del ristorante specifico
    const ristorante = await db.getInfoRistorante(ristoranteId);
    const preferiti = await db.getNPreferiti(ristoranteId); // Qui ottieni l'oggetto con il conteggio

    nPreferiti = preferiti[0].count;

    if (!ristorante || ristorante.length === 0) {
      return res.status(404).send('Ristorante non trovato'); // Se non esiste, ritorna un 404
    }


    return res.render('paginaRistorante', { title: 'Ristorante', ristorante, username, possiedeRecensione, nPreferiti, isFavorite, possiedeRistorante});

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

router.post('/prenota', async (req, res) => {
  const ristoranteId = req.body.ristoranteId;
  const dataPrenotazione = req.body.dataPrenotazione;
  const oraPrenotazione = req.body.oraPrenotazione;
  const numeroPersone = req.body.numeroPersone;

  console.log('Dati della richiesta:', req.body); // Controlla cosa contiene req.body
  console.log('ristoranteId:', ristoranteId); // Aggiungi questo log

  try {
      // Aggiungi la prenotazione al database
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
  


router.post('/aggiungiPreferiti/:ristoranteId', async (req, res) => {
  const ristoranteId = req.params.ristoranteId;
  const userId = req.session.username; // Ottieni lo username dell'utente dalla sessione

  if (!userId) {
    return res.redirect('/login'); // Se l'utente non è loggato, reindirizza al login
  }

  try {
    const isFavorite = await db.isFavorite(userId, ristoranteId); // Usa await per attendere il risultato

    if (isFavorite) {
      // Se è già nei preferiti, lo rimuove
      await db.rimuoviDaPreferiti(userId, ristoranteId);
      console.log(`Ristorante ${ristoranteId} rimosso dai preferiti per l'utente ${userId}`);
    } else {
      // Altrimenti, lo aggiunge
      await db.aggiungiAiPreferiti(userId, ristoranteId);
      console.log(`Ristorante ${ristoranteId} aggiunto ai preferiti per l'utente ${userId}`);
    }
    
    // Reindirizza alla pagina del ristorante
    res.redirect('/ristorante/' + ristoranteId);

  } catch (error) {
    console.error('Errore durante la gestione dei preferiti:', error);
    res.status(500).send('Errore durante la gestione dei preferiti');
  }
});




router.post('/inviaRisposta', async (req, res) => {
  const scrittore = req.body.scrittore;
  const proprietario = req.session.username; // Ora puoi usare questo valore

  

  if (!proprietario) {
      return res.status(401).json({ message: 'Utente non autorizzato.' });
  }

  try {
      const ristorante = await db.getRistoranteUsername(proprietario); // Usa proprietario qui
      const ristoranteId = ristorante[0].id;

      const Risposto = await db.haRisposto(scrittore, ristoranteId, proprietario);
      const haRisposto = !!Risposto;

      if(haRisposto) {
        return res.render('error', {title: 'Errore', message: 'Hai già risposto a questa recensione', username: proprietario});
      }

      if (!ristoranteId) {
          return res.status(404).json({ message: 'Nessun ristorante trovato per questo proprietario.' });
      }

      const { testo } = req.body; // Cambia 'replyMessage' in 'testo'
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