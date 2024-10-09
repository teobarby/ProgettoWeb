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

    


    

    
    
});



