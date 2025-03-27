from flask import Flask
from dotenv import load_dotenv
import atexit
import os

from api.endpoints import register_routes

def create_app():
    app = Flask(__name__)
    load_dotenv()
    register_routes(app)
    return app

def cleanup_logs():
    log_path = os.environ.get("LOG_FILE")

    if log_path:
        try:
            with open(log_path, "w"):
                pass
            print(f"Reset log file: {log_path}")
        except Exception as e:
            print(f"Failed to reset log file {log_path}: {e}")

def main():
    from app import create_app

    app = create_app()
    atexit.register(cleanup_logs)

    app.run(debug=True)

if __name__ == "__main__":
    main()
