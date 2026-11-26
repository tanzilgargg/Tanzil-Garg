/* CYCORA · lesson flow: intro card → play → results & rewards. */
CY.lesson = (() => {
  const U = CY.util, A = CY.art, P = () => CY.progress;

  function open(idOrDef, host, { context = 'lesson' } = {}) {
    const def = typeof idOrDef === 'string' ? CY.data.lesson(idOrDef) : idOrDef;
    if (!def) { CY.app.go('#/'); return; }
    if (context === 'lesson' && !P().lessonUnlocked(def.id)) { CY.app.go(`#/world/${def.world}`); return; }
    if (context === 'lesson' && !P().canStart(def.id)) { outOfHearts(def); return; }
    intro(def, host, context);
  }

  async function outOfHearts(def) {
    const wait = Math.ceil(P().nextHeartIn() / 60000);
    const v = await CY.fx.modal({
      title: 'No hearts left',
      body: `<div class="center">${A.character('cy', { size: 110, mood: 'sleepy' })}</div>
        <p>A heart comes back every 15 minutes. Next one in about <b>${wait} min</b>.</p>
        <p>Or earn one now: replay any lesson you’ve already passed.</p>`,
      actions: [{ label: 'Back', value: 'back' }, { label: 'Shop', value: 'shop' }, { label: 'Practise a lesson', value: 'practise', primary: true }],
    });
    if (v === 'shop') CY.app.go('#/shop');
    else if (v === 'practise') {
      const done = Object.keys(CY.store.s.lessons).filter((id) => P().isDone(id) && id !== 'daily');
      CY.app.go(done.length ? `#/lesson/${done[done.length - 1]}` : `#/world/${def.world}`);
    } else CY.app.go(`#/world/${def.world}`);
  }

  function intro(def, host, context) {
    const world = CY.data.world(def.world);
    const guide = world ? world.guide : 'cy';
    const rec = P().lessonRec(def.id);
    const e = P().ease();
    const chips = [];
    if (def.time) chips.push(`${A.icon('clock', 18)} ${P().timeFor(def, e)}s timer`);
    if (def.patience) chips.push(`${A.icon('heart', 18)} Customer patience`);
    if (def.mode === 'service') chips.push(`${A.icon('ticket', 18)} ${def.concurrent} tickets at once`);
    if (def.mode === 'decision') chips.push(`${A.icon('target', 18)} Decisions count`);
    if (def.strict) chips.push(`${A.icon('info', 18)} Wrong keys won’t type`);
    if (def.keyboard) chips.push(`${A.icon('keyboard', 18)} Keyboard guide`);
    chips.push(`${A.icon('bolt', 18)} ${def.wpm} WPM goal`);
    const pill = context === 'daily' ? 'Daily Special' : `${world.name} · Lesson ${def.n}${def.final ? ' · Final' : ''}`;

    host.innerHTML = `<section class="lesson-intro screen-in" style="--wc:${world ? world.color : '#FFD966'};--wink:${world ? world.ink : '#7A5A00'}">
      <button class="btn btn-ghost back">${A.icon('back', 20)} ${context === 'daily' ? 'Restaurant' : 'World map'}</button>
      <div class="intro-card">
        <div class="intro-art">${A.character(guide, { size: 170, mood: 'cheer', cls: 'bob' })}</div>
        <div class="intro-body">
          <span class="pill">${U.esc(pill)}</span>
          <h1>${U.esc(def.title)}</h1>
          <p class="objective">${A.icon('target', 22)} <span><b>Goal:</b> ${U.esc(def.objective)}</span></p>
          <p class="intro-tip"><b>${A.charName(guide)}:</b> “${U.esc(def.tip)}”</p>
          ${guide !== 'cy' ? `<p class="cy-says">${A.character('cy', { size: 46, mood: 'cheer' })}<span><b>Cy:</b> ${U.esc(cyIntro(def, world, guide))}</span></p>` : ''}
          <ul class="chips">${chips.map((c) => `<li class="chip">${c}</li>`).join('')}</ul>
          ${e !== 1 ? `<p class="ease-note">${A.icon('sparkle', 18)} Difficulty adjusted for you: <b>${P().easeLabel(e)}</b></p>` : ''}
          ${rec && rec.plays ? `<p class="pb">Your best: <b>${rec.bestWpm} WPM</b> · <b>${U.pct(rec.bestAcc)}</b> accuracy · ${starRow(rec.stars, 18)}</p>` : ''}
          <div class="intro-actions"><button class="btn btn-primary btn-xl start">${A.icon('play', 20)} ${rec && rec.done ? 'Play again' : 'Start'}</button><span class="kbd-tip">or press <kbd>Enter</kbd></span></div>
        </div>
      </div>
    </section>`;
    const go = () => { document.removeEventListener('keydown', onKey); play(def, host, context); };
    const onKey = (ev) => { if (ev.key === 'Enter' && !document.querySelector('.modal-wrap')) { ev.preventDefault(); go(); } };
    document.addEventListener('keydown', onKey);
    CY.app.onLeave(() => document.removeEventListener('keydown', onKey));
    U.$('.start', host).onclick = go;
    U.$('.back', host).onclick = () => CY.app.go(context === 'daily' ? '#/' : `#/world/${def.world}`);
    U.$('.start', host).focus();
  }

  function cyIntro(def, world, guide) {
    if (!world) return 'One minute, as many dishes as you can manage.';
    if (def.n === 1 && guide !== 'cy') return `First time in ${world.name}. ${A.charName(guide)} runs this bit, I’ll just be watching from the shelf.`;
    if (def.final) return `Last one in here. Clear it and the ${world.room} is finished.`;
    if (def.mode === 'decision') return 'Right answers here count towards Planet Health as well.';
    if (def.mode === 'service' || def.patience) return 'If a customer walks out, their food gets wasted. Read first, then type.';
    return U.pick(['Get it right first. Fast comes later.', 'Drop your shoulders. Eyes on the text, not your hands.', 'Try not to look at the keyboard. Go on, I dare you.']);
  }

  function play(def, host, context) {
    CY.audio.unlock();
    document.body.classList.add('in-play');
    const ctl = CY.play.run(def, host, {
      onFinish: (r) => { document.body.classList.remove('in-play'); results(def, r, host, context); },
      onExit: () => { document.body.classList.remove('in-play'); CY.app.go(context === 'daily' ? '#/' : `#/world/${def.world}`); },
    });
    CY.app.onLeave(() => { ctl.cleanup(); document.body.classList.remove('in-play'); });
  }

  const starRow = (n, size = 40) => [1, 2, 3].map((i) => `<span class="star s${i} ${i <= n ? 'on' : ''}">${A.icon(i <= n ? 'star' : 'starEmpty', size)}</span>`).join('');

  function tipFor(def, r, res) {
    if (!res.passed) {
      if (r.timedOut) return 'The clock beat you this time. One item at a time, steady pace, and you’ll get further.';
      if (r.acc < 0.55) return 'Slow it right down. You need just over half your keys right to pass.';
      if (r.missed) return 'A few people gave up waiting. Watch the patience bars and serve the emptiest first.';
      return 'Nearly. These get easier quicker than you’d think.';
    }
    if (r.acc < 0.92) return `You hit ${Math.round(r.acc * 100)}% accuracy. 92% gets you a second star.`;
    if (r.decisions && r.decisionsRight < r.decisions) return 'Typing was spot on. A couple of choices weren’t, so have a look back at what Binnie and friends said.';
    if (r.wpm < res.target) return `Third star needs ${res.target} WPM at 97% accuracy. You did ${r.wpm}.`;
    if (r.missed) return 'Clean typing. Serve everyone before they give up and the third star is yours.';
    return 'Not a single slip. If that felt easy, Challenge mode is in Settings.';
  }

  function results(def, r, host, context) {
    const res = context === 'daily' ? CY.progress.completeDaily(r) : CY.progress.completeLesson(def, r);
    const world = CY.data.world(def.world);
    const guide = world ? world.guide : 'cy';
    const pass = res.passed;
    const title = pass ? U.pick(res.stars === 3 ? ['Three stars.', 'Spotless.', 'Top marks, Chef.'] : ['Done and dusted.', 'Lesson cleared.', 'Order up.']) : U.pick(['Not this time.', 'Nearly had it.', 'Good practice, though.']);
    const prev = res.prev;
    const delta = (cur, best, fmt = (v) => v) => (prev && prev.plays && best ? (cur > best ? `<em class="up">▲ ${fmt(cur - best)}</em>` : '') : '');
    const tiles = [
      ['WPM', r.wpm, `goal ${res.target}`, res.pb.wpm, delta(r.wpm, prev && prev.bestWpm)],
      ['Accuracy', U.pct(r.acc), r.acc >= 0.97 ? 'excellent' : r.acc >= 0.9 ? 'great' : 'keep practising', res.pb.acc, delta(Math.round(r.acc * 100), prev && Math.round(prev.bestAcc * 100), (v) => `${v}%`)],
      ['CPM', r.cpm, 'chars / min'],
      ['Errors', r.wrong, `${r.keys} keys pressed`],
      ['Best combo', r.bestCombo, 'keys in a row'],
      ['Time', U.fmtTime(r.seconds), r.timedOut ? 'time ran out' : 'active time'],
      [def.mode === 'decision' || def.chooseOrder ? 'Decisions' : 'Completed', def.mode === 'decision' || def.chooseOrder ? `${r.decisionsRight}/${r.decisions}` : `${r.done}/${r.total}`, r.missed ? `${r.missed} missed` : 'nothing missed'],
      ['Score', r.score, res.pb.score ? 'new best' : 'points', res.pb.score],
    ];
    host.innerHTML = `<section class="results screen-in ${pass ? 'pass' : 'fail'}" style="--wc:${world ? world.color : '#FFD966'}" aria-labelledby="res-title">
      <div class="res-hero">
        <div class="res-char">${A.character(guide, { size: 150, mood: pass ? 'cheer' : 'think', cls: pass ? 'jump' : 'bob' })}</div>
        <div>
          <p class="pill">${U.esc(def.title)}</p>
          <h1 id="res-title">${title}</h1>
          <div class="stars" role="img" aria-label="${res.stars} of 3 stars">${starRow(res.stars, 52)}</div>
          <p class="res-sub">${pass ? U.pick(CY.data.mascotLines[res.stars === 3 ? 'great' : 'ok']) : U.pick(CY.data.mascotLines.retry)}</p>
        </div>
      </div>
      <div class="res-grid">${tiles.map(([l, v, sub, pb, d]) => `<div class="res-tile ${pb ? 'pb' : ''}"><small>${l}</small><b>${v}</b><span>${sub}${d || ''}</span>${pb ? '<i class="pb-badge">New best!</i>' : ''}</div>`).join('')}</div>
      <div class="res-rewards">
        <div class="xp-list"><h2>Rewards</h2><ul>${res.xpLines.map(([l, n]) => `<li><span>${l}</span><b>+${n} XP</b></li>`).join('')}</ul></div>
        <div class="reward-totals">
          <div class="reward xp">${A.icon('bolt', 34)}<b class="xp-count">0</b><small>XP</small></div>
          <div class="reward coin">${A.icon('coin', 34)}<b class="coin-count">0</b><small>coins${res.planetCoins ? ` · incl. ${res.planetCoins} planet bonus` : ''}</small></div>
          ${res.heartDelta ? `<div class="reward heart">${A.icon(res.heartDelta > 0 ? 'heart' : 'heartEmpty', 34)}<b>${res.heartDelta > 0 ? '+1' : '−1'}</b><small>heart</small></div>` : ''}
          ${res.streakUp ? `<div class="reward streak">${A.icon('flame', 34)}<b>${CY.store.s.streak.count}</b><small>day streak</small></div>` : ''}
        </div>
      </div>
      ${planetPanel(res.planet)}
      <p class="res-tip cy-react">${A.character('cy', { size: 52, mood: pass ? (res.stars === 3 ? 'cheer' : 'happy') : 'think' })}<span><b>Cy:</b> ${U.esc(tipFor(def, r, res))}</span></p>
      ${res.worldComplete ? `<p class="res-unlock">${A.icon('sparkle', 22)} <b>${U.esc(world.room)} finished.</b> ${res.unlockedWorld ? `${U.esc(CY.data.world(res.unlockedWorld).name)} is now open.` : 'That’s every world. The Restaurant Licence is open.'}</p>` : ''}
      <div class="res-actions">
        <button class="btn btn-soft retry">${A.icon('refresh', 20)} Retry <kbd>R</kbd></button>
        <button class="btn btn-soft map">${A.icon('map', 20)} ${context === 'daily' ? 'Restaurant' : 'World map'}</button>
        <button class="btn btn-primary cont">${continueLabel(def, res, context)} <kbd>Enter</kbd></button>
      </div>
    </section>`;

    const $ = (s) => U.$(s, host);
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    CY.app.onLeave(() => timers.forEach(clearTimeout));
    CY.fx.countUp($('.xp-count'), res.xp, 900, (v) => `+${Math.round(v)}`);
    CY.fx.countUp($('.coin-count'), res.coins, 900, (v) => `+${Math.round(v)}`);
    CY.fx.announce(`${title} ${res.stars} stars. ${r.wpm} words per minute, ${U.pct(r.acc)} accuracy. Plus ${res.xp} XP and ${res.coins} coins.`);
    if (pass) {
      CY.audio.play('complete');
      later(() => CY.fx.confetti({ count: res.stars * 50 + 30 }), 150);
      U.$$('.star.on', host).forEach((s, i) => later(() => { s.classList.add('pop'); CY.audio.play('pop'); }, 350 + i * 260));
    }
    later(() => { CY.fx.burst($('.reward.coin'), '#tb-coins', 'coin', 6); CY.audio.play('coin'); }, 700);
    later(() => CY.fx.burst($('.reward.xp'), '#tb-level', 'bolt', 5), 900);
    if (res.newAch.length) setTimeout(() => CY.fx.achievementToasts(res.newAch), 1300);
    planetToasts(res.planet);
    if (res.levelUp) later(() => levelUpModal(res.levelUp), 1800);
    if (res.worldComplete) sessionStorage.setItem('cy.celebrate', String(def.world));

    const retry = () => CY.app.go(context === 'daily' ? '#/daily?r=' + Date.now() : `#/lesson/${def.id}?r=${Date.now()}`);
    const cont = () => {
      if (context === 'daily') return CY.app.go('#/');
      if (res.worldComplete) return CY.app.go('#/');
      const nxt = def.n < 6 ? `w${def.world}l${def.n + 1}` : null;
      if (pass && nxt && P().lessonUnlocked(nxt)) return CY.app.go(`#/lesson/${nxt}`);
      CY.app.go(`#/world/${def.world}`);
    };
    $('.retry').onclick = retry;
    $('.map').onclick = () => CY.app.go(context === 'daily' ? '#/' : `#/world/${def.world}`);
    $('.cont').onclick = cont;
    const onKey = (e) => {
      if (document.querySelector('.modal-wrap')) return;
      if (e.key === 'Enter') { e.preventDefault(); cont(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); retry(); }
    };
    later(() => document.addEventListener('keydown', onKey), 600);
    CY.app.onLeave(() => document.removeEventListener('keydown', onKey));
    $('.cont').focus({ preventScroll: true });
  }

  function planetPanel(pl) {
    if (!pl || !pl.events.length) return '';
    const evs = pl.events.filter((e) => !e.step);
    const steps = pl.events.length - evs.length;
    const list = [...evs.filter((e) => !e.ok), ...evs.filter((e) => e.ok)].slice(0, 4);
    const t = CY.planet.tierOf(pl.after);
    return `<div class="res-planet ${pl.total >= 0 ? 'up' : 'down'}">
      <div class="rpl-head">${A.character('earth', { size: 64, mood: pl.total > 0 ? 'cheer' : pl.total < 0 ? 'sad' : 'happy' })}
        <div><b>Planet impact: ${pl.total > 0 ? '+' : pl.total < 0 ? '−' : '±'}${Math.abs(pl.total)}</b><small>Planet Health is now <b>${pl.after}/100</b> · ${t.name}${steps ? ` · ${steps} circular step${steps === 1 ? '' : 's'} completed` : ''}</small></div>
        <a class="btn btn-small btn-soft" href="#/planet">Planet page</a></div>
      ${list.length ? `<ul>${list.map((e) => `<li class="${e.ok ? 'ok' : 'bad'}"><span>${e.ok ? A.icon('check', 16) : A.icon('info', 16)}</span><div><b>${U.esc(e.item)}</b> <small>${CY.planet.CATS[e.cat].name} ${e.delta > 0 ? '+' : '−'}${Math.abs(e.delta)}</small><p>${U.esc(e.why)}</p></div></li>`).join('')}</ul>` : ''}
    </div>`;
  }
  function planetToasts(pl) {
    if (!pl) return;
    if (pl.tierUp) setTimeout(() => CY.fx.toast({ title: `Planet: ${pl.tierUp.name}`, text: pl.tierUp.line, icon: 'globe', tone: 'sky', sound: 'unlock' }), 1500);
    (pl.rewards || []).forEach((m) => setTimeout(() => CY.fx.toast({ title: `Planet milestone: ${m.label}`, text: `+${m.coins} coins · +${m.xp} XP${m.item ? ' · exclusive Planet Mural unlocked' : ''}`, icon: 'globe', tone: 'sage', sound: 'unlock' }), 1700));
  }

  function continueLabel(def, res, context) {
    if (context === 'daily') return 'Back to restaurant';
    if (res.worldComplete) return 'See your restaurant';
    if (res.passed && def.n < 6) return 'Next lesson';
    return 'Continue';
  }

  function levelUpModal(level) {
    CY.audio.play('unlock');
    CY.fx.confetti({ count: 90 });
    CY.fx.modal({
      title: `Level ${level}`,
      cls: 'levelup',
      body: `<div class="center">${A.avatar(CY.store.s.profile.avatar, 120, 'cheer')}<p class="big-title">${CY.progress.levelInfo().title}</p><p>New title, same apron.</p></div>`,
      actions: [{ label: 'Nice', primary: true }],
    });
  }

  return { open, starRow, levelUpModal, planetPanel, planetToasts };
})();
