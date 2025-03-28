from flask import Response, request, jsonify, stream_with_context
from core.session_manager import create_session, close_session, get_all_session_ids, get_session, send_command
from core.generate_jpeg_frame import generate_mjpeg_frames

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
    
    @app.route("/start-client", methods=["POST"])
    def start_client():
        """
        Starts the client in the session.
        If an act prompt is supplied, then the following actions are sent in order:
          __CLIENT_INIT__:<starting_page>
          __CLIENT_START__
          __CLIENT_ACT__:<act_prompt>
        Otherwise, only __CLIENT_INIT__ and __CLIENT_START__ are sent.
        After these commands, the command runner immediately switches into screenshot mode.
        """
        data = request.get_json()
        session_id = data.get("session_id")
        starting_page = data.get("starting_page", "https://www.google.com")
        act_prompt = data.get("act_prompt")  # May be None
        if not session_id:
            return jsonify({"error": "Missing session_id"}), 400
        try:
            session = get_session(session_id)
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
        result = session.start_client(starting_page, act_prompt)
        return jsonify({"result": result})
    
    @app.route("/create-session", methods=["POST"])
    def create_new_session():
        new_session_id = create_session()
        return jsonify({"session_id": new_session_id})

    @app.route("/list-sessions", methods=["GET"])
    def list_sessions():
        """
        Returns a JSON list of currently active session IDs.
        """
        session_ids = get_all_session_ids()
        return jsonify({"sessions": session_ids})
    
    @app.route("/end-session", methods=["POST"])
    def close_existing_session():
        data = request.get_json()
        session_id = data.get("session_id")

        if not session_id:
            return jsonify({"error": "Missing session id"})
        
        close_session(session_id)
        return jsonify({"success": True})
    
    @app.route("/session/<string:session_id>/stream.mjpeg", methods=["GET"])
    def stream_mjpeg(session_id):
        try:
            session = get_session(session_id) 
            port = session.screenshot_port
            if not port:
                return jsonify({"error": f"Session '{session_id}' is not ready yet"})
        except Exception:
            return jsonify({"error": f"Session '{session_id}' not found or no socket available."}), 404

        return Response(
            stream_with_context(generate_mjpeg_frames(session_id, port)),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
