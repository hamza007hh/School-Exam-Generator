import fitz  # PyMuPDF

def is_scanned_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    for page in doc:
        text = page.get_text().strip()
        if text:
            return False  # digital PDF
    return True  # scanned PDF


if __name__ == "__main__":
    pdf = "test.pdf"
    if is_scanned_pdf(pdf):
        print("Scanned PDF → use OCR")
    else:
        print("Digital PDF → extract text directly")
