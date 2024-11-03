const express = require('express');
const router = express.Router();
const DataBase = require("../db");
const db = new DataBase();

// Rotta per la homepage
router.get('/', async function(req, res, next) {
  try {
    const rows = await db.getHomePage();
    
   
    return res.render('index', { title: 'HomePage', ristoranti: rows, username: req.session.username });
  } catch (err) {
    console.log("Errore nel caricamento dei ristoranti:", err);
    return res.status(500).render('error', {
      title: 'Errore',
      message: 'C\'è stato un errore durante l\'operazione',
      username: username
    });
  } 
});

// Rotta per la ricerca
router.get('/cerca', async (req, res) => {
  const keyword = req.query.keyword || '';
  console.log(`Keyword di ricerca: ${keyword}`); 
  const title = `Risultati di ricerca per "${keyword}"`;
  const username = req.session.username || null;
  try {
      const ristoranti = await db.searchRestaurants(keyword.trim());
      console.log(`Ristoranti trovati: ${JSON.stringify(ristoranti)}`);
      res.render('index', { ristoranti, title, username });
  } catch (error) {
      console.error('Errore durante la ricerca:', error);
      return res.status(500).render('error', {
        title: 'Errore',
        message: 'C\'è stato un errore durante l\'operazione',
        username: username
      });
  }
});

// Rotta per la ricerca per categoria
router.get('/cercaCat', async (req, res) => {
  const categoria = req.query.category || '';  
  console.log(`Cerca per categoria: ${categoria}`);
  const title = `Risultati di ricerca per categoria "${categoria}"`;
  const username = req.session.username || null;

  if (!categoria) {
      return res.status(400).send('Categoria non specificata');
  }

  try {
      const ristoranti = await db.cercaPerCategoria(categoria);
      console.log(`Ristoranti trovati: ${JSON.stringify(ristoranti)}`);

      if (ristoranti.length === 0) {
          return res.render('index', { ristoranti: [], title: 'Nessun ristorante trovato', username });
      }

      res.render('index', { ristoranti, title, username });
  } catch (error) {
      console.error('Errore durante la ricerca:', error);
      return res.status(500).render('error', {
        title: 'Errore',
        message: 'C\'è stato un errore durante l\'operazione',
        username: username
      });
  }
});

// Rotta per la gestione dei preferiti
router.get('/preferiti', async (req, res) => {
  const username = req.session.username;
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  const title = 'I tuoi ristoranti preferiti';
  try {
      const ristoranti = await db.getFavoriteRestaurants(username);
      res.render('index', { ristoranti, title, username });
  } catch (error) {
      console.error('Errore durante la gestione dei preferiti:', error);
      return res.status(500).render('error', {
        title: 'Errore',
        message: 'C\'è stato un errore durante l\'operazione',
        username: username
      });
  }
});

// Rotta per la gestione dei preferiti
router.get('/topPreferiti', async (req, res) => {
  const username = req.session.username || null;
  
  const title = 'Top 10 ristoranti preferiti';
  try {
      const ristoranti = await db.getTopFavoriteRestaurants();
      res.render('index', { ristoranti, title, username });
  } catch (error) {
      console.error('Errore durante la gestione dei preferiti:', error);
      return res.status(500).render('error', {
        title: 'Errore',
        message: 'C\'è stato un errore durante l\'operazione',
        username: username
      });
  }
});

module.exports = router;