#!/usr/bin/env python3
"""Contrast-stretched zoom with a 5 px grid beside its edge map: python3 -I scripts/panel-zoom.py <img> x0 y0 x1 y1 scale out.png"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageOps
# crop.py img x0 y0 x1 y1 scale out  -> contrast-stretched zoom with 5px grid + edge map side by side
f,x0,y0,x1,y1,s,out=sys.argv[1],*map(int,sys.argv[2:7]),sys.argv[7]
im=Image.open(f).convert('L').crop((x0,y0,x1,y1))
im=ImageOps.autocontrast(im,cutoff=1)
ed=ImageOps.autocontrast(im.filter(ImageFilter.FIND_EDGES),cutoff=1)
W,H=(x1-x0)*s,(y1-y0)*s
a=im.resize((W,H),Image.NEAREST).convert('RGB'); b=ed.resize((W,H),Image.NEAREST).convert('RGB')
for c,ox in ((a,x0),(b,x0)):
  d=ImageDraw.Draw(c)
  for x in range(x0 - x0%5 + 5, x1, 5):
    d.line([((x-x0)*s,0),((x-x0)*s,H)],fill=(255,0,0) if x%25==0 else (110,0,0))
    if x%25==0: d.text(((x-x0)*s+2,2),str(x),fill=(255,255,0))
  for y in range(y0 - y0%5 + 5, y1, 5):
    d.line([(0,(y-y0)*s),(W,(y-y0)*s)],fill=(255,0,0) if y%25==0 else (110,0,0))
    if y%25==0: d.text((2,(y-y0)*s+2),str(y),fill=(255,255,0))
o=Image.new('RGB',(2*W+8,H),'white'); o.paste(a,(0,0)); o.paste(b,(W+8,0)); o.save(out)
