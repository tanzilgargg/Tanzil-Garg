/* CYCORA · THE RESTAURANT LICENCE CHALLENGE
   A full restaurant shift in six stages that reuses every mechanic from the worlds,
   then scores six categories and awards a licence with strengths & next steps. */
(() => {
  const U = CY.util, A = CY.art, P = () => CY.progress;

  const ECO = [
    { n: 'Oven left on', d: 'Between lunch and dinner · idle for 3 hours', i: 'meal', opts: ['switch it off', 'keep it hot'], a: 'switch it off', why: 'Idle ovens waste energy. Preheat again closer to service.' },
    { n: 'Washing vegetables', d: 'Tap running the whole time', i: 'veg', opts: ['use a bowl', 'keep it running'], a: 'use a bowl', why: 'A bowl of water cleans veg just as well and saves litres.' },
    { n: 'Dishwasher', d: 'Only 6 plates inside', i: 'plate', opts: ['wait until full', 'run it now'], a: 'wait until full', why: 'Full loads use far less water and energy per plate.' },
    { n: 'Ordering tomatoes', d: 'Local farm · or flown in from abroad', i: 'apple', opts: ['buy local', 'fly them in'], a: 'buy local', why: 'Local, seasonal produce cuts transport emissions.' },
    { n: 'Takeaway order', d: 'Customer brought their own box', i: 'box', opts: ['use their box', 'new plastic box'], a: 'use their box', why: 'Reusables beat single-use packaging every time.' },
    { n: 'Fridge door', d: 'Propped open during prep', i: 'milk', opts: ['close it', 'leave it open'], a: 'close it', why: 'An open fridge wastes energy and lets food warm up.' },
    { n: 'Big plates, lots left over', d: 'Rice left on most plates', i: 'rice', opts: ['offer smaller portions', 'serve even more'], a: 'offer smaller portions', why: 'Right-sized portions prevent food waste at the source.' },
  ];

  const ordersPool = () => CY.data.world(2).lessons.slice(1).flatMap((l) => l.items);

  function buildStages() {
    const sh = U.shuffle;
    return [
      { key: 'open', name: 'Open Up', icon: 'home', guide: 'cy', brief: 'Opening checks first. The sign only gets flipped when they’re done.',
        def: { id: 'lic-open', world: 1, title: 'Opening Checklist', objective: 'Complete every opening check.', tip: 'Read each check properly. They’re what keep guests safe.', mode: 'sequence', scene: 'checklist', recipe: 'Opening Checklist', strict: false, wpm: 18,
          items: ['wash your hands', 'check the fridge is cold', 'wipe down the counters', 'switch on the lights', 'flip the sign to open'] } },
      { key: 'orders', name: 'Take Orders', icon: 'ticket', guide: 'bao', brief: 'Doors are open and people are queuing. Get their orders down right.',
        def: { id: 'lic-orders', world: 2, title: 'Front of House', objective: 'Take every order exactly.', tip: 'Allergies and requests must be typed exactly.', mode: 'sequence', scene: 'orders', patience: 20, wpm: 18, items: sh(ordersPool()).slice(0, 5) } },
      { key: 'service', name: 'Cook & Serve', icon: 'bolt', guide: 'zippy', brief: 'Tickets are piling up. Table number first, then the dish, before the rings run out.',
        def: { id: 'lic-service', world: 4, title: 'Dinner Rush', objective: 'Serve every table.', tip: 'Serve the most impatient table first.', mode: 'service', concurrent: 3, count: 8, patience: 24, varyPatience: true, time: 95, wpm: 18,
          dishes: ['tomato soup', 'veggie curry', 'mushroom pasta', 'side salad', 'tacos', 'risotto', 'dumplings', 'falafel wrap', 'lemon tart'] } },
      { key: 'sort', name: 'Sort the Waste', icon: 'leaf', guide: 'binnie', brief: 'Service is over, so now it’s the clean-up. Everything into the right bin.',
        def: { id: 'lic-sort', world: 5, title: 'Clean-Up Crew', objective: 'Sort every item correctly.', tip: 'Clean and empty → recycle. Scraps → compost.', mode: 'decision', scene: 'sort', options: CY.data.world(5).options, wpm: 17, items: sh(CY.data.pools.sort).slice(0, 5) } },
      { key: 'rescue', name: 'Rescue Surplus', icon: 'heart', guide: 'olive', brief: 'Go through today’s leftovers. Nobody gets ill and nothing good gets binned.',
        def: { id: 'lic-rescue', world: 6, title: 'Surplus Inspection', objective: 'Choose the safest action for each item.', tip: 'If it isn’t safe, it never gets donated.', mode: 'decision', scene: 'rescue', options: CY.data.world(6).options, wpm: 17, items: sh(CY.data.pools.rescue).slice(0, 5) } },
      { key: 'eco', name: 'Green Decisions', icon: 'sparkle', guide: 'juno', brief: 'Last bit. A few everyday choices about energy, water and packaging.',
        def: { id: 'lic-eco', world: 7, title: 'Resource Efficiency', objective: 'Pick the greener way to run the kitchen.', tip: 'Think energy, water, packaging and portions.', mode: 'decision', scene: 'eco', options: [], wpm: 17, items: sh(ECO).slice(0, 5) } },
    ];
  }

  const CATS = [
    { key: 'accuracy', name: 'Typing accuracy', w: 0.2, tip: 'Slow down slightly and fix mistakes as soon as you see red.' },
    { key: 'speed', name: 'Typing speed', w: 0.15, tip: 'Replay Speed & Rush lessons and keep a steady rhythm.' },
    { key: 'satisfaction', name: 'Customer satisfaction', w: 0.2, tip: 'Serve the emptiest patience ring first, and read orders before typing.' },
    { key: 'safety', name: 'Food safety', w: 0.2, tip: 'Revisit Food Rescue Heroes: use-by is about safety, best-before about quality.' },
    { key: 'waste', name: 'Waste management', w: 0.15, tip: 'Have another go at Eco Sorting Squad, especially the dirty packaging.' },
    { key: 'efficiency', name: 'Resource efficiency', w: 0.1, tip: 'Think about energy, water, packaging and portion sizes.' },
  ];
  const gradeFor = (v) => (v >= 90 ? 'gold' : v >= 75 ? 'silver' : v >= 60 ? 'bronze' : 'provisional');
  const rankG = { provisional: 0, bronze: 1, silver: 2, gold: 3 };

  function score(results, ease) {
    const sum = (k) => results.reduce((a, r) => a + (r[k] || 0), 0);
    const keys = sum('keys'), correct = sum('correct'), secs = sum('seconds');
    const acc = keys ? correct / keys : 0;
    const wpm = secs ? (correct / 5) / (secs / 60) : 0;
    const by = Object.fromEntries(results.map((r) => [r.stage, r]));
    const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 100);
    const target = 30 / Math.max(0.85, Math.min(1.2, ease));
    const cats = {
      accuracy: Math.round(U.clamp((acc - 0.6) / 0.38, 0, 1) * 100),
      speed: Math.round(U.clamp(wpm / target, 0, 1) * 100),
      satisfaction: pctOf((by.orders.served || 0) + (by.service.served || 0), (by.orders.total || 0) + (by.service.total || 0)),
      safety: Math.round((pctOf(by.rescue.safetyRight, by.rescue.safetyTotal) * 0.8) + (pctOf(by.open.done, by.open.total) * 0.2)),
      waste: pctOf(by.sort.decisionsRight, by.sort.decisions),
      efficiency: pctOf(by.eco.decisionsRight, by.eco.decisions),
    };
    const overall = Math.round(CATS.reduce((a, c) => a + cats[c.key] * c.w, 0));
    return { cats, overall, acc, wpm: Math.round(wpm), grade: gradeFor(overall) };
  }

  CY.screens.licence = (host) => {
    if (!P().licenceUnlocked()) { CY.app.go('#/'); return; }
    const stages = buildStages();
    const results = [];
    const ease = P().ease();
    let i = 0;

    const intro = () => {
      const lic = CY.store.s.licence;
      host.innerHTML = `<section class="licence-intro screen-in">
        <button class="btn btn-ghost back">${A.icon('back', 20)} Restaurant</button>
        <div class="lic-paper">
          <div class="lic-head">
            <div class="lic-chars">${A.character('momo', { size: 120, mood: 'happy', cls: 'bob' })}${A.character('cy', { size: 100, mood: 'cheer', cls: 'bob' })}</div>
            <div><span class="pill">Final exam</span><h1>The Restaurant Licence Challenge</h1>
            <p>One full shift, from unlocking the door to the last bin bag. The inspector marks your typing, your service, your food safety and how green you run the place.</p></div>
          </div>
          <ol class="stage-list">${stages.map((s, k) => `<li><span class="sl-n">${k + 1}</span>${A.icon(s.icon, 28)}<b>${s.name}</b><small>${s.brief}</small></li>`).join('')}</ol>
          <div class="assess"><h2>You’ll be assessed on</h2><ul>${CATS.map((c) => `<li>${c.name} <small>${Math.round(c.w * 100)}%</small></li>`).join('')}</ul></div>
          <p class="muted">${A.icon('info', 18)} About 6–8 minutes. Hearts aren’t used here. ${lic.best ? `Your best: <b>${lic.best}/100</b> (${CY.screens.gradeName(lic.grade)}).` : ''}</p>
          <div class="intro-actions"><button class="btn btn-primary btn-xl start">${A.icon('play', 20)} Open the restaurant</button></div>
        </div>
      </section>`;
      U.$('.back', host).onclick = () => CY.app.go('#/');
      U.$('.start', host).onclick = () => { CY.audio.unlock(); stageCard(); };
      U.$('.start', host).focus();
    };

    const stageCard = () => {
      const s = stages[i];
      host.innerHTML = `<section class="stage-card screen-in" style="--wc:${CY.data.world(s.def.world).color}">
        <div class="sc-inner">
          <div class="sc-progress">${stages.map((x, k) => `<span class="${k < i ? 'done' : k === i ? 'cur' : ''}">${k < i ? A.icon('check', 16) : k + 1}</span>`).join('')}</div>
          ${A.character(s.guide, { size: 150, mood: 'cheer', cls: 'bob' })}
          <span class="pill">Stage ${i + 1} of ${stages.length}</span>
          <h1>${s.name}</h1>
          <p>${s.brief}</p>
          ${results.length ? `<p class="sc-last">Last stage: <b>${U.pct(results[results.length - 1].acc)}</b> accuracy · <b>${results[results.length - 1].wpm}</b> WPM</p>` : ''}
          <button class="btn btn-primary btn-xl go">Ready! <kbd>Enter</kbd></button>
        </div></section>`;
      const go = () => { document.removeEventListener('keydown', onKey); runStage(); };
      const onKey = (e) => { if (e.key === 'Enter' && !document.querySelector('.modal-wrap')) { e.preventDefault(); go(); } };
      document.addEventListener('keydown', onKey);
      CY.app.onLeave(() => document.removeEventListener('keydown', onKey));
      U.$('.go', host).onclick = go;
      U.$('.go', host).focus();
    };

    const runStage = () => {
      const s = stages[i];
      document.body.classList.add('in-play');
      const ctl = CY.play.run(s.def, host, {
        ease, guide: s.guide,
        onFinish: (r) => {
          document.body.classList.remove('in-play');
          results.push({ ...r, stage: s.key });
          i++;
          if (i < stages.length) stageCard(); else finish();
        },
        onExit: () => { document.body.classList.remove('in-play'); CY.app.go('#/'); },
      });
      CY.app.onLeave(() => { ctl.cleanup(); document.body.classList.remove('in-play'); });
    };

    const finish = () => {
      const sc = score(results, ease);
      const st = CY.store.s, lic = st.licence;
      const prevBest = lic.best;
      lic.attempts++;
      lic.last = { t: Date.now(), ...sc };
      const improved = sc.overall > lic.best;
      lic.best = Math.max(lic.best, sc.overall);
      if (!lic.grade || rankG[sc.grade] > rankG[lic.grade]) lic.grade = sc.grade;
      const xp = 50 + Math.round(sc.overall / 2) + (improved && prevBest ? 20 : 0);
      const coins = sc.overall + (sc.grade === 'gold' ? 50 : 0);
      results.forEach((r) => { st.stats.served += r.served || 0; st.stats.sorted += r.sortedRight || 0; st.stats.rescued += r.rescuedRight || 0; });
      st.stats.wordsTyped += Math.round(results.reduce((a, r) => a + r.correct, 0) / 5);
      st.stats.timePlayedSec += Math.round(results.reduce((a, r) => a + r.seconds, 0));
      P().trackMission('served', results.reduce((a, r) => a + (r.served || 0), 0));
      P().trackMission('eco', results.reduce((a, r) => a + (r.sortedRight || 0) + (r.rescuedRight || 0) + (r.ecoRight || 0), 0));
      const planet = CY.planet.apply(results.flatMap((r) => r.eco || []));
      P().trackDaily('sorted', results.reduce((a, r) => a + (r.sortedRight || 0), 0));
      P().trackDaily('rescued', results.reduce((a, r) => a + (r.rescuedRight || 0), 0));
      const streakUp = P().recordActivity();
      const lvUp = P().addXp(xp, 'licence');
      P().addCoins(coins);
      const newAch = P().checkAchievements();
      P().changed();

      const sorted = CATS.slice().sort((a, b) => sc.cats[b.key] - sc.cats[a.key]);
      const strengths = sorted.slice(0, 2), weak = sorted.slice(-2).reverse().filter((c) => sc.cats[c.key] < 95);
      const gname = CY.screens.gradeName(sc.grade);
      host.innerHTML = `<section class="licence-result screen-in grade-${sc.grade}">
        <div class="certificate" id="certificate">
          <div class="cert-border">
            <p class="cert-kicker">CYCORA Food & Sustainability Board</p>
            <h1>Restaurant Licence</h1>
            <p class="cert-to">awarded to <b>Chef ${U.esc(st.profile.name)}</b> · ${U.esc(st.profile.name)}’s CYCORA Kitchen</p>
            <div class="cert-main">
              <div class="cert-badge stamp">${CY.screens.gradeBadge(sc.grade, 130)}<b>${gname}</b></div>
              <div class="cert-score"><span class="big">${sc.overall}</span><small>/ 100 overall</small>${improved && prevBest ? `<em class="up">▲ new best (was ${prevBest})</em>` : ''}</div>
            </div>
            <ul class="cert-cats">${CATS.map((c) => `<li><span>${c.name}</span><span class="cbar" role="img" aria-label="${c.name}: ${sc.cats[c.key]} out of 100"><i style="width:${sc.cats[c.key]}%"></i></span><b>${sc.cats[c.key]}</b></li>`).join('')}</ul>
            <p class="cert-foot">${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} · ${sc.wpm} WPM · ${U.pct(sc.acc)} accuracy</p>
          </div>
        </div>
        <div class="lic-feedback">
          <div class="fb-col good"><h2>${A.icon('star', 24)} Strengths</h2><ul>${strengths.map((c) => `<li><b>${c.name}:</b> ${sc.cats[c.key]}/100. ${sc.cats[c.key] >= 90 ? 'Very hard to fault.' : 'Solid.'}</li>`).join('')}</ul></div>
          <div class="fb-col improve"><h2>${A.icon('target', 24)} Areas to improve</h2>${weak.length ? `<ul>${weak.map((c) => `<li><b>${c.name}:</b> ${sc.cats[c.key]}/100. ${c.tip}</li>`).join('')}</ul>` : '<p>Nothing major. That was close to a perfect shift.</p>'}</div>
          <div class="fb-col rewards"><h2>${A.icon('bolt', 24)} Rewards</h2><p><b>+${xp} XP</b> · <b>+${coins} coins</b>${streakUp ? ` · ${A.icon('flame', 18)} streak ${st.streak.count}` : ''}</p>
            <p class="muted">${sc.grade === 'provisional' ? 'You need 60 for Bronze. You can retake it whenever you like.' : sc.grade === 'gold' ? 'Gold. There isn’t a higher licence.' : `Score ${sc.grade === 'bronze' ? 75 : 90}+ to upgrade your licence.`}</p></div>
        </div>
        ${CY.lesson.planetPanel(planet)}
        <div class="res-actions">
          <button class="btn btn-soft print">${A.icon('licence', 20)} Print certificate</button>
          <button class="btn btn-soft retry">${A.icon('refresh', 20)} Retake</button>
          <button class="btn btn-primary home">Back to restaurant</button>
        </div>
      </section>`;
      CY.fx.announce(`Licence result: ${gname}, ${sc.overall} out of 100.`);
      if (sc.grade !== 'provisional') { CY.audio.play('unlock'); CY.fx.confetti({ count: sc.grade === 'gold' ? 220 : 130 }); } else CY.audio.play('item');
      setTimeout(() => CY.fx.achievementToasts(newAch), 1200);
      CY.lesson.planetToasts(planet);
      const lt = lvUp ? setTimeout(() => CY.lesson.levelUpModal(lvUp), 2000) : null;
      CY.app.onLeave(() => clearTimeout(lt));
      U.$('.print', host).onclick = () => window.print();
      U.$('.retry', host).onclick = () => CY.app.go('#/licence?r=' + Date.now());
      U.$('.home', host).onclick = () => CY.app.go('#/');
      U.$('.home', host).focus();
    };

    intro();
  };

  CY.licence = { score, CATS };
})();
