/* ============================================================
   PAINTBALL HOUSE BARRANQUILLA — main.js
   Legendary Interactions | Version 2.0
   ============================================================ */

'use strict';

// ═══════════════════════════════════════════════════════════
//  1. LOADER — Tactical boot sequence
// ═══════════════════════════════════════════════════════════
(function initLoader() {
  const loader    = document.getElementById('loader');
  const bar       = document.getElementById('loaderBar');
  const statusEl  = document.getElementById('loaderStatus');

  const messages = [
    'INICIANDO SISTEMA...',
    'CARGANDO CAMPOS DE BATALLA...',
    'CALIBRANDO MARCADORAS...',
    'ACTIVANDO ESCUADRÓN...',
    'LISTO PARA EL COMBATE.'
  ];

  let progress = 0;
  let msgIndex = 0;

  const interval = setInterval(() => {
    // Randomize increment for realistic feel
    progress += Math.random() * 18 + 8;
    if (progress > 100) progress = 100;

    bar.style.width = progress + '%';

    // Change status message
    const msgStep = Math.floor((progress / 100) * messages.length);
    if (msgStep < messages.length && msgStep !== msgIndex) {
      msgIndex = msgStep;
      statusEl.textContent = messages[msgIndex];
    }

    if (progress >= 100) {
      clearInterval(interval);
      statusEl.textContent = messages[messages.length - 1];
      setTimeout(() => {
        loader.classList.add('hidden');
        // Trigger hero animations after loader
        document.body.classList.add('loaded');
        startTypingEffect();
        startCounterAnimations();
      }, 500);
    }
  }, 80);
})();


// ═══════════════════════════════════════════════════════════
//  2. CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Click burst
  document.addEventListener('click', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(2.5)';
    dot.style.opacity   = '0.4';
    setTimeout(() => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
      dot.style.opacity   = '1';
    }, 200);
  });
})();


// ═══════════════════════════════════════════════════════════
//  3. PARTICLE CANVAS — Floating paintball particles
// ═══════════════════════════════════════════════════════════
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Particle class
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 20;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY  = -(Math.random() * 0.6 + 0.2);
      this.speedX  = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.pulse   = Math.random() * Math.PI * 2; // phase offset
      // Color: mostly cyan, sometimes blue
      this.color = Math.random() > 0.3
        ? `rgba(0, 245, 255, ${this.opacity})`
        : `rgba(0, 71, 255, ${this.opacity})`;
    }

    update() {
      this.pulse += 0.02;
      this.x += this.speedX + Math.sin(this.pulse) * 0.2;
      this.y += this.speedY;
      if (this.y < -20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity * (0.8 + Math.sin(this.pulse) * 0.2);
      ctx.fillStyle   = this.color;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur  = this.size * 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  const PARTICLE_COUNT = Math.min(80, Math.floor(W * H / 14000));
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw faint connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 120) * 0.08;
          ctx.strokeStyle = '#00f5ff';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
})();


// ═══════════════════════════════════════════════════════════
//  4. TYPING EFFECT — Hero tagline
// ═══════════════════════════════════════════════════════════
function startTypingEffect() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'La batalla más épica del Caribe.',
    'Adrenalina pura. Equipo premium.',
    'Tu siguiente misión te espera.',
    'Paintball de élite en Barranquilla.'
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let delay       = 100;

  function type() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      delay = 50;
    } else {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      delay = 80;
    }

    if (!isDeleting && charIndex === current.length) {
      delay      = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting  = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay       = 400;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 300);
}


// ═══════════════════════════════════════════════════════════
//  5. COUNTER ANIMATIONS — Animate numbers up
// ═══════════════════════════════════════════════════════════
function startCounterAnimations() {
  const counters = document.querySelectorAll('[data-count]');

  counters.forEach(el => {
    const target   = parseInt(el.getAttribute('data-count'));
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutExpo
      const eased = 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}


// ═══════════════════════════════════════════════════════════
//  6. SCROLL REVEAL — Intersection Observer
// ═══════════════════════════════════════════════════════════
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


// ═══════════════════════════════════════════════════════════
//  7. NAVBAR — Scroll behavior & active section highlighting
// ═══════════════════════════════════════════════════════════
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active section
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');

    // Animate hamburger spans
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('open')) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger?.classList.remove('open');
      const spans = hamburger?.querySelectorAll('span');
      if (spans) {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });
  });
})();


// ═══════════════════════════════════════════════════════════
//  8. MOUSE GLOW EFFECT on cards
// ═══════════════════════════════════════════════════════════
(function initCardGlow() {
  const cards = document.querySelectorAll('.price-card, .service-card, .team-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width) * 100;
      const y    = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
})();


// ═══════════════════════════════════════════════════════════
//  9. CONTACT FORM — Submit handler + toast
// ═══════════════════════════════════════════════════════════
(function initContactForm() {
  const form  = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate
    const inputs = form.querySelectorAll('[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'rgba(255,80,80,0.6)';
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
      }
    });

    if (!valid) return;

    // Simulate sending
    const submitBtn = form.querySelector('.cf-submit .btn-text');
    if (submitBtn) submitBtn.textContent = 'ENVIANDO...';

    setTimeout(() => {
      if (submitBtn) submitBtn.textContent = 'ENVIAR MISIÓN';
      form.reset();
      showToast('🎯 ¡Misión recibida! Te contactamos pronto. ¡Prepárate para la batalla!');
    }, 1400);
  });

  function showToast(message) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  }
})();


