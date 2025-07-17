# Context Engineering Factory - Start Project Command

🚀 You are now activating the **Context Engineering Factory** system! ✨ This command initiates a comprehensive project setup workflow using an engaging, question-by-question interview approach perfect for focused interaction.

**🚨 CRITICAL FORMATTING REQUIREMENT**: When displaying question options during the interview, each option MUST be on a separate line with proper line breaks. Never concatenate options on the same line.

## 🏭 Factory Workflow (Engaging Question-by-Question Approach) 🎯

### 🏁 Phase 1: Welcome & System Check ✅
- 👋 Display welcome message and verify factory components
- 🔊 Initialize voice feedback system  
- 📋 Create standardized todo list for tracking

### 🤔 Phase 2: Interactive Project Discovery 💭
- **🎯 One Question at a Time**: Ask single, focused questions
- **⏳ Wait for Response**: Let user answer completely before proceeding
- **✅ Validate Input**: Ensure answer quality before moving forward
- **📊 Progress Feedback**: Show completion progress (Question X of Y) with progress bar
- **🔊 Voice Updates**: Announce phase transitions with personalized messages

### 🧠 Phase 3: Intelligent Context Assembly 🔍
- **🌐 Automatic Research**: Execute web research based on user answers
- **⚙️ Tech Stack Optimization**: Analyze and recommend optimal architecture  
- **🎯 Best Practices Integration**: Inject research findings into context

### 📝 Phase 4: Comprehensive File Generation 📄
- **🔧 Template Processing**: Generate CLAUDE.md, PRD.md, TASKS.md
- **🔗 Research Enhancement**: Embed curated links and best practices
- **✅ Quality Validation**: Ensure completeness and accuracy

### 🎉 Phase 5: Completion & Voice Celebration 🎊
- **📢 Success Announcement**: Personalized completion message
- **➡️ Next Steps**: Clear guidance for immediate development start

## 🔧 Factory Components

### 📚 Core Libraries
- **🤔 QuestionEngine**: `~/.claude/lib/question-engine.js`
- **🧩 ContextAssembler**: `~/.claude/lib/context-assembler.js`
- **📄 TemplateProcessor**: `~/.claude/lib/template-processor.js`
- **✅ Validator**: `~/.claude/lib/validation.js`

### 📝 Templates
- **🏠 CLAUDE.md**: Main project context (`~/.claude/templates/CLAUDE.md.template`)
- **📋 PRD.md**: Product requirements (`~/.claude/templates/PRD.md.template`)
- **✔️ TASKS.md**: Task breakdown (`~/.claude/templates/TASKS.md.template`)

### ⚙️ Configuration
- **🏭 Factory Config**: `~/.claude/config/factory.json`
- **🔒 Security Config**: `~/.claude/config/security.json`
- **🔊 Voice Config**: `~/.claude/config/voice.json`

### 📊 Data Sources
- **❓ Questions**: `~/.claude/data/questions.json`
- **🎨 Patterns**: `~/.claude/data/patterns.json`

## 🛠️ Implementation Instructions

**🚨 CRITICAL**: Always use the engaging question-by-question approach. Never overwhelm users with multiple questions at once.

**🚨 QUESTION FORMATTING FIX**: The most critical requirement is proper option formatting. Each option must appear on its own line:

✅ **CORRECT FORMAT**:
```
A) 📚 Educational Platform - Learning management, courses, tutorials
B) 🧠 Neuroscience/Medical App - Brain research, medical tools, health tech
C) 🌉 Bridging/Integration Tool - Connecting systems, APIs, data integration
```

❌ **WRONG FORMAT** (causes display issues):
```
A) 📚 Educational Platform - Learning management, courses, tutorialsB) 🧠 Neuroscience/Medical App - Brain research, medical tools, health techC) 🌉 Bridging/Integration Tool
```

**🚨 NO TIMEFRAMES RULE**: When generating CLAUDE.md, PRD.md, and TASKS.md files, NEVER include development timeframes, deadlines, or time estimates. These files are for AI coding assistants where projects can be built in hours/days, making timeframes irrelevant.

❌ **AVOID THESE PATTERNS**:
- "Phase 1: Foundation (Weeks 1-4)"
- "Short-term Enhancements (6 months)"
- "Development Timeline: 3-6 months"
- "Week 1-2: Setup and configuration"
- Any time-based roadmaps or schedules

✅ **USE INSTEAD**:
- "Phase 1: Foundation"
- "Short-term Enhancements"
- "Development Roadmap"
- "Setup and configuration"
- Priority-based or feature-based organization

### 🏁 Step 1: Initialize Factory & Create Standardized Todo List

**✨ FIRST ACTION**: Always start by creating this exact todo list with emojis for visual clarity:

