/* CYCORA · persistent player state (localStorage).
   All reads/writes go through CY.store so a backend sync layer can be dropped in later
   (replace load/save with API calls; the rest of the game is unaffected). */
CY.store = (() => {
  const KEY = 'cycora.save.v2';
  const VERSION = 2;

  const defaults = () => ({
    version: VERSION,
    created: Date.now(),
    onboarded: false,
    profile: {
      name: 'Chef',
      avatar: { skin: 2, hair: 0, hairColor: 1, hat: 'hat-classic', apron: 'sage', acc: 'none' },
    },
    xp: 0,
    coins: 40,
    hearts: { count: 5, max: 5, lastRefill: Date.now() },
    streak: { count: 0, best: 0, last: null, freezes: 0 },
    lessons: {},          // id -> { done, stars, bestScore, bestWpm, bestAcc, plays }
    seenWorlds: [1],      // worlds whose unlock celebration has played
    owned: ['hat-classic', 'apron-sage', 'theme-classic', 'wall-plain', 'tables-classic'],
    decor: {},            // itemId -> true when displayed in the restaurant
    style: { theme: 'theme-classic', wall: 'wall-plain', tables: 'tables-classic' },
    mascot: { cyhat: 'none', cyacc: 'none' },
    planet: { base: 40, counts: {}, log: [], tiers: [] },
    races: { played: 0, wins: 0, podiums: 0, records: {} },
    dailyEco: { date: null, missions: [], chest: false },
    achievements: {},     // id -> timestamp
    stats: {
      wordsTyped: 0, charsTyped: 0, lessonsDone: 0, perfectLessons: 0, bestWpm: 0, bestCombo: 0,
      sorted: 0, rescued: 0, remade: 0, served: 0, dailyDone: 0, timePlayedSec: 0, dailyChests: 0,
    },
    history: [],          // last 30 runs: { t, id, wpm, acc }
    daily: { date: null, done: false, best: 0 },
    weekly: { id: null, missions: [], weekXp: 0 },
    licence: { best: 0, grade: null, attempts: 0, last: null },
    settings: {
      sound: true, typingClicks: true, volume: 0.6,
      motion: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full',
      textSize: 'm', contrast: false, keyboard: true,
      difficulty: 'adaptive',  // adaptive | gentle | challenge
      hearts: 'on',            // on | relaxed (no heart loss)
      unlockAll: false,
    },
  });

  let state = defaults();

  const merge = (base, saved) => {
    for (const k of Object.keys(saved || {})) {
      if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        merge(base[k], saved[k]);
      } else {
        base[k] = saved[k];
      }
    }
    return base;
  };

  /* Health of browser storage, so the game can warn players instead of silently losing progress. */
  const health = { available: true, saveFailed: false, recovered: false };
  function storageAvailable() {
    try { const k = '__cycora_test__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; }
  }

  function load() {
    health.available = storageAvailable();
    let raw = null;
    try { raw = health.available ? localStorage.getItem(KEY) : null; } catch (e) { raw = null; }
    if (raw) {
      try {
        state = merge(defaults(), JSON.parse(raw));
      } catch (e) {
        // keep the damaged save aside instead of deleting it
        try { localStorage.setItem(`${KEY}.damaged.${Date.now()}`, raw); } catch (e2) { /* ignore */ }
        console.warn('CYCORA: save was unreadable — kept a copy and started fresh', e);
        state = defaults();
        health.recovered = true;
      }
    }
    state.version = VERSION;
    // migrate older saves: free starter styles are always owned
    ['theme-classic', 'wall-plain', 'tables-classic'].forEach((id) => { if (!state.owned.includes(id)) state.owned.push(id); });
    // ask the browser not to evict our data under storage pressure (where supported)
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    return state;
  }

  let saveTimer = null;
  function save(now = false) {
    const write = () => {
      if (!health.available) return;
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        health.saveFailed = false;
      } catch (e) {
        console.warn('CYCORA: save failed', e);
        if (!health.saveFailed) { health.saveFailed = true; if (CY.bus) CY.bus.emit('save:failed'); }
      }
    };
    clearTimeout(saveTimer);
    if (now) write(); else saveTimer = setTimeout(write, 120);
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    state = defaults();
    save(true);
    return state;
  }

  /* ---------- Backup & restore (a JSON file the player keeps) ---------- */
  function exportSave() {
    save(true);
    const blob = new Blob([JSON.stringify({ app: 'cycora', format: 1, savedAt: new Date().toISOString(), data: state }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cycora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  /** Validate a backup file's text. Returns { ok, data, summary } or { ok:false, msg }. */
  function parseBackup(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, msg: 'That file isn’t a CYCORA backup (it couldn’t be read).' }; }
    if (!obj || obj.app !== 'cycora' || !obj.data || typeof obj.data !== 'object' || !obj.data.profile || typeof obj.data.xp !== 'number') {
      return { ok: false, msg: 'That file isn’t a CYCORA backup.' };
    }
    const d = obj.data;
    return { ok: true, data: d, summary: `${d.profile.name || 'Chef'} · ${d.xp} XP · ${Object.values(d.lessons || {}).filter((l) => l.done).length} lessons · saved ${new Date(obj.savedAt).toLocaleDateString()}` };
  }
  function importSave(data) {
    state = merge(defaults(), data);
    state.version = VERSION;
    save(true);
  }

  /** Apply accessibility / presentation settings to the document root. */
  function applySettings() {
    const s = state.settings, r = document.documentElement;
    r.dataset.motion = s.motion;
    r.dataset.text = s.textSize;
    r.dataset.contrast = s.contrast ? 'high' : 'normal';
  }

  window.addEventListener('beforeunload', () => save(true));

  return {
    load, save, reset, applySettings, exportSave, parseBackup, importSave, health,
    get s() { return state; },
    defaults,
  };
})();
