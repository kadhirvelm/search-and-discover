from flask import request, jsonify
from browser_agent.core.create_session import create_new_session
from browser_agent.core.utils.send_command import send_command
from browser_agent.core.singletons.server_state import command_server

def register_routes(app):
    @app.route("/run-command", methods=["POST"])
    def run_command():
        data = request.get_json()
        command = data.get("command")

        if not command:
            return jsonify({"error": "Missing command"}), 400

        result = send_command(command)
        return jsonify({"result": result})
    
    @app.route("/create-session", methods=["POST"])
    def create_session():
        new_session_id = create_new_session()
        return jsonify({"session_id": new_session_id})

    @app.route("/server-health", methods=["GET"])
    def server_health():
        return jsonify({
            "running": command_server.is_running(),
            "responding": command_server.is_responding()
        }), 200 if command_server.is_responding() else 503

