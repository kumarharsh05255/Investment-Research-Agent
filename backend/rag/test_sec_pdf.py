import pymupdf
import pymupdf.layout
import pymupdf4llm


pdf_path = "../documents/AAPL/apple_2025_10k.pdf"

doc = pymupdf.open(pdf_path)

print("Total pages:", len(doc))

markdown = pymupdf4llm.to_markdown(
    doc,
    pages=[31]
)

print("\n===== MARKDOWN OUTPUT =====\n")
print(markdown)