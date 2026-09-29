# TBF Moment — Frontend

Plateforme événementielle de l'écosystème TBF : création, personnalisation et
gestion d'événements (mariages, conférences, anniversaires...) sans code.

> **État du projet : prototype front-end.** Aucun backend n'existe. La
> plupart des données (tarifs, campagnes, statistiques...) sont codées en dur
> ou vivent en mémoire (`useState`) et sont perdues au rechargement de la
> page. Quelques listes (invités, événements créés, cadeaux/cagnotte) sont
> synchronisées entre pages via `localStorage` — pratique pour une démo dans
> un seul navigateur, mais ce n'est toujours pas une vraie persistance
> serveur. Voir [Limites connues](#limites-connues) avant de présenter ce
> projet comme "fini".

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router 7 (`react-router-dom`) |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`, pas de fichier config séparé — tokens dans `src/index.css` via `@theme`) |
| Icônes | `lucide-react` |
| Drapeaux de pays | `country-flag-icons` (SVG, pas d'emoji — rendu fiable sur Windows) |
| Graphiques | `recharts` |
| QR codes | `qrcode` (génération 100 % côté client, réutilisée sur l'invitation invité, le check-in et la billetterie) |
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
  utils/           fonctions utilitaires pures (formatCurrency, formatDate,
                   slugify, adminAuth, phoneCountry) + useLocalStorageState
                   (voir plus bas)
  components/
    ui/            primitives partagées (Button, Avatar, StatusBadge,
                    PhoneInput...)
    layout/        Header, Footer, Dashboard{Sidebar,Topbar,Layout},
                    Admin{Sidebar,Topbar,Layout}, AuthLayout, InfoPage,
                    GlobalSearch
    home/          sections de la page d'accueil
    auth/          formulaires de connexion / inscription
    onboarding/    les 4 étapes de l'accueil post-inscription (`/bienvenue`)
    wizard/        les 7 étapes de l'assistant "Créer un événement"
                    (+ un écran de succès) — voir plus bas
    builder/       Event Builder (bibliothèque de blocs, canevas avec rendu
                    réel des blocs, panneau de style)
    dashboard/     widgets du tableau de bord organisateur
    settings/      onglets de la page Paramètres (Profil, Sécurité,
                    Abonnement, Facturation, Équipe, Permissions, Domaine...)
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
entre pages sœurs, **sauf** pour les quelques listes qui passent par le hook
partagé `useLocalStorageState` (`src/utils/useLocalStorageState.js`) :

- `tbf_guests_v2` — liste d'invités, partagée entre Participants, Plan de
  table, l'invitation invité (`/invitation/:code`) et les certificats de
  conférence. Un invité ajouté (formulaire, import CSV, ou étape 5 de
  l'assistant de création d'événement) est visible partout.
- `tbf_myevents` — événements de l'organisateur, partagée entre "Mes
  événements" et l'assistant de création : publier un événement l'ajoute
  réellement à la liste au lieu de disparaître.
- `tbf_gifts` / `tbf_cagnotte` — liste de mariage et cagnotte, partagées
  entre la vue organisateur et la vue invité (`/cadeaux/:code`).

C'est un pub-sub maison au-dessus de `localStorage` (même onglet et
inter-onglets), explicitement documenté dans le fichier comme *pas* une
vraie persistance serveur. Le même mécanisme pilote aussi les préférences
globales : `tbf_theme` (clair/sombre/auto), `tbf_reduced_motion`,
`tbf_sidebar_collapsed` / `tbf_admin_sidebar_collapsed`.

Les confirmations d'action ("Enregistré", "Lien copié"...) passent par un
système de toast partagé (`ToastProvider` + `useToast()`, monté une seule
fois dans `main.jsx`) plutôt que par des messages inline recréés page par
page — certaines pages plus anciennes gardent encore leur propre feedback
inline, pas encore migrées.

## Carte des routes

### Site public

| Route | Page |
|---|---|
| `/` | Accueil |
| `/modeles` | Bibliothèque de modèles (`?categorie=` pour préfiltrer) |
| `/tarifs` | Grille tarifaire |
| `/connexion`, `/inscription` | Auth organisateur (accepte n'importe quel couple non vide, aucune vérification) |
| `/mot-de-passe-oublie` | Demande de réinitialisation (pas d'e-mail réel envoyé — un lien simule l'ouverture du lien reçu) |
| `/reinitialiser-mot-de-passe` | Définition d'un nouveau mot de passe |
| `/bienvenue` | Accueil post-inscription (4 étapes) — voir plus bas |
| `/ecosysteme`, `/support`, `/mentions-legales` | Pages statiques |
| `/invitation/:code` | Page invité — RSVP, QR de billet ; le `:code` est résolu contre la liste d'invités partagée (`tbf_guests_v2`) via un slug du nom |
| `/cadeaux/:code` | Liste de mariage — vue invité |

### Espace organisateur (`/dashboard/...`)

Toutes les données affichées concernent un unique événement de démonstration
("Mariage Awa & Ibrahim" par défaut, "TBF Summit 2027" pour le module
Conférence). Il n'y a pas de sélecteur d'événement multi-comptes pour
consulter les modules d'un événement en particulier (voir Limites connues).

`evenements`, `evenements/nouveau`, `invitations`, `communication`,
`participants`, `billetterie`, `checkin`, `galerie`, `livre-dor`,
`programme`, `plan-de-table`, `liste-mariage`, `conference`, `statistiques`,
`parametres`.

**`evenements/nouveau`** est un assistant à 7 étapes (+ un écran de succès),
intégré dans la sidebar/topbar du dashboard : Type d'événement (14
catégories), Informations générales, Choix du template (filtres Tous /
Recommandés / Premium / Minimal), Personnalisation (couleur d'accent,
message d'accroche), Invités (ajout manuel + import CSV), Options (modules
activables : QR check-in, programme, galerie, billetterie, livre d'or —
RSVP toujours actif), puis Aperçu & Publication. Publier ajoute réellement
l'événement à "Mes événements" et fusionne les invités saisis dans la liste
partagée.

`/builder` (hors préfixe `/dashboard`) est l'éditeur visuel de site
événementiel — desktop uniquement, un message invite à agrandir l'écran en
dessous du breakpoint `lg`. Le canevas rend le **vrai contenu** de chaque
bloc (pas des cartes abstraites) : compte à rebours réel calculé depuis la
date de l'événement, formulaire RSVP fonctionnel, FAQ en accordéon, livre
d'or avec formulaire d'ajout, galerie, témoins, localisation, billetterie,
pied de page. Les blocs sélectionnés en édition ont une vraie barre d'outils
(monter / descendre / supprimer).

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
Paramètres système. La topbar a sa propre cloche de notifications
(signalements en attente, nouvelles organisations, paiements).

## Design system

Tokens définis dans `src/index.css` (bloc `@theme`), alignés sur la charte
graphique du cahier des charges :

- **Couleurs** : `--color-bg` (Deep Navy `#0B1020`), `--color-brand-purple`
  (Electric Purple `#6C4BF4`), `--color-brand-magenta` (Magenta `#D946EF`),
  `--color-gold` (Champagne Gold — réservé aux éléments "Premium"). Le
  dégradé orange→rose (`--color-brand-orange` / `--color-brand-pink`) est une
  exception assumée à la charte écrite, conservée à la demande sur les CTA
  principaux. `--color-faint` a été éclairci (`#7883a8`, ex-`#6b7290`) pour
  repasser le seuil de contraste WCAG AA (4.5:1) sur le fond sombre.
- **Typographie** : Plus Jakarta Sans (titres, appliqué globalement à
  `h1/h2/h3`), Inter (corps de texte, dashboard), Playfair Display
  (disponible comme option de thème dans l'Event Builder).
- **Palettes de graphiques** : validées avec le script de contrôle
  d'accessibilité du skill `dataviz` (contraste, daltonisme) — voir
  `--color-chart-*` dans `index.css`.

Composants UI partagés à réutiliser avant d'en recréer un : `Button`
(variants `gradient`/`solid`/`outline`/`ghost`/`white`), `StatusBadge`
(registre de tous les libellés de statut de l'app — ajouter une nouvelle
entrée plutôt que faire un nouveau composant de badge), `Avatar`, `StatCard`,
`PhoneInput` (champ téléphone avec sélecteur de drapeau/indicatif,
recherche par nom, code ISO ou indicatif).

Le header public (`Header.jsx`) surligne le lien de la page courante et
combine un bouton contour ("Se connecter") avec le bouton en dégradé
("Créer mon événement") plutôt qu'un simple lien texte. Le footer a une
barre de bas de page dédiée (copyright + liens légaux), distincte des
colonnes de liens principales.

### Thème clair / sombre / auto

Piloté par `useTheme()` (`src/utils/useTheme.js`) via l'attribut
`data-theme` sur `<html>` : les tokens de couleur dans `index.css` ont un
bloc `:root[data-theme='light']` qui redéfinit les mêmes variables, donc
tout composant utilisant déjà `bg-bg`/`text-ink`/etc. se re-thème sans
modification. Un petit script bloquant dans `index.html` applique le bon
thème avant le premier rendu (pas de flash). Sélecteur accessible dans le
header public, les deux topbars (icônes), et en version complète avec
libellés dans Paramètres > Langue et fuseau > Apparence. Le rendu "site
public" dans le Builder (`BuilderCanvas.jsx`) reste volontairement toujours
clair, indépendant de ce thème — il simule une vraie page web.

### Accessibilité et préférences

- **Réduction des animations** : respecte `prefers-reduced-motion`
  automatiquement, plus un interrupteur manuel (`useReducedMotion`,
  Paramètres > Apparence) qui ajoute `data-reduced-motion="true"`.
- **Raccourci `Ctrl/Cmd+K`** : focus la recherche globale (`GlobalSearch.jsx`)
  depuis n'importe quelle page dashboard/admin.
- **Sidebar repliable** (dashboard et admin) : bouton en bas du menu, passe
  en icônes seules avec info-bulles ; état mémorisé par contexte
  (organisateur/admin séparés) ; toujours dépliée sur mobile (l'overlay).

## Modules spécialisés par catégorie d'événement

Le cahier des charges (section 5) prévoit des modules dédiés par type
d'événement. État actuel :

- **Mariage** — complet : plan de table (`/dashboard/plan-de-table`), liste
  de mariage + cagnotte (`/dashboard/liste-mariage`, vue invité sur
  `/cadeaux/:code`), tous branchés sur la même liste d'invités partagée que
  Participants.
- **Conférence** — partiel : intervenants, sessions, sponsors, certificats
  (`/dashboard/conference`, onglets). Les certificats sont de vrais PNG
  générés via `<canvas>` côté client, pour la liste d'invités partagée
  (plus une liste inventée séparée).
- **Anniversaire, Obsèques, Graduation, Concert** — non construits (prévus
  V1/V2 dans la roadmap du cahier des charges, pas dans le MVP).

## Onboarding post-inscription

Parcours plein écran séparé (`/bienvenue`, 4 étapes), affiché une seule fois
juste après l'inscription (`SignupForm` redirige ici plutôt que vers
`/dashboard`) — distinct de l'assistant "Créer un événement", qui reste
réutilisable à volonté depuis le dashboard :

1. **Type d'événement** — mêmes 14 catégories que l'assistant.
2. **Objectif** — privé / professionnel / public / je ne sais pas encore.
3. **Informations de base** — nom, date approximative, nombre d'invités
   estimé (conçu pour ce projet, pas de maquette fournie).
4. **Bienvenue** — récapitulatif des choix, puis soit "Créer mon premier
   événement" (ouvre l'assistant avec catégorie/nom/date pré-remplis via
   `location.state`), soit "Explorer le tableau de bord".

Un lien "Passer" est présent à chaque étape (sauf la dernière) et quitte
directement vers `/dashboard`, sans forcer à terminer le parcours.

## Limites connues

À garder en tête avant d'itérer sur ce projet :

1. **Pas de backend.** La plupart des données saisies (campagnes créées,
   statistiques, facturation...) vivent dans le state React de la page et
   disparaissent à la navigation ou au rechargement. Quelques listes
   (invités, événements, cadeaux/cagnotte) survivent via `localStorage` —
   voir [Structure du projet](#structure-du-projet) — mais restent propres à
   un seul navigateur, sans synchronisation entre appareils ni entre
   personnes.
2. **Pas d'authentification réelle.** Connexion organisateur : accepte tout
   couple non vide. Connexion admin : vérifie un couple fixe en clair dans le
   code (`src/utils/adminAuth.js`) — acceptable pour verrouiller une démo,
   pas pour de la sécurité réelle.
3. **Un seul événement de démonstration** par module — créer un second
   événement via l'assistant l'ajoute bien à "Mes événements", mais les
   autres modules (Programme, Galerie, Billetterie...) continuent d'afficher
   les données du même événement de démo, pas de bascule contextuelle réelle.
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
2. Remplacer les `useState` locaux et les clés `localStorage` des pages
   dashboard par des appels API, module par module.
3. Authentification réelle (sessions/tokens, RBAC organisateur/admin —
   cahier des charges section 12).
4. Finir la migration des confirmations d'action inline vers le système de
   toast partagé sur les pages qui ne l'utilisent pas encore.

E-mail : admin@tbfmoment.com
Mot de passe : TbfAdmin2027!
