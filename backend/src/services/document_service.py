
import os
import logging
import uuid
from werkzeug.utils import secure_filename
from typing import List, Tuple, Any
from PyPDF2 import PdfReader
import docx
from src.utils.mongo_db import MongoDB

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

mongo_db = MongoDB()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_and_save_file(file, user_id) -> Tuple[str, str]:
    try:
        filename = secure_filename(file.filename)
        if not allowed_file(filename):
            return None, "File type not allowed"
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_FILE_SIZE:
            return None, "File size exceeds limit"
        user_folder = os.path.join(os.getenv("UPLOAD_FOLDER", "/tmp/uploads"), str(user_id))
        os.makedirs(user_folder, exist_ok=True)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(user_folder, unique_filename)
        file.save(file_path)
        logging.info(f"File saved: {file_path}")
        return file_path, None
    except Exception as e:
        logging.error(f"Error saving file: {str(e)}")
        return None, str(e)

def extract_text_from_file(file_path: str) -> str:
    ext = file_path.rsplit('.', 1)[1].lower()
    try:
        if ext == 'pdf':
            text = ""
            with open(file_path, "rb") as f:
                reader = PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
            return text
        elif ext == 'docx':
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        elif ext == 'txt':
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            raise ValueError("Unsupported file type")
    except Exception as e:
        logging.error(f"Error extracting text: {str(e)}")
        raise

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = words[i:i+chunk_size]
        chunks.append(" ".join(chunk))
        i += chunk_size - overlap
    return chunks

def process_and_index_document(file_path: str, user_id: str) -> bool:
    try:
        text = extract_text_from_file(file_path)
        if not text.strip():
            raise ValueError("No text extracted from document")
        chunks = chunk_text(text)
        # Store each chunk in DB with embeddings (dummy embedding for now)
        for idx, chunk in enumerate(chunks):
            doc_chunk = {
                "user_id": user_id,
                "file_path": file_path,
                "chunk_id": f"{os.path.basename(file_path)}_{idx}",
                "text": chunk,
                "embedding": [0.0] * 768  # Replace with real embedding
            }
            mongo_db.index_document_chunk(doc_chunk)
        logging.info(f"Indexed {len(chunks)} chunks for {file_path}")
        return True
    except Exception as e:
        logging.error(f"Error processing and indexing document: {str(e)}")
        return False

def retrieve_relevant_chunks(query: str, user_id: str, top_k: int = 5) -> List[Any]:
    try:
        # For now, use keyword search; replace with semantic search as needed
        chunks = mongo_db.get_document_chunks(user_id)
        scored = []
        for chunk in chunks:
            score = chunk['text'].lower().count(query.lower())
            if score > 0:
                scored.append((score, chunk))
        scored.sort(reverse=True, key=lambda x: x[0])
        relevant = [chunk for _, chunk in scored[:top_k]]
        logging.info(f"Retrieved {len(relevant)} relevant chunks for query: {query}")
        return relevant
    except Exception as e:
        logging.error(f"Error retrieving relevant chunks: {str(e)}")
        return []
