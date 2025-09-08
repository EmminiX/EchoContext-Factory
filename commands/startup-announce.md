# 🎵 Startup Announcement

**Purpose**: Trigger TARS-style startup announcement when Claude Code session begins

## How to Use

Simply type:
```
/startup-announce
```

## What This Does

This command triggers a personalized TARS-style voice announcement to welcome you to your Claude Code session:

- **🎯 Personalized Messages**: Uses your `ENGINEER_NAME` from environment for 80% of announcements
- **🤖 TARS Personality**: Witty, helpful, and engaging startup messages
- **🔊 3-Tier TTS**: ElevenLabs → OpenAI → System Voice fallback
- **♿ Accessibility**: Respects voice settings and can be disabled via `/voice-toggle`

## Example Messages

**Personalized (when ENGINEER_NAME is set):**
- "Good to see you again, Sarah. My circuits missed you."
- "Hey Alex, EchoContext Factory is spinning up for maximum speed."
- "Welcome back, Jordan. My efficiency algorithms are particularly excited today."

**Generic (20% of the time or no name set):**
- "Systems online. Setting humor level to 75%."
- "EchoContext Factory initializing. All systems nominal."
- "Booting up. My circuits are practically humming with excitement."

## Configuration

**Voice Control**: 
- Enable/disable: `/voice-toggle`
- Check status: `/voice-status`

**Personalization**:
Add to your `~/.claude/.env` file:
```bash
ENGINEER_NAME=YourName
ELEVENLABS_API_KEY=your_key_here  # Best quality
OPENAI_API_KEY=your_key_here      # Good quality
```

## Pro Tip

Run `/startup-announce` at the beginning of each session to get that engaging AI companion experience that makes coding feel less lonely!

---

*Part of EchoContext Factory v2.5.0 - Voice-enabled AI assistant for Claude Code*