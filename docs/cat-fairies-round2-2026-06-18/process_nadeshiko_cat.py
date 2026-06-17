from PIL import Image, ImageDraw, ImageFilter
from collections import deque
from pathlib import Path
import math
base = Path(r'C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\docs\cat-fairies-round2-2026-06-18')
name = 'nadeshiko-black-cat-fairy'
src = base / f'{name}-original.png'
img = Image.open(src).convert('RGBA')
w,h = img.size
pix = img.load()
samples=[]
for x,y in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    samples.append(pix[x,y][:3])
bg = tuple(round(sum(c[i] for c in samples)/len(samples)) for i in range(3))
def dist(rgb): return math.sqrt(sum((rgb[i]-bg[i])**2 for i in range(3)))
seen=bytearray(w*h); q=deque()
for x in range(w):
    for y in (0,h-1):
        if dist(pix[x,y][:3])<38:
            idx=y*w+x
            if not seen[idx]: seen[idx]=1; q.append((x,y))
for y in range(h):
    for x in (0,w-1):
        if dist(pix[x,y][:3])<38:
            idx=y*w+x
            if not seen[idx]: seen[idx]=1; q.append((x,y))
while q:
    x,y=q.popleft()
    for nx,ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
        if nx<0 or ny<0 or nx>=w or ny>=h: continue
        idx=ny*w+nx
        if seen[idx]: continue
        if dist(pix[nx,ny][:3])<45:
            seen[idx]=1; q.append((nx,ny))
mask=Image.new('L',(w,h),0); mp=mask.load()
for y in range(h):
    row=y*w
    for x in range(w):
        if seen[row+x]: mp[x,y]=255
mask=mask.filter(ImageFilter.GaussianBlur(0.55))
out=img.copy(); op=out.load(); m=mask.load()
for y in range(h):
    for x in range(w):
        alpha=255-m[x,y]
        if alpha<8: alpha=0
        r,g,b,a=op[x,y]
        op[x,y]=(r,g,b,min(a,alpha))
bbox=out.getchannel('A').getbbox()
if bbox: out=out.crop(bbox)
size=max(out.size); pad=int(size*0.14)
canvas=Image.new('RGBA',(size+pad*2,size+pad*2),(255,255,255,0))
canvas.alpha_composite(out,((canvas.width-out.width)//2,(canvas.height-out.height)//2))
trans=base/f'{name}-transparent-candidate.png'; canvas.save(trans)
checker=Image.new('RGBA',canvas.size,(255,255,255,255)); d=ImageDraw.Draw(checker); s=32
for yy in range(0,canvas.height,s):
    for xx in range(0,canvas.width,s):
        d.rectangle([xx,yy,xx+s-1,yy+s-1],fill=(235,235,235,255) if ((xx//s+yy//s)%2)==0 else (255,255,255,255))
checker.alpha_composite(canvas)
thumb_o=img.copy(); thumb_o.thumbnail((520,520), Image.LANCZOS)
thumb_t=checker.copy(); thumb_t.thumbnail((520,520), Image.LANCZOS)
sheet=Image.new('RGB',(1120,650),(252,248,239))
sheet.paste(thumb_o.convert('RGB'),(40+(520-thumb_o.width)//2,70+(520-thumb_o.height)//2))
sheet.paste(thumb_t.convert('RGB'),(560+(520-thumb_t.width)//2,70+(520-thumb_t.height)//2))
d=ImageDraw.Draw(sheet); d.text((40,25),'Nadeshiko black cat fairy original',fill=(80,70,55)); d.text((560,25),'Transparent candidate',fill=(80,70,55))
sheet.save(base/f'{name}-background-check-2026-06-18.png')
print(trans)
print(base/f'{name}-background-check-2026-06-18.png')
