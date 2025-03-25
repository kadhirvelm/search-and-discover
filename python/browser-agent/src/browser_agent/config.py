from dotenv import load_dotenv
import os


def load_config(app=None):
    load_dotenv()

    config = {
        "HOST": os.environ.get("HOST"),
        "PORT": os.environ.get("PORT"),
        "LOG_FILE": os.environ.get("LOG_FILE")
    }

    if app:
        app.config.update(config)

    return config
