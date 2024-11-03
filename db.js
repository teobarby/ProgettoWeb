const sqlite3 = require('sqlite3').verbose();

class DataBase {
    /**
     * Creates a new instance of the DataBase class.
     * Initializes the db instance variable to null.
     */
    constructor() {
        this.db = null;
    }

  
    /**
     * Opens a connection to the SQLite database and enables foreign key constraints.
     * Logs an error message if there's an issue opening the database or setting foreign keys.
     */
    open() {
        this.db = new sqlite3.Database('./database/GustoInRete.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Error during database opening:', err.message);
            }
        });
        this.db.run('PRAGMA foreign_keys = ON', [], function(err) {
            if (err) {
                console.error('Error during foreign_keys setting:', err.message);
            }
        });
    }

    
    /**
     * Close the connection to the SQLite database.
     * Log an error message if there's an issue closing the database.
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

    /**
     * Executes a SQL query in the database. If the query is an INSERT query, 
     * resolves the promise with the ID of the last inserted row. 
     * 
     * @param {string} sql - The SQL query to be executed.
     * @param {array} [params] - The parameters of the query.
     * 
     * @returns {Promise<number>} - A promise that resolves with the ID of the last inserted row.
     */
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

    
    /**
     * Deletes a user with the specified username from the database.
     * If the user is successfully deleted, the promise resolves with a success message.
     * If no user is found with the specified username, the promise is rejected with an error.
     * Logs an error message if there's an issue during user deletion.
     * 
     * @param {string} username - The username of the user to delete.
     * 
     * @returns {Promise<Object>} - A promise that resolves with a success message if the user is deleted.
     */
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

    /**
     * Deletes a restaurant with the specified id from the database.
     * If the restaurant is successfully deleted, the promise resolves with the number of rows deleted.
     * If there's an issue during restaurant deletion, the promise is rejected with an error.
     * Logs an error message if there's an issue during restaurant deletion.
     * 
     * @param {number} id - The id of the restaurant to delete.
     * 
     * @returns {Promise<number>} - A promise that resolves with the number of rows deleted.
     */
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

    /**
     * Deletes a review with the specified username and restaurant id from the database.
     * If the review is successfully deleted, the promise resolves with no data.
     * If there's an issue during review deletion, the promise is rejected with an error.
     * Logs an error message if there's an issue during review deletion.
     * 
     * @param {string} username - The username of the reviewer.
     * @param {number} id - The id of the restaurant.
     * 
     * @returns {Promise<void>} - A promise that resolves when the review is deleted.
     */
    deleteRec(username, id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Recensioni WHERE scrittore = ? AND ristorante = ?`;
            this.open();
            this.db.run(sql, [username, id], (err) => {
                if (err) {
                    console.error('Errore durante l\'eliminazione della recensione:', err);
                    return reject(err);
                }
                console.log(`Recensione eliminata con successo per scrittore: ${username}, ristorante ID: ${id}`);
                resolve();
            });
            this.close();
        });
    }


    /**
     * Updates the user profile with the specified values.
     * If the update is successful, the promise resolves with the number of rows updated.
     * If there's an issue during the update, the promise is rejected with an error.
     * Logs an error message if there's an issue during the update.
     * 
     * @param {string} username - The current username.
     * @param {string} nome - The new name.
     * @param {string} cognome - The new surname.
     * @param {string} email - The new email.
     * @param {string} cellulare - The new phone number.
     * @param {string} nuovoUsername - The new username.
     * 
     * @returns {Promise<number>} - A promise that resolves with the number of rows updated.
     */
    updateProfilo(username, nome, cognome, email, cellulare, nuovoUsername) {
        return new Promise((resolve, reject) => {
            // Definisci la query SQL per aggiornare i dettagli dell'utente
            const sql = `UPDATE Registrati 
                         SET nome = ?, cognome = ?, email = ?, cellulare = ?, username = ? 
                         WHERE username = ?`;
            this.open();
            // Esegui la query con i valori passati come parametri
            this.db.run(sql, [nome, cognome, email, cellulare, nuovoUsername, username], function(err) {
                if (err) {
                    console.error('Errore durante l\'update:', err);
                    return reject(err);
                }
                console.log(`Update con successo: ${username}`);
                resolve(this.changes); // 'this.changes' contiene il numero di righe aggiornate
            });
            this.close();
        });
    }


    /**
     * Finds a user by their username.
     * If the user is found, the promise resolves with the user data.
     * If the user is not found, the promise resolves with null.
     * If there's an issue during the query, the promise is rejected with an error.
     * Logs an error message if there's an issue during the query.
     * 
     * @param {string} username - The username to search for.
     * 
     * @returns {Promise<Object>} - A promise that resolves with the user data.
     */
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

    /**
     * Finds a user by their email.
     * If the user is found, the promise resolves with the user data.
     * If the user is not found, the promise resolves with null.
     * If there's an issue during the query, the promise is rejected with an error.
     * Logs an error message if there's an issue during the query.
     * 
     * @param {string} email - The email to search for.
     * 
     * @returns {Promise<Object|null>} - A promise that resolves with the user data or null if not found.
     */
    trovaUtenteEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Registrati
                         WHERE email = ?`;

            this.open();
            this.db.get(sql, [email], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

    /**
     * Finds a user by their phone number.
     * If the user is found, the promise resolves with the user data.
     * If the user is not found, the promise resolves with null.
     * If there's an issue during the query, the promise is rejected with an error.
     * Logs an error message if there's an issue during the query.
     * 
     * @param {string} cellulare - The phone number to search for.
     * 
     * @returns {Promise<Object|null>} - A promise that resolves with the user data or null if not found.
     */
    trovaUtenteCellulare(cellulare) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Registrati
                         WHERE cellulare = ?`;

            this.open();     
            this.db.get(sql, [cellulare], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

    /**
     * Retrieves the number of users who have marked the specified restaurant as a favorite.
     * 
     * This method queries the database to count the entries in the 'Preferisce' table
     * where the restaurant ID matches the provided ristoranteId.
     * 
     * @param {string|number} ristoranteId - The unique identifier of the restaurant.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array containing 
     * the count of users who have favorited the specified restaurant.
     * 
     * @throws Will throw an error if there is an issue with the database query.
     */
    async getNPreferiti(ristoranteId) {
        try {
            return await new Promise((resolve, reject) => {

                const sql = `SELECT COUNT(*) AS count 
                         FROM Preferisce 
                         WHERE ristorante = ?`;

                this.open();

                this.db.all(sql, [ristoranteId], (err, row) => {
                    if (err) {
                        console.error("Errore nella query:", err);
                        return reject(err);
                    }
                    resolve(row);
                });
            });
        } finally {
            this.close();
        }
    }

    /**
     * Retrieves statistical preferences for a given user.
     * 
     * This method queries the database to fetch counts of the user's favorite restaurants,
     * written reviews, and bookings. It returns these counts in an object.
     * 
     * @param {string} username - The username of the user for whom the statistics are retrieved.
     * 
     * @returns {Promise<Object>} - A promise that resolves with an object containing:
     *                              - `preferitiCount`: Number of favorite restaurants.
     *                              - `recensioniCount`: Number of reviews written.
     *                              - `prenotazioniCount`: Number of bookings made.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getPreferenzeStatistiche(username) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    (SELECT COUNT(*) FROM Preferisce WHERE username = ?) as preferitiCount,
                    (SELECT COUNT(*) FROM Recensioni WHERE scrittore = ?) as recensioniCount,
                    (SELECT COUNT(*) FROM Prenotazioni WHERE cliente = ?) as prenotazioniCount
            `;
            this.open();
            this.db.all(sql, [username, username, username], (err, rows) => {
                if (err) return reject(err);
                resolve(rows[0]); // Restituisci la prima riga con i conteggi
            });
            this.close();
        });
    }
   
    /**
     * Retrieves all categories from the database.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of category objects.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
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
    

    /**
     * Retrieves all restaurants from the database sorted by average rating.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects, each containing:
     *                              - All fields from the 'Ristoranti' table.
     *                              - An additional field 'valutazione_media' containing the average rating of the restaurant.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getHomePage() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Ristoranti.*, AVG(Recensioni.valutazione) AS valutazione_media 
                        FROM Ristoranti 
                        LEFT JOIN Recensioni ON Ristoranti.id = Recensioni.ristorante 
                        GROUP BY Ristoranti.id
                        ORDER BY valutazione_media DESC`;
            this.open();
            this.db.all(sql, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

    /**
     * Retrieves all reviews written by a user with the given username for a restaurant with the given id.
     * 
     * @param {string} username - The username of the user who wrote the reviews.
     * @param {number} id - The id of the restaurant for which the reviews were written.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects, each containing all fields from the 'Recensioni' table.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getRecRestUsername(username, id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Recensioni
                         WHERE scrittore = ? AND ristorante = ?` 
            this.open();
            this.db.all(sql, [username, id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

    

    

    /**
     * Retrieves all information about a restaurant, including its reviews.
     * 
     * @param {number} id - The id of the restaurant to retrieve.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects, each containing all fields from the 'Ristoranti' table and the fields from the 'Recensioni' table (scrittore, testo, valutazione, dataora, immagine, titolo).
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getInfoRistorante(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT 
                Ristoranti.id,
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
                (SELECT ROUND(AVG(valutazione), 1) FROM Recensioni WHERE Recensioni.ristorante = Ristoranti.id) AS valutazione_media
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

    /**
     * Returns a promise that resolves with the ristorante object if the user owns a ristorante,
     * or null if the user does not own a ristorante.
     * 
     * @param {string} username - The username of the user to check.
     * @returns {Promise<Object>} - The ristorante object if the user owns a ristorante, or null.
     */
    possiedeRistorante(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Ristoranti
                         WHERE proprietario = ?`;
    
            this.open();
            this.db.get(sql, [username], (err, row) => {
                if (err) return reject(err);
                resolve(row); 
            });
            this.close();
        });
    }

    /**
     * Returns a promise that resolves with the ristorante object if the user with the given username owns a ristorante with the given id,
     * or null if the user does not own a ristorante with the given id.
     * 
     * @param {string} username - The username of the user to check.
     * @param {number} ristoranteId - The id of the ristorante to check.
     * @returns {Promise<Object>} - The ristorante object if the user owns a ristorante with the given id, or null.
     */
    possiedeRistoranteUsername(username, ristoranteId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Ristoranti
                         WHERE proprietario = ? AND id = ?`;
    
            this.open();
            this.db.get(sql, [username, ristoranteId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
            this.close();
        });
    }

    /**
     * Returns a promise that resolves with the review object if the user with the given username owns a review for the ristorante with the given id,
     * or null if the user does not own a review for the ristorante with the given id.
     * 
     * @param {string} username - The username of the user to check.
     * @param {number} id - The id of the ristorante to check.
     * @returns {Promise<Object>} - The review object if the user owns a review for the ristorante with the given id, or null.
     */
    possiedeRecensione(username, id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Recensioni
                         WHERE scrittore = ? AND ristorante = ?`;
    
            this.open();
            this.db.get(sql, [username, id], (err, row) => {
                if (err) return reject(err);
                resolve(row); 
            });
            this.close();
        });
    }


    /**
     * Returns a promise that resolves with the result of the query.
     * 
     * @param {string} sql - The SQL query to execute.
     * @param {any[]} params - The parameters to use in the query.
     * @returns {Promise<Object>} - The result of the query if it is successful, or null if it is not.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
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

    /**
     * Searches for restaurants with the given keyword in their name, keywords, category, city or phone number.
     * 
     * @param {string} keyword - The keyword to search for.
     * 
     * @returns {Promise<Object[]>} - An array of restaurant objects that match the keyword, or an empty array if none match.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
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
                return resolve([]);
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
    
    /**
     * Adds a new restaurant to the database.
     * @param {Object} data The data to be inserted
     * @param {string} data.nome The name of the restaurant
     * @param {string} data.indirizzo The address of the restaurant
     * @param {string} data.orari The opening hours of the restaurant
     * @param {string} data.descrizione A short description of the restaurant
     * @param {string} data.copertina The path to the cover image
     * @param {string} data.menu The path to the menu PDF
     * @param {string} data.proprietario The username of the owner
     * @param {string} data.categoria The category of the restaurant
     * @param {string} data.paroleChiave The keywords associated with the restaurant
     * @param {boolean} data.promo Whether the restaurant is a promoted one
     * @param {string} data.citta The city the restaurant is in
     * @param {string} data.telefono The phone number of the restaurant
     * @returns {Promise<number>} A promise that resolves with the ID of the newly inserted restaurant
     */
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
                resolve(this.lastID);
            });
            this.close();
        });
    }


    /**
     * Adds a new review to the database.
     * 
     * @param {Object} data The data to be inserted
     * @param {string} data.scrittore The username of the reviewer
     * @param {number} data.ristoranteId The ID of the restaurant being reviewed
     * @param {string} data.testo The text of the review
     * @param {number} data.valutazione The rating of the review (between 1 and 5)
     * @param {Date} data.dataora The date and time the review was written
     * @param {string} data.immagine The path to the image associated with the review
     * @param {string} data.titolo The title of the review
     * @returns {Promise<number>} A promise that resolves with the ID of the newly inserted review
     */
    addRecensione({ scrittore, ristoranteId, testo, valutazione, dataora, immagine, titolo }) {
        return new Promise((resolve, reject) => {
            console.log({
                scrittore, ristoranteId, testo, valutazione, dataora, immagine, titolo
            });
    
            const sql = `INSERT INTO Recensioni (scrittore, ristorante, testo, valutazione, dataora, immagine, titolo) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
            this.open(); 
    
            // Esegui la query
            this.db.run(sql, [scrittore, ristoranteId, testo, valutazione, dataora, immagine, titolo], function (err) {
                if (err) {
                    return reject(err);
                }
    
                resolve(this.lastID);
            });
    
            this.close(); 
        });
    }

    /**
     * Retrieves the restaurant associated with the given username.
     * 
     * @param {string} username The username of the restaurant owner
     * @returns {Promise<Object[]>} A promise that resolves with an array of objects, each containing all fields from the 'Ristoranti' table associated with the given username
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getRistoranteUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Ristoranti
                         WHERE proprietario = ?`;
    
            this.open();
            this.db.all(sql, [username], (err, rows) => {
                this.close(); 
    
                if (err) {
                    return reject(err); 
                }
    
                resolve(rows); 
            });
        });
    }

    /**
     * Retrieves all bookings associated with the given username.
     * 
     * @param {string} username The username of the user who made the bookings
     * @returns {Promise<Object[]>} A promise that resolves with an array of objects, each containing all fields from the 'Prenotazioni' table associated with the given username
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getPrenotazioniUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                         FROM Prenotazioni
                         WHERE cliente = ?
                         ORDER BY data DESC, orario DESC`;
    
            this.open();
            this.db.all(sql, [username], (err, rows) => {
                this.close();
    
                if (err) {
                    return reject(err); 
                }
    
                resolve(rows); 
            });
        });
    }

    /**
     * Retrieves all bookings associated with the given restaurant.
     * 
     * @param {number} ristoranteVerifica The id of the restaurant associated with the bookings
     * @returns {Promise<Object[]>} A promise that resolves with an array of objects, each containing all fields from the 'Prenotazioni' table associated with the given restaurant id
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getPrenotazioniRistorante(ristoranteVerifica) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT *
                        FROM Prenotazioni
                        WHERE ristorante = ?
                        ORDER BY data DESC, orario DESC`;
    
            this.open();
            this.db.all(sql, [ristoranteVerifica], (err, rows) => {
                this.close();
    
                if (err) {
                    return reject(err); 
                }
    
                resolve(rows);
            });
        });
    }

    /**
     * Updates the information of an existing restaurant in the database.
     * 
     * @param {Object} data - The data to update the restaurant with.
     * @param {number} data.id - The ID of the restaurant to update.
     * @param {string} data.nome - The name of the restaurant.
     * @param {string} data.indirizzo - The address of the restaurant.
     * @param {string} data.orari - The operating hours of the restaurant.
     * @param {string} data.descrizione - The description of the restaurant.
     * @param {string} data.copertina - The path to the cover image of the restaurant.
     * @param {string} data.menu - The path to the menu of the restaurant.
     * @param {string} data.proprietario - The username of the restaurant owner.
     * @param {string} data.categoria - The category of the restaurant.
     * @param {string} data.paroleChiave - Keywords associated with the restaurant.
     * @param {string} data.promo - Promotions available at the restaurant.
     * @param {string} data.citta - The city where the restaurant is located.
     * @param {string} data.telefono - The phone number of the restaurant.
     * 
     * @returns {Promise<number>} - A promise that resolves with the number of rows affected by the update.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
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
    
               
                resolve(this.changes); 
            });
    
            this.close(); 
        });
    }


    /**
     * Adds a new booking to the database.
     * 
     * @param {Object} data The data to be inserted
     * @param {string} data.cliente The username of the client who made the booking
     * @param {number} data.ristoranteId The id of the restaurant the booking is for
     * @param {string} data.data The date of the booking in the format 'YYYY-MM-DD'
     * @param {string} data.orario The time of the booking in the format 'HH:MM'
     * @param {number} data.npersone The number of people for the booking
     * 
     * @returns {Promise<number>} A promise that resolves with the id of the newly inserted booking
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    addPrenotazione({ cliente, ristoranteId, data, orario, npersone }) {
        return new Promise((resolve, reject) => {

            console.log({
                cliente, ristoranteId, data, orario, npersone
            });
    
            const sql = `INSERT INTO Prenotazioni (cliente, ristorante, data, orario, npersone) 
                         VALUES (?, ?, ?, ?, ?)`;
    
            this.open(); 
    
           
            this.db.run(sql, [cliente, ristoranteId, data, orario, npersone], function (err) {
                if (err) {
                    return reject(err);
                }
    
                resolve(this.lastID);
            });
    
            this.close(); 
        });
    }


    /**
     * Deletes a booking from the database.
     * 
     * @param {string} username The username of the client who made the booking
     * @param {number} ristorante The id of the restaurant the booking is for
     * @param {string} data The date of the booking in the format 'YYYY-MM-DD'
     * @param {string} orario The time of the booking in the format 'HH:MM'
     * 
     * @returns {Promise<void>} A promise that resolves when the booking has been deleted
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    deletePrenByUsernameRistorante(username, ristorante, data, orario) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Prenotazioni 
            WHERE cliente = ? AND ristorante = ? AND data = ? AND orario = ?`;
            this.open();
            this.db.run(sql, [username, ristorante, data, orario], (err) => {
                if (err) {
                    console.error('Errore durante l\'eliminazione della prenotazione:', err);
                    return reject(err);
                }
                console.log(`Prenotazione eliminata con successo per scrittore: ${username}, ristorante ID: ${ristorante}, del ${data} alle ${orario}`);
                resolve();
            });
            this.close();
        });
    }

    /**
     * Adds a restaurant to the user's preferred restaurants.
     * 
     * @param {string} userId - The ID of the user.
     * @param {number} ristoranteId - The ID of the restaurant to be added.
     * 
     * @returns {Promise<void>} - A promise that resolves when the restaurant has been added to the user's preferences.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    aggiungiAiPreferiti(userId, ristoranteId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Preferisce (username, ristorante) 
                         VALUES (?, ?)`;

            this.open();
            this.db.run(sql, [userId, ristoranteId], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });

            this.close();
        });
    }

    /**
     * Checks if a restaurant is in the user's favorites.
     * 
     * @param {string} username - The ID of the user.
     * @param {number} ristoranteId - The ID of the restaurant to be checked.
     * 
     * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating if the restaurant is in the user's favorites.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    isFavorite(username, ristoranteId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Preferisce WHERE username = ? AND ristorante = ?`;
            this.open();
            this.db.get(sql, [username, ristoranteId], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row !== undefined);
            });
            this.close();
        });
    }

    /**
     * Removes a restaurant from the user's preferred restaurants.
     * 
     * @param {string} username - The ID of the user.
     * @param {number} ristoranteId - The ID of the restaurant to be removed.
     * 
     * @returns {Promise<void>} - A promise that resolves when the restaurant has been removed from the user's preferences.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    rimuoviDaPreferiti(username, ristoranteId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Preferisce WHERE username = ? AND ristorante = ?`;
            this.open();
            this.db.run(sql, [username, ristoranteId], (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
            this.close();
        });
    }


    /**
     * Retrieves all restaurants that are marked as favorites by the user.
     * 
     * @param {string} username - The ID of the user.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects, each containing:
     *                              - All fields from the 'Ristoranti' table.
     *                              - An additional field 'valutazione_media' containing the average rating of the restaurant.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getFavoriteRestaurants(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Preferisce.*, Ristoranti.*, AVG(Recensioni.valutazione) AS valutazione_media
                            FROM Preferisce
                            LEFT JOIN Ristoranti ON Ristoranti.id = Preferisce.ristorante
                            JOIN Recensioni ON Recensioni.ristorante = Ristoranti.id
                            WHERE Preferisce.username = ?
                            GROUP BY Ristoranti.id
                            ORDER BY valutazione_media DESC`;
            this.open();
            this.db.all(sql, [username], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
            this.close();
        });
    }




    /**
     * Retrieves the top 3 restaurants with the most favorites.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects, each containing:
     *                              - All fields from the 'Ristoranti' table.
     *                              - An additional field 'numero_preferiti' containing the number of users who marked the restaurant as favorite.
     *                              - An additional field 'valutazione_media' containing the average rating of the restaurant.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getTopFavoriteRestaurants() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Ristoranti.*, 
                        COUNT(Preferisce.ristorante) AS numero_preferiti, 
                        AVG(Recensioni.valutazione) AS valutazione_media
                        FROM Preferisce
                        LEFT JOIN Ristoranti ON Ristoranti.id = Preferisce.ristorante
                        LEFT JOIN Recensioni ON Recensioni.ristorante = Ristoranti.id
                        GROUP BY Ristoranti.id
                        ORDER BY numero_preferiti DESC
                        LIMIT 3`;
            this.open();
            this.db.all(sql, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
            this.close();
        });
    }



    /**
     * Retrieves all restaurants with a given category.
     * 
     * @param {string} categoria - The category to search for.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects, each containing:
     *                              - All fields from the 'Ristoranti' table.
     *                              - An additional field 'valutazione_media' containing the average rating of the restaurant.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    cercaPerCategoria(categoria) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Ristoranti.*, AVG(Recensioni.valutazione) AS valutazione_media
                        FROM Ristoranti 
                        LEFT JOIN Recensioni ON Recensioni.ristorante = Ristoranti.id 
                        WHERE categoria = ?
                        GROUP BY Ristoranti.id
                        ORDER BY valutazione_media DESC`;
            this.open();
            this.db.all(sql, [categoria], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
            this.close();
        });
    }




    /**
     * Retrieves a user from the database by their username.
     * 
     * @param {string} username - The username of the user to retrieve.
     * 
     * @returns {Promise<Object>} - A promise that resolves with an object containing all fields
     *                              from the 'Registrati' table for the specified user.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Registrati WHERE username = ?`;
            this.open();
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
            this.close();
        });
    }




    /**
     * Saves a response to a review in the database.
     * 
     * @param {string} scrittore - The username of the user who wrote the review.
     * @param {number} ristorante - The id of the restaurant that was reviewed.
     * @param {string} proprietario - The username of the owner of the restaurant.
     * @param {string} testo - The text of the response.
     * 
     * @returns {Promise<void>} - A promise that resolves when the response has been saved.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    salvaRispostaAllaRecensione(scrittore, ristorante, proprietario, testo) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Risposte (scrittorerecensione, ristorante, proprietario, testo) 
                        VALUES (?, ?, ?, ?)`;
            this.open();
            this.db.run(sql, [scrittore, ristorante, proprietario, testo], (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
            this.close();
        });
    }

    /**
     * Checks if a response has already been made by the owner to a specific review.
     * 
     * @param {string} scrittore - The username of the user who wrote the review.
     * @param {number} ristoranteId - The id of the restaurant that was reviewed.
     * @param {string} proprietario - The username of the owner of the restaurant.
     * 
     * @returns {Promise<boolean>} - A promise that resolves to true if a response exists, false otherwise.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    haRisposto(scrittore, ristoranteId, proprietario) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Risposte WHERE scrittorerecensione = ? AND ristorante = ? AND proprietario = ?`;
            this.open();
            this.db.get(sql, [scrittore, ristoranteId, proprietario], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row !== undefined);
            });
            this.close();
        });
    }


    /**
     * Retrieves all the responses made by a specific user.
     * 
     * @param {string} username - The username of the user to query.
     * 
     * @returns {Promise<Object[]>} - A promise that resolves to an array of objects, each containing 
     *                                all columns from the 'Risposte' table and joined with the 'Ristoranti' table.
     * 
     * @throws Will reject the promise if there is an error with the database query.
     */
    getRisposteUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Risposte JOIN Ristoranti ON ristorante = id WHERE scrittorerecensione = ? `;
            this.open();
            this.db.all(sql, [username], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
            this.close();
        });
    }


    
}


module.exports = DataBase;