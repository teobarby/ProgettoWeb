
const {text} = require("express");
const sqlite3 = require('sqlite3').verbose();
let db;

class DataBase {
    /**
     * Open connection to database.
     */
    open() {
        db = new sqlite3.Database('./database/GustoInRete.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) console.error('Error during database opening:', err.message);
        });
    }

    /**
     * Close connection to database.
     */
    close() {
        db.close((err) => {
            if (err) throw console.error(err.message);
        });
    }

    trovaUtenteUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Registrati
                         WHERE username = ?`;

            this.open();
            db.get(sql, [username], (err, row) => {
                if (err) throw reject(err);
                resolve(row);
            });
            this.close();
        });
    }


    getHomePage() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Ristoranti.*, AVG(Recensioni.valutazione) AS valutazione_media 
                        FROM Ristoranti 
                        LEFT JOIN Recensioni ON Ristoranti.id = Recensioni.ristorante 
                        GROUP BY Ristoranti.id`;
            this.open();
            db.all(sql, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
            this.close();
        });
    };


    getInfoRistorante(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT 
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
                Recensioni.titolo,
                (SELECT AVG(valutazione) FROM Recensioni WHERE Recensioni.ristorante = Ristoranti.id) AS valutazione_media
            FROM 
                Ristoranti
            LEFT JOIN 
                Recensioni ON Ristoranti.id = Recensioni.ristorante
            WHERE 
                Ristoranti.id = ?
            ORDER BY 
                Recensioni.dataora DESC;`;
    
            this.open();
    
            // Passa l'ID come parametro per la query
            db.all(sql, [id], (err, rows) => {
                if (err) {
                    console.log("Errore nella query:", err);
                    reject(err);
                } else {
                    console.log("Ristoranti trovati:", rows);
                    resolve(rows);
                }
            });
    
            this.close();
        });
    }


    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.open();
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
                this.close();
            });
        });
    }

}

module.exports = DataBase;