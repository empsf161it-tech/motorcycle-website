/* ============================================================
   MAIN.JS — Navigation, Theme, RTL, Animations, Carousel
   ============================================================ */
'use strict';

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initNavbar();
  initScrollReveal();
  initCarousel();
  initCounters();
  initCaseDrag();
  initTypewriter();
  initParallax();
  setActiveNav();
  initNewsletter();
});

// ── Theme Toggle ───────────────────────────────────────────
function initTheme() {
  const html = document.documentElement;
  const stored = localStorage.getItem('apex-theme');

  if (stored) {
    html.setAttribute('data-theme', stored);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  const toggleBtns = document.querySelectorAll('.theme-toggle');
  toggleBtns.forEach(btn => {
    updateThemeIcon(btn);
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('apex-theme', next);
      toggleBtns.forEach(b => updateThemeIcon(b));
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('apex-theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      toggleBtns.forEach(b => updateThemeIcon(b));
    }
  });
}

function updateThemeIcon(btn) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon = btn.querySelector('i');
  if (!icon) return;
  icon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// ── RTL Toggle ─────────────────────────────────────────────
function initRTL() {
  const html = document.documentElement;
  const stored = localStorage.getItem('apex-rtl');
  if (stored === 'rtl') {
    html.setAttribute('dir', 'rtl');
  }

  const toggleBtns = document.querySelectorAll('.rtl-toggle');
  toggleBtns.forEach(btn => {
    updateRTLIcon(btn);
    btn.addEventListener('click', () => {
      const current = html.getAttribute('dir') || 'ltr';
      const next = current === 'rtl' ? 'ltr' : 'rtl';
      html.setAttribute('dir', next);
      localStorage.setItem('apex-rtl', next);
      toggleBtns.forEach(b => updateRTLIcon(b));
    });
  });
}

function updateRTLIcon(btn) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  btn.setAttribute('aria-label', isRTL ? 'Switch to LTR layout' : 'Switch to RTL layout');
  btn.setAttribute('title', isRTL ? 'LTR' : 'RTL');
}

// ── Navbar ─────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');

  if (!navbar) return;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger
  const openDrawer = () => {
    hamburger?.classList.add('active');
    drawer?.classList.add('active');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    drawerClose?.focus();
  };

  const closeDrawer = () => {
    hamburger?.classList.remove('active');
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    hamburger?.focus();
  };

  hamburger?.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  drawerClose?.addEventListener('click', closeDrawer);

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close drawer on link click
  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Scroll to section if on same page
  navbar.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ── Active Nav Link ────────────────────────────────────────
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .drawer-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const page = href.split('/').pop();
    if (page === currentPage || (currentPage === '' && page === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ── Scroll Reveal ──────────────────────────────────────────
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ── Testimonials Carousel ──────────────────────────────────
function initCarousel() {
  const carousels = document.querySelectorAll('.testimonials-carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.testimonials-track');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-btn-prev');
    const nextBtn = carousel.querySelector('.carousel-btn-next');

    if (!track || !slides.length) return;

    let current = 0;
    let timer;

    const goTo = (index) => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(${-current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const startAuto = () => {
      timer = setInterval(() => goTo(current + 1), 5000);
    };

    const stopAuto = () => clearInterval(timer);

    prevBtn?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        stopAuto();
        goTo(diff > 0 ? current + 1 : current - 1);
        startAuto();
      }
    });

    goTo(0);
    startAuto();
  });
}

// ── Counter Animation ──────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2200;
  const start = performance.now();

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = target * eased;
    el.textContent = (value >= 100 ? Math.floor(value) : value.toFixed(value < 10 ? 1 : 0)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

// ── Case Studies Drag Scroll ───────────────────────────────
function initCaseDrag() {
  const sliders = document.querySelectorAll('.case-studies-scroll');
  sliders.forEach(slider => {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => { isDown = false; });
    slider.addEventListener('mouseup', () => { isDown = false; });
    slider.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX);
    });
  });
}

// ── Typewriter Effect ──────────────────────────────────────
function initTypewriter() {
  const el = document.querySelector('.hero-typewriter[data-words]');
  if (!el) return;

  const words = JSON.parse(el.getAttribute('data-words'));
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  const type = () => {
    const current = words[wordIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  };

  type();
}

// ── Parallax ───────────────────────────────────────────────
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  heroBg.classList.add('loaded');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1)`;
  }, { passive: true });
}

// ── Newsletter ─────────────────────────────────────────────
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!input || !emailRegex.test(input.value.trim())) {
        input?.classList.add('error');
        input?.focus();
        return;
      }

      input.classList.remove('error');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Subscribed!';
        btn.disabled = true;
        input.value = '';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 3500);
      }
    });
  });
}

// ── Interactive Tabs (Home 2) ──────────────────────────────
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
  const panels = document.querySelectorAll('.tab-panel[data-panel]');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.tab-panel[data-panel="${target}"]`)?.classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', initTabs);

// ── Blog Filter ────────────────────────────────────────────
function initBlogFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  const cards = document.querySelectorAll('.blog-card[data-category]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
          card.classList.add('reveal', 'visible');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initBlogFilter);

// ── Live Countdown (Coming Soon) ───────────────────────────
function initCountdown() {
  const container = document.querySelector('.countdown-grid[data-target-date]');
  if (!container) return;

  const targetDateStr = container.getAttribute('data-target-date');
  const targetDate = targetDateStr ? new Date(targetDateStr).getTime() : Date.now() + (45 * 24 * 60 * 60 * 1000);

  const daysEl = document.querySelector('#countdown-days');
  const hoursEl = document.querySelector('#countdown-hours');
  const minutesEl = document.querySelector('#countdown-minutes');
  const secondsEl = document.querySelector('#countdown-seconds');

  function update() {
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', initCountdown);

// ── Auth Tab Switcher ──────────────────────────────────────
function initAuthTabs() {
  const tabBtns = document.querySelectorAll('.auth-tab-btn[data-auth-target]');
  if (!tabBtns.length) return;

  function switchTab(targetId) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-auth-target') === targetId);
    });
    document.querySelectorAll('.auth-form-container').forEach(container => {
      container.classList.toggle('active', container.id === targetId);
    });
    if (history.replaceState) {
      history.replaceState(null, '', '#' + (targetId === 'auth-register' ? 'register' : 'login'));
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-auth-target');
      switchTab(target);
    });
  });

  // Switch based on URL hash
  if (window.location.hash === '#register') {
    switchTab('auth-register');
  }
}

document.addEventListener('DOMContentLoaded', initAuthTabs);
