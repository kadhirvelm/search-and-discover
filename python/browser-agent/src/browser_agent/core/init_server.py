import socket
import sys
import io
import contextlib
import logging
import os
import signal
import threading
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 5001))

server_running = True  # Flag to control the server loop
LOG_FILE = "/var/tmp/sdk-app/server.logs"

# Ensure log directory exists
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)


class RequestIdFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, "command_id"):
            record.command_id = "-"
        return True


log_format = "%(asctime)s - %(levelname)s - [%(command_id)s] %(message)s"
logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format=log_format)

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter(log_format)
console_handler.setFormatter(console_formatter)

root_logger = logging.getLogger()  # the root logger
root_logger.addHandler(console_handler)
root_logger.addFilter(RequestIdFilter())  # ensure command_id is always set

# Persistent execution scope
exec_globals = {"__builtins__": __builtins__}


def handle_sigterm(signum, frame):
    logging.info("Received SIGTERM. Shutting down server...")
    stop_server()
    sys.exit(0)


signal.signal(signal.SIGTERM, handle_sigterm)


def handle_connection(conn: socket.socket, addr):
    """Handle a single connection in its own thread."""
    with conn:

        try:
            command_id = str(uuid4())[:8]

            logger = logging.LoggerAdapter(
                logging.getLogger(__name__), {"command_id": command_id}
            )

            data = conn.recv(4096).decode().strip()

            if not data:
                conn.sendall(b"No command provided")

            # Generate a short UUID (first 8 chars)
            command_id = str(uuid4())[:8]

            # Create a LoggerAdapter that always includes command_id
            logger = logging.LoggerAdapter(
                logging.getLogger(__name__), {"command_id": command_id}
            )

            logger.info("Received command: %s", data)

            # Handle stop command
            if data == "STOP_SERVER":
                logger.info("Stop command received. Shutting down server...")
                conn.sendall(b"Server shutting down.")
                stop_server()
                return

            # Try executing the command (expression or statement)
            try:
                output_buffer = io.StringIO()

                # Determine whether input is an expression or a statement
                try:
                    code = compile(data, "<string>", "eval")
                    with contextlib.redirect_stdout(output_buffer):
                        result = eval(code, exec_globals)
                        if result is not None:
                            print(
                                repr(result)
                            )  # Print evaluated expression like a REPL
                    exec_globals["_"] = result
                except SyntaxError:
                    # Not an expression — treat as a statement
                    code = compile(data, "<string>", "exec")
                    with contextlib.redirect_stdout(output_buffer):
                        exec(code, exec_globals)

                # Grab everything printed to stdout
                stdout_output = output_buffer.getvalue().strip()
                response_text = stdout_output if stdout_output else "None"
                response = response_text.encode()

                logger.info("Execution result: %s", response_text)

            except Exception as e:
                response = str(e).encode()
                logger.error("Execution error: %s", e)
            except socket.timeout:
                logger.error("Connection timed out")
                return

            conn.sendall(response)
            conn.shutdown(socket.SHUT_WR)

        except Exception as e:
            logging.error(f"Error handling request: {e}")
            conn.sendall(f"Error: {e}".encode())


def start_server():
    """Starts a simple TCP server to execute Python commands (multi-threaded)."""
    global server_running
    logging.info(f"Starting Python execution server on {HOST}:{PORT}")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen(1)
        logging.info(f"Python execution server running on {HOST}:{PORT}")

        try:
            while server_running:
                # Accept the connection and spawn a worker thread
                conn, addr = server_socket.accept()
                threading.Thread(target=handle_connection, args=(conn, addr)).start()
        finally:
            logging.info("Python execution server has stopped.")


def stop_server():
    global server_running
    server_running = False
    logging.info("Server is stopping...")


if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        logging.info("Server shutting down via KeyboardInterrupt.")
        sys.exit(0)
