Toggle ALL voice announcements on/off for Claude Code and Context Engineering Factory.

The command automatically detects the current voice setting and switches to the opposite state:
- 🔊 **Voice ON** → 🔇 **Voice OFF** 
- 🔇 **Voice OFF** → 🔊 **Voice ON**

When voice is disabled, ALL these announcements are silenced:
- 🏭 **Factory announcements**: Phase updates, progress, celebrations, personalized messages
- 🤖 **Claude Code announcements**: Permission requests, task completions, subagent completions, waiting notifications

```bash
python3 ~/.claude/hooks/voice_control.py --toggle
```

## 🎯 Usage Examples

### **Basic Toggle**
```bash
# Toggle voice state (on → off or off → on)
/voice-toggle
```

### **Expected Output When Enabling:**
```
🔊 Voice announcements ENABLED

✅ Factory notifications will be announced
✅ Progress updates will be spoken  
✅ Completion celebrations will play
✅ Personalized messages active

🎯 Perfect for engaging factory experience!

💡 Use /voice-toggle to disable voice features
⚙️ Changes take effect immediately for new operations
```

### **Expected Output When Disabling:**
```
🔇 Voice announcements DISABLED

❌ Factory notifications silenced
❌ Progress updates muted
❌ Completion celebrations off
❌ Personalized messages disabled

🤫 Perfect for quiet work environments!

💡 Use /voice-toggle to enable voice features
⚙️ Changes take effect immediately for new operations
```

## 🔧 Technical Details

### **Configuration Changes**
The command modifies these settings in `factory.json`:

```json
{
  "voice": {
    "factoryNotifications": true/false,
    "phaseAnnouncements": true/false,
    "progressUpdates": true/false,
    "completionCelebration": true/false,
    "personalizedMessages": true/false,
    "nameUsageRate": 0.7/0.0
  }
}
```

### **Hook Integration**
The voice toggle affects ALL Claude Code hooks with TTS:
- `notification.py` - Permission requests, waiting notifications
- `stop.py` - Task completion announcements
- `subagent_stop.py` - Subagent completion announcements  
- `factory_notification.py` - Factory-specific announcements
- All TodoWrite-triggered notifications

### **State Persistence**
Voice preferences are:
- ✅ **Saved permanently** in factory configuration
- ✅ **Applied immediately** to new operations
- ✅ **Remembered across sessions** 
- ✅ **Consistent across all factory features**

## 🎪 User Experience

### **Visual Feedback**
Clear status indicators show current state:
- 🔊 **Enabled**: Green checkmarks with sound descriptions
- 🔇 **Disabled**: Red X marks with silence descriptions

### **Immediate Effect**
Changes take effect right away:
- **Next factory operation** will use new voice setting
- **Currently running operations** continue with old setting
- **New TodoWrite hooks** respect updated configuration

### **Easy Reversal**
Simple to change your mind:
- **Same command** toggles back and forth
- **No complex options** or arguments needed
- **Clear instructions** for how to switch back

## 🔒 Safety Features

### **Configuration Backup**
Before making changes:
- ✅ **Validates configuration file** exists and is readable
- ✅ **Checks JSON format** is valid
- ✅ **Preserves other settings** unchanged
- ✅ **Graceful error handling** if file operations fail

### **Error Handling**
If something goes wrong:
```javascript
try {
  // Configuration modification
} catch (error) {
  console.error('❌ Failed to toggle voice settings:', error.message);
  console.log('🔧 Please check ~/.claude/config/factory.json permissions');
  console.log('💡 You can manually edit the "voice" section if needed');
}
```

## 🎯 Use Cases

### **When to Disable Voice**
- 🤫 **Quiet environments** (libraries, meetings, late night coding)
- 🎧 **Focus sessions** (deep work without interruptions) 
- 👥 **Shared spaces** (open offices, coworking spaces)
- 🔇 **Personal preference** (some users prefer silent operation)

### **When to Enable Voice**
- 🏠 **Private workspace** (home office, personal setup)
- 👂 **Accessibility needs** (audio feedback helpful)
- 🎪 **Engaging experience** (voice makes factory more fun)
- 📱 **Multitasking** (audio alerts while doing other work)

## 🌟 Integration with Other Commands

### **Works With All Voice Features:**
- ✅ `/start-project` factory operations
- ✅ `/multiagent` coordination announcements  
- ✅ `/generate-prp` progress updates
- ✅ TodoWrite hook notifications
- ✅ Any future voice-enabled features

### **Respects User Preferences:**
The voice system checks configuration before every announcement:
```python
# In factory_notification.py
def should_announce():
    config = load_factory_config()
    return config.get('voice', {}).get('factoryNotifications', True)
```

## 💡 Pro Tips

### **Quick Check Current Status**
Look at your factory config to see current state:
```bash
# Check current voice settings
cat ~/.claude/config/factory.json | grep -A 10 "voice"
```

### **Temporary Disable**
For temporary silence without changing settings:
- **Mute your system audio** for immediate silence
- **Use /voice-toggle** for persistent preference change

### **Accessibility Considerations**
Voice announcements can be:
- 👂 **Helpful for visually impaired users**
- 🧠 **Useful for neurodivergent users** (audio confirmation)
- 📚 **Educational** (learn factory phases through audio)

---

*Document Version: 1.0*
*Generated by EchoContext Factory v2.1.0*
*Designed by Emmi C. (https://emmi.zone) - Built with Claude Code*

**🔊 Voice Toggle Command v2.1.0**
Simple, instant control over your Context Engineering Factory voice experience! 🎯