# Putting CYCORA online

CYCORA is a plain website: HTML, CSS, JavaScript and some images. There is no server code and no database, so any static host will do. Upload the whole `cycora-game` folder and point people at `index.html`.

## Before you upload

1. Open `js/screens/about.js` and fill in the three lines at the top:
   - `creator`: the name you want in the credits (currently Tanzil Garg).
   - `contactEmail`: an address people can use to report problems. Leave it as `''` to hide the line.
   - `version`: bump it when you publish an update, e.g. `1.0.1`.
2. Once you know your web address, open `index.html` and change `icons/og-image.png` in the `og:image` line to the full address, e.g. `https://<username>.github.io/cycora/icons/og-image.png`. Some sites (WhatsApp, LinkedIn) only show the preview image when the address is complete.
3. Delete the `.DS_Store` files if your Mac has made any. They're harmless, just clutter.

## Option 1: Netlify Drop (quickest, no account needed to try)

1. Go to app.netlify.com/drop.
2. Drag the `cycora-game` folder onto the page.
3. You get a link straight away. Make a free account if you want to keep it and choose a nicer name.

## Option 2: GitHub Pages (free, good for a portfolio)

If CYCORA has its own repository (e.g. `cycora`):

1. Upload everything inside `cycora-game` (the contents, not the folder itself) to the repository.
2. Go to **Settings → Pages**, set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. After a minute or two the game is live at `https://<username>.github.io/cycora/`.

If CYCORA sits in a `cycora/` folder inside a bigger portfolio repository, the steps are the same. The game just lives one level down, at `https://<username>.github.io/<repository>/cycora/`. All the game's links are relative, so nothing inside it needs changing.

## Updating the game later

Upload the changed files the same way. Players who have visited before get the new version on their next visit. The offline cache refreshes itself in the background, so you don't need to change anything in `sw.js`. If you add a brand-new file, it gets cached the first time someone loads it.

## Checks to do on real devices before you share the link

I couldn't run Safari or Firefox in my workspace, so these checks need a person. They take about 15 minutes.

| Device | What to try |
| --- | --- |
| Mac, Safari | Finish lesson 1. Check sound plays after your first click. Refresh: progress should still be there. |
| Windows or Mac, Firefox | Play a race and a sorting lesson. Settings → Download backup should download a file. |
| iPhone, Safari | Start a lesson and tap **Tap to type**. The keyboard should open and letters should go green. Then Share → Add to Home Screen and open it from there. |
| Android, Chrome | Same as the iPhone check. Also turn on aeroplane mode after one visit and reload: the game should still open. |
| Any, with a screen reader | VoiceOver (Cmd+F5 on a Mac) or NVDA on Windows. Move through the restaurant page and the shop with Tab and check every button is read out sensibly. |

If something breaks, a screenshot plus the device and browser name is usually enough to fix it.

## What's stored and where

Everything lives in the player's browser (`localStorage`, key `cycora.save.v2`). Nothing is sent anywhere, there are no cookies and no analytics. That keeps you out of most privacy paperwork, but it does mean progress doesn't follow a player between devices unless they use **Settings → Download backup / Restore from backup**.

If you later want accounts or real online races, the two places to change are `CY.store` (save/load) and `CY.race.opponents` / `CY.leaderboard.entries` (who you play against). The rest of the game doesn't need to change.
