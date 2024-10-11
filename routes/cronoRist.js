
const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();






router.get('/CronologiaPrenotazioniRistorante', async function(req, res, next) {

    if (!req.session.username) {
        return res.status(403).send('Utente non autorizzato');
    }



    try {
        const username = req.session.username;
        const ristorante = await db.getRistoranteUsername(username);
        const rows = await db.getPrenotazioniRistorante(ristorante);
        const possiederistorante = await db.possiedeRistorante(username);
        const possiedeRistorante = !!possiederistorante;
      
      // Passa 'username' alla vista
        return res.render('cronoRist', { title: 'Cronologia Ristorante', prenotazioni: rows, username: req.session.username, ristoranti: ristorante, possiedeRistorante });
    } catch (err) {
      console.log("Errore nel caricamento deile prenotazioni:", err);
      res.status(500).send("Errore interno del server");
    }
  });


  module.exports = router;