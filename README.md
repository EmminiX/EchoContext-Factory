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
- **Linux**: Excellent support, install `espeak` for better fallback TTS
- **macOS**: Full support with built-in `say` command for great TTS fallback  
- **Windows**: Core features work, may need WSL for advanced Python hooks

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

EchoContext Factory now leverages Claude Code's powerful sub-agent system for 10-20x speed improvements:

- **Pre-configured Agents**: 10 specialized agents ready to use in `.claude/agents/`
- **Parallel Execution**: Multiple agents work simultaneously on different aspects
- **Smart Orchestration**: Agents coordinate based on task dependencies
- **Automatic Fallback**: Works normally if agents aren't available

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

## 🚀 Main Commands

### 🎯 Start a New Project
```bash
/start-project
```
**What happens**: Your assistant asks up to 9 adaptive questions about your project, then creates complete documentation with live web research using Context7, Perplexity, and Tavily MCP tools.

**NEW: Multi-Agent Research**
When Claude Code agents are available, /start-project spawns 4 specialized research agents in parallel:
- **Tech Stack Agent**: Researches best practices for your chosen technologies
- **Architecture Agent**: Analyzes optimal patterns for your project type
- **Security Agent**: Investigates OWASP 2024/2025 compliance requirements
- **Deployment Agent**: Explores modern infrastructure strategies

**Example flow**:
1. 🗣️ "Hi! What's your project called?"
2. 📝 You: "My Recipe App" 
3. 🗣️ "Please provide a detailed description of what you are looking to build..."
4. 📝 You: "A web app where users can save and share their favorite recipes..."
5. 🧠 *AI adapts remaining questions based on your description*
6. 🗣️ "What type of users will use this app?"
7. *...continues with smart, adaptive questions...*
8. 🤖 *4 research agents work in parallel (if available)*
9. 🔍 *MCP research happens automatically (Context7 + Perplexity + Tavily)*
10. ✅ Three complete documents created in `.claude/` folder!

### 🧠 Generate or Improve Prompts
```bash
/promptsage
```
**What happens**: Create new system prompts or improve existing prompts with model-specific XML layering for optimal AI performance.

**Supported models**:
- **Claude**: 3+ nested XML layers for maximum control
- **GPT-4.1/Gemini/Grok**: 2 XML layers for optimal parsing
- **Mistral/Llama**: 1 XML layer for compatibility

**Example**: Need a Python tutor? → Get a perfectly structured system prompt for your chosen AI model.

### 🚀 Start Development
```bash
/start-development
```
**What happens**: Reads your documentation from `.claude/` folder (CLAUDE.md, PRD.md, TASKS.md) and provides optimized prompts to start coding immediately.

**NEW: Development Agent Teams**
When Claude Code agents are available, you can choose to use a specialized development team:
- **Frontend Agent**: Implements UI components with accessibility standards
- **Backend Agent**: Creates API endpoints and business logic
- **Database Agent**: Designs schemas and optimizations
- **Testing Agent**: Develops comprehensive test suites
- **Documentation Agent**: Writes technical docs and guides

**Smart detection**:
- Finds existing project docs → "Start building your documented project"
- Finds PRP files → "Implement your feature from PRP"
- No docs → "Start fresh with guided assistance"

### 🤖 Complex Task Help
```bash
/multiagent
```
**What happens**: Specialized AI agents work in parallel to research, analyze, and solve complex development challenges using Context7 and Perplexity MCP for comprehensive research.

**NEW: Real Agent Execution**
Now uses Claude Code's Task tool for true parallel execution:
- Agents run simultaneously, not sequentially
- Each agent has its own context window
- Smart dependency management between agents
- 10-20x speed improvement for complex tasks

**Agent types**:
- **Research Specialist**: Gathers information using MCP tools
- **Analysis Specialist**: Reviews and optimizes solutions
- **Implementation Specialist**: Generates code and configurations
- **Validation Specialist**: Tests and quality assurance
- **Integration Specialist**: Coordinates and merges results

**Example**: "Help me implement user authentication" → Gets research report with current security standards, architecture analysis, code examples with best practices, and comprehensive testing strategy.

### 📋 Feature Requirements
```bash
/generate-prp
```
**What happens**: Creates detailed feature specifications (Product Requirements Prompts) with current best practices and security considerations using MCP research.

**Process**:
1. Interactive feature discovery questions
2. Automated codebase analysis
3. MCP research for best practices (Context7 + Perplexity + Tavily)
4. Professional PRP document generation
5. Saves to `generated-prps/` directory

**Example**: Describe a login feature → Get comprehensive requirements document with implementation details and research-backed recommendations.

### 🔧 Utility Commands
```bash
/voice-status      # Test if voice is working and check configuration
/voice-toggle      # Turn voice announcements on/off
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
- **🚀 Agent Teams**: Development teams for /start-development and research teams for /start-project

*Accessibility improvement: Less overwhelming question flow perfect for neurodivergent developers*
