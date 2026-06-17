from PIL import Image, ImageDraw
from pathlib import Path
base = Path(r'C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\docs\cat-fairies-round2-2026-06-18')
img = Image.open(base/'peony-white-longhair-cat-fairy-stamp.png').convert('RGB')
img.thumbnail((560,560), Image.LANCZOS)
sheet = Image.new('RGB',(700,680),(252,248,239))
sheet.paste(img,((700-img.width)//2,70+(560-img.height)//2))
d=ImageDraw.Draw(sheet)
d.text((40,30),'Peony white longhair cat fairy stamp: pale background version',fill=(80,70,55))
d.text((40,635),'Transparent version rejected because white fur was damaged.',fill=(120,70,70))
sheet.save(base/'peony-white-longhair-cat-fairy-stamp-check-2026-06-18.png')
print(base/'peony-white-longhair-cat-fairy-stamp.png')
print(base/'peony-white-longhair-cat-fairy-stamp-check-2026-06-18.png')
