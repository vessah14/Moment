# TBF Moment — Frontend

Plateforme événementielle de l'écosystème TBF : création, personnalisation et
gestion d'événements (mariages, conférences, anniversaires...) sans code.

> **État du projet : application en développement.** Une API ASP.NET Core et
> PostgreSQL existent à la racine du dépôt. Les parcours d'authentification,
> d'événements, d'invités, de RSVP et plusieurs autres modules utilisent cette
> API. D'autres écrans restent des démonstrations avec des données locales ou
> statiques. Voir [Limites connues](#limites-connues) avant un déploiement.

## Stack technique

| Domaine          | Choix                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Framework        | React 19 + Vite 8                                                                                              |
| Routing          | React Router 7 (`react-router-dom`)                                                                            |
| Styles           | Tailwind CSS v4 (`@tailwindcss/vite`, pas de fichier config séparé — tokens dans `src/index.css` via `@theme`) |
| Icônes           | `lucide-react`                                                                                                 |
| Drapeaux de pays | `country-flag-icons` (SVG, pas d'emoji — rendu fiable sur Windows)                                             |
| Graphiques       | `recharts`                                                                                                     |
| QR codes         | `qrcode` (génération 100 % côté client, réutilisée sur l'invitation invité, le check-in et la billetterie)     |
| Polices          | `@fontsource/inter`, `@fontsource/plus-jakarta-sans`, `@fontsource/playfair-display`                           |
| Lint             | `oxlint`                                                                                                       |

## Démarrage

```bash
npm install
npm run dev       # serveur de dev, http://localhost:5173
npm run build     # build de production dans dist/
npm run lint      # oxlint
npm run preview   # sert le build de production en local
```

L'API se lance séparément depuis `backend_EventMoment` avec le profil `http`
(`http://localhost:5146`). Elle requiert PostgreSQL et les paramètres locaux
`Jwt:Key` et `ConnectionStrings:AdminConnection`, `ClientConnection` et
`SignupConnection` dans .NET User Secrets ou dans l'environnement. Pour lancer
la console administrateur, démarrez aussi la console (dossier `admin/`) (`npm install`, puis
`npm run dev`, port 5174). Les deux frontends utilisent `VITE_API_URL` ; sa
valeur locale par défaut est `http://localhost:5146/api`.

Le frontend est configuré pour tourner en HTTP local pour éviter le message
Chrome “Votre connexion n’est pas privée” provoqué par un certificat auto-signé.
Si une intégration OAuth ou un fournisseur tiers exige HTTPS, utilisez un
certificat local fiable (ex. `mkcert`) et remplacez la config de Vite avec une
configuration HTTPS certifiée.

Les intégrations Google et l'envoi réel d'e-mails nécessitent aussi leurs
identifiants de fournisseur dans la configuration du backend. Sans SMTP,
les e-mails de vérification et de réinitialisation ne sont pas envoyés.

## Structure du projet

```
src/
  data/            données statiques de présentation : tarifs, catégories,
                   modèles et index de recherche
  api/             clients REST pour l'API ASP.NET Core
  utils/           fonctions utilitaires pures (formatCurrency, formatDate,
                   slugify, phoneCountry) + useLocalStorageState
                   (voir plus bas)
  components/
    ui/            primitives partagées (Button, Avatar, StatusBadge,
                    PhoneInput...)
    layout/        Header, Footer, Dashboard{Sidebar,Topbar,Layout},
                    AuthLayout, InfoPage, GlobalSearch
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
  pages/           une page par route ; pages/dashboard/* = espace organisateur
```

Chaque page du tableau de bord charge ses données depuis l'API pour
l'événement sélectionné. Il n'y a pas de state manager métier global. Le hook
`useLocalStorageState` (`src/utils/useLocalStorageState.js`) sert aux
préférences locales : thème, réduction des animations et état replié de la
sidebar.

Les confirmations d'action ("Enregistré", "Lien copié"...) passent par un
système de toast partagé (`ToastProvider` + `useToast()`, monté une seule
fois dans `main.jsx`) plutôt que par des messages inline recréés page par
page — certaines pages plus anciennes gardent encore leur propre feedback
inline, pas encore migrées.

## Carte des routes

### Site public

| Route                                          | Page                                                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                            | Accueil                                                                                                                          |
| `/modeles`                                     | Bibliothèque de modèles (`?categorie=` pour préfiltrer)                                                                          |
| `/tarifs`                                      | Grille tarifaire                                                                                                                 |
| `/connexion`, `/inscription`                   | Auth organisateur via l'API (JWT)                                                                                               |
| `/mot-de-passe-oublie`                         | Demande de réinitialisation via l'API (l'envoi du lien requiert SMTP configuré)                                                  |
| `/reinitialiser-mot-de-passe`                  | Définition d'un nouveau mot de passe                                                                                             |
| `/bienvenue`                                   | Accueil post-inscription (4 étapes) — voir plus bas                                                                              |
| `/ecosysteme`, `/support`, `/mentions-legales` | Pages statiques                                                                                                                  |
| `/invitation/:code`                            | Invitation publique chargée depuis l'API par identifiant d'invité, avec RSVP et billet QR                                      |
| `/cadeaux/:code`                               | Liste de mariage — vue invité                                                                                                    |

### Espace organisateur (`/dashboard/...`)

Les modules connectés à l'API chargent les événements de l'organisateur et
permettent de choisir l'événement concerné. Certains panneaux et graphiques
restent alimentés par des données de démonstration.

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

Distincte du dashboard organisateur et servie par l'application séparée
`admin/` (autre sidebar, accent rouge). Les routes sont protégées côté
client pour l'expérience utilisateur et l'API vérifie le JWT et le rôle admin
sur chaque opération sensible.

- Aucun lien visible n'y mène depuis le reste de l'app ; y accéder directement
  via l'URL `http://localhost:5174/admin` en développement.

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

1. **Persistance encore incomplète.** Des écrans et statistiques de démonstration
   utilisent des données statiques ou un état React local ; les données ne
   sont pas toutes enregistrées dans PostgreSQL. Quelques préférences restent
   dans `localStorage`.
2. **Services externes à configurer.** Sans SMTP, les liens de vérification et
   de récupération de compte ne sont pas livrés. Google Sign-In nécessite un
   client ID valide ; Facebook OAuth doit être configuré dans le tableau de
   bord Meta avec l'URL de retour du frontend.
3. **Contenu de démonstration restant.** Quelques panneaux, statistiques et
   listes sont encore des maquettes et ne reflètent pas les données de tous
   les événements.
4. **Exports/téléchargements réels mais isolés.** Les CSV, `.ics`, QR codes et
   certificats générés sont de vrais fichiers (pas des simulations), mais
   rien n'est envoyé à un serveur — ils existent seulement sur la machine de
   la personne qui clique.
5. **Configuration et données de production à fournir.** Les secrets,
   paramètres PostgreSQL, SMTP/OAuth et migrations de base doivent être
   configurés et validés dans l'environnement de déploiement.

## Prochaines étapes suggérées

1. Compléter la migration des écrans de démonstration vers les endpoints API.
2. Configurer et valider les services SMTP et OAuth par environnement.
3. Ajouter des tests d'intégration des principaux parcours avec PostgreSQL.
