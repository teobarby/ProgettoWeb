const express = require('express');
const router = express.Router();
const DataBase = require("../db");
const db = new DataBase();

// Rotta per la pagina di prenotazioni
router.get('/risposte', async function(req, res, next) {
    try {
        const username = req.session.username;
        const rows = await db.getRisposteUsername(username);
        const ristorantiTutti = await db.getHomePage();
      
        return res.render('risposte', { title: 'Risposte dai Proprietari', risposte: rows, username: req.session.username, ristoranti: ristorantiTutti });
    } catch (err) {
      console.log("Errore nel caricamento deile prenotazioni:", err);
      res.status(500).send("Errore interno del server");
    }
  });

module.exports = router;
