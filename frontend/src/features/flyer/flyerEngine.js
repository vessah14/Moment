// GÉNÉRÉ depuis le prototype « modeles/flyer.html » (script). Studio « Flyer d'honneur ».
// Dessin sur canvas, détourage (fichiers /vendor optionnels), export image et vidéo.
// initFlyerStudio(root) monte le studio dans root (structure FLYER_MARKUP) et renvoie la fonction de nettoyage.
/* oxlint-disable */
import QRCode from 'qrcode'
import { mediaUrl } from '../../api/client'
import { TBFFLY } from './flyerCatalog'

export function initFlyerStudio(root, { vendorBase = "/vendor/" } = {}) {
const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
const cleanups = [];
const onDoc = (type, fn, opts) => { document.addEventListener(type, fn, opts); cleanups.push(() => document.removeEventListener(type, fn, opts)); };

/* ---------------- Contenus ---------------- */
const ICO = {
  gift: '<path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  up: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  rings: '<circle cx="9" cy="14" r="6"/><circle cx="15" cy="10" r="6"/>',
  flame: '<path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  baby: '<circle cx="12" cy="8" r="4"/><path d="M6 21c0-4 3-7 6-7s6 3 6 7M10 8h.01M14 8h.01"/>',
  dove: '<path d="M3 13c4 0 6-2 8-6 1 3 3 5 7 5l3-2-1 4c-1 4-5 7-10 7-4 0-7-3-7-8z"/>',
  heart: '<path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/>',
  tree: '<path d="M12 3 6 11h3l-4 6h14l-4-6h3zM12 17v4"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  flag: '<path d="M5 21V4M5 4h13l-2 4 2 4H5"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
};
const { OCC, W, TYPES, TLAB } = TBFFLY;
const REL = [["ami", "Ami·e", "{p}"], ["maman", "Maman", "Maman"], ["papa", "Papa", "Papa"], ["soeur", "Sœur", "Ma sœur"], ["frere", "Frère", "Mon frère"],
  ["amour", "Chéri·e", "Mon amour"], ["enfant", "Enfant", "Mon trésor"], ["tonton", "Tonton", "Tonton"], ["tata", "Tata", "Tata"], ["collegue", "Collègue", "{p}"], ["patron", "Supérieur·e", "{p}"]];
const TON = { affectueux: "Affectueux", drole: "Drôle", spirituel: "Spirituel", formel: "Formel" };
const FORM = {
  affectueux: ["Avec tout mon amour", "Je t'aime", "Bisous"], drole: ["Ton fan n°1", "Ta personne préférée", "Signé"],
  spirituel: ["Que Dieu te bénisse", "Dans la prière", "Avec amour"], formel: ["Avec nos félicitations", "Bien cordialement", "Toute l'équipe"],
  mariage: ["Avec toute notre affection", "Félicitations", "Avec amour"], hommage: ["Avec tout notre amour", "Repose en paix", "Ta famille"], compte: ["On vous attend", "À très vite", "Avec joie"]
};
/* Vœux : {A} = l'appellation (Maman, Ma sœur, le prénom…), {n} = l'âge ou les jours. Une phrase avec {n} n'est proposée que si le nombre est rempli. */
/* Styles et couleurs : bg1/bg2 fond, ink texte, acc accent, soft fond secondaire */
const STY = {
  icone: { l: "Icône", pals: [["Bleu royal", "#1D4ED8", "#081436", "#FFFFFF", "#22D3EE"], ["Bordeaux", "#9F1239", "#2A0610", "#FFFFFF", "#F5C451"], ["Émeraude", "#047857", "#021C15", "#FFFFFF", "#FDE047"], ["Noir & or", "#3A3A3A", "#050505", "#FFFFFF", "#E9B949"]] },
  neon: { l: "Néon", pals: [["Bleu", "#1E40AF", "#020617", "#FFFFFF", "#93C5FD"], ["Violet", "#5B21B6", "#0B0418", "#FFFFFF", "#C4B5FD"], ["Rose", "#9D174D", "#1A0610", "#FFFFFF", "#F9A8D4"], ["Vert", "#047857", "#01140E", "#FFFFFF", "#6EE7B7"]] },
  lumiere: { l: "Lumière", pals: [["Ambre", "#3A1F0B", "#050302", "#FFFFFF", "#F59E0B"], ["Feu", "#3B0A0A", "#050202", "#FFFFFF", "#F97316"], ["Bleu nuit", "#0B1A3A", "#020611", "#FFFFFF", "#38BDF8"], ["Or", "#2B2410", "#050403", "#FFFFFF", "#E9B949"]] },
  duo: { l: "Profils", pals: [["Rouge", "#E0362C", "#7A0F0B", "#FFFFFF", "#F5A524"], ["Rose", "#E83E8C", "#6B1240", "#FFFFFF", "#FDE047"], ["Violet", "#8B5CF6", "#3B0D7A", "#FFFFFF", "#F5A524"], ["Orange", "#F97316", "#7C2D12", "#FFFFFF", "#FDE047"]] },
  reve: { l: "Rêve", pals: [["Rose", "#FBCFE8", "#C4B5FD", "#1F2937", "#2563EB"], ["Ciel", "#BAE6FD", "#FBCFE8", "#1F2937", "#DB2777"], ["Menthe", "#BBF7D0", "#BAE6FD", "#1F2937", "#7C3AED"]] },
  tournesol: { l: "Tournesol", pals: [["Nuit", "#0F3B3A", "#03100F", "#FFFFFF", "#FACC15"], ["Bleu", "#0B2545", "#020812", "#FFFFFF", "#FACC15"], ["Prune", "#3B0B2E", "#0E020B", "#FFFFFF", "#FDE047"]] },
  event: { l: "Affiche événement", pals: [["Néon", "#7C3AED", "#0B0614", "#FFFFFF", "#22D3EE"], ["Coucher de soleil", "#F97316", "#140A05", "#FFFFFF", "#FACC15"], ["Rouge", "#DC2626", "#0A0A0A", "#FFFFFF", "#F5C451"], ["Stade", "#16A34A", "#04140A", "#FFFFFF", "#FDE047"]] },
  pro: { l: "Pro", pals: [["Bleu", "#F6F8FC", "#1E3A8A", "#0F172A", "#F59E0B"], ["Vert", "#F5FAF7", "#065F46", "#0F172A", "#F59E0B"], ["Violet", "#F7F5FF", "#5B21B6", "#111827", "#22D3EE"], ["Noir & or", "#F7F7F5", "#111111", "#111111", "#C99A2E"]] },
  star: { l: "Star", pals: [["Or & noir", "#2A1E08", "#050403", "#FFF6E0", "#E9B949"], ["Rose gold", "#3A1426", "#0E0409", "#FFF0F3", "#F2B39B"], ["Bleu nuit", "#0F1E4A", "#03081A", "#EEF3FF", "#E9B949"], ["Argent", "#1E1E26", "#050507", "#F4F4F8", "#D7DCE6"]] },
  eclat: { l: "Éclat", pals: [["Corail", "#FF7A3D", "#E2337E", "#FFFFFF", "#FFE08A"], ["Violet", "#6C4BF4", "#E2337E", "#FFFFFF", "#FFD36B"], ["Océan", "#0E9BD8", "#4F46E5", "#FFFFFF", "#FFE08A"], ["Terracotta", "#D9774B", "#8C3B2E", "#FFFFFF", "#FFE2B8"]] },
  souvenirs: { l: "Souvenirs", pals: [["Kraft", "#F6EEDD", "#D9C29A", "#2B2320", "#E85D75"], ["Pastel", "#FDF6F0", "#F3CFE0", "#3A2E4F", "#7C6CF2"], ["Sauge", "#F3F4EC", "#CCD8BF", "#2C3328", "#E07A3F"]] },
  wax: { l: "Wax", pals: [["Terracotta", "#F6E6D4", "#C4572F", "#1E2A5A", "#E3A23B"], ["Vert & or", "#F2EEDC", "#1F6B45", "#1B1B1B", "#E0A526"], ["Rouge & noir", "#F7E9DC", "#B3261E", "#1A1A1A", "#F0B429"], ["Indigo", "#EEF0F7", "#1E3A8A", "#111827", "#F59E0B"]] },
  prestige: { l: "Prestige", pals: [["Noir & or", "#17130A", "#060504", "#F8EED2", "#D9B45A"], ["Bordeaux", "#3A0D16", "#14040A", "#F8EED2", "#D9B45A"], ["Émeraude", "#0C2A20", "#04120C", "#F2EBD7", "#D9B45A"], ["Marine", "#0D1A33", "#050A14", "#EEF1F8", "#C9D2E3"]] },
  pop: { l: "Pop", pals: [["Soleil", "#FFC93C", "#FF6B6B", "#1D1340", "#4D96FF"], ["Bonbon", "#FF8FC7", "#7B61FF", "#1D1340", "#FFE15C"], ["Lagon", "#3DDBD9", "#FF7A59", "#10213A", "#FFE15C"]] },
  elegance: { l: "Élégance", pals: [["Rose poudré", "#FBF4EF", "#F1DCD3", "#3A2A2E", "#B5576B"], ["Sauge", "#F5F6EF", "#DCE3D2", "#2C3328", "#6B8A5E"], ["Crème & brique", "#F4F1EA", "#E6DCCB", "#3B2F28", "#A4502F"], ["Bleu nuit", "#F3F5FA", "#D9E0EE", "#1E2740", "#3B5BA9"]] },
  affiche: { l: "Affiche", pals: [["Or", "#111111", "#000000", "#FFFFFF", "#F5C451"], ["Rouge", "#111111", "#000000", "#FFFFFF", "#FF4D4D"], ["Cyan", "#111111", "#000000", "#FFFFFF", "#33D6FF"]] },
  sobre: { l: "Sobre", pals: [["Blanc", "#FFFFFF", "#F2F2F0", "#1C1C1C", "#6F6F6F"], ["Gris", "#E9E9E6", "#D8D8D4", "#1C1C1C", "#4F4F4F"], ["Noir", "#141414", "#050505", "#F2F2F0", "#BDBDBD"]] }
};

/* ---------------- État ---------------- */
const KEY = "tbfm-flyer";
let st = { tags: "", occ: "anniversaire", etype: "", style: "eclat", pal: 0, nom: "", num: "", sous: "", quand: "", lieu: "", prix: "", lien: "", rel: "ami", ton: "affectueux", voeu: "", idea: 0, sig: "", form: 0, fmt: "statut", bw: false, film: false, cutOn: false, decor: "aucun", hide: {}, items: [], music: true, edited: false };
try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && OCC[s.occ]) st = { ...st, ...s }; } catch {}
const qs = new URLSearchParams(location.search);
// Préremplissage depuis une page d'événement : ?occ=anniversaire&nom=Manuella&num=30&sous=…&ev=Les%2030%20ans…&cover=…
if (qs.get("occ") && OCC[qs.get("occ")]) { st.occ = qs.get("occ"); st.style = OCC[st.occ].styles[0]; st.pal = OCC[st.occ].pal || 0; st.edited = false; }
["nom", "num", "sous", "quand", "lieu", "prix", "lien"].forEach(k => { if (qs.get(k)) st[k] = qs.get(k).slice(0, k === "num" ? 4 : k === "lien" ? 120 : 60); });
if (qs.get("type") && TYPES[qs.get("type")]) st.etype = qs.get("type");
let photo = null, pz = 1, px = 0, py = 0; // photo, zoom, décalage (en fraction)
let extras = [], cut = null, logo = null, xcuts = []; // xcuts : photos du collage détourées // photos du collage, personne détourée (canvas)
const save = () => { try { const { voeu, ...rest } = st; localStorage.setItem(KEY, JSON.stringify({ ...rest, voeu: st.edited ? voeu : "" })); } catch {} };

/* ---------------- Formulaire ---------------- */
const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;
$("#etype").insertAdjacentHTML("beforeend", TLAB.map(([, gl, L]) => `<optgroup label="${gl}">${L.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</optgroup>`).join(""));
const occList = () => st.etype && TYPES[st.etype] ? TYPES[st.etype] : Object.keys(OCC);
function renderOcc() {
  const L = occList(); if (!L.includes(st.occ)) { st.occ = L[0]; st.style = OCC[st.occ].styles[0]; st.pal = OCC[st.occ].pal || 0; st.edited = false; }
  ["v", "a"].forEach(g => { const ks = L.filter(k => OCC[k].g === g); $(`#occ-${g}`).innerHTML = ks.map(k => `<input type="radio" name="occ" id="o-${k}" value="${k}" ${k === st.occ ? "checked" : ""}><label for="o-${k}">${svg(OCC[k].i)}${OCC[k].l}</label>`).join(""); $(`#occ-${g}-l`).hidden = !ks.length; });
  $("#etype").value = st.etype || "";
}
const isMourn = S => ["hommage", "avis"].includes(S.occ);
$("#rel").innerHTML = REL.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
const tones = () => OCC[st.occ].tones || Object.keys(TON);
const formList = S => OCC[S.occ].forms || FORM[S.ton] || FORM.affectueux;
const appel = () => { const r = REL.find(x => x[0] === st.rel) || REL[0]; const p = (st.nom || "").trim().split(/\s+/)[0] || ""; return r[2].replace("{p}", p) || p; };
function ideas() {
  const w = W[st.occ] || {}, bank = w._ || w[st.ton] || w.affectueux || [];
  const hasN = String(st.num).trim() !== "" && !(OCC[st.occ].nm === "jours" && +st.num === 0);
  return bank.filter(t => hasN || !t.includes("{n}"));
}
function fillWish() {
  const L = ideas(); const t = L[st.idea % L.length] || "";
  const a = appel();
  let s = t.replace(/\{n\}/g, String(st.num).trim()).replace(/\{A\}/g, a || "");
  s = s.replace(/,\s*([!.])/g, "$1").replace(/^,\s*/, "").replace(/\s+([!?])/g, " $1").replace(/\s{2,}/g, " ").trim();
  if (s) s = s[0].toUpperCase() + s.slice(1);
  st.voeu = s; $("#voeu").value = s; count();
}
function count() { const n = $("#voeu").value.length; const c = $("#cnt"); c.textContent = `${n} / 220`; c.classList.toggle("over", n > 220); }
function syncForm() {
  renderOcc(); const o = OCC[st.occ], ff = o.f;
  $("#nom-l").textContent = ff.nom[0]; $("#nom").placeholder = ff.nom[1]; $("#nom").value = st.nom;
  $("#num-w").hidden = !ff.num; if (ff.num) { $("#num-l").textContent = ff.num[0]; $("#num").placeholder = ff.num[1]; $("#num-s").textContent = ff.num[2]; $("#num").value = st.num; }
  $("#sous-w").hidden = !ff.sous; if (ff.sous) { $("#sous-l").textContent = ff.sous[0]; $("#sous").placeholder = ff.sous[1]; $("#sous-s").textContent = ff.sous[2] || ""; $("#sous").value = st.sous; }
  ["quand", "lieu", "prix"].forEach(k => { $(`#${k}-w`).hidden = !ff[k]; if (ff[k]) { $(`#${k}-l`).textContent = ff[k][0] + (ff[k][2] ? " (facultatif)" : ""); $(`#${k}`).placeholder = ff[k][1]; $(`#${k}`).value = st[k]; } });
  $("#lien-w").hidden = !ff.lien; $("#lien").value = st.lien; $("#tags-w").hidden = o.g !== "v" || isMourn(st); $("#tags").value = st.tags || "";
  $("#ann1").hidden = !ff.quand && !ff.lieu; $("#ann2").hidden = !ff.prix && !ff.lien; $("#lg-l").hidden = o.g !== "a";
  $("#rel-w").hidden = o.rel === false; $("#ton-w").hidden = !!(W[st.occ] || {})._; $("#rel-row").hidden = $("#rel-w").hidden && $("#ton-w").hidden;
  if (!tones().includes(st.ton)) st.ton = tones()[0];
  $("#ton").innerHTML = tones().map(t => `<option value="${t}">${TON[t]}</option>`).join(""); $("#ton").value = st.ton; $("#rel").value = st.rel;
  $("#form").innerHTML = formList(st).map((f, i) => `<option value="${i}">${f || "Sans formule"}</option>`).join(""); $("#form").value = Math.min(st.form, 2);
  $("#sig").value = st.sig;
  if (!o.styles.includes(st.style)) { st.style = o.styles[0]; st.pal = 0; }
  $("#bw-w").hidden = !photo; $("#bw").checked = st.bw; $("#film").checked = st.film; $("#music").checked = st.music !== false;
  renderShow(); renderDecos();
  renderStyles();
  if (!st.edited || !st.voeu) fillWish(); else { $("#voeu").value = st.voeu; count(); }
  $(`#fmt-${st.fmt === "carre" ? "c" : "s"}`).checked = true;
}
function renderStyles() {
  const o = OCC[st.occ];
  $("#styles").innerHTML = o.styles.map(k => `<input type="radio" name="sty" id="s-${k}" value="${k}" ${k === st.style ? "checked" : ""}><label for="s-${k}"><canvas width="216" height="384" aria-hidden="true"></canvas>${STY[k].l}</label>`).join("");
  $("#pals").innerHTML = `<span class="lbl" id="pals-l">Couleurs</span>` + STY[st.style].pals.map((p, i) => `<input type="radio" name="pal" id="p-${i}" value="${i}" ${i === st.pal ? "checked" : ""}><label for="p-${i}" title="${p[0]}" style="background:linear-gradient(135deg,${p[1]},${p[2]} 60%,${p[4]})"><span class="sr">${p[0]}</span></label>`).join("");
  thumbs();
}
let thumbT = 0;
function thumbs() { clearTimeout(thumbT); thumbT = setTimeout(() => { $$("#styles label").forEach(lb => { const k = lb.htmlFor.slice(2), c = lb.querySelector("canvas"); draw(c.getContext("2d"), { ...st, style: k, pal: k === st.style ? st.pal : 0, fmt: "statut" }, 216 / 1080, true); }); }, 120); }

