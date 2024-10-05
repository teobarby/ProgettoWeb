const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();

// Aggiungi questa route per gestire la visualizzazione di un ristorante specifico
router.get('/ristorante/:id', async function(req, res, next) {
  const ristoranteId = req.params.id;

  try {
    // Esegui una query per ottenere le informazioni del ristorante specifico
    const ristorante = await db.getInfoRistorante(ristoranteId); // Passa l'ID del ristorante alla funzione

    if (!ristorante || ristorante.length === 0) {
      return res.status(404).send('Ristorante non trovato'); // Se non esiste, ritorna un 404
    }

    return res.render('paginaRistorante', { title: 'Ristorante', ristorante, username: req.session.username });

  } catch (err) {
    console.log("Errore nel caricamento del ristorante:", err);
    return res.status(500).send('Errore durante il recupero dei dati');
  }
});

module.exports = router;