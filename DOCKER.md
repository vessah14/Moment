# Tester TBF Moment avec Docker

Ce Compose démarre le site organisateur, la console admin, une API .NET répliquée derrière Nginx, PostgreSQL, Prometheus, Loki et Grafana. Il est destiné aux essais locaux, pas à une mise en production.

## Tester sans Docker (Windows)

Cette méthode lance directement l'API et la console admin. Elle nécessite .NET 8 ou plus récent, Node.js et PostgreSQL en local. Si PostgreSQL et la base de l'application existent déjà, ne crée pas une deuxième base et ne rejoue pas les scripts SQL ci-dessous.

1. Démarrer le service PostgreSQL depuis Windows si nécessaire. Pour une base déjà configurée, repérer son nom, son port et l'utilisateur/mot de passe utilisés ; les exemples suivants supposent `eventsaas`, le port `5432` et l'utilisateur `postgres`.
2. **Uniquement pour une base neuve et vide**, créer la base et charger le schéma puis les données de démonstration. Chaque commande PostgreSQL peut demander le mot de passe de l'utilisateur local `postgres` :

   ```powershell
   $psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
   & $psql -h localhost -U postgres -d postgres -c "CREATE DATABASE eventsaas;"
   & $psql -h localhost -U postgres -d eventsaas -v ON_ERROR_STOP=1 -f "database\docker\01-schema.sql"
   & $psql -h localhost -U postgres -d eventsaas -v ON_ERROR_STOP=1 -f "database\docker\02-seed.sql"
   ```

   Ne lance pas ces commandes si la base locale contient déjà les données de l'application : elles ne sont pas nécessaires pour une base existante. Vérifie seulement que les migrations et tables attendues par la version actuelle de l'API sont présentes.

3. Configurer les secrets de développement pour l'API. Utilise le nom de ta base, son port, ainsi que l'utilisateur et le mot de passe réellement configurés localement :

   ```powershell
   Set-Location "backend\src\backend_EventMoment"
   dotnet user-secrets set "ConnectionStrings:AdminConnection" "Host=localhost;Port=5432;Database=eventsaas;Username=postgres;Password=VOTRE_MOT_DE_PASSE_POSTGRES"
   dotnet user-secrets set "ConnectionStrings:ClientConnection" "Host=localhost;Port=5432;Database=eventsaas;Username=postgres;Password=VOTRE_MOT_DE_PASSE_POSTGRES"
   dotnet user-secrets set "ConnectionStrings:SignupConnection" "Host=localhost;Port=5432;Database=eventsaas;Username=postgres;Password=VOTRE_MOT_DE_PASSE_POSTGRES"
   dotnet user-secrets set "Jwt:Key" "local-testing-signing-key-change-me-2026"
   dotnet user-secrets set "AdminBootstrap:Email" "admin@tbfmoment.local"
   dotnet user-secrets set "AdminBootstrap:Password" "moment_admin_dev_only"
   dotnet user-secrets set "AdminBootstrap:FullName" "Administrateur local"
   ```

   Remplace `eventsaas`, `5432`, `postgres` et `VOTRE_MOT_DE_PASSE_POSTGRES` par les paramètres de ta base existante. Si tu as déjà configuré ces trois chaînes de connexion dans les secrets du projet, ne les remplace pas.

   Le superadmin de démonstration n'est créé que si la base ne contient encore aucun compte admin. Si elle en contient déjà, conserve les identifiants existants ou connecte-toi avec un compte admin déjà créé. Ne supprime pas de comptes ni de données pour suivre ce guide.

4. Lancer l'API dans ce terminal :

   ```powershell
   dotnet run --launch-profile http
   ```

5. Dans un deuxième terminal, depuis la racine du dépôt, démarrer la console admin :

   ```powershell
   Set-Location "admin"
   npm run dev
   ```

6. Ouvrir <http://localhost:5174/admin/connexion> et se connecter avec `admin@tbfmoment.local` / `moment_admin_dev_only`. L'API répond sur <http://localhost:5146/swagger>. Le compte n'est créé que si aucun compte admin n'existe dans la base.

## Démarrer

1. Installer et démarrer Docker Desktop.
2. Pour créer le compte superadmin local de démonstration, utiliser le fichier fourni avec `--env-file .env.docker.example`. Il configure `admin@tbfmoment.local` / `moment_admin_dev_only`. Pour personnaliser ces identifiants, copier le fichier vers `.env` à la racine du dépôt et modifier `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD` et éventuellement `APP_ADMIN_FULL_NAME`. Sans ces variables, aucun compte superadmin n'est créé. Les valeurs du fichier d'exemple sont réservées aux essais locaux ; ne pas les utiliser en production.
3. Lancer :

   ```powershell
   docker compose --env-file .env.docker.example up --build
   ```

