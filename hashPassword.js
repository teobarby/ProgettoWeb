const bcrypt = require('bcrypt');
const saltRounds = 10; // Puoi modificare il numero di round di salatura, 10 è una buona pratica
const plainPassword = 'prova'; // Sostituisci con la password da hashare

bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    if (err) {
        console.error("Errore durante l'hashing:", err);
    } else {
        console.log("Password hashata:", hashedPassword);
    }
});