/* ---------------- Dessin ---------------- */
const F = { script: "'Great Vibes', cursive", serif: "'Playfair Display', Georgia, serif", bebas: "'Bebas Neue', Impact, sans-serif", lilita: "'Lilita One', 'Arial Black', sans-serif", cinzel: "Cinzel, Georgia, serif", sans: "Outfit, system-ui, sans-serif", hand: "Caveat, cursive" };
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const rr = (x, X, Y, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h); };
function spaced(x, t, cx, y, sp) { if ("letterSpacing" in x) { x.letterSpacing = sp + "px"; x.fillText(t, cx + (x.textAlign === "center" ? sp / 2 : 0), y); x.letterSpacing = "0px"; } else x.fillText(t, cx, y); }
function wrap(x, t, maxW, maxL) {
  const words = String(t || "").split(/\s+/).filter(Boolean), L = []; let cur = "";
  for (const w of words) { const t2 = cur ? cur + " " + w : w; if (x.measureText(t2).width > maxW && cur) { L.push(cur); cur = w; } else cur = t2; }
  if (cur) L.push(cur);
  if (L.length > maxL) { const k = L.slice(0, maxL); let l = k[maxL - 1] + "…"; while (x.measureText(l).width > maxW && l.length > 2) l = l.slice(0, -2) + "…"; k[maxL - 1] = l; return k; }
  return L;
}
function fitFont(x, t, font, size, maxW, min) { let s = size; x.font = font(s); while (x.measureText(t).width > maxW && s > min) { s -= 2; x.font = font(s); } return s; }
/* Photo recadrée dans une forme (cover + zoom + décalage). */
function photoIn(x, shape, X, Y, w, h, S, small) {
  x.save(); x.beginPath();
  if (shape === "circle") x.arc(X + w / 2, Y + h / 2, w / 2, 0, Math.PI * 2);
  else if (shape === "oval") x.ellipse(X + w / 2, Y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (shape === "arch") { x.moveTo(X, Y + h); x.lineTo(X, Y + w / 2); x.arc(X + w / 2, Y + w / 2, w / 2, Math.PI, 0); x.lineTo(X + w, Y + h); x.closePath(); }
  else x.rect(X, Y, w, h);
  x.clip();
  if (photo) {
    const iw = photo.naturalWidth, ih = photo.naturalHeight, sc = Math.max(w / iw, h / ih) * (small ? 1 : pz), dw = iw * sc, dh = ih * sc;
    const ox = small ? 0 : px * dw, oy = small ? 0 : py * dh;
    x.filter = S.bw ? "grayscale(1) contrast(1.05)" : "none";
    x.drawImage(photo, X + (w - dw) / 2 + ox, Y + (h - dh) / 2 + oy, dw, dh); x.filter = "none";
  } else {
    const p = STY[S.style].pals[S.pal] || STY[S.style].pals[0], g = x.createLinearGradient(X, Y, X + w, Y + h);
    g.addColorStop(0, S.style === "sobre" ? "#BDBDBD" : p[4]); g.addColorStop(1, S.style === "sobre" ? "#8A8A8A" : p[2]); x.fillStyle = g; x.fillRect(X, Y, w, h);
    const ini = (S.nom || "").trim().split(/\s+/).filter(w2 => /[A-Za-zÀ-ÿ]/.test(w2)).slice(0, 2).map(w2 => w2[0].toUpperCase()).join("") || "★";
    x.fillStyle = "rgba(255,255,255,.92)"; x.font = `400 ${Math.min(w, h) * .36}px ${F.serif}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(ini, X + w / 2, Y + h / 2); x.textBaseline = "alphabetic";
  }
  x.restore();
}
const hx = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const mixH = (a, b, t) => "#" + hx(a).map((v, i) => Math.round(v * t + hx(b)[i] * (1 - t)).toString(16).padStart(2, "0")).join("");
const cutActive = S => !!(cut && photo && S.cutOn);
/* Image quelconque en mode « cover » (photos du collage). */
function coverImg(x, img, X, Y, w, h, bw) { const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * sc, dh = img.naturalHeight * sc; x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.filter = bw ? "grayscale(1)" : "none"; x.drawImage(img, X + (w - dw) / 2, Y + (h - dh) / 2, dw, dh); x.restore(); }
/* Personne détourée, posée en bas de la boîte, avec contour « sticker » blanc en option. */
const outCache = new Map();
function outlined(r) {
  const k = r + "|" + cut.width; if (outCache.has(k)) return outCache.get(k);
  const c = document.createElement("canvas"); c.width = cut.width + r * 2; c.height = cut.height + r * 2; const g = c.getContext("2d");
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.drawImage(cut, r + Math.cos(a) * r, r + Math.sin(a) * r); }
  g.globalCompositeOperation = "source-in"; g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
  if (outCache.size > 8) outCache.clear(); outCache.set(k, c); return c;
}
function personDraw(x, X, Y, w, h, S, o = {}) {
  const src = o.src || cut, main = !o.src && !o.small;
  const iw = src.width, ih = src.height, sc = Math.min(w / iw, h / ih) * (main ? pz : 1), dw = iw * sc, dh = ih * sc;
  const dx = X + (w - dw) / 2 + (main ? px * dw : 0), dy = Y + h - dh + (main ? py * dh : 0);
  x.save(); if (o.alpha != null) x.globalAlpha = o.alpha;
  if (o.flip) { x.translate(dx * 2 + dw, 0); x.scale(-1, 1); }
  if (o.shadow !== false) { x.shadowColor = o.glow || "rgba(0,0,0,.45)"; x.shadowBlur = o.glow ? 60 : 40; x.shadowOffsetY = o.glow ? 0 : 18; }
  if (o.outline && !o.src) { const r = Math.max(2, Math.round(o.outline / sc)), oc = outlined(r); x.drawImage(oc, dx - r * sc, dy - r * sc, oc.width * sc, oc.height * sc); x.shadowColor = "transparent"; }
  if (o.fadeB) { // fondu du bas : évite la coupe nette des photos en buste
    const c = document.createElement("canvas"); c.width = Math.max(2, Math.round(dw)); c.height = Math.max(2, Math.round(dh)); const g = c.getContext("2d");
    g.filter = S.bw ? "grayscale(1) contrast(1.05)" : "none"; g.drawImage(src, 0, 0, c.width, c.height); g.filter = "none"; g.globalCompositeOperation = "destination-in";
    const m = g.createLinearGradient(0, 0, 0, c.height); m.addColorStop(0, "#000"); m.addColorStop(1 - o.fadeB, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, c.width, c.height);
    x.drawImage(c, dx, dy, dw, dh); x.restore(); return { dx, dy, dw, dh };
  }
  x.filter = S.bw ? "grayscale(1) contrast(1.05)" : "none"; x.drawImage(src, dx, dy, dw, dh); x.restore();
  return { dx, dy, dw, dh };
}
/* Chiffres en ballons métallisés */
function balloon(x, t, cx, cy, s, acc) {
  x.save(); x.font = `400 ${s}px ${F.lilita}`; const w = x.measureText(t).width;
  const L = document.createElement("canvas"); L.width = Math.ceil(w + s * .4); L.height = Math.ceil(s * 1.3); const g = L.getContext("2d");
  g.font = `400 ${s}px ${F.lilita}`; g.textAlign = "center"; g.lineJoin = "round"; const bx = L.width / 2, by = s * 1.02;
  const gr = g.createLinearGradient(0, by - s * .85, 0, by); gr.addColorStop(0, mixH(acc, "#ffffff", .35)); gr.addColorStop(.45, acc); gr.addColorStop(1, mixH(acc, "#000000", .55));
  g.lineWidth = s * .07; g.strokeStyle = mixH(acc, "#000000", .45); g.strokeText(t, bx, by); g.fillStyle = gr; g.fillText(t, bx, by);
  g.globalCompositeOperation = "source-atop"; const hl = g.createLinearGradient(0, by - s * .8, s * .6, by - s * .2); hl.addColorStop(0, "rgba(255,255,255,.75)"); hl.addColorStop(.35, "rgba(255,255,255,.12)"); hl.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = hl; g.fillRect(0, 0, L.width, L.height);
  x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 2.5; [...t].forEach((_, i) => { const sx = cx - w / 2 + (i + .5) * w / t.length; x.beginPath(); x.moveTo(sx, cy + s * .05); x.bezierCurveTo(sx - 20, cy + s * .35, sx + 24, cy + s * .55, sx - 6, cy + s * .8); x.stroke(); });
  x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 30; x.shadowOffsetY = 14; x.drawImage(L, cx - L.width / 2, cy - by); x.restore();
}
function sparkle(x, cx, cy, r, c) { x.fillStyle = c; x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); }
let grainC = null;
function film(x, H) {
  if (!grainC) { grainC = document.createElement("canvas"); grainC.width = grainC.height = 220; const g = grainC.getContext("2d"), id = g.createImageData(220, 220), R = rng(11); for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 70; } g.putImageData(id, 0, 0); }
  x.save(); x.globalCompositeOperation = "overlay"; x.fillStyle = x.createPattern(grainC, "repeat"); x.fillRect(0, 0, 1080, H);
  x.globalCompositeOperation = "screen"; let lg = x.createRadialGradient(0, 0, 0, 0, 0, H * .55); lg.addColorStop(0, "rgba(255,140,60,.62)"); lg.addColorStop(1, "rgba(255,140,60,0)"); x.fillStyle = lg; x.fillRect(0, 0, 1080, H);
  lg = x.createRadialGradient(1080, H, 0, 1080, H, H * .5); lg.addColorStop(0, "rgba(255,70,130,.28)"); lg.addColorStop(1, "rgba(255,70,130,0)"); x.fillStyle = lg; x.fillRect(0, 0, 1080, H);
  x.globalCompositeOperation = "source-over"; lg = x.createRadialGradient(540, H / 2, H * .3, 540, H / 2, H * .75); lg.addColorStop(0, "rgba(0,0,0,0)"); lg.addColorStop(1, "rgba(0,0,0,.3)"); x.fillStyle = lg; x.fillRect(0, 0, 1080, H); x.restore();
}
/* ---------------- Décors (calque derrière le contenu) ---------------- */
const DECOS = [["aucun", "Aucun"], ["ballons", "Ballons"], ["paillettes", "Paillettes"], ["fleurs", "Fleurs"], ["serpentins", "Serpentins"]];
const W6 = "#ffffff";
function realBalloon(x, cx, cy, r, col, metal) {
  x.save();
  x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = Math.max(1.5, r * .025); x.beginPath(); x.moveTo(cx, cy + r * 1.2); x.bezierCurveTo(cx - r * .35, cy + r * 1.7, cx + r * .4, cy + r * 2.1, cx - r * .1, cy + r * 2.8); x.stroke();
  x.fillStyle = mixH(col, "#000000", .7); x.beginPath(); x.moveTo(cx, cy + r * 1.08); x.lineTo(cx - r * .11, cy + r * 1.22); x.lineTo(cx + r * .11, cy + r * 1.22); x.closePath(); x.fill();
  const g = x.createRadialGradient(cx - r * .35, cy - r * .45, r * .04, cx, cy, r * 1.25);
  if (metal) { g.addColorStop(0, W6); g.addColorStop(.12, mixH(col, W6, .45)); g.addColorStop(.5, col); g.addColorStop(.86, mixH(col, "#000000", .45)); g.addColorStop(1, mixH(col, W6, .55)); }
  else { g.addColorStop(0, mixH(col, W6, .5)); g.addColorStop(.4, col); g.addColorStop(1, mixH(col, "#000000", .55)); }
  x.shadowColor = "rgba(0,0,0,.28)"; x.shadowBlur = r * .35; x.shadowOffsetY = r * .16; x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, r, r * 1.13, 0, 0, 6.29); x.fill();
  x.shadowColor = "transparent"; x.filter = `blur(${Math.max(1, r * .05)}px)`; x.fillStyle = "rgba(255,255,255,.78)"; x.beginPath(); x.ellipse(cx - r * .4, cy - r * .5, r * .15, r * .28, -.55, 0, 6.29); x.fill();
  x.fillStyle = "rgba(255,255,255,.25)"; x.beginPath(); x.ellipse(cx + r * .45, cy + r * .35, r * .1, r * .2, -.4, 0, 6.29); x.fill(); x.filter = "none"; x.restore();
}
function peony(x, cx, cy, r, col, ctr) {
  for (let k = 0; k < 4; k++) { const n = 10 - k * 2, rr2 = r * (1 - k * .22); for (let i = 0; i < n; i++) { const a = i / n * 6.283 + k * .4;
    const px2 = cx + Math.cos(a) * rr2 * .42, py2 = cy + Math.sin(a) * rr2 * .42, g = x.createRadialGradient(cx, cy, 0, px2, py2, rr2 * .6); g.addColorStop(0, mixH(col, W6, .25 + k * .15)); g.addColorStop(1, mixH(col, "#000000", .82 + k * .05));
    x.fillStyle = g; x.beginPath(); x.ellipse(px2, py2, rr2 * .5, rr2 * .34, a, 0, 6.29); x.fill(); } }
  x.fillStyle = ctr; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; x.beginPath(); x.arc(cx + Math.cos(a) * r * .1, cy + Math.sin(a) * r * .1, r * .045, 0, 6.29); x.fill(); }
}
function leafSpray(x, cx, cy, a0, len, col) { x.save(); x.translate(cx, cy); x.rotate(a0); x.strokeStyle = mixH(col, "#000000", .6); x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * .5, -len * .12, len, 0); x.stroke();
  for (let i = 1; i < 8; i++) { const t = i / 8, lx = len * t, ly = -len * .12 * 4 * t * (1 - t), s2 = len * .16 * (1 - t * .4); [-1, 1].forEach(sd => { x.save(); x.translate(lx, ly); x.rotate(sd * .9); const g = x.createLinearGradient(0, 0, s2, 0); g.addColorStop(0, mixH(col, "#000000", .75)); g.addColorStop(1, mixH(col, W6, .7)); x.fillStyle = g; x.beginPath(); x.ellipse(s2 * .5, 0, s2 * .5, s2 * .22, 0, 0, 6.29); x.fill(); x.restore(); }); } x.restore(); }
function decor(x, H, S, c1, c2, ink, acc) {
  const d = S.decor; if (!d || d === "aucun") return;
  const sq = H === 1080, k = sq ? .72 : 1, R = rng(21), dark = hx(c2).reduce((a, v) => a + v, 0) < 240 * 3 * .5;
  x.save();
  if (d === "ballons") {
    const cols = [acc, dark ? "#E9B949" : mixH(acc, W6, .45), dark ? "#F4F1EA" : c2, mixH(acc, "#000000", .7)];
    const L = [[70, 150, 120, 0, 1], [250, 70, 95, 1, 0], [150, 330, 85, 2, 0], [-10, 330, 70, 3, 1], [1010, 160, 120, 1, 1], [830, 80, 92, 0, 0], [930, 340, 86, 2, 0], [1090, 320, 66, 3, 1]];
    L.forEach(([bx, by, r, ci, m]) => realBalloon(x, bx, by * k, r * k, cols[ci], !!m));
  } else if (d === "paillettes") {
    const golds = ["#F6E3A3", "#E9B949", "#C9962E", W6, mixH(acc, W6, .5)];
    for (let i = 0; i < 1500; i++) { const e = R() < .5, u = Math.pow(R(), 2.2), X = e ? (R() < .5 ? u * 300 : 1080 - u * 300) : R() * 1080, Y = e ? R() * H : (R() < .5 ? u * H * .22 : H - u * H * .22);
      x.globalAlpha = .35 + R() * .65; x.fillStyle = golds[i % golds.length]; const sz = 1.2 + R() * 3.6; x.beginPath(); x.arc(X, Y, sz, 0, 6.29); x.fill(); }
    x.globalAlpha = 1; x.shadowColor = "#FFE7A0"; x.shadowBlur = 18; for (let i = 0; i < 26; i++) { const e = R() < .5, X = e ? (R() < .5 ? R() * 220 : 1080 - R() * 220) : R() * 1080, Y = e ? R() * H : (R() < .5 ? R() * H * .16 : H - R() * H * .16); sparkle(x, X, Y, 8 + R() * 18, i % 3 ? "#FFF6DA" : "#E9B949"); }
  } else if (d === "fleurs") {
    const mourn = isMourn(S), pet = mourn ? "#F1EEE8" : mixH(acc, W6, .55), pet2 = mourn ? "#E2DED5" : acc, leaf = mourn ? "#8E9A8A" : "#7E9B78", ctr = mourn ? "#C9B37E" : "#E9B949";
    [[0, 0, 1], [1080, H, -1]].forEach(([ox, oy, sd]) => { x.save(); x.translate(ox, oy); x.scale(sd * k * 1.3, sd * k * 1.3);
      leafSpray(x, 30, 40, .25, 380, leaf); leafSpray(x, 20, 60, 1.25, 330, leaf); leafSpray(x, 60, 30, .75, 300, mixH(leaf, W6, .8));
      peony(x, 120, 110, 120, pet2, ctr); peony(x, 270, 60, 82, pet, ctr); peony(x, 60, 280, 78, pet, ctr); x.restore(); });
  } else if (d === "serpentins") {
    const cols = [acc, dark ? "#E9B949" : mixH(acc, "#000000", .7), dark ? W6 : c2, mixH(acc, W6, .5)];
    for (let i = 0; i < 9; i++) { const sx = R() < .5 ? R() * 260 : 820 + R() * 260, sy = R() * H, len = 260 + R() * 260, a = R() * 6.28, amp = 26 + R() * 18; x.save(); x.translate(sx, sy); x.rotate(a); x.lineWidth = 11 * k; x.lineCap = "round"; x.strokeStyle = cols[i % cols.length];
      x.beginPath(); for (let t = 0; t <= 1.001; t += .02) { const px2 = t * len * k, py2 = Math.sin(t * 6.28 * 2.2) * amp * k; t ? x.lineTo(px2, py2) : x.moveTo(px2, py2); } x.stroke(); x.globalAlpha = .35; x.strokeStyle = W6; x.lineWidth = 3 * k; x.stroke(); x.restore(); }
    for (let i = 0; i < 46; i++) { const X = R() < .5 ? R() * 300 : 780 + R() * 300, Y = R() * H, a = R() * 6.28, f2 = Math.cos(R() * 6.28), w = (14 + R() * 12) * k, h = (9 + R() * 6) * k * Math.max(.2, Math.abs(f2)), c = cols[i % cols.length];
      x.save(); x.translate(X, Y); x.rotate(a); const g = x.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, mixH(c, f2 > 0 ? W6 : "#000000", .6)); g.addColorStop(1, c); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h); x.restore(); }
  }
  x.restore();
}

/* ---------------- Stickers ---------------- */
const P2 = d => new Path2D(d);
const SH = {
  heart: P2("M50 88C20 66 4 48 4 30 4 16 15 6 28 6c10 0 18 6 22 14 4-8 12-14 22-14 13 0 24 10 24 24 0 18-16 36-46 58z"),
  star: P2("M50 4l13 28 30 3-23 21 7 30-27-16-27 16 7-30L7 35l30-3z"),
  crown: P2("M10 76 16 28l20 22L50 14l14 36 20-22 6 48z"),
  cup: P2("M24 8h52v18c0 18-11 31-26 34-15-3-26-16-26-34zM42 60h16v14H42zM30 74h40v14H30z"),
  cap: P2("M50 14 96 34 50 54 4 34z"),
  gift: P2("M10 38h80v18H10zM16 56h68v34H16z")
};
function outl(x, path, fill, lw) { x.lineJoin = "round"; x.strokeStyle = "#fff"; x.lineWidth = lw || 12; x.stroke(path); x.fillStyle = fill; x.fill(path); }
const STK = {
  coeur: ["Cœur", (x, S, a) => { const g = x.createLinearGradient(0, 0, 100, 100); g.addColorStop(0, "#FF6B8B"); g.addColorStop(1, "#D61F4F"); outl(x, SH.heart, g); x.fillStyle = "rgba(255,255,255,.55)"; x.beginPath(); x.ellipse(28, 26, 9, 5, -.6, 0, 6.29); x.fill(); }],
  etoile: ["Étoile", (x, S, a) => { const g = x.createLinearGradient(0, 0, 100, 100); g.addColorStop(0, "#FFE08A"); g.addColorStop(1, "#E3A21A"); outl(x, SH.star, g); }],
  couronne: ["Couronne", (x, S, a) => { const g = x.createLinearGradient(0, 14, 0, 76); g.addColorStop(0, "#FFE9A6"); g.addColorStop(1, "#D29A1E"); outl(x, SH.crown, g); [[16, 28, "#E8365D"], [50, 14, "#4F7DF2"], [84, 28, "#E8365D"]].forEach(([cx, cy, c]) => { x.fillStyle = "#fff"; x.beginPath(); x.arc(cx, cy, 8, 0, 6.29); x.fill(); x.fillStyle = c; x.beginPath(); x.arc(cx, cy, 5.5, 0, 6.29); x.fill(); }); }],
  gateau: ["Gâteau", (x, S, a) => { x.lineJoin = "round"; const parts = [[14, 56, 72, 32, "#F7C6D9"], [22, 34, 56, 24, "#FFF4E8"]]; parts.forEach(([X, Y, w, h]) => { x.strokeStyle = "#fff"; x.lineWidth = 12; x.strokeRect(X, Y, w, h); }); parts.forEach(([X, Y, w, h, c]) => { x.fillStyle = c; x.fillRect(X, Y, w, h); }); x.fillStyle = a; x.fillRect(14, 56, 72, 7); x.fillRect(22, 34, 56, 6);
    [36, 50, 64].forEach(cx => { x.fillStyle = "#7C6CF2"; x.fillRect(cx - 2.5, 18, 5, 16); x.fillStyle = "#FFB020"; x.beginPath(); x.ellipse(cx, 12, 4, 7, 0, 0, 6.29); x.fill(); }); }],
  ballon: ["Ballon", (x, S, a) => { x.strokeStyle = "#fff"; x.lineWidth = 3; x.beginPath(); x.moveTo(50, 70); x.quadraticCurveTo(40, 84, 52, 98); x.stroke(); realBalloon(x, 50, 38, 30, a, true); }],
  cadeau: ["Cadeau", (x, S, a) => { outl(x, SH.gift, a); x.fillStyle = "#FFE08A"; x.fillRect(45, 38, 10, 52); x.fillRect(10, 44, 80, 6); x.strokeStyle = "#FFE08A"; x.lineWidth = 6; x.beginPath(); x.ellipse(40, 30, 10, 7, .5, 0, 6.29); x.ellipse(60, 30, 10, 7, -.5, 0, 6.29); x.stroke(); }],
  diplome: ["Diplôme", (x, S, a) => { outl(x, SH.cap, "#1F2547"); x.fillStyle = "#1F2547"; x.fillRect(30, 44, 40, 22); x.strokeStyle = "#E9B949"; x.lineWidth = 4; x.beginPath(); x.moveTo(50, 34); x.lineTo(82, 46); x.lineTo(82, 70); x.stroke(); x.fillStyle = "#E9B949"; x.beginPath(); x.arc(82, 74, 5, 0, 6.29); x.fill(); }],
  trophee: ["Trophée", (x, S, a) => { const g = x.createLinearGradient(0, 0, 100, 0); g.addColorStop(0, "#F6E3A3"); g.addColorStop(.5, "#E3A21A"); g.addColorStop(1, "#B8862B"); outl(x, SH.cup, g); x.strokeStyle = "#E3A21A"; x.lineWidth = 6; x.beginPath(); x.arc(22, 22, 10, Math.PI * .5, Math.PI * 1.5, false); x.stroke(); x.beginPath(); x.arc(78, 22, 10, -Math.PI * .5, Math.PI * .5); x.stroke(); }],
  bagues: ["Alliances", (x, S, a) => { x.lineWidth = 16; x.strokeStyle = "#fff"; [[38, 56], [62, 56]].forEach(([cx, cy]) => { x.beginPath(); x.arc(cx, cy, 22, 0, 6.29); x.stroke(); }); x.lineWidth = 8; x.strokeStyle = "#E3A21A"; x.beginPath(); x.arc(38, 56, 22, 0, 6.29); x.stroke(); x.strokeStyle = "#D7DCE6"; x.beginPath(); x.arc(62, 56, 22, 0, 6.29); x.stroke(); x.fillStyle = "#BFE3FF"; x.beginPath(); x.moveTo(62, 26); x.lineTo(70, 34); x.lineTo(62, 42); x.lineTo(54, 34); x.fill(); }],
  fleur: ["Fleur", (x, S, a) => { x.fillStyle = "#fff"; x.beginPath(); x.arc(50, 50, 46, 0, 6.29); x.fill(); peony(x, 50, 50, 44, a, "#E9B949"); }],
  eclats: ["Étincelles", (x, S, a) => { [[50, 44, 30, "#FFE08A"], [80, 76, 14, "#fff"], [22, 78, 12, a]].forEach(([cx, cy, r, c]) => { x.save(); x.shadowColor = "#fff"; x.shadowBlur = 10; sparkle(x, cx, cy, r, c); x.restore(); }); }],
  hbd: ["HBD", null, "HBD"], queen: ["QUEEN", null, "QUEEN"], king: ["KING", null, "KING"], bravo: ["BRAVO !", null, "BRAVO !"], love: ["LOVE", null, "LOVE"], merci: ["MERCI", null, "MERCI"]
};
function badge(x, t, a) { x.font = `400 44px ${F.lilita}`; const w = x.measureText(t).width + 40; x.save(); x.translate(50, 50); x.rotate(-.08); rr(x, -w / 2, -34, w, 68, 34); x.lineWidth = 12; x.strokeStyle = "#fff"; x.stroke(); x.fillStyle = a; x.fill(); x.fillStyle = "#fff"; x.textAlign = "center"; x.fillText(t, 0, 16); x.restore(); return w; }
const FONTS = { script: [F.script, 400], serif: [F.serif, 700], bebas: [F.bebas, 400], lilita: [F.lilita, 400], sans: [F.sans, 800], hand: [F.hand, 600] };
/* Éléments ajoutés (stickers, textes) : position relative (0–1), taille s, rotation r en degrés */
let selI = -1; const BB = [];
function drawItems(x, H, S, acc, sel) {
  BB.length = 0;
  (S.items || []).forEach((it, i) => {
    const cx = it.x * 1080, cy = it.y * H, sc = it.s || 1; let w, h;
    x.save(); x.translate(cx, cy); x.rotate((it.r || 0) * Math.PI / 180);
    if (it.type === "text") { const [fam, wt] = FONTS[it.font] || FONTS.script, fs = 90 * sc; x.font = `${wt} ${fs}px ${fam}`; x.textAlign = "center"; x.textBaseline = "middle"; w = x.measureText(it.t).width + 20; h = fs * 1.15;
      x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 12; x.shadowOffsetY = 4; x.fillStyle = it.c || "#fff"; x.fillText(it.t, 0, 0); x.textBaseline = "alphabetic"; }
    else { const k2 = STK[it.k]; if (!k2) { x.restore(); return; } const z = 2.2 * sc; w = h = 100 * z; x.save(); x.scale(z, z); x.translate(-50, -50); x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 8; x.shadowOffsetY = 3; if (k2[1]) k2[1](x, S, it.c || acc); else { const bw = badge(x, k2[2], it.c || acc); w = Math.max(w, bw * z); } x.restore(); }
    if (sel === i) { x.setLineDash([14, 10]); x.lineWidth = 4; x.strokeStyle = "#fff"; x.strokeRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24); x.setLineDash([]); x.strokeStyle = "#6C4BF4"; x.lineWidth = 2; x.strokeRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24);
      x.fillStyle = "#6C4BF4"; x.beginPath(); x.arc(w / 2 + 12, h / 2 + 12, 26, 0, 6.29); x.fill(); x.strokeStyle = "#fff"; x.lineWidth = 4; x.stroke(); x.fillStyle = "#fff"; x.font = `700 28px ${F.sans}`; x.textAlign = "center"; x.fillText("⤡", w / 2 + 12, h / 2 + 22); }
    x.restore();
    BB[i] = { cx, cy, w: w + 24, h: h + 24, r: (it.r || 0) * Math.PI / 180 };
  });
}
/* ---------------- Infos d'annonce (date, lieu, prix) et QR code vers la page ---------------- */
function icon(x, k, cx, cy, s, col) {
  x.save(); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = Math.max(2, s * .13); x.lineJoin = "round"; x.lineCap = "round";
  if (k === "cal") { rr(x, cx - s / 2, cy - s * .38, s, s * .88, s * .14); x.stroke(); x.beginPath(); x.moveTo(cx - s / 2, cy - s * .08); x.lineTo(cx + s / 2, cy - s * .08); x.moveTo(cx - s * .24, cy - s * .55); x.lineTo(cx - s * .24, cy - s * .28); x.moveTo(cx + s * .24, cy - s * .55); x.lineTo(cx + s * .24, cy - s * .28); x.stroke(); }
  else if (k === "pin") { x.beginPath(); x.moveTo(cx, cy + s * .52); x.bezierCurveTo(cx - s * .1, cy + s * .3, cx - s * .42, cy + s * .05, cx - s * .42, cy - s * .2); x.arc(cx, cy - s * .2, s * .42, Math.PI, 0); x.bezierCurveTo(cx + s * .42, cy + s * .05, cx + s * .1, cy + s * .3, cx, cy + s * .52); x.stroke(); x.beginPath(); x.arc(cx, cy - s * .2, s * .13, 0, 6.29); x.fill(); }
  else { x.beginPath(); x.moveTo(cx - s * .5, cy - s * .3); x.lineTo(cx + s * .5, cy - s * .3); x.lineTo(cx + s * .5, cy - s * .1); x.arc(cx + s * .5, cy, s * .1, -Math.PI / 2, Math.PI / 2, true); x.lineTo(cx + s * .5, cy + s * .3); x.lineTo(cx - s * .5, cy + s * .3); x.lineTo(cx - s * .5, cy + s * .1); x.arc(cx - s * .5, cy, s * .1, Math.PI / 2, -Math.PI / 2, true); x.closePath(); x.stroke(); x.setLineDash([s * .08, s * .08]); x.beginPath(); x.moveTo(cx + s * .15, cy - s * .26); x.lineTo(cx + s * .15, cy + s * .26); x.stroke(); }
  x.restore();
}
function qrDraw(x, text, X, Y, size) {
  x.save(); x.fillStyle = "#fff"; x.fillRect(X, Y, size, size);
  const q = (() => { try { return QRCode.create(text, { errorCorrectionLevel: "M" }).modules; } catch { return null; } })();
  if (q) { const n = q.size, c = size / (n + 2); x.fillStyle = "#111";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.get(r, k)) x.fillRect(Math.floor(X + (k + 1) * c), Math.floor(Y + (r + 1) * c), Math.ceil(c), Math.ceil(c)); }
  else { x.fillStyle = "#111"; x.font = `600 ${size * .12}px ${F.sans}`; x.textAlign = "center"; x.fillText("QR", X + size / 2, Y + size / 2); }
  x.restore();
}
const shortUrl = u => u.replace(/^https?:\/\//i, "").replace(/\/$/, "");
/* Blocs « infos » et « QR » à insérer dans la mise en page d'un style (centrés, ou alignés à gauche sur left). */
function infoB(x, f, T, ink, acc, sq, left, noQr, mw) {
  const B = [], L = T.info || [];
  if (L.length) { const fs = (sq ? 30 : 38) * f, lh = fs * 1.5;
    B.push({ g: 16 * f, h: L.length * lh, d: y => { x.save(); x.font = `600 ${fs}px ${F.sans}`; x.textAlign = "left";
      L.forEach((it, i) => { const ty = y + fs + i * lh; let t = it.t; const maxW = mw || (left ? 1000 - left - fs * 1.4 : 840); while (x.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2) + "…";
        const w = x.measureText(t).width, X0 = left || 540 - (w + fs * 1.3) / 2; icon(x, it.k, X0 + fs * .42, ty - fs * .34, fs * .8, acc); x.fillStyle = ink; x.fillText(t, X0 + fs * 1.3, ty); });
      x.restore(); } }); }
  if (T.qr && !noQr) { const qs = (sq ? 150 : 210) * f, l1 = (sq ? 30 : 38) * f, l2 = (sq ? 22 : 27) * f;
    B.push({ g: 24 * f, h: qs, d: y => { x.save(); x.textAlign = "left"; x.font = `700 ${l1}px ${F.sans}`; const w1 = x.measureText(T.qrl).width; x.font = `500 ${l2}px ${F.sans}`; const url = shortUrl(T.qr), w2 = Math.min(480, x.measureText(url).width);
      const tot = qs + 30 * f + Math.max(w1, w2), X0 = left || 540 - tot / 2;
      x.shadowColor = "rgba(0,0,0,.18)"; x.shadowBlur = 16; x.fillStyle = "#fff"; rr(x, X0 - 12 * f, y - 12 * f, qs + 24 * f, qs + 24 * f, 18 * f); x.fill(); x.shadowColor = "transparent"; qrDraw(x, T.qr, X0, y, qs);
      x.fillStyle = ink; x.font = `700 ${l1}px ${F.sans}`; x.fillText(T.qrl, X0 + qs + 30 * f, y + qs * .46); x.globalAlpha = .78; x.font = `500 ${l2}px ${F.sans}`; x.fillText(url, X0 + qs + 30 * f, y + qs * .46 + l1 * 1.15, 480); x.restore(); } }); }
  return B;
}

/* ---------- Affiche événement : concert, match, soirée ---------- */
function eventS(x, H, sq, c1, c2, ink, acc, T, S) {
  x.fillStyle = c2; x.fillRect(0, 0, 1080, H);
  let g = x.createRadialGradient(880, H * .18, 0, 880, H * .18, H * .8); g.addColorStop(0, mixH(c1, "#000000", .75)); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  x.save(); x.fillStyle = c1; x.globalAlpha = .92; x.beginPath(); x.moveTo(0, H * .5); x.lineTo(1080, H * .26); x.lineTo(1080, H * .34); x.lineTo(0, H * .58); x.fill(); x.fillStyle = acc; x.beginPath(); x.moveTo(0, H * .6); x.lineTo(1080, H * .36); x.lineTo(1080, H * .375); x.lineTo(0, H * .615); x.fill(); x.restore();
  x.fillStyle = acc; for (let yy = 40; yy < H * .3; yy += 26) for (let xx = 1040; xx > 560; xx -= 26) { const k = (1 - (1040 - xx) / 480) * (1 - yy / (H * .3)); if (k > .05) { x.globalAlpha = .45; x.beginPath(); x.arc(xx, yy, 7 * k + 1, 0, 6.29); x.fill(); } } x.globalAlpha = 1;
  decor(x, H, S, c1, c2, ink, acc);
  const cutOn = cutActive(S), hasP = !!photo;
  if (cutOn) personDraw(x, 330, sq ? 70 : 150, 750, H * (sq ? .6 : .52), S, {});
  else if (hasP) { x.save(); x.translate(sq ? 790 : 770, H * (sq ? .34 : .3)); x.rotate(.05); const w = sq ? 360 : 500, h = sq ? 440 : 640; x.shadowColor = "rgba(0,0,0,.5)"; x.shadowBlur = 40; x.fillStyle = "#fff"; x.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); x.shadowColor = "transparent"; photoIn(x, "rect", -w / 2, -h / 2, w, h, S); x.restore(); }
  x.textAlign = "left"; const ky = sq ? 60 : 100, kk = (T.caps || T.kick || "").toUpperCase();
  if (kk) { x.font = `400 ${sq ? 56 : 72}px ${F.bebas}`; const kw = Math.min(x.measureText(kk).width + 50, 640); x.fillStyle = acc; x.fillRect(70, ky, kw, sq ? 74 : 92); x.fillStyle = c2; x.fillText(kk, 95, ky + (sq ? 58 : 73), kw - 40); }
  if (logo) { const ls = sq ? 100 : 130, ly = ky + (sq ? 100 : 120); x.fillStyle = "#fff"; rr(x, 70, ly, ls, ls, 20); x.fill(); const r2 = Math.min((ls - 20) / logo.naturalWidth, (ls - 20) / logo.naturalHeight); x.drawImage(logo, 70 + (ls - logo.naturalWidth * r2) / 2, ly + (ls - logo.naturalHeight * r2) / 2, logo.naturalWidth * r2, logo.naturalHeight * r2); }
  const qs = T.qr ? (sq ? 170 : 230) : 0, colW = T.qr ? 1080 - 80 - qs - 70 : 920, L = [];
  if (T.big && !kk.includes(T.big.toUpperCase())) L.push({ h: sq ? 80 : 110, d: y => { x.fillStyle = acc; x.font = `400 ${sq ? 76 : 104}px ${F.script}`; x.fillText(T.big, 76, y + (sq ? 66 : 92), 920); } });
  const tt = T.name.toUpperCase(); let ts = sq ? 150 : 210; x.font = `400 ${ts}px ${F.bebas}`; let TL = wrap(x, tt, 940, 3); while (TL.some(l => x.measureText(l).width > 940) && ts > 70) { ts -= 6; x.font = `400 ${ts}px ${F.bebas}`; TL = wrap(x, tt, 940, 3); }
  L.push({ h: TL.length * ts * .9, d: y => { x.font = `400 ${ts}px ${F.bebas}`; TL.forEach((l, i) => { x.fillStyle = ink; x.fillText(l, 70, y + ts * .84 + i * ts * .9); }); } });
  if (T.sous) L.push({ h: sq ? 50 : 60, d: y => { x.fillStyle = acc; x.font = `600 ${sq ? 36 : 44}px ${F.sans}`; x.fillText(T.sous, 72, y + (sq ? 38 : 46), 930); } });
  const inf = T.info || []; if (inf[0]) { const big = inf[0]; L.push({ h: sq ? 74 : 104, d: y => { x.fillStyle = acc; x.font = `400 ${sq ? 70 : 100}px ${F.bebas}`; x.fillText(big.t.toUpperCase(), 72, y + (sq ? 64 : 90), colW); } }); }
  const rest = { ...T, info: inf.slice(1) }; infoB(x, 1, rest, ink, acc, sq, 72, true).forEach(b => L.push({ h: b.h + b.g, d: y => b.d(y + b.g) }));
  if (T.wish) { x.font = `400 ${sq ? 30 : 36}px ${F.sans}`; const WL = wrap(x, T.wish, colW, sq ? 1 : 2), lh = (sq ? 30 : 36) * 1.4; L.push({ h: WL.length * lh + 10, d: y => { x.fillStyle = ink; x.globalAlpha = .85; x.font = `400 ${sq ? 30 : 36}px ${F.sans}`; WL.forEach((l, i) => x.fillText(l, 72, y + 36 + i * lh)); x.globalAlpha = 1; } }); }
  if (T.sig) L.push({ h: 48, d: y => { x.fillStyle = ink; x.globalAlpha = .7; x.font = `500 ${sq ? 26 : 30}px ${F.sans}`; x.fillText(T.sig, 72, y + 34, colW); x.globalAlpha = 1; } });
  const tot = L.reduce((a, b) => a + b.h + 8, 0), bot = H - (sq ? 100 : 140); let y = bot - tot; L.forEach(b => { b.d(y); y += b.h + 8; });
  if (T.qr) { const qx = 1080 - 70 - qs, qy = bot - qs - (sq ? 40 : 56); x.fillStyle = "#fff"; rr(x, qx - 14, qy - 14, qs + 28, qs + 28 + (sq ? 44 : 56), 20); x.fill(); qrDraw(x, T.qr, qx, qy, qs); x.fillStyle = "#111"; x.textAlign = "center"; x.font = `700 ${sq ? 26 : 32}px ${F.sans}`; x.fillText(T.qrl, qx + qs / 2, qy + qs + (sq ? 34 : 44), qs + 10); }
  x.textAlign = "center";
}

/* ---------- Pro : conférence, entreprise, école ---------- */
function proS(x, H, sq, c1, c2, ink, acc, T, S) {
  x.fillStyle = c1; x.fillRect(0, 0, 1080, H);
  const bandH = sq ? 520 : 820; x.fillStyle = c2; x.fillRect(0, 0, 1080, bandH);
  x.save(); x.globalAlpha = .07; x.strokeStyle = "#fff"; x.lineWidth = 2; for (let i = -bandH; i < 1080; i += 36) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + bandH, bandH); x.stroke(); } x.restore();
  x.fillStyle = acc; x.fillRect(0, bandH - 12, 1080, 12);
  decor(x, H, S, c1, c2, ink, acc);
  x.textAlign = "left"; let y = sq ? 60 : 100;
  if (logo) { const ls = sq ? 100 : 130; x.fillStyle = "#fff"; rr(x, 70, y, ls, ls, 22); x.fill(); const r2 = Math.min((ls - 20) / logo.naturalWidth, (ls - 20) / logo.naturalHeight); x.drawImage(logo, 70 + (ls - logo.naturalWidth * r2) / 2, y + (ls - logo.naturalHeight * r2) / 2, logo.naturalWidth * r2, logo.naturalHeight * r2); y += ls + (sq ? 30 : 50); }
  const d = photo ? (sq ? 280 : 400) : 0, tw = photo ? 1080 - 140 - d * .55 : 940;
  const kk = (T.caps || T.kick || "").toUpperCase(); if (kk) { x.fillStyle = acc; x.font = `700 ${sq ? 28 : 34}px ${F.sans}`; spaced(x, kk, 72, y + (sq ? 28 : 34), 6); y += sq ? 56 : 74; }
  let ts = sq ? 70 : 112; x.font = `800 ${ts}px ${F.sans}`; let TL = wrap(x, T.name, tw, 3); while (TL.length > 3 && ts > 48) { ts -= 4; x.font = `800 ${ts}px ${F.sans}`; TL = wrap(x, T.name, tw, 3); }
  x.fillStyle = "#fff"; TL.forEach((l, i) => x.fillText(l, 70, y + ts * .9 + i * ts * 1.05)); y += TL.length * ts * 1.05 + 10;
  if (T.sous) { x.fillStyle = "rgba(255,255,255,.88)"; x.font = `500 ${sq ? 32 : 40}px ${F.sans}`; x.fillText(T.sous, 72, y + (sq ? 34 : 42), tw); }
  if (photo) { const cx = 1080 - 70 - d / 2, cy = bandH - 10; x.save(); x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 30; x.fillStyle = "#fff"; x.beginPath(); x.arc(cx, cy, d / 2 + 12, 0, 6.29); x.fill(); x.restore();
    if (cutActive(S)) { x.fillStyle = acc; x.beginPath(); x.arc(cx, cy, d / 2, 0, 6.29); x.fill(); x.save(); x.beginPath(); x.arc(cx, cy, d / 2, 0, 6.29); x.clip(); personDraw(x, cx - d * .6, cy - d * .6, d * 1.2, d * 1.15, S, { shadow: false }); x.restore(); }
    else photoIn(x, "circle", cx - d / 2, cy - d / 2, d, d, S); }
  // carte d'infos
  let cy2 = bandH + (photo ? d / 2 + (sq ? 20 : 40) : (sq ? 40 : 70)); const inf = T.info || [], pf = sq ? 1 : 1.12, fs = (sq ? 30 : 38) * pf, rowH = fs * 1.5, qs = T.qr ? (sq ? 150 : 270) : 0;
  const cardH = Math.max(inf.length * rowH + (sq ? 40 : 60), qs ? qs + (sq ? 70 : 90) : 0);
  { x.font = `400 ${sq ? 30 : 37}px ${F.sans}`; const wl = T.wish ? wrap(x, T.wish, 920, sq ? 2 : 3).length * (sq ? 30 : 37) * 1.45 + 20 : 0, used = (cardH > 60 ? cardH + (sq ? 24 : 44) : 0) + wl, avail = H - (sq ? 160 : 220) - cy2; if (avail > used) cy2 += (avail - used) * .45; }
  if (cardH > 60) { x.save(); x.shadowColor = "rgba(15,23,42,.12)"; x.shadowBlur = 30; x.shadowOffsetY = 10; x.fillStyle = "#fff"; rr(x, 60, cy2, 960, cardH, 26); x.fill(); x.restore();
    infoB(x, pf, { ...T, info: inf }, ink, acc, sq, 100, true, 1020 - 100 - fs * 1.4 - (qs ? qs + 70 : 40)).forEach(b => b.d(cy2 + (sq ? 16 : 30)));
    if (T.qr) { const qx = 1020 - 40 - qs, qy = cy2 + (sq ? 20 : 30); qrDraw(x, T.qr, qx, qy, qs); x.fillStyle = c2; x.textAlign = "center"; x.font = `700 ${sq ? 24 : 30}px ${F.sans}`; x.fillText(T.qrl, qx + qs / 2, qy + qs + (sq ? 34 : 44), qs + 40); x.textAlign = "left"; }
    cy2 += cardH + (sq ? 24 : 44); }
  if (T.wish) { x.font = `400 ${sq ? 30 : 37}px ${F.sans}`; const WL = wrap(x, T.wish, 920, sq ? 2 : 3), lh = (sq ? 30 : 37) * 1.45; x.fillStyle = ink; x.globalAlpha = .8; WL.forEach((l, i) => x.fillText(l, 72, cy2 + (sq ? 30 : 37) + i * lh)); x.globalAlpha = 1; cy2 += WL.length * lh + 20; }
  if (T.sig) { const sy = Math.max(cy2 + 20, H - (sq ? 205 : 210)); x.fillStyle = acc; x.fillRect(72, sy, 8, sq ? 40 : 50); x.fillStyle = ink; x.font = `700 ${sq ? 30 : 36}px ${F.sans}`; x.fillText(T.sig, 96, sy + (sq ? 30 : 38), 900); }
  x.textAlign = "center";
}
/* =====================================================================
   MODÈLES « CÉLÉBRANT » : portrait estompé derrière, personne détourée devant,
   prénom calligraphié en très grand, sceau de date, qualités, lumières, fleurs, ballons.
   Utilisent la photo principale et, si elles existent, les photos du collage.
   ===================================================================== */
const COMPOS = ["icone", "neon", "lumiere", "duo", "reve", "tournesol"];
/* Source « personne » n° i : détourée si possible, sinon la photo */
const pSrc = (S, i) => { if (i === 0) return cutActive(S) ? cut : photo; const c = xcuts[i - 1], im = extras[i - 1]; return (cutActive(S) && c) || im || (cutActive(S) ? cut : photo); };
/* Image estompée : source dessinée (contain ou cover), puis fondu par un masque dégradé */
function faded(x, src, X, Y, w, h, o = {}) {
  if (!src) return; const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
  if (!(src instanceof HTMLCanvasElement)) o = { ...o, fade: "radial" }; // photo non détourée : fondu sur tous les bords
  const c = document.createElement("canvas"); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); const g = c.getContext("2d");
  const sc = (o.cover ? Math.max : Math.min)(w / sw, h / sh) * (o.zoom || 1), dw = sw * sc, dh = sh * sc;
  const ax = o.ax ?? .5, ay = o.ay ?? (o.cover ? .3 : 1);
  if (o.flip) { g.translate(w, 0); g.scale(-1, 1); }
  g.filter = [o.bw ? "grayscale(1)" : "", o.blur ? `blur(${o.blur}px)` : ""].filter(Boolean).join(" ") || "none";
  g.drawImage(src, (w - dw) * ax, (h - dh) * ay, dw, dh); g.filter = "none"; g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.tint) { g.globalCompositeOperation = "source-atop"; g.fillStyle = o.tint; g.fillRect(0, 0, w, h); }
  g.globalCompositeOperation = "destination-in"; const m = o.fade === "radial" ? g.createRadialGradient(w / 2, h * .42, Math.min(w, h) * .18, w / 2, h * .42, Math.max(w, h) * .62) : g.createLinearGradient(0, 0, 0, h);
  if (o.fade === "radial") { m.addColorStop(0, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); } else { m.addColorStop(0, "#000"); m.addColorStop(o.fadeAt ?? .62, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); }
  g.fillStyle = m; g.fillRect(0, 0, w, h);
  if (o.sideFade) { const sm = g.createLinearGradient(0, 0, w, 0); sm.addColorStop(0, o.sideFade === "l" ? "rgba(0,0,0,0)" : "#000"); sm.addColorStop(o.sideFade === "l" ? .35 : .65, "#000"); sm.addColorStop(1, o.sideFade === "l" ? "#000" : "rgba(0,0,0,0)"); g.fillStyle = sm; g.fillRect(0, 0, w, h); }
  x.save(); x.globalAlpha = o.alpha ?? 1; x.drawImage(c, X, Y); x.restore();
}
function streak(x, X, Y, len, ang, col, wdt) { x.save(); x.translate(X, Y); x.rotate(ang); x.globalCompositeOperation = "lighter"; const g = x.createLinearGradient(-len / 2, 0, len / 2, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, col); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.shadowColor = col; x.shadowBlur = wdt * 6; x.fillRect(-len / 2, -wdt / 2, len, wdt); x.fillStyle = "rgba(255,255,255,.9)"; x.fillRect(-len * .18, -wdt * .18, len * .36, wdt * .36); x.restore(); }
function rays(x, cx, cy, n, len, col, a0, spread) { x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < n; i++) { const a = a0 - spread / 2 + spread * i / (n - 1), g = x.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a - .03) * len, cy + Math.sin(a - .03) * len); x.lineTo(cx + Math.cos(a + .03) * len, cy + Math.sin(a + .03) * len); x.fill(); } x.restore(); }
function bokeh(x, H, n, cols, seed, maxR) { const R = rng(seed); x.save(); x.filter = "blur(8px)"; for (let i = 0; i < n; i++) { x.globalAlpha = .12 + R() * .3; x.fillStyle = cols[i % cols.length]; x.beginPath(); x.arc(R() * 1080, R() * H, 10 + R() * maxR, 0, 6.29); x.fill(); } x.restore(); }
function daisy(x, cx, cy, r, blur) { x.save(); if (blur) x.filter = `blur(${blur}px)`; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; x.save(); x.translate(cx, cy); x.rotate(a); const g = x.createLinearGradient(0, 0, r, 0); g.addColorStop(0, "#EDEDED"); g.addColorStop(1, "#FFFFFF"); x.fillStyle = g; x.beginPath(); x.ellipse(r * .55, 0, r * .48, r * .13, 0, 0, 6.29); x.fill(); x.restore(); }
  const g = x.createRadialGradient(cx - r * .08, cy - r * .08, 0, cx, cy, r * .3); g.addColorStop(0, "#FFD54A"); g.addColorStop(1, "#E08E0B"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r * .26, 0, 6.29); x.fill(); x.restore(); }
function sunflower(x, cx, cy, r, blur) { x.save(); if (blur) x.filter = `blur(${blur}px)`; for (let k = 0; k < 2; k++) for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283 + k * .14; x.save(); x.translate(cx, cy); x.rotate(a); const g = x.createLinearGradient(r * .3, 0, r, 0); g.addColorStop(0, k ? "#F2A900" : "#E39400"); g.addColorStop(1, k ? "#FFD23F" : "#FFC107"); x.fillStyle = g; x.beginPath(); x.moveTo(r * .3, 0); x.quadraticCurveTo(r * .65, -r * .14, r, 0); x.quadraticCurveTo(r * .65, r * .14, r * .3, 0); x.fill(); x.restore(); }
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r * .42); g.addColorStop(0, "#5A3511"); g.addColorStop(1, "#2B1607"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r * .4, 0, 6.29); x.fill();
  x.fillStyle = "rgba(255,200,90,.35)"; for (let i = 0; i < 60; i++) { const a = i * 2.4, rr2 = Math.sqrt(i / 60) * r * .36; x.beginPath(); x.arc(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2, r * .022, 0, 6.29); x.fill(); } x.restore(); }
function butterfly(x, cx, cy, s, c1b, c2b, ang) { x.save(); x.translate(cx, cy); x.rotate(ang || 0); [-1, 1].forEach(sd => { const g = x.createLinearGradient(0, -s, sd * s, s); g.addColorStop(0, c1b); g.addColorStop(1, c2b); x.fillStyle = g; x.beginPath(); x.ellipse(sd * s * .45, -s * .25, s * .5, s * .38, sd * .5, 0, 6.29); x.fill(); x.beginPath(); x.ellipse(sd * s * .32, s * .3, s * .3, s * .24, -sd * .4, 0, 6.29); x.fill(); }); x.fillStyle = "#1a1a1a"; x.beginPath(); x.ellipse(0, 0, s * .06, s * .45, 0, 0, 6.29); x.fill(); x.restore(); }
function balloonBunch(x, cx, cy, s, cols, R) { const pts = []; for (let i = 0; i < 9; i++) pts.push([cx + (R() - .5) * s * 1.3, cy + (R() - .5) * s * 1.1 - s * .2, s * (.22 + R() * .08), cols[i % cols.length]]);
  x.save(); x.strokeStyle = "rgba(255,255,255,.5)"; x.lineWidth = 2; pts.forEach(([bx, by]) => { x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(cx, cy + s * .5, cx - s * .1, cy + s * 1.1); x.stroke(); }); x.restore();
  pts.sort((a, b) => a[1] - b[1]).forEach(([bx, by, r, c]) => realBalloon(x, bx, by, r, c, true)); }
function tagPill(x, t, X, Y, h, bg, fg, align) { x.save(); x.font = `700 ${h * .46}px ${F.sans}`; const w = x.measureText(t.toUpperCase()).width + h * .9, X0 = align === "r" ? X - w : align === "c" ? X - w / 2 : X; x.fillStyle = bg; rr(x, X0, Y, w, h, h * .2); x.fill(); x.fillStyle = fg; x.textAlign = "center"; x.fillText(t.toUpperCase(), X0 + w / 2, Y + h * .66); x.restore(); return w; }
function seal(x, cx, cy, r, top, bot, col) {
  x.save(); x.fillStyle = "#C9962E"; [-1, 1].forEach(sd => { x.beginPath(); x.moveTo(cx + sd * r * .3, cy + r * .5); x.lineTo(cx + sd * r * .95, cy + r * 1.05); x.lineTo(cx + sd * r * .6, cy + r * 1.0); x.lineTo(cx + sd * r * .55, cy + r * 1.3); x.lineTo(cx + sd * r * .05, cy + r * .6); x.fill(); });
  x.shadowColor = "rgba(0,0,0,.4)"; x.shadowBlur = 20; x.shadowOffsetY = 8; const g0 = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g0.addColorStop(0, "#F6E3A3"); g0.addColorStop(.5, "#D4A73A"); g0.addColorStop(1, "#A97A22"); x.fillStyle = g0; star(x, cx, cy, r, r * .9, 28); x.fill(); x.shadowColor = "transparent";
  const g = x.createRadialGradient(cx - r * .2, cy - r * .3, r * .1, cx, cy, r * .8); g.addColorStop(0, mixH(col, "#ffffff", .7)); g.addColorStop(1, mixH(col, "#000000", .55)); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r * .74, 0, 6.29); x.fill();
  x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 2; x.setLineDash([4, 5]); x.beginPath(); x.arc(cx, cy, r * .64, 0, 6.29); x.stroke(); x.setLineDash([]);
  x.fillStyle = "#fff"; x.textAlign = "center"; x.font = `400 ${r * .62}px ${F.bebas}`; x.fillText(top, cx, cy + r * .12); x.font = `400 ${r * .34}px ${F.bebas}`; x.fillText(bot, cx, cy + r * .46); x.restore();
}
function ringText(x, cx, cy, r, txt, col, fs) { x.save(); x.font = `600 ${fs}px ${F.sans}`; x.fillStyle = col; const chars = [...txt], tot = chars.reduce((a, c) => a + x.measureText(c).width, 0), ang = tot / r; let a = -Math.PI / 2 - ang / 2;
  chars.forEach(c => { const w = x.measureText(c).width; a += w / r / 2; x.save(); x.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.rotate(a + Math.PI / 2); x.textAlign = "center"; x.fillText(c, 0, 0); x.restore(); a += w / r / 2; }); x.restore(); }
function vText(x, t, X, Y, fs, col, sp) { x.save(); x.translate(X, Y); x.rotate(-Math.PI / 2); x.fillStyle = col; x.font = `600 ${fs}px ${F.sans}`; x.textAlign = "center"; spaced(x, t.toUpperCase(), 0, 0, sp); x.restore(); }
function dateBits(T) { const m = String(T.sous || "").match(/(\d{1,2})(?:er)?\s+([A-Za-zÀ-ÿ]+)/); if (m) return [m[1], m[2].slice(0, 3).toUpperCase().replace("É", "E").replace("Û", "U")]; if (T.num) return [T.num, (T.numSmall || "").toUpperCase()]; return null; }
const firstWord = n => (String(n || "").trim().split(/\s+/)[0] || "");
const restWords = n => String(n || "").trim().split(/\s+/).slice(1).join(" ");
/* Nom calligraphié en très grand, avec ombre douce */
function bigScript(x, t, cx, cy, maxW, size, col, a) { if (!t) return 0; const s2 = fitFont(x, t, z => `400 ${z}px ${F.script}`, size, maxW, size * .45); x.save(); x.font = `400 ${s2}px ${F.script}`; x.textAlign = "center"; x.globalAlpha = a ?? 1; x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 24; x.shadowOffsetY = 6; x.fillStyle = col; x.fillText(t, cx, cy); x.restore(); return s2; }
function capsHead(x, t, X, Y, fs, col, align, sp) { if (!t) return; x.save(); x.fillStyle = col; x.font = `700 ${fs}px ${F.sans}`; x.textAlign = align || "left"; const L = t.toUpperCase().split(" "); const lines = L.length > 1 ? [L.slice(0, Math.ceil(L.length / 2)).join(" "), L.slice(Math.ceil(L.length / 2)).join(" ")] : L; lines.forEach((l, i) => spaced(x, l, X, Y + i * fs * 1.08, sp || 2)); x.restore(); }
function mainSubject(x, S, X, Y, w, h, o = {}) { const cutOn = cutActive(S); if (cutOn) return personDraw(x, X, Y, w, h, S, o); if (!photo) { photoIn(x, "rect", X + w * .15, Y + h * .1, w * .7, h * .8, S); return null; } x.save(); x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 40; const pw = w * .72, ph = h * .86; rr(x, X + (w - pw) / 2 - 10, Y + h - ph - 10, pw + 20, ph + 20, 30); x.fillStyle = "#fff"; x.fill(); x.restore(); photoIn(x, "rect", X + (w - pw) / 2, Y + h - ph, pw, ph, S); return null; }
const headTxt = (S, T) => S.occ === "anniversaire" ? "Joyeux anniversaire" : (T.caps || T.big || "");

/* ---------- Icône ---------- */
function iconeS(x, H, sq, c1, c2, ink, acc, T, S) {
  let g = x.createLinearGradient(0, 0, 1080, H); g.addColorStop(0, c2); g.addColorStop(.6, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  x.save(); x.globalAlpha = .12; x.strokeStyle = "#fff"; x.lineWidth = 6; for (let i = 300; i < 1500; i += 46) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i - 520, H * .7); x.stroke(); } x.restore();
  decor(x, H, S, c1, c2, ink, acc);
  faded(x, pSrc(S, 1), -120, H * .06, 760, H * .62, { alpha: .42, fadeAt: .55, sideFade: "r", tint: mixH(c1, "#000000", .5) + "66", cover: !cutActive(S) });
  streak(x, 820, H * .2, 900, -1.1, acc, 10); streak(x, 260, H * .58, 700, -1.1, "#ffffff", 5);
  const bH = H * (sq ? .92 : .9); mainSubject(x, S, sq ? 80 : 40, H - bH, sq ? 1000 : 1200, bH, { fadeB: .38 });
  const db = dateBits(T); if (db) { const r = sq ? 92 : 118, cx = sq ? 940 : 920, cy = sq ? 120 : 180; x.save(); x.shadowColor = "rgba(0,0,0,.4)"; x.shadowBlur = 20; x.fillStyle = acc; x.beginPath(); x.arc(cx, cy, r, 0, 6.29); x.fill(); x.restore(); x.fillStyle = "#0A0A12"; x.textAlign = "center"; x.font = `800 ${r * .78}px ${F.sans}`; x.fillText(db[0], cx, cy + r * .1); x.font = `800 ${r * .4}px ${F.sans}`; x.fillText(db[1], cx, cy + r * .55); }
  vText(x, S.occ === "anniversaire" ? "Célébrons une icône" : (T.caps || ""), 1030, H * (sq ? .52 : .58), sq ? 30 : 38, ink, 12);
  if (T.tags.length) { x.save(); x.fillStyle = ink; x.font = `600 ${sq ? 34 : 42}px ${F.sans}`; x.textAlign = "left"; T.tags.forEach((t2, i) => x.fillText("• " + t2, 64, H * (sq ? .36 : .34) + i * (sq ? 46 : 58))); x.restore(); }
  const gr = x.createLinearGradient(0, H * .62, 0, H); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, c2); x.fillStyle = gr; x.fillRect(0, H * .55, 1080, H * .45);
  x.save(); x.strokeStyle = "#E9B949"; x.lineWidth = sq ? 28 : 40; x.lineCap = "round"; const gg = x.createLinearGradient(0, H * .85, 400, H); gg.addColorStop(0, "#F6E3A3"); gg.addColorStop(.5, "#D4A73A"); gg.addColorStop(1, "#8A5E14"); x.strokeStyle = gg; x.beginPath(); x.moveTo(-40, H * .9); x.bezierCurveTo(120, H * .8, 220, H * 1.02, 380, H * .93); x.stroke(); x.restore();
  const hd = headTxt(S, T).split(" "); const by = H - (sq ? 430 : 520);
  x.textAlign = "center"; x.fillStyle = ink; x.font = `700 ${sq ? 76 : 104}px ${F.sans}`; x.fillText(hd[0] || "", 560, by);
  const s2 = bigScript(x, hd.slice(1).join(" ") || T.big, 560, by + (sq ? 110 : 150), 900, sq ? 150 : 210, ink);
  x.textAlign = "center"; const nm = T.name.toUpperCase(), fw = firstWord(nm), rw = restWords(nm); x.font = `800 ${sq ? 44 : 58}px ${F.sans}`; const wF = x.measureText(fw + " ").width, wR = x.measureText(rw).width, nx = 560 - (wF + wR) / 2, ny = by + (sq ? 180 : 250);
  x.textAlign = "left"; x.fillStyle = acc; x.fillText(fw + " ", nx, ny); x.fillStyle = ink; x.fillText(rw, nx + wF, ny);
  if (T.wish) { x.textAlign = "center"; x.font = `400 ${sq ? 26 : 32}px ${F.sans}`; const WL = wrap(x, T.wish, 860, sq ? 1 : 2); x.globalAlpha = .85; WL.forEach((l, i) => x.fillText(l, 560, ny + (sq ? 44 : 60) + i * (sq ? 32 : 42))); x.globalAlpha = 1; }
  if (T.sig) { x.textAlign = "center"; x.fillStyle = mixH(acc, "#ffffff", .8); x.font = `600 ${sq ? 26 : 30}px ${F.sans}`; spaced(x, T.sig.toUpperCase(), 560, H - (sq ? 100 : 120), 6); }
  x.textAlign = "center";
}

/* ---------- Néon ---------- */
function neonS(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createRadialGradient(540, H * .25, 0, 540, H * .25, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  rays(x, 540, -60, 9, H * .9, mixH(acc, "#ffffff", .5) + "40", Math.PI / 2, 1.3); bokeh(x, H, 26, [acc, "#ffffff"], 13, 40);
  decor(x, H, S, c1, c2, ink, acc);
  faded(x, pSrc(S, 1), -80, H * .02, 700, H * .6, { alpha: .75, fadeAt: .5, sideFade: "r", cover: !cutActive(S) });
  faded(x, pSrc(S, 2) || pSrc(S, 1), 470, H * .06, 640, H * .5, { alpha: .6, fadeAt: .5, sideFade: "l", flip: !extras[1], cover: !cutActive(S) });
  const R = rng(17); balloonBunch(x, 110, H * (sq ? .62 : .66), sq ? 200 : 260, [acc, "#F4F6FB", mixH(acc, "#000000", .7)], R); balloonBunch(x, 960, H * (sq ? .55 : .58), sq ? 190 : 250, ["#F4F6FB", acc, mixH(acc, "#000000", .7)], R);
  const bH = H * (sq ? .72 : .62); mainSubject(x, S, 280, H - bH, 520, bH, { glow: acc + "88", fadeB: .3 });
  const db = dateBits(T); if (db) { x.fillStyle = ink; x.textAlign = "left"; x.font = `700 ${sq ? 28 : 34}px ${F.sans}`; [db[0], db[1]].forEach((l, i) => x.fillText(l, 820, H * .1 + i * (sq ? 34 : 42))); }
  const hy = H * (sq ? .58 : .55); x.textAlign = "left"; capsHead(x, headTxt(S, T), 330, hy, sq ? 30 : 38, ink, "left", 8);
  const s2 = bigScript(x, firstWord(T.name), 520, hy + (sq ? 190 : 270), 1000, sq ? 260 : 380, ink);
  x.textAlign = "left"; x.fillStyle = ink; x.font = `600 ${sq ? 64 : 88}px ${F.sans}`; x.fillText(restWords(T.name).toUpperCase(), 330, hy + (sq ? 270 : 380), 700);
  const tc = [["#DC2626", "#fff"], ["#16A34A", "#fff"], ["#FACC15", "#111"]]; const tp = [[300, H * (sq ? .5 : .49), "l"], [70, H * (sq ? .86 : .82), "l"], [1010, H * (sq ? .74 : .72), "r"]];
  T.tags.forEach((t2, i) => tagPill(x, t2, tp[i][0], tp[i][1], sq ? 46 : 56, tc[i][0], tc[i][1], tp[i][2]));
  if (T.wish) { x.save(); x.textAlign = "left"; x.fillStyle = ink; x.font = `600 ${sq ? 20 : 25}px ${F.sans}`; const WL = wrap(x, T.wish.toUpperCase(), 330, sq ? 4 : 6); WL.forEach((l, i) => spaced(x, l, 700, H * (sq ? .8 : .8) + i * (sq ? 26 : 32), 1.5)); x.restore(); }
  if (T.sig) { x.textAlign = "left"; x.fillStyle = ink; x.globalAlpha = .75; x.font = `500 ${sq ? 22 : 26}px ${F.sans}`; spaced(x, T.sig.toUpperCase(), 330, H - (sq ? 100 : 130), 4); x.globalAlpha = 1; }
  x.textAlign = "center";
}

/* ---------- Lumière ---------- */
function lumiereS(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  decor(x, H, S, c1, c2, ink, acc);
  const pH = H * (sq ? .5 : .46), panels = [[0, 380], [350, 720], [690, 1080]];
  panels.forEach(([a, b], i) => { x.save(); x.beginPath(); x.moveTo(a + 60, 0); x.lineTo(b + 60, 0); x.lineTo(b - 60, pH); x.lineTo(a - 60, pH); x.closePath(); x.clip(); faded(x, pSrc(S, [1, 2, 0][i]) , a - 80, 0, b - a + 160, pH, { alpha: .5, fadeAt: .45, cover: true, zoom: 1 + i * .15, ay: .15, tint: mixH(c1, "#000000", .4) + "55", flip: i === 1 }); x.restore(); });
  [[380, 0], [720, 0]].forEach(([xx]) => streak(x, xx, pH * .5, pH * 1.25, Math.atan2(pH, -120) , acc, 9));
  streak(x, 900, H * .12, 500, -.9, acc, 6);
  const bH = H * (sq ? .8 : .7); mainSubject(x, S, 200, H - bH, 680, bH, { fadeB: .3 });
  x.textAlign = "left"; const hd = headTxt(S, T); x.fillStyle = ink; x.font = `400 ${sq ? 90 : 128}px ${F.bebas}`; const hw = hd.split(" "); x.fillText(hw[0] || "", 70, H * (sq ? .2 : .2)); x.fillText(hw.slice(1).join(" "), 70, H * (sq ? .2 : .2) + (sq ? 84 : 118));
  if (T.sous) { x.font = `400 ${sq ? 26 : 32}px ${F.sans}`; x.fillStyle = ink; x.globalAlpha = .85; x.fillText(T.sous, 74, H * .2 + (sq ? 130 : 180), 420); x.globalAlpha = 1; }
  bigScript(x, T.name, 560, H * (sq ? .74 : .72), 1040, sq ? 200 : 280, ink);
  const db = dateBits(T); const rc = sq ? 90 : 120, bx = 150, byy = H - (sq ? 190 : 260); x.save(); x.strokeStyle = acc; x.lineWidth = 3; x.beginPath(); x.arc(bx, byy, rc * .62, 0, 6.29); x.stroke(); x.restore();
  ringText(x, bx, byy, rc * .82, (headTxt(S, T) + " • ").toUpperCase().repeat(2), acc, sq ? 18 : 22);
  if (db) { x.fillStyle = acc; x.textAlign = "center"; x.font = `400 ${rc * .5}px ${F.script}`; x.fillText(db[0], bx, byy + rc * .05); x.font = `700 ${rc * .2}px ${F.sans}`; x.fillText(db[1], bx, byy + rc * .32); }
  x.textAlign = "right"; x.fillStyle = ink; x.font = `400 ${sq ? 48 : 64}px ${F.script}`; x.fillText(firstWord(T.name), 1010, H - (sq ? 210 : 290)); x.font = `600 ${sq ? 32 : 44}px ${F.sans}`; T.name.toUpperCase().split(" ").slice(0, 2).forEach((l, i) => x.fillText(l, 1010, H - (sq ? 165 : 230) + i * (sq ? 36 : 48)));
  if (T.wish) { x.textAlign = "center"; x.font = `400 ${sq ? 24 : 30}px ${F.sans}`; x.fillStyle = ink; x.globalAlpha = .8; wrap(x, T.wish, 520, sq ? 1 : 2).forEach((l, i) => x.fillText(l, 560, H * (sq ? .82 : .79) + i * (sq ? 30 : 40))); x.globalAlpha = 1; }
  x.textAlign = "center";
}

/* ---------- Profils ---------- */
function duoS(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createRadialGradient(540, H * .35, 0, 540, H * .35, H * .9); g.addColorStop(0, mixH(c1, "#ffffff", .85)); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  decor(x, H, S, c1, c2, ink, acc);
  x.save(); x.strokeStyle = "#fff"; x.lineWidth = 6; x.shadowColor = "#fff"; x.shadowBlur = 24; x.translate(540, H * .3); x.rotate(-.02); x.strokeRect(-430, -H * .2, 860, H * .44); x.rotate(.05); x.globalAlpha = .7; x.strokeRect(-400, -H * .19, 800, H * .42); x.restore();
  const side = (i, X, flip) => { const src = pSrc(S, i); if (cutActive(S) && src !== photo) personDraw(x, X, H * (sq ? .02 : .04), 560, H * (sq ? .62 : .52), S, { src, flip, alpha: .9, shadow: false, fadeB: .3 }); else faded(x, src, X, H * .04, 560, H * .5, { alpha: .9, fadeAt: .7, cover: true, flip }); };
  side(1, -60, false); side(2, 580, !extras[1]);
  const bH = H * (sq ? .8 : .74); mainSubject(x, S, 160, H - bH, 760, bH, { fadeB: .35 });
  daisy(x, 80, H * .52, sq ? 90 : 120); daisy(x, 1010, H * .06, sq ? 80 : 110, 3); daisy(x, 120, H * .95, sq ? 120 : 170, 10); daisy(x, 960, H * .77, sq ? 70 : 90);
  const db = dateBits(T); if (T.sous) { x.fillStyle = ink; x.font = `500 ${sq ? 30 : 36}px ${F.sans}`; spaced(x, T.sous.toUpperCase(), 540, H * (sq ? .07 : .06), 8); }
  const tc = [acc, "#C7EBC0", "#7C3AED"], tf = ["#fff", "#14351A", "#fff"]; T.tags.forEach((t2, i) => tagPill(x, t2, 1000, H * (sq ? .5 : .52) + i * (sq ? 56 : 70), sq ? 46 : 58, tc[i], tf[i], "r"));
  const gy = H * (sq ? .62 : .74); const gr = x.createLinearGradient(0, gy - 200, 0, H); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, mixH(c2, "#000000", .6)); x.fillStyle = gr; x.fillRect(0, gy - 200, 1080, H - gy + 200);
  capsHead(x, headTxt(S, T), 280, gy - (sq ? 20 : 30), sq ? 28 : 36, ink, "right", 2);
  bigScript(x, firstWord(T.name), 600, gy + (sq ? 60 : 80), 760, sq ? 200 : 290, ink);
  const rest = restWords(T.name) || (T.num ? `${T.num} ${T.numSmall}` : ""); if (rest) { x.font = `800 ${sq ? 40 : 52}px ${F.sans}`; const w = x.measureText(rest.toUpperCase()).width + 60; x.fillStyle = acc; rr(x, 540 - w / 2, gy + (sq ? 90 : 120), w, sq ? 64 : 82, 10); x.fill(); x.fillStyle = "#1A1A1A"; x.fillText(rest.toUpperCase(), 540, gy + (sq ? 136 : 178)); }
  if (T.wish) { x.font = `400 ${sq ? 24 : 30}px ${F.sans}`; x.fillStyle = ink; x.globalAlpha = .9; wrap(x, T.wish, 840, sq ? 1 : 2).forEach((l, i) => x.fillText(l, 540, gy + (sq ? 196 : 260) + i * (sq ? 30 : 40))); x.globalAlpha = 1; }
  if (T.sig) { x.font = `700 ${sq ? 24 : 30}px ${F.sans}`; x.fillStyle = acc; x.fillText(T.sig.toUpperCase(), 540, H - (sq ? 100 : 125), 900); }
}

/* ---------- Rêve ---------- */
function reveS(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createLinearGradient(0, 0, 1080, H); g.addColorStop(0, c1); g.addColorStop(.5, "#FFF6FB"); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  const R = rng(23); x.save(); x.filter = "blur(18px)"; for (let i = 0; i < 9; i++) { x.globalAlpha = .7; x.fillStyle = "#fff"; x.beginPath(); x.ellipse(R() * 1080, R() * H * .5, 120 + R() * 140, 50 + R() * 40, 0, 0, 6.29); x.fill(); } x.restore();
  bokeh(x, H, 30, [acc, "#ffffff", c2], 29, 30); for (let i = 0; i < 10; i++) sparkle(x, R() * 1080, R() * H, 10 + R() * 18, i % 2 ? "#fff" : acc);
  decor(x, H, S, c1, c2, ink, acc);
  faded(x, pSrc(S, 0), 250, 0, 900, H * (sq ? .75 : .62), { cover: true, zoom: cutActive(S) ? 1.5 : 1.15, ay: .05, fade: "radial", alpha: 1 });
  const pols = [pSrc(S, 1), pSrc(S, 2)].filter(Boolean); pols.forEach((src, i) => { const pw = sq ? 220 : 300, ph = pw * 1.25, X = 70, Y = H * (sq ? .2 : .24) + i * (ph + 40); x.save(); x.shadowColor = "rgba(0,0,0,.2)"; x.shadowBlur = 20; x.fillStyle = "#fff"; x.fillRect(X, Y, pw, ph); x.restore(); const im = (i === 0 ? extras[0] : extras[1]) || photo; coverImg(x, im, X + 16, Y + 16, pw - 32, pw - 32, S.bw); });
  if (cutActive(S)) personDraw(x, 120, H * (sq ? .32 : .42), 520, H * (sq ? .62 : .5), S, { small: true, src: xcuts[0] || cut, fadeB: .3 });
  const db = dateBits(T); if (db) seal(x, sq ? 880 : 860, H * (sq ? .52 : .55), sq ? 80 : 100, db[0], db[1], "#E11D48");
  x.textAlign = "left"; x.fillStyle = ink; x.font = `800 ${sq ? 34 : 46}px ${F.sans}`; capsHead(x, headTxt(S, T), 120, H * (sq ? .14 : .18), sq ? 30 : 42, ink, "left", 1);
  const ny = H * (sq ? .64 : .66), parts = T.name.toUpperCase().split(" "), last = parts.length > 1 ? parts.pop() : parts[0], first = parts.length && T.name.split(" ").length > 1 ? parts.join(" ") : "";
  x.textAlign = "left"; if (first) { x.fillStyle = "#3B3B3B"; x.font = `500 ${sq ? 60 : 84}px ${F.sans}`; wrap(x, first, 560, 2).forEach((l, i) => x.fillText(l, 480, ny + i * (sq ? 64 : 88))); }
  const ls = fitFont(x, last, z => `400 ${z}px ${F.lilita}`, sq ? 170 : 230, 600, 70), ly = ny + (first ? (sq ? 70 : 100) : 0) + ls * .9; x.lineJoin = "round"; x.lineWidth = 18; x.strokeStyle = "#fff"; x.font = `400 ${ls}px ${F.lilita}`; x.strokeText(last, 450, ly); const lg = x.createLinearGradient(0, ly - ls, 0, ly); lg.addColorStop(0, mixH(acc, "#ffffff", .55)); lg.addColorStop(1, acc); x.fillStyle = lg; x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 16; x.fillText(last, 450, ly); x.shadowColor = "transparent";
  if (T.wish) { x.font = `italic 500 ${sq ? 24 : 32}px ${F.sans}`; x.fillStyle = "#222"; wrap(x, T.wish, 500, sq ? 2 : 3).forEach((l, i) => x.fillText(l, 520, ly + (sq ? 50 : 70) + i * (sq ? 30 : 42))); }
  if (T.sig) { x.font = `600 ${sq ? 22 : 26}px ${F.sans}`; x.fillStyle = acc; x.fillText(T.sig, 520, H - (sq ? 100 : 130), 500); }
  [[980, H * .3, 40], [60, H * .9, 56]].forEach(([hx2, hy2, hs]) => { x.save(); x.fillStyle = "#F43F5E"; heart(x, hx2, hy2, hs); x.shadowColor = "rgba(0,0,0,.2)"; x.shadowBlur = 10; x.fill(); x.restore(); });
  x.textAlign = "center";
}

/* ---------- Tournesol ---------- */
function tournesolS(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createRadialGradient(540, H * .4, 0, 540, H * .4, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  bokeh(x, H, 34, ["#3BA7B8", acc, "#ffffff", "#2D6CDF"], 31, 60);
  decor(x, H, S, c1, c2, ink, acc);
  faded(x, pSrc(S, 0), 140, H * .02, 800, H * (sq ? .7 : .62), { fadeAt: .6, alpha: .95, cover: !cutActive(S), zoom: cutActive(S) ? 1.35 : 1, ay: cutActive(S) ? 0 : .3 });
  const sH = H * (sq ? .55 : .46); if (cutActive(S)) { personDraw(x, 0, H - sH - (sq ? 140 : 230), 520, sH, S, { small: true, src: xcuts[0] || cut, fadeB: .3 }); personDraw(x, 600, H - sH * .95 - (sq ? 150 : 250), 460, sH * .95, S, { small: true, src: xcuts[1] || xcuts[0] || cut, flip: !xcuts[1], fadeB: .3 }); }
  sunflower(x, 990, H * .2, sq ? 90 : 120); sunflower(x, 90, H * .97, sq ? 120 : 160, 6); sunflower(x, 110, H * .45, sq ? 60 : 80, 4); sunflower(x, 1000, H * .92, sq ? 70 : 90);
  butterfly(x, 80, H * .74, sq ? 50 : 70, "#2DD4F0", "#E254B5", -.3); butterfly(x, 1000, H * .68, sq ? 50 : 70, "#E254B5", "#2DD4F0", .3);
  const gy = H * (sq ? .78 : .8); const gr = x.createLinearGradient(0, gy - 260, 0, H); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, c2); x.fillStyle = gr; x.fillRect(0, gy - 260, 1080, H);
  bigScript(x, firstWord(T.name), 540, gy, 980, sq ? 230 : 320, "#ffffff", .85);
  x.fillStyle = ink; x.font = `500 ${sq ? 28 : 36}px ${F.sans}`; const lines = [T.sous, headTxt(S, T) + " !", T.wish].filter(Boolean);
  let yy = gy + (sq ? 50 : 70); lines.forEach(l => { wrap(x, l, 900, 2).forEach(w => { x.fillText(w, 540, yy); yy += sq ? 34 : 46; }); });
  if (T.sig) { x.font = `400 ${sq ? 40 : 52}px ${F.script}`; x.fillStyle = acc; x.fillText(T.sig, 540, Math.min(H - (sq ? 100 : 120), yy + (sq ? 30 : 40)), 900); }
}
function texts(S) {
  const o = OCC[S.occ], n = String(S.num || "").trim();
  const name = (S.nom || "").trim() || o.f.nom[1].replace(/^Ex\.\s*/, "");
  const sous = (S.sous || "").trim();
  const f = formList(S)[S.form] || "";
  const sig = (S.sig || "").trim() ? (f ? `${f}, ${S.sig.trim()}` : S.sig.trim()) : (f || "");
  let kick = o.kick, big = o.big, caps = o.caps, num = "", numSmall = "";
  if ((o.nm === "age" || o.nm === "noces") && n) { num = n; numSmall = "ans"; }
  if (o.nm === "year" && n) { big = n; }
  if (o.nm === "jours") { const d = Math.max(0, parseInt(n || "3", 10) || 0); if (d === 0) { kick = "C'est"; big = "aujourd'hui"; caps = "C'est aujourd'hui"; } else { const j = d + (d > 1 ? " jours" : " jour"); caps = "Plus que " + j; big = j; num = ["pop", "affiche"].includes(S.style) ? "J-" + d : ""; } }
  const h = S.hide || {}, ff = o.f;
  const info = h.info ? [] : [["cal", ff.quand && S.quand], ["pin", ff.lieu && S.lieu], ["tag", ff.prix && S.prix]].filter(v => v[1] && String(v[1]).trim()).map(([k, t]) => ({ k, t: String(t).trim() }));
  let qr = ""; if (ff.lien && !h.qr && (S.lien || "").trim()) { qr = S.lien.trim(); if (!/^https?:\/\//i.test(qr)) qr = "https://" + qr.replace(/^\/+/, ""); }
  if (h.head) { kick = ""; big = ""; caps = ""; }
  if (h.num) { num = ""; numSmall = ""; }
  const tags = h.tags ? [] : String(S.tags || "").split(",").map(v => v.trim()).filter(Boolean).slice(0, 3);
  return { tags, info, qr, qrl: o.qrl || "Scannez-moi", name: h.name ? "" : name, sous: h.sous ? "" : sous, wish: h.wish ? "" : (S.voeu || "").slice(0, 220), sig: h.sig ? "" : sig, kick, big, caps, num, numSmall };
}
function watermark(x, H, dark) {
  x.save(); x.font = `500 26px ${F.sans}`; x.textAlign = "center"; const t = "Fait avec TBF MOMENT · tbfmoment.com", w = x.measureText(t).width + 44;
  x.fillStyle = dark ? "rgba(0,0,0,.42)" : "rgba(255,255,255,.7)"; rr(x, 540 - w / 2, H - 76, w, 46, 23); x.fill();
  x.fillStyle = dark ? "rgba(255,255,255,.92)" : "rgba(20,16,40,.82)"; x.fillText(t, 540, H - 44); x.restore();
}
function confetti(x, H, cols, n, seed) {
  const R = rng(seed); x.save();
  for (let i = 0; i < n; i++) { let X = R() * 1080; const Y = R() * H; if (Math.abs(X - 540) < 400) X = X < 540 ? X * .25 : 1080 - (1080 - X) * .25; const s = 8 + R() * 18, c = cols[i % cols.length], t = R(); x.globalAlpha = .55 + R() * .4; x.fillStyle = c; x.strokeStyle = c;
    x.save(); x.translate(X, Y); x.rotate(R() * 6.28);
    if (t < .4) { x.beginPath(); x.arc(0, 0, s / 2.4, 0, 6.28); x.fill(); } else if (t < .75) x.fillRect(-s / 2, -s / 5, s, s / 2.5);
    else { x.lineWidth = 4; x.beginPath(); x.moveTo(-s, 0); x.quadraticCurveTo(-s / 2, -s / 1.5, 0, 0); x.quadraticCurveTo(s / 2, s / 1.5, s, 0); x.stroke(); }
    x.restore(); }
  x.restore();
}
function star(x, cx, cy, r1, r2, n) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / n; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); }
/* Mise en page verticale : blocs centrés, réduits ensemble si ça déborde. */
function stack(x, H, top, bottom, build) {
  let f = 1, B = build(f), tot = () => B.reduce((a, b) => a + b.h + b.g, 0);
  while (tot() > H - top - bottom && f > .55) { f -= .04; B = build(f); }
  let y = top + Math.max(0, (H - top - bottom - tot()) / 2);
  B.forEach(b => { y += b.g; b.d(y); y += b.h; });
}
function draw(x, S, scale, thumb, sel) {
  const H = S.fmt === "carre" ? 1080 : 1920, sq = H === 1080;
  x.canvas.width = Math.round(1080 * scale); x.canvas.height = Math.round(H * scale);
  x.setTransform(scale, 0, 0, scale, 0, 0); x.textAlign = "center"; x.textBaseline = "alphabetic";
  const p = STY[S.style].pals[S.pal] || STY[S.style].pals[0], [, c1, c2, ink, acc] = p, T = texts(S);
  ({ icone: iconeS, neon: neonS, lumiere: lumiereS, duo: duoS, reve: reveS, tournesol: tournesolS, event: eventS, pro: proS, star: starS, eclat, souvenirs, wax, prestige, pop, elegance, affiche, sobre })[S.style](x, H, sq, c1, c2, ink, acc, T, S, thumb);
  if (S.film) film(x, H);
  if (!thumb) drawItems(x, H, S, acc, sel);
  if (!thumb) watermark(x, H, ["icone", "neon", "lumiere", "duo", "tournesol", "event", "star", "eclat", "prestige", "affiche", "pop"].includes(S.style) || (S.style === "sobre" && S.pal === 2));
}

/* ---------- Star : la personne détourée devant un très grand mot, ballons dorés ---------- */
function starS(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createRadialGradient(540, H * .3, 0, 540, H * .3, H * .95); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  const R = rng(5); x.save(); x.filter = "blur(10px)"; for (let i = 0; i < 22; i++) { x.globalAlpha = .12 + R() * .25; x.fillStyle = i % 3 ? acc : "#fff"; x.beginPath(); x.arc(R() * 1080, R() * H * .75, 14 + R() * 46, 0, 6.29); x.fill(); } x.restore();
  for (let i = 0; i < 16; i++) sparkle(x, R() * 1080, R() * H * .8, 6 + R() * 16, i % 2 ? acc : "#fff");
  decor(x, H, S, c1, c2, ink, acc);
  const cutOn = cutActive(S), gold = (y0, y1) => { const gg = x.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, mixH(acc, "#ffffff", .3)); gg.addColorStop(.5, acc); gg.addColorStop(1, mixH(acc, "#000000", .6)); return gg; };
  const topY = sq ? 80 : 170;
  const kick = S.occ === "compte" ? T.kick : (T.big ? T.kick : "");
  if (kick) { x.fillStyle = acc; x.font = `400 ${sq ? 90 : 130}px ${F.script}`; x.fillText(kick, 540, topY); }
  const word = (S.occ === "compte" ? T.big : (T.big || T.caps)).toUpperCase();
  const ws = fitFont(x, word, z => `400 ${z}px ${F.bebas}`, sq ? 230 : 330, 1010, 90), wy = topY + (sq ? 30 : 50) + ws * .8;
  x.font = `400 ${ws}px ${F.bebas}`; x.fillStyle = gold(wy - ws * .8, wy); x.fillText(word, 540, wy);
  x.lineWidth = 3; x.strokeStyle = acc; x.globalAlpha = .55; x.strokeText(word, 540, wy + ws * .78); x.globalAlpha = .25; x.strokeText(word, 540, wy + ws * 1.56); x.globalAlpha = 1;
  // la personne (ou la photo en cercle) passe devant le mot
  const bY = wy - ws * .55, bH = (sq ? H * .64 : H * .55);
  if (cutOn) personDraw(x, 40, bY, 1000, bH, S, { outline: 0 });
  else { const d = sq ? 420 : 640, cy = bY + bH / 2 + (sq ? 10 : 30); x.save(); x.shadowColor = "rgba(0,0,0,.5)"; x.shadowBlur = 60; x.fillStyle = acc; x.beginPath(); x.arc(540, cy, d / 2 + 16, 0, 6.29); x.fill(); x.restore(); photoIn(x, "circle", 540 - d / 2, cy - d / 2, d, d, S); }
  if (T.num) balloon(x, T.num, sq ? 860 : 850, bY + bH * (sq ? .62 : .66), sq ? 150 : 230, acc);
  // bas : fondu sombre puis textes
  const fy = bY + bH * .62, fg = x.createLinearGradient(0, fy, 0, fy + (H - fy) * .45); fg.addColorStop(0, "rgba(0,0,0,0)"); fg.addColorStop(1, c2); x.fillStyle = fg; x.fillRect(0, fy, 1080, H - fy);
  const L = []; const ns = fitFont(x, T.name, z => `400 ${z}px ${F.script}`, sq ? 120 : 170, 960, 60);
  L.push({ h: ns * 1.02, d: y => { x.save(); x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 20; x.fillStyle = gold(y, y + ns); x.font = `400 ${ns}px ${F.script}`; x.fillText(T.name, 540, y + ns * .8); x.restore(); } });
  if (T.sous) L.push({ h: 56, d: y => { x.fillStyle = ink; x.font = `600 ${sq ? 36 : 42}px ${F.sans}`; spaced(x, T.sous.toUpperCase(), 540, y + 42, 4); } });
  infoB(x, 1, T, ink, acc, sq).forEach(b => L.push({ h: b.h + b.g, d: y => b.d(y + b.g) }));
  if (T.wish) { x.font = `400 ${sq ? 32 : 39}px ${F.sans}`; const WL = wrap(x, T.wish, 880, sq ? 2 : 4), lh = (sq ? 32 : 39) * 1.42; L.push({ h: WL.length * lh + 14, d: y => { x.fillStyle = ink; x.globalAlpha = .92; x.font = `400 ${sq ? 32 : 39}px ${F.sans}`; WL.forEach((l, i) => x.fillText(l, 540, y + 40 + i * lh)); x.globalAlpha = 1; } }); }
  if (T.sig) L.push({ h: 64, d: y => { x.fillStyle = acc; x.font = `400 ${sq ? 46 : 58}px ${F.script}`; x.fillText(T.sig, 540, y + 50, 960); } });
  const tot = L.reduce((a, b) => a + b.h + 10, 0); let y = H - (sq ? 100 : 140) - tot; L.forEach(b => { b.d(y); y += b.h + 10; });
}

/* ---------- Souvenirs : collage façon carnet ---------- */
function heart(x, cx, cy, s) { x.beginPath(); x.moveTo(cx, cy + s * .35); x.bezierCurveTo(cx - s, cy - s * .25, cx - s * .45, cy - s, cx, cy - s * .4); x.bezierCurveTo(cx + s * .45, cy - s, cx + s, cy - s * .25, cx, cy + s * .35); }
function tape(x, cx, cy, w, a, col) { x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = col; x.globalAlpha = .7; x.beginPath(); x.moveTo(-w / 2, -22); for (let i = 0; i <= 6; i++) x.lineTo(w / 2 + (i % 2 ? 6 : 0), -22 + i * 44 / 6); x.lineTo(-w / 2, 22); for (let i = 6; i >= 0; i--) x.lineTo(-w / 2 - (i % 2 ? 6 : 0), -22 + i * 44 / 6); x.fill(); x.restore(); }
function souvenirs(x, H, sq, c1, c2, ink, acc, T, S) {
  x.fillStyle = c1; x.fillRect(0, 0, 1080, H);
  const R = rng(9); x.fillStyle = ink; for (let i = 0; i < 2600; i++) { x.globalAlpha = .035; x.fillRect(R() * 1080, R() * H, 2, 2); } x.globalAlpha = 1;
  x.strokeStyle = c2; x.globalAlpha = .45; x.lineWidth = 1.5; for (let y = 60; y < H; y += 58) { x.beginPath(); x.moveTo(0, y); x.lineTo(1080, y); x.stroke(); } x.globalAlpha = 1;
  // bande de papier kraft déchirée
  const sh = sq ? 150 : 230; x.fillStyle = c2; x.beginPath(); x.moveTo(0, 0); x.lineTo(1080, 0); x.lineTo(1080, sh); for (let X = 1080; X >= 0; X -= 18) x.lineTo(X, sh + (R() - .5) * 22); x.closePath(); x.fill();
  decor(x, H, S, c1, c2, ink, acc);
  x.save(); x.translate(540, sh * .62); x.rotate(-.025); x.fillStyle = ink; const hd = (T.caps || T.big); x.font = `600 ${fitFont(x, hd, z => `600 ${z}px ${F.hand}`, sq ? 96 : 128, 940, 50)}px ${F.hand}`; x.fillText(hd, 0, 0); x.restore();
  x.strokeStyle = acc; x.lineWidth = 5; x.lineCap = "round";
  const pics = [photo, ...extras].filter(Boolean).slice(0, 3), n = Math.max(1, pics.length), cutOn = cutActive(S) && n === 1;
  stack(x, H, sh + 30, sq ? 100 : 140, f => {
    const B = [], ph = (sq ? 400 : (n === 1 ? 760 : n === 2 ? 660 : 820)) * f;
    B.push({ g: 0, h: ph, d: y => {
      const pol = (cx, cy, w, h, a, img, main) => { x.save(); x.translate(cx, cy); x.rotate(a); x.shadowColor = "rgba(0,0,0,.22)"; x.shadowBlur = 26; x.shadowOffsetY = 10; x.fillStyle = "#fff"; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = "transparent";
        const iw = w - 40 * f, ih = h - 130 * f; if (main || !img) photoIn(x, "rect", -iw / 2, -h / 2 + 20 * f, iw, ih, S, !main); else coverImg(x, img, -iw / 2, -h / 2 + 20 * f, iw, ih, S.bw); x.restore();
        tape(x, cx + Math.sin(a) * h / 2, cy - h / 2 + 4, 150 * f, a - .25, acc); };
      if (cutOn) { personDraw(x, 120, y, 840, ph, S, { outline: 14, small: false }); x.fillStyle = acc; for (let i = 0; i < 3; i++) sparkle(x, 170 + i * 380, y + 80 + (i % 2) * 300, 26, acc); }
      else if (n === 1) pol(540, y + ph / 2, ph * .84, ph, -.04, pics[0], true);
      else if (n === 2) { pol(330, y + ph * .44, ph * .7, ph * .86, -.08, pics[1], false); pol(750, y + ph * .56, ph * .7, ph * .86, .06, pics[0], true); }
      else { pol(300, y + ph * .3, ph * .5, ph * .6, -.1, pics[1], false); pol(790, y + ph * .32, ph * .5, ph * .6, .08, pics[2], false); pol(540, y + ph * .66, ph * .56, ph * .66, -.02, pics[0], true); }
      x.fillStyle = acc; heart(x, sq ? 120 : 130, y + ph * .82, 36 * f); x.fill(); x.lineWidth = 4; x.strokeStyle = ink; x.beginPath(); x.moveTo(960, y + 30); x.quadraticCurveTo(1000, y + 120, 950, y + 190); x.stroke(); sparkle(x, 930, y + ph * .9, 22 * f, ink);
    } });
    const nm = T.name, ns = fitFont(x, nm, z => `700 ${z}px ${F.hand}`, (sq ? 120 : 160) * f, 900, 60);
    B.push({ g: 26 * f, h: ns * .95, d: y => { x.font = `700 ${ns}px ${F.hand}`; const w = Math.min(900, x.measureText(nm).width); x.save(); x.fillStyle = acc; x.globalAlpha = .38; x.translate(540, y + ns * .6); x.rotate(-.02); x.fillRect(-w / 2 - 20, -ns * .22, w + 40, ns * .42); x.restore(); x.fillStyle = ink; x.fillText(nm, 540, y + ns * .78); } });
    const line = [T.num && `${T.num} ${T.numSmall}`.trim(), T.sous].filter(Boolean).join(" · ");
    if (line) B.push({ g: 4 * f, h: 60 * f, d: y => { x.fillStyle = ink; x.font = `600 ${50 * f}px ${F.hand}`; x.fillText(line, 540, y + 46 * f, 940); } });
    B.push(...infoB(x, f, T, ink, acc, sq));
    if (T.wish) { x.font = `600 ${44 * f}px ${F.hand}`; const WL = wrap(x, T.wish, 780, sq ? 2 : 4), lh = 52 * f, hh = WL.length * lh + 60 * f;
      B.push({ g: 22 * f, h: hh, d: y => { x.save(); x.translate(540, y + hh / 2); x.rotate(.012); x.shadowColor = "rgba(0,0,0,.15)"; x.shadowBlur = 16; x.shadowOffsetY = 6; x.fillStyle = "#fffdf7"; x.fillRect(-440, -hh / 2, 880, hh); x.shadowColor = "transparent";
        x.strokeStyle = c2; x.lineWidth = 2; for (let i = 0; i < WL.length; i++) { const ly = -hh / 2 + 30 * f + (i + 1) * lh - 2; x.beginPath(); x.moveTo(-400, ly); x.lineTo(400, ly); x.stroke(); }
        x.strokeStyle = acc; x.globalAlpha = .6; x.beginPath(); x.moveTo(-380, -hh / 2); x.lineTo(-380, hh / 2); x.stroke(); x.globalAlpha = 1;
        x.fillStyle = ink; x.font = `600 ${44 * f}px ${F.hand}`; WL.forEach((l, i) => x.fillText(l, 0, -hh / 2 + 30 * f + (i + 1) * lh - 10 * f)); x.restore(); } }); }
    if (T.sig) B.push({ g: 16 * f, h: 64 * f, d: y => { x.fillStyle = acc; x.font = `600 ${54 * f}px ${F.hand}`; x.fillText(T.sig, 540, y + 48 * f, 900); } });
    return B;
  });
}

/* ---------- Wax : motifs africains et couleurs chaudes ---------- */
function waxTile(x, X, Y, s, i, c2, ink, acc, c1) {
  x.fillStyle = i % 2 ? c2 : ink; x.fillRect(X, Y, s, s);
  const m = s / 2;
  if (i % 3 === 0) { x.fillStyle = acc; x.beginPath(); x.moveTo(X + m, Y + 6); x.lineTo(X + s - 6, Y + m); x.lineTo(X + m, Y + s - 6); x.lineTo(X + 6, Y + m); x.fill(); x.fillStyle = c1; x.beginPath(); x.arc(X + m, Y + m, s * .12, 0, 6.29); x.fill(); }
  else if (i % 3 === 1) { x.strokeStyle = acc; x.lineWidth = s * .08; x.beginPath(); x.arc(X + m, Y + m, s * .3, 0, 6.29); x.stroke(); x.fillStyle = c1; x.beginPath(); x.arc(X + m, Y + m, s * .1, 0, 6.29); x.fill(); }
  else { x.fillStyle = acc; x.beginPath(); x.moveTo(X, Y + s); x.lineTo(X + m, Y + m * .3); x.lineTo(X + s, Y + s); x.fill(); x.fillStyle = c1; x.beginPath(); x.moveTo(X + m * .5, Y + s); x.lineTo(X + m, Y + m); x.lineTo(X + m * 1.5, Y + s); x.fill(); }
}
function wax(x, H, sq, c1, c2, ink, acc, T, S) {
  x.fillStyle = c1; x.fillRect(0, 0, 1080, H);
  x.globalAlpha = .07; for (let yy = 100; yy < H - 100; yy += 70) for (let xx = 100; xx < 980; xx += 70) { x.fillStyle = c2; x.beginPath(); x.moveTo(xx, yy - 12); x.lineTo(xx + 12, yy); x.lineTo(xx, yy + 12); x.lineTo(xx - 12, yy); x.fill(); } x.globalAlpha = 1;
  const b = 60; let i = 0;
  for (let X = 0; X < 1080; X += b) { waxTile(x, X, 0, b, i++, c2, ink, acc, c1); waxTile(x, X, H - b, b, i++, c2, ink, acc, c1); }
  for (let Y = b; Y < H - b; Y += b) { waxTile(x, 0, Y, b, i++, c2, ink, acc, c1); waxTile(x, 1080 - b, Y, b, i++, c2, ink, acc, c1); }
  x.strokeStyle = ink; x.lineWidth = 4; x.strokeRect(b + 14, b + 14, 1080 - 2 * b - 28, H - 2 * b - 28);
  decor(x, H, S, c1, c2, ink, acc);
  const cutOn = cutActive(S);
  stack(x, H, b + (sq ? 50 : 80), b + (sq ? 90 : 120), f => {
    const B = [], d = (sq ? 360 : 560) * f;
    B.push({ g: 0, h: 46 * f, d: y => { x.fillStyle = c2; x.font = `700 ${36 * f}px ${F.sans}`; spaced(x, (S.occ === "compte" ? T.caps : T.kick).toUpperCase(), 540, y + 36 * f, 10 * f); } });
    if (S.occ !== "compte" && T.big) { const hs = fitFont(x, T.big.toUpperCase(), z => `400 ${z}px ${F.bebas}`, 170 * f, 880, 70);
      B.push({ g: 6 * f, h: hs * .85, d: y => { x.font = `400 ${hs}px ${F.bebas}`; x.fillStyle = acc; x.fillText(T.big.toUpperCase(), 548, y + hs * .82 + 8); x.fillStyle = ink; x.fillText(T.big.toUpperCase(), 540, y + hs * .82); } }); }
    B.push({ g: 30 * f, h: d + 30 * f, d: y => { const cx = 540, cy = y + 15 * f + d / 2;
      x.fillStyle = acc; for (let k = 0; k < 36; k++) { const a = k / 36 * 6.283; x.beginPath(); x.arc(cx + Math.cos(a) * (d / 2 + 44 * f), cy + Math.sin(a) * (d / 2 + 44 * f), 7 * f, 0, 6.29); x.fill(); }
      x.fillStyle = c2; x.beginPath(); x.arc(cx, cy, d / 2 + 26 * f, 0, 6.29); x.fill(); x.fillStyle = acc; x.beginPath(); x.arc(cx, cy, d / 2 + 10 * f, 0, 6.29); x.fill();
      if (cutOn) { x.fillStyle = c2; x.beginPath(); x.arc(cx, cy, d / 2, 0, 6.29); x.fill(); x.save(); x.beginPath(); x.arc(cx, cy, d / 2, 0, 6.29); x.rect(cx - d * .62, cy - d * 1.05, d * 1.24, d * 1.05); x.clip("nonzero"); personDraw(x, cx - d * .62, cy - d * .78, d * 1.24, d * 1.28, S, { shadow: false }); x.restore(); }
      else photoIn(x, "circle", cx - d / 2, cy - d / 2, d, d, S);
      if (T.num && S.occ !== "compte") { const r = 92 * f, bx = cx + d * .4, by = cy + d * .36; x.fillStyle = ink; x.beginPath(); x.arc(bx, by, r, 0, 6.29); x.fill(); x.strokeStyle = acc; x.lineWidth = 8 * f; x.stroke(); x.fillStyle = acc; x.font = `400 ${84 * f}px ${F.bebas}`; x.fillText(T.num, bx, by + 22 * f); x.font = `600 ${24 * f}px ${F.sans}`; x.fillStyle = c1; x.fillText(T.numSmall.toUpperCase(), bx, by + 52 * f); }
      if (S.occ === "compte" && T.num) { x.fillStyle = ink; rr(x, cx - 130 * f, cy + d / 2 - 10 * f, 260 * f, 96 * f, 48 * f); x.fill(); x.fillStyle = acc; x.font = `400 ${80 * f}px ${F.bebas}`; x.fillText(T.num, cx, cy + d / 2 + 66 * f); }
    } });
    const ns = fitFont(x, T.name, z => `400 ${z}px ${F.lilita}`, 104 * f, 880, 46);
    B.push({ g: 28 * f, h: ns * 1.02, d: y => { x.fillStyle = c2; x.font = `400 ${ns}px ${F.lilita}`; x.fillText(T.name, 540, y + ns * .85); } });
    if (T.sous) B.push({ g: 4 * f, h: 52 * f, d: y => { x.fillStyle = ink; x.font = `600 ${40 * f}px ${F.sans}`; x.fillText(T.sous, 540, y + 40 * f, 880); } });
    B.push(...infoB(x, f, T, ink, c2, sq));
    if (T.wish) { x.font = `400 ${37 * f}px ${F.sans}`; const WL = wrap(x, T.wish, 800, sq ? 2 : 4), lh = 37 * f * 1.42, hh = WL.length * lh + 50 * f;
      B.push({ g: 24 * f, h: hh, d: y => { x.fillStyle = "rgba(255,255,255,.7)"; rr(x, 120, y, 840, hh, 18); x.fill(); x.fillStyle = c2; x.fillRect(120, y, 10, hh); x.fillStyle = ink; x.font = `400 ${37 * f}px ${F.sans}`; WL.forEach((l, k) => x.fillText(l, 545, y + 25 * f + 37 * f + k * lh - 4 * f)); } }); }
    if (T.sig) B.push({ g: 16 * f, h: 66 * f, d: y => { x.fillStyle = c2; x.font = `400 ${56 * f}px ${F.script}`; x.fillText(T.sig, 540, y + 50 * f, 880); } });
    return B;
  });
}

function eclat(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createLinearGradient(0, 0, 1080, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  const glow = (X, Y, r, c) => { const rg = x.createRadialGradient(X, Y, 0, X, Y, r); rg.addColorStop(0, c); rg.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = rg; x.fillRect(0, 0, 1080, H); };
  glow(900, H * .12, 520, "rgba(255,255,255,.28)"); glow(120, H * .85, 600, "rgba(255,255,255,.18)");
  confetti(x, H, ["#FFFFFF", acc, "rgba(255,255,255,.7)"], sq ? 46 : 80, 7);
  decor(x, H, S, c1, c2, ink, acc);
  stack(x, H, sq ? 60 : 110, sq ? 110 : 150, f => {
    const B = [], ps = (sq ? 360 : 580) * f;
    B.push({ g: 0, h: 52 * f, d: y => { x.fillStyle = "#fff"; x.font = `600 ${44 * f}px ${F.sans}`; spaced(x, T.kick.toUpperCase(), 540, y + 42 * f, 14 * f); } });
    if (T.big) { const s = fitFont(x, T.big, z => `400 ${z}px ${F.script}`, 190 * f, 940, 90); B.push({ g: 0, h: s * 1.05, d: y => { x.save(); x.shadowColor = "rgba(0,0,0,.18)"; x.shadowBlur = 20; x.fillStyle = "#fff"; x.font = `400 ${s}px ${F.script}`; x.fillText(T.big, 540, y + s * .8); x.restore(); } }); }
    B.push({ g: 26 * f, h: ps + 40 * f, d: y => {
      const cx = 540, cy = y + 20 * f + ps / 2;
      x.save(); x.shadowColor = "rgba(0,0,0,.28)"; x.shadowBlur = 50; x.shadowOffsetY = 18; x.fillStyle = "#fff"; x.beginPath(); x.arc(cx, cy, ps / 2 + 18 * f, 0, 6.29); x.fill(); x.restore();
      x.strokeStyle = acc; x.lineWidth = 6 * f; x.beginPath(); x.arc(cx, cy, ps / 2 + 34 * f, 0, 6.29); x.setLineDash([2, 18 * f]); x.lineCap = "round"; x.stroke(); x.setLineDash([]);
      photoIn(x, "circle", cx - ps / 2, cy - ps / 2, ps, ps, S);
      if (T.num) { const r = 108 * f, bx = cx + ps * .36, by = cy + ps * .34; x.save(); x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 24; x.fillStyle = acc; x.beginPath(); x.arc(bx, by, r, 0, 6.29); x.fill(); x.restore();
        x.fillStyle = "#1A1030"; const ns = fitFont(x, T.num, z => `800 ${z}px ${F.sans}`, 108 * f, r * 1.6, 40); x.fillText(T.num, bx, by + (T.numSmall ? ns * .2 : ns * .35)); if (T.numSmall) { x.font = `600 ${32 * f}px ${F.sans}`; x.fillText(T.numSmall, bx, by + ns * .2 + 40 * f); } }
    } });
    const ns = fitFont(x, T.name.toUpperCase(), z => `800 ${z}px ${F.sans}`, 112 * f, 940, 50);
    B.push({ g: 26 * f, h: ns * 1.05, d: y => { x.fillStyle = "#fff"; x.font = `800 ${ns}px ${F.sans}`; spaced(x, T.name.toUpperCase(), 540, y + ns * .85, 3); } });
    if (T.sous) B.push({ g: 8 * f, h: 56 * f, d: y => { x.fillStyle = "rgba(255,255,255,.92)"; x.font = `500 ${44 * f}px ${F.sans}`; x.fillText(T.sous, 540, y + 44 * f, 960); } });
    B.push(...infoB(x, f, T, "#ffffff", acc, sq));
    if (T.wish) { x.font = `400 ${40 * f}px ${F.sans}`; const L = wrap(x, T.wish, 840, sq ? 3 : 6), lh = 40 * f * 1.4, hh = L.length * lh + 70 * f;
      B.push({ g: 34 * f, h: hh, d: y => { x.fillStyle = "rgba(255,255,255,.16)"; rr(x, 70, y, 940, hh, 36); x.fill(); x.strokeStyle = "rgba(255,255,255,.4)"; x.lineWidth = 2; x.stroke();
        x.fillStyle = "#fff"; x.font = `400 ${40 * f}px ${F.sans}`; L.forEach((l, i) => x.fillText(l, 540, y + 35 * f + 40 * f + i * lh - 8 * f)); } }); }
    if (T.sig) B.push({ g: 24 * f, h: 76 * f, d: y => { x.fillStyle = "#fff"; x.font = `400 ${66 * f}px ${F.script}`; x.fillText(T.sig, 540, y + 60 * f, 960); } });
    return B;
  });
}
function prestige(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createRadialGradient(540, H * .3, 0, 540, H * .3, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  const R = rng(3); x.fillStyle = acc; for (let i = 0; i < 90; i++) { x.globalAlpha = R() * .5; x.beginPath(); x.arc(R() * 1080, R() * H, R() * 2.6 + .6, 0, 6.29); x.fill(); } x.globalAlpha = 1;
  x.strokeStyle = acc; x.lineWidth = 3; x.strokeRect(44, 44, 992, H - 88); x.globalAlpha = .55; x.lineWidth = 1.5; x.strokeRect(60, 60, 960, H - 120); x.globalAlpha = 1;
  [[60, 60, 1, 1], [1020, 60, -1, 1], [60, H - 60, 1, -1], [1020, H - 60, -1, -1]].forEach(([a, b, sx, sy]) => { x.beginPath(); x.moveTo(a, b + sy * 90); x.lineTo(a + sx * 26, b + sy * 26); x.lineTo(a + sx * 90, b); x.stroke(); });
  decor(x, H, S, c1, c2, ink, acc);
  const gold = (y0, y1) => { const gg = x.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, "#F6E3A3"); gg.addColorStop(.55, acc); gg.addColorStop(1, "#A97A22"); return S.pal === 2 ? "#E9EEF8" : gg; };
  stack(x, H, sq ? 90 : 130, sq ? 120 : 160, f => {
    const B = [], pw = (sq ? 330 : 560) * f, ph = (sq ? 400 : 680) * f;
    B.push({ g: 0, h: 50 * f, d: y => { x.fillStyle = acc; x.font = `700 ${40 * f}px ${F.cinzel}`; const t = T.caps.toUpperCase() || T.num; const s = fitFont(x, t, z => `700 ${z}px ${F.cinzel}`, 40 * f, 900, 24); spaced(x, t, 540, y + s, 8 * f); } });
    B.push({ g: 36 * f, h: ph, d: y => { x.save(); x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 40; photoIn(x, "arch", 540 - pw / 2, y, pw, ph, S); x.restore();
      x.strokeStyle = acc; x.lineWidth = 6 * f; x.beginPath(); x.moveTo(540 - pw / 2 - 16, y + ph + 16); x.lineTo(540 - pw / 2 - 16, y + pw / 2); x.arc(540, y + pw / 2, pw / 2 + 16, Math.PI, 0); x.lineTo(540 + pw / 2 + 16, y + ph + 16); x.closePath(); x.stroke(); } });
    const ns = fitFont(x, T.name, z => `400 ${z}px ${F.script}`, 160 * f, 900, 70);
    B.push({ g: 30 * f, h: ns * 1.1, d: y => { x.fillStyle = gold(y, y + ns); x.font = `400 ${ns}px ${F.script}`; x.fillText(T.name, 540, y + ns * .82); } });
    const line = T.num ? `${T.num} ${T.numSmall}`.trim().toUpperCase() : T.sous.toUpperCase();
    if (line) B.push({ g: 6 * f, h: 60 * f, d: y => { const ls = fitFont(x, line, z => `700 ${z}px ${F.cinzel}`, 44 * f, 800, 22); x.fillStyle = acc; spaced(x, line, 540, y + 46 * f, 4 * f); const w = x.measureText(line).width + line.length * 4 * f;
      if (w < 600) { x.strokeStyle = acc; x.lineWidth = 2; x.beginPath(); x.moveTo(540 - w / 2 - 110, y + 32 * f); x.lineTo(540 - w / 2 - 30, y + 32 * f); x.moveTo(540 + w / 2 + 30, y + 32 * f); x.lineTo(540 + w / 2 + 110, y + 32 * f); x.stroke(); } } });
    if (T.num && T.sous) B.push({ g: 4 * f, h: 46 * f, d: y => { x.fillStyle = ink; x.globalAlpha = .8; x.font = `400 ${32 * f}px ${F.cinzel}`; x.fillText(T.sous.toUpperCase(), 540, y + 34 * f, 900); x.globalAlpha = 1; } });
    B.push(...infoB(x, f, T, ink, acc, sq));
    if (T.wish) { x.font = `italic 400 ${40 * f}px ${F.serif}`; const L = wrap(x, T.wish, 820, sq ? 3 : 6), lh = 40 * f * 1.45;
      B.push({ g: 30 * f, h: L.length * lh, d: y => { x.fillStyle = ink; x.font = `italic 400 ${40 * f}px ${F.serif}`; L.forEach((l, i) => x.fillText(l, 540, y + 38 * f + i * lh)); } }); }
    if (T.sig) B.push({ g: 26 * f, h: 56 * f, d: y => { x.fillStyle = acc; x.font = `italic 400 ${38 * f}px ${F.serif}`; x.fillText("— " + T.sig, 540, y + 42 * f, 900); } });
    return B;
  });
}
function pop(x, H, sq, c1, c2, ink, acc, T, S) {
  x.fillStyle = c1; x.fillRect(0, 0, 1080, H);
  x.fillStyle = c2; x.beginPath(); x.arc(1000, sq ? 60 : 160, sq ? 260 : 360, 0, 6.29); x.fill();
  x.fillStyle = acc; x.beginPath(); x.arc(60, H - (sq ? 80 : 220), sq ? 220 : 320, 0, 6.29); x.fill();
  x.fillStyle = "rgba(255,255,255,.55)"; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(120 + (i % 7) * 34, (sq ? 120 : 260) + Math.floor(i / 7) * 34, 7, 0, 6.29); x.fill(); }
  [[900, H * .55, 46, "#fff"], [150, H * .3, 34, ink], [960, H * .82, 30, "#fff"]].forEach(([a, b, r, c]) => { x.fillStyle = c; star(x, a, b, r, r * .45, 5); x.fill(); });
  decor(x, H, S, c1, c2, ink, acc);
  const out = (t, X, Y, fill) => { x.lineJoin = "round"; x.lineWidth = 16; x.strokeStyle = ink; x.strokeText(t, X, Y); x.fillStyle = fill; x.fillText(t, X, Y); };
  stack(x, H, sq ? 50 : 100, sq ? 110 : 150, f => {
    const B = [], pw = (sq ? 360 : 600) * f, ph = pw * 1.12;
    const head = (T.num && S.occ === "compte") ? T.num : (T.caps || T.big).toUpperCase();
    x.font = `400 ${150 * f}px ${F.lilita}`; const HL = wrap(x, head, 920, 2); let hs = 150 * f; HL.forEach(l => { hs = Math.min(hs, fitFont(x, l, z => `400 ${z}px ${F.lilita}`, hs, 940, 60)); });
    B.push({ g: 0, h: HL.length * hs * .95, d: y => { x.font = `400 ${hs}px ${F.lilita}`; HL.forEach((l, i) => { x.save(); x.translate(540, y + hs * .82 + i * hs * .95); x.rotate(i % 2 ? .02 : -.03); out(l, 0, 0, i % 2 ? "#fff" : acc); x.restore(); }); } });
    B.push({ g: 30 * f, h: ph + 20 * f, d: y => { x.save(); x.translate(540, y + ph / 2 + 10 * f); x.rotate(-.05); x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 30; x.shadowOffsetY = 14; x.fillStyle = "#fff"; x.fillRect(-pw / 2, -ph / 2, pw, ph); x.shadowColor = "transparent";
      photoIn(x, "rect", -pw / 2 + 24 * f, -ph / 2 + 24 * f, pw - 48 * f, pw - 48 * f, S);
      x.fillStyle = "rgba(255,255,255,.65)"; x.save(); x.rotate(.08); x.fillRect(-90 * f, -ph / 2 - 26 * f, 180 * f, 52 * f); x.restore();
      x.fillStyle = ink; const cap = S.occ === "compte" ? T.caps : (T.sous || T.name); x.font = `600 ${50 * f}px ${F.hand}`; x.fillText(cap, 0, ph / 2 - 36 * f, pw - 60 * f); x.restore();
      if (T.num && S.occ !== "compte") { const bx = 540 + pw * .42, by = y + 40 * f, r = 112 * f; x.fillStyle = acc; star(x, bx, by + r, r, r * .78, 12); x.fill(); x.lineWidth = 6; x.strokeStyle = ink; x.stroke(); x.fillStyle = ink; x.font = `400 ${86 * f}px ${F.lilita}`; x.fillText(T.num, bx, by + r + 22 * f); x.font = `400 ${30 * f}px ${F.lilita}`; x.fillText(T.numSmall.toUpperCase(), bx, by + r + 56 * f); }
    } });
    { const ns = fitFont(x, T.name.toUpperCase(), z => `400 ${z}px ${F.lilita}`, 100 * f, 920, 46); B.push({ g: 24 * f, h: ns, d: y => { x.font = `400 ${ns}px ${F.lilita}`; out(T.name.toUpperCase(), 540, y + ns * .85, "#fff"); } }); }
    if (T.sous && S.occ === "compte") B.push({ g: 16 * f, h: 54 * f, d: y => { x.fillStyle = ink; x.font = `600 ${42 * f}px ${F.sans}`; x.fillText(T.sous, 540, y + 42 * f, 940); } });
    B.push(...infoB(x, f, T, ink, ink, sq));
    if (T.wish) { x.font = `500 ${38 * f}px ${F.sans}`; const L = wrap(x, T.wish, 820, sq ? 3 : 5), lh = 38 * f * 1.38, hh = L.length * lh + 64 * f;
      B.push({ g: 34 * f, h: hh + 30 * f, d: y => { x.fillStyle = "#fff"; rr(x, 80, y, 920, hh, 40); x.fill(); x.beginPath(); x.moveTo(700, y + hh - 2); x.lineTo(760, y + hh + 30 * f); x.lineTo(780, y + hh - 2); x.fill(); x.lineWidth = 6; x.strokeStyle = ink; rr(x, 80, y, 920, hh, 40); x.stroke();
        x.fillStyle = ink; x.font = `500 ${38 * f}px ${F.sans}`; L.forEach((l, i) => x.fillText(l, 540, y + 32 * f + 38 * f + i * lh - 6 * f)); } }); }
    if (T.sig) B.push({ g: 10 * f, h: 70 * f, d: y => { x.fillStyle = ink; x.font = `600 ${60 * f}px ${F.hand}`; x.fillText(T.sig, 540, y + 54 * f, 940); } });
    return B;
  });
}
function elegance(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  const leaf = (X, Y, a, s, col) => { x.save(); x.translate(X, Y); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(s * .5, -s * .35, s, 0); x.quadraticCurveTo(s * .5, s * .35, 0, 0); x.fill(); x.restore(); };
  const branch = (X, Y, a0, k) => { x.save(); x.strokeStyle = acc; x.globalAlpha = .55; x.lineWidth = 3; x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(X + Math.cos(a0) * 160 * k, Y + Math.sin(a0) * 40, X + Math.cos(a0) * 320 * k, Y + Math.sin(a0) * 260 * k); x.stroke(); x.globalAlpha = 1;
    for (let i = 1; i < 8; i++) { const t = i / 8, bx = X + Math.cos(a0) * 320 * k * t, by = Y + Math.sin(a0) * 260 * k * t * t; leaf(bx, by, a0 + (i % 2 ? -.9 : .9), 70 * k, i % 3 ? acc + "99" : acc + "55"); } x.restore(); };
  branch(40, 40, .55, 1); branch(1040, H - 40, .55 + Math.PI, 1);
  x.strokeStyle = acc; x.globalAlpha = .45; x.lineWidth = 2; x.strokeRect(36, 36, 1008, H - 72); x.globalAlpha = 1;
  decor(x, H, S, c1, c2, ink, acc);
  stack(x, H, sq ? 80 : 130, sq ? 120 : 160, f => {
    const B = [], pw = (sq ? 320 : 520) * f, ph = (sq ? 380 : 660) * f;
    B.push({ g: 0, h: 46 * f, d: y => { x.fillStyle = acc; x.font = `500 ${34 * f}px ${F.sans}`; const t = (T.caps || T.big).toUpperCase(); spaced(x, t, 540, y + 36 * f, 10 * f); } });
    B.push({ g: 36 * f, h: ph + 30 * f, d: y => { x.strokeStyle = acc; x.lineWidth = 2; x.beginPath(); x.ellipse(540 + 14, y + ph / 2 + 24 * f, pw / 2 + 10, ph / 2 + 10, 0, 0, 6.29); x.stroke(); photoIn(x, "oval", 540 - pw / 2, y + 10 * f, pw, ph, S); x.lineWidth = 6 * f; x.strokeStyle = "#fff"; x.beginPath(); x.ellipse(540, y + 10 * f + ph / 2, pw / 2, ph / 2, 0, 0, 6.29); x.stroke(); } });
    const ns = fitFont(x, T.name, z => `400 ${z}px ${F.script}`, 150 * f, 920, 64);
    B.push({ g: 24 * f, h: ns * 1.08, d: y => { x.fillStyle = ink; x.font = `400 ${ns}px ${F.script}`; x.fillText(T.name, 540, y + ns * .8); } });
    const line = T.num ? `${T.num} ${T.numSmall}`.trim() : T.sous;
    if (line) B.push({ g: 4 * f, h: 58 * f, d: y => { x.fillStyle = acc; x.font = `italic 400 ${48 * f}px ${F.serif}`; x.fillText(line, 540, y + 46 * f, 900); } });
    if (T.num && T.sous) B.push({ g: 2 * f, h: 46 * f, d: y => { x.fillStyle = ink; x.globalAlpha = .75; x.font = `400 ${32 * f}px ${F.sans}`; x.fillText(T.sous, 540, y + 34 * f, 900); x.globalAlpha = 1; } });
    B.push(...infoB(x, f, T, ink, acc, sq));
    if (T.wish) { x.font = `400 ${39 * f}px ${F.serif}`; const L = wrap(x, T.wish, 800, sq ? 3 : 6), lh = 39 * f * 1.5;
      B.push({ g: 30 * f, h: L.length * lh + 20 * f, d: y => { x.fillStyle = acc; x.font = `400 ${90 * f}px ${F.serif}`; x.globalAlpha = .3; x.fillText("“", 540, y + 50 * f); x.globalAlpha = 1; x.fillStyle = ink; x.font = `400 ${39 * f}px ${F.serif}`; L.forEach((l, i) => x.fillText(l, 540, y + 56 * f + i * lh)); } }); }
    if (T.sig) B.push({ g: 20 * f, h: 70 * f, d: y => { x.fillStyle = acc; x.font = `400 ${58 * f}px ${F.script}`; x.fillText(T.sig, 540, y + 54 * f, 920); } });
    return B;
  });
}
function affiche(x, H, sq, c1, c2, ink, acc, T, S) {
  x.fillStyle = c2; x.fillRect(0, 0, 1080, H);
  if (cutActive(S)) { // effet magazine : grand nom derrière la personne détourée
    const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, mixH(acc, "#000000", .55)); bg.addColorStop(1, "#050505"); x.fillStyle = bg; x.fillRect(0, 0, 1080, H);
    const nm = (T.name.split(/\s+/)[0] || T.name).toUpperCase(), bs = fitFont(x, nm, z => `400 ${z}px ${F.bebas}`, sq ? 420 : 560, 1060, 120);
    x.save(); x.font = `400 ${bs}px ${F.bebas}`; x.fillStyle = acc; x.globalAlpha = .95; x.fillText(nm, 540, (sq ? 120 : 200) + bs * .82); x.restore();
    personDraw(x, 0, sq ? 90 : 170, 1080, H * (sq ? .9 : .8), S, { outline: 0 });
  } else photoIn(x, "rect", 0, 0, 1080, H, S);
  const g = x.createLinearGradient(0, H * .3, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.55, "rgba(0,0,0,.72)"); g.addColorStop(1, "rgba(0,0,0,.92)"); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  const tg = x.createLinearGradient(0, 0, 0, 260); tg.addColorStop(0, "rgba(0,0,0,.5)"); tg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = tg; x.fillRect(0, 0, 1080, 260);
  decor(x, H, S, c1, c2, ink, acc);
  x.textAlign = "left";
  const lab = (T.caps || T.big).toUpperCase(); x.font = `400 ${sq ? 62 : 74}px ${F.bebas}`; const lw = Math.min(900, x.measureText(lab).width + 60);
  x.fillStyle = acc; x.fillRect(70, sq ? 60 : 90, lw, sq ? 82 : 96); x.fillStyle = "#111"; x.fillText(lab, 100, (sq ? 60 : 90) + (sq ? 64 : 76), 860);
  // bas aligné
  const L = 80, maxW = 920; const lines = [];
  if (T.num) { const s = sq ? 220 : 340; lines.push({ h: s * .82, d: y => { x.font = `400 ${s}px ${F.bebas}`; x.lineWidth = 5; x.strokeStyle = acc; x.strokeText(T.num, L - 6, y + s * .8); if (T.numSmall) { const w = x.measureText(T.num).width; x.fillStyle = acc; x.font = `400 ${s * .26}px ${F.bebas}`; x.fillText(T.numSmall.toUpperCase(), L + w + 16, y + s * .8); } } }); }
  const ns = fitFont(x, T.name.toUpperCase(), z => `400 ${z}px ${F.bebas}`, sq ? 150 : 210, maxW, 70);
  x.font = `400 ${ns}px ${F.bebas}`; const NL = wrap(x, T.name.toUpperCase(), maxW, 2);
  lines.push({ h: NL.length * ns * .9, d: y => { x.fillStyle = "#fff"; x.font = `400 ${ns}px ${F.bebas}`; NL.forEach((l, i) => x.fillText(l, L, y + ns * .82 + i * ns * .9)); } });
  if (T.sous) lines.push({ h: 64, d: y => { x.fillStyle = acc; x.font = `600 ${sq ? 40 : 46}px ${F.sans}`; x.fillText(T.sous, L, y + 48, maxW); } });
  infoB(x, 1, T, "#ffffff", acc, sq, 80).forEach(b => lines.push({ h: b.h + b.g, d: y => b.d(y + b.g) }));
  if (T.wish) { x.font = `400 ${sq ? 34 : 40}px ${F.sans}`; const WL = wrap(x, T.wish, maxW, sq ? 2 : 5), lh = (sq ? 34 : 40) * 1.42; lines.push({ h: WL.length * lh + 20, d: y => { x.fillStyle = "rgba(255,255,255,.92)"; x.font = `400 ${sq ? 34 : 40}px ${F.sans}`; WL.forEach((l, i) => x.fillText(l, L, y + 40 + i * lh)); } }); }
  if (T.sig) lines.push({ h: 56, d: y => { x.fillStyle = "#fff"; x.font = `600 ${sq ? 30 : 36}px ${F.sans}`; x.fillRect(L, y + 20, 50, 4); x.fillText(T.sig, L + 66, y + 36, maxW - 66); } });
  const tot = lines.reduce((a, b) => a + b.h + 16, 0); let y = H - (sq ? 110 : 150) - tot;
  lines.forEach(b => { b.d(y); y += b.h + 16; });
  x.textAlign = "center";
}
function sobre(x, H, sq, c1, c2, ink, acc, T, S) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 1080, H);
  x.strokeStyle = ink; x.globalAlpha = .7; x.lineWidth = 2; x.strokeRect(50, 50, 980, H - 100); x.globalAlpha = .3; x.strokeRect(64, 64, 952, H - 128); x.globalAlpha = 1;
  decor(x, H, S, c1, c2, ink, acc);
  stack(x, H, sq ? 90 : 140, sq ? 120 : 170, f => {
    const B = [], pw = (sq ? 300 : 520) * f, ph = (sq ? 370 : 650) * f;
    B.push({ g: 0, h: 70 * f, d: y => { x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 2; x.beginPath(); x.moveTo(540 - 150, y + 44 * f); x.lineTo(540 - 40, y + 44 * f); x.moveTo(540 + 40, y + 44 * f); x.lineTo(540 + 150, y + 44 * f); x.stroke();
      x.beginPath(); x.moveTo(540, y); x.quadraticCurveTo(540 - 16 * f, y + 20 * f, 540, y + 32 * f); x.quadraticCurveTo(540 + 16 * f, y + 20 * f, 540, y); x.fill(); x.strokeRect(540 - 10 * f, y + 38 * f, 20 * f, 30 * f); } });
    B.push({ g: 20 * f, h: 56 * f, d: y => { x.fillStyle = ink; x.font = `400 ${44 * f}px ${F.cinzel}`; spaced(x, T.caps.toUpperCase(), 540, y + 44 * f, 10 * f); } });
    B.push({ g: 34 * f, h: ph, d: y => { x.save(); x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = 30; x.shadowOffsetY = 10; x.fillStyle = "#fff"; x.fillRect(540 - pw / 2 - 14, y - 14, pw + 28, ph + 28); x.restore(); photoIn(x, "rect", 540 - pw / 2, y, pw, ph, S); } });
    const ns = fitFont(x, T.name, z => `400 ${z}px ${F.serif}`, 86 * f, 900, 44); x.font = `400 ${ns}px ${F.serif}`; const NL = wrap(x, T.name, 900, 2);
    B.push({ g: 44 * f, h: NL.length * ns * 1.12, d: y => { x.fillStyle = ink; x.font = `400 ${ns}px ${F.serif}`; NL.forEach((l, i) => x.fillText(l, 540, y + ns * .85 + i * ns * 1.12)); } });
    if (T.sous) B.push({ g: 6 * f, h: 52 * f, d: y => { x.fillStyle = acc; x.font = `400 ${40 * f}px ${F.cinzel}`; spaced(x, T.sous, 540, y + 40 * f, 6 * f); } });
    B.push(...infoB(x, f, T, ink, acc, sq));
    if (T.wish) { x.font = `italic 400 ${38 * f}px ${F.serif}`; const L = wrap(x, T.wish, 800, sq ? 3 : 6), lh = 38 * f * 1.5;
      B.push({ g: 30 * f, h: L.length * lh, d: y => { x.fillStyle = ink; x.globalAlpha = .9; x.font = `italic 400 ${38 * f}px ${F.serif}`; L.forEach((l, i) => x.fillText(l, 540, y + 36 * f + i * lh)); x.globalAlpha = 1; } }); }
    if (T.sig) B.push({ g: 24 * f, h: 50 * f, d: y => { x.fillStyle = acc; x.font = `500 ${32 * f}px ${F.sans}`; spaced(x, T.sig.toUpperCase(), 540, y + 36 * f, 4 * f); } });
    return B;
  });
}

/* ---------------- Rendu et interactions ---------------- */
const cv = $("#cv"), ctx = cv.getContext("2d");
let raf = 0;
function render() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
  draw(ctx, st, 1, false, selI);
  const T = texts(st); cv.setAttribute("aria-label", `Aperçu du flyer ${STY[st.style].l} : ${[T.caps || T.big, T.name, T.num && `${T.num} ${T.numSmall}`, T.sous, T.wish, T.sig].filter(Boolean).join(". ")}`);
  save();
}); }
function rerender() { render(); thumbs(); }
if (document.fonts?.addEventListener) { const onFonts = () => rerender(); document.fonts.addEventListener("loadingdone", onFonts); cleanups.push(() => document.fonts.removeEventListener("loadingdone", onFonts)); }
document.fonts?.load(`400 40px ${F.script}`).then(() => Promise.all(["700 40px Cinzel", "400 40px 'Bebas Neue'", "400 40px 'Lilita One'", "800 40px Outfit", "400 40px Outfit", "italic 400 40px 'Playfair Display'", "400 40px 'Playfair Display'", "600 40px Caveat"].map(f => document.fonts.load(f)))).catch(() => {}).finally(rerender);

$("#f").addEventListener("submit", e => e.preventDefault());
$("#f").addEventListener("change", e => {
  const t = e.target;
  if (t.name === "occ") { st.occ = t.value; st.style = OCC[st.occ].styles[0]; st.pal = OCC[st.occ].pal || 0; st.idea = 0; st.form = 0; st.edited = false; st.bw = isMourn(st) && !!photo; syncForm(); }
  else if (t.id === "etype") { st.etype = t.value; const L = occList(); if (!L.includes(st.occ)) { st.occ = L[0]; st.style = OCC[st.occ].styles[0]; st.pal = OCC[st.occ].pal || 0; st.idea = 0; st.form = 0; st.edited = false; } syncForm(); }
  else if (t.name === "sty") { st.style = t.value; st.pal = 0; renderStyles(); renderStk(); if (cutAvail && COMPOS.includes(st.style) && photo && !cut && !busy && !autoCutTried) { autoCutTried = true; $("#cut-btn").click(); } }
  else if (t.name === "pal") { st.pal = +t.value; renderStk(); }
  else if (t.id === "rel" || t.id === "ton") { st[t.id] = t.value; st.idea = 0; if (t.id === "ton") { st.form = 0; $("#form").innerHTML = formList(st).map((f2, i) => `<option value="${i}">${f2 || "Sans formule"}</option>`).join(""); } if (!st.edited) fillWish(); }
  else if (t.id === "form") st.form = +t.value;
  else if (t.id === "bw") st.bw = t.checked;
  else if (t.id === "film") st.film = t.checked;
  else if (t.id === "music") st.music = t.checked;
  render(); if (t.name !== "sty") thumbs();
});
$("#f").addEventListener("input", e => {
  const t = e.target;
  if (["nom", "sous", "sig", "quand", "lieu", "prix", "lien", "tags"].includes(t.id)) st[t.id] = t.value;
  else if (t.id === "num") { t.value = t.value.replace(/\D/g, ""); st.num = t.value; }
  else if (t.id === "voeu") { st.voeu = t.value; st.edited = true; count(); }
  if (["nom", "num"].includes(t.id) && !st.edited) fillWish();
  render();
});
$("#idea").addEventListener("click", () => { st.idea++; st.edited = false; fillWish(); render(); $("#sr").textContent = "Nouveau message proposé."; });
$$("input[name=fmt]").forEach(r => r.addEventListener("change", () => { st.fmt = r.value; render(); }));

// Photo
function setPhoto(file) {
  if (!file || !/^image\//.test(file.type)) { $("#sr").textContent = "Ce fichier n'est pas une image."; return; }
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => { photo = img; cut = null; xcuts = []; lastFail = false; st.cutOn = false; outCache.clear(); cutUi(); $("#ph-tools").hidden = false; $("#cut-tip").textContent = ""; pz = 1; px = py = 0; $("#zm").value = 100; $("#zm-v").textContent = "100 %"; $("#zoom").hidden = false; $("#bw-w").hidden = false; if (st.occ === "hommage") { st.bw = true; $("#bw").checked = true; }
    $("#thumb").style.backgroundImage = `url(${url})`; $("#thumb").innerHTML = ""; $("#drop").classList.add("has"); $("#ph-t").textContent = "Photo ajoutée"; $("#ph-s").textContent = "Glissez-la dans l'aperçu pour la recadrer."; $("#ph-rm").hidden = false;
    $("#hint").textContent = "Glissez la photo dans l'aperçu pour la recadrer."; rerender(); $("#sr").textContent = "Photo ajoutée."; };
  img.onerror = () => { $("#sr").textContent = "Impossible de lire cette image."; };
  img.src = url;
}
$("#ph").addEventListener("change", e => setPhoto(e.target.files[0]));
$("#drop").addEventListener("dragover", e => { e.preventDefault(); });
$("#drop").addEventListener("drop", e => { e.preventDefault(); setPhoto(e.dataTransfer.files[0]); });
$("#ph-rm").addEventListener("click", () => { photo = null; cut = null; st.cutOn = false; cutUi(); $("#cut-tip").textContent = ""; $("#ph").value = ""; $("#thumb").style.backgroundImage = ""; $("#thumb").innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-9 8"/></svg>';
  $("#drop").classList.remove("has"); $("#ph-t").textContent = "Ajoutez sa plus belle photo"; $("#ph-s").textContent = "JPG ou PNG. Elle reste sur votre téléphone."; $("#ph-rm").hidden = true; $("#zoom").hidden = true; $("#bw-w").hidden = true; $("#hint").textContent = "L'aperçu se met à jour pendant que vous écrivez."; rerender(); });
// Logo (styles Pro et Affiche événement)
$("#lg").addEventListener("change", e => { const f2 = e.target.files[0]; if (!f2 || !/^image\//.test(f2.type)) return; const im = new Image(); im.onload = () => { logo = im; $("#lg-l span").textContent = "Logo ajouté"; if (!["pro", "event"].includes(st.style)) { const s2 = OCC[st.occ].styles.find(k => ["pro", "event"].includes(k)); if (s2) { st.style = s2; st.pal = 0; renderStyles(); } } rerender(); $("#sr").textContent = "Logo ajouté."; }; im.src = URL.createObjectURL(f2); e.target.value = ""; });
// Photos du collage (style Souvenirs)
function renderExtras() { $("#extras").innerHTML = extras.map((im, i) => `<span style="background-image:url(${im.src})"><button type="button" data-xrm="${i}" aria-label="Retirer la photo ${i + 2}">×</button></span>`).join(""); }
$("#ph2").addEventListener("change", e => { [...e.target.files].filter(f => /^image\//.test(f.type)).slice(0, 2 - extras.length).forEach(f => { const im = new Image(); im.onload = () => { extras.push(im); renderExtras(); if (cut) makeCut(im).then(c => { xcuts[extras.indexOf(im)] = c; rerender(); }).catch(() => {}); if (![...COMPOS, "souvenirs"].includes(st.style) && OCC[st.occ].styles.includes("souvenirs")) { st.style = "souvenirs"; st.pal = 0; renderStyles(); } rerender(); $("#sr").textContent = "Photo ajoutée au collage."; }; im.src = URL.createObjectURL(f); }); e.target.value = ""; });
$("#extras").addEventListener("click", e => { const b = e.target.closest("[data-xrm]"); if (!b) return; extras.splice(+b.dataset.xrm, 1); xcuts.splice(+b.dataset.xrm, 1); renderExtras(); rerender(); });
// Détourage : deux moteurs, tous deux servis depuis /vendor (même origine que la page, cache long). Aucune photo ne quitte le téléphone.
//  - « HD » : MODNet (détourage portrait fin, cheveux compris), exécuté par onnxruntime-web en WebAssembly. ≈ 9 Mo compressés, une seule fois.
//  - « Rapide » : TensorFlow.js + modèle « selfie » de MediaPipe. ≈ 1,8 Mo.
// Les deux passent ensuite par le même affinage : filtre guidé par la photo en pleine résolution (bords, cheveux) et nettoyage des couleurs du fond sur les bords.
const TFJS = vendorBase + "tf.min.js", SELFIE = vendorBase + "selfie-model.js", ORT = vendorBase + "ort/ort.wasm.min.js", MODNET = vendorBase + "modnet-model.js";
let segP = null, hdP = null, busy = false, autoCutTried = false, lastFail = false;
const slowNet = () => { const c = navigator.connection; return !!(c && (c.saveData || /2g|3g/.test(c.effectiveType || ""))); };
let engine = (() => { try { return localStorage.getItem("tbfm-cut-q"); } catch { return null; } })();
if (engine !== "hd" && engine !== "rapide") engine = slowNet() ? "rapide" : "hd";
const loadJs = src => new Promise((ok, ko) => { const sc = document.createElement("script"); sc.src = src; sc.onload = ok; sc.onerror = () => ko(new Error("load " + src)); document.head.appendChild(sc); });
let cutAvail = null;
const servesJs = u => fetch(u, { method: "HEAD" }).then(r => r.ok && /javascript/.test(r.headers.get("content-type") || "")).catch(() => false);
Promise.all([servesJs(TFJS), servesJs(ORT)]).then(([fast, hd]) => { cutAvail = fast && hd ? "both" : fast ? "rapide" : hd ? "hd" : false; if (cutAvail === "rapide" || cutAvail === "hd") engine = cutAvail; cutUi(); });
function loadSeg() {
  return segP ||= (async () => {
    if (!window.tf) await loadJs(TFJS);
    if (!window.TBF_SELFIE) await loadJs(SELFIE);
    try { await tf.setBackend("webgl"); } catch { await tf.setBackend("cpu"); }
    await tf.ready();
    const M = window.TBF_SELFIE, bin = Uint8Array.from(atob(M.weights), c => c.charCodeAt(0)).buffer;
    return tf.loadGraphModel(tf.io.fromMemory({ modelTopology: M.modelTopology, weightSpecs: M.weightSpecs, weightData: bin, format: M.format, generatedBy: M.generatedBy, convertedBy: M.convertedBy, signature: M.signature, userDefinedMetadata: M.userDefinedMetadata }));
  })().catch(e => { segP = null; throw e; });
}
function loadHd() {
  return hdP ||= (async () => {
    if (!window.ort) await loadJs(ORT);
    ort.env.wasm.wasmPaths = new URL(vendorBase + "ort/", location.href).href; ort.env.wasm.numThreads = 1; ort.env.logLevel = "error";
    if (!window.TBF_MODNET) await loadJs(MODNET); // modèle encodé dans un script : servi comme n'importe quel .js, en cache long
    const s = window.TBF_MODNET, bin = new Uint8Array(s.length * 3 / 4 - (s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0)), raw = atob(s); for (let i = 0; i < raw.length; i++) bin[i] = raw.charCodeAt(i); delete window.TBF_MODNET;
    return ort.InferenceSession.create(bin, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
  })().catch(e => { hdP = null; throw e; });
}
/* Masque 0–1 d'une zone du canvas source → { a: Float32Array, w, h } à la résolution du modèle */
async function alphaOf(src, sx, sy, sw, sh) {
  if (engine === "hd") {
    const ses = await loadHd(), s = 512 / Math.min(sw, sh); let w = Math.round(sw * s), h = Math.round(sh * s);
    const cap = 1024 / Math.max(w, h); if (cap < 1) { w *= cap; h *= cap; }
    w = Math.max(32, Math.round(w / 32) * 32); h = Math.max(32, Math.round(h / 32) * 32);
    const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data, n = w * h, x = new Float32Array(3 * n);
    for (let i = 0; i < n; i++) { x[i] = px[i * 4] / 127.5 - 1; x[n + i] = px[i * 4 + 1] / 127.5 - 1; x[2 * n + i] = px[i * 4 + 2] / 127.5 - 1; }
    const out = await ses.run({ [ses.inputNames[0]]: new ort.Tensor("float32", x, [1, 3, h, w]) });
    return { a: Float32Array.from(out[ses.outputNames[0]].data), w, h };
  }
  const model = await loadSeg(), c = document.createElement("canvas"); c.width = c.height = 256; c.getContext("2d").drawImage(src, sx, sy, sw, sh, 0, 0, 256, 256);
  const t = tf.tidy(() => { const v = tf.browser.fromPixels(c).toFloat().div(255).expandDims(0); let r = model.predict(v); if (Array.isArray(r)) r = r[0]; return r.squeeze(); });
  const d = await t.data(); t.dispose(); const a = new Float32Array(65536);
  for (let i = 0; i < 65536; i++) { const v = Math.min(1, Math.max(0, (d[i] - .3) / .4)); a[i] = v * v * (3 - 2 * v); }
  return { a, w: 256, h: 256 };
}
/* Moyenne sur une fenêtre (2r+1)² par image intégrale */
function boxF(src, w, h, r) {
  const I = new Float64Array((w + 1) * (h + 1)), o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) { let s = 0; for (let x = 0; x < w; x++) { s += src[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; } }
  for (let y = 0; y < h; y++) { const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1); for (let x = 0; x < w; x++) { const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
    o[y * w + x] = (I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0]) / ((y1 - y0) * (x1 - x0)); } }
  return o;
}
const grayOf = (cv, w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(cv, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data, o = new Float32Array(w * h); for (let i = 0; i < w * h; i++) o[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255; return o; };
const bil = (A, aw, ah, x, y) => { const fx = Math.max(0, Math.min(aw - 1, x)), fy = Math.max(0, Math.min(ah - 1, y)), x0 = fx | 0, y0 = fy | 0, x1 = Math.min(aw - 1, x0 + 1), y1 = Math.min(ah - 1, y0 + 1), tx = fx - x0, ty = fy - y0;
  return (A[y0 * aw + x0] * (1 - tx) + A[y0 * aw + x1] * tx) * (1 - ty) + (A[y1 * aw + x0] * (1 - tx) + A[y1 * aw + x1] * tx) * ty; };
/* Filtre guidé rapide (He & Sun, 2015) : calcule les coefficients à la résolution du masque, puis les applique sur la photo en pleine résolution.
   Les bords suivent alors les vrais contours de la photo (mèches, épaules) au lieu d'être agrandis en flou. */
function guidedUp(m, regionCv, W, H) {
  const { a: p, w, h } = m, I = grayOf(regionCv, w, h), r = Math.max(1, Math.round(Math.max(w, h) / 160)), eps = engine === "hd" ? 2e-3 : 6e-3, n = w * h;
  const Ip = new Float32Array(n), II = new Float32Array(n); for (let i = 0; i < n; i++) { Ip[i] = I[i] * p[i]; II[i] = I[i] * I[i]; }
  const mI = boxF(I, w, h, r), mP = boxF(p, w, h, r), mIp = boxF(Ip, w, h, r), mII = boxF(II, w, h, r), A = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0; i < n; i++) { const v = mII[i] - mI[i] * mI[i], cv = mIp[i] - mI[i] * mP[i]; A[i] = cv / (v + eps); B[i] = mP[i] - A[i] * mI[i]; }
  const mA = boxF(A, w, h, r), mB = boxF(B, w, h, r), G = grayOf(regionCv, W, H), out = new Float32Array(W * H), sx = w / W, sy = h / H;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = (x + .5) * sx - .5, v = (y + .5) * sy - .5, base = bil(p, w, h, u, v);
    let q = bil(mA, w, h, u, v) * G[y * W + x] + bil(mB, w, h, u, v);
    // le filtre n'affine que la bande du bord : à l'intérieur et loin dehors, on garde le masque du modèle (évite les trous quand fond et habit ont la même teinte)
    const band = 1 - Math.abs(base * 2 - 1); q = base + (q - base) * Math.min(1, band * 1.6);
    out[y * W + x] = q < 0 ? 0 : q > 1 ? 1 : q; }
  return out;
}
/* Couleurs « propres » sur les bords : sur les pixels semi-transparents (mèches, contour), la couleur du fond qui déborde (liseré vert, blanc…)
   est remplacée par celle de la personne juste à côté. Les reflets de lumière présents sur la personne elle-même sont gardés. */
function spread(d, W, H, keep) { // couleur moyenne des pixels « gardés » aux alentours (flou par réductions successives, pré-multiplié)
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"), id = g.createImageData(W, H);
  for (let i = 0, n = W * H; i < n; i++) { const k = i * 4; id.data[k] = d[k]; id.data[k + 1] = d[k + 1]; id.data[k + 2] = d[k + 2]; id.data[k + 3] = keep(i) ? 255 : 0; }
  g.putImageData(id, 0, 0); let cur = c, cw = W, ch = H; const steps = [];
  for (let s = 0; s < 4; s++) { const nw = Math.max(1, Math.round(cw / 2.5)), nh = Math.max(1, Math.round(ch / 2.5)), t = document.createElement("canvas"); t.width = nw; t.height = nh; const gt = t.getContext("2d"); gt.imageSmoothingQuality = "high"; gt.drawImage(cur, 0, 0, nw, nh); steps.push(t); cur = t; cw = nw; ch = nh; }
  const up = document.createElement("canvas"); up.width = W; up.height = H; const gu = up.getContext("2d", { willReadFrequently: true }); gu.imageSmoothingQuality = "high";
  for (let s = steps.length - 1; s >= 0; s--) gu.drawImage(steps[s], 0, 0, W, H); // du plus flou au plus fin : le niveau le plus proche l'emporte
  return gu.getImageData(0, 0, W, H).data;
}
function decontam(regionCv, alpha, W, H) {
  const g0 = regionCv.getContext("2d", { willReadFrequently: true }), img = g0.getImageData(0, 0, W, H), d = img.data, C = spread(d, W, H, i => alpha[i] > .92);
  for (let i = 0, n = W * H; i < n; i++) { const a = alpha[i]; if (a > .92 || a < .01) continue; const k = i * 4, cc = Math.min(1, C[k + 3] / 64); if (!cc) continue;
    const t = Math.min(1, (1 - a) * 1.4) * cc; d[k] += (C[k] - d[k]) * t; d[k + 1] += (C[k + 1] - d[k + 1]) * t; d[k + 2] += (C[k + 2] - d[k + 2]) * t; }
  g0.putImageData(img, 0, 0);
}
/* Bord : -3 (rétrécir) … +3 (élargir), appliqué au masque automatique */
function edgeAdj(alpha, W, H, s) {
  if (!s) return alpha; const b = boxF(alpha, W, H, Math.max(1, Math.round(Math.max(W, H) / 700))), c = .5 - s * .1, o = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) { const v = Math.min(1, Math.max(0, (b[i] - c) / .32 + .5)); o[i] = v * v * (3 - 2 * v); } return o;
}
function maskFrom(alpha, W, H) { const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"), id = g.createImageData(W, H);
  for (let i = 0; i < W * H; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = Math.round(alpha[i] * 255); } g.putImageData(id, 0, 0); return c; }
/* Photo détourée et recadrée au plus près, à partir de la photo (zone) et du masque ; garde de quoi la retoucher ensuite */
function composeCut(ed) {
  const { src, mask, W, H } = ed, o = document.createElement("canvas"); o.width = W; o.height = H; const g = o.getContext("2d", { willReadFrequently: true });
  g.drawImage(mask, 0, 0); g.globalCompositeOperation = "source-in"; g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-over";
  const px = g.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y * W + x) * 4 + 3] > 60) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (n < W * H / 4 * .01) throw new Error("vide");
  const t = document.createElement("canvas"); t.width = Math.min(W, x1 - x0 + 3); t.height = Math.min(H, y1 - y0 + 3); t.getContext("2d").drawImage(o, -x0, -y0); t._ed = ed; return t;
}
function cutUi() { const b = $("#cut-btn"); b.hidden = !photo || !cutAvail; b.setAttribute("aria-pressed", String(!!(cut && st.cutOn))); b.querySelector("span").textContent = busy ? "Détourage…" : cut ? (st.cutOn ? "Fond retiré" : "Remettre le détourage") : "Détourer la personne"; b.disabled = busy; const sp = b.querySelector(".spin"); if (busy && !sp) b.insertAdjacentHTML("afterbegin", '<i class="spin" aria-hidden="true"></i>'); if (!busy && sp) sp.remove();
  $("#ed-open").hidden = !(cut && st.cutOn) || busy; $("#cutq").hidden = !photo || cutAvail !== "both"; $$("#cutq input").forEach(i => { i.checked = i.value === engine; i.disabled = busy; }); }
async function makeCut(img) {
  const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height, k = Math.min(1, 2048 / Math.max(nw, nh)), w = Math.round(nw * k), h = Math.round(nh * k);
  const src = document.createElement("canvas"); src.width = w; src.height = h; src.getContext("2d").drawImage(img, 0, 0, w, h);
  // 1er passage sur toute la photo
  let m = await alphaOf(src, 0, 0, w, h), bx0 = m.w, by0 = m.h, bx1 = -1, by1 = -1;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.a[y * m.w + x] > .5) { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
  if (bx1 < 0) throw new Error("vide");
  // 2e passage resserré sur la personne quand elle est petite dans la photo : plus de détails, contours plus nets
  let rx = 0, ry = 0, rw = w, rh = h; const fw = (bx1 - bx0 + 1) / m.w, fh = (by1 - by0 + 1) / m.h;
  if (fw * fh < .45) { const cx = (bx0 + bx1 + 1) / 2 / m.w * w, cy = (by0 + by1 + 1) / 2 / m.h * h, mx = fw * w * 1.3, my = fh * h * 1.25; rw = Math.round(Math.min(w, Math.max(mx, my * .6))); rh = Math.round(Math.min(h, Math.max(my, mx * .6)));
    rx = Math.round(Math.max(0, Math.min(w - rw, cx - rw / 2))); ry = Math.round(Math.max(0, Math.min(h - rh, cy - rh / 2))); m = await alphaOf(src, rx, ry, rw, rh); }
  const region = document.createElement("canvas"); region.width = rw; region.height = rh; region.getContext("2d", { willReadFrequently: true }).drawImage(src, rx, ry, rw, rh, 0, 0, rw, rh);
  await new Promise(r => setTimeout(r)); // laisse respirer l'interface entre deux gros calculs
  let auto = guidedUp(m, region, rw, rh); if (engine !== "hd") auto = edgeAdj(auto, rw, rh, -1); // le modèle rapide déborde un peu : on resserre d'un cran
  decontam(region, auto, rw, rh);
  return composeCut({ src: region, auto, W: rw, H: rh, mask: maskFrom(auto, rw, rh), edge: 0, ops: [] });
}
async function runCut() {
  busy = true; lastFail = false; cutUi(); const first = engine === "hd" ? !hdP : !segP;
  $("#cut-tip").textContent = "Détourage en cours…" + (first ? (engine === "hd" ? " La première fois, l'outil HD se télécharge (environ 9 Mo), ensuite c'est instantané." : " La première fois, l'outil se télécharge (environ 2 Mo).") : "");
  try { cut = await makeCut(photo); xcuts = []; for (const im of extras) { try { xcuts.push(await makeCut(im)); } catch { xcuts.push(null); } } st.cutOn = true; outCache.clear(); pz = 1; px = py = 0; $("#zm").value = 100; $("#zm-v").textContent = "100 %";
    if (!["star", "affiche", "souvenirs", "wax", ...COMPOS].includes(st.style)) { const s2 = OCC[st.occ].styles.find(k => [...COMPOS, "star", "affiche"].includes(k)); if (s2) { st.style = s2; st.pal = 0; renderStyles(); } }
    $("#cut-tip").textContent = "Fond retiré. Un détail à corriger ? Touchez « Retoucher ». Le détourage s'affiche sur les modèles Icône, Néon, Lumière, Profils, Rêve, Tournesol, Star, Affiche, Wax et Souvenirs."; }
  catch (err) { console.warn("Détourage :", err); const hd = engine === "hd"; lastFail = !!photo;
    $("#cut-tip").textContent = err && err.message === "vide" ? "Personne non détectée sur cette photo. Essayez une photo où l'on voit bien le visage et le buste." : hd ? "Le détourage HD n'a pas pu se charger. Réessayez, ou choisissez « Rapide », plus léger." : "Le détourage n'a pas pu se charger. Vérifiez la connexion et réessayez."; }
  busy = false; cutUi(); rerender();
}
$("#cut-btn").addEventListener("click", () => {
  if (!photo || busy) return;
  if (cut) { st.cutOn = !st.cutOn; cutUi(); rerender(); return; }
  runCut();
});
$("#cutq").addEventListener("change", e => { if (e.target.name !== "cutq" || busy) return; engine = e.target.value; try { localStorage.setItem("tbfm-cut-q", engine); } catch {}
  if (cut || (lastFail && photo)) { cut = null; xcuts = []; runCut(); } else cutUi(); });

/* ---------------- Retouche du détourage : gommer / restaurer au doigt, ajuster le bord ---------------- */
const ED = { tgt: null, ed: null, tool: "erase", size: 36, zoom: 1, bg: 0, ops: [], edge: 0, prevFocus: null, cur: null, prev: null };
const edCv = $("#ed-cv"), edG = edCv.getContext("2d");
function edTargets() { const L = [{ k: "main", l: "Photo principale", c: cut }]; xcuts.forEach((c, i) => c && L.push({ k: i, l: "Collage " + (i + 1), c })); return L; }
function edLoad(t) { ED.tgt = t; ED.ed = t.c._ed; ED.ops = ED.ed.ops.slice(); ED.edge = ED.ed.edge; $("#ed-edge").value = ED.edge; edRebuild(); edFit(); }
function edRebuild() { // masque = bord ajusté du masque automatique + traits rejoués
  const e = ED.ed, m = maskFrom(edgeAdj(e.auto, e.W, e.H, ED.edge), e.W, e.H), g = m.getContext("2d");
  ED.ops.forEach(o => edStroke(g, o, 0)); ED.mask = m; edDraw(); }
function edStroke(g, o, from) { // dessine un trait (liste de points) dans le masque, en coordonnées de la photo
  g.save(); g.globalCompositeOperation = o.mode === "erase" ? "destination-out" : "source-over";
  for (let i = from; i < o.pts.length; i++) { const [x, y] = o.pts[i], r = o.size / 2, gr = g.createRadialGradient(x, y, r * .55, x, y, r); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    if (i > 0) { const [px0, py0] = o.pts[i - 1], dd = Math.hypot(x - px0, y - py0), st2 = Math.max(1, r * .35); for (let s = st2; s < dd; s += st2) { const xx = px0 + (x - px0) * s / dd, yy = py0 + (y - py0) * s / dd, g2 = g.createRadialGradient(xx, yy, r * .55, xx, yy, r); g2.addColorStop(0, "rgba(255,255,255,1)"); g2.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = g2; g.beginPath(); g.arc(xx, yy, r, 0, Math.PI * 2); g.fill(); } } }
  g.restore(); }
function edFit() { const e = ED.ed, box = $("#ed-stage").getBoundingClientRect(), k = Math.min((box.width - 2) / e.W, (box.height - 2) / e.H) * ED.zoom, dpr = Math.min(2, devicePixelRatio || 1);
  const cw = Math.max(50, Math.round(e.W * k)), ch = Math.max(50, Math.round(e.H * k)); edCv.style.width = cw + "px"; edCv.style.height = ch + "px";
  const iw = Math.min(e.W, Math.round(cw * dpr)), ih = Math.round(iw * e.H / e.W); if (edCv.width !== iw || edCv.height !== ih) { edCv.width = iw; edCv.height = ih; } edDraw(); }
let edRaf = 0;
function edDraw() { if (edRaf) return; edRaf = requestAnimationFrame(() => { edRaf = 0; const e = ED.ed; if (!e) return; const w = edCv.width, h = edCv.height;
  edG.globalCompositeOperation = "source-over"; edG.clearRect(0, 0, w, h);
  if (!ED.tmp || ED.tmp.width !== w || ED.tmp.height !== h) { ED.tmp = document.createElement("canvas"); ED.tmp.width = w; ED.tmp.height = h; }
  const tg = ED.tmp.getContext("2d"); tg.globalCompositeOperation = "source-over"; tg.clearRect(0, 0, w, h); tg.drawImage(ED.mask, 0, 0, w, h); tg.globalCompositeOperation = "source-in"; tg.drawImage(e.src, 0, 0, w, h);
  if (ED.tool === "restore") { edG.globalAlpha = .28; edG.drawImage(e.src, 0, 0, w, h); edG.globalAlpha = 1; } // en mode Restaurer : la photo d'origine apparaît en transparence pour voir quoi repeindre
  edG.drawImage(ED.tmp, 0, 0); }); }
function edPt(ev) { const r = edCv.getBoundingClientRect(), e = ED.ed; return [(ev.clientX - r.left) / r.width * e.W, (ev.clientY - r.top) / r.height * e.H]; }
function edRing(ev) { const ring = $("#ed-ring"); if (!ev || ED.tool === "move") { ring.hidden = true; return; } const r = edCv.getBoundingClientRect(), s = ED.size / ED.ed.W * r.width, sr = $("#ed-stage").getBoundingClientRect();
  ring.hidden = false; ring.style.width = ring.style.height = s + "px"; ring.style.transform = `translate(${ev.clientX - sr.left + $("#ed-stage").scrollLeft - s / 2}px,${ev.clientY - sr.top + $("#ed-stage").scrollTop - s / 2}px)`; }
edCv.addEventListener("pointerdown", ev => { if (!ED.ed) return; edCv.setPointerCapture(ev.pointerId); ev.preventDefault();
  if (ED.tool === "move") { const s = $("#ed-stage"); ED.pan = { x: ev.clientX, y: ev.clientY, l: s.scrollLeft, t: s.scrollTop }; return; }
  const o = { mode: ED.tool, size: ED.size, pts: [edPt(ev)] }; ED.cur = o; ED.ops.push(o); edStroke(ED.mask.getContext("2d"), o, 0); edDraw(); edRing(ev); });
edCv.addEventListener("pointermove", ev => { if (!ED.ed) return; edRing(ev);
  if (ED.pan) { const s = $("#ed-stage"); s.scrollLeft = ED.pan.l - (ev.clientX - ED.pan.x); s.scrollTop = ED.pan.t - (ev.clientY - ED.pan.y); return; }
  if (!ED.cur) return; const o = ED.cur, n = o.pts.length; o.pts.push(edPt(ev)); edStroke(ED.mask.getContext("2d"), o, n); edDraw(); });
const edEnd = () => { if (ED.cur) $("#ed-undo").disabled = false; ED.cur = null; ED.pan = null; };
edCv.addEventListener("pointerup", edEnd); edCv.addEventListener("pointercancel", edEnd); edCv.addEventListener("pointerleave", () => edRing(null));
// La taille du pinceau est exprimée en pixels de la photo ; on la convertit pour qu'elle corresponde à ce que l'on voit à l'écran
$("#ed-sz").addEventListener("input", e => { const r = edCv.getBoundingClientRect(); ED.size = Math.max(2, e.target.value / (r.width / ED.ed.W)); $("#ed-sz-v").textContent = e.target.value + " px"; });
$("#ed-edge").addEventListener("input", e => { ED.edge = +e.target.value; $("#ed-edge-v").textContent = ED.edge > 0 ? "+" + ED.edge : String(ED.edge); edRebuild(); });
$("#ed-zoom").addEventListener("input", e => { ED.zoom = e.target.value / 100; $("#ed-zoom-v").textContent = e.target.value + " %"; const s = $("#ed-stage"), cx = (s.scrollLeft + s.clientWidth / 2) / s.scrollWidth, cy = (s.scrollTop + s.clientHeight / 2) / s.scrollHeight; edFit(); syncSize(); s.scrollLeft = cx * s.scrollWidth - s.clientWidth / 2; s.scrollTop = cy * s.scrollHeight - s.clientHeight / 2; });
$("#ed-tools").addEventListener("change", e => { if (e.target.name === "edtool") { ED.tool = e.target.value; edCv.style.cursor = ED.tool === "move" ? "grab" : "crosshair"; edDraw(); } if (e.target.name === "edbg") { $("#ed-stage").dataset.bg = e.target.value; } if (e.target.id === "ed-tgt") edLoad(edTargets()[+e.target.value]); });
$("#ed-undo").addEventListener("click", () => { ED.ops.pop(); $("#ed-undo").disabled = !ED.ops.length; edRebuild(); $("#sr").textContent = "Dernier trait annulé."; });
$("#ed-reset").addEventListener("click", () => { ED.ops = []; ED.edge = 0; $("#ed-edge").value = 0; $("#ed-edge-v").textContent = "0"; $("#ed-undo").disabled = true; edRebuild(); $("#sr").textContent = "Détourage automatique rétabli."; });
const syncSize = () => { const r = edCv.getBoundingClientRect(); if (r.width && ED.ed) ED.size = Math.max(2, $("#ed-sz").value / (r.width / ED.ed.W)); };
function edOpen() { const L = edTargets(); if (!cut || !cut._ed) return; ED.prevFocus = document.activeElement; ED.zoom = 1; $("#ed-zoom").value = 100; $("#ed-zoom-v").textContent = "100 %";
  $("#ed-tgt-w").hidden = L.length < 2; $("#ed-tgt").innerHTML = L.map((t, i) => `<option value="${i}">${t.l}</option>`).join("");
  $("#ed").hidden = false; document.body.style.overflow = "hidden"; edLoad(L[0]); syncSize(); $("#ed-undo").disabled = !ED.ops.length; $("#ed-edge-v").textContent = ED.edge > 0 ? "+" + ED.edge : String(ED.edge);
  setTimeout(() => $(`#ed-tools input[name=edtool]:checked`).focus(), 30); }
function edClose(apply) {
  if (apply && ED.ed) { const e = ED.ed; try { const ne = { ...e, mask: ED.mask, ops: ED.ops.slice(), edge: ED.edge }, nc = composeCut(ne);
      if (ED.tgt.k === "main") cut = nc; else xcuts[ED.tgt.k] = nc; outCache.clear(); rerender(); $("#sr").textContent = "Retouche appliquée au flyer."; }
    catch { $("#sr").textContent = "Il ne reste presque rien de la personne : retouche non appliquée."; } }
  $("#ed").hidden = true; document.body.style.overflow = ""; ED.ed = null; ED.mask = null; (ED.prevFocus && ED.prevFocus.focus ? ED.prevFocus : $("#ed-open")).focus(); }
// Applique les traits faits dans une autre photo du collage avant d'en changer
$("#ed-tgt").addEventListener("focus", () => { if (!ED.ed) return; const nc = (() => { try { return composeCut({ ...ED.ed, mask: ED.mask, ops: ED.ops.slice(), edge: ED.edge }); } catch { return null; } })(); if (nc) { if (ED.tgt.k === "main") cut = nc; else xcuts[ED.tgt.k] = nc; const L = edTargets(); L.forEach((t, i) => { if (t.k === ED.tgt.k) ED.tgt = L[i]; }); } });
$("#ed-open").addEventListener("click", edOpen);
$("#ed-ok").addEventListener("click", () => edClose(true));
$("#ed-x").addEventListener("click", () => edClose(false));
$("#ed").addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); edClose(false); return; }
  if (e.key === "Tab") { const f = $$("#ed button:not([disabled]), #ed input:not([disabled]), #ed select").filter(x => x.offsetParent && !(x.type === "radio" && !x.checked)); const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (ED.ops.length) $("#ed-undo").click(); } });
