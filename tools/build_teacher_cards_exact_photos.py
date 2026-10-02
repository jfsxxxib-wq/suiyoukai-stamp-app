from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "output" / "images" / "suiyoukai_teacher_flower_cards_layout_source.png"
SIGN_SOURCE = ROOT / "output" / "pdf" / "suiyoukai_app_guide_source.jpg"
IMAGE_OUT = ROOT / "output" / "images" / "suiyoukai_teacher_flower_cards_exact_photos.png"
PDF_OUT = ROOT / "output" / "pdf" / "suiyoukai_teacher_flower_cards_exact_photos_A4_print.pdf"


# Coordinates are the inner photo areas in the approved 904 x 1280 layout.
# Each source is the exact file currently selected by the app's CSS.
PORTRAITS = [
    ("小池 芳弘 七段", ROOT / "assets" / "teacher-koike.jpg", (35, 377, 218, 606), (0.50, 0.48)),
    ("山城 宏 九段", ROOT / "assets" / "teacher-yamashiro.jpg", (251, 377, 434, 606), (0.50, 0.50)),
    ("松本 武久 八段", ROOT / "assets" / "teacher-matsumoto-suit-20260706-v3.png", (467, 377, 650, 606), (0.50, 0.50)),
    ("結城 聡 九段", ROOT / "assets" / "teacher-yuki.jpg", (682, 377, 872, 606), (0.50, 0.48)),
    ("常石 隆志 六段", ROOT / "assets" / "teacher-tsuneishi-20260713-photo-2.jpg", (126, 831, 325, 1063), (0.50, 0.50)),
    ("徐 文燕 三段", ROOT / "assets" / "teacher-jo-bunen-20260719.jpg", (356, 831, 551, 1063), (0.50, 0.50)),
    ("大西 竜平 七段", ROOT / "assets" / "teacher-onishi-ryohei-20260719.jpg", (581, 831, 778, 1063), (0.50, 0.50)),
]


def rounded_mask(size: tuple[int, int], radius: int = 8) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_exact_portrait(
    poster: Image.Image,
    source_path: Path,
    box: tuple[int, int, int, int],
    centering: tuple[float, float],
) -> None:
    x1, y1, x2, y2 = box
    size = (x2 - x1, y2 - y1)
    with Image.open(source_path) as source:
        portrait = ImageOps.fit(
            source.convert("RGB"),
            size,
            method=Image.Resampling.LANCZOS,
            centering=centering,
        )
    poster.paste(portrait, (x1, y1), rounded_mask(size))


def signature_layer() -> Image.Image:
    with Image.open(SIGN_SOURCE) as source:
        # The original handwritten signature and feather from the lower-left.
        crop = source.convert("RGB").crop((42, 1232, 342, 1278))
    crop = crop.resize((235, 36), Image.Resampling.LANCZOS)

    # Preserve the original signature as a photographic crop. Feather only
    # the outer edge so the cream paper blends into the poster naturally.
    alpha = Image.new("L", crop.size, 255)
    edge = 7
    draw = ImageDraw.Draw(alpha)
    for i in range(edge):
        opacity = round(255 * (i + 1) / edge)
        draw.rectangle((i, i, crop.width - 1 - i, crop.height - 1 - i), outline=opacity)
    rgba = crop.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def mm(value: float) -> float:
    return value * 72 / 25.4


def build() -> None:
    IMAGE_OUT.parent.mkdir(parents=True, exist_ok=True)
    PDF_OUT.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(TARGET) as target:
        poster = target.convert("RGB")

    for _, source_path, box, centering in PORTRAITS:
        paste_exact_portrait(poster, source_path, box, centering)

    signature = signature_layer()
    poster.paste(signature, (48, 1237), signature)
    poster.save(IMAGE_OUT, format="PNG", dpi=(300, 300), optimize=True)

    # Make a 300 dpi print master without changing the approved composition.
    target_width = round(194 / 25.4 * 300)
    target_height = round(target_width * poster.height / poster.width)
    master = poster.resize((target_width, target_height), Image.Resampling.LANCZOS)
    master_path = IMAGE_OUT.with_name("suiyoukai_teacher_flower_cards_exact_photos_300dpi.jpg")
    master.save(master_path, "JPEG", quality=96, subsampling=0, dpi=(300, 300), optimize=True)

    page_width, page_height = A4
    image_width = mm(194)
    image_height = image_width * target_height / target_width
    image_x = (page_width - image_width) / 2
    image_y = (page_height - image_height) / 2

    pdf = canvas.Canvas(str(PDF_OUT), pagesize=A4, pageCompression=1)
    pdf.setTitle("水曜会 先生の花カード一覧 元写真版 A4印刷用")
    pdf.setAuthor("Apollon Team")
    pdf.drawImage(
        str(master_path), image_x, image_y,
        width=image_width, height=image_height,
        preserveAspectRatio=True, anchor="c", mask="auto",
    )
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    build()
