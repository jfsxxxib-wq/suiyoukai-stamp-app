from pathlib import Path
from html import escape

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parents[1]
DOCS = ROOT / "docs"

FLOWERS = [
    ("参加スタンプ", [
        ("1巡目　コスモス", "../assets/cosmos-stamp-stage-05-v2.png"),
        ("2巡目　藤", "../assets/fuji-stamp-stage-05-list.png"),
        ("3巡目　金木犀", "../assets/kinmokusei-stamp-stage-05-list.png"),
    ]),
    ("常石先生", [
        ("1巡目　菖蒲", "../assets/iris-stamp-stage-05-list.png"),
        ("2巡目　蓮", "../assets/lotus-stamp-stage-05-list.png"),
        ("3巡目　菫", "../assets/sumire-stamp-stage-05-list.png"),
    ]),
    ("結城先生", [
        ("1巡目　椿", "../assets/camellia-stamp-stage-05-list.png"),
        ("2巡目　牡丹", "../assets/botan-stamp-stage-05-list.png"),
        ("3巡目　百合", "../assets/lily-stamp-stage-05-list.png"),
    ]),
    ("小池先生", [
        ("1巡目　ひまわり", "../assets/sunflower-stamp-stage-05-list.png"),
        ("2巡目　朝顔", "../assets/asagao-stamp-stage-05-list.png"),
        ("3巡目　桔梗", "../assets/kikyo-stamp-stage-05-list.png"),
    ]),
    ("山城先生", [
        ("1巡目　紫陽花", "../assets/hydrangea-stamp-stage-05-list.png"),
        ("2巡目　撫子", "../assets/nadeshiko-stamp-stage-05-list.png"),
        ("3巡目　水仙", "../assets/suisen-stamp-stage-05-list.png"),
    ]),
    ("松本先生", [
        ("1巡目　桜", "../assets/sakura-stamp-stage-05-list.png"),
        ("2巡目　萩", "../assets/hagi-stamp-stage-05-list.png"),
        ("3巡目　芍薬", "../assets/shakuyaku-stamp-stage-05-list.png"),
    ]),
    ("追加先生A", [
        ("1巡目　すずらん", "../assets/suzuran-stamp-stage-05-list.png"),
        ("2巡目　木蓮", "../assets/mokuren-stamp-stage-05-list.png"),
        ("3巡目　ひなげし", "../assets/hinageshi-stamp-stage-05-list.png"),
    ]),
    ("追加先生B", [
        ("1巡目　白詰草", "../assets/shirotsumekusa-stamp-stage-05-list.png"),
        ("2巡目　蘭", "../assets/ran-stamp-stage-05-list.png"),
        ("3巡目　花水木", "../assets/hanamizuki-stamp-stage-05-list.png"),
    ]),
    ("追加先生C", [
        ("1巡目　山吹", "../assets/yamabuki-stamp-stage-05-list.png"),
        ("2巡目　りんどう", "../assets/rindou-stamp-stage-05-list.png"),
        ("3巡目　月見草", "../assets/tsukimisou-stamp-stage-05-list.png"),
    ]),
    ("追加先生D", [
        ("1巡目　金魚草", "../assets/kingyosou-stamp-stage-05-list.png"),
        ("2巡目　藤袴", "../assets/fujibakama-stamp-stage-05-list.png"),
        ("3巡目　芙蓉", "../assets/fuyou-stamp-stage-05-list.png"),
    ]),
    ("追加先生E", [
        ("1巡目　露草", "../assets/tsuyukusa-stamp-stage-05-list.png"),
        ("2巡目　金盞花", "../assets/kinsenka-stamp-stage-05-list.png"),
        ("3巡目　南天", "../assets/nanten-stamp-stage-05-list.png"),
    ]),
]

