#!/bin/bash
# Fast 960x540 draft: 4 SEPARATE single-tab render processes by frame range (JPEG), concat, mux master audio.
SRC=$1; cd "$(cat /tmp/officeadmin-v5-workpath.txt)"; D=out/v5/draft; mkdir -p $D; rm -f $D/part-*.mp4
N=4020; Q=1005; pids=""
for i in 0 1 2 3; do a=$((i*Q)); b=$(( i==3 ? N-1 : (i+1)*Q-1 ))
 nohup npx remotion render src/v5/index.tsx V5Visuals $D/part-$i.mp4 --frames=$a-$b --scale=0.5 --concurrency=1 --image-format=jpeg --jpeg-quality=88 --muted --codec=h264 --crf=22 --color-space=bt709 --bundle-cache=false --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' > $D/log-$i.txt 2>&1 & pids="$pids $!"; done
for p in $pids; do wait $p || echo "PART FAILED $p"; done
for i in 0 1 2 3; do echo "file '$PWD/$D/part-$i.mp4'"; done > $D/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $D/concat.txt -i public/audio/v5/master.m4a -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 22 -preset veryfast -pix_fmt yuv420p -vf "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv" -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -t 134 -movflags +faststart $D/OfficeAdmin_AIVA_V5_draft.mp4 && ffprobe -v error -show_entries stream=width,height,nb_frames,color_primaries:format=duration -of compact $D/OfficeAdmin_AIVA_V5_draft.mp4 && curl -sSf -m 600 -T $D/OfficeAdmin_AIVA_V5_draft.mp4 "http://$SRC/draft/OfficeAdmin_AIVA_V5_draft.mp4" -o /dev/null && echo DRAFT UPLOADED
