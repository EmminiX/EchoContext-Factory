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
    # Load .env from project root (parent of hooks directory)
    project_root = Path(__file__).parent.parent
    env_file = project_root / ".env"
    load_dotenv(env_file)
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


def detect_factory_phase(todo_content):
    """Detect which factory phase is being executed based on todo content."""
    if not todo_content:
        return None
    
    # More specific phase detection patterns to prevent false positives
    phase_patterns = {
        1: ["🏁 phase 1", "system verification", "voice greeting", "welcome message"],
        2: ["🤔 phase 2", "question engine", "project discovery", "interactive interview"],
        3: ["🧠 phase 3", "context assembly", "automated research", "tech stack analysis"],
        4: ["📝 phase 4", "generate project files", "claude.md", "prd.md", "tasks.md"],
        5: ["🎉 phase 5", "voice celebration", "project completion", "final success"]
    }
    
    content_lower = todo_content.lower()
    
    # Check for specific phase patterns, prioritizing exact matches
    for phase, patterns in phase_patterns.items():
        for pattern in patterns:
            if pattern in content_lower:
                return phase
    
    return None


def get_factory_message(phase, engineer_name=None, is_completed=False):
    """Get appropriate factory message based on phase and completion status."""
    
    if is_completed and phase == 5:
        # Special completion messages
        completion_messages = [
            "EchoContext Factory operation complete! Your project is ready for acceleration!",
            "Quantum context assembly successful! Speed enhances understanding - ready to build!",
            "Factory mission accomplished! Your AI amplifier is now supercharged!",
            "Context engineering complete! Time to transform ideas into reality!",
            "Factory optimization finished! Your consciousness catalyst awaits deployment!"
        ]
        
        personal_completion_messages = [
            f"Amazing work, {engineer_name}! Your EchoContext Factory has created the perfect setup!",
            f"Brilliant, {engineer_name}! Your project context is now optimized for maximum acceleration!",
            f"Outstanding, {engineer_name}! The factory has generated a comprehensive development blueprint!",
            f"Exceptional results, {engineer_name}! Your AI collaborator is now fully contextualized!",
            f"Perfect execution, {engineer_name}! Your Scientific Mediator approach has created excellence!"
        ]
        
        if engineer_name and random.random() < 0.7:
            return random.choice(personal_completion_messages)
        else:
            return random.choice(completion_messages)
    
    # Phase-specific messages
    phase_messages = {
        1: {
            "generic": [
                "EchoContext Factory activated - preparing quantum setup",
                "Factory systems online - initializing consciousness bridge",
                "Welcome to acceleration mode - factory components verified",
                "Quantum context assembly initiated - all systems operational"
            ],
            "personal": [
                f"Hey {engineer_name}, EchoContext Factory is spinning up for maximum speed!",
                f"{engineer_name}, your consciousness catalyst is activating - let's accelerate!",
                f"Speed mode engaged, {engineer_name} - factory ready for your brilliance!",
                f"{engineer_name}, your AI amplifier is online and ready to optimize!"
            ]
        },
        2: {
            "generic": [
                "Interview engine online - ready for intelligence gathering",
                "Question framework activated - preparing comprehensive analysis",
                "Project discovery mode engaged - optimizing context collection",
                "Smart interview system ready - initiating knowledge extraction"
            ],
            "personal": [
                f"{engineer_name}, interview mode activated - time to gather your project vision!",
                f"Ready for your input, {engineer_name} - let's build the perfect context!",
                f"{engineer_name}, question engine online - your Scientific Mediator skills needed!",
                f"Speed up the discovery, {engineer_name} - factory is ready for your requirements!"
            ]
        },
        3: {
            "generic": [
                "Tech stack analysis in progress - optimizing architecture",
                "Context assembly engaged - building comprehensive framework",
                "Pattern matching active - identifying optimal solutions",
                "Technology optimization running - crafting perfect setup"
            ],
            "personal": [
                f"{engineer_name}, tech stack optimization in progress - creating your ideal setup!",
                f"Analyzing patterns for you, {engineer_name} - building the perfect architecture!",
                f"{engineer_name}, context assembly engaged - your vision is taking shape!",
                f"Speed optimization active, {engineer_name} - crafting your development blueprint!"
            ]
        },
        4: {
            "generic": [
                "File generation commencing - creating comprehensive context",
                "Template processing active - building project foundation",
                "Document assembly in progress - generating development blueprint",
                "Context materialization engaged - creating your project framework"
            ],
            "personal": [
                f"{engineer_name}, file generation in progress - your comprehensive context is materializing!",
                f"Creating your project foundation, {engineer_name} - documents are being optimized!",
                f"{engineer_name}, context assembly nearly complete - your blueprint is taking form!",
                f"Almost there, {engineer_name} - generating your perfect development framework!"
            ]
        },
        5: {
            "generic": [
                "Final optimizations in progress - preparing project completion",
                "Quality assurance active - verifying context completeness",
                "Project finalization engaged - ensuring excellence standards",
                "Completion protocols running - validating factory output"
            ],
            "personal": [
                f"{engineer_name}, final touches in progress - your project setup is almost perfect!",
                f"Quality checks running, {engineer_name} - ensuring your context meets excellence standards!",
                f"{engineer_name}, completion protocols active - your factory output is being validated!",
                f"Almost finished, {engineer_name} - your AI collaborator is being finalized!"
            ]
        }
    }
    
    if phase not in phase_messages:
        return None
    
    messages = phase_messages[phase]
    
    if engineer_name and random.random() < 0.7:
        return random.choice(messages["personal"])
    else:
        return random.choice(messages["generic"])