```
Use TodoWrite tool to create these standardized todos:
[
  {
    "content": "🏁 Welcome and system verification",
    "status": "in_progress", 
    "priority": "high",
    "id": "factory_phase_1"
  },
  {
    "content": "🤔 Interactive project discovery (question-by-question)",
    "status": "pending",
    "priority": "high", 
    "id": "factory_phase_2"
  },
  {
    "content": "🧠 Context assembly and automated research",
    "status": "pending",
    "priority": "high",
    "id": "factory_phase_3"
  },
  {
    "content": "📝 Generate enhanced project files",
    "status": "pending",
    "priority": "high",
    "id": "factory_phase_4" 
  },
  {
    "content": "🎉 Voice celebration and next steps",
    "status": "pending",
    "priority": "high",
    "id": "factory_phase_5"
  }
]
```

This ensures consistent factory tracking and proper voice notification triggers.

### 🤔 Step 2: Question-by-Question Interview Process
**🚨 IMPLEMENTATION RULE**: Ask ONE question, wait for answer, process response, then ask next question.

**🎯 Question Flow**:
1. **❓ Ask Single Question**: Present one focused question with clear options
2. **⏳ Wait for Complete Response**: Allow user to fully answer 
3. **✅ Validate Response**: Ensure answer is complete and appropriate
4. **📊 Show Progress**: Display visual progress bar: `[██████░░░░] 60% Complete (Question 3 of 5)`
5. **➡️ Move to Next**: Only proceed after successful validation

**🚨 CRITICAL FORMATTING RULE**: When displaying question options, ALWAYS format each option on a separate line:

```
A) 📚 Option One - Description here
B) 🧠 Option Two - Description here  
C) 🌉 Option Three - Description here
```

**NEVER** format options like this (concatenated):
```
A) 📚 Option One - Description hereB) 🧠 Option Two - Description hereC) 🌉 Option Three
```

**📋 Question Categories** (ask in sequence):
- 🏷️ Project type and basic identity
- 👥 Target users and use cases  
- ⚙️ Technical preferences and architecture
- ✨ Feature requirements and scope
- 🚀 Deployment and final requirements

**🎯 QUESTION FORMATTING TEMPLATE**:
When displaying questions, use this exact format:

```
🎯 Question X:

[Question text here]

A) 📚 [Option A] - [Description]
B) 🧠 [Option B] - [Description]  
C) 🌉 [Option C] - [Description]
D) 💻 [Option D] - [Description]
E) 📱 [Option E] - [Description]
F) 🔗 [Option F] - [Description]
```

**🚨 MANDATORY**: Each option MUST be on its own line with proper line breaks between them. Use double-space or newline characters to ensure separation.

### 🔊 Step 3: Voice-Enhanced Progress Updates
Announce phase transitions with personalized messages:
- 🏁 Phase start: "Interview mode activated - ready for your vision!"
- 📈 Progress: "Great answer! Moving to question X of Y"
- ✅ Phase complete: "Discovery complete - assembling your context!"

### 🧠 Step 4: Assemble Context & Execute Research
```javascript
// Initialize context assembler and research engine
const { ContextAssembler } = require(path.join(process.env.HOME, '.claude', 'lib', 'context-assembler.js'));
const { ResearchEngine } = require(path.join(process.env.HOME, '.claude', 'lib', 'research-engine.js'));
const contextAssembler = new ContextAssembler();
const researchEngine = new ResearchEngine();

// Build comprehensive context
const questionResults = questionEngine.buildContext();
const assembledContext = contextAssembler.assembleContext(questionResults);

// Execute automated research for best practices
const researchResults = await researchEngine.executeResearch(assembledContext);
assembledContext.research = researchResults;
```

### 📝 Step 5: Generate Project Files
```javascript
// Initialize template processor
const { TemplateProcessor } = require(path.join(process.env.HOME, '.claude', 'lib', 'template-processor.js'));
const templateProcessor = new TemplateProcessor();

// Generate all required files
const templates = ['CLAUDE.md', 'PRD.md', 'TASKS.md'];
const outputDir = path.join(process.cwd(), '.claude');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Process each template with integrated research data
for (const template of templates) {
  // Research data is now included in assembledContext and handled by template placeholders
  const processedContent = templateProcessor.processTemplate(template, assembledContext);
  
  const outputFile = path.join(outputDir, `${template}.md`);
  fs.writeFileSync(outputFile, processedContent);
}
```

**🚨 CRITICAL FILE GENERATION RULE**: When generating CLAUDE.md, PRD.md, and TASKS.md files:
- ❌ **NEVER include timeframes**: No weeks, months, deadlines, or time estimates
- ❌ **NEVER include schedules**: No "Week 1-4", "Phase 1 (2 months)", "6-month roadmap"
- ✅ **USE priority-based organization**: "High Priority", "Phase 1", "Core Features"
- ✅ **USE feature-based grouping**: "Authentication Phase", "UI Components", "Database Setup"

### 🎉 Step 6: Voice Integration & Completion

**🔊 Voice Integration**: Factory voice announcements work automatically through the TodoWrite hook system when you update todo status.

