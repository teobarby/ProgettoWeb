var express = require('express');
var router = express.Router();

/* GET home page. */
/* GET home page. */
router.get('/', function(req, res, next) {
  // Query per ottenere i ristoranti e calcolare la valutazione media
  const sql = `
    SELECT Ristoranti.*, AVG(Recensioni.valutazione) AS valutazione_media
    FROM Ristoranti
    LEFT JOIN Recensioni ON Ristoranti.id = Recensioni.ristorante
    GROUP BY Ristoranti.id
  `;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message); // Log degli errori di query
      return res.status(500).send('Errore durante il recupero dei ristoranti');
    }
    // Passa i ristoranti alla vista 'index'
    res.render('index', { title: 'Index', ristoranti: rows });
  });
});


module.exports = router;