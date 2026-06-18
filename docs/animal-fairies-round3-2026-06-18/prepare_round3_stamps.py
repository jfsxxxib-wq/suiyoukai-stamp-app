from collections import deque
from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFilter, ImageFont


BASE = Path(__file__).parent
APP_ASSETS = BASE.parents[1] / "assets"
ITEMS = [
    ("sumire-rabbit-fairy", "fairy-companion-sumire-rabbit.png", "菫のウサギ妖精", 42),
    ("lily-white-fox-fairy", "fairy-companion-lily-white-fox.png", "百合の白キツネ妖精", 30),
    ("kikyo-red-squirrel-fairy", "fairy-companion-kikyo-red-squirrel.png", "桔梗の赤リス妖精", 42),
    ("suisen-red-panda-fairy", "fairy-companion-suisen-red-panda.png", "水仙のレッサーパンダ妖精", 42),
    ("shakuyaku-java-sparrow-fairy", "fairy-companion-shakuyaku-java-sparrow.png", "芍薬の文鳥妖精", 38),
]


def load_font(size):
    candidates = [
        Path(r"C:\Windows\Fonts\YuGothM.ttc"),
        Path(r"C:\Windows\Fonts\meiryo.ttc"),
    ]
    for path in candidates:
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

    grow_threshold = threshold + 6
    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            index = ny * width + nx
            if seen[index]:
                continue
            if distance(pixels[nx, ny][:3]) < grow_threshold:
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
for stem, app_name, label, threshold in ITEMS:
    original = Image.open(BASE / f"{stem}-original.png").convert("RGBA")
    stamp = remove_edge_background(original, threshold)
    stamp_path = BASE / f"{stem}-transparent.png"
    stamp.save(stamp_path)
    stamp.save(APP_ASSETS / app_name)
    prepared.append((label, stamp, stem))

font = load_font(30)
small_font = load_font(20)
sheet = Image.new("RGB", (1600, 1220), (251, 247, 238))
draw = ImageDraw.Draw(sheet)
draw.text((55, 30), "3巡目の動物妖精スタンプ 確認一覧", fill=(67, 82, 64), font=font)

positions = [(55, 100), (565, 100), (1075, 100), (310, 650), (820, 650)]
for (label, stamp, stem), (left, top) in zip(prepared, positions):
    tile = checkerboard((450, 450))
    preview = stamp.copy()
    preview.thumbnail((420, 420), Image.Resampling.LANCZOS)
    tile.alpha_composite(preview, ((450 - preview.width) // 2, (450 - preview.height) // 2))
    sheet.paste(tile.convert("RGB"), (left, top))
    text_box = draw.textbbox((0, 0), label, font=small_font)
    text_width = text_box[2] - text_box[0]
    draw.text((left + (450 - text_width) // 2, top + 465), label, fill=(72, 65, 55), font=small_font)

sheet_path = BASE / "round3-animal-fairies-preview-named-2026-06-18.png"
sheet.save(sheet_path)
print(sheet_path)
for _, _, stem in prepared:
    print(BASE / f"{stem}-transparent.png")
