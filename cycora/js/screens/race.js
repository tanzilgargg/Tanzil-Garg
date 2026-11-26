/* CYCORA · Typing Races
   Race AI chefs and a ghost of your personal best on scooter lanes.
   Your scooter only moves on CORRECT letters (wrong letters must be fixed first),
   and every mistake adds a 0.4 s penalty to your finish time — so the race
   is won with speed AND accuracy. AI opponents stumble according to their accuracy.
   Opponents come from CY.race.opponents(), the single place to plug in real
   multiplayer players later. */
(() => {
  const U = CY.util, A = CY.art, P = () => CY.progress;
  const PENALTY = 0.4;

  const TRACKS = [
    { id: 'sprint', name: 'Espresso Sprint', level: 'Easy · about a minute', desc: 'Short sentences, no capitals. Counts as a one-minute challenge.', factor: 1, color: '#FFC4A3',
      texts: ['fresh basil and ripe tomatoes make a happy little salad for the lunch rush today', 'stir the soup slowly and taste it before you add a pinch of salt and pepper', 'the chef waves hello as the first warm loaves come out of the oven', 'sort the peelings into the compost bin and rinse the jars for recycling'] },
    { id: 'lunch', name: 'Lunch Rush Relay', level: 'Medium · capitals & punctuation', desc: 'Orders and instructions with commas and full stops.', factor: 0.95, color: '#8ED1F2',
      texts: ['Table four wants two veggie wraps, no onions. Table six asks for soup with bread on the side, please!', 'Chop the peppers, heat the wok, then add a splash of oil. Toss everything quickly and serve it hot.', 'Welcome in! Today we have lentil soup, a nut-free brownie and fresh mint tea. What can I get you?'] },
    { id: 'eco', name: 'Green Grand Prix', level: 'Hard · numbers & long words', desc: 'Sustainability instructions with numbers and units.', factor: 0.9, color: '#9CCB8E',
      texts: ['Rinse 12 jars, flatten 8 boxes and compost 3 kg of peelings. Every clean, sorted item gets a second life!', 'Cool the rice within 1 hour, label the soup with today’s date, and freeze 6 spare loaves for next week.', 'Collect 20 litres of used cooking oil, seal the drum and book a pickup. It will become biodiesel!'] },
  ];
  const LANE_COLORS = ['#FF7A6B', '#FFD966', '#9B7BC4', '#9CCB8E'];

  /** Estimate the player's speed from recent rounds (falls back to a beginner pace). */
  function ability() {
    const h = CY.store.s.history.slice(-6).filter((r) => r.wpm > 0);
    const avg = h.length ? h.reduce((a, r) => a + r.wpm, 0) / h.length : 18;
    return U.clamp(avg, 12, 90);
  }

  CY.race = {
    TRACKS,
    /** AI opponents (swap for real players in a multiplayer build). */
    opponents(track, seed = Date.now()) {
      const rnd = U.seeded(seed), base = ability() * track.factor;
      const names = U.shuffle(CY.data.rivals, rnd).slice(0, 3);
      return names.map((r, i) => ({ name: r.name, av: r.av, ai: true, wpm: Math.round(base * [0.78, 0.98, 1.18][i] * (0.92 + rnd() * 0.16)), acc: 0.9 + rnd() * 0.08, color: LANE_COLORS[i + 1] }));
    },
  };

  CY.screens.race = (host) => {
    const s = CY.store.s;
    let timers = [];
    CY.app.onLeave(() => timers.forEach((t) => clearTimeout(t)));

    /* ===================== LOBBY ===================== */
    const lobby = () => {
      host.innerHTML = `<section class="race-lobby screen-in">
        <header class="page-head">
          <div class="ph-char">${A.character('cy', { size: 110, mood: 'cheer', cls: 'bob' })}</div>
          <div><h1>Typing Races</h1><p>Race AI chefs and the ghost of your best run. Your scooter only moves on correct letters, and <b>every mistake adds ${PENALTY}s</b> to your time, so speed <i>and</i> accuracy win.</p></div>
          <div class="wallet">${A.icon('flag', 34)}<b>${s.races.wins}</b><small>wins</small></div>
        </header>
        <div class="track-grid">${TRACKS.map((t) => {
          const rec = s.races.records[t.id];
          return `<article class="track-card" style="--tc:${t.color}">
            <div class="tc-top"><div class="tc-flag">${A.icon('flag', 30)}</div><div><h2>${t.name}</h2><small>${t.level}</small></div></div>
            <p>${t.desc}</p>
            <div class="tc-record">${rec ? `${A.icon('trophy', 20)} Your record: <b>${rec.time.toFixed(1)}s</b> · ${rec.wpm} WPM · ${U.pct(rec.acc)}<br><small>Your ghost will race you!</small>` : `${A.icon('info', 20)} No record yet. Set one to unlock your ghost racer.`}</div>
            <button class="btn btn-primary go" data-t="${t.id}">${A.icon('play', 18)} Race</button>
          </article>`;
        }).join('')}</div>
        <p class="muted league-note">${A.icon('info', 18)} Opponents are AI chefs matched to your recent speed. Live races against other players can plug in later.</p>
      </section>`;
      U.$$('.go', host).forEach((b) => (b.onclick = () => { CY.audio.unlock(); run(TRACKS.find((t) => t.id === b.dataset.t)); }));
    };

    /* ===================== RACE ===================== */
    const run = (track) => {
      const text = U.pick(track.texts);
      const len = text.length;
      const rec = s.races.records[track.id];
      const racers = [
        { name: s.profile.name, av: s.profile.avatar, me: true, color: '#8ED1F2', p: 0, fin: null },
        ...CY.race.opponents(track).map((o) => ({ ...o, p: 0, fin: null, stall: 0 })),
      ];
      if (rec && rec.samples && rec.samples.length) racers.push({ name: 'Your ghost', av: s.profile.avatar, ghost: true, color: '#C9BFD6', p: 0, fin: null, rec });

      document.body.classList.add('in-play');
      host.innerHTML = `<section class="race screen-in" style="--tc:${track.color}"><h1 class="sr-only">${track.name} race</h1>
        <header class="hud">
          <button class="icon-btn r-exit" aria-label="Leave race">${A.icon('close', 22)}</button>
          <div class="race-title"><b>${track.name}</b><small>${racers.length} racers</small></div>
          <div class="chip r-pos" aria-live="polite">${A.icon('flag', 20)} <b>–</b></div>
          <div class="hud-timer chip">${A.icon('clock', 20)}<b class="r-time">0.0s</b></div>
        </header>
        <div class="hud-stats race-stats" aria-hidden="true">
          <div class="stat"><small>WPM</small><b class="r-wpm">0</b></div>
          <div class="stat"><small>Accuracy</small><b class="r-acc">100%</b></div>
          <div class="stat stat-err"><small>Mistakes</small><b class="r-err">0</b></div>
          <div class="stat"><small>Penalty</small><b class="r-pen">+0.0s</b></div>
        </div>
        <div class="track" role="img" aria-label="Race track">
          ${racers.map((r, i) => `<div class="lane ${r.me ? 'me' : ''} ${r.ghost ? 'ghost-lane' : ''}"><span class="lane-name">${U.esc(r.name)}${r.ai ? ` <small>${r.wpm} WPM</small>` : ''}</span><div class="lane-run"><div class="racer" data-i="${i}">${A.racer(r.av, { size: 84, color: r.color, ghost: r.ghost, label: r.name })}</div></div></div>`).join('')}
          <div class="finish-line" aria-hidden="true"></div>
          <div class="lights" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="coach"><div class="coach-char">${A.character('cy', { size: 64, mood: 'cheer' })}</div><p class="coach-bubble r-say" aria-live="polite">Type the passage below when the lights go green. Mistakes cost you time.</p></div>
        <div class="passage-card"><small>Type this passage <span class="tap-hint">(tap here to open the keyboard)</span></small><div class="target r-target"></div></div>
        <input class="type-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Typing input for the race" />
      </section>`;

      const $ = (q) => U.$(q, host);
      const input = $('.type-input');
      const racerEls = U.$$('.racer', host);
      let elapsed = 0, lastTs = 0, raf = null, running = false, done = false, lastPos = null, sampleClock = 0;
      const samples = [];

      const engine = new CY.TypingEngine({
        strict: false,
        onKey: (k) => {
          if (k.back) return;
          CY.audio.play(k.ok ? 'key' : 'miss');
          if (!k.ok && engine.stats.wrong % 4 === 1) say(U.pick([`That’s another ${PENALTY}s on your time.`, `Easy. Each slip costs ${PENALTY}s.`]), 'think');
          hud();
        },
        onComplete: () => finish(),
      });
      engine.attach(input);
      engine.add({ id: 'p', text, el: $('.r-target') });
      engine.lock('p');

      const say = (t, mood = 'cheer') => { $('.r-say').textContent = t; U.$('.coach-char', host).innerHTML = A.character('cy', { size: 64, mood }); };
      const correctLen = () => { let n = 0; while (n < engine.typed.length && engine.typed[n] === text[n]) n++; return n; };
      const hud = () => {
        $('.r-wpm').textContent = Math.round(engine.wpm);
        $('.r-acc').textContent = U.pct(engine.accuracy);
        $('.r-err').textContent = engine.stats.wrong;
        $('.r-pen').textContent = `+${(engine.stats.wrong * PENALTY).toFixed(1)}s`;
      };
      const order = () => racers.slice().sort((a, b) => (a.fin != null && b.fin != null ? a.fin - b.fin : a.fin != null ? -1 : b.fin != null ? 1 : b.p - a.p));

      function tick(ts) {
        raf = requestAnimationFrame(tick);
        if (!lastTs) lastTs = ts;
        const dt = Math.min(0.1, (ts - lastTs) / 1000);
        lastTs = ts;
        if (!running) return;
        elapsed += dt;
        const me = racers[0];
        me.p = engine.typed === text ? 1 : correctLen() / len;
        sampleClock += dt;
        if (sampleClock >= 0.25) { sampleClock = 0; samples.push(Math.round(me.p * 1000)); }
        racers.forEach((r) => {
          if (r.ai && r.fin == null) {
            if (r.stall > 0) r.stall -= dt;
            else {
              r.p += ((r.wpm * 5) / 60 / len) * dt * (0.85 + Math.random() * 0.3);
              if (Math.random() < (1 - r.acc) * 2.6 * dt * (r.wpm / 20)) r.stall = PENALTY; // a stumble = a mistake
            }
            if (r.p >= 1) { r.p = 1; r.fin = elapsed; }
          }
          if (r.ghost && r.fin == null) {
            const sm = r.rec.samples, k = elapsed / 0.25;
            const a = sm[Math.min(sm.length - 1, Math.floor(k))] || 0, b = sm[Math.min(sm.length - 1, Math.ceil(k))] || 0;
            r.p = Math.min(1, (a + (b - a) * (k % 1)) / 1000);
            if (elapsed >= r.rec.time) { r.p = 1; r.fin = r.rec.time; }
          }
        });
        racerEls.forEach((el, i) => el.style.setProperty('--p', racers[i].p.toFixed(4)));
        $('.r-time').textContent = `${elapsed.toFixed(1)}s`;
        const pos = order().findIndex((r) => r.me) + 1;
        $('.r-pos b').textContent = `${P().ordinal(pos)} / ${racers.length}`;
        if (lastPos && pos !== lastPos) {
          const o = order();
          if (pos < lastPos) say(pos === 1 ? `Past ${o[pos].name}. You’re out in front.` : `You’ve passed ${o[pos].name}.`, 'cheer');
          else say(`${o[pos - 2].name} just nipped past you. Stay calm.`, 'wow');
        }
        lastPos = pos;
        if (me.p > 0.8 && !me.said) { me.said = true; say('Nearly there. Don’t fumble it now.', 'wow'); }
        if (Math.floor(elapsed * 2) !== Math.floor((elapsed - dt) * 2)) hud();
      }

      async function lights() {
        const ls = U.$$('.lights i', host);
        for (let i = 0; i < 3; i++) { ls[i].classList.add('on'); CY.audio.play('tick'); await U.sleep(U.reducedMotion() ? 300 : 650); if (done) return; }
        U.$('.lights', host).classList.add('go');
        CY.audio.play('go');
        say('Go!', 'cheer');
        running = true;
        engine.start();
        input.focus({ preventScroll: true });
        timers.push(setTimeout(() => U.$('.lights', host) && U.$('.lights', host).classList.add('hide'), 700));
      }

      function cleanup() {
        done = true; running = false;
        cancelAnimationFrame(raf);
        engine.detach();
        window.removeEventListener('blur', onBlur);
        document.body.classList.remove('in-play');
      }
      const onBlur = () => { if (running) { running = false; engine.pause(); say('Paused. Click the passage to carry on.', 'sleepy'); } };
      window.addEventListener('blur', onBlur);
      $('.passage-card').addEventListener('click', () => { if (!running && !done && elapsed > 0) { running = true; engine.resume(); lastTs = 0; say('Right, where were we.', 'cheer'); } input.focus({ preventScroll: true }); });
      $('.r-exit').onclick = async () => {
        const was = running; running = false; engine.pause();
        if (await CY.fx.confirm('Leave the race?', 'This race won’t count. You can start a new one any time.', 'Leave', 'Keep racing')) { cleanup(); lobby(); }
        else if (was) { running = true; engine.resume(); lastTs = 0; input.focus({ preventScroll: true }); }
      };
      CY.app.onLeave(cleanup);

      function finish() {
        if (done) return;
        const me = racers[0];
        me.p = 1;
        const raw = elapsed, pen = engine.stats.wrong * PENALTY;
        me.fin = raw + pen;
        samples.push(1000);
        // project unfinished opponents to their finish time
        racers.forEach((r) => {
          if (r.fin == null && r.ai) r.fin = elapsed + ((1 - r.p) * len) / ((r.wpm * 5) / 60) + (1 - r.acc) * 10 * PENALTY;
          if (r.fin == null && r.ghost) r.fin = r.rec.time;
        });
        const wpm = Math.round(engine.wpm), acc = engine.accuracy;
        cleanup();
        racerEls[0].style.setProperty('--p', 1);
        const final = racers.slice().sort((a, b) => a.fin - b.fin);
        const place = final.findIndex((r) => r.me) + 1;
        samples.chars = engine.stats.correct;
        const res = P().completeRace({ trackId: track.id, place, field: racers.length, wpm, acc, time: me.fin, samples: samples.slice(), finished: true });
        CY.audio.play(place === 1 ? 'complete' : 'item');
        timers.push(setTimeout(() => results(track, final, place, { wpm, acc, raw, pen }, res), 900));
      }

      lights();
      raf = requestAnimationFrame(tick);
    };

    /* ===================== RESULTS ===================== */
    const results = (track, final, place, me, res) => {
      const podium = final.slice(0, 3);
      const title = place === 1 ? 'You won.' : place <= 3 ? `${P().ordinal(place)} place. On the podium.` : `You came ${P().ordinal(place)}.`;
      host.innerHTML = `<section class="race-results screen-in" style="--tc:${track.color}">
        <div class="res-hero">
          <div class="res-char">${A.character('cy', { size: 140, mood: place <= 3 ? 'cheer' : 'think', cls: place === 1 ? 'jump' : 'bob' })}</div>
          <div><p class="pill">${track.name}</p><h1>${title}</h1>
          <p class="res-sub">${place === 1 ? 'Nobody in the kitchen typed faster than that.' : place <= 3 ? 'Close. Another go might do it.' : 'Your ghost will be easier to beat next time. Go again?'}</p></div>
        </div>
        <div class="podium" aria-label="Podium">${[1, 0, 2].map((k) => podium[k] ? `<div class="pod p${k + 1} ${podium[k].me ? 'me' : ''}"><div class="pod-racer">${A.racer(podium[k].av, { size: 100, color: podium[k].color, ghost: podium[k].ghost, label: podium[k].name })}</div><div class="pod-block"><b>${k + 1}</b><span>${U.esc(podium[k].name)}</span></div></div>` : '').join('')}</div>
        <div class="race-table-wrap"><table class="race-table"><thead><tr><th>Pos</th><th>Racer</th><th>Time</th><th>WPM</th><th>Accuracy</th></tr></thead><tbody>
          ${final.map((r, i) => `<tr class="${r.me ? 'me' : ''}"><td>${P().ordinal(i + 1)}</td><td>${U.esc(r.name)}${r.ghost ? ' <small>(best run)</small>' : r.ai ? ' <small>(AI)</small>' : ''}</td><td>${r.fin.toFixed(1)}s</td><td>${r.me ? me.wpm : r.ghost ? r.rec.wpm : r.wpm}</td><td>${r.me ? U.pct(me.acc) : r.ghost ? U.pct(r.rec.acc) : U.pct(r.acc)}</td></tr>`).join('')}
        </tbody></table>
        <p class="muted small">Your time: ${me.raw.toFixed(1)}s typing + ${me.pen.toFixed(1)}s mistake penalty.</p></div>
        <div class="res-rewards">
          <div class="xp-list"><h2>Race rewards</h2><ul>${res.xpLines.map(([l, n]) => `<li><span>${l}</span><b>+${n} XP</b></li>`).join('')}</ul></div>
          <div class="reward-totals">
            <div class="reward xp">${A.icon('bolt', 34)}<b>+${res.xp}</b><small>XP</small></div>
            <div class="reward coin">${A.icon('coin', 34)}<b>+${res.coins}</b><small>coins</small></div>
            ${res.isPb ? `<div class="reward streak">${A.icon('trophy', 34)}<b>PB</b><small>new record</small></div>` : ''}
          </div>
        </div>
        ${res.isPb ? `<p class="res-unlock">${A.icon('sparkle', 22)} <b>New personal record: ${final.find((r) => r.me).fin.toFixed(1)}s.</b> ${res.prevRecord ? `Beat your old ${res.prevRecord.time.toFixed(1)}s!` : 'Your ghost will race you next time.'}</p>` : ''}
        <div class="res-actions">
          <button class="btn btn-soft lob">${A.icon('flag', 20)} All tracks</button>
          <a class="btn btn-soft" href="#/">${A.icon('home', 20)} Restaurant</a>
          <button class="btn btn-primary again">${A.icon('refresh', 20)} Race again <kbd>Enter</kbd></button>
        </div>
      </section>`;
      if (place <= 3) CY.fx.confetti({ count: place === 1 ? 180 : 90 });
      CY.fx.announce(`${title} Time ${final.find((r) => r.me).fin.toFixed(1)} seconds, ${me.wpm} words per minute, ${U.pct(me.acc)} accuracy.`);
      timers.push(setTimeout(() => CY.fx.achievementToasts(res.newAch), 900));
      if (res.levelUp) timers.push(setTimeout(() => CY.lesson.levelUpModal(res.levelUp), 1600));
      const onKey = (e) => { if (e.key === 'Enter' && !document.querySelector('.modal-wrap')) { e.preventDefault(); again(); } };
      let alive = true;
      const off = () => { alive = false; document.removeEventListener('keydown', onKey); };
      const again = () => { off(); run(track); };
      U.$('.lob', host).onclick = () => { off(); lobby(); };
      U.$('.again', host).onclick = again;
      timers.push(setTimeout(() => { if (alive) document.addEventListener('keydown', onKey); }, 600));
      CY.app.onLeave(off);
      U.$('.again', host).focus({ preventScroll: true });
    };

    lobby();
  };
})();
