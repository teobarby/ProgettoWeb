document.getElementById('loadMoreReviews').addEventListener('click', function () {
    const reviewsContainer = document.getElementById('reviewsContainer');

    // Array di nuove recensioni (esempio)
    const newReviews = [
        {
            title: "Recensione di Carla22 - Pizza deliziosa!",
            rating: "★★★★★",
            content: "L'impasto era croccante e leggero, il condimento fresco e gustoso. Servizio impeccabile!"
        },
        {
            title: "Recensione di Luca89 - Buona esperienza",
            rating: "★★★★☆",
            content: "Ottima pizza, ma il servizio può essere migliorato. Comunque soddisfatto!"
        }
    ];

    // Ciclo per creare le nuove recensioni
    newReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('card', 'mb-3');
        reviewCard.style.cursor = 'pointer';
        reviewCard.setAttribute('data-bs-toggle', 'modal');
        reviewCard.setAttribute('data-bs-target', '#replyModal');
        
        reviewCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${review.title}</h5>
                <div class="d-flex align-items-center mb-2">
                    <span class="text-warning me-2">${review.rating}</span>
                    <span class="text-muted">5.0 su 5</span>
                </div>
                <p class="card-text">${review.content}</p>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });

});

    // Ottieni i riferimenti ai campi originali
    const nomeRistoranteInput = document.getElementById('nomeRistoranteInput');
    const menuPDFInput = document.getElementById('menuPDFInput');
    // Ottieni i riferimenti ai campi nel modal
    const nomeRistoranteModalInput = document.getElementById('nomeRistoranteModalInput');
    const menuPDFModalInput = document.getElementById('menuPDFModalInput');
    // Ottieni il riferimento al form del modal
    const modificaForm = document.getElementById('modificaForm');
    // Ottieni il riferimento al modal
    const modificaModal = new bootstrap.Modal(document.getElementById('modificaModal'));

    // Aggiungi un evento al pulsante "Modifica"
    document.getElementById('modificaButton').addEventListener('click', function() {
        // Popola i campi nel modal con i valori attuali
        nomeRistoranteModalInput.value = nomeRistoranteInput.value;
        // Popola altri campi se necessario
        // Apri il modal
        modificaModal.show();
    });

    
