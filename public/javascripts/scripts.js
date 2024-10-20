document.addEventListener("DOMContentLoaded", function() {



    const loadMoreButton = document.getElementById('loadMoreReviews');
    let visibleCount = 4; 
    const increment = 2;
    const reviews = document.querySelectorAll('.recensione-item');

    loadMoreButton.addEventListener('click', function() {
        for (let i = visibleCount; i < visibleCount + increment; i++) {
            if (i < reviews.length) {
                reviews[i].classList.remove('d-none'); 
            }
        }
        visibleCount += increment;

        if (visibleCount >= reviews.length) {
            loadMoreButton.style.display = 'none';
        }
    });

    var formPrenotazione = document.querySelector('#prenotaModal form');
    if (formPrenotazione) {
        formPrenotazione.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Prenotazione inviata!');
        });
    }

    


   
});


const replyButtons = document.querySelectorAll('.btn-outline-primary');

if (replyButtons) {
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recensioneId = this.getAttribute('data-recensione-id');
            const scrittore = this.closest('.recensione-item').getAttribute('data-scrittore');

            document.getElementById('recensioneId').value = recensioneId;

            const replyModal = new bootstrap.Modal(document.getElementById('replyModal'));
            replyModal.show();
        });
    });
}

const replyForm = document.getElementById('replyForm');
if (replyForm) {
    replyForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const replyMessage = document.getElementById('replyMessage').value;
        const recensioneId = document.getElementById('recensioneId').value;

        fetch(`/inviaRisposta/${recensioneId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ replyMessage }), 
        })
        .then(response => {
            if (response.ok) {
                console.log('Risposta inviata con successo.');
                const modal = bootstrap.Modal.getInstance(document.getElementById('replyModal'));
                modal.hide();
            } else {
                console.error('Errore durante l\'invio della risposta.');
            }
        })
        .catch(error => console.error('Si è verificato un errore:', error));
    });
}


