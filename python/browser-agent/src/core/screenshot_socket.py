import socket
import threading
import queue
import time
from PIL import Image
import io

screenshot_requests = queue.Queue()
server_sock_global = None

def start_screenshot_socket(host="127.0.0.1", port=0):
    print(f"[DEBUG] starting screenshot socket for {port} port")
    global server_sock_global
    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    print(f"[DEBUG] trying to bind to port")
    server_sock.bind((host, port))
    print(f"[DEBUG] bound to port")
    server_sock.listen(5)
    server_sock_global = server_sock
    actual_port = server_sock.getsockname()[1]

    def accept_loop():
        while True:
            try:
                conn, addr = server_sock.accept()
                # print("[DEBUG] New connection from", addr, flush=True)
                screenshot_requests.put(conn)
            except OSError:
                break  # socket closed

    threading.Thread(target=accept_loop, daemon=True).start()
    return actual_port


def stop_screenshot_socket():
    global server_sock_global
    if server_sock_global:
        server_sock_global.close()
        server_sock_global = None


def process_screenshot_requests(client):
    while not screenshot_requests.empty():
        conn = screenshot_requests.get()
        try:
            screenshot = client.page.screenshot(type="png")
            dimensions = client.page.evaluate("() => ({ width: window.innerWidth, height: window.innerHeight })")

            image = Image.open(io.BytesIO(screenshot))  # Open the screenshot as an image
            resized_image = image.resize((dimensions["width"], dimensions["height"]))  # Resize the image
            output_buffer = io.BytesIO()
            resized_image.save(output_buffer, format="PNG")
            resized_screenshot = output_buffer.getvalue()

            # print(f"[DEBUG] Captured screenshot size: {len(screenshot)} bytes", flush=True)
            conn.sendall(resized_screenshot)
        except Exception as e:
            print(f"[DEBUG] Screenshot error: {e}", flush=True)
        finally:
            conn.close()


def get_screenshot_from_socket(host, port, retries=5, delay=0.1):
    for i in range(retries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((host, port))
            break
        except ConnectionRefusedError:
            time.sleep(delay)
    else:
        raise ConnectionRefusedError("Unable to connect to screenshot socket after retries.")
    
    # print("[DEBUG] Connected to screenshot socket", flush=True)
    data = b""
    while True:
        chunk = sock.recv(4096)
        if not chunk:
            break
        data += chunk
    sock.close()
    # print(f"[DEBUG] Received screenshot size: {len(data)} bytes", flush=True)
    return data

