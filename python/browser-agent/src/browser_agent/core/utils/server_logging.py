import logging
import sys
import os

LOG_FILE = os.environ.get("LOG_FILE", "/var/tmp/sdk-app/server.logs")
LOG_FORMAT = "%(asctime)s - %(levelname)s - [%(command_id)s] %(message)s"


class SafeFormatter(logging.Formatter):
    def format(self, record):
        if not hasattr(record, "command_id"):
            record.command_id = "-"
        return super().format(record)


def setup_command_logger():
    if getattr(setup_command_logger, "_initialized", False):
        return

    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

    logger = logging.getLogger("command-server")
    logger.setLevel(logging.INFO)

    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setFormatter(SafeFormatter(LOG_FORMAT))

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(SafeFormatter(LOG_FORMAT))

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    logger.propagate = False
    setup_command_logger._initialized = True
