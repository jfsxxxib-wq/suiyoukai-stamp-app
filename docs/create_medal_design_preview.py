from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "docs" / "medal-design-candidates-2026-06-19.png"

MEDALS = [
    ("参加10回", "コスモス満開勲章", "medal-stage-02.png"),
    ("先生の輪 一巡", "五つ星の輪", "teacher-circle-medal-once.png"),
    ("先生の輪 二巡", "五人の輪", "teacher-circle-medal-twice.png"),
    ("先生の輪 三巡", "知恵の書", "medal-stage-03.png"),
    ("先生の輪 五巡", "五つの花の輪", "medal-stage-04.png"),
]


def font(size):
    for path in (Path(r"C:\Windows\Fonts\YuGothM.ttc"), Path(r"C:\Windows\Fonts\meiryo.ttc")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def centered(draw, text, y, selected_font, fill, width):
    box = draw.textbbox((0, 0), text, font=selected_font)
    draw.text(((width - (box[2] - box[0])) // 2, y), text, font=selected_font, fill=fill)


width, height = 1900, 1260
sheet = Image.new("RGB", (width, height), (248, 244, 234))
draw = ImageDraw.Draw(sheet)
draw.text((55, 32), "勲章デザイン　本番割り当て候補", fill=(58, 81, 64), font=font(40))
draw.text((58, 88), "参加10回と先生の輪の節目を、既存の水彩勲章で整理", fill=(99, 86, 67), font=font(21))

card_width = 350
card_height = 1010
gap = 18
start_x = 40
top = 170

for index, (milestone, name, filename) in enumerate(MEDALS):
    left = start_x + index * (card_width + gap)
    draw.rounded_rectangle(
        (left, top, left + card_width, top + card_height),
        radius=18,
        fill=(255, 253, 248),
        outline=(211, 183, 115),
        width=3,
    )
    image = Image.open(ASSETS / filename).convert("RGBA")
    image.thumbnail((310, 700), Image.Resampling.LANCZOS)
    image_x = left + (card_width - image.width) // 2
    image_y = top + 70 + (700 - image.height) // 2
    sheet.paste(image, (image_x, image_y), image)

    box = draw.textbbox((0, 0), milestone, font=font(23))
    draw.text((left + (card_width - (box[2] - box[0])) // 2, top + 795), milestone, fill=(58, 81, 64), font=font(23))
    name_box = draw.textbbox((0, 0), name, font=font(19))
    draw.text((left + (card_width - (name_box[2] - name_box[0])) // 2, top + 845), name, fill=(91, 73, 54), font=font(19))
    draw.text((left + 30, top + 915), filename, fill=(128, 116, 96), font=font(13))

sheet.save(OUTPUT)
print(OUTPUT)
