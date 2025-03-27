from flask import request, jsonify
from core.session_manager import create_session, close_session, send_command

def register_routes(app):
    @app.route("/run-code", methods=["POST"])
    def run_code():
        data = request.get_json()
        session_id = data.get("session_id")
        code = data.get("code")

        if not session_id:
            return jsonify({"error": "Missing session_id"}), 400
        if not code:
            return jsonify({"error": "Missing code"}), 400

        result = send_command(session_id, code)
        return jsonify({"result": result})
    
    @app.route("/create-session", methods=["POST"])
    def create_new_session():
        new_session_id = create_session()
        return jsonify({"session_id": new_session_id})
    
    @app.route("/end-session", methods=["POST"])
    def close_existing_session():
        data = request.get_json()
        session_id = data.get("session_id")

        if not session_id:
            return jsonify({"error": "Missing session id"})
        
        close_session(session_id)
        return jsonify({"success": True})
