
from flask import Flask, request, jsonify, Blueprint, make_response, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from src.utils.mongo_db import MongoDB
from src.middleware.auth_middleware import token_required
import requests
import os
import logging
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://rag.bixbites.com"}})
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['UPLOAD_FOLDER'] = os.getenv("UPLOAD_FOLDER", "/tmp/uploads")
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

mongo_db = MongoDB()

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

logging.basicConfig(level=logging.INFO)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def error_response(message, code=400):
    return jsonify({'error': message}), code

def get_user_id():
    # Example: get user id from session or JWT
    return session.get('user_id')

def require_json(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.is_json:
            return error_response('Request must be JSON', 400)
        return f(*args, **kwargs)
    return decorated

@app.route('/api/models', methods=['GET'])
@token_required
def get_models():
    try:
        models = mongo_db.get_available_models()
        return jsonify({'models': models}), 200
    except Exception as e:
        logging.error(f"Error fetching models: {str(e)}")
        return error_response('Failed to fetch models', 500)

@app.route('/api/select-model', methods=['POST'])
@token_required
@require_json
def select_model():
    data = request.get_json()
    model_id = data.get('model_id')
    if not model_id:
        return error_response('model_id is required', 400)
    user_id = get_user_id()
    try:
        mongo_db.set_user_model(user_id, model_id)
        return jsonify({'message': 'Model selected successfully'}), 200
    except Exception as e:
        logging.error(f"Error selecting model: {str(e)}")
        return error_response('Failed to select model', 500)

@app.route('/api/chat', methods=['POST'])
@token_required
@require_json
def chat():
    data = request.get_json()
    message = data.get('message')
    context = data.get('context', [])
    model_id = data.get('model_id')
    prompt_template = data.get('prompt_template')
    user_id = get_user_id()
    if not message or not model_id or not prompt_template:
        return error_response('message, model_id, and prompt_template are required', 400)
    try:
        # Retrieve relevant docs for RAG
        retrieved_docs = mongo_db.retrieve_documents(user_id, message)
        # Compose prompt
        prompt = prompt_template.format(context=context, docs=retrieved_docs, question=message)
        # Call LLM
        llm_response = mongo_db.query_llm(model_id, prompt)
        # Save chat
        mongo_db.save_chat(user_id, message, llm_response)
        return jsonify({'response': llm_response, 'retrieved_docs': retrieved_docs}), 200
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        return error_response('Failed to process chat', 500)

@app.route('/api/upload-doc', methods=['POST'])
@token_required
def upload_doc():
    if 'file' not in request.files:
        return error_response('No file part in the request', 400)
    file = request.files['file']
    if file.filename == '':
        return error_response('No selected file', 400)
    if not allowed_file(file.filename):
        return error_response('File type not allowed', 400)
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(file_path)
        user_id = get_user_id()
        mongo_db.process_and_index_document(user_id, file_path, filename)
        return jsonify({'message': 'File uploaded and indexed successfully'}), 201
    except Exception as e:
        logging.error(f"Error uploading file: {str(e)}")
        return error_response('Failed to upload file', 500)

@app.route('/api/update-prompt', methods=['POST'])
@token_required
@require_json
def update_prompt():
    data = request.get_json()
    prompt_template = data.get('prompt_template')
    if not prompt_template:
        return error_response('prompt_template is required', 400)
    user_id = get_user_id()
    try:
        mongo_db.update_user_prompt(user_id, prompt_template)
        return jsonify({'message': 'Prompt updated successfully'}), 200
    except Exception as e:
        logging.error(f"Error updating prompt: {str(e)}")
        return error_response('Failed to update prompt', 500)

@app.route('/api/chat-history', methods=['GET'])
@token_required
def get_chat_history():
    user_id = get_user_id()
    try:
        history = mongo_db.get_chat_history(user_id)
        return jsonify({'history': history}), 200
    except Exception as e:
        logging.error(f"Error fetching chat history: {str(e)}")
        return error_response('Failed to fetch chat history', 500)

@app.route('/api/chat-history', methods=['DELETE'])
@token_required
def delete_chat_history():
    user_id = get_user_id()
    try:
        mongo_db.clear_chat_history(user_id)
        return jsonify({'message': 'Chat history cleared'}), 200
    except Exception as e:
        logging.error(f"Error clearing chat history: {str(e)}")
        return error_response('Failed to clear chat history', 500)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided!'}), 400
    response = mongo_db.create_user(data)
    return response

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(host='0.0.0.0', port=5000, debug=True)