addEventListener("resize", () => { if (ED.ed) { edFit(); syncSize(); } });
$("#zm").addEventListener("input", e => { pz = e.target.value / 100; $("#zm-v").textContent = e.target.value + " %"; render(); });
// Recadrage au doigt / à la souris, et au clavier (flèches) sur l'aperçu
/* ---------------- Décor, éléments affichés, stickers, textes libres ---------------- */
function renderDecos() { const L = isMourn(st) ? DECOS.filter(d => ["aucun", "fleurs"].includes(d[0])) : DECOS; if (!L.some(d => d[0] === st.decor)) st.decor = "aucun";
  $("#decos").innerHTML = `<span class="lbl">Décor</span>` + L.map(([k, l]) => `<input type="radio" name="deco" id="d-${k}" value="${k}" ${k === st.decor ? "checked" : ""}><label for="d-${k}">${l}</label>`).join(""); }
const SHOW = [["head", "Titre"], ["name", "Prénom"], ["tags", "Qualités"], ["num", "Âge / chiffre"], ["sous", "Ligne sous le nom"], ["info", "Date, lieu, prix"], ["qr", "QR code"], ["wish", "Message"], ["sig", "Signature"]];
function renderShow() { st.hide = st.hide || {}; $("#show").innerHTML = SHOW.map(([k, l]) => `<label class="check"><input type="checkbox" data-show="${k}" ${st.hide[k] ? "" : "checked"}> ${l}</label>`).join(""); }
function renderStk() {
  $("#stk").innerHTML = Object.entries(STK).map(([k, v]) => `<button type="button" data-stk="${k}" aria-label="Ajouter le sticker ${v[0]}" title="${v[0]}"><canvas width="128" height="128" aria-hidden="true"></canvas></button>`).join("");
  $$("#stk button").forEach(b => { const c = b.querySelector("canvas"), g = c.getContext("2d"), k = b.dataset.stk, v = STK[k], acc = (STY[st.style].pals[st.pal] || STY[st.style].pals[0])[4];
    g.clearRect(0, 0, 128, 128); g.save(); g.translate(64, 64); g.scale(1.05, 1.05); g.translate(-50, -50); if (v[1]) v[1](g, st, acc); else { g.save(); g.translate(50, 50); g.scale(.62, .62); g.translate(-50, -50); badge(g, v[2], acc); g.restore(); } g.restore(); });
}
const TCOL = ["#FFFFFF", "#111111", "#E9B949", "#E8365D", "#6C4BF4", "#1F6B45"];
function selUi() {
  const it = st.items[selI]; $("#sel").hidden = !it; if (!it) return;
  const isT = it.type === "text"; $("#sel-t").textContent = isT ? "Texte sélectionné" : `Sticker sélectionné : ${STK[it.k]?.[0] || ""}`;
  $("#sel-txt-w").hidden = !isT; $("#sel-font-w").hidden = !isT; if (isT) { $("#sel-txt").value = it.t; $("#sel-font").value = it.font || "script"; }
  $("#sel-s").value = Math.round((it.s || 1) * 100); $("#sel-r").value = Math.round(it.r || 0);
  const showCol = isT || (STK[it.k] && !STK[it.k][1]) || ["ballon", "fleur", "cadeau"].includes(it.k);
  $("#sel-col").hidden = !showCol; $("#sel-col").innerHTML = TCOL.map(c => `<button type="button" data-col="${c}" aria-label="Couleur ${c}" aria-pressed="${(it.c || "") === c}" style="background:${c}"></button>`).join("");
}
function select(i) { selI = i; selUi(); render(); }
const SPOTS = [[.2, .2], [.8, .2], [.18, .52], [.82, .52], [.22, .82], [.78, .82]];
function addItem(it) { const n = (st.items || []).length, sp = SPOTS[n % SPOTS.length]; st.items = (st.items || []).concat([{ x: sp[0], y: sp[1], s: 1, r: 0, ...it }]).slice(-12); select(st.items.length - 1); $("#sr").textContent = "Élément ajouté. Déplacez-le dans l'aperçu."; }
$("#stk").addEventListener("click", e => { const b = e.target.closest("[data-stk]"); if (b) addItem({ type: "sticker", k: b.dataset.stk, r: Math.round(Math.random() * 20 - 10) }); });
$("#ftxt-add").addEventListener("click", () => { const t = $("#ftxt").value.trim(); if (!t) { $("#ftxt").focus(); return; } addItem({ type: "text", t, font: "script", c: "#FFFFFF", r: -4, x: .5, y: .62 }); $("#ftxt").value = ""; });
$("#ftxt").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("#ftxt-add").click(); } });
$("#sel").addEventListener("input", e => { const it = st.items[selI]; if (!it) return; const t = e.target;
  if (t.id === "sel-s") it.s = t.value / 100; else if (t.id === "sel-r") it.r = +t.value; else if (t.id === "sel-txt") it.t = t.value || " "; render(); });
