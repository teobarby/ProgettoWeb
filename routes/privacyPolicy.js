const express = require('express');
const router = express.Router();

// Rotta per la pagina di privacy
router.get('/privacyPolicy', async function(req, res, next) {
    try {
        
        res.render('privacyPolicy', { 
            title: 'Politiche Privacy',
            username: req.session.username
        });
    } catch (err) {
        console.log("Errore nel caricamento della pagina Chi Siamo:", err);
        return res.status(500).render('error', {
            title: 'Errore',
            message: 'C\'è stato un errore durante l\'operazione',
            username: username
          });
        }
});

module.exports = router