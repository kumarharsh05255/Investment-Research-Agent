from pathlib import Path

import httpx
import pymupdf
import pymupdf.layout
import pymupdf4llm

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from logger import logger
from rag.document_converter import html_to_pdf
from rag.document_finder import SEC_HEADERS
from rag.text_chunker import split_text_into_chunks


CHROMA_DIR = (
    Path(__file__).parent.parent
    / "chroma_db"
)

DOWNLOAD_DIR = (
    Path(__file__).parent.parent
    / "documents"
    / "downloaded"
)

COLLECTION_NAME = "investment_research"

EMBEDDING_MODEL = (
    "sentence-transformers/"
    "all-MiniLM-L6-v2"
)


# Keep these objects in memory after
# they are loaded for the first time.
_embeddings = None
_vector_store = None


def get_embeddings():
    """
    Load the embedding model only once.
    """
    global _embeddings

    if _embeddings is None:
        logger.info(
            "Loading embedding model"
        )

        _embeddings = (
            HuggingFaceEmbeddings(
                model_name=
                    EMBEDDING_MODEL
            )
        )

    return _embeddings


def get_vector_store():
    """
    Open Chroma only when RAG is used
    and reuse it afterwards.
    """
    global _vector_store

    if _vector_store is None:
        logger.info(
            "Opening Chroma vector store"
        )

        _vector_store = Chroma(
            persist_directory=str(
                CHROMA_DIR
            ),
            embedding_function=
                get_embeddings(),
            collection_name=
                COLLECTION_NAME,
        )

    return _vector_store


def safe_filename(
    value: str,
):
    """
    Make a safe local filename.
    """
    return (
        value
        .replace("/", "_")
        .replace("\\", "_")
        .replace(":", "_")
    )


def build_local_pdf_path(
    filing,
):
    """
    Create a unique PDF path for
    one SEC filing.
    """
    DOWNLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    ticker = filing[
        "ticker"
    ]

    document_type = filing[
        "document_type"
    ]

    accession_number = filing[
        "accession_number"
    ]

    filename = safe_filename(
        f"{ticker}_"
        f"{document_type}_"
        f"{accession_number}.pdf"
    )

    return (
        DOWNLOAD_DIR
        / filename
    )


def download_pdf(
    url: str,
    output_path: Path,
):
    """
    Download an SEC PDF locally.
    """
    output_path = Path(
        output_path
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if output_path.exists():
        logger.info(
            "Using existing PDF: "
            f"{output_path}"
        )

        return output_path

    logger.info(
        f"Downloading SEC PDF: {url}"
    )

    response = httpx.get(
        url,
        headers=SEC_HEADERS,
        timeout=60,
        follow_redirects=True,
    )

    response.raise_for_status()

    content = response.content

    if not content.startswith(
        b"%PDF"
    ):
        raise ValueError(
            "SEC response was not "
            "a valid PDF."
        )

    output_path.write_bytes(
        content
    )

    logger.info(
        f"PDF downloaded: {output_path}"
    )

    return output_path


def prepare_document_pdf(
    filing,
    document,
):
    """
    Ensure the SEC filing exists
    locally as a PDF.

    SEC PDF:
        download directly

    SEC HTML:
        convert locally to PDF
    """
    output_path = (
        build_local_pdf_path(
            filing
        )
    )

    if output_path.exists():
        logger.info(
            "Using existing local "
            f"document: {output_path}"
        )

        return output_path

    document_format = (
        document["format"]
        .lower()
    )

    if document_format == "pdf":
        return download_pdf(
            url=document["url"],
            output_path=
                output_path,
        )

    if document_format == "html":
        logger.info(
            "SEC filing is HTML. "
            "Converting to PDF."
        )

        return html_to_pdf(
            url=document["url"],
            output_path=
                output_path,
        )

    raise ValueError(
        "Unsupported SEC document "
        f"format: {document_format}"
    )


def filing_already_indexed(
    vector_store,
    accession_number: str,
):
    """
    Check whether this exact SEC
    filing already exists in Chroma.
    """
    result = vector_store.get(
        where={
            "accession_number":
                accession_number
        },
        limit=1,
    )

    return bool(
        result.get("ids")
    )


def create_documents(
    pdf_path,
    filing,
    document,
):
    """
    Convert the local PDF into
    LangChain Documents.
    """
    documents = []

    pdf = pymupdf.open(
        pdf_path
    )

    try:
        for page_number in range(
            len(pdf)
        ):

            markdown = (
                pymupdf4llm.to_markdown(
                    pdf,
                    pages=[
                        page_number
                    ],
                )
            )

            chunks = (
                split_text_into_chunks(
                    markdown
                )
            )

            for chunk in chunks:

                if not chunk.strip():
                    continue

                documents.append(
                    Document(
                        page_content=
                            chunk,
                        metadata={
                            "company":
                                filing[
                                    "ticker"
                                ],

                            "document_type":
                                filing[
                                    "document_type"
                                ],

                            "form":
                                filing[
                                    "form"
                                ],

                            "filing_date":
                                filing[
                                    "filing_date"
                                ],

                            "accession_number":
                                filing[
                                    "accession_number"
                                ],

                            "source":
                                pdf_path.name,

                            "page":
                                page_number
                                + 1,

                            "sec_url":
                                document[
                                    "url"
                                ],

                            "original_format":
                                document[
                                    "format"
                                ],
                        },
                    )
                )

    finally:
        pdf.close()

    return documents


def ingest_document(
    filing,
    document,
    vector_store=None,
):
    """
    Prepare and index one SEC filing.

    Existing Chroma data is preserved.
    """
    if vector_store is None:
        vector_store = (
            get_vector_store()
        )

    accession_number = filing[
        "accession_number"
    ]

    if filing_already_indexed(
        vector_store,
        accession_number,
    ):
        logger.info(
            "Filing already indexed: "
            f"{accession_number}"
        )

        return {
            "success": True,
            "already_indexed": True,
            "chunks_added": 0,
        }

    try:
        pdf_path = (
            prepare_document_pdf(
                filing=filing,
                document=document,
            )
        )

        documents = (
            create_documents(
                pdf_path=pdf_path,
                filing=filing,
                document=document,
            )
        )

        if not documents:
            return {
                "success": False,
                "error": (
                    "No text could be "
                    "extracted from the "
                    "SEC document."
                ),
            }

        logger.info(
            f"Adding {len(documents)} "
            "chunks to ChromaDB"
        )

        vector_store.add_documents(
            documents
        )

        logger.info(
            "Dynamic SEC ingestion "
            "complete"
        )

        return {
            "success": True,
            "already_indexed":
                False,
            "chunks_added":
                len(documents),
            "pdf_path":
                str(pdf_path),
        }

    except Exception as error:
        logger.exception(
            "SEC document ingestion "
            "failed"
        )

        return {
            "success": False,
            "error": str(error),
        }