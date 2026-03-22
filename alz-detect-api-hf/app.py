import os
import sys
import types
from pathlib import Path
import threading
import io
import base64

# --- Legacy Compatibility Shim ---
os.environ["TF_USE_LEGACY_KERAS"] = "1"
tfa = types.ModuleType('tensorflow_addons')
tfa.layers = types.ModuleType('layers')
sys.modules['tensorflow_addons'] = tfa
# --------------------------------

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tensorflow as tf
import numpy as np
from PIL import Image
from vit_keras import vit
import cv2
from huggingface_hub import hf_hub_download
import gradio as gr

# Configuration
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "RimanBassey_model.h5")
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]

# Global State
MODEL = None
MODEL_READY = False
MODEL_ERROR = None

def download_and_load_model():
    global MODEL, MODEL_READY, MODEL_ERROR
    try:
        os.makedirs(MODEL_DIR, exist_ok=True)
        if not os.path.exists(MODEL_PATH):
            print("Downloading weights...")
            hf_hub_download(
                repo_id="basseyriman/alz-detect-weights",
                filename="RimanBassey_model.h5",
                local_dir=MODEL_DIR
            )
        
        print("Building ViT...")
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        base_vit = vit.vit_b32(image_size=224, pretrained=False, include_top=False, pretrained_top=False)
        x = base_vit(inputs, training=False)
        x = tf.keras.layers.Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
        x = tf.keras.layers.Dropout(0.4)(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)
        MODEL = tf.keras.Model(inputs, outputs)
        MODEL.load_weights(MODEL_PATH)
        MODEL_READY = True
        print("MODEL READY")
    except Exception as e:
        MODEL_ERROR = str(e)
        print(f"LOAD ERROR: {e}")

# Initialize FastAPI
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "healthy", "model_ready": MODEL_READY}

@app.post("/model/predict")
async def predict(file: UploadFile = File(...)):
    if not MODEL_READY:
        raise HTTPException(status_code=503, detail="Model initializing. Retry in 15s.")
    
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        preds = MODEL.predict(img_array)
        class_idx = np.argmax(preds[0])
        
        # Simple Attention Map (Mocking the 256 patches if needed, or returning original for now)
        # To avoid complex dependencies in the single file, we return a blank or original scan
        # for the first cloud test to ensure 200 OK.
        
        return {
            "predicted_class": CLASS_NAMES[class_idx],
            "class_probabilities": {CLASS_NAMES[i]: float(preds[0][i]) for i in range(4)},
            "attention_map_visualization": base64.b64encode(contents).decode('utf-8')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Gradio UI for HF Health
with gr.Blocks() as demo:
    gr.Markdown("# AlzDetect AI Engine (Cloud)")
    gr.Markdown("16GB RAM Optimized Vision Transformer")

# Mount
final_app = gr.mount_gradio_app(app, demo, path="/")

@app.on_event("startup")
async def startup():
    threading.Thread(target=download_and_load_model).start()

if __name__ == "__main__":
    uvicorn.run(final_app, host="0.0.0.0", port=7860)
