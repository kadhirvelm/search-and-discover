import subprocess
import sys
import pickle
import os

LOG_FILE = os.environ.get("LOG_FILE", "/var/tmp/search-and-discover/command_runner.logs")

def log_to_file(session_id, line):
    with open(LOG_FILE, "a") as f:
        # You can label these lines however you like:
        f.write(f"[{session_id}] {line}\n")

class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id

        self.proc = subprocess.Popen(
            [sys.executable, "-u", "src/core/utils/command_runner.py", session_id],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        self.stdin = self.proc.stdin
        self.stdout = self.proc.stdout

        # Wait for "[ready]"
        while True:
            line = self.stdout.readline()
            if not line:
                log_to_file(self.session_id, "Subprocess exited before [ready].")
                break
            log_to_file(self.session_id, f"{line.rstrip()}")
            if "[ready]" in line:
                break

    def send(self, code: str):
        """
        return: {"stdout": str, "result": object}
        """
        self.stdin.write(code + "\n")
        self.stdin.flush()

        output_lines = []
        result = None

        while True:
            line = self.stdout.readline()
            if not line:
                log_to_file(self.session_id, "No more lines while awaiting __RESULT__.")
                break

            line_stripped = line.rstrip("\n")

            if line_stripped.startswith("__RESULT__::"):
                hexdata = line_stripped.split("::", 1)[1]
                result = pickle.loads(bytes.fromhex(hexdata))
                break
            else:
                log_to_file(self.session_id, line_stripped)
                output_lines.append(line_stripped)

        return {
            "stdout": "\n".join(output_lines),
            "result": result
        }

    def close(self):
        self.send("resolve()")
        self.stdin.close()
        self.stdout.close()
        self.proc.wait()
