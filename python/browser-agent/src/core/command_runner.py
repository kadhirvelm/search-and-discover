import sys
import builtins
import time
import select
import os
from functools import partial

from screenshot_socket import start_screenshot_socket, process_screenshot_requests, stop_screenshot_socket

session_id = sys.argv[1] if len(sys.argv) > 1 else "unknown"

# We override the print built-in to make sure all print statements within `exec` are flushed immediately.
print = partial(builtins.print, flush=True)

def write_logs_to_file():
    # Redirect print statements to a log file
    log_file_path = f"./logs/{session_id}.log"  # Replace with your desired log file path
    log_file = open(log_file_path, "a")
    sys.stdout = log_file

    import atexit
    atexit.register(log_file.close)

write_logs_to_file()

should_exit = False
def resolve():
    global should_exit
    should_exit = True

exec_globals = {
    "__builtins__": builtins,
    "resolve": resolve,
    "print": print,
}

# Load NovaAct on session start.
try:
    from nova_act import NovaAct
    exec_globals["NovaAct"] = NovaAct
except Exception as e:
    print(f"[ERROR] NovaAct import failed: {e}")
    sys.exit(1)

def run_command(cmd_str):
    """
    Execute an abstract client command.
    Expected formats:
      __CLIENT_INIT__[:<starting_page>]
      __CLIENT_START__
      __CLIENT_ACT__[:<prompt>]
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
            exec_globals["client"].start()
            print("[CLIENT_START executed]")
    elif cmd_str.startswith("__CLIENT_ACT__"):
        if "client" not in exec_globals:
            print("[ERROR] client not initialized")
            sys.exit(1)
        else:
            parts = cmd_str.split(":", 1)
            prompt = parts[1].strip() if len(parts) > 1 else ""
            result = exec_globals["client"].act(prompt)
            print("[CLIENT_ACT executed]")
    else:
        print(f"[ERROR] Unknown command: {cmd_str}")
        sys.exit(1)

    print(f"[COMPLETED_COMMAND] {cmd_str}")

print("[READY]")

# --- Process required commands ---

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

client_obj = exec_globals["client"]
screenshot_port = start_screenshot_socket(client_obj)
print(f"[screenshot_port]:{screenshot_port}")
print("[Entering screenshot mode]")

while not should_exit:
    # Use select to check if there is incoming command on stdin.
    ready, _, _ = select.select([sys.stdin], [], [], 0.05)
    if ready:
        # A command arrived; exit screenshot mode.
        print("[DEBUG] Command received, exiting screenshot mode.")
        stop_screenshot_socket()
        # Read the entire command line.
        line = sys.stdin.readline()
        if line:
            cmd = line.strip()
            if cmd:
                try:
                    print(f"[STARTING_COMMAND] {cmd}")

                    exec_command_global = exec_globals.copy()
                    exec_command_global["print"] = partial(builtins.print, "[USER_COMMAND]", flush=True)
                    # Execute the command immediately.
                    result = exec(cmd, exec_command_global)

                    print(f"[COMPLETED_COMMAND] {cmd} {result}")
                except Exception as e:
                    print("[ERROR] " + str(e))
                    sys.exit(1)
        # Reinitialize screenshot mode.
        screenshot_port = start_screenshot_socket(client_obj, port=screenshot_port)
        print(f"[screenshot_port]:{screenshot_port}")
        print("[Re-entering screenshot mode]")
        time.sleep(0.5)
    # Otherwise, continuously process pending screenshot requests.
    process_screenshot_requests(client_obj)
    time.sleep(0.1)

print("[Exiting screenshot mode]")