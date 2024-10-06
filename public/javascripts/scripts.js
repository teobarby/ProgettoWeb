// Assicurati che il documento sia pronto prima di eseguire script
document.addEventListener("DOMContentLoaded", function() {

    // Prenotazione - Modal
    var prenotaModal = document.getElementById('prenotaModal');
    if (prenotaModal) {
        prenotaModal.addEventListener('show.bs.modal', function (event) {
            // Puoi aggiungere qualsiasi logica qui per pre-popolare i campi del modal se necessario
        });
    }

    // Risposta alla recensione - Modal
    var replyModal = document.getElementById('replyModal');
    if (replyModal) {
        replyModal.addEventListener('show.bs.modal', function (event) {
            // Aggiungi logica per pre-popolare il modal con i dettagli della recensione
        });
    }

    var eliminaModal = document.getElementById('eliminaModal');
    if (eliminaModal) {
        eliminaModal.addEventListener('show.bs.modal', function (event) {
            // Aggiungi logica per pre-popolare il modal con i dettagli della recensione
        });
    }

    // Modal per aggiungere una recensione
    var recensioneModal = document.getElementById('recensioneModal');
    if (recensioneModal) {
        recensioneModal.addEventListener('show.bs.modal', function (event) {
            // Reset dei campi quando si apre il modal
            document.getElementById('nomeUtente').value = '';
            document.getElementById('titoloRecensione').value = '';
            document.getElementById('testoRecensione').value = '';
        });
    }

    // Funzione per caricare più recensioni (puoi implementare una chiamata Ajax qui)
    var loadMoreReviewsButton = document.getElementById('loadMoreReviews');
    if (loadMoreReviewsButton) {
        loadMoreReviewsButton.addEventListener('click', function() {
            // Esempio: carica altre recensioni tramite Ajax o mostra altre recensioni già caricate
            alert('Altre recensioni caricate!');
        });
    }

    // Formato minimo per la data di prenotazione (imposta la data odierna come minimo)
    var dataPrenotazioneInput = document.getElementById('dataPrenotazione');
    if (dataPrenotazioneInput) {
        var today = new Date().toISOString().split('T')[0];
        dataPrenotazioneInput.setAttribute('min', today);
    }

    // Gestione del form di prenotazione
    var formPrenotazione = document.querySelector('#prenotaModal form');
    if (formPrenotazione) {
        formPrenotazione.addEventListener('submit', function(event) {
            event.preventDefault();
            // Logica di invio della prenotazione
            alert('Prenotazione inviata!');
        });
    }

    // Gestione del form per inviare recensioni
    var formRecensione = document.querySelector('#recensioneModal form');
    if (formRecensione) {
        formRecensione.addEventListener('submit', function(event) {
            event.preventDefault();
            // Logica di invio della recensione
            alert('Recensione inviata!');
        });
    }

    document.getElementById('confirmDeleteButton').addEventListener('click', function() {
        const username = this.getAttribute('data-username');  // Ottiene l'username dall'attributo data-username
        console.log('Eliminazione richiesta per:', username);  // Log per controllare l'username

        fetch(`/delete-user/${username}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Utente eliminato con successo.');
                window.location.href = '/';  // Redirigi dopo l'eliminazione
            } else {
                return response.json().then(data => { throw new Error(data.message); });
            }
        })
        .catch(error => {
            console.error('Errore durante l\'eliminazione:', error);
            alert('Errore durante l\'eliminazione: ' + error.message);
        });
    });
});



