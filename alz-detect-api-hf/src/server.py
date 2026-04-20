import os
import sys

# CRITICAL: Must be set BEFORE importing Keras/TensorFlow to ensure peak medical accuracy (198 neural weights, not Keras 3's 196) 
os.environ["TF_USE_LEGACY_KERAS"] = "1"

# 1. Global Keras 3 Compatibility Shim
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

# Import routes
from src.routes.root_route import root_route
from src.routes.model_route import model_route
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

if __name__ == "__main__":
    uvicorn.run("src.server:app", host="0.0.0.0", port=int(PORT))
