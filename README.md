# 🎵 EchoContext Factory

<div align="center">
  <img src="assets/EMMI.png" alt="EMMI - Engaging Minds, Merging Ideas" width="300">
</div>

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

**All Platforms (Linux, macOS, Windows):**
```bash
# Clone or download this repository
git clone https://github.com/EmminiX/EchoContext-Factory.git
cd EchoContext-Factory

# Run the cross-platform installer
chmod +x install.sh
./install.sh
```

The installer automatically detects your platform and configures everything appropriately!

### Step 2: Add Your API Keys (Optional but Recommended)
```bash
# Edit the environment file (path shown by installer)
nano ~/.claude/.env

# Add your keys for enhanced voice features:
ELEVENLABS_API_KEY=your_key_here     # Best voice quality
OPENAI_API_KEY=your_key_here         # Good voice quality  
ENGINEER_NAME=YourName               # Personalizes voice messages
```

**Platform-specific notes:**
- **Linux**: Excellent support, [install espeak](https://espeak.sourceforge.net/download.html) for better fallback TTS
- **macOS**: Full support with built-in TTS. Enable "Announce notifications" in System Settings → Accessibility → Spoken Content for best experience
- **Windows**: Core features work, may need [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) for advanced Python hooks

### Step 3: Start Building!
```bash
# In Claude Code, type any of these commands:
/start-project      # Interactive project setup with voice guidance
/voice-status       # Test that voice is working
```

**That's it!** Your AI assistant is now voice-enabled and ready to guide you.

### 🔧 Recommended: Enhanced Research Capabilities

For the best experience with multi-agent coordination and research, install these MCP providers:

- **Import from Claude Desktop**: `claude mcp add-from-claude-desktop`  
- **Essential MCPs**: [Context7 MCP](https://modelcontextprotocol.io/quickstart/user), [Perplexity MCP](https://github.com/jsonallen/perplexity-mcp), [Tavily MCP](https://github.com/tavily-ai/tavily-mcp)

*Note: Context7 and Perplexity MCPs are MANDATORY for all specialized agents, enabling comprehensive codebase analysis, current best practices research, and cross-validated findings for accuracy*

### 🤖 Claude Code Agents Support

EchoContext Factory leverages Claude Code's sub-agent system for 10-20x speed improvements:

- **Pre-configured Agents**: 10 specialized agents in `.claude/agents/` for research, implementation, testing, and documentation
- **Parallel Execution**: Multiple agents work simultaneously on different aspects of your project
- **Smart Orchestration**: Agents coordinate based on task dependencies with sophisticated task decomposition
- **Automatic Fallback**: Works normally if agents aren't available (non-Claude Code environments)

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

- **Adaptive flow**: Starts with your project description, then asks smart follow-ups
- **Maximum 9 questions**: Never overwhelming, usually fewer based on your needs  
- **Context-aware**: Each question builds on your previous answers
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

**Real example**: Answer up to 9 adaptive questions → Get 3 comprehensive documents with current industry standards

---

## 🎵 Voice Hooks System

### 🔊 How Voice Works

EchoContext Factory includes a sophisticated **3-tier voice fallback system** that ensures you always get voice announcements, regardless of your API key setup:

#### **Tier 1: Premium Voice (ElevenLabs)**
- **Requires**: `ELEVENLABS_API_KEY` in your `.env` file
- **Quality**: Professional-grade, natural-sounding voice (Charlotte voice, Eleven Turbo v2.5)
- **Best for**: Daily development work where voice quality matters

#### **Tier 2: Good Voice (OpenAI)**  
- **Requires**: `OPENAI_API_KEY` in your `.env` file
- **Quality**: Clear, pleasant AI-generated voice (Nova voice, TTS-1 model)
- **Best for**: Regular use when ElevenLabs isn't available

#### **Tier 3: System Voice (Always Works)**
- **Requires**: Nothing! Works out of the box on all platforms
- **Quality**: Your computer's built-in text-to-speech
- **Platform Support**: Windows SAPI, macOS NSSpeechSynthesizer, Linux espeak/festival
- **Best for**: Immediate functionality without any setup or API keys

### 🔧 Voice Hooks Architecture

The voice system uses **Python hooks** that automatically trigger during key development moments:

#### **Hook Types & Triggers**
- **Factory Notifications** (`factory_notification.py`): Triggered by TodoWrite events during /start-project phases
- **General Notifications** (`notification.py`): Announced when Claude needs your input or guidance
- **Session Completion** (`stop.py`): Celebrates successful completion of work sessions
- **Agent Coordination** (`subagent_stop.py`): Reports when multi-agent tasks complete

#### **What You Actually Hear**
```python
# Real voice announcements during development:
📝 Phase transitions     # "EchoContext Factory is spinning up for maximum speed!"
🎯 Project completion    # "Your comprehensive project documentation is ready!"
🤖 Agent completion     # "Multi-agent coordination complete - results aggregated!"
⚠️ Input needed         # "Your cognitive enhancement system needs direction"
✅ Final celebration    # "Mission accomplished! Ready for your next challenge!"
```

**Note**: Voice announcements happen **after** key actions complete, not during interactive question flows.

### 🎯 Personalized Announcements

When you set `ENGINEER_NAME=YourName` in your `.env` file:
- **70% of messages** become personalized: *"Hey Sarah, time to sync minds"*
- **30% stay generic** for variety: *"Your AI collaborator seeks your wisdom"*
- **Smart context**: Messages adapt to your workflow and progress

### 🎚️ Voice Control

```bash
/voice-status      # Test voice system and check configuration
/voice-toggle      # Turn voice announcements on/off instantly
```

**No API Keys? No Problem!** The system voice (Tier 3) ensures you get announcements even without any API keys configured.

### 🎚️ Voice Customization

#### **🏷️ Personal Name Integration**

Add your name for personalized announcements:
```bash
# In ~/.claude/.env
ENGINEER_NAME=Sarah
```

**Name Usage Frequency:**
- **70% of messages** include your name: *"Hey Sarah, time to sync minds"*
- **30% stay generic** for variety: *"Your AI collaborator seeks your wisdom"*
- **Smart context**: Name usage adapts to workflow phases and progress

#### **🔊 Voice Quality Tiers**

**ElevenLabs (Premium):**
```bash
# In ~/.claude/.env  
ELEVENLABS_API_KEY=your_key_here
```
- Professional voice actors, natural speech patterns
- Multiple voice options, emotion and pace control

**OpenAI (Good):**
```bash
# In ~/.claude/.env
OPENAI_API_KEY=your_key_here
```
- Clear AI-generated voice, reliable quality
- Multiple voice models available

**System Voice (Always Works):**
- No configuration needed
- Uses your computer's built-in TTS (macOS `say`, Windows Speech API, Linux `espeak`)
- Immediate functionality without any setup

#### **🎛️ Voice Controls**

```bash
/voice-status      # Test current voice setup and check all tiers
/voice-toggle      # Instantly turn voice announcements on/off
```

**Voice automatically cascades**: ElevenLabs → OpenAI → System Voice if keys aren't available.

---

## 🚀 Main Commands

### 🎯 Start a New Project
```bash
/start-project
```

**What happens**: Conducts an intelligent interview using an adaptive 9-question system, then generates comprehensive project documentation with live MCP research.

#### **🧠 Adaptive Question System**

**Smart Flow Design:**
- **Question 1-3**: Core project foundation (name, detailed description, type)
- **Question 2 is KEY**: Your detailed project description drives all subsequent question selection
- **Questions 4-9**: Intelligently selected based on keywords in your description
- **Maximum 9 questions**: Reduced from 18 for better neurodivergent accessibility
- **Progress tracking**: Clear 11%, 22%, 33%... progression to 100%

**Keyword-Based Adaptation:**
```javascript
// Example: If your description contains "mobile app", "social features", "user authentication"
// The system automatically selects relevant questions about:
- Mobile platform preferences (iOS/Android)
- Social interaction features 
- Authentication & security requirements
- Performance & scalability needs
```

#### **🔍 Comprehensive MCP Research (v2.5.0)**

**Mandatory Research Integration:**
- **15+ intelligent queries** generated per project based on your tech stack
- **Context7 MCP**: Comprehensive codebase analysis and documentation research
- **Perplexity MCP**: Current industry standards and expert best practices  
- **Tavily MCP**: Real-time web research for latest trends and techniques
- **Cross-validation**: All MCP sources verify findings for accuracy confidence scoring

#### **🤖 Multi-Agent Research Teams**

When Claude Code agents are available, `/start-project` spawns **4 specialized research agents** working in parallel:

**Research Agent Team:**
- **Tech Stack Agent**: Deep-dives into best practices for your chosen technologies
- **Architecture Agent**: Analyzes optimal design patterns for your project type
- **Security Agent**: Investigates OWASP 2024/2025 compliance requirements
- **Deployment Agent**: Explores modern infrastructure and DevOps strategies

**Benefits:**
- **10-20x faster research** through parallel execution
- **Cross-validated findings** between agents and MCP tools
- **Comprehensive coverage** of all project aspects simultaneously
- **Research source attribution** in all generated documentation

#### **📋 Generated Documentation**

**Complete Project Context:**
```
📁 .claude/
├── 📄 CLAUDE.md         # Complete AI assistant context with research links
├── 📋 PRD.md           # Professional requirements doc with industry standards
├── ✅ TASKS.md         # Step-by-step implementation guide with best practices
└── 🔗 Research sources # All MCP research properly attributed
```

#### **📝 Text-Based Interactive Flow**

**Example Project Setup:**
1. **Question 1/9**: "What's your project called?" *(11% complete)*
2. **You**: "My Recipe App" 
3. **Question 2/9**: "Please provide a detailed description..." *(22% complete)*
4. **You**: "A web app where users can save, organize, and share their favorite recipes with social features..."
5. 🧠 *AI analyzes keywords: "web app", "social features", "organize"*
6. **Question 3/9**: "What type of users will primarily use this app?" *(33% complete)*
7. **Questions 4-9**: *Adaptively selected based on your project description*
8. 🎯 **Progress**: "Great! 100% complete. Launching research agents..."
9. 🤖 *4 research agents work in parallel using MCP tools*
10. 🔍 *15+ research queries execute across Context7, Perplexity, and Tavily*
11. ✅ *Voice announcement: "Your comprehensive project documentation is ready!"*

### 🧠 Generate or Improve Prompts
```bash
/promptsage
```
**What happens**: Uses the PromptSage framework to create new system prompts or improve existing ones with model-specific XML layering.

**Two modes**: Create new expert assistant prompts or enhance your existing prompts. Automatically applies optimal XML structure depth based on the target AI model (Claude: 3 layers, GPT/Gemini: 2 layers, Mistral/Llama: 1 layer).

**Example**: "Create a Python tutor prompt for Claude" → Get a perfectly structured system prompt optimized for your chosen AI model.

### 🚀 Development with Agents
```bash
/dev-agents
```
**What happens**: Spawns 5 specialized development agents to build your project in parallel using Claude Code's agent system.

**Agent Team**: Frontend, Backend, Database, Testing, and Documentation agents work simultaneously on different aspects of your project using the pre-configured agent templates in `.claude/agents/`.

**Benefits**: 10-20x faster development through parallel execution with smart task coordination and dependency management.

**Requirements**: Only works in Claude Code (claude.ai/code) environment where the Task tool is available.

### 🤖 Complex Task Help
```bash
/multiagent
```
**What happens**: Analyzes your task complexity and spawns specialized agents that work in parallel to research, analyze, and solve complex development challenges using mandatory MCP tools.

**Real Parallel Execution**: Uses Claude Code's Task tool for true simultaneous agent execution with sophisticated task decomposition and dependency management.

**Agent Types**: Automatically selects from Research, Architecture, Implementation, Testing, and Documentation specialists based on task requirements - each with access to Context7 and Perplexity MCP for comprehensive research.

**Example**: "Help me implement user authentication" → System analyzes complexity, spawns Security and Implementation agents that research OWASP standards via MCP tools, generate secure code, and create testing strategies simultaneously.

### 📋 Feature Requirements
```bash
/generate-prp
```
**What happens**: Creates detailed Product Requirements Prompts (PRPs) for specific features with current industry best practices and security considerations.

**Process**: Interactive feature questions → Automated codebase analysis → Live MCP research → Professional requirements document saved to `generated-prps/` directory with full source attribution.

**Example**: "I need a login system" → Get comprehensive requirements document with OWASP 2024 security standards, implementation details, testing strategies, and research-backed recommendations from Context7 and Perplexity sources.

### 🔧 Utility Commands
```bash
/voice-status      # Test if voice is working and check configuration
/voice-toggle      # Turn voice announcements on/off
/agent-status      # Check Claude Code agent availability and configuration
```

---

## 🤔 Need Help?

### 🤖 Agents Not Working?

**IMPORTANT**: Agents ONLY work inside Claude Code (claude.ai/code), not in terminal/VS Code.

**Quick diagnosis:**
1. Run `/agent-status` to check availability
2. Look for "Claude Code agent system detected" message
3. If you see "Agent system not available", you're in fallback mode

**Solution**: Open this project in Claude Code at claude.ai/code to use agents.

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

**Problem**: Installation script fails or doesn't work properly  
**Solution**: Manual installation (always works):
```bash
# 1. Backup your existing .claude folder first!
cp -r ~/.claude ~/.claude.backup.$(date +%Y%m%d_%H%M%S)

# 2. Copy all files manually from the downloaded repo to ~/.claude/
cp -r EchoContext-Factory/commands ~/.claude/
cp -r EchoContext-Factory/config ~/.claude/
cp -r EchoContext-Factory/data ~/.claude/
cp -r EchoContext-Factory/hooks ~/.claude/
cp -r EchoContext-Factory/lib ~/.claude/
cp -r EchoContext-Factory/templates ~/.claude/
cp EchoContext-Factory/CLAUDE.md ~/.claude/
cp EchoContext-Factory/settings.json ~/.claude/
cp EchoContext-Factory/settings.fallback.json ~/.claude/
cp EchoContext-Factory/.env.sample ~/.claude/

# 3. Create .env file if needed
cp ~/.claude/.env.sample ~/.claude/.env
```

**Problem**: Error "uv: not found" when hooks run  
**Solution**: Either install uv or use fallback settings:
```bash
# Option 1: Install uv (recommended)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Option 2: Use system python fallback
cd ~/.claude
cp settings.fallback.json settings.json
```

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

We welcome contributions! 

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the accessibility-first principles
4. Test with voice features and ensure neurodivergent-friendly design
5. Submit a pull request

---

**Version**: 2.5.0 | **Created by**: [Emmi C.](https://emmi.zone) | **License**: MIT

### 🆕 What's New in v2.5.0?

- **🧠 Smarter Question Flow**: New adaptive 9-question flow that starts with your project description and intelligently selects follow-up questions
- **🔍 Enhanced MCP Integration**: All multi-agent tasks now mandate Context7 and Perplexity MCP usage for comprehensive research and validation
- **⚡ Reduced Cognitive Load**: Fewer, smarter questions that adapt to your project type (maximum 9, often fewer)
- **🎯 Better Context Building**: First question captures your project vision, remaining questions build context intelligently
- **🤖 Claude Code Agents**: Full integration with Claude Code's sub-agent system for parallel execution and 10-20x speed improvements
- **📁 Pre-configured Agents**: 10 specialized agent definitions ready to use in `.claude/agents/`
- **🚀 Agent Teams**: Development teams for /dev-agents and research teams for /start-project

*Accessibility improvement: Less overwhelming question flow perfect for neurodivergent developers*
