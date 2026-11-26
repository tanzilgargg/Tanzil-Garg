/* CYCORA · core utilities
   Every module hangs off the single global namespace `CY` so the game runs
   straight from the file system (no build step, no ES-module CORS issues). */
window.CY = window.CY || {};

CY.util = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Create a DOM node from an HTML string (first element). */
  const el = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Small deterministic PRNG (mulberry32) so daily/weekly content is stable per day. */
  const seeded = (seed) => {
    let s = typeof seed === 'string' ? [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) : seed | 0;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
  const shuffle = (arr, rnd = Math.random) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const pad = (n) => String(n).padStart(2, '0');
  const dayStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  /** ISO week id, e.g. "2026-W48". */
  const weekId = (d = new Date()) => {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
    return `${t.getUTCFullYear()}-W${pad(wk)}`;
  };
  /** 0 (Mon) … 6 (Sun) plus fraction of day — used by the practice league. */
  const weekProgress = (d = new Date()) => (((d.getDay() + 6) % 7) + (d.getHours() * 60 + d.getMinutes()) / 1440) / 7;

  const fmtTime = (sec) => {
    sec = Math.max(0, Math.ceil(sec));
    return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
  };
  const pct = (v) => `${Math.round(v * 100)}%`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reducedMotion = () => document.documentElement.dataset.motion === 'reduced';

  return { $, $$, el, esc, clamp, lerp, seeded, pick, shuffle, dayStr, daysBetween, weekId, weekProgress, fmtTime, pct, sleep, reducedMotion };
})();

/** Tiny event bus – systems (missions, achievements, sound) subscribe to game events. */
CY.bus = (() => {
  const map = {};
  return {
    on(evt, fn) { (map[evt] = map[evt] || []).push(fn); return () => this.off(evt, fn); },
    off(evt, fn) { map[evt] = (map[evt] || []).filter((f) => f !== fn); },
    emit(evt, data) { (map[evt] || []).slice().forEach((f) => { try { f(data); } catch (e) { console.error(e); } }); },
  };
})();
