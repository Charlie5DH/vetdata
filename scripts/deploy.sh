#!/usr/bin/env bash
# Sync the project to the droplet and (optionally) rebuild the stack.
#
# Usage:
#   ./scripts/deploy.sh user@host [--up]
#
# Examples:
#   ./scripts/deploy.sh vetdata@157.245.131.216
#   ./scripts/deploy.sh vetdata@157.245.131.216 --up
#
# The first form just syncs files. Pass --up to also rebuild and restart
# the stack remotely (uses docker compose -f docker-compose.prod.yml).
#
# Files excluded from the sync (see EXCLUDES below): node_modules,
# .venv, dist/build artifacts, .env files, __pycache__, etc. The remote
# .env.production files are preserved.

set -euo pipefail

REMOTE="${1:-}"
ACTION="${2:-sync}"

if [[ -z "$REMOTE" ]]; then
	echo "Usage: $0 user@host [--up]"
	exit 2
fi

REMOTE_DIR="vetdata"

EXCLUDES=(
	--exclude=".git/"
	--exclude=".venv/"
	--exclude="venv/"
	--exclude="**/__pycache__/"
	--exclude="**/*.pyc"
	--exclude="frontend/node_modules/"
	--exclude="frontend/dist/"
	--exclude="frontend/build/"
	--exclude=".env"
	--exclude=".env.local"
	--exclude=".env.production"
	--exclude="backend/.env"
	--exclude="backend/.env.local"
	--exclude="backend/.env.production"
	--exclude="frontend/.env"
	--exclude="frontend/.env.local"
	--exclude=".vscode/"
	--exclude=".idea/"
	--exclude="*.log"
)

echo "==> rsync to $REMOTE:$REMOTE_DIR/"
rsync -avz --delete-after "${EXCLUDES[@]}" \
	./ "$REMOTE:$REMOTE_DIR/"

if [[ "$ACTION" == "--up" ]]; then
	echo "==> Rebuilding and restarting stack on $REMOTE"
	# We rely on .env (auto-loaded by compose). The first deploy creates
	# it from .env.production.example; see DEPLOY.md.
	ssh "$REMOTE" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build"
	echo "==> Tailing logs (Ctrl-C to detach):"
	ssh -t "$REMOTE" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs -f --tail=50"
fi
