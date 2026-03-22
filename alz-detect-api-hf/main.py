import os
import sys
import threading
from pathlib import Path

# --- Production Health & Initialization ---
def boot_sequence():
    print("--- CLINICAL ENGINE: COMMENCING BOOT ---")
    try:
        from src.api_logic import init_model
        init_model()
        print("--- CLINICAL ENGINE: ONLINE ---")
    except Exception as e:
        print(f"--- CLINICAL ENGINE: BOOT FAILED --- {e}")

# Start boot in background
threading.Thread(target=boot_sequence).start()

# --- Entry Point ---
import uvicorn
from src.server import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
