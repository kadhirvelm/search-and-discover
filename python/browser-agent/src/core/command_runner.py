import sys
import builtins
import time
import select

from screenshot_socket import start_screenshot_socket, process_screenshot_requests, stop_screenshot_socket

session_id = sys.argv[1] if len(sys.argv) > 1 else "unknown"

should_exit = False
def resolve():
    global should_exit
    should_exit = True

exec_globals = {
    "__builtins__": builtins,
    "resolve": resolve,
}

# Load NovaAct on session start.
try:
    from nova_act import NovaAct
    exec_globals["NovaAct"] = NovaAct
except Exception as e:
    print(f"[error] NovaAct import failed: {e}", flush=True)
    sys.exit(1)

def run_command(cmd_str):
    """
    Execute an abstract client command.
    Expected formats:
      __CLIENT_INIT__[:<starting_page>]
      __CLIENT_START__
      __CLIENT_ACT__[:<prompt>]
    """
    if cmd_str.startswith("__CLIENT_INIT__"):
        parts = cmd_str.split(":", 1)
        starting_page = parts[1].strip() if len(parts) > 1 else "https://www.google.com"
        exec_globals["client"] = NovaAct(starting_page=starting_page)
        print("[CLIENT_INIT executed]", flush=True)
    elif cmd_str.startswith("__CLIENT_START__"):
        if "client" not in exec_globals:
            print("[error] client not initialized", flush=True)
        else:
            exec_globals["client"].start()
            print("[CLIENT_START executed]", flush=True)
    elif cmd_str.startswith("__CLIENT_ACT__"):
        if "client" not in exec_globals:
            print("[error] client not initialized", flush=True)
        else:
            parts = cmd_str.split(":", 1)
            prompt = parts[1].strip() if len(parts) > 1 else ""
            result = exec_globals["client"].act(prompt)
            print("[CLIENT_ACT executed]", flush=True)
    else:
        print(f"[error] Unknown command: {cmd_str}", flush=True)

print("[ready]", flush=True)

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

# Try to read a __CLIENT_ACT__ command within a timeout (optional).
ready, _, _ = select.select([sys.stdin], [], [], 1.0)
if ready:
    cmd = sys.stdin.readline().strip()
    if cmd:
        run_command(cmd)
        act_provided = True
    else:
        act_provided = False
else:
    act_provided = False

# --- Switch to screenshot server mode ---
if "client" not in exec_globals:
    print("[error] client not initialized after commands", flush=True)
    sys.exit(1)
    
client_obj = exec_globals["client"]
screenshot_port = start_screenshot_socket(client_obj)
print(f"[screenshot_port]:{screenshot_port}", flush=True)
print("[Entering screenshot mode]", flush=True)

while not should_exit:
    # Use select to check if there is incoming command on stdin.
    ready, _, _ = select.select([sys.stdin], [], [], 0.05)
    if ready:
        # A command arrived; exit screenshot mode.
        print("[DEBUG] Command received, exiting screenshot mode.", flush=True)
        stop_screenshot_socket()
        # Read the entire command line.
        line = sys.stdin.readline()
        if line:
            cmd = line.strip()
            if cmd:
                try:
                    # Execute the command immediately.
                    exec(cmd, exec_globals)
                    print("success", flush=True)
                except Exception as e:
                    print("[error] " + str(e), flush=True)
                    sys.exit(1)
        # Reinitialize screenshot mode.
        screenshot_port = start_screenshot_socket(client_obj, port=screenshot_port)
        print(f"[screenshot_port]:{screenshot_port}", flush=True)
        print("[Re-entering screenshot mode]", flush=True)
        time.sleep(0.5)
    # Otherwise, continuously process pending screenshot requests.
    process_screenshot_requests(client_obj)
    time.sleep(0.1)

print("[Exiting screenshot mode]", flush=True)