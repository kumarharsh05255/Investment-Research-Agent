import pymupdf

from table_parser import table_to_text
from table_section_splitter import split_table_sections
from chunk_builder import build_table_chunks


pdf_path = "../documents/AAPL/apple_q3_2026_earnings.pdf"

doc = pymupdf.open(pdf_path)

page = doc[0]

tables = page.find_tables()

print("Tables found:", len(tables.tables))

for table in tables.tables:

    # Get context above the table
    table_bbox = table.bbox

    header_area = pymupdf.Rect(
        0,
        0,
        page.rect.width,
        table_bbox[1]
    )

    header_text = page.get_textbox(header_area).strip()

    # Extract and clean table
    extracted = table.extract()
    cleaned_table = table_to_text(extracted)

    # Split table into logical sections
    sections = split_table_sections(cleaned_table)

    # Build final RAG chunks
    chunks = build_table_chunks(
        company="AAPL",
        document_name="Apple Q3 2026 Earnings",
        page_number=1,
        header_text=header_text,
        sections=sections
    )

    # Show final chunks
    for i, chunk in enumerate(chunks, start=1):
        print(f"\n========== CHUNK {i} ==========\n")
        print(chunk)