$("#sel").addEventListener("change", e => { const it = st.items[selI]; if (it && e.target.id === "sel-font") { it.font = e.target.value; render(); } });
$("#sel").addEventListener("click", e => { const it = st.items[selI]; if (!it) return; const c = e.target.closest("[data-col]");
  if (c) { it.c = c.dataset.col; selUi(); render(); return; }
  const id = e.target.closest("button")?.id;
  if (id === "sel-del") { st.items.splice(selI, 1); select(-1); $("#sr").textContent = "Élément supprimé."; }
  else if (id === "sel-front") { st.items.push(st.items.splice(selI, 1)[0]); select(st.items.length - 1); }
  else if (id === "sel-dup") addItem({ ...it, x: Math.min(.9, it.x + .06), y: Math.min(.9, it.y + .04) });
  else if (id === "sel-ok") select(-1);
});
$("#f").addEventListener("submit", e => e.preventDefault());
$("#f").addEventListener("change", e => { const t = e.target;
  if (t.name === "deco") { st.decor = t.value; rerender(); }
  else if (t.dataset.show) { st.hide[t.dataset.show] = !t.checked; rerender(); }
});
renderStk();
/* Toucher dans l'aperçu : poignée (taille + rotation), élément (déplacer), sinon photo (recadrer) */
function toCanvas(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 1080 / r.width, (e.clientY - r.top) * cv.height / r.height]; }
function hit(px2, py2) {
  for (let i = BB.length - 1; i >= 0; i--) { const b = BB[i]; if (!b) continue; const dx = px2 - b.cx, dy = py2 - b.cy, c = Math.cos(-b.r), s2 = Math.sin(-b.r), lx = dx * c - dy * s2, ly = dx * s2 + dy * c;
    if (i === selI && Math.hypot(lx - b.w / 2, ly - b.h / 2) < 60) return { i, handle: true };
    if (Math.abs(lx) <= b.w / 2 && Math.abs(ly) <= b.h / 2) return { i, handle: false }; }
  return null;
}
let drag = null;
cv.addEventListener("pointerdown", e => {
  const [qx, qy] = toCanvas(e), h = hit(qx, qy);
  if (h) { const it = st.items[h.i]; if (selI !== h.i) { selI = h.i; selUi(); } const b = BB[h.i];
    drag = h.handle ? { mode: "rs", it, cx: b.cx, cy: b.cy, d0: Math.hypot(qx - b.cx, qy - b.cy), a0: Math.atan2(qy - b.cy, qx - b.cx), s0: it.s || 1, r0: it.r || 0 } : { mode: "mv", it, ox: qx - it.x * 1080, oy: qy - it.y * cv.height };
    cv.setPointerCapture(e.pointerId); cv.classList.add("drag"); render(); return; }
  if (selI !== -1) select(-1);
  if (!photo) return; drag = { mode: "ph", x: e.clientX, y: e.clientY, px, py }; cv.setPointerCapture(e.pointerId); cv.classList.add("drag"); });
