import os
import sys
import types
from pathlib import Path
import threading
from huggingface_hub import hf_hub_download

# --- Legacy Compatibility Shim for vit-keras ---
# Ensure this is set before any tensorflow imports
os.environ["TF_USE_LEGACY_KERAS"] = "1"
tfa = types.ModuleType('tensorflow_addons')
tfa.layers = types.ModuleType('layers')
sys.modules['tensorflow_addons'] = tfa
# -----------------------------------------------

from fastapi import APIRouter, File, UploadFile, HTTPException
import tensorflow as tf
import numpy as np
from PIL import Image
from vit_keras import vit
import cv2

model_route = APIRouter(prefix="/model", tags=["model"])

# Configuration
CURRENT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = CURRENT_DIR.parent.parent
MODEL_DIR = os.path.join(PROJECT_ROOT, 'src', "model")
MODEL_PATH = os.path.join(MODEL_DIR, "RimanBassey_model.h5")

# Global State
MODEL = None
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]
MODEL_LOADING = False
MODEL_READY = False
MODEL_ERROR = None

def download_and_load_model():
    """Background task to fetch weights and build the neural net."""
    global MODEL, MODEL_LOADING, MODEL_READY, MODEL_ERROR
    if MODEL_READY: return
    
    MODEL_LOADING = True
    print("Background Task: Initiating 1.05GB Weight Retrieval...")
    
    try:
        # 1. Ensure directory exists
        os.makedirs(MODEL_DIR, exist_ok=True)
        
        # 2. Download from Model Hub if not present
        if not os.path.exists(MODEL_PATH):
            print(f"Downloading weights from basseyriman/alz-detect-weights...")
            hf_hub_download(
                repo_id="basseyriman/alz-detect-weights",
                filename="RimanBassey_model.h5",
                local_dir=MODEL_DIR
            )
        
        # 3. Build & Load Model
        print("Building Vision Transformer (ViT-B32)...")
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        base_vit = vit.vit_b32(
            image_size=224,
            pretrained=False,
            include_top=False,
            pretrained_top=False
        )
        x = base_vit(inputs, training=False)
        x = tf.keras.layers.Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
        x = tf.keras.layers.Dropout(0.4)(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)

        MODEL = tf.keras.Model(inputs, outputs)
        MODEL.load_weights(MODEL_PATH)
        
        MODEL_READY = True
        MODEL_LOADING = False
        print("Model state: READY (16GB RAM Optimized)")
        
    except Exception as e:
        MODEL_ERROR = str(e)
        MODEL_LOADING = False
        print(f"CRITICAL MODEL LOAD ERROR: {e}")
        import traceback
        traceback.print_exc()

def load_model_if_needed():
    """Triggered by inference requests."""
    global MODEL, MODEL_READY, MODEL_ERROR
    if not MODEL_READY:
        if MODEL_ERROR:
            raise HTTPException(status_code=500, detail=f"Model failed to load: {MODEL_ERROR}")
        # If still loading, wait or return 503 with helpful message
        raise HTTPException(status_code=503, detail="Model is still loading into cloud RAM. Please retry in 30 seconds.")

@model_route.get('/status')
async def get_status():
    return {
        "ready": MODEL_READY,
        "loading": MODEL_LOADING,
        "error": MODEL_ERROR,
        "memory_info": "16GB RAM Optimized"
    }

@model_route.get('/')
async def get_info():
    return {"Model": "Vision Transformers", "Status": "Active" if MODEL_READY else "Initializing"}

@model_route.post('/predict')
async def predict_model(file: UploadFile):
    load_model_if_needed()
    try:
        file_content = await file.read()
        img = Image.open(io.BytesIO(file_content)).convert("RGB").resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        with tf.device('/CPU:0'):
            prediction = MODEL.predict(img_array, batch_size=1)
        
        predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))

        return {
            "file_name": file.filename,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "ready": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import io # Add missing import for predict
