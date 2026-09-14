import pymupdf

pdf_path = "../documents/AAPL/apple_q3_2026_earnings.pdf"

doc = pymupdf.open(pdf_path)

page = doc[0]

text = page.get_text()

print(text)