import io
import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"
import sys
import types
import base64
from pathlib import Path

# 1. ROBUST KERAS 3 SHIM (Unconditional + SysModule Injection)
import keras
import tensorflow as tf
import sys

# Global TensorFlow Patching for legacy compatibility
if not hasattr(tf, "concatenate"):
    tf.concatenate = tf.concat
if not hasattr(tf, "stack"):
    tf.stack = tf.stack # Just in case

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
# The weights are in a separate folder at the same level as the server project
MODEL_PATH = os.path.join(PROJECT_ROOT.parent, 'alz-detect-weights', "RimanBassey_model.h5")


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

def is_probably_mri(image_np):
    """
    Heuristic validation to ensure the uploaded image is actually a brain MRI.
    Checks for: 1. Grayscale nature, 2. Dark periphery (black background).
    """
    try:
        # Check 1: Color Saturation (MRI is monochromatic)
        hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)
        avg_saturation = np.mean(hsv[:, :, 1])
        if avg_saturation > 35:  # MRI slices have very low saturation
            return False, "Invalid Scan Type: The uploaded image is not supported. Please ensure all uploaded files are standard clinical MRI scans for accurate analysis."

        # Check 2: Peripheral Darkness (Standard bore-centered capture)
        # Check the 4 corners (10% of image size)
        h, w = image_np.shape[:2]
        ch, cw = int(h * 0.1), int(w * 0.1)
        corners = [
            image_np[0:ch, 0:cw],       # top-left
            image_np[0:ch, w-cw:w],     # top-right
            image_np[h-ch:h, 0:cw],     # bottom-left
            image_np[h-ch:h, w-cw:w]    # bottom-right
        ]
        avg_corner_intensity = np.mean([np.mean(c) for c in corners])
        if avg_corner_intensity > 60:
            return False, "Invalid Scan Type: The uploaded image is not supported. Please ensure all uploaded files are standard clinical MRI scans for accurate analysis."

        return True, "Valid MRI architecture detected."
    except Exception as e:
        # If check fails for technical reasons, we allow it to proceed to the model 
        # (which might still handle it) rather than blocking the user.
        print(f"Validation check error: {e}")
        return True, "Validation bypassed."

from vit_keras import layers as vit_layers

# Provide a raw proxy class that inherits from whatever Keras uses, but we don't bypass __call__ anymore
# Instead, we just let the system naturally parse them. The ops bug is a local setup mismatch.
# 3. ROBUST CUSTOM LAYERS (Fully Independent of vit-keras internals)
@tf.keras.utils.register_keras_serializable()
class SafeClassToken(tf.keras.layers.Layer):
    """Standalone implementation of ClassToken to bypass ops errors."""
    def build(self, input_shape):
        self.hidden_size = input_shape[-1]
        self.cls = self.add_weight(
            name="cls",
            shape=(1, 1, self.hidden_size),
            initializer="zeros",
            trainable=True,
            dtype="float32"
        )
    def call(self, inputs):
        batch_size = tf.shape(inputs)[0]
        cls_broadcasted = tf.cast(
            tf.broadcast_to(self.cls, [batch_size, 1, self.hidden_size]),
            dtype=inputs.dtype,
        )
        # Use tf.concat explicitly (not ops.concatenate)
        return tf.concat([cls_broadcasted, inputs], axis=1)
    def get_config(self):
        return super().get_config()

@tf.keras.utils.register_keras_serializable()
class SafeAddPositionEmbs(tf.keras.layers.Layer):
    """Standalone implementation of AddPositionEmbs to bypass ops errors."""
    def build(self, input_shape):
        self.pe = self.add_weight(
            name="pos_embedding",
            shape=(1, input_shape[1], input_shape[2]),
            initializer=tf.random_normal_initializer(stddev=0.06),
            trainable=True,
            dtype="float32"
        )
    def call(self, inputs):
        # Simply add positional embeddings
        return inputs + tf.cast(self.pe, dtype=inputs.dtype)
    def get_config(self):
        return super().get_config()

