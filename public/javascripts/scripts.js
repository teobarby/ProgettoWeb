// Assicurati che il documento sia pronto prima di eseguire script
document.addEventListener("DOMContentLoaded", function() {



    const loadMoreButton = document.getElementById('loadMoreReviews');
    let visibleCount = 4; // Numero iniziale di recensioni visibili
    const increment = 2; // Numero di recensioni da mostrare ad ogni click
    const reviews = document.querySelectorAll('.recensione-item'); // Seleziona tutte le recensioni

    loadMoreButton.addEventListener('click', function() {
        // Mostra solo il numero successivo di recensioni specificato da "increment"
        for (let i = visibleCount; i < visibleCount + increment; i++) {
            if (i < reviews.length) {
                reviews[i].classList.remove('d-none'); // Rimuovi la classe per mostrare l'elemento
            }
        }
        visibleCount += increment;

        // Se tutte le recensioni sono state mostrate, nascondi il bottone
        if (visibleCount >= reviews.length) {
            loadMoreButton.style.display = 'none';
        }
    });

    // Gestione del form di prenotazione
    var formPrenotazione = document.querySelector('#prenotaModal form');
    if (formPrenotazione) {
        formPrenotazione.addEventListener('submit', function(event) {
            event.preventDefault();
            // Logica di invio della prenotazione
            alert('Prenotazione inviata!');
        });
    }

    


   
});


const replyButtons = document.querySelectorAll('.btn-outline-primary'); // Seleziona i pulsanti di risposta

// Aggiunge un event listener a ogni pulsante
if (replyButtons) {
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recensioneId = this.getAttribute('data-recensione-id'); // Ottiene l'ID della recensione
            const scrittore = this.closest('.recensione-item').getAttribute('data-scrittore'); // Ottiene lo scrittore

            // Popola il campo nascosto con l'ID della recensione
            document.getElementById('recensioneId').value = recensioneId;

            // Mostra la modale
            const replyModal = new bootstrap.Modal(document.getElementById('replyModal'));
            replyModal.show();
        });
    });
}

// Gestisce l'invio del form
const replyForm = document.getElementById('replyForm');
if (replyForm) {
    replyForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Previene l'invio del form

        const replyMessage = document.getElementById('replyMessage').value; // Ottiene il messaggio di risposta
        const recensioneId = document.getElementById('recensioneId').value; // Ottiene l'ID della recensione

        // Effettua una richiesta POST per inviare la risposta
        fetch(`/inviaRisposta/${recensioneId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ replyMessage }), // Invia il messaggio nel corpo
        })
        .then(response => {
            if (response.ok) {
                // Gestisci la risposta positiva
                console.log('Risposta inviata con successo.');
                const modal = bootstrap.Modal.getInstance(document.getElementById('replyModal'));
                modal.hide();
                // Potresti voler aggiornare la vista o ricaricare i dati della recensione
            } else {
                // Gestisci errori
                console.error('Errore durante l\'invio della risposta.');
            }
        })
        .catch(error => console.error('Si è verificato un errore:', error));
    });
}


