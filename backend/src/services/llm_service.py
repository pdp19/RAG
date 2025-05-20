
import os
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Example: Replace with actual LLM API integration
class DummyLLMClient:
    def __init__(self, api_key, endpoint):
        self.api_key = api_key
        self.endpoint = endpoint

    def list_models(self):
        # Dummy data; replace with actual API call
        return [
            {"id": "gpt-4", "name": "GPT-4"},
            {"id": "llama-2", "name": "Llama 2"},
            {"id": "mistral-7b", "name": "Mistral 7B"}
        ]

    def generate(self, prompt, model_id):
        # Dummy response; replace with actual API call
        return f"LLM({model_id}) response to: {prompt[:100]}..."

# Dependency injection/configuration
LLM_API_KEY = os.getenv("LLM_API_KEY", "dummy-key")
LLM_API_ENDPOINT = os.getenv("LLM_API_ENDPOINT", "https://dummy-llm-endpoint.com")
llm_client = DummyLLMClient(LLM_API_KEY, LLM_API_ENDPOINT)

# Simulated in-memory user model selection (replace with persistent storage)
_user_model_map = {}

def get_available_models() -> List[Dict[str, str]]:
    try:
        models = llm_client.list_models()
        logging.info("Fetched available LLM models.")
        return models
    except Exception as e:
        logging.error(f"Error fetching models: {str(e)}")
        raise

def set_active_model(user_id: str, model_id: str) -> None:
    try:
        _user_model_map[user_id] = model_id
        logging.info(f"Set active model for user {user_id}: {model_id}")
    except Exception as e:
        logging.error(f"Error setting active model: {str(e)}")
        raise

def get_active_model(user_id: str) -> str:
    try:
        model_id = _user_model_map.get(user_id)
        logging.info(f"Retrieved active model for user {user_id}: {model_id}")
        return model_id
    except Exception as e:
        logging.error(f"Error getting active model: {str(e)}")
        raise

def generate_response(message: str, context: List[str], model_id: str, prompt_template: str, document_retriever=None) -> str:
    try:
        # Retrieve relevant context if document_retriever is provided
        retrieved_context = []
        if document_retriever:
            retrieved_context = document_retriever.retrieve(message)
            logging.info(f"Retrieved context for message: {retrieved_context}")

        # Combine context and user message using the prompt template
        prompt = prompt_template.format(
            context="\n".join(context + retrieved_context),
            question=message
        )
        response = llm_client.generate(prompt, model_id)
        logging.info(f"Generated LLM response for user message.")
        return response
    except Exception as e:
        logging.error(f"Error generating LLM response: {str(e)}")
        raise
