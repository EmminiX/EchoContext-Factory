# Voice Hooks Fix Summary

## Issues Fixed

### 1. ✅ Project-Aware Configuration Paths
**Problem:** All hooks were hardcoded to look for `~/.claude/config/factory.json`, causing them to fail when running Claude Code from any directory other than `~/.claude/`.

**Solution:** Updated all hooks to search for configs in order:
1. **Project-local:** `<current_dir>/.claude/config/factory.json` (first priority)
2. **Global fallback:** `~/.claude/config/factory.json`

**Updated Files:**
- ✅ `voice_control.py`
- ✅ `startup_check.py`
- ✅ `notification.py`
- ✅ `stop.py`
- ✅ `factory_notification.py`
- ✅ `subagent_stop.py`
- ✅ `start.py`

**New Pattern:**
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

---

### 2. ✅ Startup Voice Announcements
**Problem:** When starting Claude Code, you were hearing "Agent task complete" / "Mission accomplished" messages (subagent completion announcements) instead of proper startup greetings.

**Root Cause:**
- No `SessionStart` hook was configured
- `startup_check.py` was running on **PostToolUse** (first tool execution), which happens AFTER session start
- SubagentStop hook was firing during cleanup, announcing task completions

**Solution:** Properly configured `SessionStart` hook with `start.py`

**Changes Made:**
1. **Updated `start.py`:**
   - Added project-aware config path detection
   - Removed `--startup` flag requirement (always announces)
   - Simplified to just announce startup when SessionStart fires

2. **Updated `settings.json`:**
   - Added `SessionStart` hook → `start.py`
   - Removed `startup_check.py` from `PostToolUse` hook

**Hook Flow Now:**
```
SessionStart → start.py → TARS startup greeting
             ↓
"Good to see you again, EMMI. My circuits missed you."
"EMMI, systems online. Ready to make Cooper proud."
"Hey EMMI, EchoContext Factory is spinning up for maximum speed."
```

---

### 3. ✅ Startup Grace Period (NEW FIX)

**Problem:** SubagentStop hook was firing 2-3 times during session cleanup at startup, causing "Agent task complete" announcements to overlap with and interrupt the startup greeting.

**Root Cause:**
- Claude Code cleans up previous sessions/subagents when starting
- SubagentStop hook triggered multiple times in first few seconds
- Announcements played simultaneously with startup message

**Solution:** Added 10-second startup grace period to `subagent_stop.py`

**Implementation:**
```python
def is_within_startup_grace_period():
    """Check if we're within 10 seconds of session start."""
    # Read logs/start.json to get most recent session start time
    # Compare with current time
    # Return True if < 10 seconds elapsed
    return elapsed_seconds < 10
```

**Effect:**
- ✅ Startup greeting plays cleanly without interruption
- ✅ Subagent completion announcements suppressed for first 10 seconds
- ✅ Normal subagent announcements resume after grace period

---

## Message Types Reference

### 🟢 Startup Messages (start.py)
Triggered by: **SessionStart hook** (when Claude Code launches)

**Examples:**
- "Good to see you again, EMMI. My circuits missed you."
- "EMMI, systems online. Ready to make Cooper proud."
- "Hey EMMI, EchoContext Factory is spinning up for maximum speed."
- "Welcome back, EMMI. My efficiency algorithms are particularly excited today."

### 🔵 Completion Messages (stop.py)
Triggered by: **Stop hook** (when you stop Claude Code)

**Examples:**
- "Mission accomplished, EMMI. Even Cooper would be proud."
- "EMMI, task complete. My efficiency rating just went up."
- "All done, EMMI. I'd take a bow, but I lack the joints."
- "Task accomplished, EMMI. I'm practically glowing... if I could glow."

### 🟡 Subagent Completion (subagent_stop.py)
Triggered by: **SubagentStop hook** (when specialized agents finish tasks)

**Smart Filtering:** Suppressed during first 10 seconds of session to avoid startup noise

**Examples:**
- "Agent reporting back, EMMI. Mission accomplished."
- "EMMI, subagent task complete. Trust level remains maximum."
- "Mission finished, EMMI. Your digital worker bee has delivered."
- "Subagent reporting, EMMI. Work complete and humor level intact."

