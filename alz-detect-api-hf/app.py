import os
import sys
import types
import io
import base64
import threading
from pathlib import Path
import gradio as gr
import tensorflow as tf
from vit_keras import vit
from huggingface_hub import hf_hub_download
from PIL import Image
import numpy as np

# --- Legacy Compatibility Shim ---
os.environ["TF_USE_LEGACY_KERAS"] = "1"
tfa = types.ModuleType('tensorflow_addons')
tfa.layers = types.ModuleType('layers')
sys.modules['tensorflow_addons'] = tfa
# --------------------------------

# Configuration
MODEL_DIR = "model_weights"
MODEL_PATH = os.path.join(MODEL_DIR, "RimanBassey_model.h5")
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]

# Global State
MODEL = None
MODEL_READY = False
MODEL_ERROR = None

def load_ai_engine():
    global MODEL, MODEL_READY, MODEL_ERROR
    try:
        print("--- CLOUD ENGINE: STARTING 16GB NEURAL BOOT ---")
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR, exist_ok=True)
            
        if not os.path.exists(MODEL_PATH):
            print("--- CLOUD ENGINE: FETCHING 1.1GB WEIGHTS ---")
            hf_hub_download(
                repo_id="basseyriman/alz-detect-weights",
                filename="RimanBassey_model.h5",
                local_dir=MODEL_DIR
            )
            
        print("--- CLOUD ENGINE: BUILDING VISION TRANSFORMER ---")
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        base_vit = vit.vit_b32(image_size=224, pretrained=False, include_top=False, pretrained_top=False)
        x = base_vit(inputs, training=False)
        x = tf.keras.layers.Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
        x = tf.keras.layers.Dropout(0.4)(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)
        
        MODEL = tf.keras.Model(inputs, outputs)
        MODEL.load_weights(MODEL_PATH)
        MODEL_READY = True
        print("--- CLOUD ENGINE: 100% READY ---")
    except Exception as e:
        MODEL_ERROR = str(e)
        print(f"CRITICAL ERROR: {e}")

# Start Boot in background
threading.Thread(target=load_ai_engine).start()

# Inference Function (Used by Gradio and potentially the API endpoint)
def predict(image):
    if not MODEL_READY:
        if MODEL_ERROR:
            return f"Error: {MODEL_ERROR}"
        return "Neural Engine is currently initializing in 16GB Cloud RAM. Please wait 15 seconds."
    
    try:
        # Preprocessing
        img = Image.fromarray(image).convert("RGB").resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Prediction
        preds = MODEL.predict(img_array)
        class_idx = np.argmax(preds[0])
        confidence = float(np.max(preds[0]))
        
        result_str = f"Diagnostic Verdict: {CLASS_NAMES[class_idx]} ({confidence*100:.1f}% Confidence)"
        
        # Class probabilities for API consumers
        probs = {CLASS_NAMES[i]: float(preds[0][i]) for i in range(4)}
        
        return result_str, probs
    except Exception as e:
        return f"Inference Error: {str(e)}", {}

# --- Gradio UI (The Platform Entry Point) ---
with gr.Blocks(title="AlzDetect AI Engine") as demo:
    gr.Markdown("# 🧠 AlzDetect AI Engine (Cloud Powerhouse)")
    gr.Markdown("Vision Transformer Bi-32 optimized for neurodegenerative classification.")
    
    with gr.Row():
        input_img = gr.Image(label="Scan Volume (MRI)")
        with gr.Column():
            output_text = gr.Textbox(label="Verdict")
            output_json = gr.JSON(label="Class Distribution")
            
    btn = gr.Button("Analyze Brain Scan", variant="primary")
    btn.click(fn=predict, inputs=input_img, outputs=[output_text, output_json])

# Launch (Managed by HuggingFace, no manual uvicorn)
demo.queue()
demo.launch(server_name="0.0.0.0", server_port=7860)
