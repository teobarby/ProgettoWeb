const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();


router.get('/CronologiaPrenotazioni', async function(req, res, next) {
    try {
        const username = req.session.username;
        const rows = await db.getPrenotazioniUsername(username);
        const ristorantiTutti = await db.getHomePage();
      
      // Passa 'username' alla vista
        return res.render('crono', { title: 'Crono', prenotazioni: rows, username: req.session.username, ristoranti: ristorantiTutti });
    } catch (err) {
      console.log("Errore nel caricamento deile prenotazioni:", err);
      res.status(500).send("Errore interno del server");
    }
  });



module.exports = router;