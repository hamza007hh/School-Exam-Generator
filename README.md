# 🎓 School Exam Generator

Intelligent system for automatic generation and standardization of school exams using OCR, NLP and dynamic PDF rendering.

---

## 🚀 Overview

This platform allows:

* Uploading scanned or digital exam PDFs
* Automatic extraction of metadata (professor, subject, filière, date, type)
* Standardized professional PDF regeneration
* Custom exam header with official school layout
* Web interface for professors and administrators

---
<img width="3831" height="1899" alt="loginpage" src="https://github.com/user-attachments/assets/1788857f-c9fd-4d15-ad1b-cfdaea331692" />
<img width="3823" height="1896" alt="dashboard" src="https://github.com/user-attachments/assets/33d01d6a-6a57-44a0-94b2-673166240c21" />


## 🧠 Technologies Used

* Python 3.9+
* Flask
* PyMuPDF
* Tesseract OCR
* CamemBERT (French NLP)
* HTML / CSS / JS

---

## 📂 Project Structure

```
pdf-project/
│
├── back-end/
│   ├── app.py
│   ├── pdf_extract.py
│   ├── exam_generator.py
│   └── ...
│
├── front-end/
│   ├── dashboard/
│   ├── professors/
│   ├── documents/
│   └── exam-generator/
```

---

## ✨ Features

* 📄 PDF Upload
* 🔍 OCR Text Extraction
* 🤖 Metadata Detection with NLP
* 🏫 Standardized Official Header
* 📥 Final PDF Download
* 👨‍🏫 Professor Management
* 📊 Dashboard Analytics

---

## ⚙️ Installation

### 1️⃣ Install Python 3.9

Add Python to PATH during installation.

Verify:

```
python --version
```

---

### 2️⃣ Install Tesseract OCR

Download:

[https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)

Add Tesseract to PATH.

Select English (eng) and French (fra) language data during installation.

Verify:

```
tesseract --version
tesseract --list-langs
```

---

### 3️⃣ Install Poppler (Required for PDF OCR)

Download:

[https://github.com/oschwartz10612/poppler-windows/releases](https://github.com/oschwartz10612/poppler-windows/releases)

Extract to:

```
C:\poppler
```

Add this folder to PATH:

```
C:\poppler\Library\bin
```

Verify:

```
pdfinfo -v
```

---

### 4️⃣ Install Python Dependencies

```
pip install pytesseract pillow pdf2image opencv-python pymupdf torch transformers sentencepiece flask flask-cors reportlab
```

---

### 5️⃣ Run Backend

```
start start_backend.bat
```

---

## 🎯 Objective

* Reduce administrative workload
* Standardize exam formatting
* Automate document processing using AI
