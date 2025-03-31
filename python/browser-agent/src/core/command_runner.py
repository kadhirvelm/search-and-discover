import sys
import builtins
import time
import select
import os
from functools import partial
import atexit
from screenshot_socket import start_screenshot_socket, process_screenshot_requests, stop_screenshot_socket
import threading

session_id = sys.argv[1] if len(sys.argv) > 1 else "unknown"

should_exit = False
def resolve():
    global should_exit
    should_exit = True

exec_globals = {
    "__builtins__": builtins,
    "resolve": resolve,
    "print": print,
    "session_id": session_id,
}

# We override the print built-in to make sure all print statements within `exec` are flushed immediately.
print = partial(builtins.print, flush=True)

def write_logs_to_file():
    # Redirect print statements to a log file
    log_file_path = f"./logs/{exec_globals["session_id"]}.log"  # Replace with your desired log file path
    log_file = open(log_file_path, "a")
    sys.stdout = log_file

    atexit.register(log_file.close)

write_logs_to_file()

# Load NovaAct on session start.
try:
    from nova_act import NovaAct
    exec_globals["NovaAct"] = NovaAct
except Exception as e:
    print(f"[ERROR] NovaAct import failed: {e}")
    sys.exit(1)

print("[READY]")

# --- Process required commands ---

def run_command(cmd_str):
    """
    Execute an abstract client command.
    Expected formats:
      __CLIENT_INIT__[:<starting_page>]
      __CLIENT_START__
    """
    print(f"[STARTING_COMMAND] {cmd_str}")

    if cmd_str.startswith("__CLIENT_INIT__"):
        parts = cmd_str.split(":", 1)
        starting_page = parts[1].strip() if len(parts) > 1 else "https://www.amazon.com"
        exec_globals["client"] = NovaAct(starting_page=starting_page, headless=True, nova_act_api_key=os.environ.get("NOVA_ACT_API_KEY"), backend_override=os.environ.get("BACKEND_OVERRIDE"))
        print("[CLIENT_INIT executed]")
    elif cmd_str.startswith("__CLIENT_START__"):
        if "client" not in exec_globals:
            print("[ERROR] client not initialized")
            sys.exit(1)
        else:
            print("[DEBUG] Starting client")
            exec_globals["client"].start()
            print("[CLIENT_START executed]")
    else:
        print(f"[ERROR] Unknown command: {cmd_str}")
        sys.exit(1)

    print(f"[COMPLETED_COMMAND] {cmd_str}")

def start_screenshot():
    """
    Start the screenshot server.
    """
    print("[DEBUG] Starting screenshot server")
    screenshot_port = start_screenshot_socket()
    print(f"[screenshot_port]:{screenshot_port}")

    time.sleep(1)
    print("[Entering screenshot mode]")

    atexit.register(stop_screenshot_socket)

    # while not should_exit:
    #     process_screenshot_requests(exec_globals["client"])
    #     time.sleep(0.1)

def process_requests():
    while not should_exit:
        process_screenshot_requests(exec_globals["client"])

        # Use select to check if there is incoming command on stdin.
        ready, _, _ = select.select([sys.stdin], [], [], 0.05)
        if not ready:
            time.sleep(0.1)
            continue

        # Read the entire command line until the next newline
        line = sys.stdin.readline()
        if not line:
            time.sleep(0.1)
            continue

        cmd = line.strip()
        deserialized_cmd = cmd.replace("\\n", "\n").replace("\\r", "\r")
        if not deserialized_cmd:
            time.sleep(0.1)
            continue

        try:
            print(f"[STARTING_COMMAND] {cmd}")

            exec_command_global = exec_globals.copy()
            exec_command_global["print"] = partial(builtins.print, "[USER_COMMAND]", flush=True)
            # Execute the command immediately.
            result = exec(deserialized_cmd, exec_command_global)

            print(f"[COMPLETED_COMMAND] {cmd}")
            print(f"[DEBUG] Command result: {result}")
        except Exception as e:
            print("[ERROR] " + str(e))
            sys.exit(1)

def main():
    # Wait for the __CLIENT_INIT__ command.
    cmd = sys.stdin.readline().strip()
    if cmd:
        run_command(cmd)
    else:
        sys.exit(0)

    # Wait for the __CLIENT_START__ command.
    cmd = sys.stdin.readline().strip()
    if cmd:
        run_command(cmd)
    else:
        sys.exit(0)

    # --- Switch to screenshot server mode ---
    if "client" not in exec_globals:
        print("[ERROR] client not initialized after commands")
        sys.exit(1)

    print("[DEBUG] Starting screenshot server and request processor")

    # TODO: figure out how to parallelize this so it processes both at once
    start_screenshot()
    process_requests()

    print("[DEBUG] Exiting command runner")

if __name__ == "__main__":
    main()
