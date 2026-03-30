import json
import os
import re

from google.cloud import texttospeech
from google.oauth2 import service_account

SCRIPT_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "definitions_de_march_2026.json")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "public", "audio", "de_march_2026")
CREDENTIALS_PATH = os.path.join(SCRIPT_DIR, "..", ".docs", "language-practice-app-491816-f32f31a667c6.json")

VOICE_NAME = "de-DE-Neural2-B"  # German male Neural2 voice
SPEAKING_RATE = 0.85  # Slightly slower for learners

def sanitize_filename(text: str) -> str:
    return re.sub(r'[^a-zäöüß0-9]+', '_', text.lower()).strip('_')

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(DATA_PATH, "r") as f:
        words = json.load(f)

    credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
    client = texttospeech.TextToSpeechClient(credentials=credentials)

    voice = texttospeech.VoiceSelectionParams(
        language_code="de-DE",
        name=VOICE_NAME,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,
        speaking_rate=SPEAKING_RATE,
    )

    total = len(words)
    for i, entry in enumerate(words):
        word_de = entry["word_de"]
        filename = sanitize_filename(word_de) + ".wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if os.path.exists(filepath):
            os.remove(filepath)

        print(f"[{i+1}/{total}] Generating: {word_de} -> {filename}")
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=word_de),
            voice=voice,
            audio_config=audio_config,
        )
        with open(filepath, "wb") as f:
            f.write(response.audio_content)

    print(f"\nDone! Generated audio for {total} words.")

if __name__ == "__main__":
    main()
