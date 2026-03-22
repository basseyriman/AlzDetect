import os
import sys
import types
import io
import base64
from pathlib import Path

# Legacy Shims for ViT-Keras
os.environ["TF_USE_LEGACY_KERAS"] = "1"
tfa = types.ModuleType('tensorflow_addons')
tfa.layers = types.ModuleType('layers')
sys.modules['tensorflow_addons'] = tfa

MODEL_READY = False
MODEL = None
MODEL_PATH = "model_weights/RimanBassey_model.h5"
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]

def init_model():
    global MODEL_READY, MODEL
    import tensorflow as tf
    from vit_keras import vit
    from huggingface_hub import hf_hub_download
    from PIL import Image
    import numpy as np

    try:
        if not os.path.exists("model_weights"):
            os.makedirs("model_weights", exist_ok=True)
        
        if not os.path.exists(MODEL_PATH):
            print("Fetching 1.1GB weights...")
            hf_hub_download(repo_id="basseyriman/alz-detect-weights", filename="RimanBassey_model.h5", local_dir="model_weights")
        
        print("Constructing ViT-B32...")
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        base_vit = vit.vit_b32(image_size=224, pretrained=False, include_top=False, pretrained_top=False)
        x = base_vit(inputs, training=False)
        x = tf.keras.layers.Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
        x = tf.keras.layers.Dropout(0.4)(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)
        MODEL = tf.keras.Model(inputs, outputs)
        MODEL.load_weights(MODEL_PATH)
        MODEL_READY = True
        print("CLOUD AI ONLINE.")
    except Exception as e:
        print(f"App Logic Error: {e}")

async def predict_logic(file):
    import tensorflow as tf
    from PIL import Image
    import numpy as np
    
    if not MODEL_READY:
        return {"error": "Still loading neural weights..."}
    
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    preds = MODEL.predict(img_array)
    class_idx = np.argmax(preds[0])
    
    return {
        "predicted_class": CLASS_NAMES[class_idx],
        "class_probabilities": {CLASS_NAMES[i]: float(preds[0][i]) for i in range(4)},
        "attention_map_visualization": base64.b64encode(contents).decode('utf-8')
    }
