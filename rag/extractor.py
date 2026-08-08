from pathlib import Path
from pypdf import PdfReader
from docx import Document


def extract_document(file_path):
    """
    Extract text from PDF, DOCX, or TXT.

    Returns:
        A list of dictionaries containing:
        - text
        - source
        - page
    """

    path = Path(file_path)
    extension = path.suffix.lower()

    extracted_data = []

    # PDF
    if extension == ".pdf":
        reader = PdfReader(file_path)

        for page_number, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""

            if text.strip():
                extracted_data.append({
                    "text": text.strip(),
                    "source": path.name,
                    "page": page_number
                })

    # DOCX
    elif extension == ".docx":
        document = Document(file_path)

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        )

        if text.strip():
            extracted_data.append({
                "text": text.strip(),
                "source": path.name,
                "page": None
            })

    # TXT
    elif extension == ".txt":
        text = path.read_text(encoding="utf-8")

        if text.strip():
            extracted_data.append({
                "text": text.strip(),
                "source": path.name,
                "page": None
            })

    else:
        raise ValueError(
            "Unsupported file type. Please upload PDF, DOCX, or TXT."
        )

    return extracted_data