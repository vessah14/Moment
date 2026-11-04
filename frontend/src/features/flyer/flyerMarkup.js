// GÉNÉRÉ depuis le prototype « modeles/flyer.html » (structure). Studio « Flyer d'honneur ».
// Contenu statique, écrit par nous : aucune donnée de visiteur n'y entre.
export const FLYER_MARKUP = `
<main>
  <div class="hd">
    <span class="kicker">Mise à l'honneur</span>
    <h1>Un flyer pour honorer un proche</h1>
    <p>Anniversaire, diplôme, promotion, mariage ou hommage : ajoutez sa photo, choisissez le ton, et publiez-le en statut en une minute.</p>
  </div>
  <p class="ev-note" id="ev-note" hidden></p>

  <div class="grid">
    <form id="f" novalidate>
      <fieldset class="step">
        <legend><span class="n">1</span>L'occasion</legend>
        <div class="f"><label for="etype">Pour quel événement ?</label><select id="etype"><option value="">Tous les événements</option></select></div>
        <p class="grp-l" id="occ-v-l">Vœux <small>· pour honorer quelqu'un</small></p>
        <div class="chips" id="occ-v" role="radiogroup" aria-labelledby="occ-v-l"></div>
        <p class="grp-l" id="occ-a-l">Annonces <small>· avec un QR code vers votre page</small></p>
        <div class="chips" id="occ-a" role="radiogroup" aria-labelledby="occ-a-l"></div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="n">2</span>La photo</legend>
        <div class="drop" id="drop">
          <span class="thumb" id="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-9 8"/></svg></span>
          <div class="txt"><b id="ph-t">Ajoutez sa plus belle photo</b><small id="ph-s">JPG ou PNG. Elle reste sur votre téléphone.</small></div>
          <div class="acts">
            <label class="btn sm" for="ph">Choisir</label>
            <button class="btn ghost sm" type="button" id="ph-rm" hidden>Retirer</button>
          </div>
          <input type="file" id="ph" accept="image/*" class="sr">
        </div>
        <div class="tools" id="ph-tools">
          <button class="btn ghost sm" type="button" id="cut-btn" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></svg><span>Détourer la personne</span></button>
          <button class="btn ghost sm" type="button" id="ed-open" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 4 4L8 20H4v-4z"/><path d="m13 7 4 4"/></svg><span>Retoucher</span></button>
          <label class="btn ghost sm" for="ph2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Photos pour le collage</label>
          <input type="file" id="ph2" accept="image/*" multiple class="sr">
          <label class="btn ghost sm" for="lg" id="lg-l" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12h6M12 9v6"/></svg><span>Logo</span></label>
          <input type="file" id="lg" accept="image/*" class="sr" aria-label="Ajouter un logo">
        </div>
        <div class="cutq" id="cutq" role="radiogroup" aria-labelledby="cutq-l" hidden><span class="lbl" id="cutq-l">Qualité du détourage</span>
          <input type="radio" name="cutq" id="cq-hd" value="hd"><label for="cq-hd"><b>HD</b> cheveux nets · ≈ 9 Mo la 1<sup>re</sup> fois</label>
          <input type="radio" name="cutq" id="cq-r" value="rapide"><label for="cq-r"><b>Rapide</b> ≈ 2 Mo</label></div>
        <div class="extras" id="extras" aria-label="Photos du collage"></div>
        <p class="tip" id="cut-tip" role="status"></p>
        <div class="zoom" id="zoom" hidden><label class="lbl" for="zm">Zoom</label><input type="range" id="zm" min="100" max="300" value="100"><span class="cnt" id="zm-v">100 %</span></div>
        <label class="check" id="bw-w" hidden><input type="checkbox" id="bw"> Photo en noir et blanc</label>
        <label class="check"><input type="checkbox" id="film"> Effet pellicule (grain et lumière)</label>
      </fieldset>

      <fieldset class="step">
        <legend><span class="n">3</span>La personne</legend>
        <div class="row">
          <div class="f"><label for="nom" id="nom-l">Prénom</label><input type="text" id="nom" maxlength="40" autocomplete="off"></div>
          <div class="f" id="num-w"><label for="num" id="num-l">Âge</label><input type="text" id="num" inputmode="numeric" maxlength="4" autocomplete="off"><small id="num-s">Facultatif</small></div>
        </div>
        <div class="f" id="sous-w"><label for="sous" id="sous-l">Date</label><input type="text" id="sous" maxlength="60" autocomplete="off"><small id="sous-s">Facultatif</small></div>
        <div class="f" id="tags-w"><label for="tags">Trois qualités (facultatif)</label><input type="text" id="tags" maxlength="60" autocomplete="off" placeholder="Ex. Élégante, Brillante, Inspirante"><small>Séparées par des virgules. Elles s'affichent en étiquettes sur les modèles Icône, Néon et Profils.</small></div>
        <div class="row" id="ann1"><div class="f" id="quand-w"><label for="quand" id="quand-l">Date et heure</label><input type="text" id="quand" maxlength="50" autocomplete="off"></div><div class="f" id="lieu-w"><label for="lieu" id="lieu-l">Lieu</label><input type="text" id="lieu" maxlength="60" autocomplete="off"></div></div>
        <div class="row" id="ann2"><div class="f" id="prix-w"><label for="prix" id="prix-l">Prix</label><input type="text" id="prix" maxlength="40" autocomplete="off"></div><div class="f" id="lien-w"><label for="lien">Lien de la page (QR code)</label><input type="text" id="lien" maxlength="120" inputmode="url" autocomplete="off" placeholder="tbfmoment.com/votre-evenement"><small>Facultatif. Le QR code ouvre cette page.</small></div></div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="n">4</span>Le vœu</legend>
        <div class="row" id="rel-row">
          <div class="f" id="rel-w"><label for="rel">C'est votre…</label><select id="rel"></select></div>
          <div class="f" id="ton-w"><label for="ton">Le ton</label><select id="ton"></select></div>
        </div>
        <div class="f">
          <label for="voeu">Votre message</label>
          <textarea id="voeu" maxlength="260"></textarea>
          <div class="wish-bar"><button class="btn ghost sm" type="button" id="idea"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>Une autre idée</button><span class="cnt" id="cnt" aria-live="polite">0 / 220</span></div>
        </div>
        <div class="row">
          <div class="f"><label for="sig">Votre nom</label><input type="text" id="sig" maxlength="40" autocomplete="name" placeholder="Ex. Brenda"></div>
          <div class="f"><label for="form">Formule</label><select id="form"></select></div>
        </div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="n">5</span>Le style</legend>
        <div class="styles" id="styles" role="radiogroup" aria-label="Style du flyer"></div>
        <div class="pals" id="pals" role="radiogroup" aria-label="Couleurs"></div>
        <div class="decos" id="decos" role="radiogroup" aria-label="Décor"></div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="n">6</span>À votre façon</legend>
        <p class="lbl" style="margin:0 0 .4rem">Afficher sur le flyer</p>
        <div class="show" id="show"></div>
        <p class="lbl" style="margin:1rem 0 .1rem">Ajouter un sticker</p>
        <div class="stk" id="stk"></div>
        <div class="f" style="margin-top:.8rem"><label for="ftxt">Ajouter un texte</label>
          <div class="addt"><input type="text" id="ftxt" maxlength="40" placeholder="Ex. Je t'aime, Queen, Fier de toi…" autocomplete="off"><button class="btn sm" type="button" id="ftxt-add">Ajouter</button></div></div>
        <p class="tip">Touchez un élément dans l'aperçu pour le déplacer. Tirez la poignée ronde pour l'agrandir ou le tourner.</p>
        <div class="sel" id="sel" hidden aria-live="polite">
          <h3 id="sel-t">Élément sélectionné</h3>
          <div class="f" id="sel-txt-w"><label for="sel-txt">Texte</label><input type="text" id="sel-txt" maxlength="40"></div>
          <div class="f" id="sel-font-w"><label for="sel-font">Police</label><select id="sel-font"><option value="script">Calligraphie</option><option value="serif">Élégante</option><option value="bebas">Affiche</option><option value="lilita">Ronde</option><option value="sans">Moderne</option><option value="hand">Manuscrite</option></select></div>
          <div class="rng"><label for="sel-s">Taille</label><input type="range" id="sel-s" min="30" max="300" value="100"></div>
          <div class="rng"><label for="sel-r">Rotation</label><input type="range" id="sel-r" min="-180" max="180" value="0"></div>
          <div class="sw" id="sel-col" role="group" aria-label="Couleur du texte"></div>
          <div class="acts"><button class="btn ghost sm" type="button" id="sel-front">Au premier plan</button><button class="btn ghost sm" type="button" id="sel-dup">Dupliquer</button><button class="btn ghost sm" type="button" id="sel-del">Supprimer</button><button class="btn ghost sm" type="button" id="sel-ok">Terminé</button></div>
        </div>
      </fieldset>
    </form>

    <aside class="pv" aria-label="Aperçu du flyer">
      <div class="stage" style="position:relative"><canvas id="cv" width="1080" height="1920" tabindex="0" role="img" aria-label="Aperçu du flyer"></canvas><div class="prog" id="prog" hidden></div></div>
      <p class="hint" id="hint">L'aperçu se met à jour pendant que vous écrivez.</p>
      <div class="fmt" role="radiogroup" aria-label="Format">
        <input type="radio" name="fmt" id="fmt-s" value="statut" checked><label for="fmt-s">Statut 9:16</label>
        <input type="radio" name="fmt" id="fmt-c" value="carre"><label for="fmt-c">Carré 1:1</label>
      </div>
      <div class="acts-main">
        <button class="btn" type="button" data-act="share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg><span>Partager</span></button>
        <button class="btn ghost" type="button" data-act="dl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/></svg><span>Télécharger</span></button>
      </div>
      <button class="btn vbtn" type="button" data-act="video"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg><span>Créer la vidéo animée</span></button>
      <div class="vrow"><label class="check"><input type="checkbox" id="music" checked> Avec musique</label><span class="cnt">8 s · format statut</span></div>
      <div class="vid" id="vid" hidden><video id="vid-v" controls playsinline loop></video><div class="acts"><button class="btn" type="button" id="vid-share">Partager la vidéo</button><button class="btn ghost" type="button" id="vid-dl">Télécharger</button></div><p id="vid-note"></p></div>
      <p class="how" id="how" hidden>Pour le mettre en statut : ouvrez WhatsApp, onglet <b>Actualités</b>, touchez l'appareil photo puis choisissez le flyer dans votre galerie.</p>
      <div class="prem"><span><b>Sans la mention TBF MOMENT</b><br>en image et en vidéo</span><span class="tag">500 FCFA · bientôt</span></div>
      <p class="how" style="display:block">N'utilisez que des photos de personnes qui sont d'accord (l'accord d'un parent pour un enfant). Faux avis de décès, moqueries et usurpations sont interdits : voir les <a href="/cgu" style="color:var(--fg)">conditions</a>. Vos photos restent sur votre téléphone (<a href="/confidentialite" style="color:var(--fg)">confidentialité</a>).</p>
    </aside>
  </div>
  <div class="mbar">
    <button class="btn" type="button" data-act="share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg><span>Partager</span></button>
    <button class="btn ghost" type="button" data-act="dl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/></svg><span>Image</span></button>
    <button class="btn ghost" type="button" data-act="video"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg><span>Vidéo</span></button>
  </div>
  <p class="sr" role="status" id="sr"></p>
<div class="ed" id="ed" hidden role="dialog" aria-modal="true" aria-labelledby="ed-t">
  <div class="ed-box">
    <div class="ed-hd"><h2 id="ed-t">Retoucher le détourage</h2><button class="ed-x" type="button" id="ed-x" aria-label="Fermer sans appliquer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div class="ed-stage" id="ed-stage" data-bg="damier"><canvas id="ed-cv" role="img" aria-label="Aperçu de la photo détourée. Glissez le doigt dessus pour gommer ou restaurer."></canvas><span class="ed-ring" id="ed-ring" hidden></span></div>
    <div class="ed-tools" id="ed-tools">
      <label class="ed-f" id="ed-tgt-w" hidden><span class="lbl">Photo</span><select id="ed-tgt"></select></label>
      <div class="ed-seg" role="radiogroup" aria-label="Outil">
        <input type="radio" name="edtool" id="et-e" value="erase" checked><label for="et-e"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 21-4-4L14 6l6 6-9 9z"/><path d="M22 21H7M9 11l6 6"/></svg>Gommer</label>
        <input type="radio" name="edtool" id="et-r" value="restore"><label for="et-r"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 3a3 3 0 0 1 3 3L9 18l-5 1 1-5z"/></svg>Restaurer</label>
        <input type="radio" name="edtool" id="et-m" value="move"><label for="et-m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20M2 12h20M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3"/></svg>Déplacer</label>
      </div>
      <div class="ed-sl"><label class="lbl" for="ed-sz">Taille</label><input type="range" id="ed-sz" min="8" max="90" value="34"><span class="cnt" id="ed-sz-v">34 px</span></div>
      <div class="ed-sl"><label class="lbl" for="ed-zoom">Zoom</label><input type="range" id="ed-zoom" min="100" max="400" step="25" value="100"><span class="cnt" id="ed-zoom-v">100 %</span></div>
      <div class="ed-sl"><label class="lbl" for="ed-edge">Bord</label><input type="range" id="ed-edge" min="-3" max="3" value="0" aria-describedby="ed-edge-h"><span class="cnt" id="ed-edge-v">0</span></div>
      <p class="ed-h" id="ed-edge-h">Bord : vers la gauche pour resserrer autour de la personne (enlève un liseré), vers la droite pour élargir.</p>
      <div class="ed-seg sm" role="radiogroup" aria-label="Fond de l'aperçu">
        <input type="radio" name="edbg" id="eb-d" value="damier" checked><label for="eb-d">Damier</label>
        <input type="radio" name="edbg" id="eb-n" value="sombre"><label for="eb-n">Sombre</label>
        <input type="radio" name="edbg" id="eb-c" value="clair"><label for="eb-c">Clair</label>
      </div>
      <div class="ed-acts"><button class="btn ghost sm" type="button" id="ed-undo" disabled>Annuler le trait</button><button class="btn ghost sm" type="button" id="ed-reset">Tout rétablir</button><button class="btn sm" type="button" id="ed-ok">Appliquer</button></div>
    </div>
  </div>
</div>

</main>
`
