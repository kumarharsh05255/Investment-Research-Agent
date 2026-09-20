import os

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from logger import logger


load_dotenv()


SEC_USER_AGENT = os.getenv("SEC_USER_AGENT")

if not SEC_USER_AGENT:
    raise ValueError(
        "SEC_USER_AGENT is missing from .env"
    )


SEC_HEADERS = {
    "User-Agent": SEC_USER_AGENT,
    "Accept-Encoding": "gzip, deflate",
}


COMPANY_TICKERS_URL = (
    "https://www.sec.gov/files/"
    "company_tickers.json"
)


def get_company_cik(ticker: str):
    """
    Convert a stock ticker into an SEC CIK.
    """

    ticker = ticker.upper().strip()

    response = httpx.get(
        COMPANY_TICKERS_URL,
        headers=SEC_HEADERS,
        timeout=20,
        follow_redirects=True,
    )

    response.raise_for_status()

    companies = response.json()

    for company in companies.values():

        if (
            company["ticker"].upper()
            == ticker
        ):
            return str(
                company["cik_str"]
            ).zfill(10)

    return None


def get_recent_filings(cik: str):
    """
    Get recent SEC filing metadata.
    """

    url = (
        "https://data.sec.gov/"
        f"submissions/CIK{cik}.json"
    )

    response = httpx.get(
        url,
        headers=SEC_HEADERS,
        timeout=20,
        follow_redirects=True,
    )

    response.raise_for_status()

    data = response.json()

    return (
        data
        .get("filings", {})
        .get("recent", {})
    )


def find_target_filing(
    ticker: str,
    document_type: str,
):
    """
    Find the latest relevant SEC filing.

    10k:
        latest 10-K

    earnings:
        recent 8-K containing an
        earnings-related exhibit
    """

    cik = get_company_cik(ticker)

    if not cik:
        return None

    filings = get_recent_filings(cik)

    forms = filings.get(
        "form",
        [],
    )

    accession_numbers = filings.get(
        "accessionNumber",
        [],
    )

    filing_dates = filings.get(
        "filingDate",
        [],
    )

    primary_documents = filings.get(
        "primaryDocument",
        [],
    )

    if document_type == "10k":
        target_form = "10-K"

    elif document_type == "earnings":
        target_form = "8-K"

    else:
        return None

    for index, form in enumerate(forms):

        if form != target_form:
            continue

        filing = {
            "ticker":
                ticker.upper(),

            "cik":
                cik,

            "form":
                form,

            "document_type":
                document_type,

            "accession_number":
                accession_numbers[index],

            "filing_date":
                filing_dates[index],

            "primary_document":
                primary_documents[index],
        }

        # For a 10-K, the first 10-K is
        # already the filing we want.
        if document_type == "10k":
            return filing

        # For earnings, an 8-K is only a
        # candidate. We'll inspect its
        # documents before accepting it.
        document = (
            find_filing_document(
                filing
            )
        )

        if document:
            filing[
                "resolved_document"
            ] = document

            return filing

    return None


def build_filing_index_url(
    filing,
):
    cik_without_zeros = str(
        int(filing["cik"])
    )

    accession = filing[
        "accession_number"
    ]

    accession_no_dashes = (
        accession.replace("-", "")
    )

    return (
        "https://www.sec.gov/"
        "Archives/edgar/data/"
        f"{cik_without_zeros}/"
        f"{accession_no_dashes}/"
        f"{accession}-index.html"
    )


def normalize_sec_url(href: str):
    """
    Convert a relative SEC URL into
    an absolute SEC URL.
    """

    if href.startswith("http"):
        return href

    if not href.startswith("/"):
        href = "/" + href

    return (
        "https://www.sec.gov"
        + href
    )


def find_filing_document(filing):
    """
    Find the actual document we want
    from an SEC filing page.

    10-K:
        Prefer the primary 10-K document.

    Earnings:
        Prefer EX-99.1 / earnings-related
        exhibit.

    Supports both PDF and HTML documents.
    """

    filing_index_url = (
        build_filing_index_url(
            filing
        )
    )

    logger.info(
        "Checking SEC filing: "
        f"{filing_index_url}"
    )

    response = httpx.get(
        filing_index_url,
        headers=SEC_HEADERS,
        timeout=20,
        follow_redirects=True,
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    documents = []

    for row in soup.find_all("tr"):

        cells = row.find_all("td")

        if len(cells) < 4:
            continue

        link = row.find(
            "a",
            href=True,
        )

        if not link:
            continue

        href = link.get("href")

        if not href:
            continue

        document_name = (
            link.get_text(
                strip=True
            )
        )

        description = (
            cells[1]
            .get_text(
                " ",
                strip=True,
            )
            if len(cells) > 1
            else ""
        )

        sec_document_type = (
            cells[3]
            .get_text(
                strip=True
            )
            .upper()
        )

        lower_href = (
            href.lower()
        )

        if lower_href.endswith(
            ".pdf"
        ):
            file_format = "pdf"

        elif (
            lower_href.endswith(
                ".htm"
            )
            or lower_href.endswith(
                ".html"
            )
        ):
            file_format = "html"

        else:
            continue

        documents.append(
            {
                "url":
                    normalize_sec_url(
                        href
                    ),

                "document_name":
                    document_name,

                "description":
                    description,

                "sec_document_type":
                    sec_document_type,

                "format":
                    file_format,
            }
        )

    if filing[
        "document_type"
    ] == "10k":

        # Prefer exact 10-K document.
        for document in documents:

            if (
                document[
                    "sec_document_type"
                ]
                == "10-K"
            ):
                return document

        # Fallback to the primary document.
        primary_document = (
            filing.get(
                "primary_document"
            )
        )

        for document in documents:

            if (
                document[
                    "document_name"
                ]
                == primary_document
            ):
                return document

        return None

    if filing[
        "document_type"
    ] == "earnings":

        # Strongest signal:
        # EX-99.1.
        for document in documents:

            if (
                document[
                    "sec_document_type"
                ]
                == "EX-99.1"
            ):
                return document

        # Some filings use another
        # EX-99 variant.
        for document in documents:

            doc_type = document[
                "sec_document_type"
            ]

            description = (
                document[
                    "description"
                ].lower()
            )

            if (
                doc_type.startswith(
                    "EX-99"
                )
                and (
                    "earnings"
                    in description
                    or "results"
                    in description
                    or "release"
                    in description
                )
            ):
                return document

        return None

    return None


def find_document(
    ticker: str,
    document_type: str,
):
    """
    Find the latest usable SEC document.

    Returns either a PDF or HTML document.
    """

    try:

        filing = find_target_filing(
            ticker=ticker,
            document_type=
                document_type,
        )

        if not filing:

            return {
                "success": False,
                "reason":
                    "filing_not_found",
            }

        document = filing.pop(
            "resolved_document",
            None,
        )

        if document is None:
            document = (
                find_filing_document(
                    filing
                )
            )

        if not document:

            return {
                "success": False,
                "reason":
                    "document_not_found",
                "filing":
                    filing,
            }

        logger.info(
            "SEC document found | "
            f"format="
            f"{document['format']} | "
            f"type="
            f"{document['sec_document_type']}"
        )

        return {
            "success": True,
            "filing": filing,
            "document": document,
        }

    except Exception as e:

        logger.exception(
            "SEC document lookup failed"
        )

        return {
            "success": False,
            "reason":
                "document_lookup_failed",
            "error": str(e),
        }