@tf.keras.utils.register_keras_serializable()
class SafeMultiHeadSelfAttention(tf.keras.layers.Layer):
    def __init__(self, num_heads, **kwargs):
        super().__init__(**kwargs)
        self.num_heads = num_heads
    def build(self, input_shape):
        hidden_size = input_shape[-1]
        self.projection_dim = hidden_size // self.num_heads
        self.query_dense = tf.keras.layers.Dense(hidden_size, name="query")
        self.key_dense = tf.keras.layers.Dense(hidden_size, name="key")
        self.value_dense = tf.keras.layers.Dense(hidden_size, name="value")
        self.combine_heads = tf.keras.layers.Dense(hidden_size, name="out")
    def call(self, inputs, **kwargs):
        # Ignore extra kwargs like 'axes' or 'mask' from Keras 3/ops
        batch_size = tf.shape(inputs)[0]
        query = self.query_dense(inputs)
        key = self.key_dense(inputs)
        value = self.value_dense(inputs)
        query = tf.transpose(tf.reshape(query, (batch_size, -1, self.num_heads, self.projection_dim)), perm=[0, 2, 1, 3])
        key = tf.transpose(tf.reshape(key, (batch_size, -1, self.num_heads, self.projection_dim)), perm=[0, 2, 1, 3])
        value = tf.transpose(tf.reshape(value, (batch_size, -1, self.num_heads, self.projection_dim)), perm=[0, 2, 1, 3])
        score = tf.matmul(query, key, transpose_b=True)
        dim_key = tf.cast(tf.shape(key)[-1], score.dtype)
        weights = tf.nn.softmax(score / tf.math.sqrt(dim_key), axis=-1)
        output = tf.matmul(weights, value)
        output = tf.transpose(output, perm=[0, 2, 1, 3])
        concat_attention = tf.reshape(output, (batch_size, -1, self.num_heads * self.projection_dim))
        return self.combine_heads(concat_attention), weights
    def get_config(self):
        config = super().get_config()
        config.update({"num_heads": self.num_heads})
        return config

@tf.keras.utils.register_keras_serializable()
class SafeTransformerBlock(tf.keras.layers.Layer):
    def __init__(self, num_heads, mlp_dim, dropout, **kwargs):
        super().__init__(**kwargs)
        self.num_heads = num_heads
        self.mlp_dim = mlp_dim
        self.dropout = dropout
    def build(self, input_shape):
        hidden_size = input_shape[-1]
        self.att = SafeMultiHeadSelfAttention(num_heads=self.num_heads, name="MultiHeadDotProductAttention_1")
        self.mlpblock = tf.keras.Sequential([
            tf.keras.layers.Dense(self.mlp_dim, activation="linear", name=f"{self.name}/Dense_0"),
            tf.keras.layers.Lambda(lambda x: tf.keras.activations.gelu(x, approximate=False)),
            tf.keras.layers.Dense(hidden_size, name=f"{self.name}/Dense_1")
        ])
        self.layernorm1 = tf.keras.layers.LayerNormalization(epsilon=1e-6, name="LayerNorm_0")
        self.layernorm2 = tf.keras.layers.LayerNormalization(epsilon=1e-6, name="LayerNorm_1")
        self.dropout_layer = tf.keras.layers.Dropout(self.dropout)
    def call(self, inputs, **kwargs):
        x = self.layernorm1(inputs)
        x, weights = self.att(x, **kwargs)
        x = self.dropout_layer(x)
        x = x + inputs
        y = self.layernorm2(x)
        y = self.mlpblock(y)
        return x + y, weights
    def get_config(self):
        config = super().get_config()
        config.update({"num_heads": self.num_heads, "mlp_dim": self.mlp_dim, "dropout": self.dropout})
        return config