cv.addEventListener("pointermove", e => { if (!drag) return;
  if (drag.mode === "mv") { const [qx, qy] = toCanvas(e); drag.it.x = Math.max(0, Math.min(1, (qx - drag.ox) / 1080)); drag.it.y = Math.max(0, Math.min(1, (qy - drag.oy) / cv.height)); render(); return; }
  if (drag.mode === "rs") { const [qx, qy] = toCanvas(e); drag.it.s = Math.max(.3, Math.min(3, drag.s0 * Math.hypot(qx - drag.cx, qy - drag.cy) / Math.max(20, drag.d0))); drag.it.r = Math.round(drag.r0 + (Math.atan2(qy - drag.cy, qx - drag.cx) - drag.a0) * 180 / Math.PI); selUi(); render(); return; }
  const r = cv.getBoundingClientRect(), k = 1 / (pz * 1.4); px = Math.max(-.5, Math.min(.5, drag.px + (e.clientX - drag.x) / r.width * k)); py = Math.max(-.5, Math.min(.5, drag.py + (e.clientY - drag.y) / r.height * k)); render(); });
const end = () => { drag = null; cv.classList.remove("drag"); };
cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
cv.addEventListener("keydown", e => { if (selI >= 0 && st.items[selI]) { const it = st.items[selI], d2 = { ArrowLeft: [-.01, 0], ArrowRight: [.01, 0], ArrowUp: [0, -.01], ArrowDown: [0, .01] }[e.key];
    if (d2) { e.preventDefault(); it.x = Math.max(0, Math.min(1, it.x + d2[0])); it.y = Math.max(0, Math.min(1, it.y + d2[1])); render(); return; } if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); st.items.splice(selI, 1); select(-1); return; } if (e.key === "Escape") { select(-1); return; } }
  if (!photo) return; const d = { ArrowLeft: [-.02, 0], ArrowRight: [.02, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02] }[e.key]; if (!d) return; e.preventDefault(); px = Math.max(-.5, Math.min(.5, px + d[0])); py = Math.max(-.5, Math.min(.5, py + d[1])); render(); });

