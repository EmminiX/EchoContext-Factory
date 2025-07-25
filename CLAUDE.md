# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**EchoContext Factory v2.5.0** is a voice-enabled context engineering system for Claude Code that transforms development workflow through:

- **Interactive project setup** with adaptive 9-question interviews 
- **Voice announcements** using TTS providers (ElevenLabs → OpenAI → system fallback)
- **Multi-agent coordination** for complex tasks with mandatory MCP research
- **Automated documentation generation** with real-time web research integration
- **Neurodivergent-friendly design** with reduced cognitive load and clear progress tracking

### Core System Components

**JavaScript Libraries (`lib/`):**
- `question-engine.js` - Handles adaptive question flows with maximum 9 questions
- `multiagent-coordinator.js` - Manages parallel agent execution (max 6 concurrent)
- `research-engine.js` - Real-time MCP research using Context7, Perplexity, Tavily
- `template-processor.js` - Generates documentation from Handlebars templates
- `context-assembler.js` - Builds comprehensive project context from user input
- `start-project-handler.js` - Orchestrates the 5-phase project setup workflow

**Python Hooks (`hooks/`):**
- `factory_notification.py` - Voice announcements for factory events
- `notification.py` - General TTS notifications with 3-tier fallback
- `post_tool_use.py` - Cleanup and logging after tool usage
- `stop.py` - End-of-session voice notifications
- TTS engines in `utils/tts/` support ElevenLabs, OpenAI, and system voice

**Configuration System:**
- `config/factory.json` - Main factory settings, research parameters, multi-agent config
- `config/voice.json` - TTS settings and personalization options
- `data/questions.json` - Adaptive question system with keyword-based selection
- `settings.json` - Hook system configuration with uv runner

## Available Slash Commands

### Primary Commands
- `/start-project` - Interactive 9-question project setup with comprehensive MCP research + multi-agent research teams (4 parallel agents)
- `/multiagent` - Parallel task execution with mandatory Context7 & Perplexity MCP integration + real Task tool execution
- `/generate-prp` - Feature requirements generation with best practices research
- `/start-development` - Documentation-to-development bridge (reads `.claude/` folder) + optional development agent teams (5 specialists)
- `/promptsage` - Generate or improve prompts with model-specific XML layering

### Utility Commands
- `/voice-status` - Check voice system configuration and test TTS
- `/voice-toggle` - Toggle personalized voice announcements on/off

## Development Workflow

### Question Engine Flow (v2.5.0)
1. **Base Questions (3):** project_name, project_description, project_type
2. **Adaptive Selection:** Keyword analysis of project description selects 6 relevant questions
3. **Maximum 9 Questions:** Consistent progress tracking (11%, 22%, 33%... to 100%)
4. **Context Building:** Comprehensive tech stack, features, security requirements

### Multi-Agent System
- **Task Decomposition:** Complex tasks split into specialized agent responsibilities
- **Mandatory MCP Usage:** All agents MUST use Context7 MCP and Perplexity MCP
- **Agent Types:** Research, Analysis, Implementation, Validation, Integration specialists
- **Parallel Execution:** Up to 6 concurrent agents using Claude Code's Task tool
- **Quality Assurance:** Cross-validation between MCP sources for accuracy

### Claude Code Agent Integration (NEW!)
- **10 Pre-configured Agents:** Ready-to-use specialized agents in `.claude/agents/`
- **Real Task Tool:** Actual parallel execution with 10-20x speed improvements
- **Smart Orchestration:** Dependency management and phase-based execution
- **Automatic Fallbacks:** Works with or without agent system
- **Agent Types:** Research (4), Implementation (4), Documentation (1), Synthesis (1)

### Voice Integration
- **3-Tier TTS Fallback:** ElevenLabs → OpenAI → pyttsx3 (system voice)
- **70% Personalization Rate:** Uses ENGINEER_NAME environment variable
- **Hook Triggers:** PostToolUse, Notification, Stop, SubagentStop events
- **Factory Notifications:** TodoWrite events trigger specialized voice announcements

## File Generation Patterns

### Project Setup Output (`.claude/` folder):
```
CLAUDE.md           # Complete project context with research links
PRD.md             # Product requirements with industry standards  
TASKS.md           # Research-backed implementation tasks
generated-prps/    # Feature-specific requirements
```

### Multi-Agent Output:
```
research-[task]-[timestamp].md      # Research findings
analysis-[task]-[timestamp].md      # Analysis results
implementation-[task]-[timestamp].md # Code solutions
validation-[task]-[timestamp].md    # Testing strategies
comprehensive-[task]-[timestamp].md # Integrated reports
```

## Testing and Development

### No Package Manager Required
- JavaScript files executed directly via `node`
- Python hooks use `uv` for dependency management
- No `package.json` - this is a plugin system for Claude Code

### Component Testing
```bash
# Test individual JavaScript components
node lib/question-engine.js
node lib/template-processor.js
node lib/multiagent-coordinator.js

# Test voice system
python hooks/notification.py "Test message"
uv run hooks/factory_notification.py --factory

# Test security validation
python hooks/utils/validation.py
```

### Hook System Configuration
All hooks configured in `settings.json` with these triggers:
- **PostToolUse:** Cleanup and factory notifications
- **TodoWrite:** Factory-specific voice announcements  
- **Notification:** General voice announcements
- **Stop:** End-of-session voice feedback
- **SubagentStop:** Multi-agent completion notifications

## Environment Variables

### Required for Enhanced Functionality
```bash
ELEVENLABS_API_KEY=your_key_here    # Best voice quality
OPENAI_API_KEY=your_key_here        # Good voice quality  
ENGINEER_NAME=YourName              # Personalizes voice messages (70% usage rate)
```

### Installation and Configuration
- Run `./install.sh` for cross-platform setup
- Manual backup: `cp -r ~/.claude ~/.claude.backup.$(date +%Y%m%d_%H%M%S)`
- Fallback settings: `cp settings.fallback.json settings.json` (if uv not available)

## Important Implementation Details

### Security Considerations
- Input validation on all user inputs (validation.js)
- Path protection to prevent unauthorized file access
- Command filtering to block dangerous operations
- OWASP Top 10 2024 compliance built-in
- Audit logging for all security events

### Accessibility Features
- **Maximum 9 questions** (reduced from 18) for better cognitive accessibility
- **One question at a time** with clear progress indicators
- **Neurodivergent-friendly design** with predictable flows
- **Voice announcements** for all phase transitions
- **Multiple choice formatting** with proper line breaks for screen readers

### MCP Integration Requirements
- **Context7 MCP:** Comprehensive codebase analysis and documentation research
- **Perplexity MCP:** Current industry standards and emerging best practices  
- **Tavily MCP:** Web crawling and content extraction
- **Cross-validation:** Research findings verified between multiple MCP sources
- **Quality Thresholds:** Minimum confidence scores for research acceptance

## Common Development Tasks

### Modifying Question Flows
Edit `data/questions.json` - uses keyword-based adaptive selection after base questions

### Adding New Agent Types
Extend `lib/multiagent-coordinator.js` agentTemplates with new specializations

### Customizing Voice Messages
Modify `hooks/factory_notification.py` message templates and personalization logic

### Template Updates
Edit files in `templates/` directory - uses Handlebars templating system

### Research Configuration
Adjust `config/factory.json` research parameters, MCP tool settings, quality thresholds

The system emphasizes accessibility, security, and comprehensive research integration while maintaining a simple, voice-guided user experience.