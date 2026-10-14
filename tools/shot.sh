#!/bin/bash
# usage: tools/shot.sh name page width height  (needs server on :4173)  -> scratchpad/name.png sliced
SC="C:/Users/Mohammad/AppData/Local/Temp/claude/D--Projects-skincarebimee/766aca7c-a5fd-4ebe-a733-4a0483193eac/scratchpad"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --enable-unsafe-swiftshader --virtual-time-budget=6000 --window-size=$3,$4 --screenshot="$SC/$1.png" "http://localhost:4173/$2" >/dev/null 2>&1
H=$5; [ -z "$H" ] && H=1800
n=$(( ($4 + H - 1) / H ))
for ((i=0;i<n;i++)); do ffmpeg -loglevel error -y -i "$SC/$1.png" -vf "crop=$3:min($H\,ih-$((i*H))):0:$((i*H)),scale='min(1000,iw)':-1" "$SC/$1_$i.png"; done
echo "$n slices"
