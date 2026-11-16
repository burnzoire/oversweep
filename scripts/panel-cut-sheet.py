#!/usr/bin/env python3
"""Source crop beside the review overlay for each box: python3 -I scripts/panel-cut-sheet.py <rect.png> <overlay.png> out.png "label:x0,y0,x1,y1" ..."""
import sys
from PIL import Image, ImageDraw
# sheet2.py ref.png overlay.png out "label:x0,y0,x1,y1" ...  (reference px boxes) -> source | overlay
ref,ov,out=sys.argv[1],sys.argv[2],sys.argv[3]
R=Image.open(ref).convert('RGB'); O=Image.open(ov).convert('RGB'); k=O.width/R.width
Z=5; rows=[]
for spec in sys.argv[4:]:
    lab,box=spec.split(':'); x0,y0,x1,y1=map(float,box.split(','))
    w,h=int((x1-x0)*Z),int((y1-y0)*Z)
    a=R.crop((int(x0),int(y0),int(x1),int(y1))).resize((w,h),Image.LANCZOS)
    b=O.crop((int(x0*k),int(y0*k),int(x1*k),int(y1*k))).resize((w,h),Image.LANCZOS)
    r=Image.new('RGB',(2*w+16,h+24),'white'); d=ImageDraw.Draw(r)
    d.text((4,4),lab+': source | drawing (red) over source',fill='black'); r.paste(a,(0,24)); r.paste(b,(w+16,24)); rows.append(r)
cw=max(r.width for r in rows); ch=max(r.height for r in rows)
s=Image.new('RGB',(2*cw+20,((len(rows)+1)//2)*(ch+10)),'white')
for i,r in enumerate(rows): s.paste(r,((i%2)*(cw+20),(i//2)*(ch+10)))
s.save(out); print(s.size)
