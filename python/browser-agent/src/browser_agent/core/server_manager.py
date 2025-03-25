import os
import socket
import threading
import logging
import io
import contextlib
from uuid import uuid4

from browser_agent.core.utils.server_logging import setup_command_logger

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", 5001))

class CommandServerManager:
    def __init__(self, host=HOST, port=PORT):
        self.host = host
        self.port = port
        self._thread = None
        self._should_run = threading.Event()
        self._is_running = threading.Event()
        
        setup_command_logger()
        self.logger = logging.getLogger("command-server")


    def start(self):
        if self._thread and self._thread.is_alive():
            self.logger.info("Command server already running.")
            return

        self._should_run.set()
        self._thread = threading.Thread(target=self._run_server, daemon=True)
        self._thread.start()

    def stop(self):
        self._should_run.clear()
        self._is_running.clear()
        self.logger.info("Command server stop requested.")

    def is_running(self):
        return self._is_running.is_set()

    def is_responding(self, timeout=0.5):
        try:
            with socket.create_connection((self.host, self.port), timeout=timeout):
                return True
        except (ConnectionRefusedError, socket.timeout, OSError):
            return False

    def _run_server(self):
        self.logger.info(f"Starting command server on {self.host}:{self.port}")
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            try:
                server_socket.bind((self.host, self.port))
                server_socket.listen(1)
                self._is_running.set()
                self.logger.info(f"Listening on {self.host}:{self.port}")
            except OSError as e:
                self.logger.error("Failed to bind to %s:%s — %s", self.host, self.port, e)
                self._is_running.clear()
                return

            while self._should_run.is_set():
                try:
                    server_socket.settimeout(1.0)
                    conn, addr = server_socket.accept()
                    threading.Thread(target=self._handle_connection, args=(conn, addr), daemon=True).start()
                except socket.timeout:
                    continue

        self.logger.info("Command server shut down.")

    def _handle_connection(self, conn, addr):
        with conn:
            command_id = str(uuid4())[:8]
            logger = logging.LoggerAdapter(self.logger, {"command_id": command_id})
            try:
                data = conn.recv(4096).decode().strip()
                if not data:
                    conn.sendall(b"No command provided")
                    return

                logger.info("Received command: %s", data)

                if data == "STOP_SERVER":
                    logger.info("Stop command received. Shutting down server...")
                    conn.sendall(b"Server shutting down.")
                    self.stop()
                    return

                output_buffer = io.StringIO()
                try:
                    code = compile(data, "<string>", "eval")
                    with contextlib.redirect_stdout(output_buffer):
                        result = eval(code, {"__builtins__": __builtins__})
                        if result is not None:
                            print(repr(result))
                except SyntaxError:
                    code = compile(data, "<string>", "exec")
                    with contextlib.redirect_stdout(output_buffer):
                        exec(code, {"__builtins__": __builtins__})

                stdout_output = output_buffer.getvalue().strip()
                response = (stdout_output or "None").encode()
                logger.info("Execution result: %s", stdout_output)
                conn.sendall(response)

            except Exception as e:
                logger.error("Execution error: %s", e)
                conn.sendall(str(e).encode())