4. Ouvrir :
   - Site organisateur : <http://localhost:5173>
   - Console admin : <http://localhost:5174/admin>
   - API et Swagger via le load balancer : <http://localhost:5147/swagger>
   - Métriques Prometheus : <http://localhost:9090>
   - Logs et tableau de bord Grafana : <http://localhost:3000>

   Connecte-toi à Grafana avec les valeurs `GRAFANA_USER` et `GRAFANA_PASSWORD` du fichier `.env.docker.example` (ou de ton `.env` local). Le dashboard **Moment - API Operations** est provisionné automatiquement et s'actualise toutes les cinq secondes.

4. Pour lancer davantage de réplicas API :

   ```powershell
   docker compose --env-file .env.docker.example up --build --scale api=3
   ```

Nginx répartit les requêtes entre les réplicas et applique des limites de débit partagées par adresse IP : 5 tentatives/minute sur les connexions (avec une tolérance aux pointes), 10 écritures publiques/minute et 60 requêtes API/minute. L'API conserve aussi ses limites applicatives. L'endpoint Prometheus `/metrics` n'est pas exposé par le proxy public local.

L'API utilise PostgreSQL en conteneur. Au premier démarrage du volume, les tables sont créées depuis `database/docker/01-schema.sql`, puis les catégories et offres de démonstration sont chargées depuis `database/docker/02-seed.sql`. Le premier superadmin est créé par l'API depuis `APP_ADMIN_EMAIL` et `APP_ADMIN_PASSWORD` si aucun compte admin n'existe ; les démarrages suivants ne modifient pas les comptes existants. L'export contient uniquement le schéma, les catégories et les offres, sans comptes organisateurs, événements, invités ni clés du fournisseur. SasPay, SMTP, Google et Facebook sont désactivés ou non configurés par défaut. Les coordonnées de contribution des sites restent des informations saisies par l'organisateur ; aucun paiement de contribution n'est lancé.

Les logs structurés de l'API sont envoyés à la console et à Loki. Le dashboard Grafana présente le débit, la latence p95, les réponses HTTP en erreur, l'activité du load balancer et les logs de l'API. Les métriques API sont collectées sur chaque réplica. Les données Prometheus, Loki et Grafana persistent dans des volumes dédiés.

## Paiements SasPay en mode test