FAIRIES = [
    ("参加スタンプ", [
        ("1巡目　コスモスの妖精", "../assets/fairy-apollon-flower-style.png"),
        ("2巡目　藤のライオン妖精", "participation-fairies-round2-3-2026-06-18/fuji-golden-lion-fairy-transparent.png"),
        ("3巡目　金木犀の象妖精", "participation-fairies-round2-3-2026-06-18/kinmokusei-white-elephant-fairy-transparent.png"),
    ]),
    ("常石先生", [
        ("1巡目　菖蒲の妖精", "../assets/fairy-companion-iris-v2.png"),
        ("2巡目　蓮の三毛猫妖精", "cat-fairies-round2-2026-06-18/lotus-calico-cat-fairy-transparent-candidate.png"),
        ("3巡目　菫のウサギ妖精", "animal-fairies-round3-2026-06-18/sumire-rabbit-fairy-transparent.png"),
    ]),
    ("結城先生", [
        ("1巡目　椿の妖精", "../assets/fairy-companion-camellia-v2.png"),
        ("2巡目　牡丹の白猫妖精", "cat-fairies-round2-2026-06-18/peony-white-longhair-cat-fairy-stamp.png"),
        ("3巡目　百合の白キツネ妖精", "animal-fairies-round3-2026-06-18/lily-white-fox-fairy-transparent.png"),
    ]),
    ("小池先生", [
        ("1巡目　ひまわりの妖精", "../assets/fairy-companion-sunflower-v2.png"),
        ("2巡目　朝顔のシャム猫妖精", "cat-fairies-round2-2026-06-18/morning-glory-siamese-cat-fairy-transparent-candidate.png"),
        ("3巡目　桔梗の赤リス妖精", "animal-fairies-round3-2026-06-18/kikyo-red-squirrel-fairy-transparent.png"),
    ]),
    ("山城先生", [
        ("1巡目　紫陽花の妖精", "../assets/fairy-companion-hydrangea-v2.png"),
        ("2巡目　撫子の黒猫妖精", "cat-fairies-round2-2026-06-18/nadeshiko-black-cat-fairy-transparent-candidate.png"),
        ("3巡目　水仙のレッサーパンダ妖精", "animal-fairies-round3-2026-06-18/suisen-red-panda-fairy-transparent.png"),
    ]),
    ("松本先生", [
        ("1巡目　桜の妖精", "../assets/fairy-companion-sakura-v2.png"),
        ("2巡目　萩のサバトラ猫妖精", "cat-fairies-round2-2026-06-18/hagi-cat-fairy-transparent-candidate.png"),
        ("3巡目　芍薬の文鳥妖精", "animal-fairies-round3-2026-06-18/shakuyaku-java-sparrow-fairy-transparent.png"),
    ]),
    ("追加先生A", [
        ("1巡目　すずらんのネズミ妖精", "../assets/fairy-companion-suzuran-mouse.png"),
        ("2巡目　木蓮の白猫妖精", "../assets/fairy-companion-mokuren-white-cat.png"),
        ("3巡目　ひなげしのリス妖精", "../assets/fairy-companion-hinageshi-squirrel.png"),
    ]),
    ("追加先生B", [
        ("1巡目　白詰草のトイプードル妖精", "../assets/fairy-companion-shirotsumekusa-toy-poodle.png"),
        ("2巡目　蘭の亀妖精", "../assets/fairy-companion-ran-turtle.png"),
        ("3巡目　花水木の鶴妖精", "../assets/fairy-companion-hanamizuki-crane.png"),
    ]),
    ("追加先生C", [
        ("1巡目　山吹の柴犬妖精", "../assets/fairy-companion-yamabuki-shiba.png"),
        ("2巡目　りんどうの青い鳥妖精", "../assets/fairy-companion-rindou-bluebird.png"),
        ("3巡目　月見草のヤマネ妖精", "../assets/fairy-companion-tsukimisou-dormouse.png"),
    ]),
    ("追加先生D", [
        ("1巡目　金魚草のうさぎ妖精", "../assets/fairy-companion-kingyosou-rabbit.png"),
        ("2巡目　藤袴のハリネズミ妖精", "../assets/fairy-companion-fujibakama-hedgehog.png"),
        ("3巡目　芙蓉の白山羊妖精", "../assets/fairy-companion-fuyou-white-goat.png"),
    ]),
    ("追加先生E", [
        ("1巡目　露草のカワウソ妖精", "../assets/fairy-companion-tsuyukusa-otter.png"),
        ("2巡目　金盞花のハムスター妖精", "../assets/fairy-companion-kinsenka-hamster.png"),
        ("3巡目　南天のたぬき妖精", "../assets/fairy-companion-nanten-tanuki.png"),
    ]),
]

