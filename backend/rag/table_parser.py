def clean_cell(cell):
    if cell is None:
        return ""

    cell = str(cell)

    # Remove line breaks but keep the original characters
    cell = cell.replace("\n", "")

    # Normalize spaces
    cell = " ".join(cell.split())

    # Fix common punctuation spacing
    cell = cell.replace(" ,", ",")
    cell = cell.replace(" .", ".")

    return cell.strip()


def clean_table(table_rows):
    cleaned_rows = []

    for row in table_rows:
        cleaned_row = []

        for cell in row:
            cleaned = clean_cell(cell)

            if cleaned:
                cleaned_row.append(cleaned)

        if cleaned_row:
            cleaned_rows.append(cleaned_row)

    return cleaned_rows


def table_to_text(table_rows):
    cleaned_rows = clean_table(table_rows)

    lines = []

    for row in cleaned_rows:
        lines.append(" | ".join(row))

    return "\n".join(lines)