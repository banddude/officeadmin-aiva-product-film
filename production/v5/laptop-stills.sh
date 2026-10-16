#!/bin/bash
# Laptop: sync V5 sources from Oracle (tailnet), render stills, upload PNGs back. Usage: laptop-stills.sh <host:port/token> shot...
set -e
SRC=$1; shift
cd "$(cat /tmp/officeadmin-v5-workpath.txt)"
curl -sSf -m 120 -o v5src.tgz "http://$SRC/v5src.tgz" && tar xzf v5src.tgz
LOG=out/v5/stills.log; mkdir -p out/v5
node production/v5/stills.mjs "$@" > $LOG 2>&1 || { tail -40 $LOG; exit 1; }
for s in "$@"; do f=out/v5/stills/${s/:/-}.png; curl -sSf -m 120 -T "$f" "http://$SRC/stills/${s/:/-}.png" -o /dev/null; done
grep STILL $LOG; df -h / | tail -1
