from collections import deque
from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFilter, ImageFont


BASE = Path(__file__).parent
ITEMS = [
    ("french-bulldog-go-board-a", "フレンチブルドッグ A　碁盤を抱えるドジっ子", 38),
    ("french-bulldog-go-board-b", "フレンチブルドッグ B　碁石を追うドジっ子", 38),
    ("owl-scholar-a", "フクロウ A　本と指示棒の博識な先生", 38),
    ("owl-scholar-b", "フクロウ B　星を学ぶ白い賢者", 28),
    ("sea-otter-go-stone-a", "ラッコ A　大きな黒碁石", 38),
    ("sea-otter-go-stone-b", "ラッコ B　大きな白碁石", 34),
    ("curious-hedgehog-a", "ハリネズミ A　虫眼鏡の知りたがり", 38),
    ("curious-hedgehog-b", "ハリネズミ B　地図とランタンの探検家", 38),
]


def font(size):
    for path in (Path(r"C:\Windows\Fonts\YuGothM.ttc"), Path(r"C:\Windows\Fonts\meiryo.ttc")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def remove_edge_background(image, threshold):
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    points = [
        (0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1),
        (width // 2, 0), (width // 2, height - 1), (0, height // 2),
        (width - 1, height // 2),
    ]
    samples = [pixels[x, y][:3] for x, y in points]
    background = tuple(round(sum(sample[i] for sample in samples) / len(samples)) for i in range(3))

    def distance(rgb):
        return math.sqrt(sum((rgb[i] - background[i]) ** 2 for i in range(3)))

    seen = bytearray(width * height)
    queue = deque()
    edge_points = []
    for x in range(width):
        edge_points.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        edge_points.extend(((0, y), (width - 1, y)))

    for x, y in edge_points:
        if distance(pixels[x, y][:3]) < threshold:
            index = y * width + x
            if not seen[index]:
                seen[index] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            index = ny * width + nx
            if seen[index]:
                continue
            if distance(pixels[nx, ny][:3]) < threshold + 6:
                seen[index] = 1
                queue.append((nx, ny))

    mask = Image.new("L", (width, height), 0)
    mask_pixels = mask.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if seen[row + x]:
                mask_pixels[x, y] = 255
    mask = mask.filter(ImageFilter.GaussianBlur(0.55))

    output = image.copy()
    output_pixels = output.load()
    mask_pixels = mask.load()
    for y in range(height):
        for x in range(width):
            alpha = 255 - mask_pixels[x, y]
            if alpha < 8:
                alpha = 0
            red, green, blue, original_alpha = output_pixels[x, y]
            output_pixels[x, y] = (red, green, blue, min(original_alpha, alpha))

    bounds = output.getchannel("A").getbbox()
    if bounds:
        output = output.crop(bounds)
    side = max(output.size)
    padding = round(side * 0.10)
    canvas = Image.new("RGBA", (side + padding * 2, side + padding * 2), (255, 255, 255, 0))
    canvas.alpha_composite(output, ((canvas.width - output.width) // 2, (canvas.height - output.height) // 2))
    canvas.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    return canvas


def checkerboard(size, cell=24):
    board = Image.new("RGBA", size, (255, 255, 255, 255))
    draw = ImageDraw.Draw(board)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            color = (232, 232, 232, 255) if (x // cell + y // cell) % 2 == 0 else (255, 255, 255, 255)
            draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=color)
    return board


prepared = []
for stem, label, threshold in ITEMS:
    original = Image.open(BASE / f"{stem}-original.png").convert("RGBA")
    stamp = remove_edge_background(original, threshold)
    stamp.save(BASE / f"{stem}-transparent.png")
    prepared.append((label, stamp))

sheet = Image.new("RGB", (1960, 1260), (251, 247, 238))
draw = ImageDraw.Draw(sheet)
draw.text((55, 26), "特別な仲間スタンプ　完成品確認一覧", fill=(67, 82, 64), font=font(34))

for index, (label, stamp) in enumerate(prepared):
    column = index % 4
    row = index // 4
    left = 50 + column * 480
    top = 100 + row * 570
    tile = checkerboard((430, 430))
    preview = stamp.copy()
    preview.thumbnail((405, 405), Image.Resampling.LANCZOS)
    tile.alpha_composite(preview, ((430 - preview.width) // 2, (430 - preview.height) // 2))
    sheet.paste(tile.convert("RGB"), (left, top))
    label_font = font(18)
    box = draw.textbbox((0, 0), label, font=label_font)
    text_width = box[2] - box[0]
    draw.text((left + (430 - text_width) // 2, top + 450), label, fill=(72, 65, 55), font=label_font)

sheet_path = BASE / "special-character-stamps-preview-named-2026-06-18.png"
sheet.save(sheet_path)
print(sheet_path)
