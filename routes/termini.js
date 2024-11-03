const express = require('express');
const router = express.Router();

// Rotta per la pagina di chi siamo
router.get('/termini', async function(req, res, next) {
    try {
        
        res.render('termini', { 
            title: 'Termini e Condizioni',
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