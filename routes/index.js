const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const rows = await db.getHomePage();
    
    // Passa 'username' alla vista
    return res.render('index', { title: 'Index', ristoranti: rows, username: req.session.username });
  } catch (err) {
    console.log("Errore nel caricamento dei ristoranti:", err);
    res.status(500).send("Errore interno del server");
  }
});

module.exports = router;