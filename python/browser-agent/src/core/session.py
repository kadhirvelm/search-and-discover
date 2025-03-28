import subprocess
import sys
import os
import time
import select

LOG_FILE = os.environ.get("LOG_FILE", "/var/tmp/search-and-discover/command_runner.logs")

def log_to_file(session_id, line):
    with open(LOG_FILE, "a") as f:
        f.write(f"[{session_id}] {line}\n")

class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.proc = subprocess.Popen(
            [sys.executable, "-u", "src/core/command_runner.py", session_id],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        self.stdin = self.proc.stdin
        self.stdout = self.proc.stdout

        self.screenshot_port = None

        # Wait for the "[ready]" message.
        while True:
            line = self.stdout.readline()
            if not line:
                # Subprocess exited prematurely.
                break
            # Optionally, log the output:
            # log_to_file(self.session_id, line.rstrip())
            if "[ready]" in line:
                break

    def send(self, command: str):
        """
        Sends a command (a single line) to the command runner.
        It writes and flushes the command, waits briefly for output, and then
        drains any available output. If an error is detected in the output,
        the process exits with sys.exit(1) and the error is printed.
        Otherwise, it flushes "success" and returns a success result.
        """
        self.stdin.write(command + "\n")
        self.stdin.flush()

        # Allow a brief delay for the command to process.
        time.sleep(0.1)
        output_lines = []

        # Use select to non-blockingly drain available output.
        while True:
            ready, _, _ = select.select([self.stdout], [], [], 0.05)
            if ready:
                line = self.stdout.readline()
                if not line:
                    break
                output_lines.append(line.rstrip("\n"))
            else:
                break

        # If any output line starts with "[error]", exit with failure.
        for line in output_lines:
            if line.startswith("[error]"):
                sys.exit(1)
        print(f"{command} ran successfully", flush=True)
        return {"stdout": "\n".join(output_lines), "result": "success"}

    def start_client(self, starting_page: str, act_prompt: str = None):
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
        res_act = None
        if act_prompt:
            res_act = self.send(f"__CLIENT_ACT__:{act_prompt}")

        while True:
            line = self.stdout.readline()
            if not line:
                break
            if line.startswith("[screenshot_port]:"):
                port_str = line.split(":", 1)[1].strip()
                try:
                    self.screenshot_port = int(port_str)
                    print(f"[DEBUG] Stored screenshot port: {self.screenshot_port}", flush=True)
                except ValueError:
                    print("[error] Failed to parse screenshot port", flush=True)
                    sys.exit(1)
                break

        return {"init": res_init, "start": res_start, "act": res_act}

    def close(self):
        self.send("resolve()")
        self.stdin.close()
        self.stdout.close()
        self.proc.wait()
