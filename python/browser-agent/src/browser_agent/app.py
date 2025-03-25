import time
from flask import Flask
import atexit
import logging
import os

from browser_agent.api.endpoints import register_routes
from browser_agent.config import load_config
from browser_agent.core.singletons.server_state import command_server

def create_app():
    app = Flask(__name__)
    load_config(app)
    register_routes(app)

    @atexit.register
    def shutdown_server(exception=None):
        app.logger.info("Stopping command server...")
        command_server.stop()

    return app


def main():
    from browser_agent.app import create_app

    app = create_app()

    # only start server in the main serving process
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true": 
        command_server.start()
        for _ in range(50):
            if command_server.is_responding():
                break
            time.sleep(0.1)
        else:
            logging.getLogger("command-server").error("Command server failed to respond on port 5001")


    app.run(debug=True)
