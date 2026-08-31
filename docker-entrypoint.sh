#!/bin/sh
set -e

if [ -n "$VAULT_ROLE_ID" ] && [ -n "$VAULT_SECRET_ID" ]; then
  echo "Fetching secrets from Vault..."
  node vault-fetch.js
  # Export Vault secrets into the process environment for Next.js server routes.
  if [ -f .env.local ]; then
    echo "Loading .env.local into environment..."
    # shellcheck disable=SC2046
    set -a
    # Prefer values from Vault; do not override already-set non-empty env unless from vault file.
    while IFS= read -r line || [ -n "$line" ]; do
      case "$line" in
        ''|\#*) continue ;;
      esac
      key=${line%%=*}
      raw=${line#*=}
      # Strip surrounding quotes written by vault-fetch.js
      val=$(printf '%s' "$raw" | sed -e 's/^"//' -e 's/"$//')
      export "$key=$val"
    done < .env.local
    set +a
  fi
fi

exec "$@"
