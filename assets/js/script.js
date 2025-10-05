// =======================
// Back to top
// =======================
const mybutton = document.getElementById('btn-haut');
const THRESHOLD = 200; // px before showing the button

function toggleBackToTop() {
  const scrolled = window.scrollY || document.documentElement.scrollTop;
  if (scrolled > THRESHOLD) {
    if (mybutton) mybutton.classList.add('show');
  } else {
    if (mybutton) mybutton.classList.remove('show');
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
if (mybutton) mybutton.addEventListener('click', backToTop);
toggleBackToTop();


// =======================
// Highlight current menu link (active)
// =======================
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('header nav a');

  // Normalize a path: drop query/hash, collapse trailing slashes, map /index.html -> /
  const normalize = (path) => {
    try {
      path = path.split('?')[0].split('#')[0];
      path = path.replace(/\/index\.html$/i, '/');
      path = path.replace(/\/+$/, '/');
      return path;
    } catch (e) {
      return path;
    }
  };

  const current = normalize(window.location.pathname);

  navLinks.forEach(a => {
    const hrefPath = normalize(new URL(a.getAttribute('href'), window.location.origin).pathname);
    if (hrefPath === current) {
      a.classList.add('active'); // CSS will render it with 3D plastic gray style
    } else {
      a.classList.remove('active');
    }
  });
});


// =======================
// Toggle abstracts (buttons .btn-transparent[data-abstract-id])
// =======================
document.addEventListener('DOMContentLoaded', function() {
  const absButtons = document.querySelectorAll('.btn-transparent[data-abstract-id]');

  absButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const abstractId = this.getAttribute('data-abstract-id');
      const abstractText = document.getElementById(abstractId);

      if (abstractText) {
        // Close other open abstracts
        document.querySelectorAll('.abstract-text').forEach(abs => {
          if (abs.id !== abstractId && abs.style.display === 'block') {
            abs.style.display = 'none';
          }
        });

        // Toggle the clicked abstract
        if (abstractText.style.display === 'none' || abstractText.style.display === '') {
          abstractText.style.display = 'block';
        } else {
          abstractText.style.display = 'none';
        }
      }
    });
  });
});


// =======================
// HTML viewer via ?page=... (optional widget on some pages)
// =======================
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');

  const viewerContainer = document.getElementById('html-viewer');
  const loadingMessage = document.getElementById('loading-message');

  if (page && viewerContainer) {
    const iframe = document.createElement('iframe');
    iframe.src = page;
    iframe.style.width = '100%';
    iframe.style.minHeight = '800px';
    iframe.style.border = '1px solid #e9ecef';
    iframe.style.borderRadius = '5px';
    iframe.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';

    if (loadingMessage) loadingMessage.remove();
    viewerContainer.appendChild(iframe);
  } else if (viewerContainer && loadingMessage) {
    loadingMessage.textContent = 'No resource to display.';
  }
});


// =======================
// GSAP animations (for .course-card lists)
// =======================
document.addEventListener('DOMContentLoaded', function() {
  if (!(window.gsap && window.ScrollTrigger)) return;

  gsap.registerPlugin(ScrollTrigger);

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

  setTimeout(() => ScrollTrigger.refresh(), 500);
});


// =======================
// Tools modal (iOS-ready, vh fix, safe-areas, scroll-lock, PiP, iFrameResizer)
// Only used if a link has data-modal="true"
// =======================
document.addEventListener('DOMContentLoaded', () => {
  const modal  = document.getElementById('tool-modal');
  if (!modal) return;

  const dialog   = modal.querySelector('.modal__dialog');
  const iframe   = document.getElementById('tool-frame');
  const btnClose = document.getElementById('btn-close');
  const btnPip   = document.getElementById('btn-pip');

  // 1) iOS 100vh fix
  function setVhVar() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVhVar();
  let vhTimer;
  function onResize() {
    clearTimeout(vhTimer);
    vhTimer = setTimeout(setVhVar, 150);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // 2) Scroll lock
  let scrollTop = 0;
  function lockScroll() {
    scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add('is-locked');
    document.body.style.top = `-${scrollTop}px`;
  }
  function unlockScroll() {
    document.body.classList.remove('is-locked');
    document.body.style.top = '';
    window.scrollTo(0, scrollTop);
  }

  // 3) iFrame Resizer (if present)
  function initIFrameResizer() {
    if (!window.iFrameResize || !iframe) return;
    if (iframe.iFrameResizer) {
      try { iframe.iFrameResizer.close(); } catch (e) {}
    }
    const once = () => {
      window.iFrameResize({
        log: false,
        checkOrigin: false,
        heightCalculationMethod: 'max',
        scrolling: true
      }, iframe);
      iframe.removeEventListener('load', once);
    };
    iframe.addEventListener('load', once);
  }

  // 4) Open / Close / PiP
  function openModal(href) {
    if (!iframe) return;
    iframe.src = href;
    modal.classList.add('is-open');
    lockScroll();

    if (window.gsap) {
      gsap.fromTo(dialog, { y: 24, opacity: 0, scale: 0.98 },
                          { y: 0,  opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' });
    }
    initIFrameResizer();
  }

  function closeModal() {
    const finish = () => {
      modal.classList.remove('is-open', 'pip');
      if (iframe) iframe.src = '';
      unlockScroll();
    };
    if (window.gsap) {
      gsap.to(dialog, { y: 16, opacity: 0, duration: 0.15, ease: 'power1.in', onComplete: finish });
    } else {
      finish();
    }
  }

  function togglePiP() {
    modal.classList.toggle('pip');
  }

  // 5) Wiring
  // IMPORTANT: Only intercept links explicitly marked with data-modal="true".
  document.querySelectorAll('.course-list .syllabus-link[data-modal="true"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      openModal(href);
    });
  });

  // Close when clicking the overlay (unless in PiP)
  modal.addEventListener('click', (e) => {
    if (e.target === modal && !modal.classList.contains('pip')) {
      closeModal();
    }
  });

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnPip)   btnPip.addEventListener('click', togglePiP);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
});
