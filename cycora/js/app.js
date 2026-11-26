/* CYCORA · app shell + hash router.
   Routes: #/  #/world/N  #/lesson/wNlN  #/daily  #/licence  #/race  #/planet  #/shop  #/profile  #/trophies  #/leaderboard  #/about */
CY.app = (() => {
  const U = CY.util;
  let leave = [];

  const onLeave = (fn) => leave.push(fn);
  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function render() {
    leave.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    leave = [];
    U.$$('.modal-wrap').forEach((m) => m.remove());
    document.body.classList.remove('in-play');
    const host = U.$('#screen');
    const s = CY.store.s;
    const raw = (location.hash || '#/').split('?')[0];
    const parts = raw.replace(/^#\/?/, '').split('/');

    if (!s.onboarded) {
      document.body.classList.add('no-topbar');
      CY.screens.onboarding(host);
      return;
    }
    document.body.classList.remove('no-topbar');
    CY.topbar.render();
    window.scrollTo(0, 0);

    try {
      route(parts, host);
    } catch (e) {
      console.error(e);
      crashScreen(host);
    }
    const h1 = U.$('#screen h1');
    document.title = h1 ? `${h1.textContent.trim()} · CYCORA` : 'CYCORA';
    // move focus to the new page for keyboard & screen-reader users (game screens manage their own focus)
    if (!['lesson', 'daily', 'race', 'licence'].includes(parts[0]) && !document.querySelector('.modal-wrap')) host.focus({ preventScroll: true });
  }

  function route(parts, host) {
    switch (parts[0]) {
      case 'about': CY.screens.about(host); break;
      case 'world': CY.screens.world(host, +parts[1]); break;
      case 'lesson': CY.lesson.open(parts[1], host); break;
      case 'daily': CY.lesson.open(CY.progress.dailyDef(), host, { context: 'daily' }); break;
      case 'licence': CY.screens.licence(host); break;
      case 'race': CY.screens.race(host); break;
      case 'planet': CY.screens.planet(host); break;
      case 'shop': CY.screens.shop(host); break;
      case 'profile': CY.screens.profile(host); break;
      case 'trophies': CY.screens.trophies(host); break;
      case 'leaderboard': CY.screens.leaderboard(host); break;
      default: CY.screens.hq(host);
    }
  }

  /** Friendly fallback if a screen ever fails to draw — progress is never lost. */
  function crashScreen(host) {
    document.body.classList.remove('in-play');
    host.innerHTML = `<section class="crash screen-in"><div class="ob-card">${CY.art.character('cy', { size: 140, mood: 'sad' })}
      <h1>Something got burnt.</h1><p>That page didn’t load properly. Your progress is fine.</p>
      <div class="ob-actions"><a class="btn btn-primary" href="#/">Back to the restaurant</a><button class="btn btn-soft reload">Reload the game</button></div></div></section>`;
    U.$('.reload', host).onclick = () => location.reload();
  }

  /* Warn (once) about storage problems so nobody loses progress silently. */
  function storageWarnings() {
    const h = CY.store.health;
    if (!h.available) {
      CY.fx.toast({ title: 'Progress can’t be saved here', text: 'Your browser is blocking storage (private mode?). You can still play, but progress will be lost when you close the tab.', icon: 'info', tone: 'peach', sound: 'miss' });
    } else if (h.recovered) {
      CY.fx.toast({ title: 'We couldn’t read your old save', text: 'A copy was kept safely and you’re starting fresh. If you have a backup file, restore it in Settings.', icon: 'info', tone: 'peach', sound: 'miss' });
    }
    CY.bus.on('save:failed', () => CY.fx.toast({ title: 'Couldn’t save progress', text: 'Your browser storage may be full. Download a backup from Settings to be safe.', icon: 'info', tone: 'peach', sound: 'miss' }));
  }

  function boot() {
    window.addEventListener('error', (e) => console.error('CYCORA error:', e.message));
    window.addEventListener('unhandledrejection', (e) => console.error('CYCORA promise error:', e.reason));
    CY.store.load();
    CY.store.applySettings();
    CY.progress.heartsTick();
    CY.progress.ensureWeek();
    CY.progress.ensureDaily();
    CY.progress.checkAchievements();
    CY.bus.on('state:changed', () => { if (!document.body.classList.contains('in-play') && CY.store.s.onboarded) CY.topbar.render(); });
    window.addEventListener('hashchange', render);
    setInterval(() => { if (!document.body.classList.contains('in-play')) CY.progress.heartsTick(); }, 30000);
    storageWarnings();
    // offline support when served over http(s) (not when opened as a local file)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
    // first user gesture unlocks Web Audio
    window.addEventListener('pointerdown', () => CY.audio.unlock(), { once: true });
    window.addEventListener('touchend', () => CY.audio.unlock(), { once: true });
    window.addEventListener('keydown', () => CY.audio.unlock(), { once: true });
    render();
  }

  return { go, render, onLeave, boot };
})();

document.addEventListener('DOMContentLoaded', CY.app.boot);
