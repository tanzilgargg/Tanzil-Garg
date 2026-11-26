/* CYCORA · About, privacy, sources, accessibility and credits. */
(() => {
  const U = CY.util, A = CY.art;

  /* ---- Edit these before publishing ---- */
  CY.config = Object.assign({
    version: '1.0.0',
    creator: 'Tanzil Garg',
    contactEmail: '',            // e.g. 'hello@example.com' — shown on this page when filled in
  }, CY.config || {});

  const SOURCES = [
    ['Best before and use-by dates', 'Food Standards Agency', 'https://www.food.gov.uk/safety-hygiene/best-before-and-use-by-dates'],
    ['Food safety for community cooking and food banks', 'Food Standards Agency', 'https://www.food.gov.uk/safety-hygiene/food-safety-for-community-cooking-and-food-banks'],
    ['Student guide to food safety and hygiene (leftovers & rice)', 'Food Standards Agency', 'https://www.food.gov.uk/safety-hygiene/student-guide-to-food-safety-and-hygiene'],
    ['Surplus food redistribution labelling guidance', 'WRAP', 'https://wrap.org.uk/resources/guide/surplus-food-redistribution-labelling-guidance'],
    ['Food and drink waste hierarchy', 'GOV.UK (Defra)', 'https://www.gov.uk/government/publications/food-and-drink-waste-hierarchy-deal-with-surplus-and-waste/food-and-drink-waste-hierarchy-deal-with-surplus-and-waste'],
    ['Pizza boxes', 'Recycle Now (WRAP)', 'https://recyclenow.com/recycle-an-item/pizza-boxes'],
    ['Crisp packets', 'Recycle Now (WRAP)', 'https://www.recyclenow.com/recycle-an-item/crisp-packets'],
    ['Paper coffee cups', 'Recycle Now (WRAP)', 'https://recyclenow.com/recycle-an-item/paper-cups'],
    ['Plastic bags and wrapping', 'Recycle Now (WRAP)', 'https://recyclenow.com/how-to-recycle/recycle-plastic-bags-and-wrapping'],
  ];

  CY.screens.about = (host) => {
    const c = CY.config;
    host.innerHTML = `<section class="about screen-in">
      <header class="page-head">
        <div class="ph-char">${A.character('cy', { size: 110, mood: 'happy', cls: 'bob' })}</div>
        <div><h1>About CYCORA</h1><p>Build a restaurant. Master your typing. Save the planet. Version ${U.esc(c.version)}.</p></div>
      </header>
      <div class="about-grid">
        <article class="panel"><h2>${A.icon('info', 22)} Your privacy</h2>
          <ul class="about-list">
            <li><b>No accounts, no sign-up.</b> You only choose a chef name, and it never leaves your device.</li>
            <li><b>Your progress stays on this device.</b> It’s saved in your browser’s local storage. Nothing is sent to a server.</li>
            <li><b>No tracking.</b> No cookies, analytics, advertising or third-party scripts. Fonts and art are bundled with the game.</li>
            <li><b>You’re in control.</b> Download a backup, restore it on another device, or erase everything from <button class="linklike open-settings">Settings</button>.</li>
            <li>Clearing your browser data, or using a private/incognito window, will remove saved progress, so keep a backup.</li>
          </ul>
        </article>
        <article class="panel"><h2>${A.icon('leaf', 22)} Where the eco & food-safety lessons come from</h2>
          <p>Advice in CYCORA follows UK guidance. Recycling rules vary between councils, so check the signs where you live.</p>
          <ul class="sources">${SOURCES.map(([t, o, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${U.esc(t)}</a><small>${U.esc(o)}</small></li>`).join('')}</ul>
        </article>
        <article class="panel"><h2>${A.icon('keyboard', 22)} Accessibility</h2>
          <ul class="about-list">
            <li>Fully playable with a keyboard; visible focus outlines everywhere.</li>
            <li>Typing feedback doesn’t rely on colour alone. Mistakes are underlined too, and the next letter has a caret under it.</li>
            <li>Settings for text size, high contrast, reduced motion, sound, difficulty and a hearts-free relaxed mode.</li>
            <li>The finger guide says which finger to use in words as well as colour.</li>
            <li>Works with phone and tablet keyboards. Tap the typing area (or “Tap to type”) to bring the keyboard up.</li>
          </ul>
          ${c.contactEmail ? `<p>Found something that doesn’t work for you? Email <a href="mailto:${U.esc(c.contactEmail)}">${U.esc(c.contactEmail)}</a>.</p>` : ''}
        </article>
        <article class="panel"><h2>${A.icon('sparkle', 22)} Credits</h2>
          <ul class="about-list">
            <li>Created by <b>${U.esc(c.creator)}</b>.</li>
            <li>Every character, room and icon was drawn for CYCORA.</li>
            <li>Fonts: Fredoka, Nunito and DM Mono, under the SIL Open Font License 1.1 (included in <code>fonts/</code>).</li>
            <li>Sound effects are made live in the browser, so there are no audio files.</li>
          </ul>
        </article>
      </div>
    </section>`;
    U.$('.open-settings', host).onclick = () => CY.screens.settings();
  };
})();