// Export
const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
function blob() { return new Promise(ok => { const c = document.createElement("canvas"); draw(c.getContext("2d"), st, 1, false); c.toBlob(b => ok(b), "image/png"); }); }
const fname = () => `flyer-${slug(texts(st).name) || "tbf-moment"}-${st.occ}${st.fmt === "carre" ? "-carre" : ""}.png`;
async function download() { const b = await blob(); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = fname(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); $("#how").hidden = false; $("#sr").textContent = "Flyer téléchargé."; }
async function share() {
  const b = await blob(), file = new File([b], fname(), { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text: "Créé avec TBF MOMENT · tbfmoment.com" }); $("#sr").textContent = "Flyer partagé."; return; } catch (e) { if (e && e.name === "AbortError") return; }
  }
  await download();
}
/* ---------------- Vidéo animée (8 s) : apparition, zoom, reflet, confettis, musique ---------------- */
function pickMime() { const L = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]; return L.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || ""; }
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
function music(ac, dest, occ) {
  const out = ac.createGain(); out.gain.value = .22; const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5200; out.connect(lp); lp.connect(dest); lp.connect(ac.destination);
  const t0 = ac.currentTime + .15;
  const bell = (n, t, d, v = 1) => { [1, 2, 3].forEach((h, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = i ? "sine" : "triangle"; o.frequency.value = NOTE(n) * h; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * [.9, .3, .12][i], t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + Math.max(.5, d * 1.6)); o.connect(g); g.connect(out); o.start(t); o.stop(t + d * 1.7 + .1); }); };
  const pad = (ns, t, d) => ns.forEach(n => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = NOTE(n); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .6); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + .05); });
  if (occ === "birthday") { // « Joyeux anniversaire » (mélodie du domaine public)
    const m = [[67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2], [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2], [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1], [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 2.4]];
    let t = t0; const b = .3; m.forEach(([n, d]) => { bell(n, t, d * b); t += d * b; });
    [[48, 0], [55, 6], [55, 12], [53, 18], [48, 21]].forEach(([n, at]) => pad([n, n + 4, n + 7], t0 + at * b, 3 * b * 2));
  } else if (occ === "soft") { [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]].forEach((c, i) => pad(c, t0 + i * 2, 2.2)); [64, 62, 60, 59, 57].forEach((n, i) => bell(n, t0 + .6 + i * 1.5, 1.2, .5)); }
  else { const prog = [[60, 64, 67], [67, 71, 74], [69, 72, 76], [65, 69, 72]]; prog.forEach((c, i) => { pad(c.map(n => n - 12), t0 + i * 2, 2); for (let k = 0; k < 8; k++) bell(c[k % 3] + (k > 3 ? 12 : 0), t0 + i * 2 + k * .25, .25, .7); }); }
}
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
async function makeVideo(onP) {
  const sq = st.fmt === "carre", W2 = 720, H2 = sq ? 720 : 1280, sc = W2 / 1080;
  const base = document.createElement("canvas"); draw(base.getContext("2d"), st, sc, false);
  const v = document.createElement("canvas"); v.width = W2; v.height = H2; const x = v.getContext("2d");
  const mime = pickMime(); if (!mime || !v.captureStream) throw new Error("unsupported"); lastMime = mime;
  const stream = v.captureStream(30); let ac = null;
  if (st.music !== false && (window.AudioContext || window.webkitAudioContext)) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); await ac.resume(); const dest = ac.createMediaStreamDestination(); music(ac, dest, OCC[st.occ].mus || "festive"); dest.stream.getAudioTracks().forEach(t => stream.addTrack(t)); } catch { ac = null; } }
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6e6 }), chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const stopped = new Promise(ok => rec.onstop = ok);
  const p = (STY[st.style].pals[st.pal] || STY[st.style].pals[0]), mourn = isMourn(st), R = rng(31), cols = [p[4], "#FFFFFF", "#E9B949", p[1], p[2]];
  const conf = Array.from({ length: mourn ? 0 : 80 }, () => ({ x: R() * W2, y: -R() * H2 * .6 - 20, vy: (90 + R() * 160) * sc * 1.5, sw: R() * 6.28, ss: 1 + R() * 2, rot: R() * 6.28, vr: (R() - .5) * 6, flip: R() * 6.28, vf: 3 + R() * 6, w: (12 + R() * 10) * sc * 1.4, h: (7 + R() * 5) * sc * 1.4, c: cols[Math.floor(R() * cols.length)] }));
  const motes = Array.from({ length: mourn ? 40 : 0 }, () => ({ x: R() * W2, y: H2 + R() * H2, vy: (20 + R() * 40) * sc * 1.5, r: (2 + R() * 5) * sc * 1.5, a: .2 + R() * .4 }));
  const tw = Array.from({ length: 14 }, () => ({ x: R() * W2, y: R() * H2, r: (10 + R() * 18) * sc * 1.4, ph: R() * 2 }));
  rec.start(250); const dur = 8, t0 = performance.now(); let last = t0;
  await new Promise(done => { const frame = now => {
    const t = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    x.fillStyle = "#000"; x.fillRect(0, 0, W2, H2);
    const z = t < 2.2 ? (mourn ? 1.06 : 1.12) - ((mourn ? .06 : .12) * ease(t / 2.2)) : 1 + .025 * ((t - 2.2) / 5.8), rad = ease((t - .05) / (mourn ? 2 : 1.25)) * Math.hypot(W2, H2) * .62;
    x.save(); x.globalAlpha = Math.min(1, t / .5); x.beginPath(); x.arc(W2 / 2, H2 / 2, Math.max(1, rad), 0, 6.29); x.clip(); x.translate(W2 / 2, H2 / 2); x.scale(z, z); x.drawImage(base, -W2 / 2, -H2 / 2); x.restore();
    if (!mourn && t > 1.4 && t < 2.6) { const q = (t - 1.4) / 1.2, bx = -W2 * .6 + q * W2 * 2.2; x.save(); x.globalCompositeOperation = "lighter"; x.translate(bx, 0); x.rotate(.35); const g = x.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(255,255,255,.28)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(-90, -H2, 180, H2 * 3); x.restore(); }
    tw.forEach(s2 => { const a = Math.max(0, Math.sin((t * 1.6 + s2.ph) * Math.PI)); if (a > .05 && t > 1) { x.save(); x.globalAlpha = a * (mourn ? .4 : .9); x.shadowColor = "#fff"; x.shadowBlur = 12; sparkle(x, s2.x, s2.y, s2.r * a, mourn ? "#FFF6E0" : "#FFF3C4"); x.restore(); } });
    if (t > .7) conf.forEach(c => { c.y += c.vy * dt; c.sw += c.ss * dt; c.rot += c.vr * dt; c.flip += c.vf * dt; const X = c.x + Math.sin(c.sw) * 24 * sc * 1.5; if (c.y > H2 + 30) { if (t < 5.5) { c.y = -20; c.x = R() * W2; } else return; }
      const f2 = Math.cos(c.flip); x.save(); x.translate(X, c.y); x.rotate(c.rot); x.fillStyle = f2 > 0 ? c.c : mixH(c.c.length === 7 ? c.c : "#FFFFFF", "#000000", .65); x.fillRect(-c.w / 2, -c.h / 2 * Math.abs(f2), c.w, c.h * Math.max(.15, Math.abs(f2))); x.restore(); });
    motes.forEach(m => { m.y -= m.vy * dt; if (m.y < -10) m.y = H2 + 10; x.save(); x.globalAlpha = m.a; x.fillStyle = "#FFF6E0"; x.filter = "blur(2px)"; x.beginPath(); x.arc(m.x + Math.sin(t + m.y * .01) * 8, m.y, m.r, 0, 6.29); x.fill(); x.restore(); });
    onP?.(Math.min(dur, t), dur);
    if (t < dur) requestAnimationFrame(frame); else done(); };
    requestAnimationFrame(frame); });
  rec.stop(); await stopped; stream.getTracks().forEach(t => t.stop()); try { await ac?.close(); } catch {}
  return new Blob(chunks, { type: mime.split(";")[0] });
}
let vidBlob = null, lastMime = "";
const vname = () => fname().replace(/\.png$/, vidBlob && /mp4/.test(vidBlob.type) ? ".mp4" : ".webm");
async function videoFlow() {
  const pr = $("#prog"); pr.hidden = false; pr.textContent = "Création de la vidéo…"; select(-1);
  try {
    vidBlob = await makeVideo((t, d) => { pr.textContent = `Création de la vidéo… ${Math.ceil(t)} / ${d} s`; });
    const v = $("#vid-v"); if (v.src) URL.revokeObjectURL(v.src); v.src = URL.createObjectURL(vidBlob); $("#vid").hidden = false;
    $("#vid-note").textContent = /avc1/.test(lastMime) ? "Vidéo MP4 (H.264) prête : elle se publie directement en statut WhatsApp." : "Vidéo prête. Ce navigateur utilise un format que WhatsApp peut refuser sur certains téléphones : pour un MP4 garanti, ouvrez la page dans Chrome à jour sur Android ou Safari sur iPhone.";
    $("#sr").textContent = "Vidéo prête."; $("#vid").scrollIntoView({ block: "nearest", behavior: "smooth" });
  } catch (e) { $("#vid").hidden = false; $("#vid-note").textContent = "Ce navigateur ne sait pas créer de vidéo. Essayez avec Chrome sur Android ou Safari sur iPhone."; }
  pr.hidden = true;
}
$("#vid-dl").addEventListener("click", () => { if (!vidBlob) return; const a = document.createElement("a"); a.href = URL.createObjectURL(vidBlob); a.download = vname(); document.body.appendChild(a); a.click(); a.remove(); $("#how").hidden = false; });
$("#vid-share").addEventListener("click", async () => { if (!vidBlob) return; const f = new File([vidBlob], vname(), { type: vidBlob.type }); if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], text: "Créé avec TBF MOMENT · tbfmoment.com" }); return; } catch (e) { if (e && e.name === "AbortError") return; } } $("#vid-dl").click(); });
onDoc("click", async e => { const b = e.target.closest("[data-act]"); if (!b) return; if (b.dataset.act === "video") { if (b.disabled) return; $$("[data-act=video]").forEach(x2 => x2.disabled = true); try { await videoFlow(); } finally { $$("[data-act=video]").forEach(x2 => x2.disabled = false); } return; } const lab = b.querySelector("span"), old = lab.textContent; b.disabled = true; lab.textContent = "Préparation…"; try { await (b.dataset.act === "share" ? share() : download()); } finally { lab.textContent = old; b.disabled = false; } });

// Préremplissage depuis un événement
if (qs.get("ev")) { const n = $("#ev-note"); n.hidden = false; n.textContent = `Pour l'événement « ${qs.get("ev").slice(0, 80)} » : le flyer est prêt, ajoutez une photo et votre nom.`; }
if (qs.get("cover")) { const u = qs.get("cover"); const safe = /\.(jpe?g|png|webp)$/i.test(u.split("?")[0]) ? mediaUrl(u) : ""; if (safe) { fetch(safe).then(r => r.ok ? r.blob() : null).then(b => b && setPhoto(new File([b], "cover", { type: b.type }))).catch(() => {}); } }
cutUi(); syncForm(); render();
return () => { cleanups.forEach(f => f()); cancelAnimationFrame(raf); clearTimeout(thumbT); document.body.style.overflow = ""; };
}
