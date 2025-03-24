from flask import Flask
from browser_agent.api.endpoints import register_routes
from browser_agent.config import load_config


def create_app():
    app = Flask(__name__)
    load_config(app)
    register_routes(app)
    return app


def main():
    from browser_agent.app import create_app

    app = create_app()
    app.run(debug=True)