Le parcours SasPay sert au paiement des abonnements. Il ouvre la page de paiement hébergée par SasPay (checkout session, documentation : https://docs.saspay.me) ; le site ne collecte pas les numéros de carte ou codes Mobile Money. Pour l'activer en local :

1. Dans le tableau de bord SasPay (https://app.saspay.me), section **Développeur** > **Clés API**, génère une clé de **test** avec la portée **Encaissement** (`PAYIN`) : le site n'effectue aucun décaissement. Ne partage pas cette clé et ne l'ajoute pas au dépôt.
2. Avec Docker Compose, expose le port du load balancer `5147` avec un tunnel HTTPS public. Dans SasPay, section **Webhooks**, crée un webhook vers `https://<tunnel-api>/api/payments/saspay/webhook`, abonné au moins à l'événement `transaction.success`. Note son secret de signature : SasPay ne l'affiche qu'une fois. Pour le lancement sans Docker plus bas, le backend écoute sur `5146`.
3. Copie `.env.docker.example` vers `.env` (non suivi par Git), puis renseigne `SASPAY_ENABLED=true`, `SASPAY_SECRET_KEY` et `SASPAY_WEBHOOK_SECRET`. La clé doit commencer par `sk_test_`. Laisse `SASPAY_ALLOW_LIVE=false`.
4. Redémarre Compose avec `docker compose up --build`. Pour Vite lancé directement sur l'hôte, active aussi SasPay dans `frontend/.env.local` avec `VITE_SASPAY_ENABLED=true`, puis redémarre Vite.

En production, déclare le webhook `https://api.tbfmoment.com/api/payments/saspay/webhook` dans SasPay, renseigne côté serveur `Payments__SasPay__Enabled=true`, `SasPay__SecretKey` et `SasPay__WebhookSecret`, puis active le bouton dans `frontend/.env.production` avec `VITE_SASPAY_ENABLED=true` et reconstruis le frontend. Cette variable ne contient aucun secret ; la clé SasPay et le secret webhook restent uniquement dans la configuration protégée du backend. La liste blanche d'IP de SasPay ne concerne que les clés de décaissement : elle n'est pas nécessaire ici.

Pour un lancement sans Docker, exécute ces commandes depuis `backend/src/backend_EventMoment` en remplaçant les valeurs d'exemple par les clés **test** :

```powershell
dotnet user-secrets set "SasPay:SecretKey" "sk_test_..."
dotnet user-secrets set "SasPay:WebhookSecret" "SECRET_WEBHOOK"
dotnet user-secrets set "Payments:SasPay:Enabled" "true"
```

Dans ce cas, démarre l'API sur `5146` et le frontend sur `5173`.

Le backend refuse les clés `sk_live_…` tant que `SASPAY_ALLOW_LIVE` (`SasPay:AllowLive`) n'est pas explicitement activé. SasPay renvoie le navigateur vers `Frontend:BaseUrl` après un paiement réussi ; le webhook reste nécessaire pour activer l'abonnement si l'organisateur ferme la page avant ce retour. Les variables sont vides et SasPay reste désactivé dans `.env.docker.example`.

Chaque création de checkout envoie une clé UUID `Idempotency-Key` à notre API, conservée avec le paiement : rejouer la même demande retourne la session existante, et une même clé ne peut pas être réutilisée pour une autre offre. SasPay n'offre pas d'idempotence sur la création de session ; en cas de résultat incertain, vérifie la référence affichée dans SasPay avant de créer une nouvelle tentative. Les paiements sont rangés dans la table historique `kpay_payments` : passer de KPay à SasPay ne demande aucune migration. Pour une base existante qui n'aurait pas encore joué les migrations précédentes, exécute dans l'ordre, avec le compte postgres : `20261023_kpay_idempotency.sql`, puis `20261024_kpay_only.sql`.

## Récupération de la double authentification admin

Sur l'écran MFA, l'administrateur peut demander un lien de récupération envoyé à l'adresse e-mail de son compte. Le lien expire après 20 minutes, ne peut être utilisé qu'une fois et réinitialise uniquement le MFA ; une connexion par mot de passe puis une nouvelle configuration TOTP restent obligatoires. L'envoi utilise le fournisseur e-mail déjà configuré (Brevo ou SMTP). En production, vérifie `Frontend:AdminUrl=https://admin.tbfmoment.com` et que la route `/admin/recuperation-mfa` est publiée avec la console admin. Les demandes sont limitées par adresse e-mail et par adresse IP.

SasPay héberge la page de paiement et doit traiter les informations nécessaires au règlement. Le navigateur ne transmet aucune donnée de carte ou code Mobile Money à l'API Moment. Le webhook est authentifié par sa signature HMAC-SHA256 (`X-Webhook-Signature` sur `horodatage.corps`, horodatage `X-Webhook-Timestamp` accepté à 5 minutes près), mais il ne suffit jamais à activer une offre : la session et la transaction sont relues auprès de l'API authentifiée SasPay, qui doit confirmer le statut, le montant et la devise (XAF). Une tentative refusée laisse la session ouverte, car le client peut réessayer sur la page SasPay ; seules une session expirée ou annulée la clôturent. En production, le site et l'API doivent aussi être servis derrière HTTPS ; si un reverse proxy termine TLS, configure `Proxy:KnownProxies` pour ses adresses afin que l'API reconnaisse correctement HTTPS. Conserve la clé SasPay dans un gestionnaire de secrets ou dans des variables d'environnement protégées, jamais dans le code source.

Si un ancien volume contient déjà une initialisation incomplète, Docker ne rejoue pas les scripts SQL automatiquement. Pour une installation de démonstration sans données à conserver, réinitialiser avec `docker compose --env-file .env.docker.example down -v`, puis relancer `docker compose --env-file .env.docker.example up --build`.

Les données restent dans le volume Docker `moment_db`. `docker compose down` arrête les services sans les effacer. Pour repartir de zéro et supprimer les données de test, exécuter `docker compose down -v`.

Les services web et PostgreSQL sont publiés uniquement sur l'ordinateur local. Ne réutilise pas ces identifiants ni cette configuration pour un serveur accessible depuis Internet.

## Adresse des visiteurs derrière Cloudflare et Render

Les quotas par IP (connexion, réponses des invités, consultation publique) doivent voir l'adresse
du visiteur, pas celle du dernier proxy. Derrière Cloudflare puis Render, l'IP interne de Render
change sans cesse : définis la variable d'environnement `Proxy__ClientIpHeader=CF-Connecting-IP`
sur le service API. Ne la règle que si l'API n'est joignable qu'à travers Cloudflare (c'est le
cas sur Render) : sinon un client pourrait choisir lui-même son adresse. Derrière un proxy aux
adresses fixes (nginx), utilise plutôt `Proxy:KnownProxies`.
