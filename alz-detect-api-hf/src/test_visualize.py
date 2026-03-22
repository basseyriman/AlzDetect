import sys
import types
sys.modules['tensorflow_addons'] = types.ModuleType('tensorflow_addons')

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from vit_keras import vit, visualize

def test_visualize():
    print("Loading test image...")
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    # Using the exact preprocessing the original code used
    
    print("Loading base ViT...")
    try:
        base_vit = vit.vit_b32(
            image_size=224,
            pretrained=True,
            include_top=False,
            pretrained_top=False
        )
        print("Base ViT loaded.")
        
        print("Running native visualize.attention_map...")
        attention_map = visualize.attention_map(model=base_vit, image=img)
        
        print(f"Attention map generated: {attention_map.shape}")
        print(f"Min: {attention_map.min()}, Max: {attention_map.max()}")
        
    except Exception as e:
        import traceback
        print(f"FAILED: {e}")
        traceback.print_exc()

if __name__ == '__main__':
    test_visualize()
