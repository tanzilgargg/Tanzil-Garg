/* CYCORA · on-screen keyboard visualiser with finger guidance.
   Shows the next key (and which Shift to use), colour-zones each finger and
   names the finger in words so guidance never relies on colour alone. */
CY.Keyboard = class Keyboard {
  constructor(container) {
    this.root = container;
    this.rows = [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
      ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
      ['ShiftL', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftR'],
      ['Space'],
    ];
    const F = {
      lp: '` 1 q a z Tab Caps ShiftL', lr: '2 w s x', lm: '3 e d c', li: '4 5 r t f g v b',
      ri: '6 7 y u h j n m', rm: '8 i k ,', rr: '9 o l .', rp: "0 - = p [ ] ; ' / Enter Backspace ShiftR", th: 'Space',
    };
    this.finger = {};
    Object.entries(F).forEach(([f, keys]) => keys.split(' ').forEach((k) => (this.finger[k] = f)));
    this.names = { lp: 'left little finger', lr: 'left ring finger', lm: 'left middle finger', li: 'left index finger', ri: 'right index finger', rm: 'right middle finger', rr: 'right ring finger', rp: 'right little finger', th: 'thumb' };
    this.shifted = { '!': '1', '"': "'", '£': '3', $: '4', '%': '5', '&': '7', '*': '8', '(': '9', ')': '0', _: '-', '+': '=', ':': ';', '?': '/', '<': ',', '>': '.', '@': "'", '{': '[', '}': ']', '~': '`' };
    this.label = { Backspace: '⌫', Tab: 'Tab', Caps: 'Caps', Enter: 'Enter ↵', ShiftL: 'Shift', ShiftR: 'Shift', Space: 'space' };
    this.render();
  }
  render() {
    this.root.innerHTML = `<div class="kbd" aria-hidden="true">${this.rows.map((r) => `<div class="kbd-row">${r.map((k) => `<span class="key f-${this.finger[k]} k-${k.length > 1 ? k : 'c'}" data-k="${k === ' ' ? 'Space' : k}">${this.label[k] || k}${k === 'f' || k === 'j' ? '<i class="homebump"></i>' : ''}</span>`).join('')}</div>`).join('')}</div>
      <p class="kbd-hint" aria-live="off"><span class="kbd-hint-text">Rest your fingers on the home row</span></p>`;
    this.keys = {};
    this.root.querySelectorAll('.key').forEach((el) => (this.keys[el.dataset.k] = el));
    this.hint = this.root.querySelector('.kbd-hint-text');
  }
  resolve(ch) {
    if (ch == null) return null;
    if (ch === ' ') return { key: 'Space', shift: null };
    if (ch === '\n') return { key: 'Enter', shift: null };
    let key = ch, shift = false;
    if (/[A-Z]/.test(ch)) { key = ch.toLowerCase(); shift = true; }
    else if (this.shifted[ch]) { key = this.shifted[ch]; shift = true; }
    if (!this.keys[key]) return null;
    const f = this.finger[key] || '';
    return { key, shift: shift ? (f.startsWith('l') ? 'ShiftR' : 'ShiftL') : null };
  }
  showNext(ch) {
    Object.values(this.keys).forEach((k) => k.classList.remove('is-next'));
    const r = this.resolve(ch);
    if (!r) { this.hint.textContent = ch == null ? 'Start typing to begin' : 'Keep going!'; return; }
    this.keys[r.key].classList.add('is-next');
    if (r.shift) this.keys[r.shift].classList.add('is-next');
    const keyName = r.key === 'Space' ? 'Space' : r.key === 'Enter' ? 'Enter' : `“${ch}”`;
    this.hint.textContent = `${keyName}: ${this.names[this.finger[r.key]]}${r.shift ? ` + ${r.shift === 'ShiftR' ? 'right' : 'left'} Shift` : ''}`;
  }
  press(ch, ok) {
    const r = this.resolve(ch);
    if (!r) return;
    const el = this.keys[r.key];
    el.classList.remove('hit-ok', 'hit-bad');
    void el.offsetWidth;
    el.classList.add(ok ? 'hit-ok' : 'hit-bad');
  }
};
