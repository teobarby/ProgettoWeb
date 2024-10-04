const express = require('express');
const router = express.Router();
const DataBase = require("../db"); // db.js
const db = new DataBase();

/* GET home page. */
router.get('/', async function(req, res, next) {

  try {

    const rows = await db.getHomePage();

    return res.render('index', { title: 'Index', ristoranti: rows });


  } catch (err) {
    console.log("Errore nel caricamento dei ristoranti:", err)
  }
});


module.exports = router;