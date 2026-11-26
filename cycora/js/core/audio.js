/* CYCORA · synthesised sound effects (Web Audio, no audio files needed).
   Every sound is tiny and scheduled ahead, so it never blocks typing. */
CY.audio = (() => {
  let ctx = null, master = null;

  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.value = CY.store.s.settings.volume;
    return ctx;
  };

  const tone = (freq, start, dur, { type = 'sine', vol = 0.25, slide = 0 } = {}) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(master);
    o.start(start); o.stop(start + dur + 0.02);
  };

  const noise = (start, dur, vol = 0.08, hp = 2000) => {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(master);
    src.start(start);
  };

  const sounds = {
    key: (t) => { noise(t, 0.03, 0.05, 3500); tone(1400 + Math.random() * 200, t, 0.03, { type: 'triangle', vol: 0.03 }); },
    miss: (t) => tone(180, t, 0.12, { type: 'triangle', vol: 0.12, slide: -60 }),
    item: (t) => { tone(784, t, 0.12, { vol: 0.15 }); tone(1175, t + 0.08, 0.18, { vol: 0.15 }); },
    perfect: (t) => [880, 1109, 1319, 1760].forEach((f, i) => tone(f, t + i * 0.06, 0.16, { vol: 0.12 })),
    wrong: (t) => { tone(330, t, 0.14, { type: 'square', vol: 0.06 }); tone(262, t + 0.12, 0.2, { type: 'square', vol: 0.06 }); },
    coin: (t) => { tone(1568, t, 0.08, { type: 'square', vol: 0.06 }); tone(2093, t + 0.07, 0.22, { type: 'square', vol: 0.06 }); },
    xp: (t) => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.2, { type: 'triangle', vol: 0.12 })),
    complete: (t) => {
      [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.12, 0.25, { type: 'triangle', vol: 0.16 }));
      [1047, 1319, 1568].forEach((f) => tone(f, t + 0.42, 0.6, { vol: 0.08 }));
    },
    unlock: (t) => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.05, 0.3, { vol: 0.08 })),
    pop: (t) => tone(600, t, 0.08, { vol: 0.12, slide: 500 }),
    tick: (t) => tone(1000, t, 0.04, { type: 'square', vol: 0.04 }),
    go: (t) => tone(1320, t, 0.3, { type: 'triangle', vol: 0.14 }),
    leave: (t) => tone(440, t, 0.3, { type: 'sine', vol: 0.1, slide: -220 }),
  };

  function play(name) {
    const s = CY.store.s.settings;
    if (!s.sound) return;
    if (name === 'key' && !s.typingClicks) return;
    if (!ensure() || !sounds[name]) return;
    sounds[name](ctx.currentTime + 0.005);
  }

  return { play, unlock: ensure };
})();
