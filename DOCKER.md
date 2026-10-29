# Tester TBF Moment avec Docker

Ce Compose démarre le site organisateur, la console admin, une API .NET répliquée derrière Nginx, PostgreSQL, Prometheus, Loki et Grafana. Il est destiné aux essais locaux, pas à une mise en production.

## Démarrer

1. Installer et démarrer Docker Desktop.
2. Les valeurs de démonstration sont déjà définies dans Compose : aucun fichier `.env` n'est requis. Pour utiliser le fichier fourni explicitement, lance la commande avec `--env-file .env.docker.example`. Pour personnaliser les identifiants, copier ce fichier vers `.env` à la racine du dépôt et garder les mots de passe des rôles PostgreSQL cohérents avec `database/docker/00-roles.sql`.
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

L'API utilise PostgreSQL en conteneur. Au premier démarrage du volume, les tables sont créées depuis `database/docker/01-schema.sql`, puis les catégories et offres de démonstration sont chargées depuis `database/docker/02-seed.sql`. L'export contient uniquement le schéma, les catégories et les offres, sans comptes organisateurs, événements, invités ni clés du fournisseur. SasPay, SMTP, Google et Facebook sont désactivés ou non configurés par défaut. Les coordonnées de contribution des sites restent des informations saisies par l'organisateur ; aucun paiement de contribution n'est lancé.

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
