/* CYCORA · Typing engine
   - Real-time per-character feedback on any number of on-screen "targets".
   - Multi-target lock-on: with several targets visible, the first keys you type
     choose which one you're typing (used for tickets and decisions).
   - Strict mode (beginners): wrong keys are counted but never inserted.
   - Normal mode: wrong keys appear in red and must be fixed with Backspace.
   - Tracks keystrokes, accuracy, WPM, CPM, errors, combo + multiplier, score.
   Rendering is class-toggling only, so it stays fast with animations running. */
CY.TypingEngine = class TypingEngine {
  constructor({ strict = false, onKey, onComplete, onFocus } = {}) {
    this.strict = strict;
    this.onKey = onKey || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onFocus = onFocus || (() => {});
    this.targets = new Map();
    this.typed = '';
    this.focusId = null;
    this.locked = null;     // id of a single forced target, or null for lock-on mode
    this.paused = true;
    this.stats = { correct: 0, wrong: 0, total: 0, combo: 0, bestCombo: 0, score: 0, errorsLive: 0 };
    this.activeMs = 0;
    this._t0 = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onInput = this._onInput.bind(this);
    this.input = null;
  }

  /* ----- lifecycle ----- */
  attach(input) {
    this.input = input;
    document.addEventListener('keydown', this._onKeyDown, true);
    input.addEventListener('input', this._onInput);
  }
  detach() {
    document.removeEventListener('keydown', this._onKeyDown, true);
    if (this.input) this.input.removeEventListener('input', this._onInput);
    this.pause();
  }
  start() { this.paused = false; this._resumeClock(); }
  pause() { if (this._t0 !== null) { this.activeMs += performance.now() - this._t0; this._t0 = null; } this.paused = true; }
  resume() { this.paused = false; this._resumeClock(); }
  _resumeClock() { if (this._t0 === null && this.stats.total > 0) this._t0 = performance.now(); }
  elapsedMs() { return this.activeMs + (this._t0 !== null ? performance.now() - this._t0 : 0); }

  /* ----- targets ----- */
  add({ id, text, el, priority = 0, data }) {
    el.classList.add('ttext');
    el.innerHTML = '';
    // characters are grouped into word wrappers so lines never break mid-word
    let word = null;
    const spans = [...text].map((ch) => {
      const s = document.createElement('span');
      s.className = 'tch' + (ch === ' ' ? ' sp' : ch === '\n' ? ' nl' : '');
      s.textContent = ch === ' ' ? '\u00A0' : ch === '\n' ? '↵' : ch;
      if (ch === ' ') { word = null; el.appendChild(s); el.appendChild(document.createTextNode('\u200B')); }
      else {
        if (!word) { word = document.createElement('span'); word.className = 'tword'; el.appendChild(word); }
        word.appendChild(s);
      }
      return s;
    });
    el.setAttribute('aria-label', text.replace('\n', ' then Enter'));
    const t = { id, text, el, spans, priority, data };
    this.targets.set(id, t);
    this.render();
    return t;
  }
  remove(id) {
    const t = this.targets.get(id);
    if (t) t.el.classList.remove('is-focus', 'is-candidate', 'is-dim');
    if (this.focusId === id) { this.focusId = null; this.typed = ''; }
    this.targets.delete(id);
    this.render();
  }
  clear() { this.targets.clear(); this.focusId = null; this.typed = ''; }
  lock(id) { this.locked = id; this.focusId = id; this.typed = ''; this.render(); }
  unlock() { this.locked = null; }
  setPriority(id, p) { const t = this.targets.get(id); if (t) t.priority = p; }

  /* ----- metrics ----- */
  get accuracy() { return this.stats.total ? this.stats.correct / this.stats.total : 1; }
  get wpm() { const m = this.elapsedMs() / 60000; return m > 0.02 ? (this.stats.correct / 5) / m : 0; }
  get cpm() { const m = this.elapsedMs() / 60000; return m > 0.02 ? this.stats.correct / m : 0; }
  get multiplier() { const c = this.stats.combo; return c >= 80 ? 4 : c >= 40 ? 3 : c >= 15 ? 2 : 1; }
  /** Next expected character for the current focus (used by the keyboard visualiser). */
  get nextChar() {
    const t = this.targets.get(this.focusId);
    if (t) return t.text.startsWith(this.typed) ? t.text[this.typed.length] : null;
    if (this.targets.size === 1) return [...this.targets.values()][0].text[0];
    return null;
  }
  get hasError() { const t = this.targets.get(this.focusId); return !!t && !t.text.startsWith(this.typed); }

  /* ----- input ----- */
  _onKeyDown(e) {
    if (this.paused) return;
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if ((e.ctrlKey || e.altKey) && e.key === 'Backspace') { e.preventDefault(); this.backspaceWord(); }
      return;
    }
    if (e.key === 'Backspace') { e.preventDefault(); this.backspace(); return; }
    if (e.key === 'Enter') { e.preventDefault(); this.type('\n'); return; }
    if (e.key === 'Escape') { if (!this.locked && this.typed) { e.preventDefault(); this.typed = ''; this.focusId = null; this.render(); } return; }
    if (e.key === 'Tab') return;
    if (e.key.length === 1) { e.preventDefault(); this.type(e.key); }
  }
  /* Soft keyboards (mobile) don't send reliable key values, so read the hidden input. */
  _onInput() {
    if (!this.input) return;
    const v = this.input.value;
    this.input.value = '';
    if (this.paused) return;
    for (const ch of v) this.type(ch === ' ' ? ' ' : ch);
  }

  _best(cands) {
    return cands.sort((a, b) => b.priority - a.priority)[0];
  }

  type(ch) {
    if (this.paused || this.targets.size === 0) return;
    if (this.stats.total === 0 && this._t0 === null) this._t0 = performance.now();
    const st = this.stats;
    st.total++;
    let focus = this.targets.get(this.focusId);
    const next = this.typed + ch;
    let ok = false;

    if (focus && !this.hasError && focus.text.startsWith(next)) ok = true;
    else if (!this.locked && !this.hasError) {
      const cands = [...this.targets.values()].filter((t) => t.text.startsWith(next));
      if (cands.length) {
        const pickT = cands.includes(focus) ? focus : this._best(cands);
        if (pickT !== focus) { this.focusId = pickT.id; focus = pickT; this.onFocus(pickT); }
        ok = true;
      }
    }

    if (ok) {
      this.typed = next;
      st.correct++;
      st.combo++;
      st.bestCombo = Math.max(st.bestCombo, st.combo);
      st.score += 10 * this.multiplier;
      this.render();
      this.onKey({ ok: true, ch, combo: st.combo, mult: this.multiplier, target: focus });
      if (this.typed === focus.text) {
        const done = focus;
        st.score += 25 + done.text.length * 2;
        this.typed = '';
        this.focusId = this.locked && this.locked !== done.id ? this.locked : null;
        if (this.locked === done.id) this.locked = null;
        this.onComplete(done);
        this.render();
      }
    } else {
      st.wrong++;
      st.errorsLive++;
      st.combo = 0;
      const expected = focus && !this.hasError ? focus.text[this.typed.length] : null;
      if (!this.strict && focus && this.typed.length < focus.text.length) this.typed = next;
      this.render(true);
      this.onKey({ ok: false, ch, expected, target: focus });
    }
  }

  backspace() {
    if (this.paused || !this.typed) return;
    this.typed = this.typed.slice(0, -1);
    if (!this.typed && !this.locked) this.focusId = null;
    this.render();
    this.onKey({ back: true });
  }
  backspaceWord() {
    if (this.paused || !this.typed) return;
    const cut = this.typed.replace(/\s*\S*$/, '');
    this.typed = cut;
    if (!this.typed && !this.locked) this.focusId = null;
    this.render();
    this.onKey({ back: true });
  }

  /* ----- rendering ----- */
  render(flashError = false) {
    const typed = this.typed;
    this.targets.forEach((t) => {
      const isFocus = t.id === this.focusId;
      const candidate = !isFocus && typed && !this.hasError && t.text.startsWith(typed);
      const dim = typed && !isFocus && !candidate;
      t.el.classList.toggle('is-focus', isFocus);
      t.el.classList.toggle('is-candidate', !!candidate);
      t.el.classList.toggle('is-dim', !!dim);
      t.spans.forEach((s, i) => {
        let cls = 'tch' + (t.text[i] === ' ' ? ' sp' : t.text[i] === '\n' ? ' nl' : '');
        if (isFocus || candidate) {
          if (i < typed.length) cls += typed[i] === t.text[i] && t.text.startsWith(typed.slice(0, i + 1)) ? ' ok' : ' bad';
          else if (i === typed.length) cls += ' next';
        } else if (!typed && i === 0 && (this.locked === null || this.locked === t.id)) cls += ' next';
        if (s.className !== cls) s.className = cls;
      });
      if (flashError && isFocus) {
        t.el.classList.remove('shake');
        void t.el.offsetWidth;
        t.el.classList.add('shake');
      }
    });
  }
};
