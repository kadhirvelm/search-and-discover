import subprocess
import sys
import os
import time
import select
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


# LOG_FILE = os.environ.get("LOG_FILE", "/var/tmp/search-and-discover/command_runner.logs")

class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.ensure_log_file()

        self.proc = subprocess.Popen(
            [sys.executable, "-u", "src/core/command_runner.py", session_id],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        self.stdin = self.proc.stdin

        self.screenshot_port = None

        self.last_log_position = 0
        self.watch_log_file_for("[READY]")

    def get_logs(self):
        """
        Returns the logs of the session.
        """
        log_file_path = f"./logs/{self.session_id}.log"
        with open(log_file_path, "r") as log_file:
            return log_file.read()

    def ensure_log_file(self):
        """
        Ensures the log file exists.
        """
        log_file_path = f"./logs/{self.session_id}.log"
        if not os.path.exists(log_file_path):
            with open(log_file_path, "w") as log_file:
                log_file.write("")

    def watch_log_file_for(self, break_trigger: str):
        """
        Watches the log file for any new logs lines and reacts accordingly
        """
        with open(f"./logs/{self.session_id}.log", "r") as file:
            file.seek(self.last_log_position)
            while True:
                line = file.readline()
                self.last_log_position = file.tell()
                if line.strip().startswith(break_trigger):
                    return line
                else:
                    time.sleep(0.1)

    def send(self, command: str):
        """
        Sends a command (a single line) to the command runner.
        It writes and flushes the command, waits briefly for output, and then
        drains any available output. If an error is detected in the output,
        the process exits with sys.exit(1) and the error is printed.
        Otherwise, it flushes "success" and returns a success result.
        """
        # sys.stdin.readline will keep reading until it finds a newline character, so to get our multi-line python scripts in we need to serialize and deserialize it
        # because command_runner is a continually running process
        serialized_command = command.replace("\n", "\\n").replace("\r", "\\r")
        self.stdin.write(serialized_command + "\n")
        self.stdin.flush()

        self.watch_log_file_for("[STARTING_COMMAND]")
        self.watch_log_file_for("[COMPLETED_COMMAND]")

        return {"result": "success"}
    
    def set_screenshot_port(self, log_line: str):
        port_str = log_line.split(":", 1)[1].strip()
        try:
            self.screenshot_port = int(port_str)
        except ValueError:
            print("[ERROR] Failed to parse screenshot port", flush=True)
            sys.exit(1)

    def start_client(self, starting_page: str):
        """
        Sends the explicit actions to the command runner.
        If act_prompt is provided, sends:
          1. __CLIENT_INIT__:<starting_page>
          2. __CLIENT_START__
          3. __CLIENT_ACT__:<act_prompt>
        Otherwise, sends only __CLIENT_INIT__ and __CLIENT_START__.
        After these commands, the runner immediately switches into screenshot mode.
        """
        res_init = self.send(f"__CLIENT_INIT__:{starting_page}")
        res_start = self.send("__CLIENT_START__")

        screenshot_port = self.watch_log_file_for("[screenshot_port]:")
        self.set_screenshot_port(screenshot_port)

        return {"init": res_init, "start": res_start, "screenshot_port": self.screenshot_port}

    def close(self):
        self.send("resolve()")
        self.observer.stop()
        self.observer.join()
