import time

from core.screenshot_socket import get_screenshot_from_socket

def generate_mpng_frames(session_id, port, host="127.0.0.1", sleep_time=0.1):
    if not port:
        print(f"No port provided for session {session_id}")
        return
    while True:
        try:
            frame = get_screenshot_from_socket(host, port)
            yield (b"--frame\r\n"
                   b"Content-Type: image/png\r\n\r\n" + frame + b"\r\n")
            time.sleep(sleep_time)
        except Exception as e:
            print(f"Error generating frame for session {session_id}: {e}")
            break
