/* ── Navbar scroll opacity ─────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile nav toggle ─────────────────────────────────────── */
document.getElementById('mobileToggle').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

/* ── Footer year ───────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Scroll fade-in ────────────────────────────────────────── */
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => observer.observe(el));

/* ── Chaos canvas animation ────────────────────────────────── */
(function initChaos() {
  const canvas = document.getElementById('chaosCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Icon definitions (label + color)
  const ICONS = [
    { label: 'N',   color: '#fff',    size: 32, font: 'bold' },   // Notion
    { label: '⌥',   color: '#fff',    size: 34 },                  // VS Code-ish
    { label: '⎋',   color: '#4ade80', size: 34 },                  // Terminal
    { label: '#',   color: '#db4437', size: 34, font: 'bold' },   // Slack hash
    { label: '⌗',   color: '#6366f1', size: 36 },                  // GitHub-ish
    { label: '⇥',   color: '#f59e0b', size: 34 },                  // Tab
    { label: '✎',   color: '#94a3b8', size: 34 },                  // Text file
    { label: '⊛',   color: '#06b6d4', size: 34 },                  // Bookmark
  ];

  let mouse = { x: -9999, y: -9999 };
  let balls = [];
  let animId;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
  }

  function initBalls() {
    const W = canvas.width, H = canvas.height;
    balls = ICONS.map((icon, i) => ({
      x: 40 + Math.random() * (W - 80),
      y: 40 + Math.random() * (H - 80),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.02,
      scale: 0.9 + Math.random() * 0.3,
      scaleDir: Math.random() > 0.5 ? 1 : -1,
      t: Math.random() * Math.PI * 2,
      radius: Math.round(icon.size * 0.6),
      ...icon,
    }));
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    balls.forEach(b => {
      // Pulse scale
      b.t += 0.025;
      const s = b.scale + Math.sin(b.t) * 0.08;

      // Repel from mouse
      const dx = b.x - mouse.x, dy = b.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repelRadius = 90;
      if (dist < repelRadius && dist > 0) {
        const force = (repelRadius - dist) / repelRadius * 2.5;
        b.vx += (dx / dist) * force * 0.12;
        b.vy += (dy / dist) * force * 0.12;
      }

      // Speed cap
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (speed > 2.4) { b.vx *= 2.4 / speed; b.vy *= 2.4 / speed; }

      // Move
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.rotV;

      // Friction
      b.vx *= 0.98;
      b.vy *= 0.98;

      // Bounce off walls
      const r = b.radius;
      if (b.x < r)     { b.x = r;     b.vx = Math.abs(b.vx); }
      if (b.x > W - r) { b.x = W - r; b.vx = -Math.abs(b.vx); }
      if (b.y < r)     { b.y = r;     b.vy = Math.abs(b.vy); }
      if (b.y > H - r) { b.y = H - r; b.vy = -Math.abs(b.vy); }

      // Draw
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.scale(s, s);
      ctx.globalAlpha = 0.85;
      ctx.font = `${b.font || 'normal'} ${b.size}px system-ui, sans-serif`;
      ctx.fillStyle = b.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, 0, 0);
      ctx.restore();
    });

    // Ball-ball elastic collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;
        if (dist < minDist && dist > 0) {
          // Separate overlapping balls
          const nx = dx / dist, ny = dy / dist;
          const overlap = (minDist - dist) * 0.5;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          // Exchange velocity along collision normal (equal mass)
          const dot = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (dot < 0) {
            a.vx += dot * nx;
            a.vy += dot * ny;
            b.vx -= dot * nx;
            b.vy -= dot * ny;
          }
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);

  // Touch support
  canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', onMouseLeave);

  resize();
  initBalls();
  draw();

  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(animId);
    resize();
    initBalls();
    draw();
  });
  ro.observe(canvas);
})();

/* ── Pricing toggle ────────────────────────────────────────── */
(function initPricing() {
  const toggle  = document.getElementById('billingToggle');
  const proPrice  = document.getElementById('proPrice');
  const proPeriod = document.getElementById('proPeriod');
  const yearlyNote = document.getElementById('yearlyNote');
  const lblMonthly = document.getElementById('toggleMonthly');
  const lblYearly  = document.getElementById('toggleYearly');

  let isYearly = false;

  toggle.addEventListener('click', () => {
    isYearly = !isYearly;
    toggle.classList.toggle('on', isYearly);
    lblMonthly.classList.toggle('active', !isYearly);
    lblYearly.classList.toggle('active', isYearly);

    if (isYearly) {
      proPrice.textContent  = '$6';
      proPeriod.textContent = '/month';
      yearlyNote.style.display = 'block';
    } else {
      proPrice.textContent  = '$8';
      proPeriod.textContent = '/month';
      yearlyNote.style.display = 'none';
    }
  });
})();
