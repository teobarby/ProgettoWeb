
const express = require('express');
const router = express.Router();
const DataBase = require("../db"); 
const db = new DataBase();





// Rotta per la pagina di prenotazioni
router.get('/CronologiaPrenotazioniRistorante', async function(req, res, next) {

    
    
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    try {
        const username = req.session.username;
        const ristorante = await db.getRistoranteUsername(username);
       
        const possiederistorante = await db.possiedeRistorante(username);
        const possiedeRistorante = !!possiederistorante;

        if (!possiedeRistorante) {
            return res.render('cronoRist', { title: 'Cronologia Ristorante', username: req.session.username, ristoranti: ristorante, possiedeRistorante });
        }

        const ristoranteVerifica = ristorante[0].id;
        const rows = await db.getPrenotazioniRistorante(ristoranteVerifica);

     
        return res.render('cronoRist', { title: 'Cronologia Ristorante', prenotazioni: rows, username: req.session.username, ristoranti: ristorante, possiedeRistorante });
    } catch (err) {
      console.log("Errore nel caricamento deile prenotazioni:", err);
      res.status(500).send("Errore interno del server");
    }

  });

// Rotta per eliminare una prenotazione
  router.delete('/delete-preRist/:username/:ristorante/:data/:orario', async (req, res) => {
    const username = req.params.username;
    const ristorante = req.params.ristorante;
    const data = req.params.data;
    const orario = req.params.orario;
    console.log('Eliminazione prenotazione richiesta per utente:', username);
  
    const db = new DataBase();
  
    try {
       
        await db.deletePrenByUsernameRistorante(username, ristorante, data, orario);
        res.status(200).json({ message: 'Prenotazione eliminata con successo.' });
    } catch (err) {
        console.error('Errore durante l\'eliminazione della prenotazione:', err);
        res.status(500).json({ message: 'Errore durante l\'eliminazione della prenotazione.' });
    }
});

  module.exports = router;