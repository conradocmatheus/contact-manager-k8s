# EC2 production stack

This stack runs the frontend, API, and PostgreSQL on one EC2 instance. Only
Caddy publishes host ports; the API and database remain reachable only through
the Docker network.

## First deployment

The GitHub Actions workflows publish images after their tests pass. Clone the
backend repository, create the production environment file, and start the stack
from the backend directory.

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f compose.production.yml config
docker compose --env-file .env.production -f compose.production.yml pull
docker compose --env-file .env.production -f compose.production.yml up -d
```

Before starting the stack, replace every placeholder in `.env.production`.
Use the same URL-safe PostgreSQL password in `POSTGRES_PASSWORD` and
`DATABASE_URL`. Never commit `.env.production`.

## Automatic updates

Install the systemd timer after the first deployment:

```bash
sudo cp deploy/contact-manager-update.service /etc/systemd/system/
sudo cp deploy/contact-manager-update.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now contact-manager-update.timer
```

The timer checks the `api` and `frontend` images every two minutes. Compose only
recreates a service when its image changes. It never pulls or recreates the
PostgreSQL service, so the named database volume remains intact.

Inspect the timer and its latest deployment log with:

```bash
systemctl status contact-manager-update.timer
journalctl -u contact-manager-update.service -n 100 --no-pager
```

To promote production later, change both image tags in `.env.production` from
`:dev` to `:master` and run the update service once. SHA tags such as
`:sha-1a2b3c4` can be used for a pinned deployment or rollback.

## Verification

```bash
docker compose --env-file .env.production -f compose.production.yml ps
curl http://YOUR_ELASTIC_IP/api/health
```

The PostgreSQL data is stored in the named volume `contact-manager_postgres_data`.
Running `docker compose down` preserves it. Do not use `docker compose down -v`
unless permanent database deletion is intended.

## Manual build fallback

If the registry is temporarily unavailable, clone the frontend and backend as
sibling directories and build the branch images directly on the EC2 instance:

```bash
docker build -t contact-manager-front:dev ../contact-manager-front
docker build -t contact-manager-back:dev .
```
