import os
import sys
import types
from pathlib import Path

# Add the project root to the Python path
PROJECT_ROOT = Path(__file__).parent.absolute()
sys.path.append(str(PROJECT_ROOT))

# 1. Force Legacy Keras mode at the very start of the process
os.environ["TF_USE_LEGACY_KERAS"] = "1"

# 2. Force Mock Addons to satisfy vit-keras on Python 3.12 (Keras 3)
tfa = types.ModuleType('tensorflow_addons')
tfa.layers = types.ModuleType('layers')
sys.modules['tensorflow_addons'] = tfa

print("Atomic AI Boot: Legacy Keras Mode + Dummy Addons Active")

# 3. Now it is safe to import and run the server
try:
    import uvicorn
    from src.server import app
    print("AI Engine initialized successfully. Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
except Exception as e:
    print(f"CRITICAL BOOT ERROR: {e}")
    import traceback
    traceback.print_exc()
