import json
import os
import re
import wave

from piper import PiperVoice
from piper.config import SynthesisConfig

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "definitions_de_march_2026.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "de_march_2026")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "de_DE-thorsten-high.onnx")

# length_scale > 1.0 = slower speech (1.3 = 30% slower)
LENGTH_SCALE = 1.3

def sanitize_filename(text: str) -> str:
    return re.sub(r'[^a-zäöüß0-9]+', '_', text.lower()).strip('_')

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(DATA_PATH, "r") as f:
        words = json.load(f)

    print(f"Loading Piper voice model from {MODEL_PATH}...")
    voice = PiperVoice.load(MODEL_PATH)

    total = len(words)
    for i, entry in enumerate(words):
        word_de = entry["word_de"]
        filename = sanitize_filename(word_de) + ".wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if os.path.exists(filepath):
            os.remove(filepath)

        print(f"[{i+1}/{total}] Generating: {word_de} -> {filename}")
        with wave.open(filepath, "wb") as wav_file:
            voice.synthesize_wav(word_de, wav_file, syn_config=SynthesisConfig(length_scale=LENGTH_SCALE))

    print(f"\nDone! Generated audio for {total} words.")

if __name__ == "__main__":
    main()
