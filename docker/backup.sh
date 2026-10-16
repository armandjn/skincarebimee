#!/bin/sh
# Nightly SQLite backup for Skincare Bimee.
# Takes a consistent snapshot inside the api container (VACUUM INTO), copies it to the host,
# compresses it and keeps the last 14 days.
set -eu

BACKUP_DIR=/home/skincarebimee/backups
STAMP=$(date +%Y%m%d-%H%M%S)
SNAP=/data/snapshot-$STAMP.db

mkdir -p "$BACKUP_DIR"

docker exec skincarebimee-api node --disable-warning=ExperimentalWarning -e "
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/data/bimee.db');
db.exec(\"VACUUM INTO '$SNAP'\");
db.close();
"

docker cp "skincarebimee-api:$SNAP" "$BACKUP_DIR/bimee-$STAMP.db"
docker exec skincarebimee-api rm -f "$SNAP"
gzip -f "$BACKUP_DIR/bimee-$STAMP.db"

# retention: 14 days
find "$BACKUP_DIR" -name 'bimee-*.db.gz' -mtime +14 -delete

echo "$(date -Is) backup ok: bimee-$STAMP.db.gz"
