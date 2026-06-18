from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "docs" / "round1-fairies-preview-named-2026-06-18.png"
ITEMS = [
    ("fairy-companion-iris-v2.png", "菖蒲の妖精"),
    ("fairy-companion-camellia-v2.png", "椿の妖精"),
    ("fairy-companion-sunflower-v2.png", "ひまわりの妖精"),
    ("fairy-companion-hydrangea-v2.png", "紫陽花の妖精"),
    ("fairy-companion-sakura-v2.png", "桜の妖精"),
]


def font(size):
    for path in (Path(r"C:\Windows\Fonts\YuGothM.ttc"), Path(r"C:\Windows\Fonts\meiryo.ttc")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


sheet = Image.new("RGB", (1600, 1160), (251, 247, 238))
draw = ImageDraw.Draw(sheet)
title_font = font(34)
label_font = font(24)
draw.text((55, 30), "1巡目の先生妖精 完成品確認一覧", fill=(67, 82, 64), font=title_font)

positions = [(55, 105), (565, 105), (1075, 105), (310, 625), (820, 625)]
for (file_name, label), (left, top) in zip(ITEMS, positions):
    card = Image.new("RGB", (450, 430), (255, 253, 247))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle((1, 1, 448, 428), radius=18, outline=(220, 184, 103), width=2)
    image = Image.open(ASSETS / file_name).convert("RGBA")
    image.thumbnail((380, 350), Image.Resampling.LANCZOS)
    card.paste(image, ((450 - image.width) // 2, 25 + (350 - image.height) // 2), image)
    box = card_draw.textbbox((0, 0), label, font=label_font)
    text_width = box[2] - box[0]
    card_draw.text(((450 - text_width) // 2, 382), label, fill=(73, 64, 54), font=label_font)
    sheet.paste(card, (left, top))

sheet.save(OUTPUT)
print(OUTPUT)
