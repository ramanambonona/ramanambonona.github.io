// Get the button
const mybutton = document.getElementById('btn-haut');
const THRESHOLD = 200; // px avant d'afficher le bouton

function toggleBackToTop() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    if (scrolled > THRESHOLD) {
        mybutton.classList.add('show');
    } else {
        mybutton.classList.remove('show');
    }
}

function backToTop(e) {
    e.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && 'scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo(0, 0);
    }
}

window.addEventListener('scroll', toggleBackToTop, { passive: true });
mybutton.addEventListener('click', backToTop);

toggleBackToTop();

// Code pour les abstracts (ajouté)
document.addEventListener('DOMContentLoaded', function() {
    const absButtons = document.querySelectorAll('.btn-transparent[data-abstract-id]');

    absButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Empêche le lien de recharger la page
            const abstractId = this.getAttribute('data-abstract-id');
            const abstractText = document.getElementById(abstractId);

            if (abstractText) {
                // Cache tous les abstracts ouverts sauf celui-ci
                document.querySelectorAll('.abstract-text').forEach(abs => {
                    if (abs.id !== abstractId && abs.style.display === 'block') {
                        abs.style.display = 'none';
                    }
                });

                // Toggle l'affichage de l'abstract cliqué
                if (abstractText.style.display === 'none' || abstractText.style.display === '') {
                    abstractText.style.display = 'block';
                } else {
                    abstractText.style.display = 'none';
                }
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Récupère les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    // Sélectionne le conteneur où l'iframe sera inséré
    const viewerContainer = document.getElementById('html-viewer');
    const loadingMessage = document.getElementById('loading-message');

    if (page && viewerContainer) {
        // Crée une nouvelle balise iframe
        const iframe = document.createElement('iframe');
        iframe.src = page;
        iframe.style.width = '100%';
        iframe.style.minHeight = '800px'; 
        iframe.style.border = '1px solid #e9ecef';
        iframe.style.borderRadius = '5px';
        iframe.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
        
        // Supprime le message de chargement et ajoute l'iframe
        if (loadingMessage) {
            loadingMessage.remove();
        }
        viewerContainer.appendChild(iframe);
    } else if (viewerContainer && loadingMessage) {
        // Affiche un message si aucun fichier n'est spécifié
        loadingMessage.textContent = 'Aucune ressource à afficher.';
    }
});

// Initialisation de GSAP pour les animations de la page Tools
document.addEventListener('DOMContentLoaded', function() {
    // Enregistre le plugin ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Animation des cartes de cours
    gsap.utils.toArray('.course-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out'
        });
    });

    // Rafraîchir ScrollTrigger après le chargement
    setTimeout(() => ScrollTrigger.refresh(), 500);
});