/* =====================================================================
   TBF MOMENT — bibliothèque d'illustrations vectorielles
   Chaque scène est dessinée en 800×600 et colorée par les variables de la
   palette active (--accent, --accent-2, --surface…), donc elle change de
   couleur avec la palette choisie dans « Personnaliser ».
   ILLUS.svg(nom, recadrage?) renvoie une balise <svg> (texte), insérée telle quelle :
   elle ne contient que nos propres dessins, jamais de saisie d'utilisateur.
   Repris du prototype (illus.js).
   ===================================================================== */
const V = { bg: "var(--surface-2)", sf: "var(--surface)", fg: "var(--fg)", a: "var(--accent)", b: "var(--accent-2)", m: "var(--muted)", l: "var(--line)", base: "var(--bg)" };
const SK = ["#4A2C1A", "#6B3E26", "#8A5536", "#A3683F"];
const F = (c, o) => `style="fill:${c}${o != null ? `;opacity:${o}` : ""}"`;
const ST = (c, w, o, extra = "") => `style="fill:none;stroke:${c};stroke-width:${w};stroke-linecap:round;stroke-linejoin:round${o != null ? `;opacity:${o}` : ""};${extra}"`;
let uid = 0;
const n = v => +v.toFixed(1);

/* ---------- éléments réutilisables ---------- */
function sparkle(x, y, s, c = V.a, o = .9) {
  return `<path ${F(c, o)} d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z"/>`;
}
function leaf(x, y, len, ang, c, o = 1) {
  return `<path ${F(c, o)} transform="translate(${x} ${y}) rotate(${ang})" d="M0 0C${len * .25} ${-len * .3} ${len * .7} ${-len * .3} ${len} 0C${len * .7} ${len * .3} ${len * .25} ${len * .3} 0 0Z"/>`;
}
function plant(x, y, s = 1, c = V.b) {
  let g = `<path ${F(V.a)} d="M${x - 26 * s} ${y - 54 * s}h${52 * s}l${-7 * s} ${54 * s}h${-38 * s}Z"/>`;
  [[-70, 70], [-100, 60], [-120, 80], [-60, 95], [-30, 75], [-145, 70], [-85, 100]].forEach(([a, l], i) =>
    g += leaf(x, y - 54 * s, l * s, a, c, i % 2 ? .85 : 1));
  return g;
}
function person({ x, y, h = 260, skin = SK[1], top = V.a, trim = V.b, kind = "f", hat = null, hand = null }) {
  const r = h * .072, hy = y - h + r, sh = hy + r * 1.75;
  let g = `<ellipse ${F(V.fg, .12)} cx="${x}" cy="${y + 2}" rx="${h * .2}" ry="${h * .025}"/>`;
  if (kind === "m") {
    const sw = h * .17, hw = h * .19;
    g += `<rect ${F(skin)} x="${n(x - r * .45)}" y="${n(hy + r * .6)}" width="${n(r * .9)}" height="${n(r * 1.4)}"/>`;
    g += `<path ${F(top)} d="M${n(x - sw)} ${n(sh + 14)}Q${n(x - sw)} ${n(sh)} ${n(x - sw + 16)} ${n(sh)}L${n(x + sw - 16)} ${n(sh)}Q${n(x + sw)} ${n(sh)} ${n(x + sw)} ${n(sh + 14)}L${n(x + hw)} ${n(y - 6)}L${n(x - hw)} ${n(y - 6)}Z"/>`;
    g += `<path ${ST(trim, h * .014)} d="M${n(x - r * .95)} ${n(sh + 2)}Q${x} ${n(sh + r * 3)} ${n(x + r * .95)} ${n(sh + 2)}M${x} ${n(sh + r * 1.5)}V${n(sh + h * .32)}"/>`;
    g += `<path ${ST(trim, h * .008, .8)} d="M${n(x - sw + 10)} ${n(y - h * .12)}H${n(x + sw - 10)}"/>`;
    g += `<ellipse ${F(V.fg, .85)} cx="${n(x - h * .06)}" cy="${n(y - 4)}" rx="${n(h * .05)}" ry="${n(h * .018)}"/><ellipse ${F(V.fg, .85)} cx="${n(x + h * .06)}" cy="${n(y - 4)}" rx="${n(h * .05)}" ry="${n(h * .018)}"/>`;
  } else if (kind === "c") {
    const sw = h * .14, hw = h * .17;
    g += `<path ${F(top)} d="M${n(x - sw)} ${n(sh + 10)}Q${n(x - sw)} ${n(sh)} ${n(x - sw + 10)} ${n(sh)}H${n(x + sw - 10)}Q${n(x + sw)} ${n(sh)} ${n(x + sw)} ${n(sh + 10)}L${n(x + hw)} ${n(y - h * .25)}H${n(x - hw)}Z"/>`;
    g += `<rect ${F(V.fg, .8)} x="${n(x - h * .1)}" y="${n(y - h * .26)}" width="${n(h * .07)}" height="${n(h * .26)}" rx="3"/><rect ${F(V.fg, .8)} x="${n(x + h * .03)}" y="${n(y - h * .26)}" width="${n(h * .07)}" height="${n(h * .26)}" rx="3"/>`;
  } else {
    const sw = h * .1, hw = h * .21;
    g += `<rect ${F(skin)} x="${n(x - r * .4)}" y="${n(hy + r * .6)}" width="${n(r * .8)}" height="${n(r * 1.3)}"/>`;
    g += `<path ${F(top)} d="M${n(x - sw)} ${n(sh + 10)}Q${n(x - sw)} ${n(sh)} ${n(x - sw + 10)} ${n(sh)}L${n(x + sw - 10)} ${n(sh)}Q${n(x + sw)} ${n(sh)} ${n(x + sw)} ${n(sh + 10)}L${n(x + hw)} ${y}L${n(x - hw)} ${y}Z"/>`;
    g += `<path ${F(skin)} d="M${n(x - r * .55)} ${n(sh)}L${x} ${n(sh + r * .9)}L${n(x + r * .55)} ${n(sh)}Z"/>`;
    g += `<rect ${F(trim)} x="${n(x - sw - h * .015)}" y="${n(sh + h * .2)}" width="${n(sw * 2 + h * .03)}" height="${n(h * .03)}" rx="2"/>`;
    g += `<path ${ST(trim, h * .006, .7)} d="M${n(x - hw * .55)} ${n(y - h * .14)}Q${x} ${n(y - h * .1)} ${n(x + hw * .55)} ${n(y - h * .14)}"/>`;
  }
  g += `<circle ${F(skin)} cx="${x}" cy="${n(hy)}" r="${n(r)}"/>`;
  if (hat === "gele") g += `<path ${F(top)} d="M${n(x - r * 1.25)} ${n(hy - r * .1)}C${n(x - r * 1.6)} ${n(hy - r * 1.8)} ${n(x + r * 1.6)} ${n(hy - r * 2.1)} ${n(x + r * 1.3)} ${n(hy - r * .15)}C${n(x + r * .6)} ${n(hy - r * .75)} ${n(x - r * .6)} ${n(hy - r * .75)} ${n(x - r * 1.25)} ${n(hy - r * .1)}Z"/><circle ${F(trim)} cx="${n(x + r * .9)}" cy="${n(hy - r * .9)}" r="${n(r * .32)}"/>`;
  else if (hat === "kufi") g += `<rect ${F(top)} x="${n(x - r * .9)}" y="${n(hy - r * 1.2)}" width="${n(r * 1.8)}" height="${n(r * .75)}" rx="${n(r * .2)}"/><path ${ST(trim, r * .12)} d="M${n(x - r * .9)} ${n(hy - r * .8)}H${n(x + r * .9)}"/>`;
  else if (hat === "cap") g += `<path ${F(V.fg)} d="M${n(x - r * 1.6)} ${n(hy - r * .85)}L${x} ${n(hy - r * 1.5)}L${n(x + r * 1.6)} ${n(hy - r * .85)}L${x} ${n(hy - r * .25)}Z"/><path ${ST(V.a, r * .12)} d="M${n(x + r * .2)} ${n(hy - r * .9)}L${n(x + r * 1.3)} ${n(hy - r * .5)}V${n(hy + r * .4)}"/>`;
  else if (hat === "hair") g += `<path ${F(V.fg)} d="M${n(x - r)} ${n(hy)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(hy)}Q${x} ${n(hy - r * .4)} ${n(x - r)} ${n(hy)}Z"/>`;
  else if (hat === "grey") g += `<path ${F("#D8D3CA")} d="M${n(x - r)} ${n(hy)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(hy)}Q${x} ${n(hy - r * .4)} ${n(x - r)} ${n(hy)}Z"/>`;
  if (hand) g += hand;
  return g;
}
function crowd(y, count, c = V.fg, o = .85, arms = true) {
  let g = "";
  for (let i = 0; i < count; i++) {
    const x = (i + .5) * 800 / count + (i % 2 ? 8 : -8), s = 1 + (i % 3) * .12, yy = y + (i % 2) * 14;
    g += `<g ${F(c, o)}><circle cx="${n(x)}" cy="${n(yy - 30 * s)}" r="${n(17 * s)}"/><path d="M${n(x - 34 * s)} ${n(yy + 40)}Q${n(x - 34 * s)} ${n(yy - 8 * s)} ${x} ${n(yy - 10 * s)}Q${n(x + 34 * s)} ${n(yy - 8 * s)} ${n(x + 34 * s)} ${n(yy + 40)}Z"/></g>`;
    if (arms && i % 3 === 1) g += `<path ${ST(c, 10 * s, o)} d="M${n(x + 20 * s)} ${n(yy - 2)}L${n(x + 34 * s)} ${n(yy - 70 * s)}"/><circle ${F(c, o)} cx="${n(x + 35 * s)}" cy="${n(yy - 76 * s)}" r="${n(7 * s)}"/>`;
  }
  return g;
}
const backdrop = (halo = true) => `<rect width="800" height="600" ${F(V.bg)}/>` + (halo ? `<circle cx="400" cy="250" r="260" ${F(V.a, .1)}/><circle cx="400" cy="250" r="170" ${F(V.a, .08)}/>` : "");
const floor = (y = 505, o = .55) => `<rect y="${y}" width="800" height="${600 - y}" ${F(V.sf, o)}/><path ${ST(V.l, 2)} d="M0 ${y}H800"/>`;
const confetti = (k = 22, seed = 3) => { let g = "", s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < k; i++) g += `<rect ${F(i % 2 ? V.a : V.b, .85)} x="${n(rnd() * 780)}" y="${n(rnd() * 420)}" width="${n(6 + rnd() * 8)}" height="5" rx="2" transform="rotate(${n(rnd() * 180)} ${n(rnd() * 780)} ${n(rnd() * 420)})"/>`; return g; };
const stars = (k = 18, seed = 7, c = V.a) => { let g = "", s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < k; i++) g += sparkle(n(rnd() * 800), n(rnd() * 330), n(4 + rnd() * 8), i % 3 ? c : V.sf, .55 + rnd() * .4); return g; };

