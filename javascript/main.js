const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = [...document.querySelectorAll('.nav-item')];
const sections = [...document.querySelectorAll('main section[id]')];
const progress = document.querySelector('.scroll-progress span');
const backTop = document.querySelector('.back-top');
const cursorGlow = document.querySelector('.cursor-glow');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let locoScroll = null;
let usingLocomotive = false;

function setScrollUI(y = window.scrollY) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  if (progress) progress.style.width = `${ratio * 100}%`;
  if (header) header.classList.toggle('scrolled', y > 30);
  if (backTop) backTop.classList.toggle('visible', y > 650);
}

function nativeScrollTo(target) {
  const el = document.querySelector(target);
  if (!el) return;
  const offset = 86;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function enableNativeScroll() {
  usingLocomotive = false;
  locoScroll = null;
  setScrollUI(window.scrollY);

  window.addEventListener(
    'scroll',
    () => setScrollUI(window.scrollY),
    { passive: true }
  );
}

function initLocomotive() {
  const container = document.querySelector('[data-scroll-container]');

  if (!container) {
    console.warn('Locomotive: data-scroll-container not found.');
    enableNativeScroll();
    return;
  }

  if (typeof window.LocomotiveScroll !== 'function') {
    console.warn('Locomotive Scroll library not loaded. Native scrolling enabled.');
    enableNativeScroll();
    return;
  }

  try {
    locoScroll = new window.LocomotiveScroll({
      el: container,
      smooth: true,
      lerp: 0.075,
      multiplier: 1,
      smoothMobile: true,
      smartphone: {
        smooth: true,
        lerp: 0.09,
        multiplier: 1
      },
      tablet: {
        smooth: true,
        lerp: 0.08,
        multiplier: 1
      },
      getDirection: true,
      resetNativeScroll: true
    });

    usingLocomotive = true;

    console.log('✅ Locomotive Scroll is ACTIVE.');

    locoScroll.on('scroll', (args) => {
      const y =
        args &&
        args.scroll &&
        typeof args.scroll.y === 'number'
          ? args.scroll.y
          : 0;

      setScrollUI(y);
    });

    const updateLoco = () => {
      if (locoScroll && typeof locoScroll.update === 'function') {
        locoScroll.update();
      }
    };

    window.addEventListener('load', updateLoco);
    window.addEventListener('resize', updateLoco);

    setTimeout(updateLoco, 300);
    setTimeout(updateLoco, 1000);

  } catch (error) {
    console.error('❌ Locomotive Scroll initialization failed:', error);
    enableNativeScroll();
  }
}

function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;

  if (usingLocomotive && locoScroll) {
    locoScroll.scrollTo(target, {
      offset: -86,
      duration: reduceMotion ? 0 : 1000,
      disableLerp: false,
      easing: [0.22, 1, 0.36, 1]
    });
  } else {
    nativeScrollTo(selector);
  }
}

if (menuToggle && navMenu) menuToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(link => link.addEventListener('click', event => {
  const target = link.getAttribute('href');
  if (target?.startsWith('#')) {
    event.preventDefault();
    scrollToTarget(target);
  }
  navMenu.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('a[href^="#"]').forEach(link => {
  if (link.classList.contains('nav-item')) return;
  link.addEventListener('click', event => {
    const target = link.getAttribute('href');
    if (!target || target === '#') return;
    const el = document.querySelector(target);
    if (!el) return;
    event.preventDefault();
    scrollToTarget(target);
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

sections.forEach(section => sectionObserver.observe(section));

if (backTop) backTop.addEventListener('click', () => scrollToTarget('#home'));

if (window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
  window.addEventListener('pointermove', event => {
    cursorGlow.style.opacity = '.85';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
  document.addEventListener('mouseleave', () => cursorGlow.style.opacity = '0');

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', event => {
      const r = btn.getBoundingClientRect();
      const x = (event.clientX - r.left - r.width / 2) * 0.08;
      const y = (event.clientY - r.top - r.height / 2) * 0.08;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave', () => btn.style.transform = '');
  });

  document.querySelectorAll('.project-card,.skill-card,.cert-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${-y * 3}deg`);
      card.style.setProperty('--ry', `${x * 3}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Initialize smooth scrolling after the DOM is ready.
initLocomotive();
