def build_table_chunks(
    company,
    document_name,
    page_number,
    header_text,
    sections
):
    chunks = []

    for section in sections:
        chunk = f"""
Company: {company}
Document: {document_name}
Page: {page_number}

Context:
{header_text}

Section:
{section}
""".strip()

        chunks.append(chunk)

    return chunks