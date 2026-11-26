/* CYCORA · world screen: guide intro, winding lesson path, room preview. */
(() => {
  const U = CY.util, A = CY.art, P = () => CY.progress;

  CY.screens.world = (host, wid) => {
    const w = CY.data.world(wid);
    if (!w || !P().worldUnlocked(w.id)) { CY.app.go('#/'); return; }
    const prog = P().worldProgress(w.id), stars = P().worldStars(w.id);
    const offsets = [0, 70, 20, -60, -10, 50];
    const place = { 3: 'kitchen', 4: 'dining', 5: 'yard' }[w.id] || '';
    const firstVisit = !CY.store.s.seenWorlds.includes(w.id);
    if (firstVisit) { CY.store.s.seenWorlds.push(w.id); CY.store.save(); }

    host.innerHTML = `<section class="world screen-in" style="--wc:${w.color};--wink:${w.ink}">
      <nav class="world-strip" aria-label="Worlds">${CY.data.worlds.map((x) => {
        const un = P().worldUnlocked(x.id);
        return `<a class="ws ${x.id === w.id ? 'active' : ''} ${un ? '' : 'locked'}" ${un ? `href="#/world/${x.id}"` : 'aria-disabled="true"'} style="--wc:${x.color}" title="${x.name}">${un ? `<b>${x.id}</b>` : A.icon('lock', 16)}<span>${x.name}</span></a>`;
      }).join('')}</nav>

      <header class="world-head">
        <button class="btn btn-ghost back">${A.icon('back', 20)} Restaurant</button>
        <div class="wh-char">${A.character(w.guide, { size: 140, mood: firstVisit ? 'wow' : 'happy', cls: 'bob' })}</div>
        <div class="wh-text">
          <span class="pill">World ${w.id} · ${U.esc(w.tagline)}</span>
          <h1>${U.esc(w.name)}</h1>
          <p class="speech-line"><b>${A.charName(w.guide)}:</b> “${U.esc(w.welcome)}”</p>
          <div class="wh-meta"><span>${A.icon('check', 18)} ${prog}/6 lessons</span><span>${A.icon('star', 18)} ${stars}/18 stars</span></div>
        </div>
      </header>

      <div class="world-body">
        <ol class="path" aria-label="Lessons">
          <svg class="path-line" viewBox="0 0 300 760" preserveAspectRatio="none" aria-hidden="true"><path d="M150 40 C 240 120, 240 140, 220 170 S 150 270, 170 300 S 120 400, 90 430 S 100 540, 140 560 S 220 650, 200 700" fill="none" stroke="#3D2F4F" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round" opacity=".35"/></svg>
          ${w.lessons.map((l, i) => {
            const rec = P().lessonRec(l.id) || {}, un = P().lessonUnlocked(l.id), done = rec.done;
            const current = un && !done;
            return `<li class="node-row" style="--x:${offsets[i]}px">
              <button class="node ${done ? 'done' : current ? 'current' : 'locked'} ${l.final ? 'final' : ''}" data-id="${l.id}" ${un ? '' : 'aria-disabled="true"'}
                aria-label="Lesson ${l.n}: ${U.esc(l.title)}. ${done ? `${rec.stars} stars` : un ? 'Ready to play' : 'Locked'}">
                <span class="node-face">${l.final ? A.icon(un ? 'crown' : 'lock', 34) : un ? `<b>${l.n}</b>` : A.icon('lock', 28)}</span>
                ${current ? '<span class="start-bubble">START</span>' : ''}
              </button>
              <div class="node-label"><b>${U.esc(l.title)}</b><small>${done ? CY.lesson.starRow(rec.stars, 16) : U.esc(l.objective)}</small></div>
            </li>`;
          }).join('')}
        </ol>

        <aside class="world-side">
          <div class="room-preview">
            <h2>Your ${U.esc(w.room)}</h2>
            <div class="rp-art">${A.room(w.id, prog, { decor: place ? P().decorFor(place) : [] })}</div>
            <div class="rp-bar"><i style="width:${(prog / 6) * 100}%"></i></div>
            <p>${prog === 6 ? 'Fully built.' : `Each lesson adds something to this room. <b>${6 - prog}</b> left.`}</p>
          </div>
          <div class="learn-card">
            <h3>${A.icon('info', 20)} You’ll learn</h3>
            <ul>${w.lessons.map((l) => `<li>${U.esc(l.objective)}</li>`).join('')}</ul>
          </div>
        </aside>
      </div>
    </section>`;

    U.$('.back', host).onclick = () => CY.app.go('#/');
    U.$$('.node', host).forEach((b) => (b.onclick = () => {
      if (!P().lessonUnlocked(b.dataset.id)) {
        CY.audio.play('wrong');
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        return;
      }
      CY.audio.play('pop');
      CY.app.go(`#/lesson/${b.dataset.id}`);
    }));
    const cur = U.$('.node.current', host);
    if (cur) setTimeout(() => cur.focus({ preventScroll: false }), 50);
  };
})();
