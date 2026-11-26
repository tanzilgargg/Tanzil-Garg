/* CYCORA · gameplay runner.
   CY.play.run(def, host, opts) mounts a HUD + scene, drives the typing engine,
   timers and patience, and calls opts.onFinish(result) when the round ends.
   Used by lessons, the Daily Special and every Restaurant Licence stage. */
CY.play = (() => {
  const U = CY.util, A = CY.art;

  const OPTION_INFO = {
    recycle: { label: 'Recycle', hint: 'Clean bottles, cans, jars & card' },
    compost: { label: 'Compost', hint: 'Food scraps & peelings' },
    donate: { label: 'Donate', hint: 'Sealed, safe, in-date food' },
    general: { label: 'General waste', hint: 'Can’t be recycled or composted' },
    chill: { label: 'Chill', hint: 'Into the fridge soon (5°C or below)' },
    freeze: { label: 'Freeze', hint: 'Save it safely for later' },
    biodiesel: { label: 'Biodiesel', hint: 'Fuel made from used oil' },
    'new paper': { label: 'New paper', hint: 'Pulped and pressed again' },
    'new glass': { label: 'New glass', hint: 'Crushed, melted, moulded' },
    'new plastic': { label: 'New plastic', hint: 'Flaked and remade' },
  };
  const RESCUE_COMPOST_HINT = 'Not safe to eat → food waste';
  const optionArt = (scene, o) => {
    if (scene === 'sort') return A.bin(o, 54);
    if (scene === 'rescue') return A.icon({ donate: 'heart', chill: 'thermo', freeze: 'snow', compost: 'leaf' }[o], 40);
    return A.item({ compost: 'compost', biodiesel: 'fuel', 'new paper': 'paper', 'new glass': 'glass', 'new plastic': 'fabric' }[o], 48);
  };

  /* =========================================================== */
  function run(def, host, opts = {}) {
    const ease = opts.ease ?? CY.progress.ease();
    const world = CY.data.world(def.world);
    const guide = opts.guide || (world ? world.guide : 'cy');
    const settings = CY.store.s.settings;
    let kbVisible = def.keyboard && settings.keyboard;

    host.innerHTML = `
      <div class="play scene-${def.scene || def.mode}" style="--wc:${world ? world.color : '#FFD966'}">
        <header class="hud">
          <button class="icon-btn hud-exit" aria-label="Leave this round">${A.icon('close', 22)}</button>
          <div class="hud-progress" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="hud-progress-fill"></span><span class="hud-progress-label">0 / 0</span></div>
          <div class="hud-timer chip" aria-label="Timer">${A.icon('clock', 20)}<b class="hud-time">0:00</b></div>
          <button class="icon-btn hud-kbd ${kbVisible ? 'on' : ''}" aria-pressed="${kbVisible}" aria-label="Show keyboard guide" title="Keyboard guide">${A.icon('keyboard', 22)}</button>
          <button class="btn btn-small btn-coral tap-type" aria-label="Open the on-screen keyboard">${A.icon('keyboard', 18)} Tap to type</button>
          <button class="icon-btn hud-pause" aria-label="Pause">${A.icon('pause', 20)}</button>
        </header>
        <div class="hud-stats" aria-hidden="true">
          <div class="stat"><small>WPM</small><b class="s-wpm">0</b></div>
          <div class="stat"><small>CPM</small><b class="s-cpm">0</b></div>
          <div class="stat"><small>Accuracy</small><b class="s-acc">100%</b></div>
          <div class="stat stat-err"><small>Errors</small><b class="s-err">0</b></div>
          <div class="stat stat-combo"><small>Combo</small><b class="s-combo">0</b><span class="mult">×1</span></div>
          <div class="stat"><small>Score</small><b class="s-score">0</b></div>
        </div>
        <h1 class="sr-only">${U.esc(def.title)}</h1>
        <div class="stage" tabindex="-1" role="region" aria-label="Game area"></div>
        <div class="coach"><div class="coach-char">${A.character(guide, { size: 64, mood: 'happy' })}</div><p class="coach-bubble" aria-live="polite">${U.esc(def.tip || '')}</p></div>
        <div class="kbd-wrap" ${kbVisible ? '' : 'hidden'}></div>
        <input class="type-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Typing input. Type the highlighted text" />
        <div class="play-overlay" hidden></div>
      </div>`;

    const $ = (s) => U.$(s, host);
    const ui = { root: $('.play'), stage: $('.stage'), input: $('.type-input'), overlay: $('.play-overlay'), coach: $('.coach-bubble'), coachChar: $('.coach-char'), kbdWrap: $('.kbd-wrap'), time: $('.hud-time'), prog: $('.hud-progress-fill'), progLabel: $('.hud-progress-label'), progBar: $('.hud-progress') };
    const st = { wpm: $('.s-wpm'), cpm: $('.s-cpm'), acc: $('.s-acc'), err: $('.s-err'), combo: $('.s-combo'), mult: $('.mult'), score: $('.s-score') };

    const R = { eco: [], items: 0, done: 0, missed: 0, decisions: 0, decisionsRight: 0, served: 0, sortedRight: 0, rescuedRight: 0, remadeRight: 0, perfectItems: 0, safetyRight: 0, safetyTotal: 0 };
    let running = false, finished = false, paused = false, elapsed = 0, lastTs = 0, raf = null, coachTimer = null, wrongStreak = 0;
    const limit = def.time ? CY.progress.timeFor(def, ease) : 0;

    const kb = new CY.Keyboard(ui.kbdWrap);
    const engine = new CY.TypingEngine({
      strict: !!def.strict,
      onKey: (k) => onKey(k),
      onComplete: (t) => mode.complete(t),
      onFocus: (t) => mode.focus && mode.focus(t),
    });
    engine.attach(ui.input);

    /* ---------- helpers shared by modes ---------- */
    const ctx = {
      def, ease, engine, ui, R, A, U,
      coach(text, mood = 'happy', ms = 2600) {
        ui.coach.textContent = text;
        ui.coachChar.innerHTML = A.character(guide, { size: 64, mood });
        ui.coach.classList.remove('pulse'); void ui.coach.offsetWidth; ui.coach.classList.add('pulse');
        clearTimeout(coachTimer);
        if (ms) coachTimer = setTimeout(() => { ui.coachChar.innerHTML = A.character(guide, { size: 64, mood: 'happy' }); }, ms);
      },
      progress() {
        const total = Math.max(R.items, 1), v = Math.min(1, (R.done + R.missed) / total);
        ui.prog.style.width = `${v * 100}%`;
        ui.progLabel.textContent = `${R.done + R.missed} / ${R.items}`;
        ui.progBar.setAttribute('aria-valuenow', Math.round(v * 100));
      },
      itemStart() { ctx._errAtStart = engine.stats.wrong; },
      itemPerfect() { return engine.stats.wrong === ctx._errAtStart; },
      success(anchor, label) {
        const perfect = ctx.itemPerfect();
        if (perfect) R.perfectItems++;
        CY.audio.play(perfect ? 'perfect' : 'item');
        CY.fx.float(anchor, perfect ? `Perfect! ${label || ''}` : label || 'Nice!', perfect ? 'gold' : 'ok');
      },
      finish: (reason) => finish(reason),
      eco(ev, anchor) {
        R.eco.push(ev);
        if (anchor) CY.fx.float(anchor, `${A.icon('globe', 18)} Planet ${ev.delta > 0 ? '+' : '−'}${Math.abs(ev.delta)}`, ev.delta > 0 ? 'planet' : 'bad');
      },
      get running() { return running && !paused; },
    };

    function onKey(k) {
      if (k.back) { refreshHud(); kb.showNext(engine.nextChar); return; }
      CY.audio.play(k.ok ? 'key' : 'miss');
      kb.press(k.ch, k.ok);
      if (k.ok) {
        wrongStreak = 0;
        if (k.combo === 15 || k.combo === 40 || k.combo === 80) {
          ctx.coach(U.pick([`Combo ×${k.mult}. Keep it going.`, `×${k.mult}. Don’t look down.`, `${k.combo} in a row. Steady.`]), 'cheer');
          ui.root.classList.remove('combo-flash'); void ui.root.offsetWidth; ui.root.classList.add('combo-flash');
        }
      } else {
        wrongStreak++;
        if (wrongStreak === 3) ctx.coach(def.strict ? 'Find the glowing key on the keyboard. No rush.' : 'Red letters need fixing. Backspace, then carry on.', 'think');
      }
      refreshHud();
      kb.showNext(engine.nextChar);
      if (mode.key) mode.key(k);
    }

    function refreshHud() {
      const s = engine.stats;
      st.wpm.textContent = Math.round(engine.wpm);
      st.cpm.textContent = Math.round(engine.cpm);
      st.acc.textContent = U.pct(engine.accuracy);
      st.err.textContent = s.wrong;
      st.combo.textContent = s.combo;
      st.mult.textContent = `×${engine.multiplier}`;
      st.mult.dataset.m = engine.multiplier;
      st.score.textContent = s.score;
    }

    /* ---------- timer loop ---------- */
    function loop(ts) {
      raf = requestAnimationFrame(loop);
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.25, (ts - lastTs) / 1000);
      lastTs = ts;
      if (!running || paused) return;
      elapsed += dt;
      if (limit) {
        const left = limit - elapsed;
        ui.time.textContent = U.fmtTime(left);
        ui.time.parentElement.classList.toggle('low', left <= 10);
        if (left <= 0) { finish('time'); return; }
      } else ui.time.textContent = U.fmtTime(elapsed);
      if (mode.tick) mode.tick(dt);
      if (Math.floor(elapsed * 2) !== Math.floor((elapsed - dt) * 2)) refreshHud();
    }

    /* ---------- pause / exit ---------- */
    function pause(auto) {
      if (!running || paused || finished) return;
      paused = true;
      engine.pause();
      ui.overlay.hidden = false;
      ui.overlay.innerHTML = `<div class="overlay-card pop"><h2>${auto ? 'Paused while you were away' : 'Paused'}</h2><p>Your timer and customers are waiting patiently.</p><button class="btn btn-primary resume">${A.icon('play', 18)} Resume</button></div>`;
      U.$('.resume', ui.overlay).focus();
      U.$('.resume', ui.overlay).onclick = resume;
    }
    function resume() {
      paused = false;
      ui.overlay.hidden = true;
      engine.resume();
      lastTs = 0;
      ui.input.focus({ preventScroll: true });
    }
    const onBlur = () => pause(true);
    window.addEventListener('blur', onBlur);
    $('.hud-pause').onclick = () => (paused ? resume() : pause(false));
    $('.hud-exit').onclick = async () => {
      const wasPaused = paused;
      if (running && !paused) { paused = true; engine.pause(); }
      const leave = await CY.fx.confirm('Leave this round?', 'Your progress in this round won’t be saved. You can try again any time.', 'Leave', 'Keep playing');
      if (leave) { cleanup(); opts.onExit && opts.onExit(); }
      else if (!wasPaused && running) { paused = false; engine.resume(); lastTs = 0; ui.input.focus({ preventScroll: true }); }
    };
    $('.hud-kbd').onclick = (e) => {
      kbVisible = !kbVisible;
      ui.kbdWrap.hidden = !kbVisible;
      e.currentTarget.classList.toggle('on', kbVisible);
      e.currentTarget.setAttribute('aria-pressed', kbVisible);
      kb.showNext(engine.nextChar);
      ui.input.focus({ preventScroll: true });
    };
    // iOS/Android only open the on-screen keyboard when focus happens inside the tap itself
    const focusInput = () => ui.input.focus({ preventScroll: true });
    ui.stage.addEventListener('click', focusInput);
    $('.tap-type').addEventListener('click', focusInput);
    ui.input.addEventListener('focus', () => ui.root.classList.add('typing-ready'));
    ui.input.addEventListener('blur', () => ui.root.classList.remove('typing-ready'));

    /* ---------- lifecycle ---------- */
    const mode = MODES[def.mode](ctx);
    mode.setup();
    ctx.progress();
    kb.showNext(engine.nextChar);
    if (!limit) ui.time.textContent = '0:00'; else ui.time.textContent = U.fmtTime(limit);

    async function countdown() {
      ui.overlay.hidden = false;
      for (const n of ['3', '2', '1']) {
        ui.overlay.innerHTML = `<div class="count-num" aria-live="assertive">${n}</div>`;
        CY.audio.play('tick');
        await U.sleep(U.reducedMotion() ? 350 : 600);
        if (finished) return;
      }
      ui.overlay.innerHTML = `<div class="count-num go">Go!</div>`;
      CY.audio.play('go');
      await U.sleep(350);
      ui.overlay.hidden = true;
      running = true;
      lastTs = 0;
      raf = requestAnimationFrame(loop);
      engine.start();
      if (mode.start) mode.start();
      kb.showNext(engine.nextChar);
      ui.input.focus({ preventScroll: true });
    }

    function result(reason) {
      const s = engine.stats;
      return {
        ...R, total: R.items, reason, timedOut: reason === 'time', ease,
        correct: s.correct, wrong: s.wrong, keys: s.total,
        acc: engine.accuracy, wpm: Math.round(engine.wpm), cpm: Math.round(engine.cpm),
        bestCombo: s.bestCombo, score: s.score, seconds: elapsed,
      };
    }
    function cleanup() {
      finished = true; running = false;
      cancelAnimationFrame(raf);
      clearTimeout(coachTimer);
      window.removeEventListener('blur', onBlur);
      engine.detach();
      if (mode.cleanup) mode.cleanup();
    }
    function finish(reason) {
      if (finished) return;
      if (reason === 'time') {
        if (mode.timeUp) mode.timeUp();
      }
      const r = result(reason);
      cleanup();
      ui.overlay.hidden = false;
      ui.overlay.innerHTML = `<div class="count-num done">${reason === 'time' ? 'Time!' : 'Done!'}</div>`;
      CY.audio.play(reason === 'time' ? 'tick' : 'complete');
      setTimeout(() => opts.onFinish && opts.onFinish(r), U.reducedMotion() ? 300 : 900);
    }

    setTimeout(countdown, 50);
    CY.play.current = { engine, R, def };
    return { finish, cleanup, engine };
  }

  /* =========================================================== *
   *  MODES                                                      *
   * =========================================================== */
  const MODES = {};

  /* ---------- SEQUENCE: one item at a time ---------- */
  MODES.sequence = (c) => {
    const { def, engine, ui, R, A, U: u } = c;
    let items = def.items.map((it) => (typeof it === 'string' ? { t: it } : { ...it }));
    if (def.shuffle) items = u.shuffle(items);
    if (def.count) items = items.slice(0, def.count);
    R.items = items.length;
    let idx = -1, patience = 0, patienceMax = 0, current = null, busy = false;
    const scene = def.scene;
    const s = ui.stage;
    const variants = items.map(() => Math.floor(Math.random() * 6));

    function layout() {
      if (scene === 'stock') {
        s.innerHTML = `<div class="stock-wrap">
          <div class="shelf-unit" aria-label="Pantry shelves">${Array.from({ length: Math.ceil(R.items / 4) }, (_, r) => `<div class="shelf">${Array.from({ length: 4 }, (_, k) => `<span class="slot" data-i="${r * 4 + k}"></span>`).join('')}</div>`).join('')}</div>
          <div class="crate-zone"><div class="crate card-pop"><div class="crate-art"></div><div class="crate-label"><small>Stock this</small><div class="target"></div></div></div>
          <p class="next-up"></p></div></div>`;
      } else if (scene === 'orders') {
        s.innerHTML = `<div class="orders-wrap">
          <div class="queue" aria-hidden="true"></div>
          <div class="customer-spot"><div class="customer"></div>
            <div class="speech"><p class="say"></p></div>
            <div class="patience" aria-label="Customer patience"><span></span></div>
          </div>
          <div class="order-pad"><div class="pad-head">${A.icon('ticket', 22)} Order ticket</div><div class="target"></div><small class="pad-hint">Type the order exactly</small></div>
        </div>`;
      } else if (scene === 'recipe' || scene === 'checklist') {
        s.innerHTML = `<div class="recipe-wrap ${scene}">
          <div class="recipe-card"><h3>${u.esc(def.recipe || 'Recipe')}</h3><ol class="steps">${items.map((it, i) => `<li data-i="${i}"><span class="tick">${A.icon('check', 16)}</span><span class="txt">${def.chooseOrder ? '???' : u.esc(it.t)}</span></li>`).join('')}</ol></div>
          <div class="cook-area"><div class="pot-art">${scene === 'checklist' ? clipSVG(0) : potSVG(0)}</div><div class="targets"></div></div>
        </div>`;
      } else if (scene === 'remake') {
        s.innerHTML = `<div class="remake-wrap">
          <div class="machine-line"><div class="mat from"></div><div class="machine">${machineSVG()}</div><div class="mat to"></div></div>
          <div class="step-dots">${items.map((_, i) => `<span data-i="${i}"></span>`).join('')}</div>
          <div class="target-card"><small>Workshop instruction</small><div class="target"></div></div>
        </div>`;
      } else {
        s.innerHTML = `<div class="daily-wrap"><div class="rail">${A.icon('ticket', 26)}<span>Daily Special</span></div><div class="target-card big"><div class="target"></div></div><p class="daily-count"><b>0</b> dishes served</p></div>`;
      }
    }

    function next() {
      idx++;
      busy = false;
      if (idx >= items.length) {
        if (scene === 'daily' && def.time) { items = items.concat(u.shuffle(items)); }
        else { c.finish('done'); return; }
      }
      current = items[idx];
      c.itemStart();
      if (scene === 'stock') {
        const art = /oil|syrup|sauce|milk|honey|butter/i.test(current.t) ? 'oil' : /rice|flour|oats|sugar|lentil|beans|pasta|chickpea/i.test(current.t) ? 'sack' : /tea|cumin|salt|cinnamon|paprika|seeds/i.test(current.t) ? 'spice' : /apple|lemon|mango|melon|pear|date|apricot/i.test(current.t) ? 'apple' : /basil|mint|garlic/i.test(current.t) ? 'leaf' : 'jar';
        u.$('.crate-art', s).innerHTML = A.item(art, 76);
        const crate = u.$('.crate', s);
        crate.classList.remove('card-pop', 'fly'); void crate.offsetWidth; crate.classList.add('card-pop');
        const nx = items[idx + 1];
        u.$('.next-up', s).textContent = nx ? `Next: ${nx.t.replace('\n', '')}` : 'Last one!';
        engine.add({ id: 'i' + idx, text: current.t, el: u.$('.target', s) });
        engine.lock('i' + idx);
      } else if (scene === 'orders') {
        const v = variants[idx];
        u.$('.customer', s).innerHTML = A.character('bao', { size: 150, mood: 'happy', variant: v, label: 'Customer' });
        const spot = u.$('.customer-spot', s);
        spot.classList.remove('arrive', 'leave-happy', 'leave-sad'); void spot.offsetWidth; spot.classList.add('arrive');
        u.$('.say', s).textContent = current.say || 'Hello!';
        u.$('.queue', s).innerHTML = items.slice(idx + 1, idx + 4).map((_, k) => A.character('bao', { size: 54, variant: variants[idx + 1 + k], mood: 'sleepy' })).join('');
        patienceMax = patience = (def.patience || 25) * c.ease;
        engine.add({ id: 'i' + idx, text: current.t, el: u.$('.order-pad .target', s) });
        engine.lock('i' + idx);
      } else if (scene === 'recipe' || scene === 'checklist') {
        const host = u.$('.targets', s);
        host.innerHTML = '';
        u.$$('.steps li', s).forEach((li) => li.classList.toggle('current', +li.dataset.i === idx));
        const mk = (text, id, decoy) => {
          const card = u.el(`<div class="step-card ${decoy ? 'decoy' : ''}"><small>${def.chooseOrder ? 'Is this next?' : `Step ${idx + 1}`}</small><div class="target"></div></div>`);
          host.appendChild(card);
          engine.add({ id, text, el: u.$('.target', card), data: { decoy, card } });
        };
        if (def.chooseOrder && idx < items.length - 1) {
          const later = items.slice(idx + 1);
          const decoy = u.pick(later).t;
          const order = Math.random() < 0.5;
          if (order) { mk(current.t, 'i' + idx, false); mk(decoy, 'd' + idx, true); } else { mk(decoy, 'd' + idx, true); mk(current.t, 'i' + idx, false); }
          engine.unlock();
        } else {
          mk(current.t, 'i' + idx, false);
          engine.lock('i' + idx);
        }
      } else if (scene === 'remake') {
        u.$('.mat.from', s).innerHTML = A.item(current.from || 'box', 70);
        u.$('.mat.to', s).innerHTML = A.item(current.to || 'paper', 70);
        u.$('.mat.to', s).style.opacity = 0.25 + 0.75 * (idx / items.length);
        u.$$('.step-dots span', s).forEach((d) => d.classList.toggle('current', +d.dataset.i === idx));
        engine.add({ id: 'i' + idx, text: current.t, el: u.$('.target', s) });
        engine.lock('i' + idx);
      } else {
        engine.add({ id: 'i' + idx, text: current.t, el: u.$('.target', s) });
        engine.lock('i' + idx);
      }
      c.progress();
    }

    function complete(t) {
      if (busy) return;
      if (t.data && t.data.decoy) {
        R.decisions++;
        CY.audio.play('wrong');
        c.coach('That one comes later. Do the other card first.', 'think');
        t.data.card.classList.add('rejected');
        engine.remove(t.id);
        setTimeout(() => t.data.card.remove(), 420);
        engine.lock('i' + idx);
        return;
      }
      if (def.chooseOrder && idx < items.length - 1) {
        const decoyStillThere = engine.targets.has('d' + idx);
        R.decisions++;
        R.decisionsRight++;
        if (decoyStillThere) engine.remove('d' + idx);
      }
      busy = true;
      R.done++;
      engine.remove(t.id);
      c.progress();
      const anchor = t.el;
      if (scene === 'stock') {
        c.success(anchor, '+1 stocked');
        const slot = u.$(`.slot[data-i="${R.done - 1}"]`, s);
        if (slot) { slot.innerHTML = u.$('.crate-art', s).innerHTML; slot.classList.add('filled'); }
        u.$('.crate', s).classList.add('fly');
      } else if (scene === 'orders') {
        R.served++;
        c.success(anchor, 'Order in!');
        u.$('.customer', s).innerHTML = A.character('bao', { size: 150, mood: 'cheer', variant: variants[idx] });
        u.$('.say', s).textContent = u.pick(['Perfect, ta.', 'Ooh, can’t wait.', 'That’s exactly it.', 'Lovely, thanks.', 'Spot on.']);
        setTimeout(() => u.$('.customer-spot', s).classList.add('leave-happy'), 380);
      } else if (scene === 'recipe' || scene === 'checklist') {
        c.success(anchor, scene === 'checklist' ? 'Checked!' : 'Step done!');
        const li = u.$(`.steps li[data-i="${idx}"]`, s);
        li.classList.add('done'); u.$('.txt', li).textContent = items[idx].t;
        u.$('.pot-art', s).innerHTML = scene === 'checklist' ? clipSVG(R.done / R.items) : potSVG(R.done / R.items);
      } else if (scene === 'remake') {
        c.success(anchor, 'Machine powered!');
        c.eco({ cat: 'circular', ok: true, delta: 1, step: true, item: current.t, why: CY.planet.CATS.circular.why });
        u.$(`.step-dots span[data-i="${idx}"]`, s).classList.add('done');
        const m = u.$('.machine', s); m.classList.remove('whirr'); void m.offsetWidth; m.classList.add('whirr');
      } else {
        R.served++;
        c.success(anchor, '+1 dish');
        u.$('.daily-count b', s).textContent = R.done;
      }
      setTimeout(next, scene === 'orders' ? 750 : 380);
    }

    function tick(dt) {
      if (scene !== 'orders' || busy || !current || !def.patience) return;
      patience -= dt;
      const p = Math.max(0, patience / patienceMax);
      const bar = u.$('.patience span', s);
      bar.style.width = `${p * 100}%`;
      bar.parentElement.classList.toggle('low', p < 0.3);
      const v = variants[idx];
      const mood = p < 0.25 ? 'sad' : p < 0.5 ? 'think' : 'happy';
      const cust = u.$('.customer', s);
      if (cust.dataset.mood !== mood) { cust.dataset.mood = mood; cust.innerHTML = A.character('bao', { size: 150, mood, variant: v }); }
      if (patience <= 0) {
        busy = true;
        R.missed++;
        engine.remove('i' + idx);
        CY.audio.play('leave');
        u.$('.say', s).textContent = u.pick(['Forget it, I’ll get a sandwich.', 'I’ll come back another time…', 'I really can’t wait any longer.']);
        c.eco({ cat: 'wasted', ok: false, delta: -1, item: 'A customer left before ordering', why: CY.planet.CATS.wasted.why });
        c.coach('They gave up waiting. Next customer’s already here.', 'sad');
        u.$('.customer-spot', s).classList.add('leave-sad');
        c.progress();
        setTimeout(next, 800);
      }
    }

    return {
      setup() { layout(); next(); },
      complete, tick,
      timeUp() { if (scene === 'daily') R.items = Math.max(R.items, R.done); },
    };
  };

  /* ---------- SERVICE: concurrent tickets with lock-on ---------- */
  MODES.service = (c) => {
    const { def, engine, ui, R, A, U: u } = c;
    const s = ui.stage;
    const count = def.count || 8, conc = def.concurrent || 2;
    R.items = count;
    const active = new Map();
    const cooling = new Set();
    let spawned = 0, spawnClock = 0, uid = 0;
    const tables = [1, 2, 3, 4, 5, 6];
    const variants = tables.map(() => Math.floor(Math.random() * 6));

    s.innerHTML = `<div class="service-wrap">
      <div class="ticket-rail" aria-label="Order tickets"></div>
      <p class="service-hint">Type a ticket’s <b>table number</b> to grab it, then finish the order.</p>
      <div class="tables">${tables.map((n) => `<div class="table-spot" data-t="${n}"><div class="seat"></div><div class="tbl">${tableSVG()}<span class="tnum">${n}</span></div></div>`).join('')}</div>
    </div>`;
    const rail = u.$('.ticket-rail', s);

    function spawn() {
      const free = tables.filter((n) => !cooling.has(n) && ![...active.values()].some((a) => a.table === n));
      if (!free.length) return;
      const table = u.pick(free), dish = u.pick(def.dishes);
      const id = 't' + uid++;
      const pat = (def.patience || 24) * c.ease * (def.varyPatience ? 0.6 + Math.random() * 0.6 : 1);
      const el = u.el(`<div class="ticket card-pop" data-id="${id}"><div class="ticket-top"><span>Table ${table}</span><i class="ring" style="--p:1"></i></div><div class="target"></div></div>`);
      rail.appendChild(el);
      const spot = u.$(`.table-spot[data-t="${table}"]`, s);
      spot.classList.add('busy');
      u.$('.seat', spot).innerHTML = A.character('bao', { size: 92, variant: variants[table - 1], mood: 'happy' });
      active.set(id, { id, table, el, spot, pat, max: pat });
      engine.add({ id, text: `${table} ${dish}`, el: u.$('.target', el), priority: 0 });
      spawned++;
      c.itemStart();
    }
    function resolve(a, served) {
      active.delete(a.id);
      a.el.classList.add(served ? 'served' : 'burnt');
      setTimeout(() => a.el.remove(), 420);
      const seat = u.$('.seat', a.spot);
      seat.innerHTML = A.character('bao', { size: 92, variant: variants[a.table - 1], mood: served ? 'cheer' : 'sad' });
      if (served) a.spot.insertAdjacentHTML('beforeend', `<div class="plate-drop">${A.item('meal', 40)}</div>`);
      cooling.add(a.table);
      setTimeout(() => { cooling.delete(a.table); a.spot.classList.remove('busy'); seat.innerHTML = ''; const p = u.$('.plate-drop', a.spot); if (p) p.remove(); }, 1100);
      c.progress();
      if (spawned >= count && active.size === 0) setTimeout(() => c.finish('done'), 500);
    }
    return {
      setup() {},
      start() { spawn(); },
      tick(dt) {
        spawnClock += dt;
        const gap = Math.max(2.5, (def.patience || 24) * 0.35);
        if (spawned < count && active.size < conc && (spawnClock >= gap || active.size === 0)) { spawnClock = 0; spawn(); }
        active.forEach((a) => {
          a.pat -= dt;
          const p = Math.max(0, a.pat / a.max);
          u.$('.ring', a.el).style.setProperty('--p', p.toFixed(3));
          a.el.classList.toggle('urgent', p < 0.3);
          engine.setPriority(a.id, 1 - p);
          if (a.pat <= 0) {
            R.missed++;
            engine.remove(a.id);
            CY.audio.play('leave');
            c.coach(`Table ${a.table} left hungry. The ring tells you who’s running out.`, 'sad');
            c.eco({ cat: 'wasted', ok: false, delta: -1, item: `Table ${a.table}’s meal went cold`, why: CY.planet.CATS.wasted.why });
            resolve(a, false);
          }
        });
      },
      complete(t) {
        const a = active.get(t.id);
        if (!a) return;
        R.done++; R.served++;
        c.success(t.el, `Table ${a.table} served!`);
        engine.remove(t.id);
        resolve(a, true);
      },
      timeUp() {},
    };
  };

  /* ---------- DECISION: choose the right action by typing it ---------- */
  MODES.decision = (c) => {
    const { def, engine, ui, R, A, U: u } = c;
    const s = ui.stage, scene = def.scene;
    let items = def.items.slice();
    if (def.shuffle) items = u.shuffle(items);
    if (def.count) items = items.slice(0, def.count);
    R.items = items.length;
    let idx = -1, phase = 'choose', current = null, wasWrong = false, opts = [];
    const title = { sort: 'Where does it go?', rescue: 'What’s the safest action?', match: 'What can it become?', eco: 'What’s the greener choice?' }[scene] || 'Choose';
    const label = (o) => (OPTION_INFO[o] || { label: o.charAt(0).toUpperCase() + o.slice(1) }).label;
    const hint = (o) => (o === 'compost' && scene === 'rescue' ? RESCUE_COMPOST_HINT : (OPTION_INFO[o] || {}).hint || '');

    s.innerHTML = `<div class="decision-wrap ${scene}">
      <div class="item-card"><div class="item-art"></div><div class="item-info"><small class="q">${title}</small><h2 class="item-name"></h2><p class="item-detail"></p></div></div>
      <div class="feedback" aria-live="polite"></div>
      <div class="then-card" hidden><small>Now do it</small><div class="target"></div></div>
      <div class="options"></div>
    </div>`;

    function buildOptions(list) {
      opts = list;
      u.$('.options', s).innerHTML = list.map((o) => `<div class="option" data-o="${u.esc(o)}"><div class="opt-art">${scene === 'eco' ? A.icon('target', 40) : optionArt(scene, o)}</div><div class="opt-label"><b>${u.esc(label(o))}</b>${def.hints ? `<small>${hint(o)}</small>` : ''}</div><div class="target opt-target"></div></div>`).join('');
    }
    function addOptions(only) {
      u.$$('.option', s).forEach((el) => {
        const o = el.dataset.o;
        el.classList.remove('chosen', 'right', 'wrong', 'disabled');
        if (only && o !== only) { el.classList.add('disabled'); u.$('.opt-target', el).innerHTML = ''; return; }
        engine.add({ id: 'o-' + o, text: o, el: u.$('.opt-target', el), data: { option: o, el } });
      });
      if (only) engine.lock('o-' + only); else engine.unlock();
    }
    function clearOptions() { opts.forEach((o) => engine.remove('o-' + o)); u.$$('.opt-target', s).forEach((e) => (e.innerHTML = '')); }

    function next() {
      idx++;
      if (idx >= items.length) { c.finish('done'); return; }
      current = items[idx];
      phase = 'choose'; wasWrong = false;
      c.itemStart();
      const card = u.$('.item-card', s);
      card.classList.remove('card-pop', 'drop', 'shake'); void card.offsetWidth; card.classList.add('card-pop');
      u.$('.item-art', s).innerHTML = A.item(current.i, 92);
      u.$('.item-name', s).textContent = current.n;
      u.$('.item-detail', s).innerHTML = (current.d || '').split(' · ').map((x) => `<span class="tag">${u.esc(x)}</span>`).join('');
      u.$('.feedback', s).innerHTML = '';
      u.$('.then-card', s).hidden = true;
      const list = current.opts ? u.shuffle(current.opts) : def.options;
      if (list.join('|') !== opts.join('|')) buildOptions(list);
      addOptions(null);
      c.progress();
    }
    function resolveItem() {
      R.done++;
      c.progress();
      setTimeout(next, 1250);
    }
    function credit() {
      if (scene === 'sort') R.sortedRight++;
      else if (scene === 'rescue') R.rescuedRight++;
      else if (scene === 'eco') R.ecoRight = (R.ecoRight || 0) + 1;
      else R.remadeRight++;
    }
    return {
      setup() { next(); },
      complete(t) {
        if (phase === 'then') {
          engine.remove(t.id);
          c.success(t.el, 'Done!');
          phase = 'wait';
          resolveItem();
          return;
        }
        const chosen = t.data.option, optEl = t.data.el;
        if (phase === 'choose') R.decisions++;
        if (scene === 'rescue' && phase === 'choose') R.safetyTotal++;
        const right = chosen === current.a;
        const fb = u.$('.feedback', s);
        if (phase === 'choose') c.eco(CY.planet.eventFor(scene, current, right), right ? null : u.$('.item-card', s));
        if (right) {
          if (phase === 'choose') { R.decisionsRight++; credit(); if (scene === 'rescue') R.safetyRight++; }
          clearOptions();
          optEl.classList.add('chosen', 'right');
          const card = u.$('.item-card', s); card.classList.add('drop');
          if (!wasWrong) { c.success(optEl, 'Right!'); setTimeout(() => CY.fx.float(u.$('.item-card', s), `${A.icon('globe', 18)} Planet +2`, 'planet'), 260); } else CY.audio.play('item');
          fb.innerHTML = `<p class="fb ok">${A.icon('check', 20)}<span><b>${wasWrong ? 'That’s the one.' : 'Right.'}</b> ${u.esc(current.why || '')}</span></p>`;
          if (current.then) {
            phase = 'then';
            const tc = u.$('.then-card', s);
            setTimeout(() => {
              if (phase !== 'then') return;
              tc.hidden = false;
              c.itemStart();
              engine.add({ id: 'then', text: current.then, el: u.$('.target', tc) });
              engine.lock('then');
            }, 500);
          } else { phase = 'wait'; resolveItem(); }
        } else {
          wasWrong = true;
          CY.audio.play('wrong');
          optEl.classList.add('wrong');
          const card = u.$('.item-card', s); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
          fb.innerHTML = `<p class="fb bad">${A.icon('info', 20)}<span><b>Not this one. It’s “${u.esc(label(current.a))}”.</b> ${u.esc(current.why || '')} Type <b>${u.esc(current.a)}</b> to continue.</span></p>`;
          c.coach(U.pick(['Now you know.', 'Tricky one, that.', 'Plenty of people get that one wrong.']), 'think');
          clearOptions();
          phase = 'fix';
          setTimeout(() => addOptions(current.a), 250);
        }
      },
    };
  };

  /* ---------- small scene art ---------- */
  function potSVG(p) {
    const fill = ['#FFE3D3', '#FFC4A3', '#FF9A4D', '#FF7A6B', '#E0584A'][Math.min(4, Math.floor(p * 4.99))];
    const steam = p > 0 ? `<g class="steam" stroke="#C9BFD6" stroke-width="5" fill="none" stroke-linecap="round" opacity="${0.4 + p * 0.6}"><path d="M70 40 q-8 -10 0 -18 q8 -8 0 -18"/><path d="M100 36 q-8 -10 0 -18 q8 -8 0 -18"/><path d="M130 40 q-8 -10 0 -18 q8 -8 0 -18"/></g>` : '';
    return `<svg viewBox="0 0 200 170" width="220" aria-hidden="true">${steam}
      <ellipse cx="100" cy="158" rx="80" ry="8" fill="#3D2F4F" opacity=".12"/>
      <path d="M26 70 h148 v54 q0 30 -30 30 H56 q-30 0 -30 -30z" fill="#8ED1F2" stroke="#3D2F4F" stroke-width="4"/>
      <ellipse cx="100" cy="70" rx="74" ry="14" fill="${fill}" stroke="#3D2F4F" stroke-width="4"/>
      ${p > 0.3 ? '<circle cx="80" cy="68" r="5" fill="#fff" opacity=".7"/><circle cx="118" cy="72" r="4" fill="#fff" opacity=".6"/>' : ''}
      ${p > 0.6 ? '<path d="M96 62 l8 -10 l4 10z" fill="#6DB36A" stroke="#3D2F4F" stroke-width="2"/>' : ''}
      <rect x="6" y="76" width="22" height="12" rx="6" fill="#3E9FD0" stroke="#3D2F4F" stroke-width="4"/><rect x="172" y="76" width="22" height="12" rx="6" fill="#3E9FD0" stroke="#3D2F4F" stroke-width="4"/>
      <path d="M50 104 q50 18 100 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>
    </svg>`;
  }
  function clipSVG(p) {
    const n = 5, done = Math.round(p * n);
    return `<svg viewBox="0 0 160 190" width="170" aria-hidden="true">
      <rect x="14" y="20" width="132" height="164" rx="12" fill="#C98B5B" stroke="#3D2F4F" stroke-width="4"/>
      <rect x="28" y="34" width="104" height="140" rx="6" fill="#FFF6E6" stroke="#3D2F4F" stroke-width="3"/>
      <rect x="52" y="10" width="56" height="22" rx="7" fill="#C9BFD6" stroke="#3D2F4F" stroke-width="3.5"/>
      ${Array.from({ length: n }, (_, i) => `<rect x="40" y="${52 + i * 24}" width="14" height="14" rx="3" fill="${i < done ? '#9CCB8E' : '#fff'}" stroke="#3D2F4F" stroke-width="2.5"/>${i < done ? `<path d="M43 ${59 + i * 24} l3 3 6 -7" stroke="#1F4A2A" stroke-width="2.6" fill="none"/>` : ''}<path d="M62 ${59 + i * 24} h56" stroke="#3D2F4F" stroke-width="3" stroke-linecap="round" opacity="${i < done ? 0.35 : 0.8}"/>`).join('')}
    </svg>`;
  }
  function machineSVG() {
    return `<svg viewBox="0 0 160 130" width="170" aria-hidden="true">
      <rect x="20" y="20" width="120" height="96" rx="14" fill="#D9CCF2" stroke="#3D2F4F" stroke-width="4"/>
      <rect x="36" y="34" width="88" height="44" rx="8" fill="#fff" stroke="#3D2F4F" stroke-width="3"/>
      <g class="gear"><circle cx="64" cy="56" r="13" fill="none" stroke="#6DB36A" stroke-width="7" stroke-dasharray="5 4"/></g>
      <g class="gear rev"><circle cx="98" cy="56" r="10" fill="none" stroke="#FF7A6B" stroke-width="6" stroke-dasharray="4 3.5"/></g>
      <circle cx="46" cy="98" r="7" fill="#FFD966" stroke="#3D2F4F" stroke-width="3"/><circle cx="70" cy="98" r="7" fill="#8ED1F2" stroke="#3D2F4F" stroke-width="3"/>
      <rect x="90" y="92" width="34" height="12" rx="5" fill="#9CCB8E" stroke="#3D2F4F" stroke-width="3"/>
      <path d="M0 116 h160" stroke="#3D2F4F" stroke-width="5"/>
    </svg>`;
  }
  function tableSVG() {
    return `<svg viewBox="0 0 90 60" width="110" aria-hidden="true"><ellipse cx="45" cy="14" rx="42" ry="12" fill="#FFF6E6" stroke="#3D2F4F" stroke-width="3"/><path d="M4 14 Q45 34 86 14 L84 22 Q45 42 6 22Z" fill="#FF7A6B" stroke="#3D2F4F" stroke-width="2.5"/><path d="M45 30 v26 M30 57 h30" stroke="#3D2F4F" stroke-width="5" stroke-linecap="round"/></svg>`;
  }

  return { run, OPTION_INFO };
})();