// ═══════════════════════════════════════════════════════════
//  10. SMOOTH SCROLL — Enhanced for anchor links
// ═══════════════════════════════════════════════════════════
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navH   = document.getElementById('navbar')?.offsetHeight || 80;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();


// ═══════════════════════════════════════════════════════════
//  11. GALLERY — Parallax tilt effect on hover
// ═══════════════════════════════════════════════════════════
(function initGalleryTilt() {
  const items = document.querySelectorAll('.gallery-item');

  items.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
})();


// ═══════════════════════════════════════════════════════════
//  12. HERO STATS — Re-trigger counters when in view
// ═══════════════════════════════════════════════════════════
(function initHeroStatsObserver() {
  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;

  const counters = heroStats.querySelectorAll('[data-count]');
  let triggered  = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;

        counters.forEach(el => {
          const target   = parseInt(el.getAttribute('data-count'));
          const duration = 2000;
          const start    = performance.now();

          function update(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(update);
          }

          requestAnimationFrame(update);
        });
      }
    });
  }, { threshold: 0.5 });

  observer.observe(heroStats);
})();


// ═══════════════════════════════════════════════════════════
//  13. ABOUT MINI COUNTERS — Animate when section in view
// ═══════════════════════════════════════════════════════════
(function initAboutCounters() {
  const aboutSection = document.getElementById('nosotros');
  if (!aboutSection) return;

  const miniNums = aboutSection.querySelectorAll('.mini-num[data-count]');
  let triggered  = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;

        miniNums.forEach(el => {
          const target   = parseInt(el.getAttribute('data-count'));
          const duration = 1600;
          const start    = performance.now();

          function update(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(update);
          }

          requestAnimationFrame(update);
        });
      }
    });
  }, { threshold: 0.4 });

  observer.observe(aboutSection);
})();


// ═══════════════════════════════════════════════════════════
//  14. CURSOR ACTIVE STATE — Style on interactive elements
// ═══════════════════════════════════════════════════════════
(function initCursorInteractivity() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  const interactives = document.querySelectorAll('a, button, .service-card, .team-card, .gallery-item, .price-card');

  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform  = 'translate(-50%, -50%) scale(0.4)';
      ring.style.width     = '50px';
      ring.style.height    = '50px';
      ring.style.borderColor = 'rgba(0,245,255,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform  = 'translate(-50%, -50%) scale(1)';
      ring.style.width     = '34px';
      ring.style.height    = '34px';
      ring.style.borderColor = 'rgba(0,245,255,0.55)';
    });
  });
})();


// ═══════════════════════════════════════════════════════════
//  15. SECTION LABELS — Scramble text effect on hover
// ═══════════════════════════════════════════════════════════
(function initTextScramble() {
  const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  const labels = document.querySelectorAll('.section-eyebrow');

  labels.forEach(label => {
    const original = label.textContent;
    let frame      = 0;
    let running    = false;

    label.addEventListener('mouseenter', () => {
      if (running) return;
      running = true;
      frame   = 0;

      const iterations = original.length;

      const interval = setInterval(() => {
        label.textContent = original
          .split('')
          .map((char, i) => {
            if (char === ' ' || char === '/' || char === '.') return char;
            if (i < frame) return original[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        frame += 0.5;

        if (frame >= iterations) {
          label.textContent = original;
          clearInterval(interval);
          running = false;
        }
      }, 30);
    });
  });
})();


// ═══════════════════════════════════════════════════════════
//  16. PERFORMANCE — Pause particles when tab hidden
// ═══════════════════════════════════════════════════════════
(function initVisibilityOptimization() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  document.addEventListener('visibilitychange', () => {
    canvas.style.opacity = document.hidden ? '0' : '0.45';
  });
})();


// ═══════════════════════════════════════════════════════════
//  17. BACK TO TOP — Keyboard shortcut (Alt + T)
// ═══════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 't') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (e.key === 'Escape') {
    const navLinks  = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    navLinks?.classList.remove('open');
    hamburger?.classList.remove('open');
  }
});

// ═══════════════════════════════════════════════════════════
//  CONSOLE SIGNATURE
// ═══════════════════════════════════════════════════════════
console.log('%c🎯 PAINTBALL HOUSE BARRANQUILLA', 'color: #00f5ff; font-size: 1.2rem; font-weight: bold; text-shadow: 0 0 10px #00f5ff;');
console.log('%c// Combat Zone — Version 2.0 — Est. 2016', 'color: #004d55; font-size: 0.8rem;');