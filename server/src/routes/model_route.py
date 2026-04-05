import io
import os
import sys
import types
import base64
from pathlib import Path

# 1. ROBUST KERAS 3 SHIM (Unconditional + SysModule Injection)
import keras
import tensorflow as tf
import sys

class KerasOpsShim:
    def __init__(self, original_ops=None):
        self.original_ops = original_ops
    def __getattr__(self, name):
        import tensorflow as tf
        # Direct mappings for Keras 3 -> TF 2
        if name == "concatenate":
            return tf.concat
        if name == "stack":
            return tf.stack
        # Use existing op if it exists, else fall back to tf
        if self.original_ops and hasattr(self.original_ops, name):
            return getattr(self.original_ops, name)
        return getattr(tf, name)
    @property
    def shape(self):
        import tensorflow as tf
        return tf.shape

# Apply shim even if ops already exist to ensure all ops are mapped correctly
keras.ops = KerasOpsShim(getattr(keras, "ops", None))
sys.modules["keras.ops"] = keras.ops
if "tensorflow.keras" in sys.modules:
    sys.modules["tensorflow.keras.ops"] = keras.ops


# 2. COMPLETE TFA MOCK
if "tensorflow_addons" not in sys.modules:
    import tensorflow as tf
    _tfa = types.ModuleType("tensorflow_addons")
    _tfa.layers = types.ModuleType("tensorflow_addons.layers")
    _tfa.optimizers = types.ModuleType("tensorflow_addons.optimizers")
    _tfa.activations = types.ModuleType("tensorflow_addons.activations")
    _tfa.activations.gelu = tf.nn.gelu
    sys.modules["tensorflow_addons"] = _tfa
    sys.modules["tensorflow_addons.layers"] = _tfa.layers
    sys.modules["tensorflow_addons.optimizers"] = _tfa.optimizers
    sys.modules["tensorflow_addons.activations"] = _tfa.activations

import tensorflow as tf
# Monkey-patch tf.keras for TF 2.16+ where tf.keras is removed when using legacy Keras
try:
    import tf_keras
    tf.keras = tf_keras
    sys.modules["tensorflow.keras"] = tf_keras
except ImportError:
    pass

from fastapi import APIRouter, File, UploadFile, HTTPException
from rich.pretty import pprint
import tensorflow as tf
import numpy as np
from PIL import Image
from vit_keras import vit
import matplotlib.pyplot as plt
import cv2

model_route = APIRouter(prefix="/model", tags=["model"])

# Get the absolute path to the model file
CURRENT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = CURRENT_DIR.parent.parent
MODEL_PATH = os.path.join(PROJECT_ROOT, 'src', "model", "RimanBassey_model.h5")


# Defining custom F1 Score metric
class F1Score(tf.keras.metrics.Metric):
    def __init__(self, name="f1_score", **kwargs):
        super(F1Score, self).__init__(name=name, **kwargs)
        self.precision = tf.keras.metrics.Precision()
        self.recall = tf.keras.metrics.Recall()

    def update_state(self, y_true, y_pred, sample_weight=None):
        self.precision.update_state(y_true, y_pred, sample_weight)
        self.recall.update_state(y_true, y_pred, sample_weight)

    def result(self):
        precision = self.precision.result()
        recall = self.recall.result()
        return 2 * ((precision * recall) / (precision + recall + tf.keras.backend.epsilon()))

    def reset_state(self):
        self.precision.reset_state()
        self.recall.reset_state()


# Global variables
MODEL = None
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]

from vit_keras import layers as vit_layers

# Provide a raw proxy class that inherits from whatever Keras uses, but we don't bypass __call__ anymore
# Instead, we just let the system naturally parse them. The ops bug is a local setup mismatch.
class SafeClassToken(vit_layers.ClassToken):
    pass
class SafeAddPositionEmbs(vit_layers.AddPositionEmbs):
    pass

