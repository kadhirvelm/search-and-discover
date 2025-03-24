from flask import request, jsonify
from browser_agent.core.utils.send_command import send_command
from browser_agent.core.init_server import start_server


def register_routes(app):
    @app.route("/run-command", methods=["POST"])
    def run_command():
        data = request.get_json()
        command = data.get("command")

        if not command:
            return jsonify({"error": "Missing command"}), 400

        result = send_command(command)
        return jsonify({"result": result})

    @app.route("/start-server", methods=["POST"])
    def start_python_server():
        start_server()  # wait to see if ready

        return jsonify({"status": "ready"})
