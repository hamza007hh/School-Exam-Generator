================================================================================
==========================================================================================

1. Install Python 3.9

   Add Python to PATH

   python --version

2. Install Tesseract OCR
Download : https://github.com/UB-Mannheim/tesseract/wiki

Add to PATH

Select English (eng) language data


Select French (fra) language data

tesseract --version

tesseract --list-langs

3. Install Poppler (Required for PDF OCR)

Download: https://github.com/oschwartz10612/poppler-windows/releases

C:\poppler

C:\poppler\Library\bin` to your system's PATH environment variable.

pdfinfo -v

4. Install Python Dependencies

pip install pytesseract pillow pdf2image opencv-python pymupdf torch transformers sentencepiece flask flask-cors reportlab
