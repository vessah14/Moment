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

Les secrets (base de données, clé JWT, Brevo, Cloudinary, Google, Facebook, SasPay)
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

Le passage de KPay à SasPay ne demande aucune migration : les paiements restent dans la table `kpay_payments` (nom historique). Pour les bases existantes, applique aussi `20261024_kpay_only.sql` après les migrations KPay déjà jouées. Elle renomme les tables et colonnes historiques sans supprimer les paiements ni les abonnements existants. Les anciennes migrations portant les noms du précédent fournisseur restent dans l'historique pour assurer la compatibilité des bases déjà installées ; l'application et les nouvelles bases utilisent uniquement KPay.

Toute nouvelle table doit aussi être ajoutée à `20261011_row_level_security.sql`
(politiques RLS) et donner ses droits à `app_admin`.

## Stockage des images en production

L'API accepte les images, les valide et les stocke dans Cloudflare R2 (S3 compatible).
Crée un bucket R2, une clé API limitée à ce bucket avec les droits de lecture/écriture
d'objets, et un domaine personnalisé HTTPS pour servir les images publiques des événements
(par exemple `media.tbfmoment.com`). Les clés R2 sont des secrets du service backend : ne les
place ni dans le frontend, ni dans Git.

Configure les variables d'environnement du backend :

| Variable | Valeur |
|---|---|
| `CloudflareR2__AccountId` | ID du compte Cloudflare |
| `CloudflareR2__AccessKeyId` | Access Key ID R2 |
| `CloudflareR2__SecretAccessKey` | Secret Access Key R2 |
| `CloudflareR2__Bucket` | Nom du bucket |
| `CloudflareR2__PublicBaseUrl` | URL HTTPS du domaine public, sans chemin (ex. `https://media.tbfmoment.com`) |
| `CloudflareR2__Folder` | Préfixe des objets, par défaut `tbf-moment` |

Configure aussi `VITE_R2_PUBLIC_BASE_URL` avec la même URL HTTPS dans l'environnement de
build du frontend, puis reconstruis et déploie les deux services. L'API donne priorité à R2
lorsque ces paramètres sont renseignés ; sinon elle conserve le stockage Cloudinary configuré,
ou le disque local en développement. Les anciennes URLs Cloudinary et `/uploads/…` restent
compatibles. Le domaine public sert les images, tandis que les clés d'écriture restent côté API.
Dans Cloudflare, configure le domaine personnalisé sur le bucket R2 et ne publie pas les clés
d'API. Si tu utilises l'export d'images depuis le navigateur, autorise aussi en lecture les
origines du site dans la politique CORS du bucket.

## Documentation

- `frontend/README.md` : architecture du site, routes, modèles de sites.
- `docs/historique-depot-site.md` : ancien README du dépôt du site (logos, historique).
