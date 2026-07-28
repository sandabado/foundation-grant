from pathlib import Path

from PIL import Image, ImageDraw


root = Path(__file__).resolve().parents[1]
preview_dir = root / "tmp" / "pdfs"
pages = sorted(preview_dir.glob("*.png"))

thumb_width = 306
thumb_height = 396
label_height = 28
columns = 4
rows = (len(pages) + columns - 1) // columns
sheet = Image.new("RGB", (columns * thumb_width, rows * (thumb_height + label_height)), "#E7E9E3")
draw = ImageDraw.Draw(sheet)

for index, page_path in enumerate(pages):
    page = Image.open(page_path).convert("RGB")
    page.thumbnail((thumb_width - 14, thumb_height - 14))
    column = index % columns
    row = index // columns
    x = column * thumb_width + (thumb_width - page.width) // 2
    y = row * (thumb_height + label_height) + 7
    sheet.paste(page, (x, y))
    draw.text(
        (column * thumb_width + 8, row * (thumb_height + label_height) + thumb_height + 4),
        page_path.stem,
        fill="#111411",
    )

output = preview_dir / "contact-sheet.png"
sheet.save(output)
print(output)
