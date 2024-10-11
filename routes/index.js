const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const rows = await db.getHomePage();
    
    // Passa 'username' alla vista
    return res.render('index', { title: 'HomePage', ristoranti: rows, username: req.session.username });
  } catch (err) {
    console.log("Errore nel caricamento dei ristoranti:", err);
    res.status(500).send("Errore interno del server");
  }
});

router.get('/cerca', async (req, res) => {
  const keyword = req.query.keyword || '';
  console.log(`Keyword di ricerca: ${keyword}`); // Log della keyword
  const title = `Risultati di ricerca per "${keyword}"`;
  const username = req.session.username || null;
  try {
      const ristoranti = await db.searchRestaurants(keyword.trim());
      console.log(`Ristoranti trovati: ${JSON.stringify(ristoranti)}`); // Log dei ristoranti trovati
      res.render('index', { ristoranti, title, username });
  } catch (error) {
      console.error('Errore durante la ricerca:', error);
      res.status(500).send('Errore durante la ricerca');
  }
});

router.get('/preferiti', async (req, res) => {
  const username = req.session.username;
  if (!username) {
    return res.redirect('/login');
  }

  const title = 'I tuoi ristoranti preferiti';
  try {
      const ristoranti = await db.getFavoriteRestaurants(username);
      res.render('index', { ristoranti, title, username });
  } catch (error) {
      console.error('Errore durante la gestione dei preferiti:', error);
      res.status(500).send('Errore durante la gestione dei preferiti');
  }
});

module.exports = router;