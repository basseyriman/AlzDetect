import os
import sys
import tensorflow as tf
from pathlib import Path

# Add project root to sys.path
CURRENT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = CURRENT_DIR.parent
sys.path.append(str(PROJECT_ROOT))

from vit_keras import vit

def test_load():
    MODEL_PATH = os.path.join(PROJECT_ROOT, "src", "model", "RimanBassey_model.h5")
    print(f"Testing load from: {MODEL_PATH}")
    print(f"File exists: {os.path.exists(MODEL_PATH)}")
    
    try:
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        base_vit = vit.vit_b32(
            image_size=224,
            pretrained=True,
            include_top=False,
            pretrained_top=False
        )
        
        x = base_vit(inputs, training=False)
        x = tf.keras.layers.Dense(256, activation='relu',
                                  kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
        x = tf.keras.layers.Dropout(0.4)(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)

        model = tf.keras.Model(inputs, outputs)
        print("Architecture created successfully. Loading weights...")
        model.load_weights(MODEL_PATH)
        print("SUCCESS: Model weights loaded successfully!")
        
    except Exception as e:
        print("\n--- ERROR DURING LOADING ---")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_load()
