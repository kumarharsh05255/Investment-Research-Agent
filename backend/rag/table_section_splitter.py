def split_table_sections(table_text):
    section_starters = [
        "Cost of sales:",
        "Operating expenses:",
        "Earnings per share:",
        "(1) Net sales by reportable segment:",
        "(1) Net sales by category:",
    ]

    sections = []
    current_section = []

    for line in table_text.splitlines():

        if line in section_starters and current_section:
            sections.append("\n".join(current_section))
            current_section = []

        current_section.append(line)

    if current_section:
        sections.append("\n".join(current_section))

    return sections