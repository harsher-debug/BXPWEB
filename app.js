const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileNav.hidden = true;
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileNav.hidden = !open;
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
const desktop = matchMedia('(min-width: 801px)');
desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });

// Only the privacy choice is stored; project details stay in the form until
// the visitor explicitly opens WhatsApp and chooses whether to send them.
const privacyKey = 'bxpweb:privacy:v1';
const cookieBanner = document.querySelector('#cookie-banner');
function readPrivacyChoice() {
  try {
    const choice = JSON.parse(localStorage.getItem(privacyKey));
    if (choice && ['necessary', 'accepted'].includes(choice.value) &&
      Number.isFinite(choice.at) && Date.now() - choice.at < 180 * 86400000) return choice;
  } catch { /* Privacy/storage restrictions must not break the page. */ }
  return null;
}
if (cookieBanner) cookieBanner.hidden = Boolean(readPrivacyChoice());
let cookieReturnFocus = null;
document.querySelectorAll('[data-cookie-choice]').forEach(button => {
  button.addEventListener('click', () => {
    try { localStorage.setItem(privacyKey, JSON.stringify({ value: button.dataset.cookieChoice, at: Date.now() })); } catch { /* Keep the choice for this view when storage is unavailable. */ }
    cookieBanner.hidden = true;
    (cookieReturnFocus || document.querySelector('.header .brand'))?.focus();
    cookieReturnFocus = null;
  });
});
document.querySelectorAll('[data-cookie-settings]').forEach(button => {
  button.addEventListener('click', () => {
    cookieReturnFocus = button;
    cookieBanner.hidden = false;
    cookieBanner.querySelector('button')?.focus();
  });
});

document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    const select = document.querySelector('#service');
    if (select) select.value = link.dataset.service;
  });
});
const form = document.querySelector('#contact-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name;
  const message = form.elements.message;
  name.setCustomValidity(name.value.trim() ? '' : 'Digite seu nome para continuar.');
  message.setCustomValidity(message.value.trim() ? '' : 'Conte um pouco sobre o seu projeto.');
  if (!form.reportValidity()) return;
  const text = `Olá, BXPWEB! Meu nome é ${name.value.trim()}.\n\nTenho interesse em: ${form.elements.service.value}.\n\n${message.value.trim()}\n\nLi e aceito os termos de privacidade para este contato.`;
  const url = `https://wa.me/5551980214923?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  const status = document.querySelector('#form-status');
  status.replaceChildren(document.createTextNode('Sua mensagem está pronta. Se o WhatsApp não abriu, '));
  const fallback = document.createElement('a');
  fallback.href = url;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = 'continue por este link.';
  status.append(fallback);
});
form?.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => field.setCustomValidity(''));
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

// A locally rendered wire sculpture: no video, trackers, external calls or dependencies.
const canvas = document.querySelector('#digital-sculpture');
if (canvas) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    let width = 0, height = 0, frame = 0, time = 0, lastTime = 0;
    let paused = false, inView = true;
    const toggle = document.querySelector('.motion-toggle');
    const strands = [];
    const count = 46, segments = 170;
    for (let strand = 0; strand < count; strand++) {
      const points = [], v = strand / count * Math.PI * 2;
      for (let step = 0; step <= segments; step++) {
        const u = step / segments * Math.PI * 2;
        const radius = 2.05 + .58 * Math.cos(v + u * 3);
        points.push([radius * Math.cos(u), radius * Math.sin(u), .58 * Math.sin(v + u * 3)]);
      }
      strands.push(points);
    }
    function render() {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width * .235, 325);
      const rotation = -.35 + Math.sin(time * .13) * .18;
      const tilt = .95 + Math.sin(time * .1) * .16;
      const cr = Math.cos(rotation), sr = Math.sin(rotation), ct = Math.cos(tilt), st = Math.sin(tilt);
      strands.forEach((points, index) => {
        ctx.beginPath();
        points.forEach((p, step) => {
          const x = p[0] * cr - p[1] * sr;
          const y = p[0] * sr + p[1] * cr;
          const ty = y * ct - p[2] * st;
          const z = y * st + p[2] * ct;
          const perspective = 5.5 / (5.5 - z);
          const px = width / 2 + x * scale * perspective;
          const py = height * .64 + ty * scale * perspective;
          if (!step) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        const alpha = .12 + Math.pow((Math.cos(index / count * Math.PI * 2 + time * .2) + 1) / 2, 4) * .48;
        ctx.strokeStyle = `rgba(190,209,231,${alpha})`;
        ctx.lineWidth = index % 5 === 0 ? 1.2 : .65;
        ctx.stroke();
      });
    }
    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      render();
    }
    function loop(timestamp) {
      if (timestamp - lastTime > 40) {
        time += .025; render(); lastTime = timestamp;
      }
      frame = requestAnimationFrame(loop);
    }
    function sync() {
      cancelAnimationFrame(frame);
      if (!paused && !reducedMotion.matches && inView && !document.hidden) frame = requestAnimationFrame(loop);
      else render();
    }
    toggle?.addEventListener('click', () => {
      paused = !paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Retomar animação de fundo' : 'Pausar animação de fundo');
      toggle.replaceChildren(document.createTextNode(paused ? '▷ ' : 'Ⅱ '));
      const label = document.createElement('span');
      label.textContent = paused ? 'Retomar animação' : 'Pausar animação';
      toggle.append(label); sync();
    });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting; sync();
    }).observe(canvas);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    resize(); sync();
  } else document.querySelector('.motion-toggle')?.remove();
}