**🚨 DO NOT** manually call notification scripts - voice announcements trigger automatically when:
1. ✅ TodoWrite tool is used during factory operations
2. ✅ Factory-related todos are marked as completed
3. ✅ The factory_notification.py hook detects the changes

**🎯 Completion Steps**:
1. ✅ Mark final todo as completed to trigger celebration announcement
2. 📢 Display completion message with next steps
3. 🎊 Voice system will automatically announce: "Context Engineering Factory operation complete!"

## 📁 Expected Output Structure

After successful completion, the following structure will be created:

```
./project-directory/
├── .claude/
│   ├── 🏠 CLAUDE.md              # Comprehensive project context
│   ├── 📋 PRD.md                 # Product requirements document
│   ├── ✔️ TASKS.md               # Detailed task breakdown
│   ├── 🪝 hooks/                 # Project-specific hooks (optional)
│   ├── ⚡ commands/              # Custom commands (optional)
│   └── 📄 templates/             # Reusable templates (optional)
```

## ✅ Quality Assurance

### 🔍 Validation Checks
- **📄 File Existence**: Verify all required files are created
- **✅ Content Validation**: Check template processing was successful
- **🔒 Security Validation**: Ensure security configurations are applied
- **🧩 Context Completeness**: Verify all sections are populated
- **⏰ NO TIMEFRAMES**: Confirm no time estimates, deadlines, or schedules are included in generated files

### 🚨 Error Handling
- **🔄 Graceful Degradation**: Continue with available features if some fail
- **💬 User Feedback**: Provide clear error messages and recovery options
- **📝 Logging**: Record all operations for troubleshooting
- **↩️ Rollback**: Ability to undo changes if needed

## 🔒 Security Considerations

### 🛡️ Input Validation
- **❓ Question Answers**: Validate all user inputs
- **📁 File Paths**: Sanitize file paths and prevent traversal
- **📄 Template Content**: Ensure templates don't contain harmful content
- **💉 Command Injection**: Prevent command injection in user inputs

### 🚪 Access Control
- **📝 File Permissions**: Set appropriate permissions on created files
- **📂 Directory Access**: Ensure proper directory access controls
- **🔐 Sensitive Data**: Prevent exposure of sensitive information
- **📊 Audit Logging**: Log all security-relevant operations

## 🎯 Usage Examples

### 🚀 Basic Usage
```bash
# 🌟 Simple project setup
/start-project

# 🏷️ With project type specification
/start-project --type webapp

# ⚙️ With custom configuration
/start-project --config advanced
```

### 🔧 Advanced Usage
```bash
# ⚡ Skip questions for specific values
/start-project --name "My Project" --type api --framework express

# 📄 Use custom template
/start-project --template custom-api

# 🐛 Debug mode
/start-project --debug --verbose
```

## 🔧 Troubleshooting

### 🚨 Common Issues
1. **🚫 Permission Denied**: Check file/directory permissions
2. **📄 Template Not Found**: Verify template files exist
3. **⚙️ Configuration Error**: Check factory configuration files
4. **🔊 Voice Not Working**: Verify TTS configuration and API keys
5. **❓ Questions Not Loading**: Check questions.json file

### 🛠️ Recovery Procedures
1. **💾 Backup Existing Files**: Always backup before overwriting
2. **📊 Partial Completion**: Resume from last successful step
3. **🔄 Factory Reset**: Restore default configurations
4. **✋ Manual Recovery**: Manually create missing files

## 🎯 Success Metrics & Experience Guidelines

The factory operation is successful when:
- ✅ **🎪 Engaging Experience**: Question-by-question interview (never overwhelming)
- ✅ **📋 Consistent Todo Tracking**: Standardized 5-phase todo list used
- ✅ **🎉 Voice Celebration**: Automatic announcements for phase transitions and completion
- ✅ **📄 Quality Files**: All CLAUDE.md, PRD.md, TASKS.md generated with research links
- ✅ **😊 User Satisfaction**: User feels engaged, not overwhelmed
- ✅ **🚫 No Errors**: Clean execution without notification script errors

**🚨 CRITICAL SUCCESS FACTOR**: The user should feel engaged and excited, not overwhelmed with information.

## 🎯 Next Steps After Completion

1. **📄 Review Generated Files**: Check CLAUDE.md, PRD.md, TASKS.md
2. **⚙️ Customize Context**: Modify files as needed for your project
3. **🚀 Start Development**: Begin implementing based on task breakdown
4. **🏭 Use Factory Features**: Leverage hooks and templates for development
5. **🔄 Iterate and Improve**: Update context as project evolves

---

---

*Document Version: 2.4.0*
*Generated by EchoContext Factory v2.4.0*
*Designed by Emmi C. (https://emmi.zone) - Built with Claude Code*

**🏭 Context Engineering Factory v2.4.0**
*✨ Transforming simple commands into comprehensive project contexts*

This command will now execute the complete Context Engineering Factory workflow, providing you with a fully contextualized project setup ready for development. 🚀