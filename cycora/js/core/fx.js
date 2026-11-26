/* CYCORA · UI feedback: modals, toasts, confetti, floating text, coin bursts.
   None of these are used *during* typing except floating text, which never steals focus. */
CY.fx = (() => {
  const U = CY.util;

  /* ---------- Live region for screen readers ---------- */
  function announce(text) {
    const r = U.$('#sr-live');
    if (!r) return;
    r.textContent = '';
    setTimeout(() => (r.textContent = text), 30);
  }

  /* ---------- Modal ---------- */
  let modalStack = [];
  function modal({ title = '', body = '', actions = [{ label: 'OK', primary: true }], cls = '', dismissable = true, onOpen } = {}) {
    return new Promise((resolve) => {
      const lastFocus = document.activeElement;
      const wrap = U.el(`<div class="modal-wrap ${cls}" role="dialog" aria-modal="true" aria-labelledby="mt-${modalStack.length}">
        <div class="modal-card pop">
          ${dismissable ? `<button class="icon-btn modal-x" aria-label="Close">${CY.art.icon('close', 20)}</button>` : ''}
          ${title ? `<h2 class="modal-title" id="mt-${modalStack.length}">${title}</h2>` : ''}
          <div class="modal-body">${body}</div>
          <div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.primary ? 'btn-primary' : a.danger ? 'btn-danger' : 'btn-soft'}" data-i="${i}">${a.label}</button>`).join('')}</div>
        </div></div>`);
      const close = (val) => {
        wrap.classList.add('closing');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => wrap.remove(), 160);
        modalStack = modalStack.filter((m) => m !== wrap);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
        resolve(val);
      };
      const onKey = (e) => {
        if (modalStack[modalStack.length - 1] !== wrap) return;
        if (e.key === 'Escape' && dismissable) { e.stopPropagation(); close(null); }
        if (e.key === 'Tab') {
          const f = U.$$('button, [href], input, select, [tabindex]:not([tabindex="-1"])', wrap).filter((x) => !x.disabled);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      };
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]');
        if (b) close(actions[+b.dataset.i].value ?? +b.dataset.i);
        else if (e.target.closest('.modal-x') || (e.target === wrap && dismissable)) close(null);
      });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(wrap);
      modalStack.push(wrap);
      if (onOpen) onOpen(wrap, close);
      const first = U.$('.btn-primary', wrap) || U.$('button', wrap);
      setTimeout(() => { if (first) first.focus({ preventScroll: true }); U.$('.modal-card', wrap).scrollTop = 0; }, 30);
    });
  }
  const confirm = (title, body, yes = 'Yes', no = 'Cancel', danger = false) =>
    modal({ title, body: `<p>${body}</p>`, actions: [{ label: no, value: false }, { label: yes, value: true, primary: !danger, danger }] }).then((v) => v === true);

  /* ---------- Toasts (queued, non-blocking) ---------- */
  const queue = [];
  let showing = false;
  function toast({ title, text = '', icon = 'sparkle', tone = 'butter', sound = 'pop' }) {
    queue.push({ title, text, icon, tone, sound });
    if (!showing) nextToast();
  }
  function nextToast() {
    const t = queue.shift();
    if (!t) { showing = false; return; }
    showing = true;
    const host = U.$('#toasts');
    const el = U.el(`<div class="toast tone-${t.tone}" role="status"><span class="toast-ic">${CY.art.icon(t.icon, 30)}</span><span><strong>${t.title}</strong>${t.text ? `<small>${t.text}</small>` : ''}</span></div>`);
    host.appendChild(el);
    CY.audio.play(t.sound);
    announce(`${t.title}. ${t.text}`);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); nextToast(); }, 300); }, 2600);
  }
  const achievementToasts = (list) => list.forEach((a) => toast({ title: `Achievement: ${a.name}`, text: a.desc, icon: a.icon, tone: 'butter', sound: 'unlock' }));

  /* ---------- Confetti (canvas, auto-stops) ---------- */
  function confetti({ count = 120, duration = 2200 } = {}) {
    if (U.reducedMotion()) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    c.setAttribute('aria-hidden', 'true');
    c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const cols = ['#FFD966', '#FF7A6B', '#8ED1F2', '#9CCB8E', '#FFC4A3', '#D9CCF2'];
    const ps = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: U.pick(cols), shape: Math.random() < 0.5 ? 0 : 1,
    }));
    const t0 = performance.now();
    (function frame(t) {
      const el = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, 1 - el / duration);
        ctx.fillStyle = p.c;
        if (p.shape) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { ctx.beginPath(); ctx.arc(0, 0, p.r / 1.4, 0, 7); ctx.fill(); }
        ctx.restore();
      });
      if (el < duration) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }

  /* ---------- Floating text (+25, Perfect!) ---------- */
  function float(anchor, text, tone = 'ok') {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const el = U.el(`<div class="float-text tone-${tone}" aria-hidden="true">${text}</div>`);
    el.style.left = `${r.left + r.width / 2}px`;
    el.style.top = `${r.top}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  /* ---------- Coin / XP burst flying to the top bar ---------- */
  function burst(fromEl, toSel, icon = 'coin', n = 8) {
    const to = U.$(toSel);
    if (!fromEl || !to || U.reducedMotion()) return;
    const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const el = U.el(`<div class="burst" aria-hidden="true">${CY.art.icon(icon, 26)}</div>`);
      const sx = a.left + a.width / 2 + (Math.random() - 0.5) * 80, sy = a.top + a.height / 2 + (Math.random() - 0.5) * 40;
      el.style.left = `${sx}px`; el.style.top = `${sy}px`;
      document.body.appendChild(el);
      const dx = b.left + b.width / 2 - sx, dy = b.top + b.height / 2 - sy;
      el.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 60}px) scale(1.2)`, opacity: 1, offset: 0.4 }, { transform: `translate(${dx}px, ${dy}px) scale(.5)`, opacity: 0.4 }], { duration: 750 + i * 60, easing: 'cubic-bezier(.5,0,.6,1)' }).onfinish = () => {
        el.remove();
        to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump');
      };
    }
  }

  /** Animate a number counting up inside an element. */
  function countUp(el, to, ms = 700, fmt = (v) => Math.round(v)) {
    if (U.reducedMotion()) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    (function f(t) {
      const k = Math.min(1, (t - t0) / ms);
      el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  return { announce, modal, confirm, toast, achievementToasts, confetti, float, burst, countUp };
})();
