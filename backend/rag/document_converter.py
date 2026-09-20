from pathlib import Path
from urllib.parse import (
    parse_qs,
    urlparse,
)

import httpx

from playwright.sync_api import (
    sync_playwright,
)

from logger import logger
from rag.document_finder import (
    SEC_HEADERS,
)


def get_direct_sec_url(
    url: str,
):
    """
    Convert an SEC Inline XBRL viewer URL
    into the underlying filing HTML URL.
    """
    parsed = urlparse(url)

    if parsed.path != "/ix":
        return url

    query = parse_qs(
        parsed.query
    )

    document_paths = query.get(
        "doc"
    )

    if not document_paths:
        return url

    document_path = (
        document_paths[0]
    )

    if not document_path.startswith(
        "/"
    ):
        document_path = (
            "/"
            + document_path
        )

    return (
        "https://www.sec.gov"
        + document_path
    )


def download_sec_html(
    url: str,
    output_path: Path,
):
    """
    Download the official SEC filing HTML
    using the SEC HTTP headers.
    """
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    logger.info(
        "Downloading SEC HTML: "
        f"{url}"
    )

    response = httpx.get(
        url,
        headers=SEC_HEADERS,
        timeout=60,
        follow_redirects=True,
    )

    response.raise_for_status()

    html = response.text

    if not html.strip():
        raise RuntimeError(
            "SEC returned empty HTML."
        )

    lowered = html.lower()

    if (
        "<html" not in lowered
        and "<!doctype" not in lowered
    ):
        raise RuntimeError(
            "SEC response does not "
            "appear to be HTML."
        )

    output_path.write_text(
        html,
        encoding="utf-8",
    )

    logger.info(
        "SEC HTML saved locally: "
        f"{output_path}"
    )

    return output_path


def html_to_pdf(
    url: str,
    output_path,
):
    """
    Download SEC HTML with httpx and
    convert the local HTML into PDF
    using Playwright.

    Playwright never requests the SEC
    page directly.
    """
    output_path = Path(
        output_path
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    direct_url = (
        get_direct_sec_url(
            url
        )
    )

    html_path = (
        output_path
        .with_suffix(".html")
    )

    logger.info(
        "Preparing SEC HTML for "
        "local PDF conversion"
    )

    download_sec_html(
        url=direct_url,
        output_path=html_path,
    )

    logger.info(
        "Converting local SEC HTML "
        "to PDF"
    )

    with sync_playwright() as p:

        browser = (
            p.chromium.launch(
                headless=True
            )
        )

        page = browser.new_page()

        try:
            local_url = (
                html_path
                .resolve()
                .as_uri()
            )

            response = page.goto(
                local_url,
                wait_until=
                    "domcontentloaded",
                timeout=60000,
            )

            # Local file navigation does not
            # require an HTTP response object.

            page.wait_for_timeout(
                1000
            )

            page.pdf(
                path=str(
                    output_path
                ),
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
                margin={
                    "top": "10mm",
                    "bottom": "10mm",
                    "left": "10mm",
                    "right": "10mm",
                },
            )

        finally:
            browser.close()

    if not output_path.exists():
        raise RuntimeError(
            "PDF conversion did not "
            "create a file."
        )

    if output_path.stat().st_size == 0:
        raise RuntimeError(
            "Converted PDF is empty."
        )

    logger.info(
        "HTML converted to PDF: "
        f"{output_path}"
    )

    # HTML is temporary because the PDF
    # becomes the local RAG document.
    try:
        html_path.unlink()
    except OSError:
        pass

    return output_path