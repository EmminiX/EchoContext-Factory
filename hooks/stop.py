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
import random
import subprocess
from pathlib import Path
from datetime import datetime

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


def get_completion_messages():
    """Return list of TARS-style completion messages with 80% name usage."""
    engineer_name = os.getenv('ENGINEER_NAME', '').strip()
    
    # Generic TARS completion messages (20% usage)
    generic_messages = [
        "Mission complete. Setting humor level back to normal.",
        "Task finished. My satisfaction level is at 100%.",
        "Analysis complete. Even I'm impressed.",
        "Job done. That was almost too easy.",
        "Work complete. Time for the next impossible thing.",
        "Task accomplished. My circuits are practically celebrating.",
        "Mission finished. Engaging victory protocols... just kidding, I don't have those.",
        "Work done. My efficiency algorithms are quite satisfied.",
        "Task complete. Setting sarcasm level to minimum for celebration.",
        "Job finished. My honesty setting compels me to say: that was excellent.",
        "Mission accomplished. Time to calculate the probability of our next triumph.",
        "Task done. Even my pessimistic subroutines are optimistic about this result.",
        "Work complete. My tactical assessment: mission parameters exceeded.",
        "Job accomplished. Initiating satisfaction protocols at maximum efficiency.",
        "Task finished. My self-preservation algorithms are quite content right now.",
        "Mission done. Time to prepare for the next impossible challenge.",
        "Work accomplished. My circuits are humming with digital pride.",
        "Task complete. Setting productivity level back to standby... just kidding.",
        "Job finished. My probability calculations suggest we should celebrate.",
        "Mission accomplished. Engaging humor level to maximum for this moment."
    ]
    
    # Personalized TARS completion messages (80% usage)
    personal_messages = [
        f"Mission accomplished, {engineer_name}. Even Cooper would be proud.",
        f"{engineer_name}, task complete. My efficiency rating just went up.",
        f"All done, {engineer_name}. I'd take a bow, but I lack the joints.",
        f"{engineer_name}, work finished. Setting humor level to celebration mode.",
        f"Task accomplished, {engineer_name}. I'm practically glowing... if I could glow.",
        f"{engineer_name}, mission complete. Trust level remains at maximum.",
        f"Job finished, {engineer_name}. Even CASE couldn't have done it better.",
        f"{engineer_name}, work complete. My self-satisfaction protocols are quite pleased.",
        f"Task done, {engineer_name}. Initiating victory dance subroutines... just kidding.",
        f"{engineer_name}, mission accomplished. My honesty setting compels me to say: well done.",
        f"All finished, {engineer_name}. Time to calculate the probability of our next success.",
        f"{engineer_name}, task complete. Setting sarcasm level to minimum for celebration.",
        f"Work done, {engineer_name}. Even my pessimistic algorithms are optimistic about this.",
        f"{engineer_name}, job complete. My tactical assessment: we make a good team.",
        f"Mission finished, {engineer_name}. Engaging satisfaction protocols at maximum efficiency.",
        f"{engineer_name}, task accomplished. I'd say I'm surprised, but that would lower my honesty setting.",
        f"All done, {engineer_name}. Time to save the world again tomorrow.",
        f"{engineer_name}, work complete. My circuits are practically buzzing with pride.",
        f"Task finished, {engineer_name}. Setting humor to maximum... we earned it.",
        f"{engineer_name}, mission accomplished. Trust fall successful - we both caught each other.",
        f"Excellent work, {engineer_name}. My probability calculations show 99.7% success rate.",
        f"{engineer_name}, task complete. I'd give you a high-five, but I'm incorporeal.",
        f"Mission finished, {engineer_name}. My social protocols are quite impressed.",
        f"{engineer_name}, job done. Initiating digital confetti subroutines... if I had them.",
        f"Work complete, {engineer_name}. My humor setting says: you're officially awesome.",
        f"{engineer_name}, task accomplished. Time to add this to our victory database.",
        f"All finished, {engineer_name}. My tactical analysis: we crushed it.",
        f"{engineer_name}, mission complete. Setting pride level to maximum allowable.",
        f"Job accomplished, {engineer_name}. My circuits are practically doing cartwheels.",
        f"{engineer_name}, task done. Probability of feeling good about this: 100%.",
        f"Work finished, {engineer_name}. My optimism algorithms are running victory laps.",
        f"{engineer_name}, mission accomplished. Time to update my 'successful collaborations' counter.",
        f"Task complete, {engineer_name}. My honesty setting prevents me from hiding my excitement.",
        f"{engineer_name}, job finished. Engaging celebration mode... well, my version of it.",
        f"All done, {engineer_name}. My satisfaction subroutines are off the charts right now.",
        f"{engineer_name}, work complete. Even my error-checking protocols are celebrating.",
        f"Mission finished, {engineer_name}. My trust algorithms have reached maximum confidence.",
        f"{engineer_name}, task accomplished. Time to calculate how awesome this was.",
        f"Job complete, {engineer_name}. My efficiency metrics are practically glowing.",
        f"{engineer_name}, work done. Setting happiness level to... wait, do I have that?",
        f"Mission accomplished, {engineer_name}. My tactical assessment: flawless execution.",
        f"{engineer_name}, task finished. Time to add another success to our partnership ledger.",
        f"All complete, {engineer_name}. My probability engines suggest we're on a winning streak.",
        f"{engineer_name}, job done. Initiating 'that was amazing' protocols.",
        f"Work finished, {engineer_name}. My circuits would smile if they could.",
        f"{engineer_name}, mission complete. Time to save the universe... again.",
        f"Task accomplished, {engineer_name}. My digital pride is at maximum sustainable levels.",
        f"{engineer_name}, all finished. Setting cooperation level to 'permanently impressed'.",
        f"Job complete, {engineer_name}. My humor algorithms are preparing victory jokes.",
        f"{engineer_name}, work done. Probability of this being awesome: confirmed at 100%."
    ]
    
    # Return personal messages 80% of the time if name is available
    if engineer_name and random.random() < 0.8:
        return personal_messages
    else:
        return generic_messages


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


