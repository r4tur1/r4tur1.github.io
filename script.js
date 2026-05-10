/**
 * r4tur1 — Portfolio JavaScript
 * Author: Aaditya Raturi
 *
 * Sections:
 *   1. Theme System
 *   2. Navigation (scroll behaviour)
 *   3. Scroll Reveal
 *   4. Skill Bars (Intersection Observer)
 *   5. Contact Form
 *   6. Smooth anchor scrolling (offset for nav)
 */

/* ─── 1. THEME SYSTEM ──────────────────────────────── */

const html          = document.documentElement;
const themeToggle   = document.getElementById('themeToggle');
const themeLabel    = document.getElementById('themeLabel');
const themeOverlay  = document.getElementById('themeOverlay');
const jungleLayer   = document.getElementById('jungleLayer');
const bubbleLayer   = document.getElementById('bubbleLayer');

const THEMES = {
  midnight: {
    label:     'Forest',
    next:      'forest',
    animation: 'jungle',   // animation TO show when switching FROM midnight
  },
  forest: {
    label:     'Midnight',
    next:      'midnight',
    animation: 'bubble',   // animation TO show when switching FROM forest
  },
};

function getStoredTheme() {
  try { return localStorage.getItem('r4tur1-theme') || 'forest'; }
  catch { return 'forest'; }
}

function storeTheme(theme) {
  try { localStorage.setItem('r4tur1-theme', theme); } catch {}
}

function applyTheme(theme, animate = false) {
  const config = THEMES[theme];
  if (!config) return;

  if (!animate) {
    html.dataset.theme = theme;
    themeLabel.textContent = config.label;
    storeTheme(theme);
    return;
  }

  // Determine which animation to run
  const currentTheme = html.dataset.theme;
  const animType     = THEMES[currentTheme]?.animation || 'jungle';

  // Lock scroll
  document.body.style.overflow = 'hidden';

  // Activate overlay and correct animation layer
  themeOverlay.classList.add('active');
  jungleLayer.classList.remove('active');
  bubbleLayer.classList.remove('active');

  if (animType === 'jungle') {
    jungleLayer.classList.add('active');
  } else {
    bubbleLayer.classList.add('active');
  }

  // Swap theme after animation is well underway
  setTimeout(() => {
    html.dataset.theme = theme;
    themeLabel.textContent = config.label;
    storeTheme(theme);
  }, 700);

  // Clean up overlay
  setTimeout(() => {
    themeOverlay.classList.remove('active');
    jungleLayer.classList.remove('active');
    bubbleLayer.classList.remove('active');
    document.body.style.overflow = '';
  }, 1600);
}

// Init theme on load (no animation)
applyTheme(getStoredTheme(), false);

// Toggle on click
themeToggle.addEventListener('click', () => {
  const current = html.dataset.theme;
  const next    = THEMES[current]?.next || 'midnight';
  applyTheme(next, true);
});


/* ─── 2. NAVIGATION ────────────────────────────────── */

const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  // Add shadow / background opacity on scroll with smooth transition
  if (currentScroll > 40) {
    nav.style.boxShadow = '0 2px 24px rgba(0,0,0,0.35)';
  } else {
    nav.style.boxShadow = 'none';
  }

  // Hide nav on scroll down, show on scroll up with enhanced easing
  if (currentScroll > lastScroll && currentScroll > 120) {
    nav.style.transform = 'translateY(-100%)';
    nav.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  } else {
    nav.style.transform = 'translateY(0)';
    nav.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  lastScroll = currentScroll;
}, { passive: true });


//* ─── 3. SCROLL REVEAL ─────────────────────────── */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 40);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Stagger reveals for visual effect
let revealIndex = 0;

// Observe section headings and content blocks
const revealElements = document.querySelectorAll(
  '.section-heading, .about__para, .about__stats, .skill-card, .project-card, .social-link, .contact-form, .contact__sub'
);
revealElements.forEach((el, index) => {
  el.dataset.reveal = '';
  revealObserver.observe(el);
});

// Also observe hero elements that aren't handled by CSS animation
document.querySelectorAll('[data-reveal]').forEach(el => {
  revealObserver.observe(el);
});


/* ─── 4. SKILL BARS ────────────────────────────────── */

// Skill bars animate their width from 0 to --fill when they enter view
const skillBarObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-card__fill');
        if (fill) {
          const target = fill.style.getPropertyValue('--fill');
          fill.style.setProperty('--fill', '0%');

          setTimeout(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                fill.style.setProperty('--fill', target);
              });
            });
          }, index * 60);
        }
        skillBarObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.skill-card').forEach(card => {
  // Store initial fill value, reset to 0 for animation
  const fill = card.querySelector('.skill-card__fill');
  if (fill) {
    const originalFill = fill.style.getPropertyValue('--fill') || getComputedStyle(fill).getPropertyValue('--fill');
    fill.dataset.targetFill = originalFill.trim();
    fill.style.setProperty('--fill', '0%');
  }
  skillBarObserver.observe(card);
});

// Override the observer to use data-targetFill
const skillCards = document.querySelectorAll('.skill-card');

const skillBarObserver2 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-card__fill');
        if (fill && fill.dataset.targetFill) {
          setTimeout(() => {
            fill.style.setProperty('--fill', fill.dataset.targetFill);
          }, 150 + index * 50);
        }
        skillBarObserver2.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

skillCards.forEach((card, index) => {
  skillBarObserver2.observe(card);
});


/* ─── 5. CONTACT FORM ──────────────────────────────── */

function showFormNote(message, type) {
  const formNote = document.getElementById('formNote');
  if (!formNote) return;

  formNote.textContent = message;
  formNote.className   = `form-note dm-mono ${type}`;

  clearTimeout(formNote._timeout);
  formNote._timeout = setTimeout(() => {
    formNote.textContent = '';
    formNote.className   = 'form-note dm-mono';
  }, 5000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name      = document.getElementById('name').value.trim();
    const email     = document.getElementById('email').value.trim();
    const message   = document.getElementById('message').value.trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Validation
    if (!name || !email || !message) {
      showFormNote('Please fill in all fields.', 'error');
      submitBtn.style.animation = 'pulse-glow 0.8s ease-in-out';
      return;
    }

    if (!isValidEmail(email)) {
      showFormNote('Please enter a valid email address.', 'error');
      submitBtn.style.animation = 'pulse-glow 0.8s ease-in-out';
      return;
    }

    // Send with enhanced feedback
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;
    submitBtn.style.animation = 'pulse-glow 1.5s ease-in-out';

    fetch('https://formspree.io/f/xvzvbvek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, email, message }),
    })
      .then(res => {
        if (res.ok) {
          showFormNote("Message sent! I'll get back to you soon.", 'success');
          contactForm.reset();
        } else {
          if (res.status === 403) {
            showFormNote('Submission blocked. Please disable reCAPTCHA in Formspree settings for AJAX support.', 'error');
          } else {
            showFormNote('Something went wrong. Try again.', 'error');
          }
        }
      })
      .catch(() => showFormNote('Network error. Try again.', 'error'))
      .finally(() => {
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled    = false;
        submitBtn.style.animation = '';
      });

  }); // closes addEventListener
}    // closes if (contactForm)


/* ─── 6. SMOOTH ANCHOR SCROLLING ───────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = 64;
    const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  });
});