const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();


router.get('/CronologiaPrenotazioni', async function(req, res, next) {
    try {
        const username = req.session.username;
        const rows = await db.getPrenotazioniUsername(username);
        const ristorantiTutti = await db.getHomePage();
      
     
        return res.render('crono', { title: 'Le tue Prenotazioni', prenotazioni: rows, username: req.session.username, ristoranti: ristorantiTutti });
    } catch (err) {
      console.log("Errore nel caricamento deile prenotazioni:", err);
      res.status(500).send("Errore interno del server");
    }
  });



  router.delete('/delete-pren/:username/:ristorante/:data/:orario', async (req, res) => {
    const username = req.params.username;
    const ristorante = req.params.ristorante;
    const data = req.params.data;
    const orario = req.params.orario;
    console.log('Eliminazione prenotazione richiesta per utente:', username);
  
    const db = new DataBase();
  
    try {
        // Elimina la prenotazione
        await db.deletePrenByUsernameRistorante(username, ristorante, data, orario);
        res.status(200).json({ message: 'Prenotazione eliminata con successo.' });
    } catch (err) {
        console.error('Errore durante l\'eliminazione della prenotazione:', err);
        res.status(500).json({ message: 'Errore durante l\'eliminazione della prenotazione.' });
    }
});


module.exports = router;