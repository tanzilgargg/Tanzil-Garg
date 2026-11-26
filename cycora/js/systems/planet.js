/* CYCORA · Planet Health
   Every sustainable decision in gameplay feeds this score (0–100):
   sorting, recycling, food rescue, safe storage, food safety, circular production,
   avoiding waste — and missed customers (wasted meals) pull it down a little.
   Eco upgrades in the restaurant add a passive bonus while they're displayed.
   The score drives the HQ environment, Cy's mood, coin bonuses and milestone rewards. */
CY.planet = (() => {
  const U = CY.util;
  const S = () => CY.store.s;

  const CATS = {
    sort: { name: 'Waste sorting', icon: 'leaf', why: 'Waste in the right bin keeps compost and recycling clean, so more of it gets a second life instead of going to landfill.' },
    recycle: { name: 'Recycling', icon: 'refresh', why: 'Clean, empty recycling turns back into bottles, cans and paper, which saves digging up new materials.' },
    rescue: { name: 'Food rescue', icon: 'heart', why: 'Shared surplus gets eaten. Food in the bin also wastes the water, energy and land that went into growing it.' },
    storage: { name: 'Safe storage', icon: 'snow', why: 'Chilling and freezing at the right time keeps food safe for longer, so less of it spoils.' },
    safety: { name: 'Food safety', icon: 'info', why: 'Catching unsafe food stops people getting ill. Composting it means it still feeds the soil.' },
    circular: { name: 'Circular production', icon: 'gear', why: 'Turning “waste” into compost, fuel and new materials keeps resources in use and out of landfill.' },
    efficiency: { name: 'Avoiding waste', icon: 'bolt', why: 'Switching things off, using less water and packaging, and sensible portions all mean less to throw away.' },
    wasted: { name: 'Meals wasted', icon: 'clock', why: 'When customers give up waiting, their food is often thrown away. Fast, accurate service prevents food waste.' },
  };

  const TIERS = [
    { min: 0, name: 'Struggling', line: 'There’s smog over the street. Good decisions clear it.', coinBonus: 0 },
    { min: 30, name: 'Recovering', line: 'The air’s clearing and a few flowers have come back.', coinBonus: 0 },
    { min: 60, name: 'Thriving', line: 'Blue sky, birds, blossom. People like sitting outside now.', coinBonus: 0.1 },
    { min: 85, name: 'Flourishing', line: 'Bees, butterflies, the odd rainbow. People come just to look at the street.', coinBonus: 0.2 },
  ];
  const MILESTONES = [
    { at: 60, coins: 60, xp: 40, item: null, label: 'Thriving planet' },
    { at: 85, coins: 100, xp: 60, item: 'wall-mural', label: 'Flourishing planet' },
  ];

  /** Passive bonus from eco items currently on display / equipped. */
  function passive() {
    const s = S();
    return CY.data.shop.reduce((a, it) => {
      if (!it.planet || !s.owned.includes(it.id)) return a;
      const active = it.place ? s.decor[it.id] : it.slot ? s.style[it.slot] === it.id : false;
      return a + (active ? it.planet : 0);
    }, 0);
  }
  const score = () => Math.round(U.clamp(S().planet.base + passive(), 0, 100));
  const tierOf = (v = score()) => { let t = 0; TIERS.forEach((x, i) => { if (v >= x.min) t = i; }); return { i: t, ...TIERS[t] }; };

  /** Convert a decision made in gameplay into a planet event. */
  function eventFor(scene, item, ok) {
    let cat = 'sort';
    if (scene === 'sort') cat = item.a === 'recycle' ? 'recycle' : 'sort';
    else if (scene === 'rescue') cat = item.a === 'donate' ? 'rescue' : item.a === 'compost' ? 'safety' : 'storage';
    else if (scene === 'match') cat = 'circular';
    else if (scene === 'eco') cat = 'efficiency';
    return { cat, ok, item: item.n, why: item.why || CATS[cat].why, delta: ok ? 2 : -2 };
  }

  /** Apply a batch of events from a round. Returns a summary for the results screen. */
  function apply(events = []) {
    const p = S().planet;
    const before = score(), tBefore = tierOf(before).i;
    let total = 0;
    events.forEach((e) => {
      const d = e.delta ?? (e.ok ? 2 : -2);
      const nb = U.clamp(p.base + d, 0, 100);
      total += nb - p.base;
      p.base = nb;
      const key = e.ok ? e.cat : `${e.cat}Wrong`;
      p.counts[key] = (p.counts[key] || 0) + 1;
      if (e.cat !== 'circular' || !e.step) p.log.unshift({ t: Date.now(), cat: e.cat, ok: e.ok, item: e.item, why: e.why, d });
    });
    if (p.log.length > 40) p.log.length = 40;
    const after = score();
    const rewards = checkMilestones();
    if (total) CY.bus.emit('planet', { total, after });
    return { total, before, after, tierUp: tierOf(after).i > tBefore ? tierOf(after) : null, rewards, events };
  }

  /** Re-check milestone rewards (also called after buying/placing eco items). */
  function checkMilestones() {
    const p = S().planet, v = score(), got = [];
    MILESTONES.forEach((m) => {
      if (v >= m.at && !p.tiers.includes(m.at)) {
        p.tiers.push(m.at);
        CY.progress.addCoins(m.coins);
        CY.progress.addXp(m.xp, 'planet');
        if (m.item && !S().owned.includes(m.item)) S().owned.push(m.item);
        got.push(m);
      }
    });
    return got;
  }

  const count = (cat) => S().planet.counts[cat] || 0;

  /* Cy's mood follows the planet. */
  const mood = () => (score() >= 85 ? 'cheer' : score() >= 60 ? 'happy' : score() >= 30 ? 'think' : 'sad');

  return { CATS, TIERS, MILESTONES, passive, score, tierOf, eventFor, apply, checkMilestones, count, mood };
})();
