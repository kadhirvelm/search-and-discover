import requests

BASE_URL = "http://127.0.0.1:5000"

def create_session():
    response = requests.post(f"{BASE_URL}/create-session")
    response.raise_for_status()
    session_id = response.json().get("session_id")
    print(f"Created session: {session_id}")
    return session_id

def start_client(session_id, starting_page="https://www.google.com", act_prompt=None):
    payload = {
         "session_id": session_id,
         "starting_page": starting_page,
         "act_prompt": act_prompt  # Can be None if no action is needed
    }
    response = requests.post(f"{BASE_URL}/start-client", json=payload)
    response.raise_for_status()
    result = response.json()
    print(f"Started client for session {session_id} with result: {result}")
    return result

if __name__ == "__main__":
    session_id = create_session()
    # Example: start the client without a specific client action.
    # This will send __CLIENT_INIT__ and __CLIENT_START__ commands.
    start_client(session_id, starting_page="https://www.google.com")
    
    # Alternatively, if you want to perform an action (like "search for potatoes"),
    # include the act_prompt parameter:
    # start_client(session_id, starting_page="https://www.google.com", act_prompt="search for potatoes")
