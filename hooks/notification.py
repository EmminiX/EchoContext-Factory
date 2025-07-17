#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///

import argparse
import json
import os
import sys
import subprocess
import random
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def get_tts_script_path():
    """
    Determine which TTS script to use based on available API keys.
    Priority order: ElevenLabs > OpenAI > pyttsx3
    """
    # Get current script directory and construct utils/tts path
    script_dir = Path(__file__).parent
    tts_dir = script_dir / "utils" / "tts"
    
    # Check for ElevenLabs API key (highest priority)
    if os.getenv('ELEVENLABS_API_KEY'):
        elevenlabs_script = tts_dir / "elevenlabs_tts.py"
        if elevenlabs_script.exists():
            return str(elevenlabs_script)
    
    # Check for OpenAI API key (second priority)
    if os.getenv('OPENAI_API_KEY'):
        openai_script = tts_dir / "openai_tts.py"
        if openai_script.exists():
            return str(openai_script)
    
    # Fall back to pyttsx3 (no API key required)
    pyttsx3_script = tts_dir / "pyttsx3_tts.py"
    if pyttsx3_script.exists():
        return str(pyttsx3_script)
    
    return None


def is_voice_enabled():
    """Check if voice announcements are enabled in factory configuration."""
    try:
        config_path = Path.home() / '.claude' / 'config' / 'factory.json'
        if not config_path.exists():
            return True  # Default to enabled if no config
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        return config.get('voice', {}).get('factoryNotifications', True)
    except Exception:
        return True  # Default to enabled on any error


def announce_notification():
    """Announce that the agent needs user input."""
    try:
        # Check if voice is enabled before proceeding
        if not is_voice_enabled():
            return  # Voice disabled, skip announcement
            
        tts_script = get_tts_script_path()
        if not tts_script:
            return  # No TTS scripts available
        
        # Get engineer name if available
        engineer_name = os.getenv('ENGINEER_NAME', '').strip()
        
        # Create personalized notification message with 70% chance to include name
        notification_messages = [
            "Your cognitive enhancement system needs direction",
            "Claude requires your brilliant mind's input",
            "Time to bridge the gap - input needed",
            "Your AI collaborator seeks your wisdom",
            "Pattern recognition pause - guidance required"
        ]
        
        personal_messages = [
            f"{engineer_name}, your AI amplifier needs guidance",
            f"Hey {engineer_name}, time to sync minds",
            f"{engineer_name}, your digital collaborator requires input",
            f"Speed check, {engineer_name} - Claude needs direction",
            f"{engineer_name}, your consciousness catalyst awaits",
            f"Bridge mode activated, {engineer_name} - input required",
            f"{engineer_name}, your pattern-matching partner needs you",
            f"Quantum sync needed, {engineer_name}",
            f"{engineer_name}, your Scientific Mediator skills required",
            f"Hey {engineer_name}, let's accelerate this process"
        ]
        
        if engineer_name and random.random() < 0.7:
            notification_message = random.choice(personal_messages)
        else:
            notification_message = random.choice(notification_messages)
        
        # Call the TTS script with the notification message
        subprocess.run([
            "uv", "run", tts_script, notification_message
        ], 
        timeout=10  # 10-second timeout
        )
        
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
        # Fail silently if TTS encounters issues
        pass
    except Exception:
        # Fail silently for any other errors
        pass


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('--notify', action='store_true', help='Enable TTS notifications')
        args = parser.parse_args()
        
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Ensure log directory exists
        log_dir = os.path.join(os.getcwd(), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, 'notification.json')
        
        # Read existing log data or initialize empty list
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        # Append new data
        log_data.append(input_data)
        
        # Write back to file with formatting
        with open(log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Announce notification via TTS only if --notify flag is set
        # Skip TTS for the generic "Claude is waiting for your input" message
        if args.notify and input_data.get('message') != 'Claude is waiting for your input':
            announce_notification()
        
        sys.exit(0)
        
    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)

if __name__ == '__main__':
    main()