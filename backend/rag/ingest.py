from pathlib import Path
import shutil

import pymupdf
import pymupdf.layout
import pymupdf4llm

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

from text_chunker import split_text_into_chunks


DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"
CHROMA_DIR = Path(__file__).parent.parent / "chroma_db"


def get_document_type(filename):
    name = filename.lower()

    if "10k" in name:
        return "10k"

    if "earnings" in name:
        return "earnings"

    if "research_report" in name:
        return "research_report"

    return "other"


def read_pdf_page_as_markdown(doc, page_number):
    markdown = pymupdf4llm.to_markdown(
        doc,
        pages=[page_number]
    )

    return markdown


def create_documents():
    documents = []

    for company_folder in DOCUMENTS_DIR.iterdir():
        if not company_folder.is_dir():
            continue

        company = company_folder.name

        for pdf_path in company_folder.glob("*.pdf"):
            print(f"Reading: {pdf_path.name}")

            document_type = get_document_type(pdf_path.name)

            doc = pymupdf.open(pdf_path)

            for page_number in range(len(doc)):
                markdown = read_pdf_page_as_markdown(
                    doc,
                    page_number
                )

                chunks = split_text_into_chunks(markdown)

                for chunk in chunks:
                    documents.append(
                        Document(
                            page_content=chunk,
                            metadata={
                                "company": company,
                                "document_type": document_type,
                                "source": pdf_path.name,
                                "page": page_number + 1,
                            },
                        )
                    )

            doc.close()

    return documents


def create_vector_store(documents):
    if CHROMA_DIR.exists():
        shutil.rmtree(CHROMA_DIR)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=str(CHROMA_DIR),
        collection_name="investment_research",
    )

    return vector_store


def ingest_documents():
    documents = create_documents()

    print(f"\nTotal chunks created: {len(documents)}")

    print("\nCreating embeddings and storing in ChromaDB...")

    create_vector_store(documents)

    print("\nIngestion complete.")
    print(f"ChromaDB saved at: {CHROMA_DIR}")


if __name__ == "__main__":
    ingest_documents()