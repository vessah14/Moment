# TBF Moment — Frontend

Plateforme événementielle de l'écosystème TBF : création, personnalisation et
gestion d'événements (mariages, conférences, anniversaires...) sans code.

> **État du projet : prototype front-end.** Aucun backend n'existe. Toutes
> les données (invités, tarifs, campagnes...) sont codées en dur ou vivent en
> mémoire (`useState`) et sont perdues au rechargement de la page. Voir
> [Limites connues](#limites-connues) avant de présenter ce projet comme
> "fini".

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router 7 (`react-router-dom`) |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`, pas de fichier config séparé — tokens dans `src/index.css` via `@theme`) |
| Icônes | `lucide-react` |
| Graphiques | `recharts` |
| QR codes | `qrcode` (génération 100 % côté client) |
| Polices | `@fontsource/inter`, `@fontsource/plus-jakarta-sans`, `@fontsource/playfair-display` |
| Lint | `oxlint` |

## Démarrage

```bash
npm install
npm run dev       # serveur de dev, http://localhost:5173
npm run build     # build de production dans dist/
npm run lint      # oxlint
npm run preview   # sert le build de production en local
```

Aucune variable d'environnement n'est nécessaire : il n'y a pas d'API à
configurer.

## Structure du projet

```
src/
  data/            données statiques (mock) : tarifs, catégories d'événements,
                   modèles, invités, conférence, cadeaux, admin...
  utils/           fonctions utilitaires pures (formatCurrency, adminAuth)
  components/
    ui/            primitives partagées (Button, Avatar, StatusBadge...)
    layout/        Header, Footer, Dashboard{Sidebar,Topbar,Layout},
                    Admin{Sidebar,Topbar,Layout}, AuthLayout, InfoPage
    home/          sections de la page d'accueil
    auth/          formulaires de connexion / inscription
    wizard/        les 4 étapes de création d'événement
    builder/       Event Builder (bibliothèque de blocs, canevas, style)
    dashboard/     widgets du tableau de bord organisateur
    analytics/ billing/ events/ templates/ pricing/  widgets par domaine
    program/ seating/ gifts/ conference/ communication/
                   composants des modules spécialisés (voir plus bas)
    admin/         garde de route (RequireAdmin)
  pages/           une page par route ; pages/dashboard/* = espace organisateur,
                   pages/admin/* = console super admin
```

Chaque page de tableau de bord suit le même patron : elle importe
`DashboardLayout` (ou `AdminLayout`), pose son propre état local avec
`useState`, et rend son contenu dedans. Il n'y a pas de state manager global
(pas de Redux/Zustand/Context métier) — l'état ne survit pas à la navigation
entre pages sœurs.

## Carte des routes

### Site public

| Route | Page |
|---|---|
| `/` | Accueil |
| `/modeles` | Bibliothèque de modèles (`?categorie=` pour préfiltrer) |
| `/tarifs` | Grille tarifaire |
| `/connexion`, `/inscription` | Auth organisateur (accepte n'importe quel couple non vide, aucune vérification) |
| `/ecosysteme`, `/support`, `/mentions-legales` | Pages statiques |
| `/invitation/:code` | Page invité — RSVP, QR de billet |
| `/cadeaux/:code` | Liste de mariage — vue invité |

### Espace organisateur (`/dashboard/...`)

Toutes les données affichées concernent un unique événement de démonstration
("Mariage Awa & Ibrahim" par défaut, "TBF Summit 2027" pour le module
Conférence). Il n'y a pas de sélecteur d'événement multi-comptes.

`evenements`, `evenements/nouveau` (assistant 4 étapes), `invitations`,
`communication`, `participants`, `billetterie`, `checkin`, `galerie`,
`livre-dor`, `programme`, `plan-de-table`, `liste-mariage`, `conference`,
`statistiques`, `parametres`.

`/builder` (hors préfixe `/dashboard`) est l'éditeur visuel de site
événementiel — desktop uniquement, un message invite à agrandir l'écran en
dessous du breakpoint `lg`.

### Console Super Admin (`/admin/...`)

Distincte du dashboard organisateur (autre sidebar, accent rouge). Protégée
par `RequireAdmin` (`src/components/admin/RequireAdmin.jsx`), qui vérifie un
flag dans `sessionStorage` — **protection cosmétique, pas une sécurité
réelle** (voir Limites connues).

- Identifiants de démo : `admin@tbfmoment.com` / `TbfAdmin2027!`
  (`src/utils/adminAuth.js`)
- Aucun lien visible n'y mène depuis le reste de l'app ; y accéder directement
  via l'URL.

Pages : Vue globale, Organisations, Événements, Facturation, Modération,
Paramètres système.

## Design system

Tokens définis dans `src/index.css` (bloc `@theme`), alignés sur la charte
graphique du cahier des charges :

- **Couleurs** : `--color-bg` (Deep Navy `#0B1020`), `--color-brand-purple`
  (Electric Purple `#6C4BF4`), `--color-brand-magenta` (Magenta `#D946EF`),
  `--color-gold` (Champagne Gold — réservé aux éléments "Premium"). Le
  dégradé orange→rose (`--color-brand-orange` / `--color-brand-pink`) est une
  exception assumée à la charte écrite, conservée à la demande sur les CTA
  principaux.
- **Typographie** : Plus Jakarta Sans (titres, appliqué globalement à
  `h1/h2/h3`), Inter (corps de texte, dashboard), Playfair Display
  (disponible comme option de thème dans l'Event Builder).
- **Palettes de graphiques** : validées avec le script de contrôle
  d'accessibilité du skill `dataviz` (contraste, daltonisme) — voir
  `--color-chart-*` dans `index.css`.

Composants UI partagés à réutiliser avant d'en recréer un : `Button`,
`StatusBadge` (registre de tous les libellés de statut de l'app — ajouter une
nouvelle entrée plutôt que faire un nouveau composant de badge), `Avatar`,
`StatCard`.

## Modules spécialisés par catégorie d'événement

Le cahier des charges (section 5) prévoit des modules dédiés par type
d'événement. État actuel :

- **Mariage** — complet : plan de table (`/dashboard/plan-de-table`), liste
  de mariage + cagnotte (`/dashboard/liste-mariage`, vue invité sur
  `/cadeaux/:code`).
- **Conférence** — partiel : intervenants, sessions, sponsors, certificats
  (`/dashboard/conference`, onglets). Les certificats sont de vrais PNG
  générés via `<canvas>` côté client.
- **Anniversaire, Obsèques, Graduation, Concert** — non construits (prévus
  V1/V2 dans la roadmap du cahier des charges, pas dans le MVP).

## Limites connues

À garder en tête avant d'itérer sur ce projet :

1. **Pas de backend.** Toute donnée saisie (invités ajoutés, campagnes
   créées, cadeaux réservés...) vit dans le state React de la page et
   disparaît à la navigation ou au rechargement.
2. **Pas d'authentification réelle.** Connexion organisateur : accepte tout
   couple non vide. Connexion admin : vérifie un couple fixe en clair dans le
   code (`src/utils/adminAuth.js`) — acceptable pour verrouiller une démo,
   pas pour de la sécurité réelle.
3. **Un seul événement de démonstration** par module — pas de gestion
   multi-événements réelle malgré l'UI qui le suggère (sélecteurs de
   catégorie, listes filtrables).
4. **Exports/téléchargements réels mais isolés.** Les CSV, `.ics`, QR codes et
   certificats générés sont de vrais fichiers (pas des simulations), mais
   rien n'est envoyé à un serveur — ils existent seulement sur la machine de
   la personne qui clique.
5. **Bundle non optimisé.** `npm run build` avertit sur un chunk > 500 Ko
   (recharts + polices). Envisager du code-splitting par route
   (`React.lazy`) si le temps de chargement devient un sujet.
6. **Pas de tests automatisés.**

## Prochaines étapes suggérées

1. Choisir la stack backend (le cahier des charges propose PHP 8+ ou Node.js,
   MySQL ou PostgreSQL) et définir les endpoints REST pour Event Core,
   Invités/RSVP et Billetterie en priorité — ce sont les données que chaque
   autre module consomme.
2. Remplacer les `useState` locaux des pages dashboard par des appels API,
   module par module.
3. Authentification réelle (sessions/tokens, RBAC organisateur/admin —
   cahier des charges section 12).
