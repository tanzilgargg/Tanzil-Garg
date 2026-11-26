/* CYCORA · original character + icon art, drawn as inline SVG.
   One shared face system gives every character the same expression set:
   happy · cheer · wow · think · sad · sleepy */
CY.art = CY.art || {};

(() => {
  const INK = '#3D2F4F';
  const BLUSH = '#FF9E9E';

  function face(cx, cy, mood = 'happy', s = 1, gap = 13) {
    const ex = gap * s, eyeY = cy, my = cy + 11 * s;
    const eye = (x) => {
      switch (mood) {
        case 'cheer':
          return `<path d="M${x - 5 * s} ${eyeY + 2 * s} Q${x} ${eyeY - 5 * s} ${x + 5 * s} ${eyeY + 2 * s}" stroke="${INK}" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`;
        case 'sleepy':
          return `<path d="M${x - 5 * s} ${eyeY} Q${x} ${eyeY + 4 * s} ${x + 5 * s} ${eyeY}" stroke="${INK}" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`;
        case 'wow':
          return `<ellipse cx="${x}" cy="${eyeY}" rx="${5.2 * s}" ry="${6.4 * s}" fill="${INK}"/><circle cx="${x + 1.8 * s}" cy="${eyeY - 2.4 * s}" r="${2 * s}" fill="#fff"/>`;
        case 'sad':
          return `<ellipse cx="${x}" cy="${eyeY + 1 * s}" rx="${4 * s}" ry="${4.6 * s}" fill="${INK}"/><circle cx="${x + 1.4 * s}" cy="${eyeY - 0.6 * s}" r="${1.4 * s}" fill="#fff"/>`;
        default:
          return `<ellipse cx="${x}" cy="${eyeY}" rx="${4.2 * s}" ry="${5.2 * s}" fill="${INK}"/><circle cx="${x + 1.5 * s}" cy="${eyeY - 2 * s}" r="${1.6 * s}" fill="#fff"/>`;
      }
    };
    let brows = '';
    if (mood === 'sad') brows = `<path d="M${cx - ex - 5 * s} ${eyeY - 8 * s} L${cx - ex + 4 * s} ${eyeY - 10 * s}M${cx + ex + 5 * s} ${eyeY - 8 * s} L${cx + ex - 4 * s} ${eyeY - 10 * s}" stroke="${INK}" stroke-width="${2.4 * s}" stroke-linecap="round"/>`;
    if (mood === 'think') brows = `<path d="M${cx + ex - 5 * s} ${eyeY - 10 * s} Q${cx + ex} ${eyeY - 13 * s} ${cx + ex + 5 * s} ${eyeY - 10 * s}" stroke="${INK}" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round"/>`;
    let mouth;
    switch (mood) {
      case 'cheer':
        mouth = `<path d="M${cx - 8 * s} ${my - 2 * s} Q${cx} ${my - 2 * s} ${cx + 8 * s} ${my - 2 * s} Q${cx + 7 * s} ${my + 9 * s} ${cx} ${my + 9 * s} Q${cx - 7 * s} ${my + 9 * s} ${cx - 8 * s} ${my - 2 * s}Z" fill="#8A3446" stroke="${INK}" stroke-width="${2 * s}" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${my + 5.5 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#FF8C9A"/>`;
        break;
      case 'wow':
        mouth = `<ellipse cx="${cx}" cy="${my + 1 * s}" rx="${4 * s}" ry="${5 * s}" fill="#8A3446" stroke="${INK}" stroke-width="${2 * s}"/>`;
        break;
      case 'sad':
        mouth = `<path d="M${cx - 6 * s} ${my + 4 * s} Q${cx} ${my - 2 * s} ${cx + 6 * s} ${my + 4 * s}" stroke="${INK}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`;
        break;
      case 'think':
        mouth = `<path d="M${cx - 4 * s} ${my + 2 * s} Q${cx + 2 * s} ${my} ${cx + 6 * s} ${my + 1 * s}" stroke="${INK}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`;
        break;
      case 'sleepy':
        mouth = `<ellipse cx="${cx}" cy="${my + 1 * s}" rx="${3 * s}" ry="${2 * s}" fill="${INK}"/>`;
        break;
      default:
        mouth = `<path d="M${cx - 7 * s} ${my} Q${cx} ${my + 8 * s} ${cx + 7 * s} ${my}" stroke="${INK}" stroke-width="${2.8 * s}" fill="none" stroke-linecap="round"/>`;
    }
    const blush = `<ellipse cx="${cx - ex - 8 * s}" cy="${eyeY + 7 * s}" rx="${5 * s}" ry="${3 * s}" fill="${BLUSH}" opacity=".65"/><ellipse cx="${cx + ex + 8 * s}" cy="${eyeY + 7 * s}" rx="${5 * s}" ry="${3 * s}" fill="${BLUSH}" opacity=".65"/>`;
    return `<g class="face">${blush}${brows}<g class="eyes" style="transform-origin:${cx}px ${eyeY}px">${eye(cx - ex)}${eye(cx + ex)}</g>${mouth}</g>`;
  }

  const shadow = `<ellipse cx="60" cy="113" rx="32" ry="5" fill="${INK}" opacity=".12"/>`;
  const st = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;

  const CHARS = {
    cy: {
      name: 'Cy the Sprout',
      draw: (m, v, o = {}) => `${shadow}
        ${o.cyacc === 'cy-cape' ? `<path d="M34 62 L12 104 Q60 118 108 104 L86 62Z" fill="#6DB36A" ${st}/><path d="M24 96 Q60 106 96 96" stroke="#4E8A5B" stroke-width="3" fill="none"/>` : ''}
        <ellipse cx="46" cy="106" rx="9" ry="5" fill="#4E8A5B" ${st}/><ellipse cx="74" cy="106" rx="9" ry="5" fill="#4E8A5B" ${st}/>
        <path d="M60 14 C60 22 60 26 60 30" stroke="#4E8A5B" stroke-width="4" stroke-linecap="round"/>
        <g class="leaf-l"><path d="M60 18 C48 4 32 10 35 21 C46 26 56 24 60 18Z" fill="#6DB36A" ${st}/></g>
        <g class="leaf-r"><path d="M60 16 C71 1 89 5 86 17 C76 23 66 22 60 16Z" fill="#86C77A" ${st}/></g>
        <ellipse cx="22" cy="74" rx="7" ry="11" fill="#9CCB8E" ${st} transform="rotate(25 22 74)"/>
        <ellipse cx="98" cy="74" rx="7" ry="11" fill="#9CCB8E" ${st} transform="rotate(-25 98 74)" class="arm-wave"/>
        <path d="M60 28 C90 28 101 50 101 73 C101 97 85 108 60 108 C35 108 19 97 19 73 C19 50 30 28 60 28Z" fill="#9CCB8E" ${st}/>
        <ellipse cx="60" cy="90" rx="23" ry="14" fill="#E4F2DA"/>
        <path d="M37 69 Q60 80 83 69 L80 77 Q60 88 40 77Z" fill="#FF7A6B" ${st}/>
        <path d="M58 82 L66 82 L62 92Z" fill="#FF7A6B" ${st}/>
        ${face(60, 52, m, 1)}${cyOutfit(o)}`,
    },
    momo: {
      name: 'Chef Momo',
      draw: (m) => `${shadow}
        <path d="M18 92 C18 62 36 40 60 40 C84 40 102 62 102 92 C102 104 90 109 60 109 C30 109 18 104 18 92Z" fill="#FFF1DC" ${st}/>
        <path d="M44 46 Q49 54 47 60 M60 42 Q63 50 60 57 M76 46 Q71 54 73 60" stroke="#E5C9A0" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g class="hat">
          <circle cx="43" cy="22" r="12" fill="#fff" ${st}/><circle cx="77" cy="22" r="12" fill="#fff" ${st}/><circle cx="60" cy="15" r="14" fill="#fff" ${st}/>
          <rect x="40" y="24" width="40" height="15" rx="4" fill="#fff" ${st}/>
          <path d="M47 24 v14 M60 24 v14 M73 24 v14" stroke="#E8E2EC" stroke-width="2"/>
        </g>
        <path d="M30 96 Q60 106 90 96" stroke="#FF7A6B" stroke-width="5" fill="none" stroke-linecap="round"/>
        <g class="spoon"><path d="M100 70 L114 46" stroke="#C98B5B" stroke-width="5" stroke-linecap="round"/><ellipse cx="115" cy="42" rx="5" ry="7" fill="#C98B5B" ${st} transform="rotate(30 115 42)"/></g>
        ${face(60, 72, m, 1)}`,
    },
    bao: {
      name: 'Customer',
      draw: (m, v = 0) => {
        const cols = ['#FFD9B8', '#FFE7A0', '#D9CCF2', '#C9E8F5', '#FFC9C9', '#D6EBD2'];
        const c = cols[v % cols.length];
        const acc = [
          `<g fill="none" stroke="${INK}" stroke-width="2.6"><circle cx="47" cy="66" r="9"/><circle cx="73" cy="66" r="9"/><path d="M56 66 h8"/></g>`,
          `<path d="M60 30 L44 20 L44 40Z M60 30 L76 20 L76 40Z" fill="#FF7A6B" ${st}/><circle cx="60" cy="30" r="5" fill="#FF7A6B" ${st}/>`,
          `<path d="M28 44 Q60 10 92 44 Q60 36 28 44Z" fill="#8ED1F2" ${st}/><circle cx="60" cy="18" r="6" fill="#FFD966" ${st}/>`,
          `<g transform="translate(84 36)"><circle r="5" fill="#FFD966" ${st}/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="4" ry="7" transform="rotate(${a}) translate(0 -9)" fill="#fff" ${st}/>`).join('')}<circle r="4" fill="#FFD966"/></g>`,
          `<rect x="40" y="6" width="40" height="26" rx="4" fill="#3D2F4F"/><rect x="30" y="30" width="60" height="7" rx="3" fill="#3D2F4F"/><rect x="40" y="22" width="40" height="5" fill="#FF7A6B"/>`,
          `<path d="M32 92 Q60 104 88 92 L92 102 Q60 116 28 102Z" fill="#FF7A6B" ${st}/>`,
        ][v % 6];
        return `${shadow}
          <circle cx="60" cy="70" r="40" fill="${c}" ${st}/>
          <path d="M50 34 Q60 24 70 34 Q63 31 60 38" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
          ${v % 6 === 2 || v % 6 === 4 ? '' : ''}
          ${face(60, 66, m, 1)}${acc}`;
      },
    },
    zippy: {
      name: 'Zippy',
      draw: (m) => `${shadow}
        <g class="speed" stroke="#8ED1F2" stroke-width="4" stroke-linecap="round"><path d="M4 60h14M0 74h16M6 88h12"/></g>
        <g class="steam" stroke="#C9BFD6" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M50 36 q-6 -8 0 -14 q6 -6 0 -14"/><path d="M70 36 q-6 -8 0 -14 q6 -6 0 -14"/></g>
        <ellipse cx="60" cy="104" rx="42" ry="8" fill="#FFF6E6" ${st}/>
        <path d="M89 58 C108 56 110 86 86 86" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
        <path d="M89 58 C108 56 110 86 86 86" stroke="#FF7A6B" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M26 46 L94 46 L88 92 Q60 104 32 92Z" fill="#FF7A6B" ${st}/>
        <ellipse cx="60" cy="46" rx="34" ry="8" fill="#7A4A2E" ${st}/>
        <path d="M34 88 Q60 96 86 88" stroke="#FFC4A3" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${face(60, 68, m, 0.95)}`,
    },
    binnie: {
      name: 'Binnie',
      draw: (m) => `${shadow}
        <path d="M30 42 L90 42 L84 106 Q60 112 36 106Z" fill="#8ED1F2" ${st}/>
        <path d="M44 50 L42 98 M76 50 L78 98" stroke="#6CBDE6" stroke-width="4" stroke-linecap="round"/>
        <rect x="50" y="20" width="20" height="12" rx="5" fill="#3E9FD0" ${st}/>
        <rect x="24" y="30" width="72" height="14" rx="7" fill="#3E9FD0" ${st}/>
        <rect x="24" y="34" width="72" height="5" fill="#FFD966"/>
        <circle cx="46" cy="36" r="7" fill="#D5EFFB" ${st}/><circle cx="74" cy="36" r="7" fill="#D5EFFB" ${st}/>
        <g transform="translate(60 92)"><path d="M-8 6 C-8 -4 -2 -9 8 -10 C7 0 2 6 -8 6Z" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M-8 6 L3 -4" stroke="${INK}" stroke-width="1.6"/></g>
        ${face(60, 64, m, 0.95)}`,
    },
    olive: {
      name: 'Olive',
      draw: (m) => `${shadow}
        <ellipse cx="60" cy="68" rx="35" ry="41" fill="#A5BD62" ${st}/>
        <ellipse cx="48" cy="44" rx="8" ry="4" fill="#C3D68A" transform="rotate(-30 48 44)"/>
        <path d="M27 80 Q60 92 93 80 L88 102 Q60 116 32 102Z" fill="#FFD966" ${st}/>
        <path d="M30 91 Q60 102 90 91" stroke="#F3F6FA" stroke-width="5" fill="none"/>
        <path d="M58 84 v22" stroke="${INK}" stroke-width="2"/>
        <path d="M28 36 Q60 8 92 36 Z" fill="#FF7A6B" ${st}/>
        <path d="M84 34 Q104 34 106 40 Q92 42 80 38Z" fill="#E0584A" ${st}/>
        <circle cx="60" cy="22" r="4" fill="#fff" ${st}/>
        ${face(60, 58, m, 0.95)}`,
    },
    earth: {
      name: 'Planet Earth',
      draw: (m) => `${shadow}
        <circle cx="60" cy="62" r="46" fill="#8ED1F2" ${st}/>
        <path d="M24 46 C34 36 46 40 50 48 C54 56 44 62 36 60 C28 58 22 54 24 46Z M70 22 C82 22 96 34 98 48 C92 50 84 44 78 40 C72 36 64 30 70 22Z M64 92 C72 84 86 86 92 80 C90 94 76 106 62 104 C58 100 60 96 64 92Z M20 74 C26 72 30 78 28 84 C24 84 20 80 20 74Z" fill="#9CCB8E" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M34 34 Q42 28 50 30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
        ${face(60, 62, m, 1)}`,
    },
    juno: {
      name: 'Juno',
      draw: (m) => `${shadow}
        <path d="M30 38 L90 38 Q97 40 97 50 L97 96 Q97 108 85 108 L35 108 Q23 108 23 96 L23 50 Q23 40 30 38Z" fill="#D5EFFB" ${st}/>
        <path d="M32 54 Q30 74 34 92" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
        <g class="gear" transform="translate(78 94)"><circle r="8" fill="none" stroke="#6DB36A" stroke-width="5" stroke-dasharray="3.2 3"/><circle r="5" fill="#9CCB8E" stroke="${INK}" stroke-width="1.6"/></g>
        <circle cx="42" cy="98" r="5" fill="#FFC4A3" stroke="${INK}" stroke-width="1.6"/>
        <rect x="28" y="22" width="64" height="17" rx="6" fill="#FFD966" ${st}/>
        <path d="M34 27h52" stroke="#F4B93C" stroke-width="3"/>
        <rect x="23" y="46" width="74" height="6" fill="#FF7A6B"/>
        <circle cx="46" cy="49" r="8" fill="#FFF6E6" ${st}/><circle cx="74" cy="49" r="8" fill="#FFF6E6" ${st}/>
        ${face(60, 74, m, 0.95)}`,
    },
  };

  /* Cy's wardrobe layers (drawn over the body) */
  function cyOutfit(o = {}) {
    const hat = {
      'cy-chef': `<g transform="translate(76 22) rotate(16)"><circle cx="-8" cy="0" r="8" fill="#fff" ${st}/><circle cx="8" cy="0" r="8" fill="#fff" ${st}/><circle cx="0" cy="-6" r="9" fill="#fff" ${st}/><rect x="-11" y="2" width="22" height="11" rx="3" fill="#fff" ${st}/></g>`,
      'cy-beret': `<path d="M58 36 Q76 16 102 34 Q86 44 58 36Z" fill="#FF7A6B" ${st}/><circle cx="82" cy="22" r="3.5" fill="#FF7A6B" ${st}/>`,
      'cy-headphones': `<path d="M22 66 Q20 26 60 26 Q100 26 98 66" stroke="${INK}" stroke-width="7" fill="none"/><path d="M22 66 Q20 26 60 26 Q100 26 98 66" stroke="#9B7BC4" stroke-width="3" fill="none"/><rect x="12" y="54" width="14" height="22" rx="6" fill="#9B7BC4" ${st}/><rect x="94" y="54" width="14" height="22" rx="6" fill="#9B7BC4" ${st}/>`,
      'cy-crown': `${[34, 47, 60, 73, 86].map((x, i) => `<path d="M${x} 38 C${x - 7} ${28 - (i % 2) * 6} ${x - 2} ${20 - (i % 2) * 6} ${x} ${18 - (i % 2) * 6} C${x + 2} ${20 - (i % 2) * 6} ${x + 7} ${28 - (i % 2) * 6} ${x} 38Z" fill="${i % 2 ? '#86C77A' : '#6DB36A'}" ${st}/>`).join('')}<circle cx="60" cy="30" r="4" fill="#FFD966" ${st}/>`,
    }[o.cyhat] || '';
    const acc = {
      'cy-bow': `<g transform="translate(86 38) rotate(-15)"><path d="M0 0 L-12 -8 L-12 8Z M0 0 L12 -8 L12 8Z" fill="#FF7A6B" ${st}/><circle r="4" fill="#FF7A6B" ${st}/></g>`,
      'cy-glasses': `<g fill="rgba(213,239,251,.45)" stroke="${INK}" stroke-width="3"><circle cx="47" cy="52" r="10"/><circle cx="73" cy="52" r="10"/><path d="M57 52h6" fill="none"/></g>`,
      'cy-flower': `<g transform="translate(32 40)"><circle r="4.5" fill="#FFD966" ${st}/>${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse rx="3.4" ry="6.5" transform="rotate(${a}) translate(0 -8)" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join('')}<circle r="4" fill="#FFD966"/></g>`,
    }[o.cyacc] || '';
    return hat + acc;
  }
  CY.art.face = face;
  /** Raw character group (120×120 space) for embedding inside larger scenes. */
  CY.art.charG = (id, mood = 'happy', v = 0) => (CHARS[id] || CHARS.cy).draw(mood, v, id === 'cy' ? cyLook() : {});
  CY.art.charName = (id) => (CHARS[id] ? CHARS[id].name : id);

  const cyLook = () => (CY.store && CY.store.s && CY.store.s.mascot) || {};
  CY.art.character = (id, { mood = 'happy', size = 120, variant = 0, cls = '', label, outfit } = {}) => {
    const c = CHARS[id] || CHARS.cy;
    const o = id === 'cy' ? (outfit === undefined ? cyLook() : outfit || {}) : {};
    return `<svg class="char char-${id} mood-${mood} ${cls}" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${label || c.name}"><g class="char-body">${c.draw(mood, variant, o)}</g></svg>`;
  };

  /* ---------- Player avatar ---------- */
  const SKIN = ['#FFE3CC', '#F5C9A0', '#D9A27A', '#AE744F', '#7A4B30'];
  const HAIR = ['#2D2233', '#6B4423', '#C98B5B', '#E8C26A', '#B85C4A', '#7C8AC9'];
  const APRON = { sage: '#8DBF8B', coral: '#FF7A6B', sky: '#8ED1F2', butter: '#FFD966', plum: '#9B7BC4', peach: '#FFC4A3' };
  CY.art.palette = { SKIN, HAIR, APRON };

  CY.art.avatar = (a = {}, size = 48, mood = 'happy') => {
    const skin = SKIN[a.skin ?? 1], hair = HAIR[a.hairColor ?? 0];
    const apron = APRON[(a.apron || 'sage').replace('apron-', '')] || APRON.sage;
    const hairBack = [
      '',
      `<circle cx="60" cy="24" r="12" fill="${hair}" ${st}/>`,
      `${[[34, 44], [40, 32], [52, 26], [68, 26], [80, 32], [86, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${hair}" ${st}/>`).join('')}`,
      `<path d="M30 56 Q28 30 60 28 Q92 30 90 56 L94 92 Q84 96 80 90 L40 90 Q36 96 26 92Z" fill="${hair}" ${st}/>`,
      '',
    ][a.hair ?? 0];
    const hairFront = [
      `<path d="M33 54 Q32 28 60 28 Q88 28 87 54 Q80 40 66 42 Q56 34 44 44 Q38 46 33 54Z" fill="${hair}" ${st}/>`,
      `<path d="M33 52 Q34 30 60 30 Q86 30 87 52 Q74 38 60 40 Q46 38 33 52Z" fill="${hair}" ${st}/>`,
      `<path d="M34 50 Q40 34 60 34 Q80 34 86 50 Q74 42 60 44 Q46 42 34 50Z" fill="${hair}"/>`,
      `<path d="M33 54 Q32 28 60 28 Q88 28 87 54 Q72 36 52 42 Q40 44 33 54Z" fill="${hair}" ${st}/>`,
      `<path d="M36 46 Q44 32 60 32 Q76 32 84 46" stroke="${hair}" stroke-width="4" fill="none" stroke-dasharray="1 5" stroke-linecap="round"/>`,
    ][a.hair ?? 0];
    const hats = {
      'hat-classic': `<g><circle cx="44" cy="20" r="11" fill="#fff" ${st}/><circle cx="76" cy="20" r="11" fill="#fff" ${st}/><circle cx="60" cy="13" r="13" fill="#fff" ${st}/><rect x="40" y="22" width="40" height="14" rx="4" fill="#fff" ${st}/></g>`,
      'hat-beret': `<path d="M28 38 Q36 14 64 16 Q92 18 90 36 Q60 44 28 38Z" fill="#FF7A6B" ${st}/><circle cx="66" cy="14" r="4" fill="#FF7A6B" ${st}/>`,
      'hat-cap': `<path d="M32 40 Q32 16 60 16 Q88 16 88 40Z" fill="#8ED1F2" ${st}/><path d="M60 40 Q90 38 102 44 Q86 48 60 44Z" fill="#3E9FD0" ${st}/>`,
      'hat-bandana': `<path d="M31 42 Q34 20 60 20 Q86 20 89 42 Q60 34 31 42Z" fill="#FFD966" ${st}/><circle cx="44" cy="32" r="2.5" fill="#fff"/><circle cx="60" cy="28" r="2.5" fill="#fff"/><circle cx="76" cy="32" r="2.5" fill="#fff"/><path d="M88 40 l10 6 -4 6" fill="#FFD966" ${st}/>`,
      'hat-leaf': `<path d="M60 30 C60 22 60 18 60 14" stroke="#4E8A5B" stroke-width="4" stroke-linecap="round"/><path d="M60 18 C48 4 32 10 35 21 C46 26 56 24 60 18Z" fill="#6DB36A" ${st}/><path d="M60 16 C71 1 89 5 86 17 C76 23 66 22 60 16Z" fill="#86C77A" ${st}/>`,
      'hat-crown': `<path d="M38 36 L36 14 L48 24 L60 10 L72 24 L84 14 L82 36Z" fill="#FFD966" ${st}/><circle cx="60" cy="26" r="3.5" fill="#FF7A6B"/>`,
      none: '',
    };
    const accs = {
      none: '',
      'acc-glasses': `<g fill="rgba(213,239,251,.5)" stroke="${INK}" stroke-width="2.6"><circle cx="48" cy="60" r="8"/><circle cx="72" cy="60" r="8"/><path d="M56 60h8" fill="none"/></g>`,
      'acc-star': `<polygon points="84,40 86.5,45.5 92,46 88,50 89,56 84,53 79,56 80,50 76,46 81.5,45.5" fill="#FFD966" stroke="${INK}" stroke-width="1.8"/>`,
      'acc-flower': `<g transform="translate(36 42)"><circle r="4.5" fill="#FFD966" ${st}/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3.6" ry="6" transform="rotate(${a}) translate(0 -8)" fill="#FFC9C9" stroke="${INK}" stroke-width="2"/>`).join('')}<circle r="4" fill="#FFD966"/></g>`,
      'acc-headphones': `<path d="M30 60 Q30 26 60 26 Q90 26 90 60" stroke="${INK}" stroke-width="5" fill="none"/><rect x="24" y="54" width="12" height="18" rx="5" fill="#9B7BC4" ${st}/><rect x="84" y="54" width="12" height="18" rx="5" fill="#9B7BC4" ${st}/>`,
      'acc-scarf': `<path d="M38 84 Q60 96 82 84 L84 94 Q60 106 36 94Z" fill="#FF7A6B" ${st}/>`,
    };
    return `<svg class="avatar" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Your chef avatar">
      <defs><clipPath id="avc${size}"><circle cx="60" cy="60" r="58"/></clipPath></defs>
      <circle cx="60" cy="60" r="58" fill="#FFF0B8"/>
      <g clip-path="url(#avc${size})">
        ${hairBack}
        <path d="M14 124 Q18 92 60 90 Q102 92 106 124Z" fill="#fff" ${st}/>
        <path d="M34 124 L38 100 Q60 108 82 100 L86 124Z" fill="${apron}" ${st}/>
        <path d="M48 92 L60 104 L72 92" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
        <rect x="52" y="78" width="16" height="16" rx="6" fill="${skin}"/>
        <circle cx="60" cy="58" r="27" fill="${skin}" ${st}/>
        ${hairFront}
        ${face(60, 59, mood, 0.78, 12)}
        ${hats[a.hat || 'none'] || ''}
        ${accs[a.acc || 'none'] || ''}
      </g>
      <circle cx="60" cy="60" r="58" fill="none" stroke="${INK}" stroke-width="3"/>
    </svg>`;
  };

  /* ---------- Race scooter with an avatar riding it ---------- */
  CY.art.racer = (av, { color = '#FF7A6B', size = 96, ghost = false, label = 'Racer' } = {}) => `<svg class="racer-svg ${ghost ? 'ghost' : ''}" viewBox="0 0 130 100" width="${size}" height="${size * 0.77}" role="img" aria-label="${label}">
      <g class="speedlines" stroke="#3D2F4F" stroke-width="3" stroke-linecap="round" opacity=".35"><path d="M2 60h16M6 72h12M0 84h16"/></g>
      <rect x="20" y="44" width="30" height="26" rx="5" fill="#FFD966" ${st}/><path d="M28 57h14" stroke="${INK}" stroke-width="2.5"/>
      <path d="M22 76 H86 L100 56 L108 56" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 76 H86 L100 56 L108 56" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M100 56 L96 34 M90 34 h12" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <g class="wheel"><circle cx="32" cy="84" r="11" fill="#fff" ${st}/><circle cx="32" cy="84" r="4" fill="${INK}"/><path d="M32 74v20M22 84h20" stroke="${INK}" stroke-width="1.5"/></g>
      <g class="wheel"><circle cx="98" cy="84" r="11" fill="#fff" ${st}/><circle cx="98" cy="84" r="4" fill="${INK}"/><path d="M98 74v20M88 84h20" stroke="${INK}" stroke-width="1.5"/></g>
      <svg x="46" y="0" width="58" height="58" viewBox="0 0 120 120">${CY.art.avatar(av, 120).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
    </svg>`;

  /* ---------- UI icons (24×24) ---------- */
  const ICONS = {
    heart: `<path d="M12 21s-8.5-5.4-8.5-11.4A4.7 4.7 0 0 1 12 6.8a4.7 4.7 0 0 1 8.5 2.8C20.5 15.6 12 21 12 21z" fill="#FF7A6B" stroke="${INK}" stroke-width="1.8"/><ellipse cx="8.5" cy="10" rx="1.6" ry="2.4" fill="#fff" opacity=".7"/>`,
    heartEmpty: `<path d="M12 21s-8.5-5.4-8.5-11.4A4.7 4.7 0 0 1 12 6.8a4.7 4.7 0 0 1 8.5 2.8C20.5 15.6 12 21 12 21z" fill="#EDE6F2" stroke="${INK}" stroke-width="1.8" stroke-dasharray="2.5 2"/>`,
    coin: `<circle cx="12" cy="12" r="9.5" fill="#FFD966" stroke="${INK}" stroke-width="1.8"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#E0A92E" stroke-width="1.8"/><path d="M9.5 14.5c2 1.6 5 .6 5-2.5s-3-4-5-2.5" stroke="#B07A12" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
    flame: `<path d="M12 2.5c1 4 6.5 6 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-5 3-7 .2 2 1.2 3.2 2.3 3.4C10.4 8 10 5.4 12 2.5z" fill="#FF9A4D" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 13c1.2 1.6 2.6 2.6 2.6 4.4a2.6 2.6 0 0 1-5.2 0c0-1.5 1.4-2.6 2.6-4.4z" fill="#FFD966"/>`,
    flameOff: `<path d="M12 2.5c1 4 6.5 6 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-5 3-7 .2 2 1.2 3.2 2.3 3.4C10.4 8 10 5.4 12 2.5z" fill="#E4DEEA" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    star: `<path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5-4.8-4.5 6.5-.8z" fill="#FFD966" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    starEmpty: `<path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5-4.8-4.5 6.5-.8z" fill="#EDE6F2" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    lock: `<rect x="5" y="10.5" width="14" height="10.5" rx="3" fill="#C9BFD6" stroke="${INK}" stroke-width="1.8"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="12" cy="15.5" r="1.6" fill="${INK}"/>`,
    gear: `<circle cx="12" cy="12" r="7.5" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="3 2.9"/><circle cx="12" cy="12" r="6" fill="#D6EBD2" stroke="${INK}" stroke-width="1.8"/><circle cx="12" cy="12" r="2.3" fill="${INK}"/>`,
    trophy: `<path d="M7 3.5h10v5a5 5 0 0 1-10 0z" fill="#FFD966" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 5.5H4a3 3 0 0 0 3.5 4M17 5.5h3a3 3 0 0 1-3.5 4" fill="none" stroke="${INK}" stroke-width="1.8"/><path d="M12 13.5v3.5" stroke="${INK}" stroke-width="2"/><rect x="7.5" y="17" width="9" height="4" rx="1.5" fill="#C98B5B" stroke="${INK}" stroke-width="1.8"/>`,
    bolt: `<path d="M13.5 2 4.5 13.5H11L9.5 22l10-12.5H13z" fill="#FFD966" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    check: `<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    leaf: `<path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z" fill="#9CCB8E" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 19 14 10" stroke="${INK}" stroke-width="1.6"/>`,
    clock: `<circle cx="12" cy="12" r="9" fill="#D5EFFB" stroke="${INK}" stroke-width="1.8"/><path d="M12 7v5l3.2 2" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
    target: `<circle cx="12" cy="12" r="9" fill="#FFC9C9" stroke="${INK}" stroke-width="1.8"/><circle cx="12" cy="12" r="5.2" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="12" cy="12" r="1.8" fill="#FF7A6B"/>`,
    crown: `<path d="M3 8.5l4.5 4 4.5-7 4.5 7 4.5-4-2 11H5z" fill="#FFD966" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    home: `<path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" fill="#FFC4A3" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    bag: `<path d="M5 8h14l-1.2 12.5H6.2z" fill="#FFC4A3" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 10V7.5a3 3 0 0 1 6 0V10" fill="none" stroke="${INK}" stroke-width="1.8"/>`,
    user: `<circle cx="12" cy="8.5" r="4" fill="#FFC4A3" stroke="${INK}" stroke-width="1.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0z" fill="#8ED1F2" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
    chart: `<rect x="3.5" y="12" width="4.5" height="8.5" rx="1.2" fill="#8ED1F2" stroke="${INK}" stroke-width="1.6"/><rect x="9.8" y="5" width="4.5" height="15.5" rx="1.2" fill="#FFD966" stroke="${INK}" stroke-width="1.6"/><rect x="16" y="9" width="4.5" height="11.5" rx="1.2" fill="#FFC4A3" stroke="${INK}" stroke-width="1.6"/>`,
    back: `<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    close: `<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
    play: `<path d="M8 5l11 7-11 7z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
    pause: `<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/>`,
    refresh: `<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    sparkle: `<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#FFD966" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`,
    ticket: `<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" fill="#FFF0B8" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 7v10" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2 2"/>`,
    medal: `<path d="M8 2.5h3l2 6h-3zM16 2.5h-3l-2 6h3z" fill="#8ED1F2" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="15" r="6" fill="#FFD966" stroke="${INK}" stroke-width="1.8"/><path d="M12 12v6M9.5 14l2.5-2" stroke="${INK}" stroke-width="1.6" fill="none"/>`,
    keyboard: `<rect x="2.5" y="6" width="19" height="12.5" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="1.8"/><path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M6 13.5h1M17 13.5h1M9 15.5h6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
    volume: `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="#FFC4A3" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
    calendar: `<rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.8"/><path d="M3.5 10h17" stroke="${INK}" stroke-width="1.8"/><path d="M8 3v4M16 3v4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#FF7A6B"/>`,
    map: `<path d="M3 6l6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18l-6 2.5z" fill="#D6EBD2" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 3.5V18M15 6v14.5" stroke="${INK}" stroke-width="1.6"/>`,
    licence: `<rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="#FFF6E6" stroke="${INK}" stroke-width="1.8"/><circle cx="16.5" cy="14.5" r="3" fill="#FF7A6B" stroke="${INK}" stroke-width="1.5"/><path d="M6.5 9h8M6.5 12h5" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
    flag: `<path d="M5 21V3" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><path d="M5 4h14l-3 4.5 3 4.5H5z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 4v9M11 4v9M14 4v9" stroke="${INK}" stroke-width="1.4" stroke-dasharray="2.2 2.2"/>`,
    globe: `<circle cx="12" cy="12" r="9.5" fill="#8ED1F2" stroke="${INK}" stroke-width="1.8"/><path d="M6 8c2-2 4-1 5 1s-1 3-3 3-3-2-2-4zM14 4c3 0 6 3 6 6-2 0-3-2-5-3s-2-3-1-3zM12 18c2-2 5-1 6-3-1 3-4 5-6 5z" fill="#9CCB8E" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`,
    snow: `<circle cx="12" cy="12" r="10" fill="#D5EFFB" stroke="${INK}" stroke-width="1.8"/><path d="M12 5v14M6 8.5l12 7M18 8.5l-12 7" stroke="#3E9FD0" stroke-width="2.2" stroke-linecap="round"/>`,
    thermo: `<rect x="9" y="2.5" width="6" height="13" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.8"/><circle cx="12" cy="17.5" r="4.2" fill="#8ED1F2" stroke="${INK}" stroke-width="1.8"/><path d="M12 8v8" stroke="#3E9FD0" stroke-width="2.4" stroke-linecap="round"/>`,
    info: `<circle cx="12" cy="12" r="9" fill="#D5EFFB" stroke="${INK}" stroke-width="1.8"/><path d="M12 11v6" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.4" fill="${INK}"/>`,
  };
  CY.art.icon = (name, size = 24, cls = '') => `<svg class="icon icon-${name} ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[name] || ''}</svg>`;
})();
