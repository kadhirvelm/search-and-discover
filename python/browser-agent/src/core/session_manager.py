import uuid
from typing import Dict
from core.session import Session

_sessions: Dict[str, Session] = {}

def generate_session_id() -> str:
    return uuid.uuid4().hex[:8]

def create_session() -> str:
    session_id = generate_session_id()
    session = Session(session_id)
    _sessions[session_id] = session
    return session_id

def get_session(session_id: str) -> Session:
    session = _sessions.get(session_id)
    if not session:
        raise ValueError(f"Session '{session_id}' not found.")
    return session

def send_command(session_id: str, code: str) -> str:
    session = get_session(session_id)
    return session.send(code)

def close_session(session_id: str):
    session = _sessions.pop(session_id, None)
    if session:
        session.close()
