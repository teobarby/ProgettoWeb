const express = require('express');
const router = express.Router();


router.get('/termini', async function(req, res, next) {
    try {
        
        res.render('termini', { 
            title: 'Termini e Condizioni',
            username: req.session.user
        });
    } catch (err) {
        console.log("Errore nel caricamento della pagina Chi Siamo:", err);
        res.status(500).send("Errore interno del server");
    }
});

module.exports = router