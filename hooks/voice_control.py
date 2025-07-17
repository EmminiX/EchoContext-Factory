#!/usr/bin/env python3
"""
Voice Control Script for Context Engineering Factory
Handles enabling, disabling, and toggling voice announcements
"""

import argparse
import json
import os
import sys
from pathlib import Path


def get_factory_config_path():
    """Get path to factory configuration file."""
    return Path.home() / '.claude' / 'config' / 'factory.json'


def load_factory_config():
    """Load current factory configuration."""
    config_path = get_factory_config_path()
    
    if not config_path.exists():
        print("❌ Factory configuration not found")
        print(f"   Expected: {config_path}")
        print("💡 Please run /start-project first to initialize the factory")
        sys.exit(1)
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in factory configuration: {e}")
        print(f"🔧 Please check {config_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to read factory configuration: {e}")
        sys.exit(1)


def save_factory_config(config):
    """Save updated factory configuration."""
    config_path = get_factory_config_path()
    
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"❌ Failed to save factory configuration: {e}")
        print(f"🔧 Please check permissions for {config_path}")
        sys.exit(1)


def set_voice_state(new_state):
    """Set voice announcements to specified state."""
    # Load current configuration
    config = load_factory_config()
    
    # Update all voice-related settings
    config['voice'] = {
        'factoryNotifications': new_state,
        'phaseAnnouncements': new_state,
        'progressUpdates': new_state,
        'completionCelebration': new_state,
        'personalizedMessages': new_state,
        'nameUsageRate': 0.7 if new_state else 0.0
    }
    
    # Save updated configuration
    save_factory_config(config)
    
    # Provide user feedback
    print()
    if new_state:
        print("🔊 Voice announcements ENABLED")
        print()
        print("✅ Factory notifications will be announced")
        print("✅ Progress updates will be spoken")
        print("✅ Completion celebrations will play")
        print("✅ Personalized messages active")
        print()
        print("🎯 Perfect for engaging factory experience!")
        print()
        print("💡 Use /voice-toggle to disable voice features")
    else:
        print("🔇 Voice announcements DISABLED")
        print()
        print("❌ Factory notifications silenced")
        print("❌ Progress updates muted")
        print("❌ Completion celebrations off")
        print("❌ Personalized messages disabled")
        print()
        print("🤫 Perfect for quiet work environments!")
        print()
        print("💡 Use /voice-toggle to enable voice features")
    
    print("⚙️ Changes take effect immediately for new operations")
    print()


def toggle_voice_state():
    """Toggle voice announcements between enabled and disabled."""
    # Load current configuration
    config = load_factory_config()
    
    # Get current voice state
    voice_config = config.get('voice', {})
    current_state = voice_config.get('factoryNotifications', True)
    new_state = not current_state
    
    # Set to new state
    set_voice_state(new_state)
    
    # Add toggle-specific feedback
    if new_state:
        print("💡 Use /voice-toggle again to disable")
    else:
        print("💡 Use /voice-toggle again to enable")
    print()


def get_voice_status():
    """Get current voice announcement status."""
    try:
        config = load_factory_config()
        voice_config = config.get('voice', {})
        is_enabled = voice_config.get('factoryNotifications', True)
        
        print()
        if is_enabled:
            print("🔊 Voice announcements are currently ENABLED")
            print("✅ Factory operations will include voice feedback")
        else:
            print("🔇 Voice announcements are currently DISABLED")
            print("❌ Factory operations will be silent")
        print()
        
    except SystemExit:
        # Config file issues already handled
        pass


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Control Context Engineering Factory voice announcements')
    parser.add_argument('--enable', action='store_true', help='Enable voice announcements')
    parser.add_argument('--disable', action='store_true', help='Disable voice announcements')
    parser.add_argument('--toggle', action='store_true', help='Toggle voice announcements')
    parser.add_argument('--status', action='store_true', help='Show current voice status')
    
    args = parser.parse_args()
    
    try:
        if args.enable:
            set_voice_state(True)
        elif args.disable:
            set_voice_state(False)
        elif args.toggle:
            toggle_voice_state()
        elif args.status:
            get_voice_status()
        else:
            # Default behavior: toggle
            toggle_voice_state()
            
    except KeyboardInterrupt:
        print("\n❌ Voice control cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print("🔧 Please check your factory configuration")
        sys.exit(1)


if __name__ == '__main__':
    main()