import pytesseract
from pdf2image import convert_from_path
import cv2
import numpy as np

# If Tesseract is not in PATH, uncomment and set this:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

PDF_PATH = "test.pdf"   # put a scanned PDF here

pages = convert_from_path(PDF_PATH, dpi=300)

full_text = ""

for i, page in enumerate(pages):
    img = np.array(page)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    text = pytesseract.image_to_string(gray, lang="eng+fra")
    full_text += f"\n--- PAGE {i+1} ---\n{text}"

print(full_text)
