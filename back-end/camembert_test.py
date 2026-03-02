import fitz
from transformers import pipeline

# Lazy load CamemBERT base NER
_ner_pipeline = None

def get_ner():
    global _ner_pipeline
    if _ner_pipeline is None:
        try:
            _ner_pipeline = pipeline(
                "ner",
                model="camembert/camembert-base",
                tokenizer="camembert/camembert-base",
                aggregation_strategy="simple"
            )
        except Exception as e:
            print(f"Warning: Could not load NER model. Error: {e}")
            return None
    return _ner_pipeline

AUTHOR_KEYWORDS = [
    "professeur",
    "enseignant",
    "responsable",
    "rédigé par",
    "etabli par",
    "module"
]

def extract_lines_with_position(pdf_path):
    doc = fitz.open(pdf_path)
    pages = []

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        pages.append({
            "page": page_num,
            "lines": lines
        })
    return pages


def extract_teacher_candidates(pages):
    candidates = []
    
    ner = get_ner()
    if not ner:
        return candidates

    for p in pages:
        for idx, line in enumerate(p["lines"]):
            results = ner(line)

            for r in results:
                if r["entity_group"] == "PER":
                    candidates.append({
                        "name": r["word"],
                        "score": r["score"],
                        "page": p["page"],
                        "line": idx,
                        "text": line
                    })
    return candidates


def score_candidate(c):
    score = 0

    if c["page"] == 1:
        score += 50

    if c["line"] <= 20:
        score += 30

    if any(k in c["text"].lower() for k in AUTHOR_KEYWORDS):
        score += 40

    score += int(c["score"] * 10)

    return score


def select_teacher(candidates):
    if not candidates:
        return None

    ranked = sorted(
        candidates,
        key=lambda c: score_candidate(c),
        reverse=True
    )

    return ranked[0]


if __name__ == "__main__":
    PDF_PATH = "test.pdf"

    pages = extract_lines_with_position(PDF_PATH)
    candidates = extract_teacher_candidates(pages)
    teacher = select_teacher(candidates)

    if teacher:
        print("TEACHER FOUND")
        print("Name:", teacher["name"])
        print("Page:", teacher["page"])
        print("Line:", teacher["line"])
        print("Context:", teacher["text"])
    else:
        print("No teacher detected")