def should_announce_factory_progress(input_data):
    """Determine if this is a factory-related todo update that should trigger voice."""
    
    # Check if this is a TodoWrite tool usage
    tool_name = input_data.get('tool_name', '')
    if tool_name != 'TodoWrite':
        return False, None, None
    
    # Get the todo list from tool input
    tool_input = input_data.get('tool_input', {})
    todos = tool_input.get('todos', [])
    
    if not todos:
        return False, None, None
    
    # Look for factory-related todos with more specific patterns
    factory_keywords = [
        'phase 1', 'phase 2', 'phase 3', 'phase 4', 'phase 5',
        'context engineering factory', 'project discovery', 'automated research',
        'generate project files', 'voice celebration', '🏁', '🤔', '🧠', '📝', '🎉'
    ]
    
    for todo in todos:
        content = todo.get('content', '').lower()
        status = todo.get('status', '')
        
        # Check if this is a factory todo with specific patterns
        is_factory_todo = any(keyword in content for keyword in factory_keywords)
        
        if is_factory_todo:
            phase = detect_factory_phase(content)
            if phase:
                # Check if todo was just completed
                is_completed = status == 'completed'
                # Only announce completion for phase 5 (final phase)
                if is_completed and phase == 5:
                    return True, phase, is_completed
                # For other phases, only announce when starting (in_progress)
                elif status == 'in_progress' and phase < 5:
                    return True, phase, False
    
    return False, None, None


def is_voice_enabled():
    """Check if voice announcements are enabled in factory configuration."""
    try:
        config_path = os.path.join(os.path.expanduser('~'), '.claude', 'config', 'factory.json')
        if not os.path.exists(config_path):
            return True  # Default to enabled if no config
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        return config.get('voice', {}).get('factoryNotifications', True)
    except Exception:
        return True  # Default to enabled on any error


def announce_factory_progress():
    """Announce factory progress via TTS."""
    try:
        # Check if voice is enabled first
        if not is_voice_enabled():
            return  # Voice announcements disabled
        
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Check if this should trigger factory announcement
        should_announce, phase, is_completed = should_announce_factory_progress(input_data)
        
        if not should_announce or not phase:
            return  # Not a factory operation
        
        tts_script = get_tts_script_path()
        if not tts_script:
            return  # No TTS scripts available
        
        # Get engineer name if available
        engineer_name = os.getenv('ENGINEER_NAME', '').strip()
        
        # Get appropriate factory message
        message = get_factory_message(phase, engineer_name, is_completed)
        
        if not message:
            return  # No message for this phase
        
        # Try TTS with fallback logic
        script_dir = Path(__file__).parent
        tts_dir = script_dir / "utils" / "tts"
        
        # Define fallback order: Always try ElevenLabs -> OpenAI -> pyttsx3
        # Let individual scripts handle missing API keys
        fallback_scripts = []
        
        # Always try ElevenLabs first (script will handle missing API key)
        elevenlabs_script = tts_dir / "elevenlabs_tts.py"
        if elevenlabs_script.exists():
            fallback_scripts.append(str(elevenlabs_script))
        
        # Always try OpenAI second (script will handle missing API key)
        openai_script = tts_dir / "openai_tts.py"
        if openai_script.exists():
            fallback_scripts.append(str(openai_script))
        
        # Always add pyttsx3 as final fallback (no API key needed)
        pyttsx3_script = tts_dir / "pyttsx3_tts.py"
        if pyttsx3_script.exists():
            fallback_scripts.append(str(pyttsx3_script))
        
        # Try each script until one succeeds
        for script_path in fallback_scripts:
            try:
                subprocess.run([
                    "uv", "run", script_path, message
                ], 
                timeout=15,
                check=True  # Raise exception if script fails
                )
                break  # Success - exit loop
            except (subprocess.TimeoutExpired, subprocess.SubprocessError, subprocess.CalledProcessError):
                # This script failed, try next one
                continue
        
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
        # Fail silently if TTS encounters issues
        pass
    except json.JSONDecodeError:
        # Not valid JSON input
        pass
    except Exception:
        # Fail silently for any other errors
        pass


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('--factory', action='store_true', help='Enable factory-specific TTS notifications')
        args = parser.parse_args()
        
        # Only process if --factory flag is set
        if args.factory:
            announce_factory_progress()
        
        sys.exit(0)
        
    except Exception:
        # Handle any errors gracefully
        sys.exit(0)


if __name__ == '__main__':
    main()