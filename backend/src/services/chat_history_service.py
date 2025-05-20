
import logging
from src.utils.mongo_db import MongoDB

mongo_db = MongoDB()

def get_chat_history(user_id: str):
    try:
        history = mongo_db.get_chat_history(user_id)
        logging.info(f"Retrieved chat history for user {user_id}.")
        return history
    except Exception as e:
        logging.error(f"Error retrieving chat history for user {user_id}: {str(e)}")
        return []

def add_chat_message(user_id: str, message: str, response: str):
    try:
        mongo_db.add_chat_message(user_id, message, response)
        logging.info(f"Added chat message for user {user_id}.")
        return True
    except Exception as e:
        logging.error(f"Error adding chat message for user {user_id}: {str(e)}")
        return False

def clear_chat_history(user_id: str):
    try:
        mongo_db.clear_chat_history(user_id)
        logging.info(f"Cleared chat history for user {user_id}.")
        return True
    except Exception as e:
        logging.error(f"Error clearing chat history for user {user_id}: {str(e)}")
        return False