def build_safe_vit_b32(include_top=False):
    """
    Constructs a ViT-B/32 backbone using Safe layers to avoid Keras 3 versioning conflicts.
    Replicates the vit-keras architecture exactly for seamless weight loading.
    """
    backbone_inputs = tf.keras.layers.Input(shape=(224, 224, 3))
    
    # Embedding Layer: Conv2D Patching
    x = tf.keras.layers.Conv2D(768, kernel_size=32, strides=32, padding="valid", name="embedding")(backbone_inputs)
    h, w = x.shape[1], x.shape[2]
    x = tf.keras.layers.Reshape((h * w, 768))(x)
    
    # Class Token and Positional Embedding
    class_token_layer = SafeClassToken(name="class_token")
    x = class_token_layer(x)
    
    posembed_layer = SafeAddPositionEmbs(name="Transformer/posembed_input")
    x = posembed_layer(x)
    
    # 12 Transformer Blocks
    for n in range(12):
        block = SafeTransformerBlock(num_heads=12, mlp_dim=3072, dropout=0.1, name=f"Transformer/encoderblock_{n}")
        x, _ = block(x)
    
    # LayerNorm and Final Output Extraction
    x = tf.keras.layers.LayerNormalization(epsilon=1e-6, name="Transformer/encoder_norm")(x)
    x = tf.keras.layers.Lambda(lambda t: t[:, 0], name="extract_cls_token")(x)
    
    # Create the backbone model
    backbone = tf.keras.Model(backbone_inputs, x, name="vit-b32")

    if include_top:
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        # Use backbone as a layer
        x = backbone(inputs, training=False)
        x = tf.keras.layers.Dense(256, activation='relu', name="dense_40")(x)
        x = tf.keras.layers.Dropout(0.4, name="dropout_20")(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax', name="dense_41")(x)
        return tf.keras.Model(inputs, outputs)
    else:
        return backbone

def load_model_if_needed():
    global MODEL
    if MODEL is None:
        print("Loading model for the first time...")
        try:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            # USE SAFE BUILD: Re-build entire architecture with Safe layers to bypass Render's Keras 3 issues
            print("Building model with Safe Clinical Architecture...")
            MODEL = build_safe_vit_b32(include_top=True)
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
            # Significantly increase DPI and figure size for maximum diagnostic text prominence
            plt.figure(figsize=(14, 9), facecolor='black', dpi=150)
            
            # Plot original image
            plt.subplot(1, 2, 1)
            plt.imshow(image_array)
            plt.title("ORIGINAL MRI SCAN", color='white', fontsize=16, fontweight='black', pad=25)
            plt.axis("off")

            # Normalize attention map for visualization
            att_min = attention_map.min()
            att_max = attention_map.max()
            norm_attention = (attention_map - att_min) / (att_max - att_min + 1e-8)
            norm_attention = norm_attention.squeeze()

            # Plot image with transparent attention overlay
            plt.subplot(1, 2, 2)
            plt.imshow(image_array)
            # Using alpha=0.6 for better visibility of the attention zones
            plt.imshow(norm_attention, cmap="jet", alpha=0.6)
            plt.title("ATTENTION HEATMAP", color='white', fontsize=16, fontweight='black', pad=25)
            plt.axis("off")

            # Main protocol title at the bottom with extreme visibility
            plt.suptitle("ALZHEIMER'S DIAGNOSTIC PROTOCOL: VIT-B/32 ANALYSIS", 
                         color='white', fontsize=20, fontweight='black', y=0.08)

            plt.tight_layout(rect=[0, 0.12, 1, 0.95])

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

            # --- MRI VALIDATION LAYER ---
            is_valid, reason = is_probably_mri(original_img_array)
            if not is_valid:
                print(f"Validation Rejected: {reason}")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "Invalid Scan Type",
                        "message": "The uploaded image is not supported.",
                        "suggestion": "Ensure the image is a grayscale MRI slice on a dark background for accurate analysis."
                    }
                )
            print("Validation Passed: Image confirmed as MRI-like.")
            # ---------------------------

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
