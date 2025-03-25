import socket, os

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", 5001))


def send_command(command) -> str:
    """Send a command to the Python execution server and return the result."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect((HOST, PORT))
        client_socket.sendall(command.encode())
        response = client_socket.recv(1024).decode()
        return response
