from flask import Flask
import atexit

from browser_agent.api.endpoints import register_routes
from browser_agent.config import load_config
from browser_agent.core.init_server import stop_server


def create_app():
    app = Flask(__name__)
    load_config(app)
    register_routes(app)

    @atexit.register
    def shutdown_server(exception=None):
        from browser_agent.core.init_server import server_running
        if server_running:
            app.logger.info("Stopping command server...")
            stop_server()

    return app


def main():
    from browser_agent.app import create_app

    app = create_app()
    app.run(debug=True)
