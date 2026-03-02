from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import re
from pdf_extract import extract_text
from camembert_test import extract_lines_with_position, extract_teacher_candidates, select_teacher
import os
import tempfile
from pdf_extract import extract_text

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/extract', methods=['POST'])
def handle_extract():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        # Save to a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        try:
            with os.fdopen(fd, 'wb') as tmp:
                file.save(tmp)
            
            # Extract text
            print(f"Processing file: {temp_path}")
            text = extract_text(temp_path)
            
            # Extract metadata heuristics
            title = file.filename.replace(".pdf", "")
            
            # 1. Look for Professor using camembert (from camembert_test)
            prof = "Unknown"
            try:
                pages = extract_lines_with_position(temp_path)
                candidates = extract_teacher_candidates(pages)
                teacher = select_teacher(candidates)
                if teacher:
                    prof = teacher["name"]
            except Exception as e:
                print("Error extracting teacher:", e)
            
            # 2. Look for Module/Course (heuristic)
            module = "Unknown"
            module_match = re.search(r"(?i)(?:mati(?:è|e)re|module|cours)\s*[:\-]\s*([^\n\r]+)", text)
            if module_match:
                module = module_match.group(1).strip()
                
            # 3. Look for Year (heuristic)
            year = "Unknown"
            year_match = re.search(r"(20\d{2}[/-]20\d{2})", text)
            if year_match:
                year = year_match.group(1)
                
            # 4. Look for Document Type
            doc_type = "Course"
            text_lower = text.lower()
            if "exam" in text_lower:
                doc_type = "Exam"
            elif "attestation" in text_lower:
                doc_type = "Attestation"
            elif "lab" in text_lower or "tp" in text_lower:
                doc_type = "Lab"

            return jsonify({
                "text": text,
                "metadata": {
                    "title": title,
                    "module": module,
                    "prof": prof,
                    "year": year,
                    "type": doc_type
                }
            })
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)

if __name__ == '__main__':
    print("Starting Flask Server on port 5000...")
    app.run(debug=True, port=5000)
