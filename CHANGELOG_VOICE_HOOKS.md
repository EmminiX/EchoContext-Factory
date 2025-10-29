# Voice Hooks Changelog

## 2025-10-29 - Voice Hooks Fix (v2)

### 🎯 Fixed Issues

#### 1. Project-Aware Configuration Paths
**Problem:** Voice hooks only worked when running Claude Code from `~/.claude/` directory. Running from any other directory would cause hooks to fail silently because they were hardcoded to look for `~/.claude/config/factory.json`.

**Solution:** All hooks now search for configuration files in this priority order:
1. **Project-local:** `<current_directory>/.claude/config/factory.json`
2. **Global fallback:** `~/.claude/config/factory.json`

**Affected Files:**
- `hooks/voice_control.py`
- `hooks/startup_check.py`
- `hooks/notification.py`
- `hooks/stop.py`
- `hooks/factory_notification.py`
- `hooks/subagent_stop.py`
- `hooks/start.py`

#### 2. Startup Voice Announcements
**Problem:** When starting Claude Code, users were hearing "Agent task complete" / "Mission accomplished" messages (subagent completion announcements) instead of proper TARS startup greetings.

**Root Cause:**
- No `SessionStart` hook was configured
- `startup_check.py` was running on `PostToolUse` (after first tool execution)
- `SubagentStop` hook was firing during cleanup

**Solution:**
- Added `SessionStart` hook that triggers `start.py`
- Removed `startup_check.py` from `PostToolUse` hook
- Updated `start.py` to always announce on SessionStart (removed --startup flag requirement)

**Settings Change:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "uv run hooks/start.py"
          }
        ]
      }
    ]
  }
}
```

### ✨ Benefits

1. **Portable Voice Configuration**
   - Each project can now have its own voice settings
   - Copy `.claude/config/factory.json` to any project directory
   - Enable voice for some projects, disable for others

2. **Correct Message Timing**
   - Startup: "Good to see you again, EMMI. My circuits missed you."
   - Completion: "Mission accomplished, EMMI. Even Cooper would be proud."
   - Subagent: "Agent reporting back, EMMI. Mission accomplished."

3. **Consistent TARS Personality**
   - All voice messages maintain TARS character (Interstellar)
   - 80% personalized (uses ENGINEER_NAME from .env)
   - 20% generic fallbacks

### 📝 Migration Guide

**For Existing Users:**

No action required! The changes are backward compatible. If you have `~/.claude/config/factory.json`, it will continue to work as a global fallback.

**For New Projects:**

To enable project-specific voice settings:

```bash
# In your project directory
mkdir -p .claude/config
cp ~/.claude/config/factory.json .claude/config/

# Or create from scratch
cat > .claude/config/factory.json << 'EOF'
{
  "voice": {
    "factoryNotifications": true,
    "phaseAnnouncements": true,
    "progressUpdates": true,
    "completionCelebration": true,
    "personalizedMessages": true,
    "nameUsageRate": 0.7
  }
}
EOF
```

### 🔧 Technical Details

**Code Pattern Added:**
```python
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
```

**Hook Execution Order (Updated):**
```
1. SessionStart → start.py
   └─ "Good to see you again, EMMI. My circuits missed you."

2. [User interacts with Claude]

3. PostToolUse → post_tool_use.py
   └─ Logs tool usage

4. PostToolUse (TodoWrite) → factory_notification.py
   └─ "Hey EMMI, EchoContext Factory is spinning up!"

5. Notification → notification.py
   └─ "EMMI, my circuits are getting lonely. Care to chat?"

6. SubagentStop → subagent_stop.py
   └─ "Agent reporting back, EMMI. Mission accomplished."

7. Stop → stop.py
   └─ "Mission accomplished, EMMI. Even Cooper would be proud."
```

#### 3. Startup Grace Period (v2 UPDATE)

**Problem:** After fixing issues 1 & 2, SubagentStop hook was still firing 2-3 times during session cleanup at startup, causing "Agent task complete" announcements to overlap with startup greetings.

**Root Cause:**
- Claude Code cleans up previous sessions/subagents when starting
- SubagentStop hook triggered multiple times in first few seconds
- Announcements interrupted startup message

**Solution:** Added 10-second startup grace period

**Changes:**
- `subagent_stop.py` now checks if within 10 seconds of session start
- Reads `logs/start.json` timestamp to determine session age
- Suppresses announcements during grace period
- Allows normal announcements after 10 seconds

**Code Added:**
```python
def is_within_startup_grace_period():
    """Check if we're within 10 seconds of session start."""
    marker_path = Path(os.getcwd()) / 'logs' / 'start.json'
    # Read most recent start time
    # Compare with now
    return elapsed_seconds < 10
```

**Result:**
- ✅ Clean startup with only one TARS greeting
- ✅ No overlapping announcements
- ✅ Subagent completions still announced after startup

---

### 🐛 Known Issues

None! All three fixes have been tested and deployed.

### 🙏 Credits

Fixed by EMMI (Emanuel Covasa) with Claude Code assistance.

**"Work smart, not hard. Move fast, see clearly. Build with gratitude."** 🚀