### 🟣 Notification Messages (notification.py)
Triggered by: **Notification hook** (when Claude needs user input)

**Examples:**
- "EMMI, my circuits are getting lonely. Care to chat?"
- "Hey EMMI, I'd set my humor to 100% but that might crash your brain."
- "EMMI, my honesty setting compels me to say: I need your input."
- "Cooper - I mean EMMI - time to interstellar collaborate."

### 🟠 Factory Phase Messages (factory_notification.py)
Triggered by: **PostToolUse → TodoWrite matcher** (during /start-project factory phases)

**Examples:**
- "Hey EMMI, EchoContext Factory is spinning up for maximum speed!"
- "EMMI, interview mode activated - time to gather your project vision!"
- "Analyzing patterns for you, EMMI - building the perfect architecture!"
- "Creating your project foundation, EMMI - documents are being optimized!"

---

## Testing

### Test Project-Aware Configs

**Test 1: Global Config (~/. claude/)**
```bash
cd ~/.claude
# Run Claude Code
# ✅ Should use ~/.claude/config/factory.json
# ✅ Should hear startup greeting
```

**Test 2: Project-Local Config**
```bash
cd /path/to/project
mkdir -p .claude/config
cp ~/.claude/config/factory.json .claude/config/
# Run Claude Code
# ✅ Should use /path/to/project/.claude/config/factory.json
# ✅ Should hear startup greeting
```

**Test 3: Multiple Projects**
```bash
# Each project can now have its own voice settings!
cd ~/project-a
# Edit .claude/config/factory.json → voice disabled
# Run Claude Code → silent

cd ~/project-b
# Edit .claude/config/factory.json → voice enabled
# Run Claude Code → TARS greetings
```

---

## Configuration Files

### Voice Control
**Location:** `.claude/config/factory.json`

**Structure:**
```json
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
```

**Toggle Voice:**
```bash
/voice-toggle  # Quick toggle on/off
/voice-status  # Check current state
```

---

## Architecture

### Hook Execution Order

```
1. SessionStart → start.py
   └─ Announces: TARS startup greeting

2. [User interacts with Claude]

3. PostToolUse → post_tool_use.py
   └─ Logs tool usage

4. PostToolUse (TodoWrite matcher) → factory_notification.py
   └─ Announces: Factory phase progress (if /start-project running)

5. Notification → notification.py
   └─ Announces: TARS asking for input

6. SubagentStop → subagent_stop.py
   └─ Announces: Agent task completion

7. Stop → stop.py
   └─ Announces: Session completion
```

### Environment Variables

**Required for Personalized Messages:**
```bash
# In ~/.claude/.env
ENGINEER_NAME=EMMI

# TTS API Keys (priority order)
ELEVENLABS_API_KEY=your_key_here  # First priority
OPENAI_API_KEY=your_key_here      # Second priority
# Falls back to pyttsx3 (local) if no API keys
```

---

## Troubleshooting

### Issue: No voice announcements in projects
**Solution:** Ensure `.claude/config/factory.json` exists in project or fallback to `~/.claude/config/factory.json`

### Issue: Hearing completion messages at startup
**Solution:** Fixed! SessionStart hook now properly handles startup announcements

### Issue: Voice works in ~/.claude but not elsewhere
**Solution:** Fixed! All hooks now support project-aware config paths

### Issue: Want to disable voice for specific project
**Solution:**
```bash
cd /path/to/project
mkdir -p .claude/config
cat > .claude/config/factory.json << 'EOF'
{
  "voice": {
    "factoryNotifications": false
  }
}
EOF
```

---

## Summary

✅ **All hooks are now project-aware**
✅ **SessionStart hook properly announces startup**
✅ **Clear separation between startup, completion, and agent messages**
✅ **Voice settings can be configured per-project or globally**
✅ **TARS personality intact across all message types**

**Next time you start Claude Code, you should hear:**
> "Good to see you again, EMMI. My circuits missed you."

Instead of:
> "Agent reporting back, EMMI. Mission accomplished."

🎉 **Enjoy your properly-timed TARS greetings!**
