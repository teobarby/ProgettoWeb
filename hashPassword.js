const bcrypt = require('bcrypt');
const saltRounds = 10; 
const plainPassword = 'prova';

//funzione per testare l'hashing delle password, non utilizzata nel sito web
bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    if (err) {
        console.error("Errore durante l'hashing:", err);
    } else {
        console.log("Password hashata:", hashedPassword);
    }
});