from pathlib import Path

from PIL import Image, ImageFilter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\akane\.codex\codex-remote-attachments\019f7ab1-4506-7573-9d18-2f4fc78b52a4"
    r"\751FB638-BBAC-4ABE-B344-F21CCD586B4F\1-貼り付けた画像-1.jpg"
)
OUT_DIR = ROOT / "output" / "pdf"
SOURCE_COPY = OUT_DIR / "suiyoukai_teacher_flower_cards_source.jpg"
PRINT_MASTER = OUT_DIR / "suiyoukai_teacher_flower_cards_A4_print_master_300dpi.jpg"
PDF = OUT_DIR / "suiyoukai_teacher_flower_cards_A4_print.pdf"


def mm(value: float) -> float:
    return value * 72 / 25.4


def build() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_COPY.write_bytes(SOURCE.read_bytes())

    with Image.open(SOURCE) as image:
        rgb = image.convert("RGB")
        # Use an 8 mm safety margin on both sides. The source has a wider
        # aspect ratio than A4, so centering by width also leaves generous
        # top and bottom margins without cropping any content.
        target_width = round(194 / 25.4 * 300)
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
    image_width = mm(194)
    image_height = image_width * target_height / target_width
    image_x = (page_width - image_width) / 2
    image_y = (page_height - image_height) / 2

    pdf = canvas.Canvas(str(PDF), pagesize=A4, pageCompression=1)
    pdf.setTitle("水曜会 先生の花カード一覧 A4印刷用")
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
