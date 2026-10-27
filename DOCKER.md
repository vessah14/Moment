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

L'API utilise PostgreSQL en conteneur. Au premier démarrage du volume, les tables sont créées depuis `database/docker/01-schema.sql`, puis les catégories et offres de démonstration sont chargées depuis `database/docker/02-seed.sql`. L'export contient uniquement le schéma, les catégories et les offres, sans comptes organisateurs, événements, invités ni clés du fournisseur. KPay, SMTP, Google et Facebook sont désactivés ou non configurés par défaut. Les coordonnées de contribution des sites restent des informations saisies par l'organisateur ; aucun paiement de contribution n'est lancé.

Les logs structurés de l'API sont envoyés à la console et à Loki. Le dashboard Grafana présente le débit, la latence p95, les réponses HTTP en erreur, l'activité du load balancer et les logs de l'API. Les métriques API sont collectées sur chaque réplica. Les données Prometheus, Loki et Grafana persistent dans des volumes dédiés.

## Paiements KPay en sandbox

Le parcours KPay sert au paiement des abonnements. Il ouvre la page hébergée KPay ; le site ne collecte pas les numéros de carte ou codes Mobile Money. Pour l'activer en local :

1. Dans KPay, crée une application de test, choisis le mode **Gateway** et récupère ses clés sandbox ainsi que le secret webhook. Ne partage pas ces secrets et ne les ajoute pas au dépôt.
2. Avec Docker Compose, expose le port du load balancer `5147` avec un tunnel HTTPS public. Dans KPay, renseigne le callback générique : `https://<tunnel-api>/api/payments/kpay/webhook`. L'adresse publique doit rester stable pendant les essais. Pour le lancement sans Docker plus bas, le backend écoute sur `5146`.
3. Copie `.env.docker.example` vers `.env` (non suivi par Git), puis renseigne `KPAY_ENABLED=true`, `KPAY_API_KEY`, `KPAY_SECRET_KEY` et `KPAY_WEBHOOK_SECRET`. Les clés API doivent commencer par `kpay_test_`. Laisse `KPAY_ALLOW_LIVE=false`.
4. Redémarre Compose avec `docker compose up --build`. Pour Vite lancé directement sur l'hôte, active aussi KPay dans `frontend/.env.local` avec `VITE_KPAY_ENABLED=true`, puis redémarre Vite.

En production, active également le bouton KPay dans `frontend/.env.production` avec `VITE_KPAY_ENABLED=true`, puis reconstruis et redéploie le frontend. Cette variable ne contient aucun secret ; les clés API KPay et le secret webhook restent uniquement dans la configuration protégée du backend.

Pour un lancement sans Docker, exécute ces commandes depuis `backend/src/backend_EventMoment` en remplaçant les valeurs d'exemple par les clés **test** de ton application :

```powershell
dotnet user-secrets set "KPay:ApiKey" "kpay_test_..."
dotnet user-secrets set "KPay:SecretKey" "CLE_SECRETE_TEST"
dotnet user-secrets set "KPay:WebhookSecret" "SECRET_WEBHOOK"
dotnet user-secrets set "Payments:KPay:Enabled" "true"
```

Dans ce cas, démarre l'API sur `5146` et le frontend sur `5173`.

Le backend refuse les clés `kpay_live_…` tant que `KPAY_ALLOW_LIVE` n'est pas explicitement activé. Le retour navigateur utilise `Frontend:BaseUrl`; le webhook HTTPS reste nécessaire pour confirmer le résultat et activer l'abonnement. Les variables sandbox sont vides et KPay reste désactivé dans `.env.docker.example`.

Chaque création de checkout envoie une clé UUID `Idempotency-Key`, conservée avec le paiement. Rejouer la même demande retourne le checkout existant ; une même clé ne peut pas être réutilisée pour une autre offre. Si l'appel au fournisseur a un résultat incertain, vérifie le statut avant de créer une nouvelle tentative. Pour une base déjà existante, exécute les migrations KPay non encore appliquées dans l'ordre, avec un rôle administrateur PostgreSQL : `20261023_kpay_idempotency.sql`, puis `20261024_kpay_only.sql`. Les nouvelles bases Docker utilisent directement les noms de tables KPay.

KPay héberge la page de paiement et doit traiter les informations nécessaires au règlement : un chiffrement de bout en bout entre l'organisateur et notre site empêcherait KPay de les recevoir. Le navigateur ne transmet aucune donnée de carte ou code Mobile Money à l'API Moment ; les échanges avec KPay et le webhook utilisent HTTPS, la signature HMAC du webhook est contrôlée, puis le statut, la référence, le montant et la devise sont vérifiés auprès de l'API authentifiée KPay avant l'activation de l'abonnement. L'idempotence empêche notre backend de réémettre la création lors d'un replay avec la même clé ; en cas de perte de réponse après acceptation côté fournisseur, vérifie la référence affichée dans KPay avant toute nouvelle tentative, car la récupération automatique dépend d'une API d'idempotence ou de recherche par référence offerte par KPay. En production, le site et l'API doivent aussi être servis derrière HTTPS ; si un reverse proxy termine TLS, configure `Proxy:KnownProxies` pour ses adresses afin que l'API reconnaisse correctement HTTPS. Conserve les clés KPay dans un gestionnaire de secrets ou dans des variables d'environnement protégées, jamais dans le code source.

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
