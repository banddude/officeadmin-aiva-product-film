#!/bin/bash
# Laptop: sync V5 sources, run one named step, upload outputs back to Oracle. Usage: laptop-run.sh <host:port/token> <step>
set -e
SRC=$1; STEP=$2
cd "$(cat /tmp/officeadmin-v5-workpath.txt)"
curl -sSf -m 300 -o v5src.tgz "http://$SRC/v5src.tgz" && tar xzf v5src.tgz
up(){ for f in "$@"; do curl -sSf -m 600 -T "$f" "http://$SRC/$f" -o /dev/null; done; }
case $STEP in
 narration) .tts/venv/bin/python production/v5/narration.py || echo NARRATION-NONZERO; up production/v5/narration.json qa/v5/pronunciation.json public/audio/v5/vo-*.wav public/audio/v5/narration.wav public/audio/v5/aiva-voice.wav;;
 audio) .tts/venv/bin/python production/v5/score.py && .tts/venv/bin/python production/v5/mix.py; up public/audio/v5/master.m4a qa/v5/mix-stats.json;;
 render-landscape|render-portrait) K=${STEP#render-}; node production/v5/render.mjs $K; F=out/v5/$( [ $K = portrait ] && echo OfficeAdmin_AIVA_V5_914PM_Vertical.mp4 || echo OfficeAdmin_AIVA_V5_914PM_Film.mp4 ); [ -f "$F" ] && up "$F" qa/v5/delivery-$K.json qa/v5/render-state-$K.json;;
 *) echo "unknown step"; exit 2;;
esac
echo "STEP DONE $STEP"; df -h / | tail -1