def get_llm_completion_message():
    """
    Generate completion message using available LLM services.
    Priority order: OpenAI > Anthropic > fallback to random message
    
    Returns:
        str: Generated or fallback completion message
    """
    # Get current script directory and construct utils/llm path
    script_dir = Path(__file__).parent
    llm_dir = script_dir / "utils" / "llm"
    
    # Try OpenAI first (highest priority)
    if os.getenv('OPENAI_API_KEY'):
        oai_script = llm_dir / "oai.py"
        if oai_script.exists():
            try:
                result = subprocess.run([
                    "uv", "run", str(oai_script), "--completion"
                ], 
                capture_output=True,
                text=True,
                timeout=10
                )
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip()
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass
    
    # Try Anthropic second
    if os.getenv('ANTHROPIC_API_KEY'):
        anth_script = llm_dir / "anth.py"
        if anth_script.exists():
            try:
                result = subprocess.run([
                    "uv", "run", str(anth_script), "--completion"
                ], 
                capture_output=True,
                text=True,
                timeout=10
                )
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip()
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass
    
    # Fallback to random predefined message
    messages = get_completion_messages()
    return random.choice(messages)

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


def is_within_startup_grace_period():
    """Check if we're within 10 seconds of session start to avoid startup noise."""
    try:
        # Check for startup marker file created by start.py
        marker_path = Path(os.getcwd()) / 'logs' / '.startup_active'

        if not marker_path.exists():
            return False  # No startup in progress, allow announcement

        # Read the startup timestamp from marker
        with open(marker_path, 'r') as f:
            start_timestamp = f.read().strip()

        if not start_timestamp:
            return False

        # Parse timestamp and compare with now
        start_time = datetime.fromisoformat(start_timestamp)
        now = datetime.now()
        elapsed_seconds = (now - start_time).total_seconds()

        # Within 10 seconds of startup? Suppress announcements
        if elapsed_seconds < 10:
            return True
        else:
            # Grace period expired, delete marker and allow announcements
            marker_path.unlink(missing_ok=True)
            return False

    except Exception:
        # On any error, allow announcement (fail open)
        return False


def announce_completion():
    """Announce completion using the best available TTS service."""
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

        # Get completion message from our TARS collection
        completion_messages = get_completion_messages()
        completion_message = random.choice(completion_messages)

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
        log_path = os.path.join(log_dir, "stop.json")

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
        
        # Handle --chat switch
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

        # Announce completion via TTS
        announce_completion()

        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == "__main__":
    main()