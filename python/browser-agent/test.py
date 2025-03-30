import os
from dotenv import load_dotenv
from nova_act import NovaAct
from multiprocessing import Process
import asyncio

load_dotenv()

# def test_1(shared_dict):
#     log_file_path = f"./test.log"  # Replace with your desired log file path
#     log_file = open(log_file_path, "a")

#     log_file.write(f"[DEBUG] Process ID: test-1\n")
#     log_file.write(f"[DEBUG] Session ID: {shared_dict['session_id']}\n")
#     log_file.write(f"[DEBUG] Client: {shared_dict['client']}\n")

# def test_2(shared_dict):
#     log_file_path = f"./test-2.log"  # Replace with your desired log file path
#     log_file = open(log_file_path, "a")

#     log_file.write(f"[DEBUG] Process ID: test-2\n")
#     log_file.write(f"[DEBUG] Session ID: {shared_dict['session_id']}\n")
#     log_file.write(f"[DEBUG] Client: {shared_dict['client']}\n")

# if __name__ == '__main__':
#     shared_dict = { "session_id": "some_session_id", "client": client }

#     process_one = Process(target=test_1, args=(shared_dict,))
#     process_two = Process(target=test_2, args=(shared_dict,))

#     process_one.start()
#     process_two.start()

if __name__ == "__main__":
    client = NovaAct(starting_page="https://www.amazon.com", headless=True, nova_act_api_key=os.environ.get("NOVA_ACT_API_KEY"), backend_override=os.environ.get("BACKEND_OVERRIDE"))
    client.start()

    print(dir(client.page.context))
