from pathlib import Path

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.tools import tool

from logger import logger


CHROMA_DIR = Path(__file__).parent.parent / "chroma_db"

MAX_CHUNK_CHARS = 1200


embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


vector_store = Chroma(
    persist_directory=str(CHROMA_DIR),
    embedding_function=embeddings,
    collection_name="investment_research",
)


@tool
def document_search(
    query: str,
    company: str = None,
    document_type: str = None,
):
    """
    Search company SEC filings and earnings reports.

    Use this tool when the user asks about information from company documents,
    such as risk factors, management discussion, strategy, competition,
    regulatory risks, earnings details, or fundamentals not available
    from market data.

    company can be:
    - AAPL
    - MSFT
    - NVDA

    document_type can be:
    - 10k
    - earnings
    """

    try:
        logger.info(
            f"document_search called | company={company} | "
            f"document_type={document_type} | query={query}"
        )

        filter_conditions = []

        if company:
            filter_conditions.append(
                {"company": company}
            )

        if document_type:
            filter_conditions.append(
                {"document_type": document_type}
            )

        if len(filter_conditions) == 1:
            search_filter = filter_conditions[0]

        elif len(filter_conditions) > 1:
            search_filter = {
                "$and": filter_conditions
            }

        else:
            search_filter = None

        if search_filter:
            results = vector_store.similarity_search_with_score(
                query=query,
                k=3,
                filter=search_filter,
            )

        else:
            results = vector_store.similarity_search_with_score(
                query=query,
                k=3,
            )

        documents = []

        for document, score in results:
            text = document.page_content

            if len(text) > MAX_CHUNK_CHARS:
                text = text[:MAX_CHUNK_CHARS]

            documents.append(
                {
                    "text": text,
                    "company": document.metadata.get("company"),
                    "document_type": document.metadata.get("document_type"),
                    "source": document.metadata.get("source"),
                    "page": document.metadata.get("page"),
                    "score": score,
                }
            )

        logger.info(
            f"document_search completed successfully: "
            f"{len(documents)} documents returned"
        )

        return {
            "success": True,
            "data": documents,
        }

    except Exception as e:
        logger.exception("document_search failed")

        return {
            "success": False,
            "error": str(e),
        }


if __name__ == "__main__":
    result = document_search.invoke(
        {
            "query": "What risks does NVIDIA face from China export controls?",
            "company": "NVDA",
            "document_type": "10k",
        }
    )

    print(result)