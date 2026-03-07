import io
import os
import base64
from pathlib import Path
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
            # Create original base model to get weights
            base_vit = vit.vit_b32(
                image_size=224,
                pretrained=True,
                include_top=False,
                pretrained_top=False
            )
            
            # Now, we "re-wrap" it to expose attention
            # We'll create a new functional model that mirrors base_vit 
            # but outputs BOTH the final tokens AND the attention weights from layers.
            inputs = tf.keras.layers.Input(shape=(224, 224, 3))
            
            # This is a bit complex because vit_keras models are deeply nested.
            # Simplest way: use the fact that our patch to vit.py (if it were there) would work.
            # Since we want it portable, we just use the base_vit but we'll 
            # "reach in" during generate_attention_map using a temporary model.
            
            # To make it work on Vercel without a library patch, we MONKEY-PATCH 
            # the TransformerBlock's __call__ or call before building the model!
            
            original_block_call = layers.TransformerBlock.call
            def attention_preserving_call(self, inputs, training=False):
                # We call the original which returns (output, weights)
                res = original_block_call(self, inputs, training=training)
                # Keras Functional API uses the first element of the return tuple 
                # if we don't unpack both. To force it to see both, we MUST 
                # ensure the caller unpacks both.
                return res

            # We can't easily change the library's vit.py call site.
            # SO: we use the "last resort" - we'll just manually compute rollout 
            # if the library visualization fails.
            
            # Create our main model architecture
            x = base_vit(inputs, training=False)
            x = tf.keras.layers.Dense(256, activation='relu',
                                      kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
            x = tf.keras.layers.Dropout(0.4)(x)
            outputs = tf.keras.layers.Dense(4, activation='softmax')(x)

            MODEL = tf.keras.Model(inputs, outputs)

            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            MODEL.load_weights(MODEL_PATH)
            print("Model loaded and weights restored successfully")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e


def generate_attention_map(image_array):
    global MODEL
    try:
        # image_array is (1, 224, 224, 3) and normalized [0, 1]
        vit_model = MODEL.get_layer("vit-b32")
        
        # FINAL PORTABLE SOLUTION: 
        # Since we can't easily get attention weights from the loaded graph 
        # (because they were discarded during build_model in vit.py), 
        # we will use a "Guided Backprop" or simple Gradient-based focus if needed.
        # BUT, there's a better way: vit-keras allows us to just re-predict 
        # using their visualize module if we have the model.
        
        # The issue was that visualize.attention_map was returning zeros.
        # This is often due to the normalize step in their rollout.
        
        # Let's try a custom, robust rollout extraction:
        print("Extracting attention map via robust rollout...")
        
        # If the user saw it before, it was likely using this layer:
        try:
            # Try to find any attention weights in the model
            # Re-running the sub-model with a patch to capture weights
            attn_weights = []
            
            def patch_callback(self, inputs, outputs):
                # outputs is (output, weights)
                if isinstance(outputs, (list, tuple)) and len(outputs) > 1:
                    attn_weights.append(outputs[1].numpy())
                return outputs[0]

            # We'll use a temporary "Attention Extractor" that manually computes 
            # the attention for ONE sample.
            
            # Simplified version: Get the last block's attention by looking 
            # at its internal layers.
            last_block = vit_model.get_layer("Transformer_encoderblock_11")
            
            # Create a model that targets the internal attention layer
            # In layers.py, it's called "MultiHeadDotProductAttention_1"
            # Since TransformerBlock is a Layer, its internal layers are not reachable 
            # via vit_model.get_layer(). But they are attributes!
            
            if hasattr(last_block, 'att'):
                # We can't create a Model targeting an internal attribute's output 
                # if it wasn't part of the functional graph.
                pass

            # OK, let's use the most reliable method: 
            # We will use the 'visualize.attention_map' but we will FIX the 
            # result if it's too dark.
            from vit_keras import visualize
            
            # The zeros we saw earlier were likely because 'weights' in visualize.py 
            # was empty because l.output[1] was invalid.
            
            # Since I've already patched the LOCAL vit.py, it will work here.
            # To make it work on VERCEL, I'll add a runtime patch RIGHT HERE.
            
            import vit_keras.vit as vkv
            import vit_keras.layers as vkl
            
            # Runtime patch for vit_keras.vit.build_model logic
            # This ensures that ANY NEW ViT model built will have attention outputs
            source = """
    for n in range(num_layers):
        y, att = layers.TransformerBlock(
            num_heads=num_heads,
            mlp_dim=mlp_dim,
            dropout=dropout,
            name=f"Transformer_encoderblock_{n}",
        )(y)
"""
            # This is hard to do via replacement.
            # Let's just do a manual rollout on the last block's activation if we can.
            
            # THE ABSOLUTE BEST WAY:
            # Re-implement the vit-keras visualize logic but manually calling the layers.
            
            img = (image_array[0] * 255).astype('uint8')
            img_resized = cv2.resize(img, (224, 224))
            X = vit.preprocess_inputs(img_resized)[np.newaxis, :]
            
            # Manually run the sub-model and capture weights
            curr_x = tf.cast(X, tf.float32)
            # Embedding
            curr_x = vit_model.get_layer("embedding")(curr_x)
            # Reshape
            curr_x = tf.reshape(curr_x, (-1, curr_x.shape[1] * curr_x.shape[2], curr_x.shape[3]))
            # Class token
            curr_x = vit_model.get_layer("class_token")(curr_x)
            # Position embs
            curr_x = vit_model.get_layer("Transformer_posembed_input")(curr_x)
            
            # Transformer blocks - this is where we get the weights!
            all_weights = []
            for n in range(12):
                block = vit_model.get_layer(f"Transformer_encoderblock_{n}")
                curr_x, weights = block(curr_x, training=False)
                all_weights.append(weights.numpy())
            
            # Now we have all_weights! Perform rollout.
            num_layers = len(all_weights)
            grid_size = int(np.sqrt(all_weights[0].shape[-1] - 1))
            eye = np.eye(grid_size**2 + 1)
            v = eye.copy()
            for i in range(num_layers):
                w = all_weights[i][0].mean(axis=0)
                w = w + eye
                w = w / w.sum(axis=-1, keepdims=True)
                v = np.matmul(w, v)
            
            mask = v[0, 1:].reshape(grid_size, grid_size)
            mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
            mask_resized = cv2.resize(mask, (224, 224))
            
            print("Attention map generated via manual layer-by-layer rollout!")
            return mask_resized

        except Exception as e:
            print(f"Manual rollout failed: {e}")
            import traceback
            traceback.print_exc()
            return None

    except Exception as e:
        print(f"Error in generate_attention_map: {str(e)}")
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

            # Create custom colormap: Transparent (low) -> Vibrant (high)
            # This prevents the "darkening" effect on the MRI scan
            jet = plt.cm.get_cmap('jet')
            my_cmap = jet(np.arange(jet.N))
            # Set alpha: 0 at the low end (blue/cold) to 0.7 at the high end (red/hot)
            # We use a power function to make low-attention areas very transparent
            my_cmap[:, -1] = np.power(np.linspace(0, 1, jet.N), 2) * 0.8
            from matplotlib.colors import ListedColormap
            my_transparent_cmap = ListedColormap(my_cmap)

            # Plot image with transparent attention overlay
            plt.subplot(1, 2, 2)
            plt.imshow(image_array)
            plt.imshow(norm_attention, cmap=my_transparent_cmap)
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

            # Normalize and add batch dimension
            img_array = img_array / 255.0
            img_array = np.expand_dims(img_array, axis=0)

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
