/* CYCORA · progression rules: XP & levels, coins, hearts, streaks, unlocking,
   adaptive difficulty, lesson results, daily special, weekly missions, achievements, shop. */
CY.progress = (() => {
  const U = CY.util;
  const S = () => CY.store.s;
  const changed = () => { CY.store.save(); CY.bus.emit('state:changed'); };

  /* ---------- Levels ---------- */
  const stepFor = (lvl) => 80 + (lvl - 1) * 40;
  function levelInfo(xp = S().xp) {
    let lvl = 1, floor = 0;
    while (xp >= floor + stepFor(lvl)) { floor += stepFor(lvl); lvl++; }
    const need = stepFor(lvl);
    return { level: lvl, into: xp - floor, need, pct: (xp - floor) / need, title: titleFor(lvl) };
  }
  const TITLES = [[1, 'Kitchen Helper'], [3, 'Line Cook'], [6, 'Sous Chef'], [10, 'Head Chef'], [15, 'Executive Chef'], [20, 'Eco Legend']];
  const titleFor = (lvl) => TITLES.filter(([l]) => lvl >= l).pop()[1];

  function addXp(n, reason) {
    const before = levelInfo().level;
    S().xp += n;
    S().weekly.weekXp = (S().weekly.weekXp || 0) + n;
    trackMission('xp', n);
    const after = levelInfo().level;
    CY.bus.emit('xp', { n, reason });
    if (after > before) CY.bus.emit('levelup', { level: after, title: titleFor(after) });
    return after > before ? after : 0;
  }
  function addCoins(n) { S().coins += n; CY.bus.emit('coins', { n }); }

  /* ---------- Hearts (forgiving: only a failed NEW lesson costs a heart) ---------- */
  const REFILL_MS = 15 * 60 * 1000;
  function heartsTick() {
    const h = S().hearts;
    if (h.count >= h.max) { h.lastRefill = Date.now(); return; }
    const gained = Math.floor((Date.now() - h.lastRefill) / REFILL_MS);
    if (gained > 0) {
      h.count = Math.min(h.max, h.count + gained);
      h.lastRefill += gained * REFILL_MS;
      changed();
    }
  }
  const heartsOn = () => S().settings.hearts === 'on';
  const nextHeartIn = () => {
    const h = S().hearts;
    return h.count >= h.max ? 0 : Math.max(0, REFILL_MS - (Date.now() - h.lastRefill));
  };
  function canStart(lessonId) {
    if (!heartsOn()) return true;
    heartsTick();
    const replay = S().lessons[lessonId] && S().lessons[lessonId].done;
    return replay || S().hearts.count > 0;
  }

  /* ---------- Streak ---------- */
  function streakDisplay() {
    const st = S().streak;
    if (!st.last) return { count: 0, today: false, atRisk: false };
    const gap = U.daysBetween(st.last, U.dayStr());
    if (gap === 0) return { count: st.count, today: true, atRisk: false };
    if (gap === 1) return { count: st.count, today: false, atRisk: true };
    if (gap === 2 && st.freezes > 0) return { count: st.count, today: false, atRisk: true, frozen: true };
    return { count: 0, today: false, atRisk: false };
  }
  function recordActivity() {
    const st = S().streak, today = U.dayStr();
    if (st.last === today) return false;
    const gap = st.last ? U.daysBetween(st.last, today) : 99;
    if (gap === 1) st.count++;
    else if (gap === 2 && st.freezes > 0) { st.freezes--; st.count++; }
    else st.count = 1;
    st.last = today;
    st.best = Math.max(st.best, st.count);
    return true;
  }

  /* ---------- Unlocking ---------- */
  const lessonRec = (id) => S().lessons[id];
  const isDone = (id) => !!(lessonRec(id) && lessonRec(id).done);
  function lessonUnlocked(id) {
    if (S().settings.unlockAll) return true;
    const m = /^w(\d)l(\d)$/.exec(id);
    const w = +m[1], n = +m[2];
    if (w === 1 && n === 1) return true;
    if (n > 1) return isDone(`w${w}l${n - 1}`);
    return isDone(`w${w - 1}l6`);
  }
  const worldUnlocked = (w) => lessonUnlocked(`w${w}l1`);
  const worldProgress = (w) => [1, 2, 3, 4, 5, 6].filter((n) => isDone(`w${w}l${n}`)).length;
  const worldStars = (w) => [1, 2, 3, 4, 5, 6].reduce((a, n) => a + ((lessonRec(`w${w}l${n}`) || {}).stars || 0), 0);
  const worldsComplete = () => [1, 2, 3, 4, 5, 6, 7].filter((w) => worldProgress(w) === 6).length;
  const licenceUnlocked = () => S().settings.unlockAll || worldsComplete() === 7;
  function nextLesson() {
    for (const w of CY.data.worlds) for (const l of w.lessons) if (!isDone(l.id) && lessonUnlocked(l.id)) return l;
    return null;
  }

  /* ---------- Adaptive difficulty ----------
     ease > 1 = more patience / time and a lower speed target. */
  function ease() {
    const mode = S().settings.difficulty;
    if (mode === 'gentle') return 1.4;
    if (mode === 'challenge') return 0.82;
    const h = S().history.slice(-5);
    if (h.length < 2) return 1.15;
    const acc = h.reduce((a, r) => a + r.acc, 0) / h.length;
    const ratio = h.reduce((a, r) => a + (r.ratio || 1), 0) / h.length;
    const fails = h.filter((r) => r.pass === false).length;
    if (fails >= 2 || ratio < 0.6) return 1.5;       // struggling or still very new to typing
    if (acc < 0.85 || ratio < 0.8) return 1.3;
    if (acc < 0.92) return 1.12;
    if (acc > 0.97 && ratio > 1.25) return 0.85;
    return 1;
  }
  /** Countdown length for a timed round at a given ease. */
  const timeFor = (def, e = ease()) => Math.round(def.time * e);
  const easeLabel = (e = ease()) => (e >= 1.2 ? 'Extra patience' : e > 1 ? 'A little extra time' : e < 0.95 ? 'Turbo mode' : 'Standard');

  /* ---------- Lesson results ---------- */
  function evaluate(def, r) {
    const target = Math.round((def.wpm || 15) / Math.max(0.85, Math.min(1.2, r.ease || 1)));
    const doneRatio = r.total ? r.done / r.total : 1;
    const decAcc = r.decisions ? r.decisionsRight / r.decisions : 1;
    const passed = doneRatio >= (def.pass || 0.7) && r.acc >= 0.55;
    let stars = 0;
    if (passed) {
      stars = 1;
      if (r.acc >= 0.92 && decAcc >= 0.75 && r.missed <= 1) stars = 2;
      if (r.acc >= 0.97 && r.wpm >= target && r.missed === 0 && decAcc >= 0.9) stars = 3;
    }
    return { passed, stars, target, doneRatio, decAcc };
  }

  /** Apply a finished lesson to the save. Returns everything the results screen needs. */
  function completeLesson(def, r, { context = 'lesson' } = {}) {
    const s = S();
    const ev = evaluate(def, r);
    const prev = s.lessons[def.id] ? { ...s.lessons[def.id] } : null;
    const rec = s.lessons[def.id] || (s.lessons[def.id] = { done: false, stars: 0, bestScore: 0, bestWpm: 0, bestAcc: 0, plays: 0 });
    const firstClear = ev.passed && !rec.done;
    const xpLines = [];
    let heartDelta = 0;

    rec.plays++;
    const pb = { score: r.score > rec.bestScore && rec.plays > 1, wpm: r.wpm > rec.bestWpm && rec.plays > 1, acc: r.acc > rec.bestAcc && rec.plays > 1 };

    if (ev.passed) {
      xpLines.push([def.final ? 'Final challenge cleared' : 'Lesson complete', def.final ? 20 : 10]);
      if (r.acc >= 0.98) xpLines.push(['Accuracy bonus', 10]);
      else if (r.acc >= 0.95) xpLines.push(['Accuracy bonus', 6]);
      else if (r.acc >= 0.9) xpLines.push(['Accuracy bonus', 3]);
      if (r.wpm >= ev.target * 1.3) xpLines.push(['Speed bonus', 8]);
      else if (r.wpm >= ev.target) xpLines.push(['Speed bonus', 5]);
      if (firstClear) xpLines.push(['First clear', 10]);
      if (pb.score) xpLines.push(['New personal best', 5]);
      rec.done = true;
      rec.stars = Math.max(rec.stars, ev.stars);
      // forgiving hearts: a passed replay earns a heart back
      if (heartsOn() && prev && prev.done && s.hearts.count < s.hearts.max) { s.hearts.count++; heartDelta = 1; }
    } else {
      xpLines.push(['Effort (keep going!)', 3]);
      if (heartsOn() && !(prev && prev.done) && s.hearts.count > 0) { s.hearts.count--; s.hearts.lastRefill = s.hearts.count === s.hearts.max - 1 ? Date.now() : s.hearts.lastRefill; heartDelta = -1; }
    }
    rec.bestScore = Math.max(rec.bestScore, r.score);
    rec.bestWpm = Math.max(rec.bestWpm, r.wpm);
    rec.bestAcc = Math.max(rec.bestAcc, r.acc);

    // planet impact from every sustainable decision made this round
    const planet = CY.planet.apply(r.eco || []);
    const xp = xpLines.reduce((a, [, n]) => a + n, 0);
    let coins = ev.passed ? 5 + ev.stars * 3 + Math.min(10, Math.floor(r.bestCombo / 20) * 2) + (firstClear && def.final ? 15 : 0) : 1;
    const planetCoins = ev.passed ? Math.round(coins * CY.planet.tierOf().coinBonus) : 0;
    coins += planetCoins;

    // stats
    const st = s.stats;
    const words = Math.round(r.correct / 5);
    st.wordsTyped += words;
    st.charsTyped += r.correct;
    st.bestWpm = Math.max(st.bestWpm, ev.passed ? r.wpm : 0);
    st.bestCombo = Math.max(st.bestCombo, r.bestCombo);
    st.timePlayedSec += Math.round(r.seconds);
    if (ev.passed) st.lessonsDone++;
    if (ev.passed && r.acc >= 0.999 && r.correct > 10) st.perfectLessons++;
    st.served += r.served || 0;
    st.sorted += r.sortedRight || 0;
    st.rescued += r.rescuedRight || 0;
    st.remade += r.remadeRight || 0;

    s.history.push({ t: Date.now(), id: def.id, wpm: r.wpm, acc: r.acc, ratio: r.wpm / Math.max(1, ev.target), pass: ev.passed });
    if (s.history.length > 40) s.history.splice(0, s.history.length - 40);

    // missions
    if (ev.passed) trackMission('lessons', 1);
    trackMission('words', words);
    if (ev.passed && r.acc >= 0.98) trackMission('perfect', 1);
    if (ev.stars === 3) trackMission('stars3', 1);
    trackMission('served', r.served || 0);
    trackMission('eco', (r.sortedRight || 0) + (r.rescuedRight || 0) + (r.remadeRight || 0));
    if (context === 'daily') { trackMission('daily', 1); trackDaily('oneMinute', 1); }
    if (ev.passed && r.acc >= 0.95 && context === 'lesson') trackDaily('acc95', 1);
    const ecoOk = (cat) => (r.eco || []).filter((e) => e.ok && e.cat === cat && !e.step).length;
    trackDaily('sorted', r.sortedRight || 0);
    trackDaily('recycled', ecoOk('recycle'));
    trackDaily('rescued', r.rescuedRight || 0);
    trackDaily('stored', ecoOk('storage'));
    trackDaily('circular', (r.eco || []).filter((e) => e.ok && e.cat === 'circular').length);

    const streakUp = ev.passed ? recordActivity() : false;
    const levelUp = addXp(xp, 'lesson');
    addCoins(coins);

    const worldComplete = firstClear && def.n === 6;
    const unlockedWorld = worldComplete && def.world < 7 ? def.world + 1 : null;
    const newAch = checkAchievements();
    changed();
    return { ...ev, xp, xpLines, coins, planetCoins, planet, firstClear, prev, pb, heartDelta, streakUp, levelUp, newAch, worldComplete, unlockedWorld };
  }

  /* ---------- Daily Special ---------- */
  const dailyDoneToday = () => S().daily.date === U.dayStr() && S().daily.done;
  function dailyDef() {
    const rnd = U.seeded(U.dayStr());
    const unlocked = CY.data.worlds.filter((w) => worldUnlocked(w.id) && w.id <= 4).flatMap((w) => w.lessons.filter((l) => l.mode === 'sequence' && lessonUnlocked(l.id)));
    const pool = (unlocked.length ? unlocked : [CY.data.lesson('w1l1')]).flatMap((l) => l.items.map((it) => (typeof it === 'string' ? it.replace('\n', '') : it.t)));
    const items = U.shuffle([...new Set(pool)], rnd).slice(0, 14);
    const themes = ['Soup of the Day', 'Chef’s Surprise', 'Market Fresh', 'Garden Platter', 'Midnight Snack', 'Brunch Bonanza', 'Picnic Basket'];
    return { id: 'daily', world: 0, n: 0, title: `Daily Special: ${U.pick(themes, rnd)}`, objective: 'Type as many dishes as you can in 60 seconds.', tip: 'One go a day keeps the streak alive.', mode: 'sequence', scene: 'daily', strict: false, time: 60, wpm: 16, pass: 0.3, items, keyboard: false };
  }
  function completeDaily(r) {
    const s = S();
    const first = !dailyDoneToday();
    const def = dailyDef();
    const res = completeLesson(def, r, { context: 'daily' });
    delete s.lessons.daily;
    if (first && res.passed) {
      s.daily = { date: U.dayStr(), done: true, best: Math.max(r.score, s.daily.date === U.dayStr() ? s.daily.best : 0) };
      s.stats.dailyDone++;
      addXp(30, 'daily'); addCoins(20);
      res.xp += 30; res.coins += 20; res.xpLines.push(['Daily Special bonus', 30]);
      res.newAch = res.newAch.concat(checkAchievements());
    } else if (s.daily.date === U.dayStr()) {
      s.daily.best = Math.max(s.daily.best, r.score);
    }
    changed();
    return res;
  }

  /* ---------- Weekly missions ---------- */
  function ensureWeek() {
    const s = S(), id = U.weekId();
    if (s.weekly.id === id && s.weekly.missions.length) return;
    const rnd = U.seeded(id + s.created);
    const tier = Math.min(2, Math.floor((levelInfo().level - 1) / 4));
    s.weekly = {
      id, weekXp: 0,
      missions: U.shuffle(CY.data.missionPool, rnd).slice(0, 3).map((m) => ({ id: m.id, goal: m.goals[tier], progress: 0, claimed: false })),
    };
    CY.store.save();
  }
  function trackMission(metric, n) {
    if (!n) return;
    if (metric === 'lessons' || metric === 'served') trackDaily(metric, n);
    ensureWeek();
    S().weekly.missions.forEach((m) => {
      if (m.id === metric && !m.claimed) {
        const was = m.progress >= m.goal;
        m.progress = Math.min(m.goal, m.progress + n);
        if (!was && m.progress >= m.goal) CY.bus.emit('mission:ready', m);
      }
    });
  }
  const missionDef = (id) => CY.data.missionPool.find((m) => m.id === id);
  function claimMission(i) {
    const m = S().weekly.missions[i];
    if (!m || m.claimed || m.progress < m.goal) return null;
    const d = missionDef(m.id);
    m.claimed = true;
    addXp(d.xp, 'mission'); addCoins(d.coins);
    const newAch = checkAchievements();
    changed();
    return { xp: d.xp, coins: d.coins, newAch };
  }

  /* ---------- Daily Eco Missions ---------- */
  function ensureDaily() {
    const s = S(), today = U.dayStr();
    if (s.dailyEco.date === today && s.dailyEco.missions.length) return;
    const rnd = U.seeded(today + s.created);
    const feasible = CY.data.dailyPool.filter((m) => worldUnlocked(m.needs));
    // favour eco missions once their worlds are open
    const eco = U.shuffle(feasible.filter((m) => m.needs >= 5), rnd);
    const rest = U.shuffle(feasible.filter((m) => m.needs < 5), rnd);
    const pick = [...eco.slice(0, 2), ...rest].slice(0, 3);
    s.dailyEco = { date: today, chest: false, missions: pick.map((m) => ({ id: m.id, goal: m.goal, progress: 0, claimed: false })) };
    CY.store.save();
  }
  function trackDaily(metric, n) {
    if (!n) return;
    ensureDaily();
    S().dailyEco.missions.forEach((m) => {
      if (m.id === metric && !m.claimed) m.progress = Math.min(m.goal, m.progress + n);
    });
  }
  const dailyMissionDef = (id) => CY.data.dailyPool.find((m) => m.id === id);
  const missionText = (d, goal) => d.text.replace('{g}', goal).replace('{s}', goal === 1 ? '' : 's');
  function claimDaily(i) {
    const m = S().dailyEco.missions[i];
    if (!m || m.claimed || m.progress < m.goal) return null;
    m.claimed = true;
    addXp(20, 'daily-eco'); addCoins(15);
    const newAch = checkAchievements();
    changed();
    return { xp: 20, coins: 15, newAch };
  }
  const chestReady = () => { const d = S().dailyEco; return d.missions.length && d.missions.every((m) => m.claimed) && !d.chest; };
  function claimChest() {
    const s = S();
    if (!chestReady()) return null;
    s.dailyEco.chest = true;
    s.stats.dailyChests++;
    const item = CY.data.chestRewards.map((id) => CY.data.shop.find((x) => x.id === id)).find((it) => !s.owned.includes(it.id));
    let coins = 30;
    if (item) { s.owned.push(item.id); if (item.place) s.decor[item.id] = true; } else coins += 50;
    addXp(40, 'chest'); addCoins(coins);
    CY.planet.checkMilestones();
    const newAch = checkAchievements();
    changed();
    return { xp: 40, coins, item, newAch };
  }

  /* ---------- Races ---------- */
  function completeRace({ trackId, place, field, wpm, acc, time, samples, finished }) {
    const s = S(), rs = s.races;
    rs.played++;
    if (finished && place === 1) rs.wins++;
    if (finished && place <= 3) rs.podiums++;
    const rec = rs.records[trackId];
    const isPb = finished && (!rec || time < rec.time);
    if (isPb) rs.records[trackId] = { time, wpm, acc, samples, date: Date.now() };
    const xpBy = [0, 40, 30, 20, 12, 10], coinBy = [0, 30, 20, 12, 8, 6];
    const xpLines = [[finished ? `Finished ${ordinal(place)} of ${field}` : 'Race attempt', finished ? xpBy[Math.min(place, 5)] : 5]];
    if (acc >= 0.97) xpLines.push(['Clean racing (97%+ accuracy)', 8]);
    if (isPb && rec) xpLines.push(['New personal record', 15]);
    const xp = xpLines.reduce((a, [, n]) => a + n, 0);
    const coins = finished ? coinBy[Math.min(place, 5)] + (isPb && rec ? 10 : 0) : 2;
    s.stats.wordsTyped += Math.round((samples.chars || 0) / 5);
    s.stats.bestWpm = Math.max(s.stats.bestWpm, finished ? wpm : 0);
    s.stats.timePlayedSec += Math.round(time);
    trackDaily('race', 1);
    if (finished && place <= 3) trackDaily('podium', 1);
    if (trackId === 'sprint') trackDaily('oneMinute', 1);
    trackMission('words', Math.round((samples.chars || 0) / 5));
    const streakUp = recordActivity();
    const levelUp = addXp(xp, 'race');
    addCoins(coins);
    const newAch = checkAchievements();
    changed();
    return { xp, xpLines, coins, isPb, prevRecord: rec || null, streakUp, levelUp, newAch };
  }
  const ordinal = (n) => { const t = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (t[(v - 20) % 10] || t[v] || t[0]); };

  /* ---------- Achievements ---------- */
  function checkAchievements() {
    const s = S(), fresh = [];
    CY.data.achievements.forEach((a) => {
      if (!s.achievements[a.id] && a.test(s)) { s.achievements[a.id] = Date.now(); fresh.push(a); }
    });
    if (fresh.length) CY.store.save();
    return fresh;
  }

  /* ---------- Shop ---------- */
  function buy(id) {
    const s = S(), item = CY.data.shop.find((x) => x.id === id);
    if (!item) return { ok: false, msg: 'Item not found.' };
    if (!item.consumable && s.owned.includes(id)) return { ok: false, msg: 'Already owned.' };
    if (id === 'streak-freeze' && s.streak.freezes >= 2) return { ok: false, msg: 'You can hold 2 streak freezes at most.' };
    if (id === 'heart-refill' && s.hearts.count >= s.hearts.max) return { ok: false, msg: 'Your hearts are already full.' };
    if (item.exclusive) return { ok: false, msg: 'You can’t buy this one. It comes from Eco Chests or Planet milestones.' };
    if (s.coins < item.price) return { ok: false, msg: `You need ${item.price - s.coins} more coins.` };
    s.coins -= item.price;
    if (id === 'streak-freeze') s.streak.freezes++;
    else if (id === 'heart-refill') s.hearts.count = s.hearts.max;
    else {
      s.owned.push(id);
      if (item.place) s.decor[id] = true;
      if (item.slot) equipRaw(item);
    }
    const planet = CY.planet.checkMilestones();
    const newAch = checkAchievements();
    changed();
    return { ok: true, item, newAch, planet };
  }
  function equipRaw(item) {
    const s = S();
    if (['theme', 'wall', 'tables'].includes(item.slot)) s.style[item.slot] = item.id;
    else if (item.slot === 'cyhat' || item.slot === 'cyacc') s.mascot[item.slot] = s.mascot[item.slot] === item.id ? 'none' : item.id;
    else s.profile.avatar[item.slot] = item.id.startsWith('apron-') ? item.id.replace('apron-', '') : item.id;
  }
  /** Equip (or, for Cy's outfits, toggle) an owned slot item. */
  function equip(id) {
    const item = CY.data.shop.find((x) => x.id === id);
    if (!item || !item.slot || !S().owned.includes(id)) return false;
    equipRaw(item);
    CY.planet.checkMilestones();
    const newAch = checkAchievements();
    changed();
    return { newAch };
  }
  const decorFor = (place) => CY.data.shop.filter((i) => i.place === place && S().decor[i.id]).map((i) => i.id);
  function toggleDecor(id) { S().decor[id] = !S().decor[id]; CY.planet.checkMilestones(); checkAchievements(); changed(); }

  return {
    levelInfo, addXp, addCoins, heartsTick, heartsOn, nextHeartIn, canStart,
    streakDisplay, recordActivity,
    lessonUnlocked, worldUnlocked, worldProgress, worldStars, worldsComplete, licenceUnlocked, nextLesson, isDone, lessonRec,
    ease, easeLabel, timeFor, evaluate, completeLesson,
    dailyDoneToday, dailyDef, completeDaily,
    ensureWeek, trackMission, missionDef, claimMission,
    ensureDaily, trackDaily, dailyMissionDef, missionText, claimDaily, chestReady, claimChest,
    completeRace, ordinal, equip,
    checkAchievements, buy, decorFor, toggleDecor, changed,
  };
})();
