# TBF Moment

Dépôt de travail du projet TBF Moment. Contient les assets de marque bruts et
l'application front-end.

```
TBF MOMENT/
  img Logo/              variantes du logo, exportées telles que fournies
  Contents.json          fragment isolé, voir note plus bas — probablement
                          sans usage réel
  tbf-moment/frontend/    application React (Vite) — voir son propre
                          README.md pour la doc technique complète
```

La documentation de l'application (stack, routes, structure du code, limites
connues, prochaines étapes) est dans
[`tbf-moment/frontend/README.md`](tbf-moment/frontend/README.md). Ce fichier-ci
ne couvre que ce qui est à la racine du dépôt, en dehors de l'app.

## `img Logo/` — variantes du logo

Toutes les images sont fournies telles quelles (aucune n'a été retouchée).
Le fichier réellement utilisé dans l'application est **`tranche5.png`**
(copié dans `tbf-moment/frontend/src/assets/logo.png`) et **`tranche6.png`**
(icône seule, copié en `logo-mark.png` et servi comme favicon).

| Fichier | Description | Fond |
|---|---|---|
| `tranche6.png` | Icône seule (symbole M + étoile), dégradé couleur | Transparent |
| `tranche5.png` **← utilisé** | Icône + "TBF MOMENT" + slogan, dégradé couleur | Transparent |
| `tranche04.png` | Identique à `tranche5.png`, recadrage légèrement différent | Transparent |
| `tranche4.png` | Icône + wordmark, sur fond violet dégradé intégré à l'image | Opaque (violet) |
| `Arrière-plan.png` | Icône + trait vertical + "TBF \| MOMENT" | Opaque (bleu nuit, proche de `--color-bg` de l'app) |
| `tranche1.png` | Version noir sur blanc | Transparent |
| `tranche2.png` | Version monochrome noire | Transparent — **peu lisible sur fond sombre**, évité dans l'app pour cette raison |
| `tranche3.png` | Version or / champagne | Fond sombre intégré |

Si une nouvelle variante (verticale, inversée blanche, app icon carrée...) est
produite un jour, l'ajouter dans ce dossier et mettre à jour ce tableau plutôt
que d'ouvrir un nouveau dossier d'assets.

## `Contents.json`

Fragment d'un catalogue d'assets Xcode (`"author": "xcode"`), qui référence
`tranche4.png` et `tranche6.png`. Il est isolé à la racine, en dehors de toute
structure `.xcassets/*.imageset/` — dans cet état, **il n'est fonctionnel dans
aucun build** (ni l'app web, ni un projet Xcode). À conserver seulement si un
projet iOS/macOS de l'écosystème TBF doit un jour réutiliser ces mêmes
tranches d'icône ; sinon, sans risque de suppression.
