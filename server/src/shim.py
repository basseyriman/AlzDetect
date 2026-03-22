import os
import sys
import types

# 1. Force Legacy Keras before any other imports
os.environ["TF_USE_LEGACY_KERAS"] = "1"

# 2. Force Mock Addons to satisfy vit-keras on Python 3.12 (Keras 3)
# We overwrite any existing entry to ensure the mock is used
tfa = types.ModuleType('tensorflow_addons')
tfa.layers = types.ModuleType('layers')
sys.modules['tensorflow_addons'] = tfa

print("AI Shim Loaded: Purged Legacy Conflict (Local Mode)")
