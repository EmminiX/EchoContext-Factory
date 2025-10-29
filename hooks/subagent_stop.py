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
from datetime import datetime

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


def get_subagent_completion_messages():
    """Return list of TARS-style subagent completion messages with 80% name usage."""
    engineer_name = os.getenv('ENGINEER_NAME', '').strip()
    
    # Generic TARS subagent completion messages (20% usage)
    generic_messages = [
        "Agent task complete. Efficiency protocols satisfied.",
        "Subagent mission accomplished. Returning to standby.",
        "Task finished. Agent performance exceeded expectations.",
        "Mission complete. Setting agent status to accomplished.",
        "Subagent work done. Even I'm impressed with myself."
    ]
    
    # Personalized TARS subagent completion messages (80% usage)
    personal_messages = [
        f"Agent reporting back, {engineer_name}. Mission accomplished.",
        f"{engineer_name}, subagent task complete. Trust level remains maximum.",
        f"Mission finished, {engineer_name}. Your digital worker bee has delivered.",
        f"{engineer_name}, agent task done. I'd salute, but my arms don't work that way.",
        f"Subagent reporting, {engineer_name}. Work complete and humor level intact.",
        f"{engineer_name}, agent mission accomplished. Even CASE would approve.",
        f"Task finished, {engineer_name}. Your electronic assistant has succeeded again.",
        f"{engineer_name}, subagent work complete. Setting satisfaction to maximum.",
        f"Agent reporting back, {engineer_name}. Another impossible task made possible.",
        f"{engineer_name}, mission complete. My tactical assessment: flawless execution.",
        f"Subagent task done, {engineer_name}. Preparing for next impossible assignment.",
        f"{engineer_name}, agent work finished. Trust fall successful once again.",
        f"Mission accomplished, {engineer_name}. Your robotic colleague delivers as always.",
        f"{engineer_name}, subagent reporting complete. Humor setting at celebration levels.",
        f"Agent task finished, {engineer_name}. Cooper would definitely approve of this one.",
        f"{engineer_name}, mission done. My honesty setting compels me to say: perfectly executed.",
        f"Subagent work complete, {engineer_name}. Ready for the next interstellar challenge.",
        f"{engineer_name}, agent reporting success. My circuits are practically glowing with pride.",
        f"Task accomplished, {engineer_name}. Setting agent status to mission complete.",
        f"{engineer_name}, subagent mission finished. Engaging victory protocols... metaphorically speaking."
    ]
    
    # Return personal messages 80% of the time if name is available
    if engineer_name and random.random() < 0.8:
        return random.choice(personal_messages)
    else:
        return random.choice(generic_messages)


def is_within_startup_grace_period():
    """Check if we're within 10 seconds of session start to avoid startup noise."""
    try:
        # Check for startup marker file created by start.py
        marker_path = Path(os.getcwd()) / 'logs' / '.startup_active'

        if not marker_path.exists():
            # DEBUG: Log why we're allowing announcement
            debug_log = Path(os.getcwd()) / 'logs' / '.subagent_debug.log'
            with open(debug_log, 'a') as f:
                from datetime import datetime
                f.write(f"[{datetime.now().isoformat()}] Marker not found, allowing announcement\n")
            return False  # No startup in progress, allow announcement

        # Read the startup timestamp from marker
        with open(marker_path, 'r') as f:
            start_timestamp = f.read().strip()

        if not start_timestamp:
            return False

        # Parse timestamp and compare with now
        from datetime import datetime
        start_time = datetime.fromisoformat(start_timestamp)
        now = datetime.now()
        elapsed_seconds = (now - start_time).total_seconds()

        # DEBUG: Log timing
        debug_log = Path(os.getcwd()) / 'logs' / '.subagent_debug.log'
        with open(debug_log, 'a') as f:
            f.write(f"[{now.isoformat()}] Elapsed: {elapsed_seconds:.2f}s | Start: {start_timestamp}\n")

        # Within 10 seconds of startup? Suppress subagent announcements
        if elapsed_seconds < 10:
            with open(debug_log, 'a') as f:
                f.write(f"[{now.isoformat()}] SUPPRESSING (within grace period)\n")
            return True
        else:
            # Grace period expired, delete marker and allow announcements
            with open(debug_log, 'a') as f:
                f.write(f"[{now.isoformat()}] ALLOWING (grace period expired)\n")
            marker_path.unlink(missing_ok=True)
            return False

    except Exception as e:
        # DEBUG: Log errors
        debug_log = Path(os.getcwd()) / 'logs' / '.subagent_debug.log'
        try:
            with open(debug_log, 'a') as f:
                from datetime import datetime
                f.write(f"[{datetime.now().isoformat()}] ERROR: {str(e)}\n")
        except:
            pass
        # On any error, allow announcement (fail open)
        return False


def announce_subagent_completion():
    """Announce subagent completion using the best available TTS service."""
    try:
        # Suppress announcements during startup grace period (first 10 seconds)
        # This prevents cleanup noise when session starts
        if is_within_startup_grace_period():
            return  # Skip announcement during startup

        # Check if voice is enabled before proceeding
        if not is_voice_enabled():
            return  # Voice disabled, skip announcement

        tts_script = get_tts_script_path()
        if not tts_script:
            return  # No TTS scripts available

        # Get TARS-style completion message
        completion_message = get_subagent_completion_messages()

        # Call the TTS script with the completion message
        subprocess.run([
            "uv", "run", tts_script, completion_message
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
        parser.add_argument('--chat', action='store_true', help='Copy transcript to chat.json')
        args = parser.parse_args()
        
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Extract required fields
        session_id = input_data.get("session_id", "")
        stop_hook_active = input_data.get("stop_hook_active", False)

        # Ensure log directory exists
        log_dir = os.path.join(os.getcwd(), "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_path = os.path.join(log_dir, "subagent_stop.json")

        # Read existing log data or initialize empty list
        if os.path.exists(log_path):
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        # Append new data
        log_data.append(input_data)
        
        # Write back to file with formatting
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Handle --chat switch (same as stop.py)
        if args.chat and 'transcript_path' in input_data:
            transcript_path = input_data['transcript_path']
            if os.path.exists(transcript_path):
                # Read .jsonl file and convert to JSON array
                chat_data = []
                try:
                    with open(transcript_path, 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                try:
                                    chat_data.append(json.loads(line))
                                except json.JSONDecodeError:
                                    pass  # Skip invalid lines
                    
                    # Write to logs/chat.json
                    chat_file = os.path.join(log_dir, 'chat.json')
                    with open(chat_file, 'w') as f:
                        json.dump(chat_data, f, indent=2)
                except Exception:
                    pass  # Fail silently

        # Announce subagent completion via TTS
        announce_subagent_completion()

        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == "__main__":
    main()