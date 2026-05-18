#!/bin/sh
set -e

# Railway mounts the volume at $DATA_DIR owned by root, so the nextjs user
# can't write to it until we fix ownership at boot.
if [ -d "$DATA_DIR" ]; then
  chown -R nextjs:nodejs "$DATA_DIR"
else
  mkdir -p "$DATA_DIR"
  chown -R nextjs:nodejs "$DATA_DIR"
fi

exec su-exec nextjs:nodejs "$@"
