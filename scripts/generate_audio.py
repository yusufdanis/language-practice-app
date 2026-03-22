import json
import os
import re

from kittentts import KittenTTS

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "definitions_en_march_2026.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "march_2026")

def sanitize_filename(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(DATA_PATH, "r") as f:
        words = json.load(f)

    model = KittenTTS("KittenML/kitten-tts-mini-0.8")

    total = len(words)
    for i, entry in enumerate(words):
        word = entry["word_en"]
        definition = entry["definition_en"]
        filename = sanitize_filename(word) + ".wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if os.path.exists(filepath):
            print(f"[{i+1}/{total}] Skipping (exists): {word}")
            continue

        print(f"[{i+1}/{total}] Generating: {word} -> {filename}")
        model.generate_to_file(definition, filepath, voice="Bella", speed=0.9, sample_rate=24000)

    print(f"\nDone! Generated audio for {total} words.")

if __name__ == "__main__":
    main()
