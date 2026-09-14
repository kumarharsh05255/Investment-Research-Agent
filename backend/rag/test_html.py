from bs4 import BeautifulSoup


html_path = "../documents/AAPL/apple_2025_10k.html"

with open(html_path, "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")


# Extract normal page text
text = soup.get_text(separator="\n", strip=True)

print("===== TEXT SAMPLE =====")
print(text[:3000])


# Find HTML tables
tables = soup.find_all("table")

print("\n===== TABLE INFORMATION =====")
print("Tables found:", len(tables))


# Print a sample from the first table
if tables:
    print("\n===== FIRST TABLE SAMPLE =====")
    print(
        tables[0].get_text(
            separator=" | ",
            strip=True
        )[:2000]
    )