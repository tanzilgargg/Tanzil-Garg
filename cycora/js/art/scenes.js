/* CYCORA · restaurant rooms, food/material items and bins (inline SVG).
   Rooms are built in 6 visible steps — one per lesson completed in that world. */
(() => {
  const INK = '#3D2F4F';
  const st = (w = 2.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"`;
  const on = (cond, svg, step) => (cond ? `<g class="build-step" data-step="${step}">${svg}</g>` : '');
  const mini = (id, x, y, s = 0.42, mood = 'happy', v = 0) => `<g class="mini-char" transform="translate(${x} ${y}) scale(${s})">${CY.art.charG(id, mood, v)}</g>`;

  const jar = (x, y, c, lid = '#C98B5B') => `<g transform="translate(${x} ${y})"><rect x="0" y="6" width="18" height="22" rx="5" fill="${c}" ${st(2)}/><rect x="1" y="0" width="16" height="8" rx="2.5" fill="${lid}" ${st(2)}/><rect x="4" y="14" width="10" height="7" rx="1.5" fill="#fff" opacity=".85"/></g>`;
  const plank = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3" fill="#C98B5B" ${st(2)}/><path d="M${x + 8} ${y + 7} v8 M${x + w - 8} ${y + 7} v8" stroke="${INK}" stroke-width="2.5"/>`;
  const crate = (x, y, fill = '#E7B27F') => `<g transform="translate(${x} ${y})"><rect width="44" height="28" rx="4" fill="${fill}" ${st()}/><path d="M0 10h44M0 19h44" stroke="${INK}" stroke-width="1.6" opacity=".5"/></g>`;
  const plant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M14 22 C2 14 2 2 10 0 C14 8 14 14 14 22Z M14 22 C26 14 28 2 20 0 C16 8 14 14 14 22Z M14 22 C8 10 14 4 14 4 C14 4 20 10 14 22Z" fill="#86C77A" ${st(2)}/><path d="M4 22h20l-3 16H7z" fill="#FF7A6B" ${st(2)}/></g>`;
  const table = (x, y, kind = 'tables-classic') => {
    if (kind === 'tables-wood') return `<g transform="translate(${x} ${y})"><ellipse cx="30" cy="10" rx="31" ry="9" fill="#C98B5B" ${st()}/><path d="M6 8 Q30 14 54 8 M10 12 Q30 17 50 12" stroke="#9A6340" stroke-width="1.5" fill="none"/><path d="M30 19 v24 M18 44 h24" stroke="#9A6340" stroke-width="5" stroke-linecap="round"/></g>`;
    if (kind === 'tables-marble') return `<g transform="translate(${x} ${y})"><ellipse cx="30" cy="9" rx="31" ry="9" fill="#F7F7FA" ${st()}/><path d="M12 6 q8 6 16 2 M34 12 q8 -4 16 0" stroke="#C9BFD6" stroke-width="1.5" fill="none"/><path d="M30 18 v24 M18 44 h24" stroke="#E0A92E" stroke-width="4" stroke-linecap="round"/></g>`;
    return `<g transform="translate(${x} ${y})"><ellipse cx="30" cy="8" rx="30" ry="9" fill="#FFF6E6" ${st()}/><path d="M2 8 Q30 22 58 8 L56 14 Q30 28 4 14Z" fill="#FF7A6B" ${st(2)}/><path d="M30 18 v24 M18 44 h24" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>`;
  };
  /* Wall designs, painted over the room's back wall (0..h) */
  const wall = (kind, h = 150) => ({
    'wall-stripes': `<rect width="300" height="${h}" fill="url(#wStripes)"/>`,
    'wall-brick': `<rect width="300" height="${h}" fill="#E7A27F"/><rect width="300" height="${h}" fill="url(#wBrick)"/>`,
    'wall-tiles': `<rect width="300" height="${h}" fill="url(#wTiles)"/>`,
    'wall-floral': `<rect width="300" height="${h}" fill="#FFF6E6"/><rect width="300" height="${h}" fill="url(#wFloral)"/>`,
    'wall-mural': `<rect width="300" height="${h}" fill="#D5EFFB"/><circle cx="150" cy="70" r="46" fill="#8ED1F2" ${st(2)}/><path d="M118 54 C128 44 140 48 142 58 C144 66 132 70 124 66Z M160 34 C172 36 184 48 186 60 C176 60 166 50 160 34Z M150 100 C160 92 174 96 180 90 C176 104 162 114 148 110Z" fill="#9CCB8E" ${st(1.8)}/>${[60, 90, 210, 240].map((x, i) => `<path d="M${x} ${40 + (i % 2) * 30} c-10 -14 0 -26 6 -28 c4 10 4 18 -6 28z" fill="#86C77A" ${st(1.6)}/>`).join('')}`,
  }[kind] || '');
  const style = () => (CY.store && CY.store.s && CY.store.s.style) || {};
  const chair = (x, y, flip) => `<g transform="translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}"><path d="M0 0 v34 M0 22 h16 v12" fill="none" stroke="#9A6340" stroke-width="4" stroke-linecap="round"/><rect x="-3" y="18" width="22" height="6" rx="3" fill="#C98B5B" ${st(1.8)}/></g>`;
  const floor = (fill, y = 150) => `<rect x="0" y="${y}" width="300" height="${190 - y}" fill="${fill}"/><path d="M0 ${y}h300" stroke="${INK}" stroke-width="2.5"/>`;

  const ROOMS = {
    /* 1 · Pantry Paradise */
    1: (p) => `
      <rect width="300" height="190" fill="#FFF0B8"/>
      <path d="M0 0h300v150H0z" fill="url(#stripes1)" opacity=".35"/>
      ${floor('#E7B27F')}<path d="M40 150v40M110 150v40M180 150v40M250 150v40" stroke="${INK}" stroke-width="1.4" opacity=".3"/>
      ${plank(14, 56, 180)}${plank(14, 104, 180)}
      ${on(p >= 1, ['#FF7A6B', '#FFD966', '#8DBF8B', '#FFC4A3', '#8ED1F2', '#D9CCF2'].map((c, i) => jar(22 + i * 28, 28, c)).join(''), 1)}
      ${on(p >= 2, ['#9CCB8E', '#FFC9C9', '#FFE08A', '#C9E8F5', '#FF9A4D', '#FFF6E6'].map((c, i) => jar(22 + i * 28, 76, c, '#8DBF8B')).join(''), 2)}
      ${on(p >= 3, `${crate(20, 122)}<circle cx="30" cy="122" r="6" fill="#FF7A6B" ${st(1.8)}/><circle cx="42" cy="120" r="6" fill="#FF7A6B" ${st(1.8)}/><circle cx="54" cy="122" r="6" fill="#FF7A6B" ${st(1.8)}/>${crate(74, 122, '#D9A27A')}<path d="M82 120 l6 -14 M94 120 l2 -14 M104 120 l-3 -14" stroke="#FF9A4D" stroke-width="6" stroke-linecap="round"/><path d="M88 106 l-3 -6 M96 106 l0 -6 M101 106 l3 -6" stroke="#6DB36A" stroke-width="3" stroke-linecap="round"/>`, 3)}
      ${on(p >= 4, `<path d="M214 150 Q208 110 220 100 L256 100 Q268 110 262 150Z" fill="#FFF6E6" ${st()}/><path d="M220 100 Q238 92 256 100" fill="none" ${st()}/><text x="238" y="132" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="13" font-weight="600" fill="${INK}">FLOUR</text><path d="M252 150 Q248 122 258 116 L284 116 Q294 122 290 150Z" fill="#FFE3D3" ${st()}/>`, 4)}
      ${on(p >= 5, `<path d="M214 0 v24 M240 0 v30 M266 0 v20" stroke="${INK}" stroke-width="1.6"/><g fill="#FFF6E6" ${st(1.8)}><circle cx="214" cy="30" r="7"/><circle cx="210" cy="38" r="6"/><circle cx="219" cy="38" r="6"/></g><path d="M240 30 c-10 6 -8 20 0 24 c8 -4 10 -18 0 -24z" fill="#86C77A" ${st(1.8)}/><path d="M266 20 c-8 4 -6 16 0 20 c6 -4 8 -16 0 -20z" fill="#6DB36A" ${st(1.8)}/>`, 5)}
      ${on(p >= 6, `${mini('cy', 200, 54, 0.4, 'cheer')}`, 6)}`,

    /* 2 · Order Express */
    2: (p) => `
      <rect width="300" height="190" fill="#FFE3D3"/>${wall(style().wall, 150)}
      <path d="M0 98h300" stroke="#FFC4A3" stroke-width="40" opacity=".5"/>
      ${floor('#FFF6E6')}<path d="M0 170h300M50 150v40M100 150v40M150 150v40M200 150v40M250 150v40" stroke="${INK}" stroke-width="1.4" opacity=".25"/>
      ${on(p >= 2, `<rect x="24" y="16" width="96" height="66" rx="8" fill="#4A5A52" ${st(3)}/><rect x="24" y="16" width="96" height="66" rx="8" fill="none" stroke="#C98B5B" stroke-width="5"/><text x="72" y="34" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="12" font-weight="600" fill="#FFF0B8">MENU</text><path d="M36 46h46M36 56h56M36 66h40" stroke="#FFF6E6" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M96 46h12M100 56h8M98 66h10" stroke="#FFD966" stroke-width="3" stroke-linecap="round"/>`, 2)}
      ${on(p >= 6, `<rect x="192" y="18" width="84" height="34" rx="17" fill="#fff" stroke="#FF7A6B" stroke-width="4"/><text x="234" y="41" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="17" font-weight="700" fill="#E0584A" class="neon">OPEN</text>`, 6)}
      ${on(p >= 5, `${mini('bao', 168, 66, 0.52, 'happy', 1)}${mini('bao', 214, 74, 0.46, 'happy', 3)}`, 5)}
      ${on(p >= 1, `<rect x="16" y="104" width="206" height="48" rx="6" fill="#C98B5B" ${st(3)}/><rect x="10" y="96" width="218" height="12" rx="5" fill="#FFF6E6" ${st(2.5)}/><path d="M50 116v30M100 116v30M150 116v30M200 116v30" stroke="#9A6340" stroke-width="3"/>`, 1)}
      ${on(p >= 3, `<rect x="40" y="72" width="40" height="26" rx="4" fill="#8ED1F2" ${st(2)}/><rect x="46" y="78" width="28" height="10" rx="2" fill="#E8F7FF" ${st(1.5)}/><path d="M150 96 a12 12 0 0 1 24 0z" fill="#FFD966" ${st(2)}/><circle cx="162" cy="82" r="3" fill="${INK}"/>`, 3)}
      ${on(p >= 4, plant(246, 112, 1), 4)}`,

    /* 3 · Little Chef's Kitchen */
    3: (p, decor = []) => `
      <rect width="300" height="190" fill="#D5EFFB"/>
      ${decor.includes('copper') ? `<rect x="150" y="12" width="84" height="5" rx="2.5" fill="#9A6340"/>${[160, 186, 212].map((x, i) => `<path d="M${x} 17 v8" stroke="${INK}" stroke-width="1.6"/><circle cx="${x}" cy="${36 + i * 2}" r="${10 + i * 2}" fill="#E0905A" ${st(2)}/><circle cx="${x - 3}" cy="${33 + i * 2}" r="3" fill="#FFC4A3"/>`).join('')}` : ''}
      ${decor.includes('mixer') ? `<g transform="translate(100 50)"><path d="M0 34 h22 v-8 h-18z" fill="#FFD966" ${st(2)}/><path d="M6 26 v-20 q0 -6 8 -6 h10 q6 0 6 8 v6 h-14 v12" fill="#FFD966" ${st(2)}/><path d="M8 26 q4 -12 12 0z" fill="#D5EFFB" ${st(1.6)}/></g>` : ''}
      ${decor.includes('herbs') ? `<rect x="150" y="70" width="80" height="16" rx="4" fill="#C98B5B" ${st(2)}/>${[160, 178, 196, 214].map((x, i) => `<path d="M${x} 70 c-8 -10 -2 -18 2 -20 c4 6 4 12 -2 20z" fill="${i % 2 ? '#6DB36A' : '#86C77A'}" ${st(1.6)}/>`).join('')}` : ''}
      <g opacity=".5" stroke="#fff" stroke-width="2">${[20, 40, 60, 80, 100, 120, 140].map((y) => `<path d="M0 ${y}h300"/>`).join('')}${[30, 60, 90, 120, 150, 180, 210, 240, 270].map((x) => `<path d="M${x} 0v150"/>`).join('')}</g>
      ${floor('#C9E8F5')}<path d="M0 170h300" stroke="${INK}" stroke-width="1.2" opacity=".25"/>
      ${on(p >= 3, `<rect x="24" y="22" width="120" height="6" rx="3" fill="#9A6340" ${st(1.8)}/><g stroke="${INK}" stroke-width="2.5" fill="#C9BFD6"><path d="M40 28 v26"/><ellipse cx="40" cy="60" rx="7" ry="9"/><path d="M70 28 v32" /><path d="M64 60 h12 v10 h-12z"/><path d="M100 28 v28"/><path d="M95 56 q5 14 10 0"/><path d="M128 28 v30"/><circle cx="128" cy="62" r="5"/></g>`, 3)}
      ${on(p >= 1, `<rect x="24" y="96" width="110" height="56" rx="6" fill="#F3F6FA" ${st(3)}/><rect x="36" y="110" width="86" height="34" rx="5" fill="#3D2F4F"/><rect x="42" y="116" width="74" height="22" rx="4" fill="#FF9A4D" opacity=".55"/><rect x="18" y="88" width="122" height="12" rx="4" fill="#C9BFD6" ${st(2.5)}/><circle cx="50" cy="94" r="3" fill="${INK}"/><circle cx="108" cy="94" r="3" fill="${INK}"/>`, 1)}
      ${on(p >= 2, `<path d="M40 88 v-26 h46 v26" fill="#FF7A6B" ${st(2.5)}/><rect x="36" y="58" width="54" height="8" rx="4" fill="#E0584A" ${st(2)}/><g class="steam" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M52 52 q-5 -7 0 -12 q5 -5 0 -12"/><path d="M72 52 q-5 -7 0 -12 q5 -5 0 -12"/></g><path d="M100 82 h26 l-3 6 h-20z" fill="#C9BFD6" ${st(2)}/>`, 2)}
      ${on(p >= 4, `<rect x="156" y="104" width="128" height="48" rx="6" fill="#E7B27F" ${st(3)}/><rect x="150" y="96" width="140" height="12" rx="4" fill="#FFF6E6" ${st(2.5)}/><rect x="170" y="84" width="54" height="14" rx="4" fill="#D9A27A" ${st(2)}/><circle cx="184" cy="82" r="7" fill="#FF7A6B" ${st(1.8)}/><path d="M200 84 l12 -12" stroke="#FF9A4D" stroke-width="7" stroke-linecap="round"/><ellipse cx="240" cy="88" rx="12" ry="8" fill="#86C77A" ${st(1.8)}/>`, 4)}
      ${on(p >= 5, `<rect x="244" y="18" width="44" height="78" rx="8" fill="#fff" ${st(3)}/><path d="M244 50h44" stroke="${INK}" stroke-width="2.5"/><path d="M252 30v12M252 58v18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`, 5)}
      ${on(p >= 6, mini('momo', 172, 36, 0.48, 'cheer'), 6)}`,

    /* 4 · Speedy Service (dining room) */
    4: (p, decor = []) => `
      <rect width="300" height="190" fill="#D6EBD2"/>${wall(style().wall, 110)}
      <path d="M0 110h300v40H0z" fill="#C98B5B" opacity=".35"/><path d="M0 110h300" stroke="${INK}" stroke-width="2" opacity=".4"/>
      ${floor('#E7B27F')}
      ${decor.includes('rug') ? `<ellipse cx="150" cy="172" rx="120" ry="14" fill="#FFC4A3" ${st(2)}/><ellipse cx="150" cy="172" rx="100" ry="9" fill="none" stroke="#FF7A6B" stroke-width="2.5" stroke-dasharray="6 5"/>` : ''}
      ${decor.includes('art') ? `<rect x="122" y="22" width="56" height="44" rx="4" fill="#FFF6E6" stroke="#C98B5B" stroke-width="5"/><circle cx="140" cy="40" r="7" fill="#FFD966"/><path d="M126 62 l16 -14 12 10 8 -6 12 10z" fill="#8DBF8B"/>` : ''}
      ${on(p >= 6, `<path d="M0 10 Q75 34 150 10 Q225 34 300 10" fill="none" stroke="${INK}" stroke-width="1.6"/>${[18, 48, 78, 108, 138, 168, 198, 228, 258, 284].map((x, i) => `<path d="M${x} ${14 + Math.sin(i) * 4} l8 0 l-4 12z" fill="${['#FF7A6B', '#FFD966', '#8ED1F2', '#8DBF8B'][i % 4]}" ${st(1.5)}/>`).join('')}`, 6)}
      ${on(p >= 4, `<path d="M70 0v34M230 0v34" stroke="${INK}" stroke-width="2"/><path d="M56 48 a14 14 0 0 1 28 0z" fill="#FFD966" ${st(2.5)}/><path d="M216 48 a14 14 0 0 1 28 0z" fill="#FFD966" ${st(2.5)}/><ellipse cx="70" cy="54" rx="14" ry="5" fill="#FFF0B8" opacity=".7"/><ellipse cx="230" cy="54" rx="14" ry="5" fill="#FFF0B8" opacity=".7"/>`, 4)}
      ${decor.includes('lights') ? `<path d="M0 70 Q150 100 300 70" fill="none" stroke="${INK}" stroke-width="1.4"/>${Array.from({ length: 13 }, (_, i) => { const x = 10 + i * 23, y = 70 + Math.sin((i / 12) * Math.PI) * 15; return `<circle class="fairy" cx="${x}" cy="${y + 4}" r="4" fill="${['#FFD966', '#FFC9C9', '#C9E8F5'][i % 3]}" ${st(1.2)}/>`; }).join('')}` : ''}
      ${on(p >= 5, `${mini('bao', 46, 72, 0.4, 'happy', 0)}${mini('bao', 206, 72, 0.4, 'cheer', 2)}`, 5)}
      ${on(p >= 3, `${chair(36, 112)}${chair(108, 112, true)}${chair(196, 112)}${chair(268, 112, true)}`, 3)}
      ${decor.includes('booth') ? `<g><rect x="4" y="96" width="30" height="54" rx="8" fill="#FF7A6B" ${st(2.5)}/><rect x="4" y="128" width="44" height="22" rx="6" fill="#FFC4A3" ${st(2.5)}/><path d="M10 104 v20 M20 104 v20" stroke="#E0584A" stroke-width="2"/></g>` : ''}
      ${on(p >= 1, table(42, 108, style().tables), 1)}
      ${on(p >= 2, table(202, 108, style().tables), 2)}
      ${decor.includes('lanterns') ? [40, 110, 190, 260].map((x, i) => `<path d="M${x} 0 v${14 + (i % 2) * 8}" stroke="${INK}" stroke-width="1.6"/><g class="sway" style="transform-origin:${x}px 0px"><ellipse cx="${x}" cy="${26 + (i % 2) * 8}" rx="11" ry="13" fill="${['#FFC9C9', '#FFF0B8', '#D5EFFB', '#D9CCF2'][i]}" ${st(2)}/><path d="M${x - 11} ${26 + (i % 2) * 8} h22" stroke="${INK}" stroke-width="1.2" opacity=".5"/></g>`).join('') : ''}
      ${decor.includes('chandelier') ? `<path d="M150 0 v16" stroke="${INK}" stroke-width="2"/><path d="M126 22 Q150 40 174 22" fill="none" stroke="#E0A92E" stroke-width="4"/><path d="M130 16 h40" stroke="#E0A92E" stroke-width="4" stroke-linecap="round"/>${[128, 141, 159, 172].map((x) => `<circle class="fairy" cx="${x}" cy="${x === 128 || x === 172 ? 26 : 32}" r="4.5" fill="#FFF0B8" ${st(1.4)}/>`).join('')}` : ''}
      ${decor.includes('plant') ? plant(140, 110, 1.05) : ''}
      ${decor.includes('lamp') ? `<path d="M276 150 v-60" stroke="${INK}" stroke-width="3"/><path d="M262 90 l14 -22 14 22z" fill="#FFF0B8" ${st(2)}/><path d="M266 150h20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` : ''}
      ${on(p >= 6, mini('zippy', 128, 96, 0.36, 'cheer'), 6)}`,

    /* 5 · Eco Sorting Squad (yard) — a wide 600×190 scene */
    5: (p, decor = []) => `
      <rect width="600" height="190" fill="#C9E8F5"/>
      <circle cx="520" cy="34" r="16" fill="#FFD966" ${st(2)}/>
      <g fill="#fff" opacity=".9"><ellipse cx="90" cy="32" rx="28" ry="10"/><ellipse cx="112" cy="26" rx="18" ry="10"/><ellipse cx="330" cy="40" rx="24" ry="8"/><ellipse cx="460" cy="58" rx="20" ry="7"/></g>
      <path d="M0 120 Q120 100 240 118 Q380 136 600 110 V190 H0z" fill="#9CCB8E" stroke="${INK}" stroke-width="2.5"/>
      <g ${st(2)}><circle cx="40" cy="104" r="22" fill="#86C77A"/><circle cx="62" cy="92" r="18" fill="#6DB36A"/><path d="M50 118v34" stroke="#9A6340" stroke-width="6"/><circle cx="556" cy="100" r="20" fill="#86C77A"/><circle cx="574" cy="112" r="14" fill="#6DB36A"/><path d="M562 118v34" stroke="#9A6340" stroke-width="6"/></g>
      <g stroke="#C98B5B" stroke-width="4">${[90, 110, 130, 470, 490, 510].map((x) => `<path d="M${x} 126v26"/>`).join('')}<path d="M84 134h52M464 134h52"/></g>
      <path d="M0 150h600v40H0z" fill="#E7DDF0"/><path d="M0 150h600" stroke="${INK}" stroke-width="2.5"/>
      ${on(p >= 5, `<path d="M300 86 v40" stroke="#9A6340" stroke-width="5"/><rect x="262" y="70" width="76" height="26" rx="6" fill="#FFF6E6" ${st(2.5)}/><text x="300" y="88" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="12" font-weight="700" fill="${INK}">SORT IT!</text>`, 5)}
      ${on(p >= 1, CY.art.binG('recycle', 160, 96, 0.62), 1)}
      ${on(p >= 2, CY.art.binG('compost', 216, 96, 0.62), 2)}
      ${on(p >= 3, CY.art.binG('donate', 334, 96, 0.62), 3)}
      ${on(p >= 4, CY.art.binG('general', 390, 96, 0.62), 4)}
      ${on(p >= 6, mini('binnie', 276, 102, 0.4, 'cheer'), 6)}
      ${decor.includes('bee-hotel') ? `<g transform="translate(470 82)"><path d="M20 40 v30" stroke="#9A6340" stroke-width="5"/><path d="M0 14 L20 0 L40 14Z" fill="#E0584A" ${st(2)}/><rect x="3" y="14" width="34" height="28" rx="3" fill="#C98B5B" ${st(2)}/>${[[10, 21], [20, 21], [30, 21], [10, 33], [20, 33], [30, 33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${INK}"/>`).join('')}<g class="bee"><ellipse cx="52" cy="6" rx="5" ry="3.5" fill="#FFD966" ${st(1.4)}/><path d="M50 3v6M53 3v6" stroke="${INK}" stroke-width="1.3"/></g></g>` : ''}`,

    /* 6 · Food Rescue Heroes */
    6: (p) => `
      <rect width="300" height="190" fill="#FFF6E6"/>
      <path d="M0 0h300v150H0z" fill="url(#dots6)" opacity=".5"/>
      ${floor('#FFE08A')}
      ${on(p >= 1, `<rect x="18" y="30" width="60" height="120" rx="8" fill="#fff" ${st(3)}/><path d="M18 76h60" stroke="${INK}" stroke-width="2.5"/><path d="M28 44v18M28 86v26" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><rect x="44" y="40" width="24" height="12" rx="3" fill="#8ED1F2" ${st(1.5)}/><text x="56" y="49.5" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="${INK}">4°C</text>`, 1)}
      ${on(p >= 2, `${plank(96, 64, 100)}${plank(96, 108, 100)}<g ${st(1.8)}><rect x="104" y="40" width="22" height="24" rx="3" fill="#FFC4A3"/><rect x="132" y="46" width="26" height="18" rx="3" fill="#C9E8F5"/><rect x="164" y="38" width="22" height="26" rx="3" fill="#FFD966"/><rect x="104" y="86" width="28" height="22" rx="3" fill="#D6EBD2"/><rect x="138" y="90" width="20" height="18" rx="3" fill="#FFC9C9"/><rect x="162" y="84" width="24" height="24" rx="3" fill="#EDE6F2"/></g>`, 2)}
      ${on(p >= 3, `<rect x="210" y="112" width="74" height="38" rx="5" fill="#E7B27F" ${st(2.5)}/><path d="M247 140 s-12 -7 -12 -14 a6 6 0 0 1 12 -2 a6 6 0 0 1 12 2 c0 7 -12 14 -12 14z" fill="#FF7A6B" ${st(1.8)}/><text x="247" y="108" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="10" font-weight="700" fill="${INK}">DONATE</text>`, 3)}
      ${on(p >= 4, `<rect x="92" y="122" width="104" height="28" rx="6" fill="#D5EFFB" ${st(2.5)}/><rect x="98" y="116" width="92" height="10" rx="4" fill="#8ED1F2" ${st(2)}/><path d="M120 136l4 4 4-4M140 136l4 4 4-4M160 136l4 4 4-4" stroke="#3E9FD0" stroke-width="2" fill="none"/>`, 4)}
      ${on(p >= 5, `<rect x="222" y="22" width="44" height="58" rx="5" fill="#C98B5B" ${st(2.5)}/><rect x="228" y="30" width="32" height="44" rx="3" fill="#fff" ${st(1.5)}/><rect x="236" y="18" width="16" height="8" rx="3" fill="#C9BFD6" ${st(1.5)}/><path d="M232 40l3 3 5-6M232 52l3 3 5-6M232 64l3 3 5-6" stroke="#2E9E5B" stroke-width="2" fill="none"/><path d="M244 41h12M244 53h12M244 65h12" stroke="${INK}" stroke-width="1.6"/>`, 5)}
      ${on(p >= 6, mini('olive', 206, 66, 0.4, 'cheer'), 6)}`,

    /* 7 · Re-Make Magic workshop */
    7: (p) => `
      <rect width="300" height="190" fill="#EDE6F2"/>
      <g opacity=".5"><circle cx="40" cy="30" r="10" fill="none" stroke="#C9BFD6" stroke-width="5" stroke-dasharray="4 3"/><circle cx="270" cy="40" r="14" fill="none" stroke="#C9BFD6" stroke-width="6" stroke-dasharray="5 4"/></g>
      ${floor('#C9BFD6')}
      ${on(p >= 2, `<rect x="10" y="124" width="280" height="14" rx="7" fill="#6B5E7B" ${st(2.5)}/>${[24, 56, 88, 120, 152, 184, 216, 248, 276].map((x) => `<circle cx="${x}" cy="131" r="4" fill="#C9BFD6"/>`).join('')}<path d="M30 138v12M270 138v12" stroke="${INK}" stroke-width="4"/>`, 2)}
      ${on(p >= 1, `<rect x="110" y="44" width="80" height="80" rx="10" fill="#8ED1F2" ${st(3)}/><rect x="122" y="56" width="56" height="34" rx="6" fill="#D5EFFB" ${st(2)}/><g class="gear"><circle cx="150" cy="73" r="10" fill="none" stroke="#6DB36A" stroke-width="5" stroke-dasharray="3.5 3"/></g><circle cx="128" cy="108" r="5" fill="#FF7A6B" ${st(1.5)}/><circle cx="146" cy="108" r="5" fill="#FFD966" ${st(1.5)}/><rect x="160" y="104" width="20" height="8" rx="3" fill="#fff" ${st(1.5)}/><path d="M134 44 v-14 h32 v14" fill="none" ${st(3)}/><g class="steam" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"><path d="M150 26 q-5 -7 0 -12 q5 -5 0 -12"/></g>`, 1)}
      ${on(p >= 3, `<path d="M28 124 Q24 100 34 96 L62 96 Q72 100 68 124Z" fill="#9A6340" ${st(2.5)}/><path d="M38 108 c0 -6 6 -8 10 -6 c-2 4 -4 6 -10 6z" fill="#86C77A"/><text x="48" y="120" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="7" font-weight="700" fill="#FFF6E6">COMPOST</text>`, 3)}
      ${on(p >= 4, `<rect x="210" y="92" width="26" height="32" rx="4" fill="#FFD966" ${st(2.5)}/><rect x="220" y="84" width="10" height="9" rx="2" fill="#3D2F4F"/><path d="M216 104 q7 10 14 0" fill="none" stroke="#E0A92E" stroke-width="3"/>`, 4)}
      ${on(p >= 5, `<path d="M248 124 v-20 q0 -6 4 -8 v-8 h6 v8 q4 2 4 8 v20z" fill="#9CCB8E" ${st(2)} opacity=".95"/><path d="M266 124 v-16 q0 -6 4 -8 v-6 h6 v6 q4 2 4 8 v16z" fill="#8ED1F2" ${st(2)}/>`, 5)}
      ${on(p >= 6, mini('juno', 76, 72, 0.42, 'cheer'), 6)}`,
  };

  const defs = `<defs>
    <pattern id="stripes1" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="11" height="22" fill="#FFE08A"/></pattern>
    <pattern id="dots6" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="2.2" fill="#FFD966"/></pattern>
    <pattern id="wStripes" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#FFE3D3"/><rect width="12" height="24" fill="#FFC4A3"/></pattern>
    <pattern id="wBrick" width="30" height="16" patternUnits="userSpaceOnUse"><path d="M0 0.5H30M0 8.5H30M10 0.5V8.5M25 8.5V16.5" stroke="#FFF0E0" stroke-width="1.6" fill="none"/></pattern>
    <pattern id="wTiles" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#fff"/><rect width="10" height="10" fill="#C9E8F5"/><rect x="10" y="10" width="10" height="10" fill="#C9E8F5"/></pattern>
    <pattern id="wFloral" width="30" height="30" patternUnits="userSpaceOnUse"><g transform="translate(8 8)"><circle r="2" fill="#FFD966"/>${[0, 72, 144, 216, 288].map((a) => `<circle r="2.4" transform="rotate(${a}) translate(0 -3.6)" fill="#FFC9C9"/>`).join('')}</g><g transform="translate(23 22)"><circle r="1.6" fill="#FFD966"/>${[0, 72, 144, 216, 288].map((a) => `<circle r="2" transform="rotate(${a}) translate(0 -3)" fill="#C9E8F5"/>`).join('')}</g></pattern>
    <pattern id="bp" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#9FCFEA" stroke-width="1"/></pattern>
  </defs>`;

  /** Full room SVG. progress 0–6; locked rooms render as a blueprint. */
  CY.art.room = (world, progress, { locked = false, decor = [] } = {}) => {
    if (locked) {
      return `<svg class="room-svg is-blueprint" viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}
        <rect width="300" height="190" fill="#E3F3FB"/><rect width="300" height="190" fill="url(#bp)"/>
        <g fill="none" stroke="#3E9FD0" stroke-width="2.5" stroke-dasharray="7 6" opacity=".8">
          <rect x="30" y="80" width="90" height="70" rx="8"/><rect x="150" y="40" width="120" height="110" rx="10"/><path d="M0 150h300"/>
        </g>
        <g transform="translate(150 96)"><path d="M-34 -16 h68 v30 h-68z" fill="#FFD966" ${st(2.5)}/><path d="M-26 14 v26 M26 14 v26" stroke="${INK}" stroke-width="3"/>
        <path d="M-34 -16 l14 30 M-14 -16 l14 30 M6 -16 l14 30 M26 -16 l8 17" stroke="${INK}" stroke-width="5" opacity=".75"/></g>
      </svg>`;
    }
    return `<svg class="room-svg" viewBox="0 0 ${world === 5 ? 600 : 300} 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}${ROOMS[world](progress, decor)}</svg>`;
  };

  /* ---------- Bins (sorting) ---------- */
  const BIN = {
    recycle: { c: '#8ED1F2', d: '#3E9FD0', sym: `<path d="M-10 4 a11 11 0 0 1 4 -14 M6 -11 a11 11 0 0 1 6 13 M8 9 a11 11 0 0 1 -15 1" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M-9 -13 l3 4 -5 1z M14 1 l-5 1 1 -5z M-6 13 l1 -5 4 3z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>` },
    compost: { c: '#9CCB8E', d: '#4E8A5B', sym: `<path d="M-10 10 C-10 -3 -2 -10 12 -12 C10 2 3 10 -10 10Z" fill="#fff"/><path d="M-10 10 L5 -4" stroke="#4E8A5B" stroke-width="2.4"/>` },
    donate: { c: '#FFD966', d: '#E0A92E', sym: `<path d="M0 12 s-13 -8 -13 -16 a6.5 6.5 0 0 1 13 -2 a6.5 6.5 0 0 1 13 2 c0 8 -13 16 -13 16z" fill="#fff"/>` },
    general: { c: '#C9BFD6', d: '#6B5E7B', sym: `<path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>` },
  };
  CY.art.binColors = BIN;
  CY.art.binG = (kind, x, y, s = 1) => {
    const b = BIN[kind];
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M6 18 L74 18 L68 84 Q40 90 12 84Z" fill="${b.c}" ${st(3)}/><rect x="0" y="6" width="80" height="16" rx="8" fill="${b.d}" ${st(3)}/><rect x="30" y="0" width="20" height="10" rx="4" fill="${b.d}" ${st(2.5)}/><g transform="translate(40 52)">${b.sym}</g></g>`;
  };
  CY.art.bin = (kind, size = 80) => `<svg class="bin-svg bin-${kind}" viewBox="-4 -4 88 98" width="${size}" height="${size * 1.1}" aria-hidden="true">${CY.art.binG(kind, 0, 0, 1)}</svg>`;

  /* ---------- Items (64×64) ---------- */
  const s2 = st(2.5);
  const ITEMS = {
    bottle: `<path d="M26 6h12v10q8 6 8 16v24q0 4 -4 4H22q-4 0 -4 -4V32q0 -10 8 -16z" fill="#C9E8F5" ${s2}/><rect x="25" y="2" width="14" height="7" rx="2" fill="#3E9FD0" ${s2}/><rect x="20" y="32" width="24" height="12" fill="#fff" opacity=".8"/>`,
    jar: `<rect x="14" y="14" width="36" height="44" rx="9" fill="#D5EFFB" ${s2}/><rect x="16" y="6" width="32" height="11" rx="4" fill="#C98B5B" ${s2}/><path d="M20 26 q-2 12 1 24" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    can: `<rect x="16" y="10" width="32" height="46" rx="6" fill="#FF7A6B" ${s2}/><ellipse cx="32" cy="12" rx="16" ry="5" fill="#E4DEEA" ${s2}/><rect x="16" y="26" width="32" height="12" fill="#FFF6E6" opacity=".85"/>`,
    box: `<path d="M8 22 L32 12 L56 22 L56 50 L32 60 L8 50Z" fill="#E7B27F" ${s2}/><path d="M8 22 L32 32 L56 22 M32 32 V60" fill="none" ${s2}/><path d="M20 17 L44 27" stroke="#C98B5B" stroke-width="4"/>`,
    pizzabox: `<path d="M6 30 L32 22 L58 30 L58 42 L32 50 L6 42Z" fill="#E7B27F" ${s2}/><ellipse cx="34" cy="34" rx="10" ry="4" fill="#D9A27A" opacity=".9"/><circle cx="22" cy="36" r="3" fill="#C98B5B" opacity=".7"/>`,
    peel: `<path d="M32 10 C30 30 22 40 10 46 C18 52 26 48 32 40 C38 48 46 52 54 46 C42 40 34 30 32 10Z" fill="#FFD966" ${s2}/><path d="M30 8h4v6h-4z" fill="#6B4423"/>`,
    grounds: `<path d="M8 50 Q32 18 56 50Z" fill="#7A4A2E" ${s2}/><circle cx="24" cy="44" r="2" fill="#4A2C1A"/><circle cx="36" cy="38" r="2" fill="#4A2C1A"/><circle cx="42" cy="46" r="2" fill="#4A2C1A"/><rect x="6" y="50" width="52" height="6" rx="3" fill="#C9BFD6" ${s2}/>`,
    veg: `<path d="M20 50 L44 20 Q50 16 50 22 L26 54 Q18 58 20 50Z" fill="#FF9A4D" ${s2}/><path d="M46 20 l6 -10 M48 22 l10 -4 M44 18 l0 -10" stroke="#6DB36A" stroke-width="4" stroke-linecap="round"/><path d="M30 40l4 3M36 32l4 3" stroke="${INK}" stroke-width="2"/>`,
    egg: `<path d="M14 40 l6 -6 6 6 6 -8 6 8 6 -6 6 6 Q50 58 32 58 Q14 58 14 40Z" fill="#FFF6E6" ${s2}/><path d="M20 30 Q24 8 34 8 Q46 8 46 28 l-6 6 -6 -8 -6 8 -6 -6z" fill="#FFF6E6" ${s2} transform="rotate(-18 32 22) translate(4 -6)"/>`,
    tin: `<rect x="12" y="18" width="40" height="34" rx="5" fill="#C9BFD6" ${s2}/><rect x="12" y="24" width="40" height="20" fill="#FF7A6B"/><ellipse cx="32" cy="34" rx="9" ry="6" fill="#FFF6E6"/><path d="M12 18h40M12 52h40" ${s2}/>`,
    bread: `<path d="M8 32 Q8 14 32 14 Q56 14 56 32 Q56 36 52 36 L52 54 L12 54 L12 36 Q8 36 8 32Z" fill="#E7B27F" ${s2}/><path d="M22 22 l4 6 M32 20 l4 6 M42 22 l4 6" stroke="#C98B5B" stroke-width="3" stroke-linecap="round"/>`,
    packet: `<path d="M14 8 h36 l-4 6 4 6 v32 l-4 6 4 6 H14 l4 -6 -4 -6 V20 l4 -6z" fill="#FFC9C9" ${s2} transform="scale(.9) translate(4 -2)"/><circle cx="32" cy="32" r="8" fill="#FFD966" ${s2}/>`,
    cup: `<path d="M16 16 h32 l-4 42 h-24z" fill="#fff" ${s2}/><rect x="12" y="10" width="40" height="8" rx="3" fill="#8DBF8B" ${s2}/><rect x="18" y="28" width="28" height="12" fill="#C98B5B" opacity=".6"/>`,
    plate: `<path d="M8 36 a24 24 0 0 1 28 -23 l-6 14 8 6 -10 14 8 10 A24 24 0 0 1 8 36z" fill="#fff" ${s2}/><path d="M42 14 a24 24 0 0 1 14 22 a24 24 0 0 1 -16 22 l-6 -10 10 -14 -8 -6z" fill="#fff" ${s2}/>`,
    tray: `<path d="M6 26 L58 26 L52 46 L12 46Z" fill="#FFF6E6" ${s2}/><path d="M14 30 l4 12 M26 30 v12 M38 30 v12 M50 30 l-4 12" stroke="#E4DEEA" stroke-width="2"/>`,
    film: `<path d="M10 20 Q22 12 34 22 Q46 30 54 22 L54 44 Q46 52 34 44 Q22 34 10 44Z" fill="#E3F3FB" ${s2} opacity=".95"/><path d="M16 28 Q26 24 34 30" stroke="#fff" stroke-width="3" fill="none"/>`,
    yoghurt: `<path d="M14 18 h36 l-5 38 h-26z" fill="#FFF6E6" ${s2}/><rect x="12" y="12" width="40" height="8" rx="3" fill="#FFC9C9" ${s2}/><path d="M18 30 q14 6 28 0" stroke="#FFC9C9" stroke-width="4" fill="none"/>`,
    apple: `<path d="M32 18 C20 10 8 18 10 34 C12 50 24 58 32 54 C40 58 52 50 54 34 C56 18 44 10 32 18Z" fill="#FF7A6B" ${s2}/><path d="M32 18 q2 -8 6 -12" stroke="#6B4423" stroke-width="3" fill="none"/><path d="M36 12 q8 -4 12 2 q-8 4 -12 -2z" fill="#86C77A" ${st(1.8)}/>`,
    core: `<path d="M24 10 Q32 14 40 10 Q34 22 40 32 Q34 44 40 54 Q32 50 24 54 Q30 44 24 32 Q30 22 24 10Z" fill="#FFF6E6" ${s2}/><path d="M22 10 Q24 6 26 10 M38 10 Q40 6 42 10" stroke="#FF7A6B" stroke-width="5" stroke-linecap="round"/><ellipse cx="32" cy="32" rx="2" ry="3" fill="#6B4423"/>`,
    oil: `<path d="M24 4 h16 v10 l6 8 v32 q0 4 -4 4 H22 q-4 0 -4 -4 V22 l6 -8z" fill="#FFD966" ${s2} opacity=".95"/><rect x="24" y="2" width="16" height="6" rx="2" fill="#E0584A" ${s2}/><rect x="20" y="32" width="24" height="12" rx="2" fill="#fff" opacity=".85"/>`,
    rice: `<path d="M8 32 h48 q0 22 -24 22 q-24 0 -24 -22z" fill="#8ED1F2" ${s2}/><path d="M10 32 q4 -14 22 -14 q18 0 22 14z" fill="#fff" ${s2}/><g stroke="#E4DEEA" stroke-width="2" stroke-linecap="round"><path d="M22 26 l3 1M32 22 l3 1M40 26 l3 1"/></g>`,
    soup: `<path d="M8 30 h48 q0 24 -24 24 q-24 0 -24 -24z" fill="#FFC4A3" ${s2}/><ellipse cx="32" cy="30" rx="24" ry="6" fill="#FF7A6B" ${s2}/><g class="steam" stroke="#C9BFD6" stroke-width="3" fill="none" stroke-linecap="round"><path d="M26 20 q-4 -5 0 -9"/><path d="M38 20 q-4 -5 0 -9"/></g>`,
    milk: `<path d="M18 22 L32 10 L46 22 V56 H18Z" fill="#fff" ${s2}/><path d="M18 22 h28" ${s2}/><rect x="18" y="32" width="28" height="12" fill="#8ED1F2"/><path d="M26 10 h12 v-4 h-12z" fill="#8ED1F2" ${s2}/>`,
    cheese: `<path d="M6 44 L44 18 L58 30 V48 H6Z" fill="#FFD966" ${s2}/><path d="M6 44 H58" ${s2}/><circle cx="24" cy="38" r="3" fill="#E0A92E"/><circle cx="44" cy="40" r="4" fill="#E0A92E"/><circle cx="48" cy="30" r="2" fill="#E0A92E"/>`,
    salad: `<path d="M8 32 h48 q0 22 -24 22 q-24 0 -24 -22z" fill="#fff" ${s2}/><circle cx="20" cy="28" r="7" fill="#86C77A" ${st(2)}/><circle cx="32" cy="24" r="8" fill="#9CCB8E" ${st(2)}/><circle cx="44" cy="28" r="7" fill="#6DB36A" ${st(2)}/><circle cx="28" cy="30" r="3.5" fill="#FF7A6B"/>`,
    cake: `<path d="M10 40 L32 16 L54 40 V54 H10Z" fill="#FFC9C9" ${s2}/><path d="M10 40 H54" ${s2}/><path d="M10 46 h44" stroke="#fff" stroke-width="4"/><circle cx="33" cy="14" r="5" fill="#FF7A6B" ${st(1.8)}/>`,
    meal: `<ellipse cx="32" cy="40" rx="26" ry="12" fill="#fff" ${s2}/><circle cx="24" cy="36" r="8" fill="#FFD966" ${st(2)}/><path d="M34 34 h14 l-3 8 h-11z" fill="#C98B5B" ${st(2)}/><circle cx="40" cy="30" r="4" fill="#86C77A" ${st(1.6)}/>`,
    compost: `<path d="M14 58 Q10 30 18 24 L46 24 Q54 30 50 58Z" fill="#9A6340" ${s2}/><path d="M18 24 Q32 18 46 24" fill="none" ${s2}/><path d="M26 42 c0 -8 8 -10 12 -8 c-2 6 -6 8 -12 8z" fill="#86C77A"/>`,
    fuel: `<rect x="16" y="16" width="32" height="42" rx="5" fill="#FFD966" ${s2}/><rect x="26" y="8" width="12" height="10" rx="2" fill="#3D2F4F"/><path d="M24 34 q8 12 16 0 q-8 -14 -8 -14 q0 0 -8 14z" fill="#86C77A" ${st(1.8)}/>`,
    paper: `<rect x="14" y="10" width="32" height="44" rx="3" fill="#fff" ${s2}/><rect x="20" y="16" width="32" height="44" rx="3" fill="#FFF6E6" ${s2}/><path d="M26 28h20M26 36h20M26 44h14" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
    glass: `<path d="M22 56 v-26 q0 -8 6 -10 v-12 h8 v12 q6 2 6 10 v26z" fill="#9CCB8E" ${s2} opacity=".95"/><path d="M26 32 v18" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
    fabric: `<path d="M10 20 Q32 10 54 20 L50 54 Q32 46 14 54Z" fill="#8ED1F2" ${s2}/><path d="M14 30 Q32 22 50 30 M14 40 Q32 32 50 40" stroke="#fff" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>`,
    sack: `<path d="M16 58 Q8 30 20 20 L44 20 Q56 30 48 58Z" fill="#FFF6E6" ${s2}/><path d="M20 20 Q32 12 44 20" fill="none" ${s2}/><path d="M22 16 l20 0" stroke="#C98B5B" stroke-width="4"/>`,
    leaf: `<path d="M12 52 C12 26 28 12 54 10 C52 36 38 52 12 52Z" fill="#86C77A" ${s2}/><path d="M12 52 L40 24" stroke="${INK}" stroke-width="2"/>`,
    spice: `<rect x="20" y="16" width="24" height="40" rx="5" fill="#FF9A4D" ${s2}/><rect x="20" y="8" width="24" height="10" rx="3" fill="#C9BFD6" ${s2}/><circle cx="26" cy="13" r="1.4" fill="${INK}"/><circle cx="32" cy="13" r="1.4" fill="${INK}"/><circle cx="38" cy="13" r="1.4" fill="${INK}"/><rect x="24" y="28" width="16" height="12" rx="2" fill="#fff"/>`,
  };
  CY.art.item = (kind, size = 64) => `<svg class="item-svg" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${ITEMS[kind] || ITEMS.box}</svg>`;
})();
