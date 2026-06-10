/* ============================================================
   VOLTÉO — JS partagé
   ============================================================ */
(function () {
  'use strict';

  /* --- Nav : ombre au scroll --- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Menu mobile --- */
  const burger = document.querySelector('.nav-burger');
  const mobile = document.querySelector('.mobile-menu');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobile.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* --- Reveal au scroll --- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* --- Compteurs animés --- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const fmt = (n, dec) => {
      const v = dec ? n.toFixed(dec) : Math.round(n).toString();
      return v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const dur = 1500; const t0 = performance.now();
      const pre = el.dataset.prefix || ''; const suf = el.dataset.suffix || '';
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(target * e, dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* --- Sélecteur d'ambiance (palette) --- */
  const THEME_KEY = 'volteo-theme';
  const sw = document.querySelector('.theme-switch');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (sw) sw.querySelectorAll('.ts-opt').forEach(b => b.classList.toggle('on', b.dataset.themeSet === t));
  }
  applyTheme(localStorage.getItem(THEME_KEY) || 'electrique');
  if (sw) {
    sw.querySelectorAll('.ts-opt').forEach(b => b.addEventListener('click', () => {
      localStorage.setItem(THEME_KEY, b.dataset.themeSet);
      applyTheme(b.dataset.themeSet);
    }));
  }

})();
