#!/usr/bin/env python3
"""Strongest brightness step per row or column: python3 -I scripts/panel-edge.py <img> row|col <from> <to> <search-from> <search-to>"""
import sys
from PIL import Image, ImageFilter
# edge.py img axis(row|col) fixed_from fixed_to search_from search_to  -> per line, position of strongest gradient
f,ax=sys.argv[1],sys.argv[2]; a0,a1,s0,s1=map(int,sys.argv[3:7])
im=Image.open(f).convert('L').filter(ImageFilter.GaussianBlur(0.8)); g=im.getpixel
for a in range(a0,a1+1):
    best=None
    for s in range(s0,s1):
        p=(s,a) if ax=='row' else (a,s); q=(s+1,a) if ax=='row' else (a,s+1)
        d=g(q)-g(p)
        if best is None or abs(d)>abs(best[1]): best=(s+0.5,d)
    print(f'{ax} {a}: edge at {best[0]} (step {best[1]})')
