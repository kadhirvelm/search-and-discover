import os, socket, threading, logging, io, contextlib
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

server_running = False
exec_globals = {"__builtins__": __builtins__}

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 5001))


def handle_connection(conn: socket.socket, addr):
    with conn:
        try:
            command_id = str(uuid4())[:8]
            logger = logging.LoggerAdapter(
                logging.getLogger("command-server"), {"command_id": command_id}
            )

            data = conn.recv(4096).decode().strip()
            if not data:
                conn.sendall(b"No command provided")
                return

            logger.info("Received command: %s", data)

            if data == "STOP_SERVER":
                logger.info("Stop command received. Shutting down server...")
                conn.sendall(b"Server shutting down.")
                stop_server()
                return

            try:
                output_buffer = io.StringIO()

                try:
                    code = compile(data, "<string>", "eval")
                    with contextlib.redirect_stdout(output_buffer):
                        result = eval(code, exec_globals)
                        if result is not None:
                            print(repr(result))
                    exec_globals["_"] = result
                except SyntaxError:
                    code = compile(data, "<string>", "exec")
                    with contextlib.redirect_stdout(output_buffer):
                        exec(code, exec_globals)

                response_text = output_buffer.getvalue().strip() or "None"
                logger.info("Execution result: %s", response_text)
                conn.sendall(response_text.encode())
                conn.shutdown(socket.SHUT_WR)

            except Exception as e:
                logger.error("Execution error: %s", e)
                conn.sendall(str(e).encode())

        except Exception as e:
            fallback_logger = logging.getLogger("command-server")
            fallback_logger.error("Error handling request: %s", e)
            conn.sendall(f"Error: {e}".encode())


def start_server(host=HOST, port=PORT):
    from browser_agent.core.utils.server_logging import setup_command_logger

    setup_command_logger()

    global server_running
    server_running = True

    logger = logging.getLogger("command-server")
    logger.info("Starting command server")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        try:
            server_socket.bind((host, port))
        except OSError as e:
            logger.error("Failed to bind to %s:%s — %s", host, port, e)
            raise e

        server_socket.listen(1)
        logger.info(f"Listening on {host}:{port}")

        try:
            while server_running:
                conn, addr = server_socket.accept()
                threading.Thread(target=handle_connection, args=(conn, addr)).start()
        finally:
            logger.info("Server shutting down...")


def stop_server():
    global server_running
    server_running = False
