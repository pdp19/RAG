
import logging
from src.utils.mongo_db import MongoDB

mongo_db = MongoDB()

def update_prompt_template(user_id: str, prompt_template: str) -> bool:
    if not user_id or not prompt_template or not isinstance(prompt_template, str):
        logging.error("Invalid input for updating prompt template.")
        return False
    try:
        mongo_db.set_user_prompt_template(user_id, prompt_template)
        logging.info(f"Prompt template updated for user {user_id}.")
        return True
    except Exception as e:
        logging.error(f"Error updating prompt template for user {user_id}: {str(e)}")
        return False

def get_prompt_template(user_id: str) -> str:
    if not user_id:
        logging.error("User ID required to get prompt template.")
        return ""
    try:
        template = mongo_db.get_user_prompt_template(user_id)
        logging.info(f"Prompt template retrieved for user {user_id}.")
        return template
    except Exception as e:
        logging.error(f"Error retrieving prompt template for user {user_id}: {str(e)}")
        return ""
