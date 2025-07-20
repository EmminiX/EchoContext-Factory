# 🎵 EchoContext Factory

**Turn Claude Code into your personal AI assistant with voice guidance and zero prompt engineering**

---

## 🎯 Why Use This?

Transform your development workflow with:

- **🎵 Voice guidance** - Your AI talks to you throughout the process
- **🧠 Zero prompt engineering** - Just answer simple questions, no complex prompts needed  
- **📝 Instant documentation** - Auto-generates comprehensive project docs with live web research
- **♿ Neurodivergent-friendly** - One question at a time, clear structure, predictable flow
- **🚀 Multi-agent coordination** - Complex tasks handled by specialized AI agents in parallel

**Perfect for:** Developers who want engaging, accessible AI assistance without the complexity.

---

## 🚀 Quick Installation (3 Steps)

### Step 1: Download and Install
```bash
# Clone or download this repository
cd EchoContext-Factory

# Make the installer executable and run it
chmod +x install.sh
./install.sh
```

### Step 2: Add Your API Keys (Optional but Recommended)
```bash
# Edit the environment file
nano ~/.claude/.env

# Add your keys for enhanced voice features:
ELEVENLABS_API_KEY=your_key_here     # Best voice quality
OPENAI_API_KEY=your_key_here         # Good voice quality  
ENGINEER_NAME=YourName               # Personalizes voice messages
```
*Note: Works without API keys using your computer's built-in voice*

### Step 3: Start Building!
```bash
# In Claude Code, type any of these commands:
/start-project      # Interactive project setup with voice guidance
/voice-status       # Test that voice is working
```

**That's it!** Your AI assistant is now voice-enabled and ready to guide you.

---

## 🎵 What Makes This Special?

### 🗣️ Your AI Assistant Talks to You

Never feel alone while coding! Your assistant provides:

- **🎯 Progress updates** - "Creating your documentation..."
- **✅ Confirmations** - "Perfect! Moving to the next step"  
- **🎉 Celebrations** - "Amazing work! Your project is ready!"
- **❓ Gentle guidance** - "What type of project are you building?"

**Works 3 ways**: Premium voice (ElevenLabs) → Good voice (OpenAI) → Computer voice (always works)

### 🧠 Zero Mental Overhead

**Before**: Spend hours crafting the perfect prompt  
**After**: Just answer simple questions like "What's your project about?"

- One question at a time (never overwhelming)
- Smart follow-ups based on your answers
- No prompt engineering needed

### 📋 What You Get

Every project automatically generates:

```
📁 Your Project
├── 📄 CLAUDE.md         # Complete AI assistant context
├── 📋 PRD.md           # Professional requirements doc  
├── ✅ TASKS.md         # Step-by-step implementation guide
└── 🔗 Live web research # Current best practices included
```

**Real example**: Answer 8 simple questions → Get 3 comprehensive documents with current industry standards

---

## 🚀 Main Commands

### 🎯 Start a New Project
```bash
/start-project
```
**What happens**: Your assistant asks 8 simple questions about your project, then creates complete documentation with live web research.

**Example flow**:
1. 🗣️ "Hi! What's your project called?"
2. 📝 You: "My Recipe App" 
3. 🗣️ "What type of project is this?"
4. 📝 You: "Web Application"
5. *...continues for 6 more questions...*
6. 🔍 *Live web research happens automatically*
7. ✅ Three complete documents created!

### 🤖 Complex Task Help
```bash
/multiagent
```
**What happens**: Specialized AI agents work in parallel to research, analyze, and solve complex development challenges.

**Example**: "Help me implement user authentication" → Gets research report, security analysis, code examples, and testing strategy.

### 📋 Feature Requirements
```bash
/generate-prp
```
**What happens**: Creates detailed feature specifications with current best practices and security considerations.

**Example**: Describe a login feature → Get comprehensive requirements document with implementation details.

### 🔧 Quick Checks
```bash
/voice-status      # Test if voice is working
/voice-toggle      # Turn voice on/off
```

---

## 🤔 Need Help?

### 🔊 Voice Not Working?

**Try these in order:**

1. **Test it**: `/voice-status` 
2. **No sound?** Check your computer volume
3. **Want better voice?** Add API keys to `~/.claude/.env`:
   ```bash
   ELEVENLABS_API_KEY=your_key_here     # Best quality
   OPENAI_API_KEY=your_key_here         # Good quality
   ```
4. **Still nothing?** Computer voice works without any setup

### 📁 Installation Issues?

**Problem**: "Permission denied" or "command not found"  
**Solution**: Make sure you're in the EchoContext-Factory folder when running `bash install.sh`

**Problem**: "No such file or directory"  
**Solution**: Your `.claude` folder might be elsewhere. Try: `find ~ -name ".claude" -type d`

**Problem**: Commands don't work in Claude Code  
**Solution**: Restart Claude Code after installation

---

## 🎉 That's It!

You now have a voice-enabled AI assistant that will guide you through every step of development. 

### 🚀 Ready to Start?

1. **Test voice**: `/voice-status` 
2. **Create your first project**: `/start-project`
3. **Need complex help**: `/multiagent`

### 🎵 Remember

- Your AI talks to you (no more feeling alone while coding!)
- One simple question at a time (never overwhelming)
- Everything works without API keys (computer voice is always available)
- All commands are designed to be neurodivergent-friendly

**Happy building!** 🏭✨

---

## 🤝 Contributing

We welcome contributions! Whether you want to:

- 🐛 **Report bugs** or suggest improvements
- 🎵 **Add new voice providers** or enhance TTS features  
- 🤖 **Create new AI agents** for specialized tasks
- 📝 **Improve documentation** or add examples
- ♿ **Enhance accessibility** features
- 🔒 **Strengthen security** measures

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the accessibility-first principles
4. Test with voice features and ensure neurodivergent-friendly design
5. Submit a pull request

**Areas we'd especially love help with:**
- Additional TTS provider integrations
- More project templates and patterns
- Improved voice personalization features
- Better error handling and recovery
- Documentation translations

---

**Version**: 2.4.0 | **Created by**: [Emmi C.](https://emmi.zone) | **License**: MIT
