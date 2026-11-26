/* CYCORA · top bar + Restaurant HQ (the main dashboard / map). */
CY.screens = CY.screens || {};

(() => {
  const U = CY.util, A = CY.art, P = () => CY.progress;

  /* ===================== TOP BAR ===================== */
  CY.topbar = {
    render() {
      const s = CY.store.s, tb = U.$('#topbar');
      P().heartsTick();
      const lv = P().levelInfo(), sd = P().streakDisplay();
      const heartsTitle = !P().heartsOn() ? 'Relaxed mode: hearts are off' : s.hearts.count >= s.hearts.max ? 'Hearts full' : `Next heart in ${Math.ceil(P().nextHeartIn() / 60000)} min`;
      const route = location.hash || '#/';
      const nav = [['#/', 'home', 'Restaurant'], ['#/race', 'flag', 'Race'], ['#/shop', 'bag', 'Shop'], ['#/planet', 'globe', 'Planet'], ['#/trophies', 'trophy', 'Trophies'], ['#/leaderboard', 'chart', 'League']];
      const pl = CY.planet.score(), pt = CY.planet.tierOf(pl);
      tb.innerHTML = `
        <a class="logo" href="#/" aria-label="CYCORA home">${logoSVG()}<span>CYCORA</span></a>
        <nav class="tb-nav" aria-label="Main">${nav.map(([h, i, l]) => `<a href="${h}" aria-label="${l}" title="${l}" class="tb-link ${route === h || (h === '#/' && /^#\/(world)/.test(route)) ? 'active' : ''}">${A.icon(i, 24)}<span>${l}</span></a>`).join('')}</nav>
        <div class="tb-stats">
          <div class="tb-stat streak ${sd.today ? 'lit' : ''}" title="${sd.today ? 'Streak kept for today' : sd.count ? 'Play today to keep your streak' : 'Start a streak today'}">${A.icon(sd.count ? 'flame' : 'flameOff', 26)}<b>${sd.count}</b><span class="sr-only">day streak</span></div>
          <div class="tb-stat hearts" id="tb-hearts" title="${heartsTitle}">${A.icon(P().heartsOn() ? 'heart' : 'heartEmpty', 26)}<b>${P().heartsOn() ? s.hearts.count : '∞'}</b><span class="sr-only">hearts</span></div>
          <a class="tb-stat planet t${pt.i}" id="tb-planet" href="#/planet" title="Planet Health: ${pt.name}">${A.icon('globe', 26)}<b>${pl}</b><span class="sr-only">planet health out of 100</span></a>
          <div class="tb-stat coins" id="tb-coins" title="Restaurant coins">${A.icon('coin', 26)}<b>${s.coins}</b><span class="sr-only">coins</span></div>
          <div class="tb-stat level" id="tb-level" title="${lv.into}/${lv.need} XP to level ${lv.level + 1}"><span class="lv-ring" style="--p:${lv.pct.toFixed(3)}"><b>${lv.level}</b></span><span class="lv-txt"><small>${lv.title}</small><i class="lv-bar"><i style="width:${lv.pct * 100}%"></i></i></span></div>
        </div>
        <a class="tb-avatar" href="#/profile" aria-label="Your profile">${A.avatar(s.profile.avatar, 44)}</a>
        <button class="icon-btn tb-settings" aria-label="Settings">${A.icon('gear', 26)}</button>`;
      U.$('.tb-settings', tb).onclick = () => CY.screens.settings();
    },
  };
  function logoSVG() {
    return `<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><circle cx="24" cy="27" r="17" fill="#9CCB8E" stroke="#3D2F4F" stroke-width="3"/><path d="M24 11 C24 7 24 6 24 4" stroke="#4E8A5B" stroke-width="3" stroke-linecap="round"/><path d="M24 8 C18 0 9 4 11 10 C16 13 21 12 24 8Z" fill="#6DB36A" stroke="#3D2F4F" stroke-width="2.4"/><path d="M24 7 C29 -1 38 2 37 9 C32 12 27 11 24 7Z" fill="#86C77A" stroke="#3D2F4F" stroke-width="2.4"/>${A.face(24, 25, 'happy', 0.55, 7)}</svg>`;
  }
  CY.logoSVG = logoSVG;

  /* ===================== HQ ===================== */
  const LAYOUT = [1, 3, 7, 2, 4, 6, 5]; // upstairs: pantry, kitchen, workshop · ground: counter, dining, rescue · yard: recycling

  function greeting() {
    const h = new Date().getHours();
    return h < 5 ? 'Late-night shift' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  function mascotLine() {
    const s = CY.store.s, nl = P().nextLesson(), sd = P().streakDisplay();
    if (P().chestReady()) return 'All three eco missions done. Your chest is waiting to be opened.';
    if (!s.stats.lessonsDone && !s.races.played) return 'It’s a bit bare in here. The pantry’s a good place to start.';
    const last = s.history[s.history.length - 1];
    if (last && Date.now() - last.t < 3600e3) {
      if (last.acc >= 0.97) return `${Math.round(last.acc * 100)}% accurate last round. Momo would be proud. Quietly.`;
      if (last.pass === false) return 'That last one didn’t go your way. Fancy another go?';
      if (last.acc < 0.9) return `${Math.round(last.acc * 100)}% accuracy last time. Slow down a touch and that goes up.`;
    }
    if (CY.planet.score() < 30) return 'It’s smoggy out there. Sorting waste and rescuing food helps clear it.';
    if (sd.atRisk && sd.count) return `You’re on a ${sd.count}-day streak. One lesson today keeps it going.`;
    if (!P().dailyDoneToday()) return 'Today’s Daily Special is up. Sixty seconds, bonus XP.';
    const ready = s.weekly.missions.find((m) => m.progress >= m.goal && !m.claimed);
    if (ready) return 'You’ve finished a weekly mission. Go and claim it.';
    if (P().licenceUnlocked() && !s.licence.best) return 'You’ve done every world. Time for the Restaurant Licence.';
    if (nl) return `Next up is “${nl.title}”, over in ${CY.data.world(nl.world).name}.`;
    return U.pick(CY.data.mascotLines.idle);
  }

  CY.screens.hq = (host) => {
    const s = CY.store.s;
    P().ensureWeek();
    P().ensureDaily();
    const eco = s.dailyEco;
    const ptier = CY.planet.tierOf();
    const nextExclusive = CY.data.chestRewards.map((id) => CY.data.shop.find((x) => x.id === id)).find((it) => !s.owned.includes(it.id));
    const nl = P().nextLesson();
    const built = CY.data.worlds.reduce((a, w) => a + P().worldProgress(w.id), 0);
    const celebrate = +sessionStorage.getItem('cy.celebrate') || 0;
    sessionStorage.removeItem('cy.celebrate');
    const decor = (p) => P().decorFor(p);
    const bdecor = decor('building');

    const room = (wid) => {
      const w = CY.data.world(wid), unlocked = P().worldUnlocked(wid), prog = P().worldProgress(wid), stars = P().worldStars(wid);
      const isNext = nl && nl.world === wid;
      const place = { 3: 'kitchen', 4: 'dining', 5: 'yard' }[wid] || '';
      const lockMsg = wid === 1 ? '' : `Finish ${CY.data.world(wid - 1).name} to build`;
      return `<button class="room r${wid} ${unlocked ? '' : 'locked'} ${isNext ? 'is-next' : ''} ${prog === 6 ? 'complete' : ''} ${celebrate === wid ? 'just-built' : ''}" data-w="${wid}" style="--wc:${w.color};--wink:${w.ink}"
          aria-label="${w.room}: ${w.name}. ${unlocked ? `${prog} of 6 lessons complete, ${stars} stars` : `Locked. ${lockMsg}`}">
        <span class="room-art">${A.room(wid, prog, { locked: !unlocked, decor: place ? decor(place) : [] }).replace('xMidYMid slice', wid === 5 ? 'xMidYMax slice' : 'xMidYMid slice')}</span>
        ${unlocked && prog === 0 ? `<span class="empty-hint">${A.icon('sparkle', 18)} Ready to build</span>` : ''}
        ${isNext ? `<span class="next-flag">${A.icon('play', 14)} Next lesson</span>` : ''}
        <span class="plaque">
          <span class="plaque-name"><b>${w.room}</b><small>${unlocked ? w.name : lockMsg}</small></span>
          <span class="pips" aria-hidden="true">${unlocked ? [1, 2, 3, 4, 5, 6].map((n) => `<i class="${n <= prog ? 'on' : ''}"></i>`).join('') : A.icon('lock', 20)}</span>
        </span>
      </button>`;
    };

    const dailyDone = P().dailyDoneToday();
    const missions = s.weekly.missions;
    const lic = s.licence, licOpen = P().licenceUnlocked();
    const lv = P().levelInfo();

    host.innerHTML = `<section class="hq screen-in">
      <div class="hq-main">
        <div class="hq-greet">
          <a class="greet-char" href="#/profile" aria-label="Cy, your mascot. Change Cy’s outfit">${A.character('cy', { size: 110, mood: CY.planet.score() < 30 ? 'think' : 'cheer', cls: 'bob wave' })}</a>
          <div class="greet-bubble">
            <h1>${greeting()}, ${U.esc(s.profile.name)}!</h1>
            <p>${U.esc(mascotLine())}</p>
            ${nl ? `<button class="btn btn-primary go-next">${A.icon('play', 18)} ${s.stats.lessonsDone ? 'Continue' : 'Start'}: ${U.esc(nl.title)}</button>` : ''}
          </div>
        </div>
        <div class="env env-t${ptier.i}">
        ${envSVG(ptier.i)}
        <div class="building" data-theme="${s.style.theme}" aria-label="Your restaurant">
          <div class="roof">
            ${bdecor.includes('solar') ? `<div class="solar" aria-label="Solar panels">${'<i></i>'.repeat(4)}</div>` : ''}
            <div class="sign"><span>${CY.logoSVG()}</span><b>CYCORA</b><small>${built < 42 ? `${built}/42 built` : 'Sustainable Kitchen'}</small></div>
            ${bdecor.includes('garden') ? `<div class="roof-garden" aria-label="Rooftop garden">${'<i></i>'.repeat(5)}</div>` : ''}
          </div>
          <div class="floors">
            <div class="floor upstairs">${[1, 3, 7].map(room).join('')}</div>
            ${bdecor.includes('flowerbox') ? `<div class="flowerboxes" aria-hidden="true">${'<i><b></b><b></b><b></b></i>'.repeat(3)}</div>` : ''}
            ${bdecor.includes('awning') ? '<div class="awning" aria-hidden="true"></div>' : '<div class="beam" aria-hidden="true"></div>'}
            <div class="floor ground">${[2, 4, 6].map(room).join('')}</div>
            <div class="yard">${room(5)}</div>
          </div>
          <div class="street" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        ${groundSVG(ptier.i)}
        <p class="env-caption">${A.icon('globe', 18)} <b>Planet ${ptier.name}:</b> ${ptier.line} <a href="#/planet">See your impact</a></p>
        </div>
      </div>

      <aside class="hq-side">
        <article class="daily-ticket ${dailyDone ? 'done' : ''}">
          <header>${A.icon('calendar', 26)}<span>Daily Special</span><small>${U.dayStr().split('-').reverse().slice(0, 2).join('/')}</small></header>
          <h2>${U.esc(P().dailyDef().title.replace('Daily Special: ', ''))}</h2>
          <p>${dailyDone ? `Done for today. Best score <b>${s.daily.best}</b>.` : 'A 60-second typing sprint. <b>+30 XP and 20 coins</b> the first time today.'}</p>
          <button class="btn ${dailyDone ? 'btn-soft' : 'btn-coral'} go-daily">${dailyDone ? 'Play for fun' : 'Start'}</button>
        </article>

        <article class="eco-missions">
          <header><h2>${A.icon('leaf', 24)} Daily Eco Missions</h2><small>New ones tomorrow</small></header>
          <ul>${eco.missions.map((m, i) => {
            const d = P().dailyMissionDef(m.id), done = m.progress >= m.goal;
            return `<li class="${m.claimed ? 'claimed' : done ? 'ready' : ''}"><div class="m-top"><span>${P().missionText(d, m.goal)}${d.hint ? `<small>${d.hint}</small>` : ''}</span>${m.claimed ? `<em>${A.icon('check', 16)}</em>` : done ? `<button class="btn btn-small btn-primary eclaim" data-i="${i}">Claim</button>` : `<em>${m.progress}/${m.goal}</em>`}</div><div class="bar"><i style="width:${(m.progress / m.goal) * 100}%"></i></div></li>`;
          }).join('')}</ul>
          <div class="chest ${eco.chest ? 'opened' : P().chestReady() ? 'ready' : ''}">
            ${chestSVG(eco.chest)}
            <div><b>Eco Chest</b><small>${eco.chest ? 'Opened. New missions tomorrow.' : `Finish all 3 for ${nextExclusive ? `an exclusive: <b>${U.esc(nextExclusive.name)}</b>` : '+80 coins'} · +40 XP`}</small></div>
            ${P().chestReady() ? '<button class="btn btn-small btn-coral open-chest">Open it</button>' : ''}
          </div>
        </article>

        <a class="planet-card t${ptier.i}" href="#/planet">
          <span class="pc-earth">${A.character('earth', { size: 76, mood: CY.planet.mood() })}</span>
          <span class="pc-body"><b>Planet Health · ${ptier.name}</b>
            <span class="pmeter" role="img" aria-label="Planet health ${CY.planet.score()} out of 100"><i style="width:${CY.planet.score()}%"></i><em>${CY.planet.score()}/100</em></span>
            <small>${ptier.coinBonus ? `Perk: +${Math.round(ptier.coinBonus * 100)}% lesson coins` : ptier.i < 2 ? 'Reach 60 for a +10% coin bonus' : ''}</small></span>
        </a>

        <article class="race-card">
          <div class="rc-art">${A.racer(s.profile.avatar, { size: 110, color: '#8ED1F2', label: 'Your racer' })}</div>
          <div><h2>Typing Races</h2><p>${s.races.played ? `${s.races.wins} win${s.races.wins === 1 ? '' : 's'} · ${s.races.podiums} podium${s.races.podiums === 1 ? '' : 's'}` : 'AI chefs, plus a ghost of your best run.'}</p>
          <a class="btn btn-primary" href="#/race">${A.icon('flag', 18)} Race</a></div>
        </article>

        <article class="missions">
          <header><h2>${A.icon('target', 24)} Weekly missions</h2><small>Resets Monday</small></header>
          <ul>${missions.map((m, i) => {
            const d = P().missionDef(m.id), done = m.progress >= m.goal;
            return `<li class="${m.claimed ? 'claimed' : done ? 'ready' : ''}">
              <div class="m-top"><span>${d.text.replace('{g}', m.goal).replace('{s}', m.goal === 1 ? '' : 's')}</span>${m.claimed ? `<em>${A.icon('check', 16)} Claimed</em>` : done ? `<button class="btn btn-small btn-primary claim" data-i="${i}">Claim</button>` : `<em>${m.progress}/${m.goal}</em>`}</div>
              <div class="bar"><i style="width:${(m.progress / m.goal) * 100}%"></i></div>
              <small class="m-reward">${A.icon('bolt', 14)} ${d.xp} XP · ${A.icon('coin', 14)} ${d.coins}</small>
            </li>`;
          }).join('')}</ul>
        </article>

        <article class="licence-card ${licOpen ? 'open' : ''}">
          <div class="lic-stamp">${lic.grade ? gradeBadge(lic.grade) : A.icon('licence', 40)}</div>
          <div>
            <h2>Restaurant Licence</h2>
            <p>${licOpen ? (lic.best ? `Best: <b>${lic.best}/100</b> · ${U.esc(gradeName(lic.grade))}` : 'One full shift, start to finish, with an inspector watching.') : `Complete all 7 worlds to apply (<b>${P().worldsComplete()}/7</b>).`}</p>
            <button class="btn ${licOpen ? 'btn-primary' : 'btn-soft'} go-lic" ${licOpen ? '' : 'aria-disabled="true"'}>${licOpen ? 'Take the challenge' : `${A.icon('lock', 18)} Locked`}</button>
          </div>
        </article>

        <div class="quick">
          <a href="#/profile" class="q-tile">${A.avatar(s.profile.avatar, 44)}<span><b>Level ${lv.level}</b><small>${lv.title}</small></span></a>
          <a href="#/trophies" class="q-tile">${A.icon('trophy', 36)}<span><b>${Object.keys(s.achievements).length}/${CY.data.achievements.length}</b><small>Trophies</small></span></a>
          <a href="#/leaderboard" class="q-tile">${A.icon('chart', 36)}<span><b>#${CY.leaderboard.rank()}</b><small>This week</small></span></a>
          <a href="#/shop" class="q-tile">${A.icon('bag', 36)}<span><b>Shop</b><small>Decorate</small></span></a>
        </div>
      </aside>
    </section>`;

    U.$$('.room', host).forEach((b) => (b.onclick = () => {
      const w = +b.dataset.w;
      if (!P().worldUnlocked(w)) {
        CY.audio.play('wrong');
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        CY.fx.toast({ title: 'Still being built', text: `Finish ${CY.data.world(w - 1).name} to build the ${CY.data.world(w).room}.`, icon: 'lock', tone: 'sky' });
        return;
      }
      CY.app.go(`#/world/${w}`);
    }));
    const gn = U.$('.go-next', host);
    if (gn) gn.onclick = () => CY.app.go(`#/lesson/${nl.id}`);
    U.$('.go-daily', host).onclick = () => CY.app.go('#/daily');
    U.$('.go-lic', host).onclick = () => {
      if (licOpen) CY.app.go('#/licence');
      else CY.fx.modal({
        title: 'The Licence is still locked',
        body: `<p>You need all 7 worlds finished to apply for your Restaurant Licence. So far: <b>${P().worldsComplete()}/7</b>.</p><p class="muted">Teacher, marker or just exploring? <b>Demo mode</b> opens every world and the Licence. You can switch it off any time in Settings.</p>`,
        actions: [{ label: 'Keep playing', value: 0, primary: true }, { label: 'Turn on demo mode', value: 1 }],
      }).then((v) => { if (v === 1) { CY.store.s.settings.unlockAll = true; P().changed(); CY.fx.toast({ title: 'Demo mode on', text: 'Every world and the Licence are open.', icon: 'sparkle', tone: 'sky' }); CY.app.render(); } });
    };
    U.$$('.claim', host).forEach((b) => (b.onclick = () => {
      const r = P().claimMission(+b.dataset.i);
      if (!r) return;
      CY.audio.play('xp');
      CY.fx.burst(b, '#tb-coins', 'coin', 6);
      CY.fx.confetti({ count: 60 });
      CY.fx.toast({ title: 'Mission done', text: `+${r.xp} XP and +${r.coins} coins`, icon: 'target', tone: 'sage', sound: 'coin' });
      CY.fx.achievementToasts(r.newAch);
      setTimeout(() => CY.app.render(), 900);
    }));

    U.$$('.eclaim', host).forEach((b) => (b.onclick = () => {
      const r = P().claimDaily(+b.dataset.i);
      if (!r) return;
      CY.audio.play('coin');
      CY.fx.burst(b, '#tb-coins', 'coin', 5);
      CY.fx.toast({ title: 'Eco mission done', text: `+${r.xp} XP and +${r.coins} coins`, icon: 'leaf', tone: 'sage', sound: 'xp' });
      CY.fx.achievementToasts(r.newAch);
      setTimeout(() => CY.app.render(), 700);
    }));
    const oc = U.$('.open-chest', host);
    if (oc) oc.onclick = async () => {
      const r = P().claimChest();
      if (!r) return;
      CY.audio.play('unlock');
      CY.fx.confetti({ count: 150 });
      await CY.fx.modal({
        title: 'Eco Chest', cls: 'celebrate',
        body: `<div class="center">${A.character('cy', { size: 120, mood: 'cheer', cls: 'jump' })}
          <p><b>+${r.xp} XP · +${r.coins} coins</b></p>
          ${r.item ? `<p>Exclusive unlocked: <b>${U.esc(r.item.name)}</b><br><small>${U.esc(r.item.desc)}</small></p><p class="muted">${r.item.slot ? 'Equip it from the shop or Cy’s wardrobe.' : 'It’s already in the restaurant.'}</p>` : '<p>You already own every exclusive, so it’s bonus coins this time.</p>'}</div>`,
        actions: [{ label: 'Lovely', primary: true }],
      });
      CY.fx.achievementToasts(r.newAch);
      CY.app.render();
    };
    if (celebrate) celebrateWorld(celebrate, host);
  };

  /* ---------- environment around the restaurant (Planet Health tiers 0–3) ---------- */
  const INK = '#3D2F4F';
  function tree(x, y, t, s = 1) {
    const leaves = t === 0 ? '' : t === 1 ? `<circle cx="0" cy="-58" r="16" fill="#B5CF8A" stroke="${INK}" stroke-width="2.5"/>` : `<circle cx="-14" cy="-56" r="20" fill="#86C77A" stroke="${INK}" stroke-width="2.5"/><circle cx="14" cy="-60" r="22" fill="#6DB36A" stroke="${INK}" stroke-width="2.5"/><circle cx="0" cy="-78" r="18" fill="#86C77A" stroke="${INK}" stroke-width="2.5"/>${t === 3 ? '<circle cx="-8" cy="-62" r="3.5" fill="#FF7A6B"/><circle cx="12" cy="-72" r="3.5" fill="#FF7A6B"/><circle cx="16" cy="-52" r="3.5" fill="#FF7A6B"/>' : ''}`;
    const branches = t === 0 ? `<path d="M0 -40 l-14 -18 M0 -48 l12 -16 M0 -30 l10 -8" stroke="#7A5A48" stroke-width="4" stroke-linecap="round"/>` : '';
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 0 L-3 -46 L3 -46 L5 0Z" fill="#9A6340" stroke="${INK}" stroke-width="2.5"/>${branches}${leaves}</g>`;
  }
  function envSVG(t) {
    const sky = `${t === 0 ? [80, 300, 520, 760, 960].map((x, i) => `<g class="smog" opacity=".85"><ellipse cx="${x}" cy="${40 + (i % 2) * 22}" rx="70" ry="24" fill="#B9AECB"/><ellipse cx="${x + 40}" cy="${30 + (i % 2) * 22}" rx="44" ry="20" fill="#A99FBB"/></g>`).join('') : ''}
      ${t >= 1 ? [140, 460, 820].map((x, i) => `<g class="cloud" style="animation-delay:${-i * 7}s"><ellipse cx="${x}" cy="${36 + i * 10}" rx="38" ry="13" fill="#fff"/><ellipse cx="${x + 22}" cy="${28 + i * 10}" rx="24" ry="13" fill="#fff"/></g>`).join('') : ''}
      ${t >= 2 ? `<circle cx="940" cy="50" r="26" fill="#FFD966" stroke="${INK}" stroke-width="2.5"/><g class="birds" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M300 70 q6 -6 12 0 q6 -6 12 0"/><path d="M340 54 q5 -5 10 0 q5 -5 10 0"/></g>` : ''}
      ${t >= 3 ? `<g class="rainbow" fill="none" stroke-width="9" opacity=".75"><path d="M560 130 A120 110 0 0 1 800 130" stroke="#FF7A6B"/><path d="M569 130 A111 101 0 0 1 791 130" stroke="#FFD966"/><path d="M578 130 A102 92 0 0 1 782 130" stroke="#9CCB8E"/><path d="M587 130 A93 83 0 0 1 773 130" stroke="#8ED1F2"/></g>` : ''}`;
    return `<svg class="env-sky" viewBox="0 0 1000 140" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${sky}</svg>
      <svg class="env-side left" viewBox="0 0 90 200" aria-hidden="true">${tree(46, 196, t, 1.05)}</svg>
      <svg class="env-side right" viewBox="0 0 90 200" aria-hidden="true">${tree(44, 196, t, 0.95)}${t >= 3 ? `<g class="butterfly"><path d="M30 60 q-10 -12 -2 -16 q6 2 2 16z M30 60 q10 -12 2 -16 q-6 2 -2 16z" fill="#D9CCF2" stroke="${INK}" stroke-width="1.5"/></g>` : ''}</svg>`;
  }
  function groundSVG(t) {
    const items = [];
    for (let i = 0; i < 26; i++) {
      const x = 20 + i * 38 + (i % 3) * 6;
      if (t === 0) { if (i % 3 === 0) items.push(`<g transform="translate(${x} 22) rotate(${i * 23})"><rect x="-6" y="-4" width="12" height="8" rx="2" fill="#C9BFD6" stroke="${INK}" stroke-width="1.6"/></g>`); }
      else if (t === 1) { if (i % 4 === 0) items.push(`<path d="M${x} 30 v-10 M${x - 5} 30 q5 -8 5 -14 M${x + 5} 30 q-5 -8 -5 -14" stroke="#86C77A" stroke-width="2.5" fill="none"/>`); if (i % 8 === 2) items.push(`<circle cx="${x}" cy="14" r="5" fill="#FFC9C9" stroke="${INK}" stroke-width="1.5"/>`); }
      else {
        items.push(`<path d="M${x} 32 v-14" stroke="#6DB36A" stroke-width="2.5"/>`);
        if (i % (t === 3 ? 1 : 2) === 0) items.push(`<g transform="translate(${x} 15)">${[0, 72, 144, 216, 288].map((a) => `<circle r="3.4" transform="rotate(${a}) translate(0 -4.4)" fill="${['#FFC9C9', '#FFF0B8', '#D9CCF2', '#C9E8F5'][i % 4]}"/>`).join('')}<circle r="2.6" fill="#FFD966"/></g>`);
      }
    }
    return `<svg class="env-ground" viewBox="0 0 1000 34" preserveAspectRatio="none" aria-hidden="true">${items.join('')}</svg>`;
  }
  function chestSVG(open) {
    return `<svg viewBox="0 0 64 56" width="56" aria-hidden="true">${open ? '<path d="M8 22 L14 4 H50 L56 22Z" fill="#E7B27F" stroke="#3D2F4F" stroke-width="2.5"/>' : '<path d="M8 24 Q8 8 32 8 Q56 8 56 24Z" fill="#E7B27F" stroke="#3D2F4F" stroke-width="2.5"/>'}<rect x="8" y="24" width="48" height="28" rx="4" fill="#C98B5B" stroke="#3D2F4F" stroke-width="2.5"/><path d="M8 32h48" stroke="#9A6340" stroke-width="3"/><rect x="27" y="26" width="10" height="12" rx="2" fill="#FFD966" stroke="#3D2F4F" stroke-width="2"/>${open ? '<circle cx="24" cy="18" r="3" fill="#FFD966"/><circle cx="40" cy="14" r="3" fill="#9CCB8E"/>' : ''}</svg>`;
  }

  CY.screens.envSVG = envSVG;
  CY.screens.groundSVG = groundSVG;

  async function celebrateWorld(wid, host) {
    const el = U.$(`.room.r${wid}`, host);
    if (el) el.scrollIntoView({ block: 'center', behavior: U.reducedMotion() ? 'auto' : 'smooth' });
    CY.audio.play('unlock');
    CY.fx.confetti({ count: 160 });
    const w = CY.data.world(wid), nw = CY.data.world(wid + 1);
    await U.sleep(900);
    await CY.fx.modal({
      title: `${w.room} finished`,
      cls: 'celebrate',
      body: `<div class="celebrate-row">${A.character(w.guide, { size: 120, mood: 'cheer', cls: 'jump' })}${nw ? A.character(nw.guide, { size: 120, mood: 'wow', cls: 'bob' }) : A.character('cy', { size: 120, mood: 'cheer' })}</div>
        <p>Another room done. ${nw ? `<b>${A.charName(nw.guide)}</b> has opened the <b>${nw.room}</b>: “${U.esc(nw.welcome)}”` : 'Every room is built. Next stop: the Restaurant Licence.'}</p>`,
      actions: nw ? [{ label: 'Later', value: 0 }, { label: `Go to ${nw.name}`, value: 1, primary: true }] : [{ label: 'Later', value: 0 }, { label: 'Take the Licence', value: 2, primary: true }],
    }).then((v) => { if (v === 1) CY.app.go(`#/world/${nw.id}`); if (v === 2) CY.app.go('#/licence'); });
  }

  const GRADES = { gold: 'Gold Star Licence', silver: 'Silver Licence', bronze: 'Bronze Licence', provisional: 'Provisional (try again)' };
  const gradeName = (g) => GRADES[g] || '';
  function gradeBadge(g, size = 56) {
    const c = { gold: '#FFD966', silver: '#DDE3EA', bronze: '#E7B27F', provisional: '#EDE6F2' }[g];
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><path d="M20 40 l-6 20 10-5 6 8 4-18z M44 40 l6 20 -10-5 -6 8 -4-18z" fill="#FF7A6B" stroke="#3D2F4F" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="28" r="22" fill="${c}" stroke="#3D2F4F" stroke-width="3"/><circle cx="32" cy="28" r="15" fill="none" stroke="#3D2F4F" stroke-width="2" stroke-dasharray="3 3"/><path d="M32 17l3.3 6.8 7.4.9-5.4 5.1 1.4 7.3L32 33.6l-6.7 3.5 1.4-7.3-5.4-5.1 7.4-.9z" fill="#fff" stroke="#3D2F4F" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  CY.screens.gradeName = gradeName;
  CY.screens.gradeBadge = gradeBadge;
})();
