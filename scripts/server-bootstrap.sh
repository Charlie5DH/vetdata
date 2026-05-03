#!/usr/bin/env bash
# Idempotent bootstrap for a fresh Ubuntu droplet that will host vetdata.
# Run this ONCE on the droplet, as root or with sudo:
#
#   bash server-bootstrap.sh
#
# Installs:
#   - Docker Engine + docker compose plugin
#   - UFW firewall, opening only 22, 80, 443
#   - A non-root deploy user "vetdata" with passwordless sudo for docker
#
# After this script you can run as the deploy user:
#   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-vetdata}"

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

if [[ $EUID -ne 0 ]]; then
	echo "This script must be run as root (try: sudo bash $0)"
	exit 1
fi

log "Updating apt and installing prerequisites"
apt-get update -y
apt-get install -y ca-certificates curl gnupg ufw rsync

if ! command -v docker >/dev/null 2>&1; then
	log "Installing Docker Engine"
	install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
		| gpg --dearmor -o /etc/apt/keyrings/docker.gpg
	chmod a+r /etc/apt/keyrings/docker.gpg

	. /etc/os-release
	echo \
		"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
		| tee /etc/apt/sources.list.d/docker.list >/dev/null

	apt-get update -y
	apt-get install -y \
		docker-ce \
		docker-ce-cli \
		containerd.io \
		docker-buildx-plugin \
		docker-compose-plugin
	systemctl enable --now docker
else
	log "Docker already installed: $(docker --version)"
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
	log "Creating deploy user: $DEPLOY_USER"
	useradd -m -s /bin/bash "$DEPLOY_USER"
fi

log "Adding $DEPLOY_USER to docker group"
usermod -aG docker "$DEPLOY_USER"

log "Granting $DEPLOY_USER passwordless sudo"
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: ALL" > "/etc/sudoers.d/$DEPLOY_USER"
chmod 0440 "/etc/sudoers.d/$DEPLOY_USER"

# Mirror authorized_keys from root so the same SSH key works for deploy user.
if [[ -f /root/.ssh/authorized_keys ]]; then
	log "Copying root's authorized_keys to $DEPLOY_USER"
	install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" \
		"/home/$DEPLOY_USER/.ssh"
	install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" \
		/root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

log "Configuring UFW firewall (allow 22, 80, 443)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow 443/udp >/dev/null   # HTTP/3
yes | ufw enable >/dev/null || true
ufw status verbose

log "Done. Next steps:"
cat <<EOF

  1. From your laptop, rsync the project to the droplet:

       ./scripts/deploy.sh ${DEPLOY_USER}@157.245.131.216

  2. SSH in as ${DEPLOY_USER} and finish setup:

       ssh ${DEPLOY_USER}@157.245.131.216
       cd ~/vetdata
       cp .env.production.example .env
       cp backend/.env.production.example backend/.env.production
       nano .env                       # set POSTGRES_PASSWORD, LETSENCRYPT_EMAIL
       nano backend/.env.production    # set DATABASE_URL pw, AUTH_JWT_SECRET, etc.
       docker compose -f docker-compose.prod.yml up -d --build

EOF
