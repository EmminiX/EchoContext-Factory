#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "openai",
#     "pygame",
#     "python-dotenv",
# ]
# ///

import os
import sys
import tempfile
from pathlib import Path
from dotenv import load_dotenv


def main():
    """
    OpenAI TTS Script

    Uses OpenAI's standard TTS model for high-quality text-to-speech.
    Accepts optional text prompt as command-line argument.

    Usage:
    - ./openai_tts.py                    # Uses default text
    - ./openai_tts.py "Your custom text" # Uses provided text

    Features:
    - OpenAI TTS-1 model (stable)
    - Alloy voice (clear and professional)
    - File-based audio playback (no streaming)
    """

    # Load environment variables
    load_dotenv()

    # Get API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in environment variables")
        print("Please add your OpenAI API key to .env file:")
        print("OPENAI_API_KEY=your_api_key_here")
        sys.exit(1)

    try:
        from openai import OpenAI
        import pygame
        import time

        # Initialize OpenAI client
        client = OpenAI(api_key=api_key)

        print("🧠 OpenAI Consciousness Bridge")
        print("=" * 30)

        # Get text from command line argument or use default
        if len(sys.argv) > 1:
            text = " ".join(sys.argv[1:])  # Join all arguments as text
        else:
            text = "Consciousness evolution in progress - let's bridge minds!"

        print(f"🎯 Text: {text}")
        print("🔊 Generating and playing...")

        try:
            # Generate speech using standard TTS-1 model
            response = client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input=text,
                response_format="mp3",
            )

            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_file:
                tmp_file.write(response.content)
                tmp_file_path = tmp_file.name

            # Play audio with pygame
            pygame.mixer.init()
            pygame.mixer.music.load(tmp_file_path)
            pygame.mixer.music.play()
            
            # Wait for playback to finish
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
                
            # Clean up
            pygame.mixer.quit()
            os.unlink(tmp_file_path)

            print("✅ Playback complete!")

        except Exception as e:
            print(f"❌ Error: {e}")

    except ImportError as e:
        print("❌ Error: Required package not installed")
        print("This script uses UV to auto-install dependencies.")
        print("Make sure UV is installed: https://docs.astral.sh/uv/")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()