SPECIALS = [
    ("フレンチブルドッグ A", "碁盤を抱えるドジっ子", "special-character-stamps-2026-06-18/french-bulldog-go-board-a-transparent.png"),
    ("フレンチブルドッグ B", "碁石を追うドジっ子", "special-character-stamps-2026-06-18/french-bulldog-go-board-b-transparent.png"),
    ("フクロウ A", "本と指示棒の博識な先生", "special-character-stamps-2026-06-18/owl-scholar-a-transparent.png"),
    ("フクロウ B", "星を学ぶ白い賢者", "special-character-stamps-2026-06-18/owl-scholar-b-transparent.png"),
    ("ラッコ A", "大きな黒碁石", "special-character-stamps-2026-06-18/sea-otter-go-stone-a-transparent.png"),
    ("ラッコ B", "大きな白碁石", "special-character-stamps-2026-06-18/sea-otter-go-stone-b-transparent.png"),
    ("ハリネズミ A", "虫眼鏡の知りたがり", "special-character-stamps-2026-06-18/curious-hedgehog-a-transparent.png"),
    ("ハリネズミ B", "地図とランタンの探検家", "special-character-stamps-2026-06-18/curious-hedgehog-b-transparent.png"),
]

ADDITIONAL_FAIRIES = [
    (
        "梅の妖精",
        "予備・追加完成品（薄背景版）",
        "ume-fairy-approved-2026-06-19/ume-fairy-light-background.png",
    ),
]

MEDALS = [
    ("参加10回", "コスモス満開勲章", "../assets/medal-stage-02.png"),
    ("先生の輪 一巡", "五つ星の輪", "../assets/teacher-circle-medal-once.png"),
    ("先生の輪 二巡", "五人の輪", "../assets/teacher-circle-medal-twice.png"),
    ("先生の輪 三巡", "知恵の書", "../assets/medal-stage-03.png"),
    ("先生の輪 五巡", "五つの花の輪", "../assets/medal-stage-04.png"),
]


