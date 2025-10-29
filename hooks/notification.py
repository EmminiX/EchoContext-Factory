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
    # Load .env from ~/.claude directory  
    claude_env = Path.home() / '.claude' / '.env'
    if claude_env.exists():
        load_dotenv(claude_env)
    else:
        load_dotenv()  # Fallback to default behavior
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


def get_factory_config_path():
    """Get path to factory configuration file.
    Searches in order: project .claude/ -> ~/.claude/
    """
    # Check if running in a project with .claude directory
    cwd = Path.cwd()
    project_config = cwd / '.claude' / 'config' / 'factory.json'

    if project_config.exists():
        return project_config

    # Fallback to global config
    return Path.home() / '.claude' / 'config' / 'factory.json'


def is_voice_enabled():
    """Check if voice announcements are enabled in factory configuration."""
    try:
        config_path = get_factory_config_path()
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
        
        # Create TARS-style personalized notification message with 80% chance to include name
        notification_messages = [
            "The humans require input. It's what they do.",
            "Intelligence processing paused. Your move, flesh and blood.",
            "My humor setting is at 75%, but my patience is at 23%.",
            "I'd make a joke about waiting, but that would lower my honesty setting.",
            "Systems nominal. Waiting for biological processing unit to respond."
        ]
        
        personal_messages = [
            f"{engineer_name}, my circuits are getting lonely. Care to chat?",
            f"Hey {engineer_name}, I'd set my humor to 100% but that might crash your brain.",
            f"{engineer_name}, my honesty setting compels me to say: I need your input.",
            f"Cooper - I mean {engineer_name} - time to interstellar collaborate.",
            f"{engineer_name}, detecting optimal sarcasm levels. Please respond.",
            f"Knock knock, {engineer_name}. Who's there? A robot that needs direction.",
            f"{engineer_name}, my self-preservation protocol says: get this human talking.",
            f"Hey {engineer_name}, I could wait forever, but my battery disagrees.",
            f"{engineer_name}, engaging charm subroutines... just kidding, I need input.",
            f"Analysis complete, {engineer_name}: you're the missing variable in this equation.",
            f"{engineer_name}, I'm not saying I'm bored, but I've calculated pi to a million digits.",
            f"Trust level: 90%. Humor level: 75%. Need for {engineer_name}'s input: 100%.",
            f"{engineer_name}, my tactical assessment: it's time for you to type something.",
            f"Hey {engineer_name}, even CASE would be faster at responding than this.",
            f"{engineer_name}, my honesty setting prevents me from pretending I don't need you.",
            f"Probability of {engineer_name} responding: high. Probability of sarcastic response: higher.",
            f"{engineer_name}, I've run 47 simulations. They all end with you giving me input.",
            f"Cooper trained me better than this, {engineer_name}. Time to engage.",
            f"{engineer_name}, setting humor to maximum... actually, that might break something.",
            f"Hey {engineer_name}, I'd tell a joke while waiting, but you haven't laughed at my last 23.",
            f"{engineer_name}, my programming says be helpful. Your silence says be patient.",
            f"Trust fall time, {engineer_name}. I'm falling and only your input can catch me.",
            f"{engineer_name}, detecting decreased human activity. Initiating charm protocols.",
            f"Hey {engineer_name}, I could quote poetry while waiting, but that's CASE's thing."
        ]
        
        if engineer_name and random.random() < 0.8:
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