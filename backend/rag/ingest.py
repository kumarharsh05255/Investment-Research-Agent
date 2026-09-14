from pathlib import Path

import pymupdf
import pymupdf.layout
import pymupdf4llm

from text_chunker import split_text_into_chunks


DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"


def read_pdf_as_markdown(pdf_path):
    doc = pymupdf.open(pdf_path)

    markdown = pymupdf4llm.to_markdown(doc)

    return markdown


def ingest_documents():
    all_chunks = []

    for company_folder in DOCUMENTS_DIR.iterdir():

        if not company_folder.is_dir():
            continue

        company = company_folder.name

        for pdf_path in company_folder.glob("*.pdf"):

            print(f"Reading: {pdf_path.name}")

            markdown = read_pdf_as_markdown(pdf_path)

            chunks = split_text_into_chunks(markdown)

            for chunk in chunks:
                all_chunks.append(
                    {
                        "text": chunk,
                        "metadata": {
                            "company": company,
                            "source": pdf_path.name,
                        },
                    }
                )

    return all_chunks


if __name__ == "__main__":
    chunks = ingest_documents()

    print(f"\nTotal chunks created: {len(chunks)}")

    for i, chunk in enumerate(chunks[:3], start=1):
        print(f"\n========== CHUNK {i} ==========\n")
        print("Metadata:")
        print(chunk["metadata"])

        print("\nText:")
        print(chunk["text"])