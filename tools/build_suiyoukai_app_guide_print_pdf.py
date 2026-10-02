from pathlib import Path

from PIL import Image, ImageFilter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
SOURCE_COPY = OUT_DIR / "suiyoukai_app_guide_source.jpg"
SOURCE = SOURCE_COPY
PRINT_MASTER = OUT_DIR / "suiyoukai_app_guide_A4_print_master_300dpi.jpg"
PDF = OUT_DIR / "suiyoukai_app_guide_A4_print.pdf"


def mm(value: float) -> float:
    return value * 72 / 25.4


def build() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE) as image:
        rgb = image.convert("RGB")
        # 10 mm left/right margins on A4 gives a 190 mm-wide image area.
        # At 300 dpi this is 2244 px; retain the source aspect ratio.
        target_width = round(190 / 25.4 * 300)
        target_height = round(target_width * rgb.height / rgb.width)
        master = rgb.resize((target_width, target_height), Image.Resampling.LANCZOS)
        master = master.filter(ImageFilter.UnsharpMask(radius=0.7, percent=35, threshold=3))
        master.save(
            PRINT_MASTER,
            format="JPEG",
            quality=96,
            subsampling=0,
            dpi=(300, 300),
            optimize=True,
        )

    page_width, page_height = A4
    image_width = mm(190)
    image_height = image_width * target_height / target_width
    image_x = (page_width - image_width) / 2
    image_y = (page_height - image_height) / 2

    pdf = canvas.Canvas(str(PDF), pagesize=A4, pageCompression=1)
    pdf.setTitle("水曜会アプリ紹介ポスター A4印刷用")
    pdf.setAuthor("Apollon Team")
    pdf.drawImage(
        str(PRINT_MASTER),
        image_x,
        image_y,
        width=image_width,
        height=image_height,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    build()
