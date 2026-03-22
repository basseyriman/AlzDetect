import os
import sys
import threading
import time
from pathlib import Path

# --- Production Health & Initialization ---
# This script ensures the model loads safely in the 16GB RAM environment
def boot_sequence():
    print("--- CLINICAL ENGINE: COMMENCING BOOT ---")
    try:
        from src.api_logic import init_model
        init_model()
        print("--- CLINICAL ENGINE: ONLINE ---")
    except Exception as e:
        print(f"--- CLINICAL ENGINE: BOOT FAILED --- {e}")

# Start boot in background to satisfy HF Port binding check (200 OK)
threading.Thread(target=boot_sequence).start()

# --- Entry Point ---
import uvicorn
from src.server import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
