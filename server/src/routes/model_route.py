import io
import os
import base64
from pathlib import Path

# --- Legacy Compatibility Shim for vit-keras ---
import sys
import types
sys.modules['tensorflow_addons'] = types.ModuleType('tensorflow_addons')
# -----------------------------------------------

from fastapi import APIRouter, File, UploadFile, HTTPException
from rich.pretty import pprint
import tensorflow as tf
import numpy as np
from PIL import Image
from vit_keras import vit, layers
import matplotlib.pyplot as plt
import cv2
import types

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


def load_model_if_needed():
    global MODEL
    if MODEL is None:
        print("Loading model for the first time...")
        try:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            # ATTEMPT 1: Load the full model (structure + weights)
            try:
                print("Attempting to load full model structure from H5...")
                MODEL = tf.keras.models.load_model(MODEL_PATH, compile=False)
                print("Full model loaded successfully!")
            except Exception as e:
                print(f"Could not load full model: {e}. Falling back to manual architecture build.")
                
                # ATTEMPT 2: Re-build and load weights (if H5 only contains weights)
                inputs = tf.keras.layers.Input(shape=(224, 224, 3))
                base_vit = vit.vit_b32(
                    image_size=224,
                    pretrained=True,
                    include_top=False,
                    pretrained_top=False
                )
                # Ensure the layer name matches the H5 key 'vit-b32'
                x = base_vit(inputs, training=False, name="vit-b32")
                x = tf.keras.layers.Dense(256, activation='relu',
                                          kernel_regularizer=tf.keras.regularizers.L2(0.01),
                                          name="dense_40")(x)
                x = tf.keras.layers.Dropout(0.4, name="dropout_20")(x)
                outputs = tf.keras.layers.Dense(4, activation='softmax', name="dense_41")(x)

                MODEL = tf.keras.Model(inputs, outputs)
                MODEL.load_weights(MODEL_PATH, by_name=True)
                print("Model architecture built and weights restored successfully")

        except Exception as e:
            print(f"CRITICAL: Failed to load model: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e


def generate_attention_map(image_array):
    global MODEL
    try:
        # image_array is (1, 224, 224, 3) and normalized [0, 1]
        vit_model = MODEL.get_layer("vit-b32")
        
        # PORTABLE ATTENTION ROLLOUT IMPLEMENTATION: 
        # Since standard library utilities discard attention weights 
        # during model building, we perform a manual forward pass through the 
        # sub-layers to capture exact focus data.
        print("Extracting attention map via manual layer-by-layer rollout...")
        
        try:
            # Prepare image for ViT specific preprocessing
            img = (image_array[0] * 255).astype('uint8')
            img_resized = cv2.resize(img, (224, 224))
            X = vit.preprocess_inputs(img_resized)[np.newaxis, :]
            
            # Step-by-step Execution through the sub-model:
            # 1. Input Transformation & Positional Embedding
            curr_x = tf.cast(X, tf.float32)
            curr_x = vit_model.get_layer("embedding")(curr_x)
            curr_x = tf.reshape(curr_x, (-1, curr_x.shape[1] * curr_x.shape[2], curr_x.shape[3]))
            curr_x = vit_model.get_layer("class_token")(curr_x)
            curr_x = vit_model.get_layer("Transformer/posembed_input")(curr_x)
            
            # 2. Block-by-Block Processing (Capture weights from each Transformer stage)
            all_weights = []
            for n in range(12):
                block = vit_model.get_layer(f"Transformer/encoderblock_{n}")
                # TransformerBlock returns a tuple: (hidden_states, attention_weights)
                curr_x, weights = block(curr_x, training=False)
                all_weights.append(weights.numpy())
            
            # 3. Compute Attention Rollout (Recursive Matrix Multiplication)
            # This follows the technique from "Quantifying Attention Flow in Transformers"
            num_layers = len(all_weights)
            grid_size = int(np.sqrt(all_weights[0].shape[-1] - 1))
            eye = np.eye(grid_size**2 + 1)
            v = eye.copy()
            
            for i in range(num_layers):
                # Average attention across all heads
                w = all_weights[i][0].mean(axis=0)
                # Add Identity for Residual connections and Re-normalize
                w = w + eye
                w = w / w.sum(axis=-1, keepdims=True)
                v = np.matmul(w, v)
            
            # 4. Extract Final Heatmap from the Class Token's Relation to Input Patches
            mask = v[0, 1:].reshape(grid_size, grid_size)
            # Normalize to 0-1 range for vibrant colormapping
            mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
            mask_resized = cv2.resize(mask, (224, 224))
            
            print("Attention map rollout calculated successfully!")
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

            print(type(visualization))
            print(visualization)

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
