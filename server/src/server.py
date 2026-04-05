import os
import sys

# 1. Global Keras 3 Compatibility Shim for Keras 2 environments
import keras
if not hasattr(keras, "ops"):
    import tensorflow as tf
    class KerasOpsShim:
        def __getattr__(self, name):
            return getattr(tf, name)
        @property
        def shape(self):
            import tensorflow as tf
            return tf.shape
    keras.ops = KerasOpsShim()

import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import routes and loading function
from src.routes.root_route import root_route
from src.routes.model_route import model_route, load_model_if_needed
from src.routes.test_route import test_route

load_dotenv()
PORT = os.getenv("PORT", "8000")  # Default to 8000 if PORT not set
app = FastAPI(
    title="Alzheimer's Detection API",
    description="API for detecting Alzheimer's disease from brain MRI scans using Vision Transformers",
    version="1.0.0"
)

# Configure CORS
origins = ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Include all routes
app.include_router(root_route, prefix="", tags=["root"])
app.include_router(model_route)
app.include_router(test_route)

@app.get("/debug_env")
async def debug_env():
    import tensorflow as tf
    import keras
    try:
        import tf_keras
        tf_keras_ver = tf_keras.__version__
    except ImportError:
        tf_keras_ver = "Not Installed"
        
    return {
        "tensorflow": tf.__version__,
        "keras": keras.__version__,
        "tf_keras": tf_keras_ver,
        "python": sys.version
    }

@app.on_event("startup")
async def startup_event():
    print("Pre-loading model on startup...")
    # This ensures the 1GB model is in RAM before the first request
    try:
        load_model_if_needed()
        print("Model pre-loaded successfully!")
    except Exception as e:
        print(f"FAILED to pre-load model: {e}")

if __name__ == "__main__":
    uvicorn.run("src.server:app", host="0.0.0.0", port=int(PORT))
