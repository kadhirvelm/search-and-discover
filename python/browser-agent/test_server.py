import requests

BASE_URL = "http://127.0.0.1:5000"

def create_session():
    response = requests.post(f"{BASE_URL}/create-session")
    response.raise_for_status()
    session_id = response.json().get("session_id")
    print(f"Created session: {session_id}")
    return session_id

def run_code(session_id, code):
    payload = {
        "session_id": session_id,
        "code": code
    }
    response = requests.post(f"{BASE_URL}/run-code", json=payload)
    response.raise_for_status()
    result = response.json()
    print(f"Code: {code}, Result: {result}")
    return result

if __name__ == "__main__":
    session_id = create_session()
    # run_code(session_id, "1 + 1")
    run_code(session_id, "client=NovaAct(starting_page='https://www.google.com')")
    run_code(session_id, "client.start()")
    run_code(session_id, "client.act('search for potatoes')")
