import fitz  # PyMuPDF
import pytesseract
import cv2
import numpy as np

PDF_PATH = "test.pdf"

def is_scanned_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    for page in doc:
        if page.get_text().strip():
            return False
    return True

def extract_digital_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = []
    for page in doc:
        text.append(page.get_text())
    return "\n".join(text)

def extract_ocr_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = []
    for page in doc:
        try:
            pix = page.get_pixmap(dpi=300)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, pix.n))
            
            if pix.n == 3:
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            elif pix.n == 4:
                img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            
            t = pytesseract.image_to_string(gray, lang="eng")
            text.append(t)
        except Exception as e:
            text.append(f"[Error performing OCR on page: {e}]")
            
    return "\n".join(text)

def extract_text(pdf_path):
    if is_scanned_pdf(pdf_path):
        print("Scanned PDF detected -> OCR")
        return extract_ocr_text(pdf_path)
    else:
        print("Digital PDF detected -> Direct extraction")
        return extract_digital_text(pdf_path)

if __name__ == "__main__":
    result = extract_text(PDF_PATH)
    print("\n=== EXTRACTED TEXT ===\n")
    print(result)
