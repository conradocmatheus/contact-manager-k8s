#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/home/ubuntu/contact-manager/contact-manager-back}"
ENV_FILE="${ENV_FILE:-${DEPLOY_DIR}/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-${DEPLOY_DIR}/compose.production.yml}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing environment file: ${ENV_FILE}" >&2
  exit 1
fi

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "Missing Compose file: ${COMPOSE_FILE}" >&2
  exit 1
fi

compose=(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}")

echo "Pulling application images..."
"${compose[@]}" pull api frontend

echo "Applying changed application images..."
"${compose[@]}" up -d --no-deps --wait --wait-timeout 120 api frontend

site_address="$(sed -n 's/^SITE_ADDRESS=//p' "${ENV_FILE}" | tail -n 1)"
site_address="${site_address%$'\r'}"
site_address="${site_address#\"}"
site_address="${site_address%\"}"

if [[ -z "${site_address}" ]]; then
  echo "SITE_ADDRESS is missing from ${ENV_FILE}" >&2
  exit 1
fi

site_host="${site_address#*://}"
site_host="${site_host%%/*}"
site_host="${site_host%%:*}"
health_url="${site_address%/}/api/health"

for attempt in {1..12}; do
  response=""

  if [[ "${site_address}" == https://* ]]; then
    response="$(curl -fsS --connect-timeout 5 --max-time 10 \
      --resolve "${site_host}:443:127.0.0.1" "${health_url}" || true)"
  else
    response="$(curl -fsS --connect-timeout 5 --max-time 10 \
      -H "Host: ${site_host}" http://127.0.0.1/api/health || true)"
  fi

  if grep -q '"status":"ok"' <<<"${response}"; then
    echo "Deployment healthy: ${health_url}"
    exit 0
  fi

  echo "Health check attempt ${attempt}/12 failed; retrying in 5 seconds..."
  sleep 5
done

echo "Deployment failed its health check: ${health_url}" >&2
"${compose[@]}" ps
exit 1
