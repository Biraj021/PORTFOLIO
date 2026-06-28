/**
 * BIRAJ ACHERJEE — PORTFOLIO v3
 * script.js — All interactive behaviour
 *
 * Features:
 *  - Custom cursor tracking
 *  - Navbar scroll + active link highlighting
 *  - Mobile nav toggle
 *  - Canvas particle background (hero)
 *  - Typing effect (hero tagline)
 *  - Scroll reveal via IntersectionObserver
 *  - Skill bar animation on scroll
 *  - Counter animation (about stats)
 *  - Contact form: validation + Formspree
 *  - Back-to-top button
 *  - Footer year
 */

'use strict';

/* ── Tiny helpers ────────────────────────────────────────── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ═════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
═════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot   = qs('#cursor');
  const trail = qs('#cursor-trail');
  if (!dot || !trail) return;
  // Hide on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left   = mx + 'px';
    dot.style.top    = my + 'px';
    trail.style.left = mx + 'px';
    trail.style.top  = my + 'px';
  });
})();

/* ═════════════════════════════════════════════════════════
   2. NAVBAR — scroll shadow + active section + mobile
═════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar   = qs('#navbar');
  const toggle   = qs('#hamburger');
  const navLinks = qs('#nav-links');
  const links    = qsa('.nav-link');
  const sections = qsa('section[id]');

  if (!navbar) return;

  /* Scroll behaviour */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    highlightActive();
  }, { passive: true });

  /* Active section highlight */
  function highlightActive() {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const link   = qs(`.nav-link[data-section="${sec.id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }

  /* Mobile toggle */
  toggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  /* Close on link click */
  links.forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle?.classList.remove('open');
    }
  });
})();

/* ═════════════════════════════════════════════════════════
   3. HERO CANVAS — particle field
═════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = qs('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  /* Resize handler */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  /* Particle factory */
  function makeParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.4 + 0.3,
      vx:   (Math.random() - .5) * 0.25,
      vy:   (Math.random() - .5) * 0.25,
      alpha:Math.random() * 0.4 + 0.1,
    };
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 8000), 140);
    particles = Array.from({ length: count }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Move
      p.x += p.vx; p.y += p.vy;
      // Wrap
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
      ctx.fill();
    });

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => { if (p.x > W) p.x = Math.random() * W; if (p.y > H) p.y = Math.random() * H; });
  });

  init();
  draw();
})();

/* ═════════════════════════════════════════════════════════
   4. TYPING EFFECT
═════════════════════════════════════════════════════════ */
(function initTyping() {
  const el = qs('#typed-text');
  if (!el) return;

  const phrases = [
    'code and real-world problem solving.',
    'Python and full-stack development.',
    'AI systems and smart algorithms.',
    'hackathons and fast prototyping.',
    'React, Flask, and modern tools.',
  ];
  let pIdx = 0, cIdx = 0, deleting = false;

  async function type() {
    const current = phrases[pIdx];
    if (!deleting) {
      if (cIdx < current.length) {
        el.textContent = current.slice(0, ++cIdx);
        await wait(55 + Math.random() * 30);
      } else {
        await wait(1800);
        deleting = true;
      }
    } else {
      if (cIdx > 0) {
        el.textContent = current.slice(0, --cIdx);
        await wait(28);
      } else {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    requestAnimationFrame(type);
  }

  // Start after a short delay for UX
  setTimeout(type, 600);
})();

/* ═════════════════════════════════════════════════════════
   5. SCROLL REVEAL
═════════════════════════════════════════════════════════ */
(function initReveal() {
  const revealEls = qsa('.reveal');
  if (!revealEls.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => io.observe(el));
})();

/* ═════════════════════════════════════════════════════════
   6. SKILL BAR ANIMATION
═════════════════════════════════════════════════════════ */
(function initSkillBars() {
  const fills  = qsa('.sk-fill');
  if (!fills.length) return;

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fills.forEach((fill, i) => {
        const w = fill.dataset.w;
        setTimeout(() => { fill.style.width = w + '%'; }, i * 60);
      });
      io.disconnect();
    }
  }, { threshold: 0.25 });

  const section = qs('#skills');
  if (section) io.observe(section);
})();

/* ═════════════════════════════════════════════════════════
   7. COUNTER ANIMATION
═════════════════════════════════════════════════════════ */
(function initCounters() {
  const nums = qsa('.av-num[data-count]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      nums.forEach(el => {
        const target  = parseInt(el.dataset.count, 10);
        const dur     = 1200;
        const start   = performance.now();
        function step(now) {
          const t = clamp((now - start) / dur, 0, 1);
          const ease = 1 - Math.pow(1 - t, 3);  // ease-out cubic
          el.textContent = Math.round(ease * target);
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
      io.disconnect();
    }
  }, { threshold: 0.3 });

  const about = qs('#about');
  if (about) io.observe(about);
})();

/* ═════════════════════════════════════════════════════════
   8. CONTACT FORM — validation + Formspree
═════════════════════════════════════════════════════════ */
(function initForm() {
  const form    = qs('#contact-form');
  const btn     = qs('#btn-submit');
  const msgOk   = qs('#form-success');
  const msgErr  = qs('#form-error');
  if (!form) return;

  /* Validation rules */
  const rules = {
    'cf-name':    { el: qs('#cf-name'),    err: qs('#err-name'),    test: v => v.trim().length >= 2,   msg: 'Name must be at least 2 characters.' },
    'cf-email':   { el: qs('#cf-email'),   err: qs('#err-email'),   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Enter a valid email.' },
    'cf-subject': { el: qs('#cf-subject'), err: qs('#err-subject'), test: v => v.trim().length >= 3,   msg: 'Please add a subject.' },
    'cf-message': { el: qs('#cf-message'), err: qs('#err-message'), test: v => v.trim().length >= 10,  msg: 'Message must be at least 10 characters.' },
  };

  function setError(key, msg) {
    const r = rules[key];
    if (!r) return;
    r.err.textContent = msg;
    r.el.classList.toggle('err', !!msg);
  }

  function validate() {
    let ok = true;
    Object.entries(rules).forEach(([key, r]) => {
      const msg = r.test(r.el.value) ? '' : r.msg;
      setError(key, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  /* Live validation on input */
  Object.entries(rules).forEach(([key, r]) => {
    r.el.addEventListener('input', () => {
      if (r.err.textContent) setError(key, r.test(r.el.value) ? '' : r.msg);
    });
  });

  function setLoading(on) {
    btn.disabled = on;
    btn.classList.toggle('loading', on);
  }

  function showStatus(type) {
    msgOk.hidden = type !== 'ok';
    msgErr.hidden = type !== 'err';
    if (type) (type === 'ok' ? msgOk : msgErr).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    showStatus(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        showStatus('ok');
        form.reset();
        qsa('.field-err', form).forEach(el => el.textContent = '');
      } else {
        showStatus('err');
      }
    } catch {
      showStatus('err');
    } finally {
      setLoading(false);
    }
  });
})();

/* ═════════════════════════════════════════════════════════
   9. BACK TO TOP
═════════════════════════════════════════════════════════ */
(function initBackTop() {
  const btn = qs('#back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => { btn.hidden = window.scrollY < 500; }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ═════════════════════════════════════════════════════════
   10. SMOOTH SCROLL for anchor links
═════════════════════════════════════════════════════════ */
qsa('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id  = link.getAttribute('href').slice(1);
    const el  = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
    const top  = el.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═════════════════════════════════════════════════════════
   11. FOOTER YEAR
═════════════════════════════════════════════════════════ */
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ═════════════════════════════════════════════════════════
   12. PROJECT CARD TILT (subtle 3D on hover)
═════════════════════════════════════════════════════════ */
(function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ═════════════════════════════════════════════════════════
   INIT LOG
═════════════════════════════════════════════════════════ */
console.log(
  '%c[BA] Portfolio loaded\n%cBiraj Acherjee · github.com/Biraj021',
  'color:#38bdf8;font-family:monospace;font-size:13px;font-weight:bold;',
  'color:#64748b;font-family:monospace;font-size:10px;'
);