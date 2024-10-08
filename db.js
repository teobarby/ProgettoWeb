const sqlite3 = require('sqlite3').verbose();

class DataBase {
    constructor() {
        this.db = null; // Inizializza db come null
    }

    /**
     * Open connection to database.
     */
    open() {
        this.db = new sqlite3.Database('./database/GustoInRete.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Error during database opening:', err.message);
            }
        });
    }

    /**
     * Close connection to database.
     */
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        }
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.open(); // Apri la connessione al database
            this.db.run(sql, params, function(err) {
                const lastID = this.lastID; // Ottieni l'ID dell'ultima riga inserita
                // Chiudi la connessione dopo l'operazione
                if (err) {
                    reject(err);
                } else {
                    resolve(lastID); // Risolvi la promessa con l'ID dell'ultima riga inserita
                }
                this.close(); // Chiudi la connessione
            }.bind(this)); // Usa bind per mantenere il contesto di this
        });
    }

    deleteUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Registrati WHERE username = ?`;
    
            this.open();
            this.db.run(sql, [username], function(err) {
                if (err) {
                    console.error("Errore durante l'eliminazione dell'utente:", err.message);
                    reject(err);
                } else if (this.changes === 0) {
                    // Nessuna riga eliminata, l'utente non esiste
                    reject(new Error('Utente non trovato'));
                } else {
                    console.log(`Utente ${username} eliminato.`);
                    resolve({ message: `Utente ${username} eliminato con successo.` });
                }
            });
            this.close();
        });
    }

    deleteRistorante(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM Ristoranti WHERE id = ?`;

            this.open();
            this.db.run(query, [id], function(err) {
                if (err) {
                    console.error('Errore durante l\'eliminazione del ristorante:', err);
                    reject(err);
                }
                resolve(this.changes); // this.changes contiene il numero di righe eliminate
            });
            this.close();
        });
    }

    trovaUtenteUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Registrati
                         WHERE username = ?`;

            this.open();
            this.db.get(sql, [username], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

   
    getCategorie() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Categorie`;

            this.open();
            this.db.all(sql, (err, row) => {
                if (err) return reject(err);
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
            this.db.all(sql, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

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
            this.db.all(sql, [id], (err, rows) => {
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

    possiedeRistorante(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Ristoranti
                         WHERE proprietario = ?`;
    
            this.open();
            this.db.get(sql, [username], (err, row) => {
                if (err) return reject(err);
                resolve(row); // Restituisce 'row' che dovrebbe contenere i dati del ristorante
            });
            this.close();
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.open();
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
                this.close();
            });
        });
    }

    searchRestaurants(keyword) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT R.*, 
                       (SELECT AVG(valutazione) 
                        FROM Recensioni 
                        WHERE ristorante = R.id) AS valutazione_media 
                FROM Ristoranti AS R 
                WHERE R.nome LIKE ? 
                   OR R.paroleChiave LIKE ? 
                   OR R.categoria LIKE ? 
                   OR R.citta LIKE ? 
                   OR R.telefono LIKE ?;
            `;
    
            // Controlla se la keyword è vuota
            if (keyword.trim() === '') {
                return resolve([]); // Restituisci un array vuoto se non ci sono parole chiave
            }
    
            const likeKeyword = `%${keyword}%`;
            const params = [likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword];
    
            console.log("Eseguendo la query:", sql); // Log della query
            console.log("Parametri:", params); // Log dei parametri
    
            this.open();
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log("Errore nella query:", err);
                    reject(err);
                } else {
                    console.log("Ristoranti trovati:", rows);
                    resolve(rows);
                }
                this.close();
            });
        });
    }
    
    addRistorante({ nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono }) {
        return new Promise((resolve, reject) => {

            console.log({
                nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono
            });

            const sql = `INSERT INTO Ristoranti (nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            this.open();
            this.db.run(sql, [nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono], function (err) {
                if (err) return reject(err);
                resolve(this.lastID); // Restituisce l'ID dell'ultimo ristorante inserito
            });
            this.close();
        });
    }

    getRistoranteUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Ristoranti
                         WHERE proprietario = ?`;
    
            this.open();
            this.db.all(sql, [username], (err, rows) => {
                this.close(); // Chiudi la connessione qui, dopo la query
    
                if (err) {
                    return reject(err); // Rifiuta la promessa se c'è un errore
                }
    
                resolve(rows); // Restituisce 'rows' che contiene tutti i ristoranti
            });
        });
    }

    modRistorante({ id, nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono }) {
        return new Promise((resolve, reject) => {
            console.log({
                id, nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono
            });
    
            const sql = `UPDATE Ristoranti SET 
                nome = ?, 
                indirizzo = ?, 
                orari = ?, 
                descrizione = ?, 
                copertina = ?, 
                menu = ?, 
                proprietario = ?, 
                categoria = ?, 
                paroleChiave = ?, 
                promo = ?, 
                citta = ?, 
                telefono = ? 
                WHERE id = ?`;
    
            this.open();
    
            this.db.run(sql, [nome, indirizzo, orari, descrizione, copertina, menu, proprietario, categoria, paroleChiave, promo, citta, telefono, id], function (err) {
                if (err) {
                    console.error('Errore durante l\'aggiornamento del ristorante:', err);
                    return reject(err);
                }
    
                // `this` qui fa riferimento alla connessione del database, non all'oggetto padre
                resolve(this.changes); // Restituisce il numero di righe modificate
            });
    
            this.close(); // Chiudi la connessione una volta che il comando è stato eseguito
        });
    }
}

module.exports = DataBase;