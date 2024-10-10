const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js


router.get('/privacyPolicy', async function(req, res, next) {
    try {
        // Puoi recuperare eventuali dati dal database se necessario
        // const info = await db.getInfo(); // Un esempio di funzione per ottenere dati

        res.render('privacyPolicy', { 
            title: 'Politiche Privacy',
            username: req.session.user // Passa l'oggetto utente se disponibile
            // info: info // Passa i dati recuperati se necessario
        });
    } catch (err) {
        console.log("Errore nel caricamento della pagina Chi Siamo:", err);
        res.status(500).send("Errore interno del server");
    }
});

module.exports = router