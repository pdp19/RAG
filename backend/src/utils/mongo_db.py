
import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv
import logging

class MongoDB():

    def __init__(self):
        load_dotenv()
        db_uri = os.getenv("MONGODB_URI")
        db_name = "rag_db"
        self.client = MongoClient(db_uri, tls=True, tlsAllowInvalidCertificates=True)
        self.db = self.client[db_name]
        self.models_col = self.db["models"]
        self.user_models_col = self.db["user_models"]
        self.documents_col = self.db["documents"]
        self.chunks_col = self.db["document_chunks"]
        self.prompts_col = self.db["prompts"]
        self.chat_col = self.db["chat_history"]

        # Ensure indexes for efficient queries
        self.user_models_col.create_index([("user_id", ASCENDING)], unique=True)
        self.chunks_col.create_index([("user_id", ASCENDING)])
        self.prompts_col.create_index([("user_id", ASCENDING)], unique=True)
        self.chat_col.create_index([("user_id", ASCENDING)])

    # ----------------- Model Management -----------------
    def get_available_models(self):
        try:
            models = list(self.models_col.find({}, {"_id": 0}))
            return models
        except Exception as e:
            logging.error(f"Error fetching models: {str(e)}")
            return []

    def set_user_model(self, user_id, model_id):
        try:
            self.user_models_col.update_one(
                {"user_id": user_id},
                {"$set": {"model_id": model_id}},
                upsert=True
            )
        except Exception as e:
            logging.error(f"Error setting user model: {str(e)}")
            raise

    def get_user_model(self, user_id):
        try:
            doc = self.user_models_col.find_one({"user_id": user_id})
            return doc["model_id"] if doc and "model_id" in doc else None
        except Exception as e:
            logging.error(f"Error getting user model: {str(e)}")
            return None

    # ----------------- Document Storage -----------------
    def store_document_metadata(self, user_id, file_path, filename):
        try:
            doc = {
                "user_id": user_id,
                "file_path": file_path,
                "filename": filename
            }
            self.documents_col.insert_one(doc)
        except Exception as e:
            logging.error(f"Error storing document metadata: {str(e)}")

    def index_document_chunk(self, doc_chunk):
        try:
            self.chunks_col.insert_one(doc_chunk)
        except Exception as e:
            logging.error(f"Error indexing document chunk: {str(e)}")

    def get_document_chunks(self, user_id):
        try:
            return list(self.chunks_col.find({"user_id": user_id}, {"_id": 0}))
        except Exception as e:
            logging.error(f"Error getting document chunks: {str(e)}")
            return []

    def retrieve_documents(self, user_id, query, top_k=5):
        try:
            # Simple keyword search; can be replaced with semantic search
            chunks = self.get_document_chunks(user_id)
            scored = []
            for chunk in chunks:
                score = chunk['text'].lower().count(query.lower())
                if score > 0:
                    scored.append((score, chunk['text']))
            scored.sort(reverse=True, key=lambda x: x[0])
            return [text for _, text in scored[:top_k]]
        except Exception as e:
            logging.error(f"Error retrieving documents: {str(e)}")
            return []

    def process_and_index_document(self, user_id, file_path, filename):
        # This should be called from the document service after file is saved and processed
        self.store_document_metadata(user_id, file_path, filename)
        # Actual chunking and indexing is handled in the document service

    # ----------------- Prompt Templates -----------------
    def set_user_prompt_template(self, user_id, prompt_template):
        try:
            self.prompts_col.update_one(
                {"user_id": user_id},
                {"$set": {"prompt_template": prompt_template}},
                upsert=True
            )
        except Exception as e:
            logging.error(f"Error setting prompt template: {str(e)}")
            raise

    def get_user_prompt_template(self, user_id):
        try:
            doc = self.prompts_col.find_one({"user_id": user_id})
            return doc["prompt_template"] if doc and "prompt_template" in doc else ""
        except Exception as e:
            logging.error(f"Error getting prompt template: {str(e)}")
            return ""

    def update_user_prompt(self, user_id, prompt_template):
        self.set_user_prompt_template(user_id, prompt_template)

    # ----------------- Chat History -----------------
    def save_chat(self, user_id, message, response):
        try:
            self.chat_col.insert_one({
                "user_id": user_id,
                "message": message,
                "response": response
            })
        except Exception as e:
            logging.error(f"Error saving chat: {str(e)}")

    def add_chat_message(self, user_id, message, response):
        self.save_chat(user_id, message, response)

    def get_chat_history(self, user_id):
        try:
            chats = list(self.chat_col.find({"user_id": user_id}, {"_id": 0, "user_id": 0}))
            return chats
        except Exception as e:
            logging.error(f"Error getting chat history: {str(e)}")
            return []

    def clear_chat_history(self, user_id):
        try:
            self.chat_col.delete_many({"user_id": user_id})
        except Exception as e:
            logging.error(f"Error clearing chat history: {str(e)}")
