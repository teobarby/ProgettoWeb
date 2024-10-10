const express = require('express');
const router = express.Router();


router.get('/termini', async function(req, res, next) {
    try {
        // Puoi recuperare eventuali dati dal database se necessario
        // const info = await db.getInfo(); // Un esempio di funzione per ottenere dati

        res.render('termini', { 
            title: 'Termini e Condizioni',
            username: req.session.user // Passa l'oggetto utente se disponibile
            // info: info // Passa i dati recuperati se necessario
        });
    } catch (err) {
        console.log("Errore nel caricamento della pagina Chi Siamo:", err);
        res.status(500).send("Errore interno del server");
    }
});

module.exports = router