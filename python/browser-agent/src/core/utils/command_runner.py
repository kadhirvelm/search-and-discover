import sys
import builtins
import pickle
import contextlib
import io

session_id = sys.argv[1] if len(sys.argv) > 1 else "unknown"

should_exit = False
def resolve():
    global should_exit
    should_exit = True

exec_globals = {
    "__builtins__": builtins,
    "resolve": resolve,
}

# load NovaAct on session start
try:
    from nova_act import NovaAct
    exec_globals["NovaAct"] = NovaAct
except Exception as e:
    print(f"[error] NovaAct import failed: {e}", flush=True)

def repl_run(code_str: str, g: dict):
    """
    Emulate a basic REPL:
      - If code_str is a single expression, return its value
      - Otherwise, execute statements and return None
    """
    try:
        code = compile(code_str, "<repl>", "eval")
    except SyntaxError:
        code = compile(code_str, "<repl>", "exec")
        exec(code, g, g)
        return None
    else:
        return eval(code, g, g)

print("[ready]", flush=True)

while True:
    line = sys.stdin.readline()
    if not line:
        break

    code_str = line.strip()
    if not code_str:
        continue

    output_buffer = io.StringIO()
    with contextlib.redirect_stdout(output_buffer), contextlib.redirect_stderr(output_buffer):
        try:
            val = repl_run(code_str, exec_globals)
        except Exception as e:
            val = None
            print(f"[error] {e}")

    captured_output = output_buffer.getvalue()
    if captured_output:
        print(captured_output, end="", flush=True)

    if val is not None:
        print(repr(val), flush=True)

    encoded_val = pickle.dumps(val).hex()
    print(f"__RESULT__::{encoded_val}", flush=True)

    if should_exit:
        print("[manual resolve triggered — exiting]", flush=True)
        break
