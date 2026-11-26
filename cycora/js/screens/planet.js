/* CYCORA · Planet Health screen — what your decisions did, and why they matter. */
(() => {
  const U = CY.util, A = CY.art, PL = () => CY.planet;

  CY.screens.planet = (host) => {
    const s = CY.store.s, v = PL().score(), t = PL().tierOf(v), passive = PL().passive();
    const cats = Object.entries(PL().CATS);
    const good = (k) => PL().count(k), bad = (k) => PL().count(`${k}Wrong`);
    // weakest area → Cy's tip
    const scored = cats.filter(([k]) => k !== 'wasted').map(([k, c]) => ({ k, c, n: good(k) + bad(k), r: good(k) / Math.max(1, good(k) + bad(k)) }));
    const weak = scored.filter((x) => x.n).sort((a, b) => a.r - b.r)[0];
    const untried = scored.find((x) => !x.n && CY.progress.worldUnlocked({ sort: 5, recycle: 5, rescue: 6, storage: 6, safety: 6, circular: 7, efficiency: 7 }[x.k] || 1));
    const tip = bad('wasted') > 3 ? 'Too many customers are walking out, and their food goes in the bin. Speedy Service is good practice for that.'
      : weak && weak.r < 0.8 ? `Your trickiest area is ${weak.c.name.toLowerCase()}. ${weak.c.why}`
      : untried ? `You haven’t tried any ${untried.c.name.toLowerCase()} yet. It’s in one of the worlds you’ve unlocked.`
      : !s.planet.log.length ? 'Your planet changes with every sustainable decision in Eco Sorting, Food Rescue and Re-Make Magic.'
      : 'Your choices have been good lately. The street’s noticed.';
    const ecoItems = CY.data.shop.filter((i) => i.planet);
    const env = CY.screens.envSVG(t.i), ground = CY.screens.groundSVG(t.i);

    host.innerHTML = `<section class="planet-page screen-in">
      <header class="page-head planet-head t${t.i}">
        <div class="ph-char">${A.character('earth', { size: 120, mood: PL().mood(), cls: 'bob' })}</div>
        <div><h1>Planet Health</h1><p>The choices you make in lessons change the street outside the restaurant.</p>
          <div class="big-meter" role="img" aria-label="Planet health ${v} out of 100, ${t.name}">
            <i style="width:${v}%"></i>${PL().TIERS.slice(1).map((x) => `<span class="tick" style="left:${x.min}%"><b>${x.min}</b></span>`).join('')}
          </div>
          <p class="pm-line"><b>${v}/100 · ${t.name}.</b> ${t.line}${passive ? ` <span class="chip small">${A.icon('leaf', 16)} +${passive} from eco upgrades</span>` : ''}</p>
        </div>
      </header>

      <div class="planet-grid">
        <div class="planet-left">
          <div class="panel env-preview env-t${t.i}"><h2>Your street right now</h2><div class="envp">${env}<div class="envp-house">${A.room(4, 6, { decor: CY.progress.decorFor('dining') })}</div>${ground}</div></div>

          <div class="panel"><h2>${A.icon('info', 22)} Why your choices matter</h2>
            <div class="cat-grid">${cats.map(([k, c]) => `<article class="cat ${k === 'wasted' ? 'neg' : ''}"><header>${A.icon(c.icon, 26)}<b>${c.name}</b></header>
              <p class="cat-counts">${k === 'wasted' ? `<span class="bad">${bad(k)} meal${bad(k) === 1 ? '' : 's'} lost</span>` : `<span class="ok">✓ ${good(k)} right</span> <span class="bad">✗ ${bad(k)} to learn from</span>`}</p>
              <p>${c.why}</p></article>`).join('')}</div>
          </div>
        </div>

        <aside class="planet-right">
          <div class="panel cy-tip"><div>${A.character('cy', { size: 80, mood: 'happy' })}</div><p><b>Cy’s tip:</b> ${U.esc(tip)}</p></div>

          <div class="panel"><h2>Planet levels</h2><ol class="tiers">${PL().TIERS.map((x, i) => {
            const m = PL().MILESTONES.find((mm) => mm.at === x.min);
            return `<li class="${i === t.i ? 'cur' : i < t.i ? 'past' : ''}"><b>${x.min}+ · ${x.name}</b><small>${x.line}</small>${x.coinBonus ? `<em>Perk: +${Math.round(x.coinBonus * 100)}% lesson coins</em>` : ''}${m ? `<em>${s.planet.tiers.includes(m.at) ? '✓ Reward claimed' : 'Reward'}: +${m.coins} coins · +${m.xp} XP${m.item ? ` · exclusive ${CY.data.shop.find((it) => it.id === m.item).name}` : ''}</em>` : ''}</li>`;
          }).join('')}</ol></div>

          <div class="panel"><h2>Eco upgrades</h2><ul class="eco-ups">${ecoItems.map((it) => {
            const own = s.owned.includes(it.id), on = it.place ? s.decor[it.id] : s.style[it.slot] === it.id;
            return `<li class="${own && on ? 'on' : ''}"><span>${U.esc(it.name)}</span><b>+${it.planet}</b><small>${own ? (on ? 'Active' : 'Owned · not displayed') : it.exclusive ? 'Exclusive reward' : `${it.price} coins`}</small></li>`;
          }).join('')}</ul><a class="btn btn-soft btn-small" href="#/shop">Visit the shop</a></div>
        </aside>
      </div>

      <div class="panel"><h2>Recent decisions</h2>
        ${s.planet.log.length ? `<ul class="plog">${s.planet.log.slice(0, 14).map((e) => `<li class="${e.ok ? 'ok' : 'bad'}"><span class="pl-ic">${e.ok ? A.icon('check', 18) : A.icon('close', 16)}</span><div><b>${U.esc(e.item)}</b> <small>${PL().CATS[e.cat].name}</small><p>${U.esc(e.why)}</p></div><em>${e.d > 0 ? '+' : '−'}${Math.abs(e.d)}</em></li>`).join('')}</ul>`
          : `<p class="muted">No decisions yet. Play Eco Sorting Squad, Food Rescue Heroes or Re-Make Magic${CY.progress.worldUnlocked(5) ? '' : ' (they unlock as you go)'}, and keep customers from walking out in service lessons.</p>`}
      </div>
    </section>`;
  };
})();
