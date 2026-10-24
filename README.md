# TBF Moment

Plateforme de création de sites d'événements (mariages, conférences, anniversaires…) :
site public de l'événement, invitations et RSVP, billetterie, galerie, livre d'or,
statistiques, console d'administration.

## Organisation du dépôt

```
Moment/
├── backend/                      API .NET 8 (ASP.NET Core + PostgreSQL)
│   ├── TbfMoment.sln             solution : ouvrir ce fichier dans Visual Studio / Rider
│   ├── src/backend_EventMoment/  l'API (contrôleurs, services, modèles, e-mails…)
│   ├── tests/backend_EventMoment.Tests/   tests xUnit
│   └── tools/hash-tool/          petit utilitaire (empreintes de mots de passe)
├── database/
│   └── migrations/               scripts SQL, à jouer dans l'ordre des noms
├── frontend/                     site public + espace organisateur (React 19, Vite, Tailwind 4)
├── admin/                        console d'administration (React, Vite)
├── brand/logos/                  logos d'origine (fichiers sources)
└── docs/                         documentation complémentaire
```

## Lancer le projet en local

Pour démarrer l'ensemble du projet dans des conteneurs Docker de test, voir [DOCKER.md](DOCKER.md).

| Partie | Dossier | Commande | Adresse |
|---|---|---|---|
| API | `backend/src/backend_EventMoment` | `dotnet run --launch-profile http` | http://localhost:5146 |
| Site | `frontend` | `npm install` puis `npm run dev` | http://localhost:5173 |
| Admin | `admin` | `npm install` puis `npm run dev` | http://localhost:5174 |
| Tests API | `backend` | `dotnet test` | — |
| Tests site | `frontend` | `npx vitest run` | — |

Les secrets (base de données, clé JWT, Brevo, Cloudinary, Google, Facebook, KPay)
ne sont jamais dans le dépôt : en local ils sont dans `dotnet user-secrets`
(projet `backend/src/backend_EventMoment`), en production dans des variables
d'environnement. Les fichiers `.env` des parties React ne contiennent que des valeurs
publiques.

## Base de données

PostgreSQL, base `eventsaas`. Les tables appartiennent au compte `postgres` ; l'API se
connecte avec `app_admin`, qui ne peut que lire et écrire des lignes, sous Row Level
Security (chaque organisateur ne voit que ses données).

Les migrations de `database/migrations/` se lancent **avec le compte postgres** :

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d eventsaas -f "database\migrations\<fichier>.sql"
```

Pour les bases existantes, applique aussi `20261024_kpay_only.sql` après les migrations KPay déjà jouées. Elle renomme les tables et colonnes historiques sans supprimer les paiements ni les abonnements existants. Les anciennes migrations portant les noms du précédent fournisseur restent dans l'historique pour assurer la compatibilité des bases déjà installées ; l'application et les nouvelles bases utilisent uniquement KPay.

Toute nouvelle table doit aussi être ajoutée à `20261011_row_level_security.sql`
(politiques RLS) et donner ses droits à `app_admin`.

## Documentation

- `frontend/README.md` : architecture du site, routes, modèles de sites.
- `docs/historique-depot-site.md` : ancien README du dépôt du site (logos, historique).
