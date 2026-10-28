#!/bin/sh
set -e
out=${1:-osm-tiles}
mkdir -p "$out"
S=40.7930; N=40.8390; W=-73.5300; E=-73.4720
for j in 0 1 2 3 4; do
  for i in 0 1 2 3 4; do
    bbox=$(awk -v i=$i -v j=$j -v S=$S -v N=$N -v W=$W -v E=$E 'BEGIN{printf "%.5f,%.5f,%.5f,%.5f", W+(E-W)*i/5, S+(N-S)*j/5, W+(E-W)*(i+1)/5, S+(N-S)*(j+1)/5}')
    curl -sS -m 90 -A "syosset-desmos-map/1.0" -o "$out/t$j$i.xml" "https://api.openstreetmap.org/api/0.6/map?bbox=$bbox"
    sleep 1
  done
done
