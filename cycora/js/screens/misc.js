/* CYCORA · shop, profile & avatar, trophies, leaderboard, settings, onboarding. */
(() => {
  const U = CY.util, A = CY.art, P = () => CY.progress;

  /* ===================== LEADERBOARD PROVIDER =====================
     Practice league: rivals are deterministic bot chefs so the weekly race works
     offline. Swap `entries()` for an API call when multiplayer arrives. */
  CY.leaderboard = {
    entries(metric = 'xp') {
      const s = CY.store.s, wk = U.weekId(), prog = Math.min(1, U.weekProgress() * 1.05 + 0.02);
      const rivals = CY.data.rivals.map((r) => {
        const rnd = U.seeded(wk + r.name);
        return { name: r.name, av: r.av, xp: Math.round(r.base * (0.55 + rnd() * 0.8) * prog), wpm: Math.round(r.wpm * (0.9 + rnd() * 0.2)), bot: true };
      });
      const me = { name: s.profile.name, av: s.profile.avatar, xp: s.weekly.weekXp || 0, wpm: s.stats.bestWpm, me: true };
      return [...rivals, me].sort((a, b) => b[metric] - a[metric]);
    },
    rank(metric = 'xp') { return this.entries(metric).findIndex((e) => e.me) + 1; },
  };

  /* ===================== SHOP ===================== */
  const THEME_COL = { 'theme-classic': ['#FF7A6B', '#FFE3D3'], 'theme-seaside': ['#5DB4E3', '#F4FBFF'], 'theme-garden': ['#6DB36A', '#F1E6D2'], 'theme-night': ['#7A5CA8', '#E9E1F5'], 'theme-sunset': ['#FF9A4D', '#FFE3C2'] };
  const miniHouse = (id, w = 84) => { const [r, wl] = THEME_COL[id] || THEME_COL['theme-classic']; return `<svg viewBox="0 0 64 56" width="${w}" aria-hidden="true"><rect x="8" y="22" width="48" height="30" rx="3" fill="${wl}" stroke="#3D2F4F" stroke-width="2.5"/><path d="M4 24 L10 10 H54 L60 24Z" fill="${r}" stroke="#3D2F4F" stroke-width="2.5"/><rect x="14" y="28" width="12" height="10" rx="2" fill="#D5EFFB" stroke="#3D2F4F" stroke-width="2"/><rect x="38" y="28" width="12" height="10" rx="2" fill="#D5EFFB" stroke="#3D2F4F" stroke-width="2"/><rect x="27" y="38" width="10" height="14" rx="2" fill="${r}" stroke="#3D2F4F" stroke-width="2"/>${id === 'theme-night' ? '<path d="M10 10 H54" stroke="#FFD966" stroke-width="2" stroke-dasharray="2 3"/>' : ''}</svg>`; };
  function shopArt(item) {
    if (item.slot === 'theme') return miniHouse(item.id);
    if (item.slot === 'wall' || item.slot === 'tables') {
      const st = CY.store.s.style, keep = st[item.slot];
      st[item.slot] = item.id;
      const svg = A.room(4, 6, { decor: [] });
      st[item.slot] = keep;
      return `<span class="si-room">${svg}</span>`;
    }
    if (item.slot === 'cyhat' || item.slot === 'cyacc') return A.character('cy', { size: 92, mood: 'happy', outfit: { [item.slot]: item.id } });
    if (['booth', 'lanterns', 'chandelier', 'mixer', 'flowerbox', 'bee-hotel'].includes(item.id)) {
      const room = item.id === 'mixer' ? 3 : item.id === 'bee-hotel' ? 5 : 4;
      if (item.id === 'flowerbox') return `<svg viewBox="0 0 64 40" width="80" aria-hidden="true"><rect x="6" y="20" width="52" height="14" rx="3" fill="#C98B5B" stroke="#3D2F4F" stroke-width="2.5"/>${[14, 26, 38, 50].map((x, i) => `<path d="M${x} 20 v-8" stroke="#6DB36A" stroke-width="2.5"/><circle cx="${x}" cy="10" r="5" fill="${['#FFC9C9', '#FFF0B8', '#D9CCF2', '#FF7A6B'][i]}" stroke="#3D2F4F" stroke-width="1.8"/>`).join('')}</svg>`;
      return `<span class="si-room ${room === 5 ? 'wide' : ''}">${A.room(room, 6, { decor: [item.id] })}</span>`;
    }
    if (item.slot) {
      const av = { ...CY.store.s.profile.avatar };
      if (item.slot === 'apron') av.apron = item.id.replace('apron-', ''); else av[item.slot] = item.id;
      return A.avatar(av, 84);
    }
    const map = {
      plant: `<svg viewBox="0 0 64 64" width="72"><path d="M32 40 C14 30 12 12 24 8 C30 20 30 30 32 40Z M32 40 C50 30 54 12 42 8 C36 20 34 30 32 40Z" fill="#86C77A" stroke="#3D2F4F" stroke-width="2.5"/><path d="M18 40h28l-4 18H22z" fill="#FF7A6B" stroke="#3D2F4F" stroke-width="2.5"/></svg>`,
      lights: `<svg viewBox="0 0 64 64" width="72"><path d="M4 18 Q32 40 60 18" fill="none" stroke="#3D2F4F" stroke-width="2"/>${[10, 20, 32, 44, 54].map((x, i) => `<circle cx="${x}" cy="${24 + (i % 2 ? 6 : 2)}" r="6" fill="${['#FFD966', '#FFC9C9', '#C9E8F5'][i % 3]}" stroke="#3D2F4F" stroke-width="2"/>`).join('')}</svg>`,
      rug: `<svg viewBox="0 0 64 64" width="72"><ellipse cx="32" cy="36" rx="28" ry="14" fill="#FFC4A3" stroke="#3D2F4F" stroke-width="2.5"/><ellipse cx="32" cy="36" rx="20" ry="8" fill="none" stroke="#FF7A6B" stroke-width="2.5" stroke-dasharray="4 3"/></svg>`,
      art: `<svg viewBox="0 0 64 64" width="72"><rect x="8" y="12" width="48" height="40" rx="3" fill="#FFF6E6" stroke="#C98B5B" stroke-width="5"/><circle cx="24" cy="26" r="5" fill="#FFD966"/><path d="M12 48 l14 -12 10 8 8 -6 10 10z" fill="#8DBF8B"/></svg>`,
      lamp: `<svg viewBox="0 0 64 64" width="72"><path d="M32 58 V26" stroke="#3D2F4F" stroke-width="3"/><path d="M18 28 l14 -20 14 20z" fill="#FFF0B8" stroke="#3D2F4F" stroke-width="2.5"/><path d="M22 58h20" stroke="#3D2F4F" stroke-width="4" stroke-linecap="round"/></svg>`,
      copper: `<svg viewBox="0 0 64 64" width="72"><path d="M6 10h52" stroke="#9A6340" stroke-width="4"/>${[16, 32, 48].map((x, i) => `<path d="M${x} 10v8" stroke="#3D2F4F" stroke-width="2"/><circle cx="${x}" cy="${30 + i * 2}" r="${9 + i * 2}" fill="#E0905A" stroke="#3D2F4F" stroke-width="2.5"/>`).join('')}</svg>`,
      herbs: `<svg viewBox="0 0 64 64" width="72"><rect x="6" y="38" width="52" height="16" rx="4" fill="#C98B5B" stroke="#3D2F4F" stroke-width="2.5"/>${[16, 28, 40, 50].map((x, i) => `<path d="M${x} 38 c-8 -12 -2 -22 2 -24 c4 8 4 14 -2 24z" fill="${i % 2 ? '#6DB36A' : '#86C77A'}" stroke="#3D2F4F" stroke-width="2"/>`).join('')}</svg>`,
      awning: `<svg viewBox="0 0 64 64" width="72"><path d="M4 18 h56 l-4 16 H8z" fill="#FFF6E6" stroke="#3D2F4F" stroke-width="2.5"/>${[8, 22, 36, 50].map((x) => `<path d="M${x} 18 h7 l-1 16 h-7z" fill="#FF7A6B"/>`).join('')}<path d="M8 34 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" fill="#FF7A6B" stroke="#3D2F4F" stroke-width="2"/></svg>`,
      solar: `<svg viewBox="0 0 64 64" width="72"><path d="M8 44 L18 18 H58 L48 44Z" fill="#3E9FD0" stroke="#3D2F4F" stroke-width="2.5"/><path d="M13 31 H53 M28 18 L23 44 M43 18 L38 44" stroke="#D5EFFB" stroke-width="2"/><path d="M30 44 v12 M22 56 h16" stroke="#3D2F4F" stroke-width="3"/><circle cx="54" cy="10" r="6" fill="#FFD966" stroke="#3D2F4F" stroke-width="2"/></svg>`,
      garden: `<svg viewBox="0 0 64 64" width="72"><rect x="6" y="38" width="52" height="18" rx="3" fill="#9A6340" stroke="#3D2F4F" stroke-width="2.5"/><circle cx="18" cy="32" r="8" fill="#86C77A" stroke="#3D2F4F" stroke-width="2"/><circle cx="34" cy="28" r="10" fill="#6DB36A" stroke="#3D2F4F" stroke-width="2"/><circle cx="48" cy="32" r="7" fill="#86C77A" stroke="#3D2F4F" stroke-width="2"/><circle cx="34" cy="26" r="3" fill="#FF7A6B"/></svg>`,
    };
    if (item.id === 'streak-freeze') return `<svg viewBox="0 0 24 24" width="66">${A.icon('flame', 24).replace(/<\/?svg[^>]*>/g, '')}</svg><span class="freeze-ice">${A.icon('snow', 30)}</span>`;
    if (item.id === 'heart-refill') return A.icon('heart', 66);
    return map[item.id] || A.icon('sparkle', 60);
  }

  CY.screens.shop = (host) => {
    const s = CY.store.s;
    const cats = ['All', 'Themes', 'Walls', 'Furniture', 'Plants & Decor', 'Lighting', 'Kitchen', 'Upgrades', 'Cy’s Wardrobe', 'Your Chef', 'Boosts', 'Exclusive'];
    let cat = sessionStorage.getItem('cy.shopcat') || 'All';
    if (!cats.includes(cat)) cat = 'All';
    const draw = () => {
      const items = CY.data.shop.filter((i) => (cat === 'All' ? !i.exclusive || s.owned.includes(i.id) : cat === 'Exclusive' ? i.exclusive : i.cat === cat));
      const inUse = (it) => (it.slot === 'theme' || it.slot === 'wall' || it.slot === 'tables' ? s.style[it.slot] === it.id : it.slot === 'cyhat' || it.slot === 'cyacc' ? s.mascot[it.slot] === it.id : it.slot === 'apron' ? s.profile.avatar.apron === it.id.replace('apron-', '') : it.slot ? s.profile.avatar[it.slot] === it.id : false);
      host.innerHTML = `<section class="shop screen-in">
        <header class="page-head">
          <div class="ph-char">${A.character('momo', { size: 110, mood: 'happy', cls: 'bob' })}</div>
          <div><h1>The Restaurant Shop</h1><p>Every purchase changes your restaurant, your chef or Cy. Eco items also boost Planet Health.</p></div>
          <div class="wallet">${A.icon('coin', 34)}<b>${s.coins}</b><small>coins</small></div>
        </header>
        <div class="shop-preview" aria-label="Preview of your restaurant">
          <figure><div class="sp-house">${miniHouse(s.style.theme, 120)}</div><figcaption>Theme</figcaption></figure>
          <figure class="sp-room"><div>${A.room(4, 6, { decor: P().decorFor('dining') })}</div><figcaption>Dining room</figcaption></figure>
          <figure class="sp-room"><div>${A.room(3, 6, { decor: P().decorFor('kitchen') })}</div><figcaption>Kitchen</figcaption></figure>
          <figure><div>${A.character('cy', { size: 110, mood: 'cheer', cls: 'bob' })}</div><figcaption>Cy</figcaption></figure>
          <p class="sp-note">${A.icon('info', 16)} Preview shows rooms fully built.</p>
        </div>
        <div class="tabs" role="tablist">${cats.map((c) => `<button role="tab" class="tab ${c === cat ? 'active' : ''}" aria-selected="${c === cat}" data-c="${c}">${c}</button>`).join('')}</div>
        <div class="shop-grid">${items.map((it) => {
          const owned = !it.consumable && s.owned.includes(it.id);
          const placed = it.place && s.decor[it.id];
          const can = s.coins >= it.price;
          const extra = it.id === 'streak-freeze' ? ` (you have ${s.streak.freezes})` : '';
          let btn;
          if (owned && it.place) btn = `<button class="btn btn-small ${placed ? 'btn-soft' : 'btn-primary'} toggle" data-id="${it.id}">${placed ? 'Displayed ✓ · Hide' : 'Display it'}</button>`;
          else if (owned && it.slot) {
            const u = inUse(it), cy = it.slot.startsWith('cy');
            btn = `<button class="btn btn-small ${u ? 'btn-soft' : 'btn-primary'} equip" data-id="${it.id}" ${u && !cy ? 'aria-disabled="true"' : ''}>${u ? (cy ? 'Wearing ✓ · Take off' : 'In use ✓') : cy || ['hat', 'apron', 'acc'].includes(it.slot) ? 'Wear it' : 'Use it'}</button>`;
          } else if (owned) btn = `<span class="btn btn-small btn-soft" aria-disabled="true">Owned</span>`;
          else if (it.exclusive) btn = `<span class="btn btn-small btn-soft" aria-disabled="true">${A.icon('leaf', 16)} Earn from ${it.id === 'wall-mural' ? 'Planet 85+' : 'Eco Chests'}</span>`;
          else btn = `<button class="btn btn-small ${can ? 'btn-primary' : 'btn-soft'} buy" data-id="${it.id}" ${can ? '' : 'aria-disabled="true"'}>${A.icon('coin', 18)} ${it.price}${can ? '' : ` · need ${it.price - s.coins} more`}</button>`;
          return `<article class="shop-item ${owned ? 'owned' : ''} ${it.exclusive ? 'exclusive' : ''}"><div class="si-art">${shopArt(it)}${it.planet ? `<span class="si-planet">${A.icon('globe', 16)} Planet +${it.planet}</span>` : ''}${it.exclusive ? '<span class="si-ex">Exclusive</span>' : ''}</div><span class="si-cat">${it.cat}</span><h2 class="si-name">${it.name}</h2><p>${it.desc}${extra}</p>${btn}</article>`;
        }).join('')}</div>
      </section>`;
      U.$$('.tab', host).forEach((t) => (t.onclick = () => { cat = t.dataset.c; sessionStorage.setItem('cy.shopcat', cat); draw(); U.$(`.tab[data-c="${cat}"]`, host).focus(); }));
      U.$$('.buy', host).forEach((b) => (b.onclick = () => {
        const r = P().buy(b.dataset.id);
        if (!r.ok) { CY.audio.play('wrong'); CY.fx.toast({ title: 'Not yet', text: r.msg, icon: 'coin', tone: 'peach', sound: 'miss' }); return; }
        CY.audio.play('coin');
        CY.fx.toast({ title: `Bought: ${r.item.name}`, text: r.item.place ? 'It’s in the restaurant already.' : r.item.slot === 'cyhat' || r.item.slot === 'cyacc' ? 'Cy has put it on. Cy looks pleased.' : r.item.slot ? 'Equipped.' : 'Boost ready.', icon: 'bag', tone: 'sage', sound: 'unlock' });
        if (r.item.planet) CY.fx.toast({ title: `Planet Health +${r.item.planet}`, text: 'Eco upgrades count while they’re on display.', icon: 'globe', tone: 'sky', sound: 'pop' });
        (r.planet || []).forEach((m) => CY.fx.toast({ title: `Planet milestone: ${m.label}`, text: `+${m.coins} coins · +${m.xp} XP`, icon: 'globe', tone: 'sage', sound: 'unlock' }));
        CY.fx.achievementToasts(r.newAch);
        draw();
      }));
      U.$$('.equip', host).forEach((b) => (b.onclick = () => { const r = P().equip(b.dataset.id); if (r) { CY.audio.play('pop'); CY.fx.achievementToasts(r.newAch); draw(); } }));
      U.$$('.toggle', host).forEach((b) => (b.onclick = () => { P().toggleDecor(b.dataset.id); CY.audio.play('pop'); draw(); }));
    };
    draw();
  };

  /* ===================== PROFILE ===================== */
  CY.screens.profile = (host) => {
    const s = CY.store.s;
    const draw = () => {
      const av = s.profile.avatar, lv = P().levelInfo(), st = s.stats;
      const hats = ['none', 'hat-classic', ...CY.data.shop.filter((i) => i.slot === 'hat').map((i) => i.id)];
      const aprons = ['sage', ...CY.data.shop.filter((i) => i.slot === 'apron').map((i) => i.id.replace('apron-', ''))];
      const accs = ['none', ...CY.data.shop.filter((i) => i.slot === 'acc').map((i) => i.id)];
      const owns = (id) => id === 'none' || id === 'sage' || id === 'hat-classic' || s.owned.includes(id) || s.owned.includes('apron-' + id);
      const h = s.history.slice(-20);
      const avgAcc = h.length ? h.reduce((a, r) => a + r.acc, 0) / h.length : 0;
      const opt = (group, val, label, inner, locked) => `<button class="sw ${av[group] === val ? 'sel' : ''} ${locked ? 'locked' : ''}" data-g="${group}" data-v="${val}" aria-pressed="${av[group] === val}" aria-label="${label}${locked ? ' (buy in shop)' : ''}">${inner}${locked ? `<i class="sw-lock">${A.icon('lock', 14)}</i>` : ''}</button>`;
      const prev = (patch) => A.avatar({ ...av, ...patch }, 46);
      host.innerHTML = `<section class="profile screen-in"><h1 class="sr-only">Your chef profile</h1>
        <div class="profile-card">
          <div class="pc-avatar">${A.avatar(av, 170, 'cheer')}</div>
          <label class="name-field"><span>Chef name</span><input class="name-in" maxlength="16" value="${U.esc(s.profile.name)}" /></label>
          <p class="pc-level"><b>Level ${lv.level}</b> · ${lv.title}</p>
          <div class="xp-bar"><i style="width:${lv.pct * 100}%"></i><span>${lv.into} / ${lv.need} XP</span></div>
          <dl class="pc-stats">
            <div><dt>Words typed</dt><dd>${st.wordsTyped.toLocaleString()}</dd></div>
            <div><dt>Lessons cleared</dt><dd>${st.lessonsDone}</dd></div>
            <div><dt>Best WPM</dt><dd>${st.bestWpm}</dd></div>
            <div><dt>Recent accuracy</dt><dd>${h.length ? U.pct(avgAcc) : 'none yet'}</dd></div>
            <div><dt>Best combo</dt><dd>${st.bestCombo}</dd></div>
            <div><dt>Best streak</dt><dd>${s.streak.best} day${s.streak.best === 1 ? '' : 's'}</dd></div>
            <div><dt>Eco decisions</dt><dd>${st.sorted + st.rescued + st.remade}</dd></div>
            <div><dt>Time practised</dt><dd>${Math.round(st.timePlayedSec / 60)} min</dd></div>
          </dl>
        </div>
        <div class="profile-right">
          <div class="panel">
            <h2>Customise your chef</h2>
            <div class="sw-group"><h3>Skin tone</h3>${A.palette.SKIN.map((c, i) => opt('skin', i, `Skin tone ${i + 1}`, `<i class="dot" style="background:${c}"></i>`)).join('')}</div>
            <div class="sw-group"><h3>Hair</h3>${[0, 1, 2, 3, 4].map((i) => opt('hair', i, ['Short', 'Bun', 'Curly', 'Long', 'Shaved'][i], prev({ hair: i, hat: 'none', acc: 'none' }))).join('')}</div>
            <div class="sw-group"><h3>Hair colour</h3>${A.palette.HAIR.map((c, i) => opt('hairColor', i, `Hair colour ${i + 1}`, `<i class="dot" style="background:${c}"></i>`)).join('')}</div>
            <div class="sw-group"><h3>Hat</h3>${hats.map((v) => opt('hat', v, v === 'none' ? 'No hat' : (CY.data.shop.find((i) => i.id === v) || { name: 'Classic toque' }).name, prev({ hat: v }), !owns(v))).join('')}</div>
            <div class="sw-group"><h3>Apron</h3>${aprons.map((v) => opt('apron', v, `${v} apron`, `<i class="dot" style="background:${A.palette.APRON[v]}"></i>`, !owns(v))).join('')}</div>
            <div class="sw-group"><h3>Accessory</h3>${accs.map((v) => opt('acc', v, v === 'none' ? 'No accessory' : CY.data.shop.find((i) => i.id === v).name, prev({ acc: v }), !owns(v))).join('')}</div>
            <p class="muted">Locked items can be bought in the <a href="#/shop">shop</a>.</p>
          </div>
          <div class="panel cy-wardrobe">
            <h2>Cy’s wardrobe</h2>
            <div class="cyw-row"><div class="cyw-cy">${A.character('cy', { size: 150, mood: 'cheer', cls: 'bob wave' })}</div>
            <div>${['cyhat', 'cyacc'].map((slot) => `<div class="sw-group"><h3>${slot === 'cyhat' ? 'Head' : 'Accessory'}</h3>${CY.data.shop.filter((i) => i.slot === slot).map((i) => {
              const own = s.owned.includes(i.id), on = s.mascot[slot] === i.id;
              return `<button class="sw cyw ${on ? 'sel' : ''} ${own ? '' : 'locked'}" data-id="${i.id}" aria-pressed="${on}" aria-label="${i.name}${own ? '' : i.exclusive ? ' (exclusive reward)' : ' (buy in shop)'}">${A.character('cy', { size: 46, outfit: { [slot]: i.id } })}${own ? '' : `<i class="sw-lock">${A.icon('lock', 14)}</i>`}</button>`;
            }).join('')}</div>`).join('')}
            <p class="muted">Tap again to take an item off. Exclusive outfits come from Daily Eco Chests.</p></div></div>
          </div>
          <div class="panel">
            <h2>Race records & planet</h2>
            <div class="rec-grid">${CY.race.TRACKS.map((t) => { const r = s.races.records[t.id]; return `<div class="rec"><b>${t.name}</b>${r ? `<span>${r.time.toFixed(1)}s · ${r.wpm} WPM · ${U.pct(r.acc)}</span>` : '<span class="muted">No record yet</span>'}</div>`; }).join('')}
              <div class="rec"><b>Races</b><span>${s.races.played} raced · ${s.races.wins} won · ${s.races.podiums} podium${s.races.podiums === 1 ? "" : "s"}</span></div>
              <a class="rec planet" href="#/planet"><b>Planet Health</b><span>${CY.planet.score()}/100 · ${CY.planet.tierOf().name}</span></a></div>
          </div>
          <div class="panel">
            <h2>Your progress</h2>
            ${h.length >= 2 ? historyChart(h) : '<p class="muted">Play a couple of lessons to see your speed and accuracy chart.</p>'}
          </div>
        </div>
      </section>`;
      U.$$('.sw:not(.cyw)', host).forEach((b) => (b.onclick = () => {
        if (b.classList.contains('locked')) { CY.fx.toast({ title: 'That’s in the shop', text: 'Lessons and races earn you coins for it.', icon: 'bag', tone: 'peach' }); return; }
        const g = b.dataset.g, v = b.dataset.v;
        av[g] = ['skin', 'hair', 'hairColor'].includes(g) ? +v : v;
        CY.audio.play('pop');
        P().changed();
        draw();
        const again = U.$(`.sw[data-g="${g}"][data-v="${v}"]`, host);
        if (again) again.focus();
      }));
      U.$$('.cyw', host).forEach((b) => (b.onclick = () => {
        if (b.classList.contains('locked')) { CY.fx.toast({ title: 'Not unlocked yet', text: 'It’s either in the shop or comes out of an Eco Chest.', icon: 'bag', tone: 'peach' }); return; }
        const r = P().equip(b.dataset.id);
        CY.audio.play('pop');
        if (r) CY.fx.achievementToasts(r.newAch);
        draw();
      }));
      const ni = U.$('.name-in', host);
      ni.onchange = () => { s.profile.name = ni.value.trim().slice(0, 16) || 'Chef'; P().changed(); };
    };
    draw();
  };

  function historyChart(h) {
    const W = 520, H = 170, pad = 28;
    const maxW = Math.max(20, ...h.map((r) => r.wpm));
    const x = (i) => pad + (i / (h.length - 1)) * (W - pad * 2);
    const yW = (v) => H - pad - (v / maxW) * (H - pad * 2);
    const yA = (v) => H - pad - v * (H - pad * 2);
    const lw = h.map((r, i) => `${x(i)},${yW(r.wpm)}`).join(' ');
    const la = h.map((r, i) => `${x(i)},${yA(r.acc)}`).join(' ');
    return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Words per minute and accuracy over your last ${h.length} rounds">
      <path d="M${pad} ${H - pad}H${W - pad}" stroke="#C9BFD6" stroke-width="2"/>
      <polyline points="${la}" fill="none" stroke="#4E8A5B" stroke-width="3.5" stroke-dasharray="7 5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${lw}" fill="none" stroke="#E0584A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${h.map((r, i) => `<circle cx="${x(i)}" cy="${yW(r.wpm)}" r="4.5" fill="#fff" stroke="#E0584A" stroke-width="2.5"/>`).join('')}
      <text x="${pad}" y="16" font-size="12" fill="#6B5E7B">max ${maxW} WPM</text>
    </svg><figcaption><span class="key-wpm">━ WPM (solid)</span><span class="key-acc">╍ Accuracy (dashed)</span></figcaption></figure>`;
  }

  /* ===================== TROPHIES ===================== */
  CY.screens.trophies = (host) => {
    const s = CY.store.s, all = CY.data.achievements, got = Object.keys(s.achievements).length;
    host.innerHTML = `<section class="trophies screen-in">
      <header class="page-head">
        <div class="ph-char">${A.character('zippy', { size: 110, mood: 'cheer', cls: 'bob' })}</div>
        <div><h1>Trophy Cabinet</h1><p>${got} of ${all.length} achievements unlocked. Every badge celebrates a skill you built.</p></div>
        <div class="wallet">${A.icon('trophy', 34)}<b>${got}</b><small>of ${all.length}</small></div>
      </header>
      <div class="trophy-grid">${all.map((a) => {
        const t = s.achievements[a.id];
        return `<article class="trophy ${t ? 'got' : 'locked'}"><div class="medal">${A.icon(a.icon, 44)}</div><h2 class="tr-name">${a.name}</h2><p>${a.desc}</p><small>${t ? `Unlocked ${new Date(t).toLocaleDateString()}` : 'Locked'}</small></article>`;
      }).join('')}</div>
    </section>`;
  };

  /* ===================== LEADERBOARD ===================== */
  CY.screens.leaderboard = (host) => {
    let metric = 'xp';
    const draw = () => {
      const rows = CY.leaderboard.entries(metric);
      const now = new Date(), daysLeft = 7 - ((now.getDay() + 6) % 7);
      host.innerHTML = `<section class="league screen-in">
        <header class="page-head">
          <div class="ph-char">${A.character('bao', { size: 110, mood: 'cheer', variant: 4, cls: 'bob' })}</div>
          <div><h1>Weekly League</h1><p>Earn XP in lessons, Daily Specials and missions to climb. Resets in <b>${daysLeft} day${daysLeft === 1 ? '' : 's'}</b>.</p></div>
        </header>
        <div class="tabs" role="tablist"><button role="tab" class="tab ${metric === 'xp' ? 'active' : ''}" data-m="xp" aria-selected="${metric === 'xp'}">Weekly XP</button><button role="tab" class="tab ${metric === 'wpm' ? 'active' : ''}" data-m="wpm" aria-selected="${metric === 'wpm'}">Best WPM</button></div>
        <ol class="board">${rows.map((r, i) => `<li class="${r.me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><span class="rank">${i < 3 ? A.icon('crown', 22) : ''}${i + 1}</span>${A.avatar(r.av, 44)}<span class="who">${U.esc(r.name)}${r.me ? ' <em>(you)</em>' : ''}</span><b>${metric === 'xp' ? `${r.xp} XP` : `${r.wpm} WPM`}</b></li>`).join('')}</ol>
        <p class="muted league-note">${A.icon('info', 18)} This is a practice league: your rivals are CYCORA’s friendly bot chefs, and their scores grow through the week. Online leagues with real players can plug in later.</p>
      </section>`;
      U.$$('.tab', host).forEach((t) => (t.onclick = () => { metric = t.dataset.m; draw(); }));
    };
    draw();
  };

  /* ===================== SETTINGS (modal) ===================== */
  CY.screens.settings = () => {
    const s = CY.store.s.settings;
    const seg = (key, opts) => `<div class="seg" role="radiogroup" aria-label="${key}">${opts.map(([v, l]) => `<button role="radio" class="seg-btn ${s[key] === v ? 'on' : ''}" aria-checked="${s[key] === v}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
    const tog = (key, label, sub) => `<label class="toggle-row"><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" class="sw-in" data-k="${key}" ${s[key] ? 'checked' : ''}/><i class="switch" aria-hidden="true"></i></label>`;
    CY.fx.modal({
      title: 'Settings',
      cls: 'settings',
      body: `<div class="set-sec"><h3>${A.icon('volume', 22)} Sound</h3>
          ${tog('sound', 'Sound effects', 'Rewards, coins, correct & incorrect answers')}
          ${tog('typingClicks', 'Typing clicks', 'A soft click for every key')}
          <label class="range-row"><span><b>Volume</b></span><input type="range" min="0" max="1" step="0.05" value="${s.volume}" class="vol"/><button class="btn btn-small btn-soft test-snd">Test</button></label></div>
        <div class="set-sec"><h3>${A.icon('sparkle', 22)} Display & motion</h3>
          <div class="row"><b>Animations</b>${seg('motion', [['full', 'Full'], ['reduced', 'Reduced']])}</div>
          <div class="row"><b>Text size</b>${seg('textSize', [['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']])}</div>
          ${tog('contrast', 'High contrast', 'Stronger outlines and text colours')}</div>
        <div class="set-sec"><h3>${A.icon('keyboard', 22)} Typing & difficulty</h3>
          ${tog('keyboard', 'Keyboard guide', 'Show the finger guide in lessons that use it (toggle any time with the keyboard button)')}
          <div class="row"><b>Difficulty</b>${seg('difficulty', [['gentle', 'Gentle'], ['adaptive', 'Adaptive'], ['challenge', 'Challenge']])}</div>
          <p class="muted small">Adaptive gives you extra time and patience when you need it, and less when you’re flying.</p>
          <div class="row"><b>Hearts</b>${seg('hearts', [['on', 'On'], ['relaxed', 'Relaxed (no hearts)']])}</div></div>
        <div class="set-sec"><h3>${A.icon('licence', 22)} Progress</h3>
          ${tog('unlockAll', 'Unlock all content', 'Teacher or demo mode. Opens every world and the Licence.')}
          <button class="btn btn-danger btn-small reset">Reset all progress</button></div>
        <div class="set-sec"><h3>${A.icon('info', 22)} Your data</h3>
          <p class="muted small">Your progress lives in this browser, on this device. There are no accounts and nothing gets sent anywhere. Make a backup to move to another device or browser, or to keep your progress safe.</p>
          <div class="data-btns"><button class="btn btn-primary btn-small export">Download backup</button>
          <label class="btn btn-soft btn-small import-lbl">Restore from backup<input type="file" accept=".json,application/json" class="import-in sr-only"/></label>
          <a class="btn btn-ghost btn-small" href="#/about">About, privacy & sources</a></div></div>`,
      actions: [{ label: 'Done', primary: true }],
      onOpen: (wrap) => {
        const apply = () => { CY.store.applySettings(); CY.store.save(); CY.bus.emit('state:changed'); };
        U.$$('.seg-btn', wrap).forEach((b) => (b.onclick = () => {
          s[b.dataset.k] = b.dataset.v;
          U.$$(`.seg-btn[data-k="${b.dataset.k}"]`, wrap).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
          apply();
        }));
        U.$$('.sw-in', wrap).forEach((c) => (c.onchange = () => { s[c.dataset.k] = c.checked; apply(); }));
        U.$('.vol', wrap).oninput = (e) => { s.volume = +e.target.value; CY.store.save(); };
        U.$('.test-snd', wrap).onclick = () => { CY.audio.unlock(); CY.audio.play('coin'); };
        U.$('.export', wrap).onclick = () => { CY.store.exportSave(); CY.fx.toast({ title: 'Backup downloaded', text: 'Keep the file somewhere safe. Restore it from Settings on any device.', icon: 'check', tone: 'sage' }); };
        U.$('.import-in', wrap).onchange = async (e) => {
          const f = e.target.files[0];
          e.target.value = '';
          if (!f) return;
          const res = CY.store.parseBackup(await f.text());
          if (!res.ok) { CY.fx.toast({ title: 'Couldn’t restore', text: res.msg, icon: 'info', tone: 'peach', sound: 'miss' }); return; }
          if (await CY.fx.confirm('Restore this backup?', `${U.esc(res.summary)}<br><br>This replaces the progress currently on this device.`, 'Restore', 'Cancel', true)) {
            CY.store.importSave(res.data); location.hash = '#/'; location.reload();
          }
        };
        U.$('.reset', wrap).onclick = async () => {
          if (await CY.fx.confirm('Reset everything?', 'This deletes your restaurant, XP, coins and achievements on this device. It can’t be undone.', 'Reset', 'Keep my progress', true)) {
            CY.store.reset(); CY.store.applySettings(); location.hash = '#/'; location.reload();
          }
        };
      },
    }).then(() => CY.app.render());
  };

  /* ===================== ONBOARDING ===================== */
  CY.screens.onboarding = (host) => {
    const s = CY.store.s;
    let step = 0;
    const steps = [
      () => `<div class="ob-char">${A.character('cy', { size: 200, mood: 'cheer', cls: 'bob wave' })}</div>
        <h1>Hello. I’m Cy.</h1><p>I’m a sprout, and as of today I run a restaurant. Well, we do. You type, I supervise. It’s called <b>CYCORA</b>.</p>`,
      () => `<div class="ob-char">${A.character('cy', { size: 150, mood: 'happy' })}</div>
        <h1>What do I call you, Chef?</h1><label class="name-field big"><span class="sr-only">Chef name</span><input class="ob-name" maxlength="16" value="${s.profile.name === 'Chef' ? '' : U.esc(s.profile.name)}" placeholder="Type your name" /></label><p class="muted">This is your first typing practice!</p>`,
      () => `<div class="ob-avatar">${A.avatar(s.profile.avatar, 150, 'cheer')}</div>
        <h1>Pick your look</h1>
        <div class="sw-group center"><h3>Skin tone</h3>${A.palette.SKIN.map((c, i) => `<button class="sw ${s.profile.avatar.skin === i ? 'sel' : ''}" data-g="skin" data-v="${i}" aria-label="Skin tone ${i + 1}"><i class="dot" style="background:${c}"></i></button>`).join('')}</div>
        <div class="sw-group center"><h3>Hair</h3>${[0, 1, 2, 3, 4].map((i) => `<button class="sw ${s.profile.avatar.hair === i ? 'sel' : ''}" data-g="hair" data-v="${i}" aria-label="${['Short', 'Bun', 'Curly', 'Long', 'Shaved'][i]}">${A.avatar({ ...s.profile.avatar, hair: i, hat: 'none' }, 44)}</button>`).join('')}</div>
        <div class="sw-group center"><h3>Hair colour</h3>${A.palette.HAIR.map((c, i) => `<button class="sw ${s.profile.avatar.hairColor === i ? 'sel' : ''}" data-g="hairColor" data-v="${i}" aria-label="Hair colour ${i + 1}"><i class="dot" style="background:${c}"></i></button>`).join('')}</div>`,
      () => `<div class="ob-room">${A.room(1, 0)}</div>
        <h1>This is the restaurant.</h1><p>Yes, it’s empty. Every lesson you finish adds something: shelves, a stove, tables, the bins out back.</p>
        <ul class="ob-points"><li>${A.icon('flame', 26)} A little practice each day builds your <b>streak</b></li><li>${A.icon('heart', 26)} <b>Hearts</b> come back if you replay a lesson you’ve passed</li><li>${A.icon('coin', 26)} Spend <b>coins</b> on decor and outfits</li></ul>`,
    ];
    const draw = () => {
      host.innerHTML = `<section class="onboarding screen-in"><div class="ob-card">${steps[step]()}
        <div class="ob-dots">${steps.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>
        <div class="ob-actions">${step ? '<button class="btn btn-soft ob-back">Back</button>' : ''}<button class="btn btn-primary btn-xl ob-next">${step === steps.length - 1 ? 'Open up' : 'Next'}</button></div>
      </div></section>`;
      const nameIn = U.$('.ob-name', host);
      if (nameIn) { nameIn.focus(); nameIn.onkeydown = (e) => { if (e.key === 'Enter') U.$('.ob-next', host).click(); else CY.audio.play('key'); }; }
      U.$$('.sw', host).forEach((b) => (b.onclick = () => { s.profile.avatar[b.dataset.g] = +b.dataset.v; CY.audio.play('pop'); draw(); }));
      U.$('.ob-next', host).onclick = () => {
        CY.audio.unlock();
        if (nameIn) s.profile.name = nameIn.value.trim().slice(0, 16) || 'Chef';
        if (step < steps.length - 1) { step++; CY.audio.play('pop'); draw(); }
        else { s.onboarded = true; CY.audio.play('unlock'); CY.progress.changed(); CY.app.go('#/'); }
      };
      const back = U.$('.ob-back', host);
      if (back) back.onclick = () => { step--; draw(); };
      if (!nameIn) U.$('.ob-next', host).focus();
    };
    draw();
  };
})();
