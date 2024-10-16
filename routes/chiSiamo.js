const express = require('express');
const router = express.Router();


router.get('/chiSiamo', async function(req, res, next) {
    try {
        
        res.render('chiSiamo', { 
            title: 'Chi Siamo',
            username: req.session.username 
        });
    } catch (err) {
        console.log("Errore nel caricamento della pagina Chi Siamo:", err);
        res.status(500).send("Errore interno del server");
    }
});

module.exports = router