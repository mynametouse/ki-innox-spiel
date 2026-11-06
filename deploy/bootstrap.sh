#!/usr/bin/env bash
# Einmalig als root auf dem Server rkw-lab-06 (91.99.230.235) ausführen.
# Aufruf: REPO=<git-URL> MODE=static|app [DOMAIN=science.reallabore.berlin] [BRANCH=main] bash bootstrap.sh
set -euo pipefail
REPO="${REPO:?REPO fehlt, z. B. https://github.com/OWNER/REPO.git oder git@github.com:OWNER/REPO.git}"
MODE="${MODE:?MODE fehlt: static oder app}"
DOMAIN="${DOMAIN:-science.reallabore.berlin}"
BRANCH="${BRANCH:-main}"
LAB=/opt/lab
DC="docker compose -f $LAB/docker-compose.yml"

apt-get update -qq && apt-get install -y -qq git rsync >/dev/null

mkdir -p /etc/science
printf 'REPO=%q\nBRANCH=%q\nMODE=%q\n' "$REPO" "$BRANCH" "$MODE" > /etc/science/env

# Privates Repo: Deploy-Schlüssel erzeugen und den ÖFFENTLICHEN Teil kurz abrufbar machen
if [[ "$REPO" == git@* ]]; then
  [ -f /root/.ssh/science_deploy ] || ssh-keygen -q -t ed25519 -N "" -C "rkw-lab-06 deploy" -f /root/.ssh/science_deploy
  install -m 644 /root/.ssh/science_deploy.pub "$LAB/apps/_science-deploykey.txt"
  echo "Öffentlicher Deploy-Schlüssel: https://apps.lab.reallabore.berlin/_science-deploykey.txt"
fi

cat > /usr/local/bin/science-deploy <<'EOS'
#!/usr/bin/env bash
set -uo pipefail
source /etc/science/env
LAB=/opt/lab; DIR=/opt/science; STATUS=$LAB/apps/_science-status.txt; LOG=/var/log/science-deploy.log
export GIT_SSH_COMMAND="ssh -i /root/.ssh/science_deploy -o StrictHostKeyChecking=accept-new -o BatchMode=yes"
status() {
  { echo "zeit: $(date -Is)"; echo "modus: $MODE"; echo "stand: $1"
    echo "commit: $(git -C $DIR rev-parse --short HEAD 2>/dev/null || echo -)"
    echo "--- letzte Protokollzeilen"; tail -n 40 $LOG; } > $STATUS.tmp
  chmod 644 $STATUS.tmp; mv $STATUS.tmp $STATUS
}
exec >>$LOG 2>&1
FORCE="${1:-}"
if [ ! -d $DIR/.git ]; then
  git clone -q --branch "$BRANCH" "$REPO" $DIR || { status "FEHLER: Klonen nicht möglich (Zugriff oder Deploy-Schlüssel prüfen)"; exit 1; }
  rm -f $LAB/apps/_science-deploykey.txt
  FORCE=--force
fi
cd $DIR
git fetch -q origin "$BRANCH" || { status "FEHLER: git fetch"; exit 1; }
if [ "$FORCE" = --force ] || [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/$BRANCH)" ]; then
  git reset -q --hard "origin/$BRANCH"
  echo "== $(date -Is) deploy $(git rev-parse --short HEAD)"
  if [ "$MODE" = static ]; then
    [ -d $DIR/site ] || { status "FEHLER: Ordner site/ fehlt im Repo"; exit 1; }
    mkdir -p $LAB/apps/_science
    rsync -a --delete $DIR/site/ $LAB/apps/_science/ || { status "FEHLER: rsync"; exit 1; }
    chmod -R a+rX $LAB/apps/_science
  else
    docker compose up -d --build --remove-orphans || { status "FEHLER: docker compose up"; exit 1; }
  fi
  status "OK"
fi
EOS
chmod 755 /usr/local/bin/science-deploy

cat > /etc/systemd/system/science-deploy.service <<'EOF'
[Unit]
Description=Science-App aus GitHub aktualisieren
After=docker.service network-online.target
[Service]
Type=oneshot
ExecStart=/usr/local/bin/science-deploy
EOF
cat > /etc/systemd/system/science-deploy.timer <<'EOF'
[Unit]
Description=Science-App alle 2 Minuten auf neue Commits prüfen
[Timer]
OnBootSec=1min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now science-deploy.timer

# Caddy: neuen Block ANHÄNGEN (>> erhält die Datei, die als Einzeldatei in den Container gemountet ist)
if ! grep -q "^$DOMAIN {" $LAB/Caddyfile; then
  if [ "$MODE" = static ]; then
    printf '\n%s {\n\tencode zstd gzip\n\troot * /srv/apps/_science\n\tfile_server\n\theader -Server\n}\n' "$DOMAIN" >> $LAB/Caddyfile
  else
    printf '\n%s {\n\tencode zstd gzip\n\treverse_proxy science:8000\n\theader -Server\n}\n' "$DOMAIN" >> $LAB/Caddyfile
  fi
fi
$DC exec -T caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
$DC exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

/usr/local/bin/science-deploy --force || true
echo; cat $LAB/apps/_science-status.txt 2>/dev/null || echo "Noch kein Status. Bei privatem Repo erst den Deploy-Schlüssel in GitHub eintragen."
echo "Fertig. Status: https://apps.lab.reallabore.berlin/_science-status.txt"
