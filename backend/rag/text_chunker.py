from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_normal_text(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    return splitter.split_text(text)


def split_text_into_chunks(markdown_text):
    lines = markdown_text.splitlines()

    chunks = []
    normal_text = []
    table_lines = []

    def flush_normal_text():
        if normal_text:
            text = "\n".join(normal_text).strip()

            if text:
                chunks.extend(split_normal_text(text))

            normal_text.clear()

    def flush_table():
        if table_lines:
            table_text = "\n".join(table_lines).strip()

            if table_text:
                chunks.append(table_text)

            table_lines.clear()

    for line in lines:

        # Markdown table row
        if line.strip().startswith("|"):
            flush_normal_text()
            table_lines.append(line)

        else:
            flush_table()
            normal_text.append(line)

    flush_normal_text()
    flush_table()

    return chunks