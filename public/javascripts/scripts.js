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