def load_model_if_needed():
    global MODEL
    if MODEL is None:
        print("Loading model for the first time...")
        try:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            # ATTEMPT 1: Load the full saved model with custom objects
            try:
                print("Attempting to load full model from H5 (TF 2.15/2.16 cross-compatible)...")
                MODEL = tf.keras.models.load_model(
                    MODEL_PATH,
                    custom_objects={
                        "F1Score": F1Score,
                        "ClassToken": SafeClassToken,
                        "AddPositionEmbs": SafeAddPositionEmbs,
                        "SafeClassToken": SafeClassToken,
                        "SafeAddPositionEmbs": SafeAddPositionEmbs,
                        "MultiHeadSelfAttention": vit_layers.MultiHeadSelfAttention,
                        "TransformerBlock": vit_layers.TransformerBlock
                    },
                    compile=False
                )
                print("Full model loaded successfully!")
            except Exception as e:
                print(f"Could not load full model: {e}. Falling back to manual architecture build.")

                # ATTEMPT 2: Re-build architecture and load weights (weights-only H5)
                inputs = tf.keras.layers.Input(shape=(224, 224, 3))
                base_vit = vit.vit_b32(
                    image_size=224,
                    pretrained=True,
                    include_top=False,
                    pretrained_top=False
                )
                x = base_vit(inputs, training=False, name="vit-b32")
                x = tf.keras.layers.Dense(256, activation='relu',
                                          kernel_regularizer=tf.keras.regularizers.L2(0.01),
                                          name="dense_40")(x)
                x = tf.keras.layers.Dropout(0.4, name="dropout_20")(x)
                outputs = tf.keras.layers.Dense(4, activation='softmax', name="dense_41")(x)
                MODEL = tf.keras.Model(inputs, outputs)
                MODEL.load_weights(MODEL_PATH, by_name=True)
                print("Model architecture built and weights loaded successfully")

        except Exception as e:
            print(f"CRITICAL: Failed to load model: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e


def generate_attention_map(image_array):
    global MODEL
    try:
        # image_array is (1, 224, 224, 3) and normalized via vit.preprocess_inputs
        vit_model = MODEL.get_layer("vit-b32")
        
        print("Extracting attention map via manual layer-by-layer rollout...")
        
        try:
            # Step 1: Run through embedding layer
            curr_x = tf.cast(image_array, tf.float32)
            embedding_layer = vit_model.get_layer("embedding")
            curr_x = embedding_layer(curr_x)
            
            # Dynamically handle embedding output shape:
            # embedding outputs (batch, h, w, hidden) for conv patch embedding
            # OR (batch, num_patches, hidden) already flattened
            if len(curr_x.shape) == 4:
                # (batch, h, w, hidden) -> flatten patches
                batch_size = tf.shape(curr_x)[0]
                h = curr_x.shape[1]
                w = curr_x.shape[2]
                hidden = curr_x.shape[3]
                curr_x = tf.reshape(curr_x, (batch_size, h * w, hidden))
            # Now curr_x is (batch, num_patches, hidden)
            
            # Step 2: Add class token (bypassing layer call to prevent keras.ops errors)
            class_token_layer = vit_model.get_layer("class_token")
            batch_size_dyn = tf.shape(curr_x)[0]
            hidden_size = class_token_layer.hidden_size
            cls_broadcasted = tf.cast(
                tf.broadcast_to(class_token_layer.cls, [batch_size_dyn, 1, hidden_size]),
                dtype=curr_x.dtype,
            )
            curr_x = tf.concat([cls_broadcasted, curr_x], 1)
            
            # Step 3: Add positional embeddings (bypassing layer call)
            posembed_layer = vit_model.get_layer("Transformer/posembed_input")
            curr_x = curr_x + tf.cast(posembed_layer.pe, dtype=curr_x.dtype)
            
            # Step 4: Block-by-Block Processing (Capture weights from each Transformer stage)
            all_weights = []
            for n in range(12):
                block = vit_model.get_layer(f"Transformer/encoderblock_{n}")
                # TransformerBlock returns a tuple: (hidden_states, attention_weights)
                curr_x, weights = block(curr_x, training=False)
                all_weights.append(weights.numpy())
            
            # Step 5: Attention Rollout ("Quantifying Attention Flow in Transformers")
            total_tokens = all_weights[0].shape[-1]  # includes class token
            num_patches = total_tokens - 1
            grid_size = int(np.sqrt(num_patches))
            
            eye = np.eye(total_tokens)
            v = eye.copy()
            
            for i in range(len(all_weights)):
                # Average attention across all heads
                w = all_weights[i][0].mean(axis=0)
                # Add Identity for Residual connections and Re-normalize
                w = w + eye
                w = w / w.sum(axis=-1, keepdims=True)
                v = np.matmul(w, v)
            
            # Step 6: Extract heatmap from Class Token -> Patch attention
            mask = v[0, 1:].reshape(grid_size, grid_size)
            mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
            mask_resized = cv2.resize(mask, (224, 224))
            
            print(f"Attention map rollout successful! Grid: {grid_size}x{grid_size}")
            return mask_resized

        except Exception as e:
            print(f"Manual rollout failed: {e}")
            import traceback
            traceback.print_exc()
            return None

    except Exception as e:
        print(f"Error generating attention map: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def plot_attention_overlay(image_array, attention_map):
    try:
        if attention_map is None:
            # If attention map generation failed, return only the original image
            plt.figure(figsize=(5, 5))
            plt.imshow(image_array)
            plt.title("Original Image (Attention Map Unavailable)")
            plt.axis("off")
        else:
            plt.figure(figsize=(10, 5))

            # Plot original image
            plt.subplot(1, 2, 1)
            plt.imshow(image_array)
            plt.title("Original Image")
            plt.axis("off")

            # Normalize attention map for visualization
            att_min = attention_map.min()
            att_max = attention_map.max()
            norm_attention = (attention_map - att_min) / (att_max - att_min + 1e-8)
            norm_attention = norm_attention.squeeze()

            # Plot image with transparent attention overlay
            plt.subplot(1, 2, 2)
            plt.imshow(image_array)
            plt.imshow(norm_attention, cmap="jet", alpha=0.5)
            plt.title("Attention Map Overlay")
            plt.axis("off")

        # Save plot to bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close()
        buf.seek(0)

        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return img_str
    except Exception as e:
        print(f"Error plotting attention overlay: {str(e)}")
        return None
    finally:
        plt.close('all')


@model_route.get('/')
async def get_model():
    return {
        "Model": "Vision Transformers!",
        "Version": "1.0.0",
    }


@model_route.post('/predict')
async def predict_model(file: UploadFile):
    try:
        print('File received')
        pprint(file)

        # Validate file exists
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        try:
            file_content = await file.read()
            img = Image.open(io.BytesIO(file_content))
        except Exception as e:
            print(f"Error reading image file: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error reading image file: {str(e)}")

        try:
            img = img.resize((224, 224))
            img_array = np.array(img)

            # Ensure image has 3 channels
            if len(img_array.shape) == 2:  # If grayscale
                img_array = np.stack((img_array,) * 3, axis=-1)
            elif img_array.shape[-1] == 4:  # If RGBA
                img_array = img_array[:, :, :3]

            # Store original image array for visualization
            original_img_array = img_array.copy()

            # Use ViT-specific preprocessing for 90%+ accuracy
            img_array = vit.preprocess_inputs(img_array)[np.newaxis, :]
            
            print(f"Input shape: {img_array.shape}")  # Debug print

        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            print(f"Original image shape: {np.array(img).shape}")  # Debug print
            raise HTTPException(status_code=500, detail=f"Error preprocessing image: {str(e)}")

        try:
            # Load or get the model
            load_model_if_needed()

            print("Making prediction...")
            with tf.device('/CPU:0'):
                prediction = MODEL.predict(img_array, batch_size=1)
            print("Prediction completed")

            # Generate attention map
            print("Generating attention map...")
            attention_map = generate_attention_map(img_array)
            print(f"Attention map present: {attention_map is not None}")

            # Create visualization
            visualization = plot_attention_overlay(original_img_array, attention_map)
            print(f"Visualization generated: {visualization is not None}")

            # Get probabilities and make prediction
            class_probabilities = prediction[0].tolist()
            prediction_results = {
                class_name: float(prob)
                for class_name, prob in zip(CLASS_NAMES, class_probabilities)
            }

            predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
            confidence = float(np.max(prediction[0]))

            import gc
            print(type(visualization))
            print(f"Visualization string length: {len(visualization) if visualization else 0}")
            gc.collect()

            return {
                "file_name": file.filename,
                "predicted_class": predicted_class,
                "confidence": confidence,
                "class_probabilities": prediction_results,
                "attention_map_visualization": visualization if visualization else None
            }

        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error during prediction: {str(e)}"
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
