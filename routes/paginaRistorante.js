var express = require('express');
var router = express.Router();

/* GET specific restaurant page */
// Aggiungi questa route per gestire la visualizzazione di un ristorante specifico
router.get('/ristorante/:id', function(req, res, next) {
  const ristoranteId = req.params.id;

  const query = `
          SELECT 
              Ristoranti.nome AS nome_ristorante,
              Ristoranti.indirizzo,
              Ristoranti.orari,
              Ristoranti.descrizione,
              Ristoranti.copertina,
              Ristoranti.menu,
              Ristoranti.proprietario,
              Ristoranti.categoria,
              Ristoranti.paroleChiave,
              Ristoranti.promo,
              Recensioni.scrittore,
              Recensioni.testo,
              Recensioni.valutazione,
              Recensioni.dataora,
              Recensioni.immagine,
              (SELECT AVG(valutazione) FROM Recensioni WHERE Recensioni.ristorante = Ristoranti.id) AS valutazione_media
          FROM 
              Ristoranti
          LEFT JOIN 
              Recensioni ON Ristoranti.id = Recensioni.ristorante
          WHERE 
              Ristoranti.id = ?
          ORDER BY 
              Recensioni.dataora DESC;
  `;

  req.db.all(query, [ristoranteId], (err, rows) => {
      if (err) {
          console.error(err.message);
          return res.status(500).send('Errore durante il recupero dei dati');
      }
      if (rows.length === 0) {
          return res.status(404).send('Ristorante non trovato'); // Se il ristorante non esiste
      }
      res.render('paginaRistorante', { title: 'Pagina Ristorante', ristorante: rows });
  });
});

module.exports = router;