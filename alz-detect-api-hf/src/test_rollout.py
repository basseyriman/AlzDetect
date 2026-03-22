import sys
import types
sys.modules['tensorflow_addons'] = types.ModuleType('tensorflow_addons')
import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from vit_keras import vit

def test_rollout():
    print("Loading test image...")
    img = np.zeros((224, 224, 3), dtype=np.uint8) # Dummy black image
    X = vit.preprocess_inputs(img)[np.newaxis, :]
    
    print("Loading base ViT to check layers...")
    try:
        base_vit = vit.vit_b32(
            image_size=224,
            pretrained=True,
            include_top=False,
            pretrained_top=False
        )
        print("Base ViT loaded.")
        
        print("Running manual rollout inference...")
        curr_x = tf.cast(X, tf.float32)
        curr_x = base_vit.get_layer("embedding")(curr_x)
        curr_x = tf.reshape(curr_x, (-1, curr_x.shape[1] * curr_x.shape[2], curr_x.shape[3]))
        curr_x = base_vit.get_layer("class_token")(curr_x)
        curr_x = base_vit.get_layer("Transformer/posembed_input")(curr_x)
        
        all_weights = []
        for n in range(12):
            block = base_vit.get_layer(f"Transformer/encoderblock_{n}")
            curr_x, weights = block(curr_x, training=False)
            all_weights.append(weights.numpy())
            
        print(f"Captured {len(all_weights)} weights successfully.")
        w_shape = all_weights[-1].shape
        print(f"Last block weight shape: {w_shape}")
        
    except Exception as e:
        import traceback
        print(f"FAILED: {e}")
        traceback.print_exc()

if __name__ == '__main__':
    test_rollout()
