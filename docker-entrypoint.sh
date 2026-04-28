#!/bin/sh
set -e

if [ -n "$VAULT_ROLE_ID" ] && [ -n "$VAULT_SECRET_ID" ]; then
  echo "Fetching secrets from Vault..."
  node vault-fetch.js
  # Source the generated .env.local if needed, but Next.js standalone reads it
fi

exec "$@"
