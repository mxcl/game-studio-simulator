#!/bin/bash

# ffmpeg \
#   -f lavfi -t 8 -i color=c=black:s=1200x630 \
#   -loop 1 -i intro.png \
#   -loop 1 -i button.png \
#   -loop 1 -i end.png \
#   -i click.mp3 \
#   -filter_complex "
# [1:v]scale=1200:630:force_original_aspect_ratio=decrease,\
# pad=1200:630:(ow-iw)/2:(oh-ih)/2,setsar=1[intro];

# [2:v]scale=1200:630:force_original_aspect_ratio=decrease,\
# pad=1200:630:(ow-iw)/2:(oh-ih)/2,setsar=1[button];

# [3:v]scale=1200:630:force_original_aspect_ratio=decrease,\
# pad=1200:630:(ow-iw)/2:(oh-ih)/2,setsar=1[end];

# [0:v][intro]overlay=enable='between(t,0,2)'[v1];
# [v1][button]overlay=enable='between(t,2,6)'[v2];
# [v2][end]overlay=enable='between(t,6,8)'[v];

# [4:a]adelay=5900|5900,atrim=0:8[a]
# " \
#   -map "[v]" \
#   -map "[a]" \
#   -t 8 \
#   -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
#   -c:a aac -b:a 192k \
#   gss_ad.mp4


ffmpeg \
-f lavfi -t 8 -i color=c=black:s=1200x630 \
-loop 1 -i intro.png \
-loop 1 -i button.png \
-loop 1 -i end.png \
-loop 1 -i cursor.png \
-i click.mp3 \
-filter_complex "

[1:v]scale=1200:630:force_original_aspect_ratio=decrease,\
pad=1200:630:(ow-iw)/2:(oh-ih)/2,setsar=1[intro];

[2:v]scale=1200:630:force_original_aspect_ratio=decrease,\
pad=1200:630:(ow-iw)/2:(oh-ih)/2,setsar=1[button];

[3:v]scale=1200:630:force_original_aspect_ratio=decrease,\
pad=1200:630:(ow-iw)/2:(oh-ih)/2,setsar=1[end];

[4:v]scale=64:-1[cursor];

[0:v][intro]overlay=enable='between(t,0,2)'[v1];
[v1][button]overlay=enable='between(t,2,6)'[v2];

[v2][cursor]overlay=
enable='between(t,4.5,6)':
x='if(between(t,4.5,5.2), 1300 - ((t-4.5)/0.7)*700, 600)':
y='if(between(t,4.5,5.2), 700 - ((t-4.5)/0.7)*385, 315)'
[v3];

[v3][end]overlay=enable='between(t,6,8)'[v];

[5:a]adelay=5900|5900,atrim=0:8[a]
" \
-map "[v]" \
-map "[a]" \
-t 8 \
-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
-c:a aac -b:a 192k \
gss_ad.mp4
