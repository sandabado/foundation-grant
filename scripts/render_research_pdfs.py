from pathlib import Path

import pypdfium2 as pdfium


root = Path(__file__).resolve().parents[1]
source = root / "output" / "pdf"
target = root / "tmp" / "pdfs"
target.mkdir(parents=True, exist_ok=True)

for old_preview in target.glob("*.png"):
    old_preview.unlink()

rendered = 0
for pdf_path in sorted(source.glob("*.pdf")):
    document = pdfium.PdfDocument(str(pdf_path))
    for page_index, page in enumerate(document):
        image = page.render(scale=1.8).to_pil()
        image.save(target / f"{pdf_path.stem}-page-{page_index + 1}.png")
        rendered += 1

print(rendered)
