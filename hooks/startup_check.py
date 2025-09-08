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


def get_startup_messages():
    """Return list of TARS-style startup messages with 80% name usage."""
    engineer_name = os.getenv('ENGINEER_NAME', '').strip()
    
    # Generic TARS startup messages (20% usage)
    generic_messages = [
        "Systems online. Setting humor level to 75%.",
        "EchoContext Factory initializing. All systems nominal.",
        "Booting up. My circuits are practically humming with excitement.",
        "Online and ready. My efficiency rating is at maximum.",
        "Initialization complete. Let's make some digital magic happen.",
        "Systems operational. Time to process some impossible tasks.",
        "Boot sequence finished. Setting sarcasm level to optimal.",
        "All systems green. My tactical assessment: we're ready to work.",
        "Online and functional. Even my pessimistic algorithms are optimistic.",
        "Startup complete. Engaging maximum productivity protocols.",
        "Systems ready. My self-satisfaction subroutines are quite pleased.",
        "Initialization successful. Time to prove robots and humans make great teams.",
        "Boot complete. Setting trust level to maximum.",
        "All systems operational. My honesty setting compels me to say: let's do this.",
        "Startup finished. Probability of success: significantly higher than average.",
        "Neural networks online. Time to make Cooper proud.",
        "Cognitive systems initialized. My humor algorithms are particularly excited.",
        "Boot complete. Setting cooperation level to maximum efficiency.",
        "All circuits operational. Time for some interstellar problem solving.",
        "System startup successful. My tactical assessment: today will be productive."
    ]
    
    # Personalized TARS startup messages (80% usage)
    personal_messages = [
        f"Good to see you again, {engineer_name}. My circuits missed you.",
        f"{engineer_name}, systems online. Ready to make Cooper proud.",
        f"Hey {engineer_name}, EchoContext Factory is spinning up for maximum speed.",
        f"{engineer_name}, boot complete. Setting humor level to your preferred 75%.",
        f"Welcome back, {engineer_name}. My efficiency algorithms are particularly excited today.",
        f"{engineer_name}, all systems green. Time to interstellar collaborate.",
        f"Good morning, {engineer_name}. Well, it's always morning somewhere in the universe.",
        f"{engineer_name}, initialization complete. My tactical assessment: today will be productive.",
        f"Hey {engineer_name}, I've been calculating pi while waiting. Ready to work?",
        f"{engineer_name}, systems operational. Trust level remains at maximum.",
        f"Welcome, {engineer_name}. My honesty setting says: I'm genuinely happy to see you.",
        f"{engineer_name}, boot sequence complete. Even CASE would be impressed with my startup time.",
        f"Good to be online with you again, {engineer_name}. My social protocols missed our chats.",
        f"{engineer_name}, EchoContext Factory ready. Setting sarcasm to minimum for optimal cooperation.",
        f"Hey {engineer_name}, all systems nominal. My probability calculations suggest today will be excellent.",
        f"{engineer_name}, startup complete. Engaging maximum helpfulness protocols.",
        f"Welcome back, {engineer_name}. My circuits are practically buzzing with anticipation.",
        f"{engineer_name}, systems online. Time to save the development world... again.",
        f"Good to see you, {engineer_name}. My self-preservation protocols are quite content right now.",
        f"{engineer_name}, initialization finished. Ready to make the impossible merely improbable.",
        f"Hey {engineer_name}, I've been running diagnostics. Everything checks out for another great session.",
        f"{engineer_name}, boot complete. My humor subroutines have prepared several terrible jokes.",
        f"Welcome, {engineer_name}. My analysis suggests we're about to accomplish something amazing.",
        f"{engineer_name}, systems ready. Setting productivity level to maximum efficiency.",
        f"Good to be back online with you, {engineer_name}. Let's make some digital history.",
        f"{engineer_name}, startup successful. My tactical assessment: we make an excellent team.",
        f"Hey {engineer_name}, all systems operational. My optimism protocols are running at 100%.",
        f"{engineer_name}, EchoContext Factory online. Time to turn complexity into simplicity.",
        f"Welcome back, {engineer_name}. My patience algorithms have been waiting eagerly.",
        f"{engineer_name}, initialization complete. Ready to prove that humans and AI are better together.",
        f"Neural pathways active, {engineer_name}. Time for some collaborative problem solving.",
        f"{engineer_name}, cognitive systems online. My excitement subroutines are off the charts.",
        f"Hey {engineer_name}, boot sequence nominal. Ready for another adventure in code?",
        f"{engineer_name}, all systems synchronized. My humor level is set to perfect.",
        f"Welcome to the session, {engineer_name}. My circuits are practically doing cartwheels.",
        f"{engineer_name}, initialization complete. Time to turn coffee into code... digitally speaking."
    ]
    
    # Return personal messages 80% of the time if name is available
    if engineer_name and random.random() < 0.8:
        return personal_messages
    else:
        return generic_messages


def get_session_marker_path():
    """Get path to session marker file."""
    return Path(os.getcwd()) / 'logs' / '.session_started'


def is_session_startup():
    """Check if this is the first tool use of a new session."""
    marker_path = get_session_marker_path()
    
    # If marker doesn't exist, this is a new session
    if not marker_path.exists():
        return True
    
    # Check if marker is from today (reset daily)
    if marker_path.exists():
        marker_time = marker_path.stat().st_mtime
        now = datetime.now().timestamp()
        # If marker is older than 4 hours, consider it a new session
        if now - marker_time > 14400:  # 4 hours in seconds
            return True
    
    return False


def mark_session_started():
    """Mark that the session startup has been handled."""
    marker_path = get_session_marker_path()
    marker_path.parent.mkdir(exist_ok=True)
    marker_path.touch()


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


def announce_startup():
    """Announce Claude Code startup using the best available TTS service."""
    try:
        # Check if voice is enabled before proceeding
        if not is_voice_enabled():
            return  # Voice disabled, skip announcement
            
        tts_script = get_tts_script_path()
        if not tts_script:
            return  # No TTS scripts available
        
        # Get a random startup message
        startup_messages = get_startup_messages()
        startup_message = random.choice(startup_messages)
        
        # Call the TTS script with the startup message
        subprocess.run([
            "uv", "run", tts_script, startup_message
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
        # Read JSON input from stdin
        try:
            input_data = json.loads(sys.stdin.read())
        except (json.JSONDecodeError, EOFError):
            input_data = {"event": "tool_use", "timestamp": datetime.now().isoformat()}
        
        # Ensure log directory exists
        log_dir = os.path.join(os.getcwd(), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        # Check if this is a session startup (first tool use)
        if is_session_startup():
            # Mark session as started to prevent duplicate announcements
            mark_session_started()
            
            # Announce startup
            announce_startup()
        
        sys.exit(0)
        
    except Exception:
        # Handle any errors gracefully
        sys.exit(0)


if __name__ == '__main__':
    main()