/* ---------- scènes ---------- */
const S = {};
S.couple = () => {
  let g = backdrop() + floor(520);
  g += `<path ${F(V.sf, .6)} d="M190 520V265A210 210 0 0 1 610 265V520Z"/>`;
  g += `<path ${ST(V.a, 4)} d="M218 520V270A182 182 0 0 1 582 270V520"/><path ${ST(V.a, 1.5, .6)} d="M240 520V275A160 160 0 0 1 560 275V520"/>`;
  g += `<path ${F(V.a)} d="M400 64l12 14-12 14-12-14Z"/>`;
  g += plant(140, 520, 1.1) + plant(660, 520, 1.1);
  g += person({ x: 350, y: 515, h: 300, kind: "f", hat: "gele", skin: SK[2], top: V.a, trim: V.b });
  g += person({ x: 458, y: 515, h: 330, kind: "m", hat: "kufi", skin: SK[1], top: V.b, trim: V.a });
  g += `<circle ${F(SK[2])} cx="402" cy="378" r="9"/>`;
  for (let i = 0; i < 14; i++) g += `<ellipse ${F(i % 2 ? V.a : V.b, .7)} cx="${120 + i * 43}" cy="${540 + (i % 3) * 14}" rx="6" ry="3.5" transform="rotate(${i * 37} ${120 + i * 43} ${540 + (i % 3) * 14})"/>`;
  g += sparkle(250, 140, 12) + sparkle(560, 120, 9) + sparkle(610, 200, 6, V.b);
  return g;
};
S.dot = (id) => {
  let g = `<defs><pattern id="tg${id}" width="28" height="22" patternUnits="userSpaceOnUse"><rect width="28" height="22" ${F("#1A1412")}/><path ${ST(V.a, 2.4)} d="M0 11 7 4 14 11 21 4 28 11"/><path ${ST(V.b, 2)} d="M0 19 7 13 14 19 21 13 28 19"/><circle cx="14" cy="2" r="1.6" ${F("#F4EDE1")}/></pattern></defs>`;
  g += backdrop() + floor(520);
  g += `<path ${F(V.b, .9)} d="M400 70L585 310H215Z"/>`;
  for (let i = 0; i < 9; i++) g += `<path ${ST(V.fg, 2, .25)} d="M400 70L${235 + i * 41} 310"/>`;
  g += `<path ${ST(V.a, 3)} d="M225 300H575"/>`;
  g += `<rect x="250" y="300" width="300" height="190" ${F(V.sf)}/><path ${F(V.fg, .78)} d="M372 490V410A28 28 0 0 1 428 410V490Z"/>`;
  [[318, 300], [470, 300]].forEach(([x]) => g += `<rect x="${x}" y="320" width="14" height="170" ${F(`url(#tg${id})`)}/>`);
  g += `<rect x="250" y="486" width="300" height="10" ${F(V.fg, .2)}/>`;
  g += plant(150, 520, 1) + plant(650, 520, 1);
  g += person({ x: 315, y: 515, h: 270, kind: "f", hat: "gele", skin: SK[1], top: `url(#tg${id})`, trim: V.a });
  g += person({ x: 488, y: 515, h: 300, kind: "m", hat: "kufi", skin: SK[0], top: `url(#tg${id})`, trim: V.a });
  g += sparkle(170, 150, 10) + sparkle(640, 130, 12) + sparkle(600, 220, 6, V.b);
  return g;
};
S.cake = () => {
  let g = backdrop() + floor(470, .5);
  g += `<path ${ST(V.fg, 2, .5)} d="M0 40Q200 110 400 60T800 50"/>`;
  for (let i = 0; i < 11; i++) { const x = 30 + i * 70, y = 40 + Math.sin(i * .9) * 22 + (i > 5 ? -8 : 10);
    g += `<path ${F(i % 2 ? V.a : V.b)} d="M${x - 18} ${n(y)}H${x + 18}L${x} ${n(y + 38)}Z"/>`; }
  g += `<rect x="150" y="430" width="500" height="18" rx="6" ${F(V.sf)}/><path ${F(V.sf, .7)} d="M160 448h480l-30 70H190Z"/>`;
  g += `<rect x="245" y="330" width="310" height="100" rx="14" ${F(V.a)}/><rect x="285" y="250" width="230" height="86" rx="12" ${F(V.b)}/><rect x="325" y="185" width="150" height="70" rx="10" ${F(V.a)}/>`;
  g += `<path ${F(V.sf)} d="M245 352q20 22 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0V344H245Z"/><path ${F(V.sf)} d="M285 268q19 18 38 0t38 0 38 0 38 0 38 0 38 0V262H285Z"/>`;
  for (let i = 0; i < 5; i++) { const x = 345 + i * 27; g += `<rect x="${x}" y="150" width="8" height="36" rx="3" ${F(i % 2 ? V.sf : V.b)}/><ellipse cx="${x + 4}" cy="141" rx="5" ry="9" ${F("#FFC93C")}/>`; }
  [[120, 150, V.a], [205, 95, V.b], [640, 110, V.b], [710, 200, V.a], [560, 70, V.a]].forEach(([x, y, c]) =>
    g += `<path ${ST(V.fg, 1.5, .5)} d="M${x} ${y + 46}q-12 60 6 120 t-6 110"/><ellipse cx="${x}" cy="${y}" rx="36" ry="46" ${F(c)}/><ellipse cx="${x - 12}" cy="${y - 16}" rx="7" ry="12" ${F("#fff", .35)}/>`);
  [[110, 470, 80, 60, V.b, V.a], [680, 470, 70, 80, V.a, V.b]].forEach(([x, y, w, h, c, r]) =>
    g += `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="6" ${F(c)}/><rect x="${x - 6}" y="${y - h}" width="12" height="${h}" ${F(r)}/><path ${ST(r, 6)} d="M${x} ${y - h}c-20-22-30 4 0 0c30 4 20-22 0 0"/>`);
  return g + confetti(18, 11);
};
S.stage = () => {
  let g = `<rect width="800" height="600" ${F(V.base)}/>`;
  g += `<path ${F(V.a, .2)} d="M190 0h36l120 470H90Z"/><path ${F(V.b, .18)} d="M574 0h36l100 470H460Z"/><path ${F(V.a, .12)} d="M392 0h16l80 470H312Z"/>`;
  g += `<rect x="0" y="0" width="800" height="26" ${F(V.fg, .25)}/>`;
  [190, 400, 590].forEach(x => g += `<rect x="${x - 14}" y="18" width="40" height="22" rx="4" ${F(V.fg, .7)}/>`);
  g += `<rect x="40" y="420" width="720" height="60" ${F(V.sf)}/><path ${ST(V.a, 3)} d="M40 420H760"/>`;
  g += `<rect x="70" y="300" width="70" height="120" rx="6" ${F(V.fg, .75)}/><circle cx="105" cy="335" r="18" ${F(V.bg)}/><circle cx="105" cy="385" r="24" ${F(V.bg)}/>`;
  g += `<rect x="660" y="300" width="70" height="120" rx="6" ${F(V.fg, .75)}/><circle cx="695" cy="335" r="18" ${F(V.bg)}/><circle cx="695" cy="385" r="24" ${F(V.bg)}/>`;
  g += `<path ${ST(V.fg, 4)} d="M440 420V270M425 420h30"/><circle cx="440" cy="262" r="9" ${F(V.fg)}/>`;
  g += person({ x: 400, y: 420, h: 240, kind: "f", hat: "hair", skin: SK[1], top: V.a, trim: V.b });
  g += `<path ${ST(SK[1], 9)} d="M385 300L360 250"/>`;
  g += crowd(560, 9, V.fg, .92);
  return g + stars(10, 5, V.b);
};
S.stadium = () => {
  let g = backdrop(false);
  g += `<path ${F(V.sf)} d="M0 190Q400 110 800 190V330H0Z"/>`;
  for (let i = 0; i < 6; i++) g += `<path ${ST(V.l, 3)} d="M0 ${205 + i * 22}Q400 ${128 + i * 22} 800 ${205 + i * 22}"/>`;
  for (let i = 0; i < 40; i++) g += `<circle cx="${10 + i * 20}" cy="${n(232 + Math.sin(i) * 5 + (i % 3) * 22 - Math.abs(i - 20) * -0.8)}" r="4" ${F(i % 4 ? V.fg : V.a, .45)}/>`;
  [[70, 40], [730, 40]].forEach(([x, y]) => g += `<path ${ST(V.fg, 6, .7)} d="M${x} ${y + 30}V330"/><rect x="${x - 34}" y="${y}" width="68" height="34" rx="4" ${F(V.a)}/><path ${F(V.a, .12)} d="M${x - 30} ${y + 34}L${x < 400 ? 380 : 120} 520H${x < 400 ? 680 : 420}Z"/>`);
  g += `<path ${F(V.b, .35)} d="M0 330H800V600H0Z"/>`;
  for (let i = 0; i < 6; i++) g += `<path ${F(V.b, .18)} d="M${i * 140 - 40} 330h70l${-20 + i * 12} 270h-80Z"/>`;
  g += `<path ${ST(V.sf, 3, .8)} d="M400 330V600"/><ellipse cx="400" cy="440" rx="120" ry="40" ${ST(V.sf, 3, .8)}/>`;
  g += `<path ${F(V.a)} d="M360 300h80v40c0 40-18 62-40 66-22-4-40-26-40-66Z"/><path ${ST(V.a, 10)} d="M362 312c-34 0-34 44 4 44M438 312c34 0 34 44-4 44"/>`;
  g += `<rect x="388" y="404" width="24" height="34" ${F(V.a)}/><rect x="362" y="436" width="76" height="22" rx="4" ${F(V.fg)}/><rect x="372" y="458" width="56" height="10" ${F(V.fg, .7)}/>`;
  g += `<circle cx="560" cy="520" r="30" ${F(V.sf)}/><path ${F(V.fg)} d="M560 506l12 9-5 14h-14l-5-14Z"/>`;
  return g + confetti(16, 21);
};
S.conference = () => {
  let g = backdrop(false) + floor(420, .45);
  g += `<rect x="200" y="50" width="400" height="240" rx="10" ${F(V.sf)}/><rect x="200" y="50" width="400" height="240" rx="10" ${ST(V.l, 3)}/>`;
  [60, 110, 85, 150, 130, 180].forEach((h, i) => g += `<rect x="${245 + i * 50}" y="${255 - h}" width="30" height="${h}" rx="4" ${F(i % 2 ? V.b : V.a)}/>`);
  g += `<path ${ST(V.fg, 4)} d="M245 170L295 140 345 155 395 110 445 120 525 70"/><circle cx="525" cy="70" r="7" ${F(V.fg)}/>`;
  g += `<rect x="230" y="70" width="90" height="10" rx="5" ${F(V.fg, .25)}/>`;
  g += person({ x: 400, y: 470, h: 230, kind: "m", hat: null, skin: SK[1], top: V.fg, trim: V.a });
  g += `<path ${F(V.a)} d="M340 360h120l-14 110h-92Z"/><circle cx="400" cy="400" r="16" ${F(V.b)}/><path ${ST(V.fg, 3)} d="M410 358l18-22"/>`;
  g += crowd(520, 10, V.fg, .55, false) + crowd(580, 8, V.fg, .85, false);
  return g;
};
S.city = () => {
  let g = `<rect width="800" height="600" ${F(V.bg)}/><circle cx="560" cy="210" r="90" ${F(V.a, .85)}/><circle cx="560" cy="210" r="140" ${F(V.a, .12)}/>`;
  const B = [[20, 260, 70], [95, 200, 60], [160, 300, 80], [245, 150, 55], [305, 230, 75], [385, 270, 60], [450, 180, 70], [525, 320, 50], [580, 240, 80], [665, 170, 60], [730, 280, 70]];
  B.forEach(([x, h, w], i) => { g += `<rect x="${x}" y="${430 - h}" width="${w}" height="${h}" ${F(V.fg, .55 + (i % 3) * .12)}/>`;
    for (let r = 0; r < Math.floor(h / 30); r++) for (let c = 0; c < Math.floor(w / 18); c++) if ((r + c + i) % 3) g += `<rect x="${x + 6 + c * 18}" y="${430 - h + 12 + r * 30}" width="8" height="12" ${F(V.b, .55)}/>`; });
  g += `<rect y="430" width="800" height="170" ${F(V.b, .28)}/>`;
  g += `<path ${ST(V.fg, 8)} d="M0 420H800"/>`;
  for (let i = 0; i < 8; i++) g += `<path ${ST(V.fg, 5, .85)} d="M${i * 110} 420a55 40 0 0 1 110 0"/><rect x="${i * 110 - 4}" y="420" width="8" height="60" ${F(V.fg, .85)}/>`;
  for (let i = 0; i < 6; i++) g += `<path ${ST(V.sf, 2.5, .6)} d="M${40 + i * 130} ${500 + (i % 2) * 40}q20-10 40 0t40 0"/>`;
  g += `<path ${F(V.fg)} d="M230 540h140l-20 18H250Z"/>` + person({ x: 300, y: 540, h: 70, kind: "m", skin: SK[0], top: V.a, trim: V.b });
  return g;
};
S.church = () => {
  let g = backdrop(false);
  for (let i = 0; i < 11; i++) { const a = Math.PI / 2 + (i - 5) * .2; g += `<path ${F(V.a, .1)} d="M400 -40L${n(400 + Math.cos(a - .05) * 900)} ${n(-40 + Math.sin(a - .05) * 900)}L${n(400 + Math.cos(a + .05) * 900)} ${n(-40 + Math.sin(a + .05) * 900)}Z"/>`; }
  g += floor(500, .5);
  g += `<rect x="250" y="270" width="300" height="230" ${F(V.sf)}/><path ${F(V.a)} d="M232 280L400 160 568 280Z"/>`;
  g += `<rect x="370" y="90" width="60" height="80" ${F(V.sf)}/><path ${F(V.a)} d="M362 100L400 66 438 100Z"/><path ${ST(V.a, 6)} d="M400 30V64M386 42H414"/>`;
  g += `<circle cx="400" cy="235" r="22" ${F(V.b)}/><circle cx="400" cy="235" r="22" ${ST(V.a, 3)}/>`;
  g += `<path ${F(V.fg, .78)} d="M365 500V400A35 35 0 0 1 435 400V500Z"/>`;
  [285, 490].forEach(x => g += `<path ${F(V.b, .8)} d="M${x} 400V350A13 13 0 0 1 ${x + 26} 350V400Z"/>`);
  g += `<rect x="230" y="500" width="340" height="12" ${F(V.l)}/><rect x="215" y="512" width="370" height="12" ${F(V.l, .8)}/>`;
  g += `<path ${F(V.sf)} d="M610 140c20-14 40-14 56-2-16-2-26 6-30 14 14 0 24 6 30 16-22-6-44-4-62 8 4-14 12-24 22-30-8-4-12-6-16-6Z"/>`;
  g += person({ x: 160, y: 540, h: 110, kind: "f", hat: "gele", skin: SK[2], top: V.a, trim: V.b }) + person({ x: 200, y: 540, h: 120, kind: "m", skin: SK[1], top: V.b, trim: V.a });
  g += person({ x: 620, y: 545, h: 115, kind: "f", hat: "gele", skin: SK[0], top: V.b, trim: V.a });
  return g;
};
S.cradle = () => {
  let g = `<rect width="800" height="600" ${F(V.bg)}/>` + stars(22, 3, V.a);
  g += `<circle cx="620" cy="130" r="58" ${F(V.a)}/><circle cx="645" cy="112" r="52" ${F(V.bg)}/>`;
  [[150, 150, 1], [560, 300, .8], [260, 330, .7]].forEach(([x, y, s]) => g += `<path ${F(V.sf, .95)} d="M${x} ${y}a${30 * s} ${30 * s} 0 0 1 ${55 * s} ${-18 * s}a${40 * s} ${40 * s} 0 0 1 ${75 * s} ${10 * s}a${26 * s} ${26 * s} 0 0 1 ${5 * s} ${50 * s}H${x}a${22 * s} ${22 * s} 0 0 1 0 ${-42 * s}Z"/>`);
  g += `<path ${ST(V.fg, 2, .5)} d="M400 0V120M300 120H500M300 120V170M370 120V190M440 120V160M500 120V185"/>`;
  g += sparkle(300, 180, 14, V.a) + sparkle(370, 200, 10, V.b) + `<circle cx="440" cy="168" r="9" ${F(V.a)}/>` + sparkle(500, 195, 12, V.sf);
  g += `<ellipse cx="400" cy="560" rx="230" ry="18" ${F(V.fg, .12)}/>`;
  g += `<path ${F(V.a)} d="M210 400H590Q585 545 400 548Q215 545 210 400Z"/>`;
  for (let i = 0; i < 9; i++) g += `<path ${ST(V.b, 3, .7)} d="M${232 + i * 42} 410Q${236 + i * 41} 480 ${250 + i * 38} 530"/>`;
  g += `<path ${ST(V.b, 4, .7)} d="M222 450H578M240 500H560"/>`;
  g += `<circle cx="330" cy="378" r="38" ${F(SK[2])}/><path ${F(V.b)} d="M292 372a38 38 0 0 1 76 0Z"/><circle cx="330" cy="334" r="7" ${F(V.b)}/>`;
  g += `<path ${F(V.sf)} d="M300 400Q420 340 590 392V412H210V404Q260 398 300 400Z"/><path ${ST(V.b, 2.5, .7)} d="M330 392Q440 360 570 398"/>`;
  g += `<path ${F(V.a)} d="M200 396h400v16H200Z"/>`;
  return g;
};
S.graduation = () => {
  let g = backdrop() + floor(520, .5) + confetti(20, 17);
  const cap = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path ${F(V.fg)} d="M-50 0L0-20 50 0 0 20Z"/><path ${F(V.fg, .85)} d="M-26 10v20c16 10 36 10 52 0V10L0 20Z"/><path ${ST(V.a, 3)} d="M0 0L36 10V40"/><circle cx="36" cy="44" r="5" ${F(V.a)}/></g>`;
  g += cap(160, 120, 1.1, -18) + cap(620, 90, .9, 22) + cap(700, 230, .7, -8) + cap(250, 250, .6, 30) + cap(560, 220, .55, -30);
  g += person({ x: 400, y: 515, h: 330, kind: "m", hat: "cap", skin: SK[1], top: V.fg, trim: V.a });
  g += `<path ${F(V.a)} d="M372 296l28 26 28-26v80h-56Z" style="fill:var(--accent);opacity:.9"/>`;
  g += `<g transform="translate(480 330) rotate(-25)"><rect x="-10" y="-60" width="20" height="120" rx="10" ${F(V.sf)}/><rect x="-10" y="-60" width="20" height="120" rx="10" ${ST(V.l, 2)}/><rect x="-14" y="-8" width="28" height="12" ${F(V.a)}/></g>`;
  g += `<circle cx="470" cy="352" r="11" ${F(SK[1])}/>`;
  for (let i = 0; i < 9; i++) { g += leaf(60 + i * 18, 560 - i * 22, 34, -60 - i * 4, V.a, .9); g += leaf(740 - i * 18, 560 - i * 22, 34, -120 + i * 4, V.a, .9); }
  g += `<path ${ST(V.a, 3)} d="M60 570Q120 470 210 380M740 570Q680 470 590 380"/>`;
  return g;
};
S.candle = () => {
  let g = `<rect width="800" height="600" ${F(V.bg)}/><circle cx="400" cy="230" r="230" ${F("#F2C88B", .08)}/><circle cx="400" cy="210" r="120" ${F("#F2C88B", .12)}/>`;
  g += floor(470, .5);
  g += `<rect x="520" y="110" width="170" height="210" rx="6" ${F(V.sf)}/><rect x="534" y="124" width="142" height="182" ${F(V.bg)}/><rect x="520" y="110" width="170" height="210" rx="6" ${ST(V.a, 3)}/>`;
  g += `<circle cx="605" cy="196" r="34" ${F(V.m, .55)}/><path ${F(V.m, .55)} d="M545 306c6-50 34-66 60-66s54 16 60 66Z"/>`;
  g += `<path ${F(V.fg)} d="M520 110l30 0-30 30Z" style="fill:var(--fg);opacity:.85"/>`;
  g += `<rect x="370" y="230" width="60" height="240" rx="6" ${F("#F4EEE2")}/><path ${F("#E7DFD0")} d="M370 236q30 14 60 0v14q-30 14-60 0Z"/><path ${ST("#222", 3)} d="M400 230V214"/>`;
  g += `<path ${F("#FFB85C")} d="M400 160c16 22 18 40 0 56-18-16-16-34 0-56Z"/><path ${F("#FFF2C2")} d="M400 186c7 10 8 18 0 26-8-8-7-16 0-26Z"/>`;
  g += `<rect x="290" y="330" width="44" height="140" rx="5" ${F("#EDE6D8")}/><path ${F("#FFB85C")} d="M312 282c10 14 11 26 0 36-11-10-10-22 0-36Z"/><path ${ST("#222", 2.5)} d="M312 330V318"/>`;
  const lily = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="9" ry="26" cy="-22" transform="rotate(${a})" ${F("#F7F4EE")}/>`).join("")}<circle r="7" ${F("#E8C77D")}/></g>`;
  g += `<path ${ST(V.b, 4)} d="M150 470Q160 380 130 300M180 470Q190 360 220 290M210 470Q230 400 260 360"/>`;
  g += lily(130, 290, 1.1, -10) + lily(222, 282, 1, 15) + lily(262, 352, .8, 30);
  g += leaf(160, 420, 60, -130, V.b, .85) + leaf(200, 440, 55, -50, V.b, .85);
  return g;
};
S.family = () => {
  let g = backdrop(false) + `<rect y="470" width="800" height="130" ${F(V.b, .3)}/>`;
  g += `<path ${F("#6B4A2E")} d="M380 470C390 400 385 330 370 260l30 10 30-10C415 330 410 400 420 470Z"/><path ${ST("#6B4A2E", 14)} d="M392 300L300 230M408 290L510 220M400 270V190"/>`;
  [[400, 160, 120, V.b], [290, 210, 95, V.a], [520, 200, 100, V.b], [350, 120, 80, V.a], [470, 120, 85, V.a], [230, 180, 60, V.b], [580, 150, 65, V.a]].forEach(([x, y, r, c], i) => g += `<circle cx="${x}" cy="${y}" r="${r}" ${F(c, .78 + (i % 2) * .1)}/>`);
  g += person({ x: 190, y: 540, h: 250, kind: "m", hat: "grey", skin: SK[0], top: V.a, trim: V.b });
  g += person({ x: 270, y: 540, h: 235, kind: "f", hat: "gele", skin: SK[1], top: V.b, trim: V.a });
  g += person({ x: 360, y: 545, h: 150, kind: "c", hat: "hair", skin: SK[2], top: V.sf, trim: V.a });
  g += person({ x: 450, y: 545, h: 175, kind: "c", hat: "hair", skin: SK[1], top: V.a, trim: V.b });
  g += person({ x: 535, y: 540, h: 270, kind: "f", hat: "gele", skin: SK[2], top: V.a, trim: V.b });
  g += person({ x: 625, y: 540, h: 285, kind: "m", hat: null, skin: SK[1], top: V.b, trim: V.a });
  return g;
};
S.party = () => {
  let g = `<rect width="800" height="600" ${F(V.base)}/>`;
  for (let i = 0; i < 14; i++) { const a = Math.PI * (i / 13); g += `<path ${F(V.a, .07)} d="M400 110L${n(400 + Math.cos(a - .05) * 900)} ${n(110 + Math.sin(a - .05) * 900)}L${n(400 + Math.cos(a + .05) * 900)} ${n(110 + Math.sin(a + .05) * 900)}Z"/>`; }
  g += `<path ${ST(V.fg, 3, .6)} d="M400 0V50"/><circle cx="400" cy="110" r="62" ${F(V.fg, .9)}/>`;
  for (let i = -3; i <= 3; i++) g += `<path ${ST(V.base, 2, .6)} d="M${400 + i * 17} 52Q${400 + i * 24} 110 ${400 + i * 17} 168"/><path ${ST(V.base, 2, .6)} d="M342 ${110 + i * 17}H458"/>`;
  g += `<circle cx="380" cy="90" r="11" ${F("#fff", .6)}/>`;
  const glass = (x, r, c) => `<g transform="translate(${x} 520) rotate(${r})"><path ${F(V.fg, .12)} d="M-62-250h124q-4 86-62 102-58-16-62-102Z"/><path ${F(c)} d="M-55-215h110q-8 56-55 66-47-10-55-66Z"/><path ${ST(V.fg, 4, .9)} d="M-62-250h124q-4 86-62 102-58-16-62-102Z"/><path ${ST(V.fg, 7, .9)} d="M0-148V-4M-44-4h88"/></g>`;
  g += glass(325, 18, V.a) + glass(475, -18, V.b);
  g += sparkle(400, 262, 26, V.fg) + sparkle(352, 228, 11, V.a) + sparkle(452, 218, 13, V.b);
  g += `<path ${ST(V.a, 5)} d="M60 60c40 30-30 60 10 90s-30 60 10 90"/><path ${ST(V.b, 5)} d="M740 40c-40 30 30 60-10 90s30 60-10 90"/>`;
  return g + confetti(26, 31);
};
S.gallery = () => {
  let g = backdrop(false) + floor(500, .6);
  g += `<path ${F(V.a, .1)} d="M300 0h200l120 500H180Z"/>`;
  const art = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${F(V.fg, .9)}/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" ${F(V.b, .45)}/><circle cx="${x + w * .65}" cy="${y + h * .4}" r="${h * .16}" ${F(V.a)}/><path ${F(V.fg, .55)} d="M${x + 10} ${y + h - 10}V${y + h * .7}q${w * .25}-${h * .18} ${w * .5} 0t${w * .5 - 20} 0V${y + h - 10}Z"/>`;
  g += art(60, 110, 150, 190) + art(600, 90, 140, 110) + art(610, 230, 130, 90);
  g += `<path ${ST(V.fg, 7)} d="M400 260L310 500M400 260L490 500M400 260V500"/>`;
  g += `<rect x="296" y="160" width="208" height="160" ${F(V.sf)}/><rect x="306" y="170" width="188" height="140" ${F(V.a, .25)}/><circle cx="440" cy="215" r="24" ${F(V.a)}/><path ${F(V.b, .8)} d="M306 310V270q47-20 94 0t94 0V310Z"/><path ${ST(V.sf, 2.5)} d="M320 290q20-8 40 0M380 296q20-8 40 0"/>`;
  g += `<rect x="290" y="318" width="220" height="10" ${F(V.fg)}/>`;
  g += plant(700, 500, .9);
  return g;
};
S.campus = () => {
  let g = backdrop(false) + floor(470, .55);
  g += `<path ${F(V.a)} d="M210 200L400 110 590 200Z"/><rect x="220" y="200" width="360" height="20" ${F(V.fg, .8)}/>`;
  for (let i = 0; i < 6; i++) g += `<rect x="${240 + i * 62}" y="220" width="24" height="200" ${F(V.sf)}/>`;
  g += `<rect x="220" y="420" width="360" height="16" ${F(V.fg, .7)}/><rect x="200" y="436" width="400" height="16" ${F(V.fg, .55)}/><rect x="180" y="452" width="440" height="18" ${F(V.fg, .4)}/>`;
  g += `<path ${ST(V.fg, 5)} d="M400 110V40"/><path ${F(V.b)} d="M402 42q30-12 60 0t50 0v40q-25 12-50 0t-60 0Z"/><path ${F(V.a)} d="M402 56q30-12 60 0t50 0v12q-25 12-50 0t-60 0Z"/>`;
  [[90, 330, 70], [720, 340, 60]].forEach(([x, y, r]) => g += `<rect x="${x - 8}" y="${y}" width="16" height="${470 - y}" ${F("#6B4A2E")}/><circle cx="${x}" cy="${y - 20}" r="${r}" ${F(V.b, .85)}/><circle cx="${x + 30}" cy="${y + 10}" r="${r * .6}" ${F(V.b)}/>`);
  g += person({ x: 300, y: 560, h: 200, kind: "f", hat: "hair", skin: SK[2], top: V.a, trim: V.b, hand: `<rect x="320" y="440" width="26" height="34" rx="3" ${F(V.b)}/>` });
  g += person({ x: 400, y: 565, h: 215, kind: "m", hat: null, skin: SK[1], top: V.b, trim: V.a, hand: `<rect x="350" y="430" width="22" height="50" rx="6" ${F(V.a)}/>` });
  g += person({ x: 500, y: 560, h: 205, kind: "f", hat: "gele", skin: SK[0], top: V.a, trim: V.b });
  return g + confetti(10, 5);
};
S.christmas = () => {
  let g = `<rect width="800" height="600" ${F(V.base)}/>` + stars(20, 13, "#F5C451");
  g += `<rect y="490" width="800" height="110" ${F(V.sf, .9)}/><path ${F(V.sf)} d="M0 495q100-24 200 0t200 0 200 0 200 0V520H0Z"/>`;
  g += `<rect x="370" y="440" width="60" height="60" ${F("#6B4A2E")}/>`;
  [[250, 440, 550, 300], [280, 330, 520, 200], [315, 230, 485, 120]].forEach(([x1, y1, x2, y2]) => g += `<path ${F(V.b)} d="M${x1} ${y1}L400 ${y2}L${x2} ${y1}Q400 ${y1 + 20} ${x1} ${y1}Z"/>`);
  g += `<path ${ST("#F5C451", 4)} d="M290 420Q400 380 520 410M310 310Q400 280 500 300M340 215Q400 196 465 210"/>`;
  [[300, 425, V.a], [370, 400, V.sf], [450, 405, V.a], [505, 420, "#F5C451"], [330, 315, "#F5C451"], [420, 300, V.a], [480, 310, V.sf], [370, 225, V.a], [440, 220, "#F5C451"]].forEach(([x, y, c]) => g += `<circle cx="${x}" cy="${y}" r="12" ${F(c)}/><circle cx="${x - 4}" cy="${y - 4}" r="3" ${F("#fff", .5)}/>`);
  g += `<path ${F("#F5C451")} d="M400 76l9 20 22 2-17 14 5 22-19-12-19 12 5-22-17-14 22-2Z"/>`;
  g += `<path ${ST("#7A5A3A", 16)} d="M660 500Q650 380 680 250"/>`;
  for (let i = 0; i < 7; i++) g += leaf(680, 250, 110, -170 + i * 30, V.b, .9);
  for (let i = 0; i < 9; i++) g += `<circle cx="${n(661 + i * 2.2)}" cy="${n(490 - i * 27)}" r="5" ${F(i % 3 === 0 ? V.a : i % 3 === 1 ? "#F5C451" : V.sf)}/>`;
  [[150, 500, 90, 70, V.a, "#F5C451"], [230, 500, 60, 50, "#F5C451", V.a], [540, 500, 70, 60, V.sf, V.a], [470, 500, 50, 40, V.a, V.sf]].forEach(([x, y, w, h, c, r]) =>
    g += `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="5" ${F(c)}/><rect x="${x - 6}" y="${y - h}" width="12" height="${h}" ${F(r)}/><path ${ST(r, 5)} d="M${x} ${y - h}c-18-20-28 4 0 0c28 4 18-20 0 0"/>`);
  for (let i = 0; i < 40; i++) g += `<circle cx="${(i * 97) % 800}" cy="${(i * 53) % 480}" r="${2 + (i % 3)}" ${F("#fff", .55)}/>`;
  return g;
};
const heart = (x, y, s, c, o = 1) => `<path ${F(c, o)} transform="translate(${x} ${y}) scale(${s})" d="M0 12C-14 2-24-6-24-16c0-8 6-14 13-14 5 0 9 3 11 7 2-4 6-7 11-7 7 0 13 6 13 14 0 10-10 18-24 28Z"/>`;
S.valentine = () => {
  let g = backdrop() + floor(500, .5);
  g += `<path ${ST(V.fg, 2, .45)} d="M0 40Q400 120 800 40"/>`;
  for (let i = 1; i < 16; i++) { const t = i / 16, x = 800 * t, y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 120 + t * t * 40; g += `<circle cx="${n(x)}" cy="${n(y + 8)}" r="6" ${F(i % 2 ? "#FFE3A1" : V.sf)}/>`; }
  [[120, 150, 1.8, V.a], [680, 160, 2.2, V.b], [600, 90, 1.1, V.a], [200, 260, 1, V.b]].forEach(([x, y, s, c]) => g += heart(x, y, s, c, .9) + `<path ${ST(V.fg, 1.4, .4)} d="M${x} ${y + 12 * s}q-10 60 6 140"/>`);
  g += `<path ${F(V.fg, .55)} d="M175 300h30v170h-8V340h-14v130h-8Z"/><path ${F(V.fg, .55)} d="M595 300h30v170h-8V340h-14v130h-8Z"/>`;
  g += `<ellipse cx="400" cy="380" rx="200" ry="34" ${F(V.sf)}/><path ${F(V.sf)} d="M200 380h400l-30 120H230Z"/><path ${F(V.a, .25)} d="M200 380h400l-30 120H230Z"/><ellipse cx="400" cy="380" rx="200" ry="34" ${ST(V.l, 2)}/>`;
  g += `<rect x="388" y="300" width="24" height="70" rx="4" ${F("#F4EEE2")}/><path ${F("#FFB85C")} d="M400 260c12 16 13 30 0 40-13-10-12-24 0-40Z"/>`;
  const wine = (x, r) => `<g transform="translate(${x} 372) rotate(${r})"><path ${F(V.fg, .15)} d="M-22-90h44q0 50-22 56-22-6-22-56Z"/><path ${F(V.a)} d="M-19-62h38q-4 26-19 28-15-2-19-28Z"/><path ${ST(V.fg, 3, .8)} d="M-22-90h44q0 50-22 56-22-6-22-56ZM0-34V0M-16 0h32"/></g>`;
  g += wine(320, -8) + wine(480, 8);
  g += `<path ${ST(V.b, 4)} d="M440 372q-6-40 10-70"/><path ${F(V.a)} d="M450 300c-14-4-16-20-4-26 6-8 20-4 20 6 10 4 6 18-4 20-2 2-8 2-12 0Z"/>` + leaf(446, 330, 22, -40, V.b);
  g += sparkle(300, 220, 10, V.b) + sparkle(520, 230, 8, V.a);
  return g;
};
S.mother = () => {
  let g = backdrop() + floor(520, .5);
  for (let i = 0; i < 6; i++) g += heart(90 + i * 125, 70 + (i % 2) * 50, .9 + (i % 3) * .3, i % 2 ? V.a : V.b, .55);
  g += plant(120, 520, 1) + plant(690, 520, 1);
  g += person({ x: 360, y: 515, h: 330, kind: "f", hat: "gele", skin: SK[1], top: V.a, trim: V.b });
  g += person({ x: 470, y: 515, h: 170, kind: "c", hat: "hair", skin: SK[2], top: V.b, trim: V.a });
  g += `<circle ${F(SK[2])} cx="425" cy="395" r="9"/>`;
  g += `<path ${ST(V.b, 4)} d="M330 330l-30 40M338 332l-22 52M346 330l-10 54"/>`;
  [[296, 316, V.sf], [318, 300, "#F2C4CE"], [342, 306, V.sf], [284, 336, "#F2C4CE"], [356, 318, "#FFE3A1"]].forEach(([x, y, c]) => g += `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="7" ry="13" cy="-9" transform="rotate(${a})" ${F(c)}/>`).join("")}<circle r="5" ${F("#E8B04A")}/></g>`);
  g += leaf(300, 360, 34, -150, V.b) + leaf(340, 350, 30, -20, V.b);
  g += sparkle(230, 200, 12, V.a) + sparkle(560, 220, 9, V.b);
  return g;
};
S.national = () => {
  let g = backdrop(false) + `<circle cx="620" cy="140" r="70" ${F("#FCD116", .5)}/>` + floor(500, .5);
  g += `<path ${ST(V.fg, 2, .5)} d="M0 30Q400 100 800 30"/>`;
  const C3 = ["#007A5E", "#CE1126", "#FCD116"];
  for (let i = 0; i < 13; i++) { const t = (i + .5) / 13, x = 800 * t, y = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 100 + t * t * 30; g += `<path ${F(C3[i % 3])} d="M${n(x - 22)} ${n(y)}H${n(x + 22)}L${n(x)} ${n(y + 44)}Z"/>`; }
  g += `<path ${ST(V.fg, 7)} d="M230 500V120"/><circle cx="230" cy="114" r="8" ${F("#FCD116")}/>`;
  g += `<path ${F("#007A5E")} d="M234 130q60-18 92 0v150q-32-18-92 0Z"/><path ${F("#CE1126")} d="M326 130q46 18 92 0v150q-46 18-92 0Z"/><path ${F("#FCD116")} d="M418 130q46-18 92 0v150q-46-18-92 0Z"/>`;
  g += `<path ${F("#FCD116")} d="M372 175l7 16 18 2-13 12 4 17-16-9-16 9 4-17-13-12 18-2Z"/>`;
  const marcher = (x, h, top, skin) => person({ x, y: 540, h, kind: "m", skin, top, trim: "#FCD116" }) + `<path ${ST(V.fg, 3)} d="M${x + h * .16} ${540 - h * .5}V${540 - h * 1.05}"/><path ${F("#007A5E")} d="M${x + h * .16} ${540 - h * 1.05}h12v20h-12Z"/><path ${F("#CE1126")} d="M${x + h * .16 + 12} ${540 - h * 1.05}h12v20h-12Z"/><path ${F("#FCD116")} d="M${x + h * .16 + 24} ${540 - h * 1.05}h12v20h-12Z"/>`;
  g += marcher(470, 190, V.a, SK[1]) + marcher(560, 205, V.b, SK[0]) + marcher(650, 195, V.a, SK[2]) + marcher(740, 210, V.b, SK[1]);
  return g + confetti(14, 9);
};
S.eid = () => {
  let g = `<rect width="800" height="600" ${F(V.base)}/>` + stars(26, 19, "#F5C451");
  g += `<circle cx="600" cy="130" r="60" ${F("#F5C451")}/><circle cx="626" cy="112" r="54" ${F(V.base)}/>` + sparkle(530, 120, 12, "#F5C451");
  g += `<path ${F(V.fg, .2)} d="M120 470V330h40v-60a60 60 0 0 1 120 0v60h40v140ZM300 470V260a100 100 0 0 1 200 0V470ZM520 470V330h40v-60a60 60 0 0 1 120 0v60h40v140Z"/>`;
  [[90, 470, 170], [710, 470, 170]].forEach(([x, y, h]) => g += `<rect x="${x - 12}" y="${y - h}" width="24" height="${h}" ${F(V.fg, .2)}/><path ${F(V.fg, .2)} d="M${x - 16} ${y - h}l16-34 16 34Z"/>`);
  g += `<rect y="470" width="800" height="130" ${F(V.sf, .7)}/>`;
  const lantern = (x, len, s) => `<path ${ST("#F5C451", 1.5, .7)} d="M${x} 0V${len}"/><g transform="translate(${x} ${len}) scale(${s})"><circle r="44" cy="34" ${F("#F5C451", .15)}/><path ${F("#F5C451")} d="M-10 0h20l4 8h-28Z"/><path ${F(V.a)} d="M-18 8h36l8 22-8 22h-36l-8-22Z"/><path ${F("#FFE6A8", .9)} d="M-10 14h20l5 16-5 16h-20l-5-16Z"/><path ${F("#F5C451")} d="M-14 52h28l-6 10h-16Z"/></g>`;
  g += lantern(170, 120, 1.1) + lantern(270, 190, .8) + lantern(530, 170, .9) + lantern(650, 230, 1.15);
  g += person({ x: 330, y: 560, h: 150, kind: "f", hat: "gele", skin: SK[1], top: V.a, trim: "#F5C451" }) + person({ x: 410, y: 560, h: 165, kind: "m", hat: "kufi", skin: SK[0], top: V.sf, trim: "#F5C451" }) + person({ x: 480, y: 562, h: 95, kind: "c", hat: "hair", skin: SK[2], top: V.b, trim: "#F5C451" });
  return g;
};
S.easter = () => {
  let g = `<rect width="800" height="600" ${F(V.bg)}/><circle cx="400" cy="330" r="200" ${F("#FFD27A", .55)}/><circle cx="400" cy="330" r="290" ${F("#FFD27A", .18)}/>`;
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i + .5) * Math.PI / 9; g += `<path ${ST("#FFD27A", 6, .5)} d="M${n(400 + Math.cos(a) * 220)} ${n(330 + Math.sin(a) * 220)}L${n(400 + Math.cos(a) * 300)} ${n(330 + Math.sin(a) * 300)}"/>`; }
  g += `<path ${F(V.b)} d="M0 380Q200 300 400 350T800 330V600H0Z"/><path ${F(V.b, .7)} d="M0 440Q260 390 520 430T800 420V600H0Z" style="fill:var(--accent-2);opacity:.7;filter:brightness(.85)"/>`;
  g += `<path ${ST(V.fg, 9)} d="M400 350V220M370 255H430"/><path ${ST(V.fg, 6, .7)} d="M330 360V280M310 300H350M470 360V280M450 300H490"/>`;
  g += `<path ${F(V.a)} d="M560 560h150l-14 -60h-122Z"/><path ${ST(V.a, 6)} d="M574 500q61-70 122 0"/>`;
  [[590, 494, V.sf], [622, 488, "#F2C4CE"], [654, 492, "#FFE3A1"], [684, 496, V.b]].forEach(([x, y, c], i) => g += `<ellipse cx="${x}" cy="${y}" rx="16" ry="22" ${F(c)}/><path ${ST(i % 2 ? V.a : V.fg, 2.5, .6)} d="M${x - 14} ${y - 4}q7 6 14 0t14 0"/>`);
  const lily = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="8" ry="24" cy="-20" transform="rotate(${a})" ${F("#FFFFFF")}/>`).join("")}<circle r="6" ${F("#E8C77D")}/></g>`;
  g += `<path ${ST("#4F7A3A", 4)} d="M130 560Q140 470 120 410M170 560Q180 460 210 400"/>` + lily(120, 400, 1) + lily(212, 392, .9) + leaf(150, 500, 50, -130, "#4F7A3A") + leaf(170, 520, 46, -40, "#4F7A3A");
  return g;
};
S.tribute = (id) => {
  let g = `<defs><pattern id="pg${id}" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" ${F(V.a)}/><circle cx="15" cy="15" r="7" ${F(V.b)}/><circle cx="15" cy="15" r="3" ${F(V.sf)}/><path ${ST(V.sf, 2, .6)} d="M0 0l30 30M30 0L0 30"/></pattern></defs>`;
  g += backdrop() + floor(510, .5);
  g += `<rect x="70" y="120" width="170" height="210" rx="6" ${F(V.sf)}/><rect x="84" y="134" width="142" height="182" ${F(V.bg)}/><rect x="70" y="120" width="170" height="210" rx="6" ${ST(V.a, 4)}/>`;
  g += `<circle cx="155" cy="208" r="34" ${F(V.m, .55)}/><path ${F(V.m, .55)} d="M95 316c6-50 34-66 60-66s54 16 60 66Z"/>`;
  g += `<path ${F(V.fg, .85)} d="M240 120l-34 0 34 34Z"/><path ${ST(V.fg, 5)} d="M120 330L95 510M190 330L215 510M155 330V510"/>`;
  g += `<g transform="translate(150 360)">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="10" ry="22" cy="-16" transform="rotate(${a})" ${F("#F7F4EE")}/>`).join("")}<circle r="8" ${F(V.a)}/></g>`;
  const feather = (x, y, c) => `<path ${F(c)} d="M${x} ${y}c-14-30-6-60 6-74 6 20 8 50-6 74Z"/>`;
  const dancer = (x, h, skin, hat = true) => person({ x, y: 520, h, kind: "m", skin, top: `url(#pg${id})`, trim: V.sf }) + (hat ? feather(x - 16, 520 - h + 6, V.b) + feather(x, 520 - h - 4, V.a) + feather(x + 16, 520 - h + 6, V.b) : "") + `<path ${ST(skin, 8)} d="M${x + h * .15} ${520 - h * .62}l26-46M${x - h * .15} ${520 - h * .62}l-26-46"/>`;
  g += dancer(390, 250, SK[1]) + dancer(510, 270, SK[0]) + person({ x: 620, y: 520, h: 240, kind: "f", hat: "gele", skin: SK[2], top: `url(#pg${id})`, trim: V.sf });
  g += `<path ${F("#6B4A2E")} d="M690 520l14-110h56l14 110Z"/><ellipse cx="732" cy="410" rx="30" ry="9" ${F("#E8D2A8")}/><path ${ST("#3A2A1A", 3)} d="M708 440l50 30M708 470l50-30"/>`;
  g += sparkle(320, 140, 12) + sparkle(600, 110, 10, V.b) + sparkle(700, 220, 8);
  return g + confetti(10, 41);
};
S.babyshower = () => {
  let g = backdrop() + floor(500, .55);
  g += `<path ${ST(V.fg, 2.5, .55)} d="M30 70Q400 150 770 70"/>`;
  const onesie = (x, y, c, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path ${F(c)} d="M-30 0h18q12 10 24 0h18l22 22-16 16-12-10v54h-12l-6 10h-24l-6-10h-12V28l-12 10-16-16Z"/><circle cx="-12" cy="0" r="4" ${F(V.fg, .5)}/><circle cx="12" cy="0" r="4" ${F(V.fg, .5)}/><path ${ST(V.fg, 2, .6)} d="M-4 -4v10M4 -4v10"/></g>`;
  g += onesie(170, 96, V.a, -6) + onesie(330, 118, V.sf, 2) + onesie(470, 120, V.b, -2) + onesie(630, 98, V.a, 6);
  [[105, 90, V.b], [255, 112, "#FFE3A1"], [550, 116, "#FFE3A1"], [705, 86, V.b]].forEach(([x, y, c]) => g += `<path ${F(c)} d="M${x - 9} ${y}h18v22q-2 12-12 10h-8q-6-2-6-8Z"/>`);
  [[110, 250, V.b], [175, 300, V.a], [650, 260, V.a], [720, 310, V.b]].forEach(([x, y, c]) => g += `<path ${ST(V.fg, 1.5, .45)} d="M${x} ${y + 44}q-10 60 6 160"/><ellipse cx="${x}" cy="${y}" rx="34" ry="44" ${F(c)}/><ellipse cx="${x - 11}" cy="${y - 15}" rx="7" ry="12" ${F("#fff", .35)}/>`);
  g += `<rect x="230" y="420" width="340" height="16" rx="6" ${F(V.sf)}/><path ${F(V.sf, .7)} d="M240 436h320l-24 64H264Z"/>`;
  g += `<rect x="330" y="330" width="140" height="90" rx="12" ${F(V.a)}/><rect x="355" y="280" width="90" height="56" rx="10" ${F(V.b)}/><path ${F(V.sf)} d="M330 350q17 16 35 0t35 0 35 0 35 0V342H330Z"/>`;
  g += `<circle cx="400" cy="262" r="14" ${F(V.sf)}/><path ${F("#FFE3A1")} d="M386 262a14 14 0 0 1 28 0Z"/>`;
  g += `<g transform="translate(520 420)"><rect x="-16" y="-70" width="32" height="70" rx="10" ${F(V.sf)}/><rect x="-16" y="-40" width="32" height="40" rx="8" ${F("#FFF6E6")}/><path ${F(V.a)} d="M-12 -70h24l-4-14h-16Z"/><rect x="-5" y="-96" width="10" height="14" rx="5" ${F("#F2D2A8")}/><path ${ST(V.fg, 1.5, .4)} d="M-8 -55h6M-8 -45h6M-8 -35h6"/></g>`;
  [[285, 420, 54, 46, V.b, V.a], [190, 500, 70, 60, V.a, V.sf], [620, 500, 64, 54, V.sf, V.a]].forEach(([x, y, w, h, c, r]) =>
    g += `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="5" ${F(c)}/><rect x="${x - 5}" y="${y - h}" width="10" height="${h}" ${F(r)}/><path ${ST(r, 4)} d="M${x} ${y - h}c-15-17-24 4 0 0c24 4 15-17 0 0"/>`);
  return g + sparkle(400, 200, 12, V.a) + sparkle(260, 200, 8, V.b);
};
const ALIAS = { wedding: "couple" };

export const ILLUS = {
  list: Object.keys(S),
  svg(name, crop, extra = "") {
    const f = S[ALIAS[name] || name] || S.city, id = ++uid;
    const vb = crop || [0, 0, 800, 600];
    return `<svg viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" ${extra}>${f(id)}</svg>`;
  },
  related: {
    couple: ["couple", "party", "cake", "city", "family", "church"], dot: ["dot", "family", "party", "couple", "city", "cake"],
    cake: ["cake", "party", "family", "stage", "couple", "city"], party: ["party", "city", "stage", "cake", "gallery", "couple"],
    cradle: ["cradle", "family", "church", "cake", "couple", "city"], stadium: ["stadium", "city", "party", "stage", "family", "conference"],
    stage: ["stage", "party", "city", "stadium", "gallery", "conference"], conference: ["conference", "city", "campus", "stage", "party", "gallery"],
    city: ["city", "conference", "party", "stage", "family", "campus"], gallery: ["gallery", "city", "party", "stage", "conference", "family"],
    church: ["church", "family", "couple", "candle", "cradle", "city"], campus: ["campus", "graduation", "stage", "stadium", "party", "city"],
    graduation: ["graduation", "campus", "family", "party", "stage", "city"], candle: ["candle", "family", "church", "city", "cradle", "couple"],
    family: ["family", "cake", "city", "dot", "party", "church"], christmas: ["christmas", "family", "stage", "cake", "party", "cradle"],
    valentine: ["valentine", "party", "couple", "city", "stage", "cake"], mother: ["mother", "family", "cake", "cradle", "church", "couple"],
    national: ["national", "city", "stadium", "stage", "family", "party"], eid: ["eid", "family", "cake", "city", "mother", "cradle"],
    easter: ["easter", "church", "family", "cradle", "cake", "candle"],
    tribute: ["tribute", "family", "candle", "dot", "party", "church"], babyshower: ["babyshower", "cradle", "cake", "family", "mother", "party"]
  },
  tile(name, i) { const rel = this.related[name] || [name]; return this.svg(rel[i % rel.length], i < rel.length ? null : this.crops[1 + (i % (this.crops.length - 1))]); },
  crops: [[0, 0, 800, 600], [170, 70, 460, 345], [0, 170, 440, 330], [360, 170, 440, 330], [110, 0, 580, 435], [250, 230, 380, 285], [40, 60, 520, 390], [300, 40, 480, 360]]
};
