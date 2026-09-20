from langchain_core.tools import tool

from logger import logger

from rag.document_finder import (
    find_document,
)

from rag.ingest import (
    filing_already_indexed,
    get_vector_store,
    ingest_document,
)


SUPPORTED_DOCUMENT_TYPES = {
    "10k",
    "earnings",
}


def build_filing_info(
    filing,
    document=None,
):
    """
    Build consistent filing metadata
    for tool responses.
    """
    info = {
        "ticker":
            filing.get(
                "ticker"
            ),

        "form":
            filing.get(
                "form"
            ),

        "filing_date":
            filing.get(
                "filing_date"
            ),

        "accession_number":
            filing.get(
                "accession_number"
            ),
    }

    if document:
        info[
            "sec_url"
        ] = document.get(
            "url"
        )

        info[
            "original_format"
        ] = document.get(
            "format"
        )

    return info


@tool
def document_search(
    query: str,
    company: str,
    document_type: str,
):
    """
    Search the latest official SEC
    10-K or earnings filing.

    company:
        Stock ticker such as
        AAPL, MSFT, NVDA.

    document_type:
        "10k" or "earnings"
    """
    try:
        company = (
            company
            .strip()
            .upper()
        )

        document_type = (
            document_type
            .strip()
            .lower()
            .replace("-", "")
            .replace("_", "")
        )

        logger.info(
            "document_search called | "
            f"company={company} | "
            f"document_type="
            f"{document_type} | "
            f"query={query}"
        )

        if (
            document_type
            not in
            SUPPORTED_DOCUMENT_TYPES
        ):
            return {
                "success": False,

                "reason":
                    "unsupported_document_type",

                "message": (
                    "document_search only "
                    "supports 10-K and "
                    "earnings filings."
                ),

                "use_web_search":
                    False,
            }

        result = find_document(
            ticker=company,
            document_type=
                document_type,
        )

        if not result.get(
            "success"
        ):
            reason = result.get(
                "reason",
                "document_not_found",
            )

            logger.info(
                "document_search failed | "
                f"reason={reason}"
            )

            return {
                "success": False,

                "reason":
                    reason,

                "company":
                    company,

                "document_type":
                    document_type,

                "message": (
                    "The requested official "
                    "SEC filing could not be "
                    "retrieved."
                ),

                "use_web_search":
                    True,
            }

        filing = result[
            "filing"
        ]

        document = result[
            "document"
        ]

        filing_info = (
            build_filing_info(
                filing,
                document,
            )
        )

        vector_store = (
            get_vector_store()
        )

        accession_number = filing[
            "accession_number"
        ]

        already_indexed = (
            filing_already_indexed(
                vector_store,
                accession_number,
            )
        )

        if already_indexed:
            logger.info(
                "Using already indexed "
                "SEC filing: "
                f"{accession_number}"
            )

        else:
            logger.info(
                "SEC filing is not "
                "indexed yet. "
                "Starting ingestion."
            )

            ingestion = (
                ingest_document(
                    filing=filing,
                    document=document,
                    vector_store=
                        vector_store,
                )
            )

            if not ingestion.get(
                "success"
            ):
                logger.error(
                    "SEC filing ingestion "
                    "failed"
                )

                return {
                    "success": False,

                    "reason":
                        "ingestion_failed",

                    "filing":
                        filing_info,

                    "message": (
                        "The official SEC "
                        "filing was found, "
                        "but ingestion into "
                        "the RAG pipeline "
                        "failed."
                    ),

                    "error":
                        ingestion.get(
                            "error"
                        ),

                    "use_web_search":
                        True,

                    "web_fallback_context": {
                        "ticker":
                            filing.get(
                                "ticker"
                            ),

                        "form":
                            filing.get(
                                "form"
                            ),

                        "filing_date":
                            filing.get(
                                "filing_date"
                            ),

                        "document_type":
                            filing.get(
                                "document_type"
                            ),

                        "accession_number":
                            accession_number,
                    },
                }

        documents = (
            vector_store
            .similarity_search(
                query,
                k=4,
                filter={
                    "accession_number":
                        accession_number
                },
            )
        )

        if not documents:
            logger.info(
                "No relevant chunks found "
                "in indexed SEC filing"
            )

            return {
                "success": False,

                "reason":
                    "no_relevant_chunks",

                "filing":
                    filing_info,

                "message": (
                    "The SEC filing was "
                    "indexed, but no "
                    "relevant evidence was "
                    "retrieved."
                ),

                "use_web_search":
                    True,

                "web_fallback_context": {
                    "ticker":
                        filing.get(
                            "ticker"
                        ),

                    "form":
                        filing.get(
                            "form"
                        ),

                    "filing_date":
                        filing.get(
                            "filing_date"
                        ),

                    "document_type":
                        filing.get(
                            "document_type"
                        ),

                    "accession_number":
                        accession_number,
                },
            }

        retrieved_documents = []

        for item in documents:

            metadata = (
                item.metadata
                or {}
            )

            retrieved_documents.append(
                {
                    "content":
                        item.page_content[
                            :1800
                        ],

                    "source":
                        metadata.get(
                            "source"
                        ),

                    "page":
                        metadata.get(
                            "page"
                        ),

                    "company":
                        metadata.get(
                            "company"
                        ),

                    "document_type":
                        metadata.get(
                            "document_type"
                        ),

                    "form":
                        metadata.get(
                            "form"
                        ),

                    "filing_date":
                        metadata.get(
                            "filing_date"
                        ),

                    "accession_number":
                        metadata.get(
                            "accession_number"
                        ),

                    "sec_url":
                        metadata.get(
                            "sec_url"
                        ),

                    "original_format":
                        metadata.get(
                            "original_format"
                        ),
                }
            )

        logger.info(
            "document_search completed "
            "successfully: "
            f"{len(retrieved_documents)} "
            "documents returned"
        )

        return {
            "success": True,

            "source":
                "SEC EDGAR",

            "filing":
                filing_info,

            "data":
                retrieved_documents,

            "use_web_search":
                False,
        }

    except Exception as error:
        logger.exception(
            "document_search failed"
        )

        return {
            "success": False,

            "reason":
                "document_search_failed",

            "company":
                company,

            "document_type":
                document_type,

            "message": (
                "An unexpected error "
                "occurred while retrieving "
                "the SEC filing."
            ),

            "error":
                str(error),

            "use_web_search":
                True,
        }