def font(size):
    for path in (Path(r"C:\Windows\Fonts\YuGothM.ttc"), Path(r"C:\Windows\Fonts\meiryo.ttc")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def absolute_image(relative):
    return (DOCS / relative).resolve()


def checkerboard(size, cell=22):
    board = Image.new("RGBA", size, (255, 255, 255, 255))
    draw = ImageDraw.Draw(board)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            color = (238, 238, 238, 255) if (x // cell + y // cell) % 2 == 0 else (255, 255, 255, 255)
            draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=color)
    return board


def paste_contained(canvas, image_path, box):
    left, top, width, height = box
    image = Image.open(image_path).convert("RGBA")
    image.thumbnail((width, height), Image.Resampling.LANCZOS)
    canvas.alpha_composite(image, (left + (width - image.width) // 2, top + (height - image.height) // 2))


def make_cycle_sheet(title, rows, output_name):
    width, height = 1780, 160 + len(rows) * 440 + 80
    sheet = Image.new("RGB", (width, height), (251, 247, 238))
    draw = ImageDraw.Draw(sheet)
    draw.text((55, 28), title, fill=(58, 81, 64), font=font(38))
    headers = ["1巡目", "2巡目", "3巡目"]
    for col, header in enumerate(headers):
        x = 250 + col * 505
        draw.text((x + 190, 100), header, fill=(85, 74, 58), font=font(26))

    for row_index, (owner, items) in enumerate(rows):
        top = 160 + row_index * 440
        draw.rounded_rectangle((35, top, 210, top + 390), radius=8, fill=(239, 235, 221), outline=(205, 184, 132), width=2)
        owner_box = draw.textbbox((0, 0), owner, font=font(24))
        owner_width = owner_box[2] - owner_box[0]
        draw.text((122 - owner_width // 2, top + 175), owner, fill=(62, 83, 66), font=font(24))
        for col, (label, relative_path) in enumerate(items):
            left = 240 + col * 505
            draw.rounded_rectangle((left, top, left + 470, top + 390), radius=8, fill=(255, 253, 247), outline=(218, 184, 105), width=2)
            preview = checkerboard((430, 305))
            paste_contained(preview, absolute_image(relative_path), (15, 12, 400, 280))
            sheet.paste(preview.convert("RGB"), (left + 20, top + 18))
            label_box = draw.textbbox((0, 0), label, font=font(20))
            label_width = label_box[2] - label_box[0]
            draw.text((left + (470 - label_width) // 2, top + 335), label, fill=(72, 65, 55), font=font(20))
    output = DOCS / output_name
    sheet.save(output)
    return output


def make_special_sheet():
    width, height = 1960, 1260
    sheet = Image.new("RGB", (width, height), (251, 247, 238))
    draw = ImageDraw.Draw(sheet)
    draw.text((55, 28), "特別な仲間スタンプ　8種類", fill=(58, 81, 64), font=font(38))
    for index, (name, description, relative_path) in enumerate(SPECIALS):
        col = index % 4
        row = index // 4
        left = 50 + col * 480
        top = 100 + row * 570
        draw.rounded_rectangle((left, top, left + 430, top + 520), radius=8, fill=(255, 253, 247), outline=(218, 184, 105), width=2)
        preview = checkerboard((390, 390))
        paste_contained(preview, absolute_image(relative_path), (12, 12, 366, 366))
        sheet.paste(preview.convert("RGB"), (left + 20, top + 20))
        name_box = draw.textbbox((0, 0), name, font=font(21))
        name_width = name_box[2] - name_box[0]
        draw.text((left + (430 - name_width) // 2, top + 425), name, fill=(62, 83, 66), font=font(21))
        desc_box = draw.textbbox((0, 0), description, font=font(17))
        desc_width = desc_box[2] - desc_box[0]
        draw.text((left + (430 - desc_width) // 2, top + 468), description, fill=(85, 74, 58), font=font(17))
    output = DOCS / "stamp-catalog-special-2026-06-19.png"
    sheet.save(output)
    return output


def make_additional_fairy_sheet():
    width, height = 980, 760
    sheet = Image.new("RGB", (width, height), (251, 247, 238))
    draw = ImageDraw.Draw(sheet)
    draw.text((55, 28), "追加完成品　妖精スタンプ", fill=(58, 81, 64), font=font(38))
    name, description, relative_path = ADDITIONAL_FAIRIES[0]
    draw.rounded_rectangle((180, 105, 800, 700), radius=12, fill=(255, 253, 247), outline=(218, 184, 105), width=3)
    preview = checkerboard((560, 460))
    paste_contained(preview, absolute_image(relative_path), (18, 18, 524, 424))
    sheet.paste(preview.convert("RGB"), (210, 130))
    name_box = draw.textbbox((0, 0), name, font=font(28))
    draw.text((490 - (name_box[2] - name_box[0]) // 2, 610), name, fill=(62, 83, 66), font=font(28))
    desc_box = draw.textbbox((0, 0), description, font=font(19))
    draw.text((490 - (desc_box[2] - desc_box[0]) // 2, 657), description, fill=(85, 74, 58), font=font(19))
    output = DOCS / "stamp-catalog-additional-fairies-2026-06-19.png"
    sheet.save(output)
    return output


def make_medal_sheet():
    width, height = 1900, 1260
    sheet = Image.new("RGB", (width, height), (251, 247, 238))
    draw = ImageDraw.Draw(sheet)
    draw.text((55, 28), "勲章　完成品5種類", fill=(58, 81, 64), font=font(38))
    for index, (milestone, name, relative_path) in enumerate(MEDALS):
        left = 40 + index * 368
        top = 100
        draw.rounded_rectangle((left, top, left + 350, top + 1080), radius=12, fill=(255, 253, 247), outline=(218, 184, 105), width=2)
        preview = checkerboard((310, 750))
        paste_contained(preview, absolute_image(relative_path), (15, 20, 280, 710))
        sheet.paste(preview.convert("RGB"), (left + 20, top + 25))
        milestone_box = draw.textbbox((0, 0), milestone, font=font(21))
        draw.text((left + (350 - (milestone_box[2] - milestone_box[0])) // 2, top + 820), milestone, fill=(62, 83, 66), font=font(21))
        name_box = draw.textbbox((0, 0), name, font=font(18))
        draw.text((left + (350 - (name_box[2] - name_box[0])) // 2, top + 870), name, fill=(85, 74, 58), font=font(18))
        status = "完成版・アプリ使用中"
        status_box = draw.textbbox((0, 0), status, font=font(16))
        draw.text((left + (350 - (status_box[2] - status_box[0])) // 2, top + 920), status, fill=(139, 101, 30), font=font(16))
    output = DOCS / "stamp-catalog-medals-2026-06-19.png"
    sheet.save(output)
    return output


def table_html(rows):
    body = []
    for owner, items in rows:
        cells = []
        for label, path in items:
            cells.append(f'<td><img src="{escape(path)}" alt="{escape(label)}"><strong>{escape(label)}</strong></td>')
        body.append(f'<tr><th>{escape(owner)}</th>{"".join(cells)}</tr>')
    return "".join(body)


def special_html():
    return "".join(
        f'<article><img src="{escape(path)}" alt="{escape(name)}"><h3>{escape(name)}</h3><p>{escape(description)}</p></article>'
        for name, description, path in SPECIALS
    )


def additional_fairies_html():
    return "".join(
        f'<article><img src="{escape(path)}" alt="{escape(name)}"><h3>{escape(name)}</h3><p>{escape(description)}</p></article>'
        for name, description, path in ADDITIONAL_FAIRIES
    )


def medals_html():
    return "".join(
        f'<article><img src="{escape(path)}" alt="{escape(name)}"><h3>{escape(milestone)}</h3><p>{escape(name)}<br><small>完成版・アプリ使用中</small></p></article>'
        for milestone, name, path in MEDALS
    )


html = f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>水曜会スタンプ 完成品一覧</title>
<style>
:root {{ color-scheme: light; --ink:#3f4f40; --line:#d8bd7c; --paper:#fbf7ee; --card:#fffdf8; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; color:#554b3d; background:var(--paper); font-family:"Yu Gothic","Meiryo",sans-serif; }}
header {{ padding:32px max(24px,5vw) 22px; border-bottom:1px solid #ded4bd; background:#fffdf8; }}
h1 {{ margin:0; color:var(--ink); font-size:clamp(26px,4vw,42px); letter-spacing:0; }}
header p {{ margin:10px 0 0; }}
main {{ width:min(1480px,94vw); margin:0 auto; padding:30px 0 60px; }}
section {{ margin:0 0 48px; }}
h2 {{ margin:0 0 16px; color:var(--ink); font-size:27px; letter-spacing:0; }}
.scroll {{ overflow-x:auto; border:1px solid #ddd2b9; background:var(--card); }}
table {{ width:100%; min-width:980px; border-collapse:collapse; table-layout:fixed; }}
th,td {{ border:1px solid #e1d5bc; padding:14px; text-align:center; vertical-align:middle; }}
thead th {{ background:#f0ecdf; color:var(--ink); }}
tbody th {{ width:130px; background:#f4f0e5; color:var(--ink); }}
td img {{ display:block; width:100%; height:220px; object-fit:contain; margin:0 0 10px; }}
td strong {{ display:block; font-size:15px; }}
.specials {{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }}
article {{ border:1px solid var(--line); background:var(--card); padding:14px; border-radius:8px; text-align:center; }}
article img {{ display:block; width:100%; aspect-ratio:1; object-fit:contain; }}
article h3 {{ margin:10px 0 4px; color:var(--ink); font-size:17px; letter-spacing:0; }}
article p {{ margin:0; font-size:14px; }}
article small {{ color:#8b651e; font-weight:800; }}
@media (max-width:850px) {{ .specials {{ grid-template-columns:repeat(2,minmax(0,1fr)); }} }}
</style>
</head>
<body>
<header><h1>水曜会スタンプ 完成品一覧</h1><p>花33種・妖精34体（使用中33体＋追加1体）・勲章5種・特別な仲間8体</p></header>
<main>
<section><h2>花スタンプ</h2><div class="scroll"><table><thead><tr><th>区分</th><th>1巡目</th><th>2巡目</th><th>3巡目</th></tr></thead><tbody>{table_html(FLOWERS)}</tbody></table></div></section>
<section><h2>妖精スタンプ</h2><div class="scroll"><table><thead><tr><th>区分</th><th>1巡目</th><th>2巡目</th><th>3巡目</th></tr></thead><tbody>{table_html(FAIRIES)}</tbody></table></div></section>
<section><h2>追加完成品</h2><div class="specials">{additional_fairies_html()}</div></section>
<section><h2>勲章</h2><div class="specials">{medals_html()}</div></section>
<section><h2>特別な仲間スタンプ</h2><div class="specials">{special_html()}</div></section>
</main>
</body>
</html>'''

html_path = DOCS / "stamp-catalog-2026-06-19.html"
html_path.write_text(html, encoding="utf-8")

outputs = [
    make_cycle_sheet("花スタンプ　33種類", FLOWERS, "stamp-catalog-flowers-2026-06-19.png"),
    make_cycle_sheet("妖精スタンプ　使用中33種類", FAIRIES, "stamp-catalog-fairies-2026-06-19.png"),
    make_additional_fairy_sheet(),
    make_medal_sheet(),
    make_special_sheet(),
    html_path,
]
for output in outputs:
    print(output)
