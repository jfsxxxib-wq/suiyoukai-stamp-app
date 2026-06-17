from PIL import Image, ImageDraw, ImageFont, ImageFilter
from collections import deque
from pathlib import Path
import math
base = Path(r'C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\docs\cat-fairies-round2-2026-06-18')
src = base / 'hagi-cat-fairy-original.png'
img = Image.open(src).convert('RGBA')
w,h = img.size
pix = img.load()
# sample warm off-white background from the four corners
samples=[]
for x,y in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    r,g,b,a = pix[x,y]
    samples.append((r,g,b))
bg = tuple(round(sum(c[i] for c in samples)/len(samples)) for i in range(3))

def dist(rgb):
    return math.sqrt(sum((rgb[i]-bg[i])**2 for i in range(3)))
# Flood-fill only background connected to the outer edge so pale wings/clothes are protected.
seen = bytearray(w*h)
q = deque()
edge = []
for x in range(w):
    edge.append((x,0)); edge.append((x,h-1))
for y in range(h):
    edge.append((0,y)); edge.append((w-1,y))
for x,y in edge:
    r,g,b,a = pix[x,y]
    if dist((r,g,b)) < 42:
        idx=y*w+x
        if not seen[idx]:
            seen[idx]=1; q.append((x,y))
while q:
    x,y=q.popleft()
    for nx,ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
        if nx<0 or ny<0 or nx>=w or ny>=h: continue
        idx=ny*w+nx
        if seen[idx]: continue
        r,g,b,a=pix[nx,ny]
        if dist((r,g,b)) < 48:
            seen[idx]=1; q.append((nx,ny))
mask = Image.new('L',(w,h),0)
mp=mask.load()
for y in range(h):
    row=y*w
    for x in range(w):
        if seen[row+x]: mp[x,y]=255
# soften just the cut edge
mask = mask.filter(ImageFilter.GaussianBlur(0.6))
out = img.copy()
op=out.load(); m=mask.load()
for y in range(h):
    for x in range(w):
        alpha = 255 - m[x,y]
        if alpha < 8: alpha = 0
        r,g,b,a=op[x,y]
        op[x,y]=(r,g,b,min(a,alpha))
# crop to content and pad square
alpha = out.getchannel('A')
bbox = alpha.getbbox()
if bbox:
    out = out.crop(bbox)
size=max(out.size)
pad=int(size*0.14)
canvas=Image.new('RGBA',(size+pad*2,size+pad*2),(255,255,255,0))
canvas.alpha_composite(out,((canvas.width-out.width)//2,(canvas.height-out.height)//2))
trans = base / 'hagi-cat-fairy-transparent-candidate.png'
canvas.save(trans)
# make checker preview and named preview
checker_size=32
preview_bg=Image.new('RGBA',canvas.size,(255,255,255,255))
d=ImageDraw.Draw(preview_bg)
for yy in range(0,canvas.height,checker_size):
    for xx in range(0,canvas.width,checker_size):
        col=(235,235,235,255) if ((xx//checker_size+yy//checker_size)%2)==0 else (255,255,255,255)
        d.rectangle([xx,yy,xx+checker_size-1,yy+checker_size-1],fill=col)
preview_bg.alpha_composite(canvas)
preview_bg.save(base/'hagi-cat-fairy-transparent-checker-preview.png')
# comparison sheet
thumb_o = img.copy(); thumb_o.thumbnail((520,520), Image.LANCZOS)
thumb_t = preview_bg.copy(); thumb_t.thumbnail((520,520), Image.LANCZOS)
sheet=Image.new('RGB',(1120,650),(252,248,239))
sheet.paste(thumb_o.convert('RGB'),(40+(520-thumb_o.width)//2,70+(520-thumb_o.height)//2))
sheet.paste(thumb_t.convert('RGB'),(560+(520-thumb_t.width)//2,70+(520-thumb_t.height)//2))
d=ImageDraw.Draw(sheet)
d.text((40,25),'萩の猫妖精 元画像',fill=(80,70,55))
d.text((560,25),'透明背景 候補',fill=(80,70,55))
sheet.save(base/'hagi-cat-fairy-background-check-2026-06-18.png')
print(trans)
print(base/'hagi-cat-fairy-background-check-2026-06-18.png')
