/**
 * r4tur1 — Portfolio JavaScript
 * Author: Aaditya Raturi
 */

/* ─── THEME SYSTEM ──────────────────────────────── */

const themeSystem = {
    html: document.documentElement,
    toggle: document.getElementById('themeToggle'),
    label: document.getElementById('themeLabel'),
    overlay: document.getElementById('themeOverlay'),
    layers: {
        jungle: document.getElementById('jungleLayer'),
        bubble: document.getElementById('bubbleLayer')
    },
    config: {
        midnight: { label: 'Forest', next: 'forest', animation: 'jungle' },
        forest: { label: 'Midnight', next: 'midnight', animation: 'bubble' }
    },

    init() {
        const savedTheme = localStorage.getItem('r4tur1-theme') || 'forest';
        this.apply(savedTheme, false);
        this.toggle.addEventListener('click', () => this.toggleTheme());
    },

    apply(theme, animate = false) {
        const config = this.config[theme];
        if (!config) return;

        if (!animate) {
            this.html.dataset.theme = theme;
            this.label.textContent = config.label;
            localStorage.setItem('r4tur1-theme', theme);
            return;
        }

        const currentTheme = this.html.dataset.theme;
        const animType = this.config[currentTheme]?.animation || 'jungle';

        document.body.style.overflow = 'hidden';
        this.overlay.classList.add('active');
        
        Object.values(this.layers).forEach(layer => layer.classList.remove('active'));
        this.layers[animType].classList.add('active');

        setTimeout(() => {
            this.html.dataset.theme = theme;
            this.label.textContent = config.label;
            localStorage.setItem('r4tur1-theme', theme);
        }, 700);

        setTimeout(() => {
            this.overlay.classList.remove('active');
            Object.values(this.layers).forEach(layer => layer.classList.remove('active'));
            document.body.style.overflow = '';
        }, 1600);
    },

    toggleTheme() {
        const current = this.html.dataset.theme;
        const next = this.config[current]?.next || 'midnight';
        this.apply(next, true);
    }
};

/* ─── NAVIGATION ────────────────────────────────── */

const navigation = {
    nav: document.getElementById('nav'),
    lastScroll: 0,

    init() {
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    },

    handleScroll() {
        const currentScroll = window.scrollY;
        
        // Shadow on scroll
        this.nav.style.boxShadow = currentScroll > 40 ? '0 2px 24px rgba(0,0,0,0.35)' : 'none';

        // Hide/Show on scroll
        if (currentScroll > this.lastScroll && currentScroll > 120) {
            this.nav.style.transform = 'translateY(-100%)';
        } else {
            this.nav.style.transform = 'translateY(0)';
        }

        this.lastScroll = currentScroll;
    }
};

/* ─── INTERSECTION OBSERVERS ────────────────────── */

const observers = {
    init() {
        this.setupReveal();
        this.setupSkillBars();
    },

    setupReveal() {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 40);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        const elements = document.querySelectorAll('.section-heading, .about__para, .about__stats, .skill-card, .project-card, .social-link, .contact-form, .contact__sub, [data-reveal]');
        elements.forEach(el => revealObserver.observe(el));
    },

    setupSkillBars() {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    const fill = entry.target.querySelector('.skill-card__fill');
                    if (fill && fill.dataset.targetFill) {
                        setTimeout(() => {
                            fill.style.setProperty('--fill', fill.dataset.targetFill);
                        }, 150 + index * 50);
                    }
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.skill-card').forEach(card => {
            const fill = card.querySelector('.skill-card__fill');
            if (fill) {
                const target = fill.style.getPropertyValue('--fill') || '0%';
                fill.dataset.targetFill = target.trim();
                fill.style.setProperty('--fill', '0%');
            }
            skillObserver.observe(card);
        });
    }
};

/* ─── CONTACT FORM ──────────────────────────────── */

const contactForm = {
    form: document.getElementById('contactForm'),
    note: document.getElementById('formNote'),

    init() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    showNote(message, type) {
        this.note.textContent = message;
        this.note.className = `form-note dm-mono ${type}`;
        
        clearTimeout(this.note._timeout);
        this.note._timeout = setTimeout(() => {
            this.note.textContent = '';
            this.note.className = 'form-note dm-mono';
        }, 5000);
    },

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        const submitBtn = this.form.querySelector('button[type="submit"]');

        if (!data.name || !data.email || !data.message) {
            this.showNote('Please fill in all fields.', 'error');
            return;
        }

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showNote("Message sent! I'll get back to you soon.", 'success');
                this.form.reset();
            } else {
                this.showNote('Something went wrong. Try again.', 'error');
            }
        } catch (error) {
            this.showNote('Network error. Try again.', 'error');
        } finally {
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }
    }
};

/* ─── INITIALIZATION ────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    themeSystem.init();
    navigation.init();
    observers.init();
    contactForm.init();

    // Smooth scrolling for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navHeight = 64;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - navHeight,
                behavior: 'smooth'
            });
        });
    });
});
