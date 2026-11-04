# Studio « Flyer d'honneur » (`/flyer`)

Repris du prototype `modeles/flyer.html` + `flyers-catalog.js` + `org.css`.

- `flyerMarkup.js` : structure HTML du studio (contenu statique).
- `flyerStudio.css` : styles du prototype, limités au conteneur `.tbfly`.
- `flyerCatalog.js` : occasions, messages et types d'événement. **C'est ici qu'on ajoute une occasion.**
- `flyerEngine.js` : dessin canvas, export PNG et vidéo. `initFlyerStudio(root)` monte le studio et renvoie la fonction de nettoyage.
- `pages/FlyerStudio.jsx` monte le tout. `utils/flyerLink.js` construit le bouton « Faire un flyer » des pages d'événement.

Différences avec le prototype :

- le QR code utilise la librairie `qrcode` de l'application ;
- `?cover=` n'accepte qu'une image autorisée par `mediaUrl()` ;
- l'écouteur global et les polices sont retirés en quittant la page ;
- le flyer est redessiné quand les polices finissent de charger.

## Détourage automatique (optionnel)

Le bouton « Détourer la personne » n'apparaît que si les modèles sont servis dans `frontend/public/vendor/`. Sans eux, le studio fonctionne sans détourage. Ce dossier `vendor` du prototype n'est pas dans le dépôt.

```
public/vendor/tf.min.js            TensorFlow.js        (moteur « Rapide »)
public/vendor/selfie-model.js      modèle selfie MediaPipe
public/vendor/ort/ort.wasm.min.js  onnxruntime-web      (moteur « HD »)
public/vendor/ort/*.wasm
public/vendor/modnet-model.js      modèle MODNet
```

Si un seul moteur est présent, il est utilisé seul. onnxruntime exécute du WebAssembly : quand la CSP sera appliquée (elle est en Report-Only), il faudra ajouter `'wasm-unsafe-eval'` à `script-src` dans `vercel.json`.
