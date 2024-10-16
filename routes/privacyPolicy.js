const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js


router.get('/privacyPolicy', async function(req, res, next) {
    try {
        
        res.render('privacyPolicy', { 
            title: 'Politiche Privacy',
            username: req.session.username
        });
    } catch (err) {
        console.log("Errore nel caricamento della pagina Chi Siamo:", err);
        res.status(500).send("Errore interno del server");
    }
});

module.exports = router