# Claude Code Slash Commands: The Complete Guide

**Claude Code slash commands** represent one of the most powerful and underutilized features in modern AI-assisted development. These commands transform Claude from a simple conversational AI into a sophisticated, context-aware development partner capable of executing complex workflows, automating repetitive tasks, and maintaining project-specific knowledge across sessions[1][2][3].

## Understanding Claude Code Slash Commands

### What Are Slash Commands?

Claude Code slash commands are **special instructions** that begin with a forward slash (`/`) and provide direct access to specific functionality within the Claude Code environment[1][2]. They exist in three distinct categories, each serving different purposes and offering varying levels of customization.
### The Three Types of Slash Commands

**Built-in Slash Commands** are **pre-configured utilities** provided directly by Anthropic. These include essential functions like `/help` for guidance, `/init` for project initialization, `/config` for settings management, and `/review` for code analysis[1][2]. These commands form the foundation of Claude Code's functionality and require no setup.

**Custom Slash Commands** represent the true power of the system, allowing developers to **create personalized automation workflows** through simple Markdown files[1][4][3]. These can be scoped to individual projects (stored in `.claude/commands/`) or made available across all projects (stored in `~/.claude/commands/`)[1][4].

**MCP (Model Context Protocol) Slash Commands** extend Claude's capabilities by **connecting to external services and tools**[1][5]. These dynamic commands follow the pattern `/mcp__server__prompt` and can integrate with GitHub, databases, browsers, and countless other external systems[5][6].

## Creating Custom Slash Commands

The process of creating custom slash commands follows a systematic approach that transforms repetitive development tasks into one-line executions[4][7].
### Basic Command Structure

Custom commands begin with **directory creation** in the appropriate scope. For project-specific commands, create the `.claude/commands/` directory within your repository. For personal commands available across all projects, use `~/.claude/commands/` in your home directory[1][4].

```bash
# Project-specific commands
mkdir -p .claude/commands

# Personal commands  
mkdir -p ~/.claude/commands
```

Each command is defined as a **Markdown file** where the filename (without the `.md` extension) becomes the command name. The file contents serve as the prompt instructions that Claude will execute when the command is invoked[1][4].

```markdown
<!-- .claude/commands/optimize.md -->
Analyze this code for performance issues and suggest optimizations:

1. Identify potential bottlenecks
2. Suggest specific improvements
3. Provide refactored code examples
4. Estimate performance impact
```

### Advanced Command Features

**Arguments and Dynamic Content** can be incorporated using the `$ARGUMENTS` placeholder, which gets replaced with any text following the command invocation[1][4][3].

```markdown
<!-- .claude/commands/fix-issue.md -->
Fix issue #$ARGUMENTS following our coding standards:

1. Understand the issue described in the ticket
2. Locate the relevant code in our codebase  
3. Implement a solution that addresses the root cause
4. Add appropriate tests
5. Prepare a concise PR description
```

**File References** allow commands to automatically include file contents using the `@` prefix[1][4]:

```markdown
<!-- .claude/commands/review.md -->
Review the implementation in @src/components/UserProfile.tsx and compare it with @src/components/AdminProfile.tsx for consistency.
```

**Bash Command Execution** enables commands to gather real-time system information using the `!` prefix[1][4]:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context
- Current git status: !`git status`
- Current git diff: !`git diff HEAD`  
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task
Based on the above changes, create a single git commit.
```

### YAML Frontmatter Configuration

Commands support **YAML frontmatter** for metadata and advanced configuration[1][4]:

```markdown
---
allowed-tools: Bash(npm test:*), Bash(npm run lint:*)
description: Run comprehensive code quality checks
argument-hint: [test|lint|all]
---

# Quality Assurance Command

Execute quality checks based on the specified argument:
- test: Run test suites
- lint: Run linting and formatting  
- all: Run complete quality pipeline

Arguments received: $ARGUMENTS
```

## Built-in Commands Reference

Claude Code provides **21 essential built-in commands** that handle core functionality[1]:

### Basic Operations
- **`/help`**: Display available commands and usage guidance[1]
- **`/clear`**: Clear conversation history and reset context[1]
- **`/status`**: Show account and system status information[1]
- **`/cost`**: Display token usage statistics for the current session[1]

### Configuration Management  
- **`/config`**: View and modify Claude Code settings[1]
- **`/model`**: Select or change the AI model being used[1]
- **`/permissions`**: Manage file system access permissions[1]

### Project Management
- **`/init`**: Initialize project with CLAUDE.md guide and project context[1][8]
- **`/memory`**: Edit CLAUDE.md memory files for persistent project knowledge[1]
- **`/add-dir`**: Add additional working directories to the session[1]
- **`/compact`**: Compress conversation history with optional focus instructions[1]

### Development Tools
- **`/review`**: Request comprehensive code review and analysis[1]
- **`/pr_comments`**: View and manage pull request comments[1]
- **`/vim`**: Enter vim mode for advanced text editing[1]

### System Integration
- **`/mcp`**: Manage MCP server connections and authentication[1][5]
- **`/login`**: Switch between Anthropic accounts[1]
- **`/logout`**: Sign out from current Anthropic account[1]
- **`/doctor`**: Check Claude Code installation health and diagnose issues[1][9]

## MCP Integration and External Commands

**Model Context Protocol (MCP) commands** represent Claude Code's most advanced capability, enabling integration with external services and tools[6][5]. These commands are **dynamically discovered** from connected MCP servers and follow a specific naming convention[5].

### MCP Command Format
MCP commands use the pattern `/mcp__<server-name>__<prompt-name>` with normalized naming where spaces become underscores and names are lowercased[5].

```bash
# Without arguments
/mcp__github__list_prs

# With arguments  
/mcp__github__pr_review 456
/mcp__jira__create_issue "Bug title" high
```

### Common MCP Integrations
- **GitHub Integration**: Repository management, issue tracking, pull request automation[5][10]
- **Database Access**: Query execution, schema analysis, data manipulation[6]
- **Browser Automation**: Web scraping, screenshot capture, form interaction[6][10]
- **File System Operations**: Advanced file management beyond standard permissions[6]

### Managing MCP Servers
The `/mcp` command provides comprehensive server management[5]:

```bash
# List all configured servers
claude mcp list

# Get details for specific server
claude mcp get github

# Remove a server
claude mcp remove my-server
```

## Advanced Use Cases and Examples

### Development Workflow Automation

**Deployment Commands** can orchestrate complex deployment processes[4][7]:

```markdown
<!-- .claude/commands/deploy.md -->
---
allowed-tools: Bash(npm run:*), Bash(git:*), Bash(docker:*)
description: Deploy application to staging environment
---

Execute production-ready deployment:

1. Run all tests: !`npm test`
2. Build for production: !`npm run build`
3. Run security checks: !`npm audit`
4. Deploy to staging: !`docker-compose up -d`
5. Verify health checks: !`curl -f http://staging.app/health`
6. Provide deployment summary with timestamps
```

**Code Analysis Commands** can perform sophisticated codebase analysis[4][7]:

```markdown  
<!-- .claude/commands/analyze.md -->
Perform comprehensive analysis of $ARGUMENTS:

1. **Architecture Review**: Analyze project structure and design patterns
2. **Performance Assessment**: Identify bottlenecks and optimization opportunities  
3. **Security Audit**: Review for potential vulnerabilities
4. **Code Quality**: Assess maintainability and technical debt
5. **Test Coverage**: Evaluate testing strategy and gaps
6. **Documentation**: Review and suggest improvements

Focus on actionable recommendations with specific examples.
```

### Project-Specific Workflows

**Feature Development Commands** can standardize development processes[4][11]:

```markdown
<!-- .claude/commands/feature.md -->
---  
description: Start new feature development
argument-hint: <feature-name> [branch-prefix]
---

Create new feature: $ARGUMENTS

1. Create feature branch from main
2. Set up component structure in src/components/
3. Add to routing configuration
4. Create initial test files  
5. Update documentation with feature overview
6. Generate development checklist
```

### Team Collaboration Commands

**Code Review Commands** can ensure consistent review standards[3][7]:

```markdown
<!-- .claude/commands/team-review.md -->
Execute comprehensive team code review:

1. **Functionality**: Does the code meet requirements?
2. **Code Style**: Follows team conventions and style guide?
3. **Performance**: Any potential performance implications?  
4. **Security**: Security considerations addressed?
5. **Testing**: Adequate test coverage provided?
6. **Documentation**: Code properly documented?

Provide specific feedback with line numbers and suggestions.
```

## Troubleshooting and Common Issues

Common problems with slash commands typically fall into predictable categories with straightforward solutions[12][9]:
### Command Recognition Issues

**Commands not appearing** often results from incorrect file placement or naming[12]. Ensure Markdown files are in the correct directory (`.claude/commands/` for project, `~/.claude/commands/` for personal) and have the `.md` extension[1][4].

**Autocomplete not working** typically requires restarting the Claude Code session to refresh the command registry[12].

### Syntax and Configuration Problems

**YAML frontmatter errors** can prevent commands from loading properly[12][13]. Validate YAML syntax using proper `---` delimiters and correct indentation[1][4].

**Permission issues** with bash commands require explicit tool allowlisting in the frontmatter[1][4]:

```markdown
---
allowed-tools: Bash(git:*), Bash(npm:*), Bash(docker:*)
---
```

### Argument and Reference Issues

**`$ARGUMENTS` placeholders** are case-sensitive and must be written exactly as `$ARGUMENTS`[1][4]. Variations like `$arguments` or `${ARGUMENTS}` will not work.

**File references** using `@` require valid file paths[1][4]. Verify files exist and use appropriate relative or absolute paths.

### MCP-Specific Issues

**MCP server connectivity** problems can be diagnosed using `/mcp` to check server status and authentication[6][5]. Common issues include:
- Server not running or configured incorrectly
- Authentication tokens expired or missing  
- Network connectivity problems
- Server-side errors or timeouts

## Best Practices and Optimization

### Command Design Principles

**Specificity over generality** produces better results[3][14]. Instead of creating broad commands that try to handle multiple scenarios, create focused commands that excel at specific tasks.

**Context provision** through file references, bash commands, and detailed instructions helps Claude understand the specific environment and requirements[3][14].

**Error handling and validation** should be built into commands that execute bash commands or interact with external systems[1][4]:

```markdown
---
allowed-tools: Bash(git:*)
---

Check git status before proceeding: !`git status --porcelain`

If working directory is not clean:
1. Review uncommitted changes
2. Ask for user confirmation before proceeding  
3. Provide options to stash, commit, or abort
```

### Performance Optimization  

**Command complexity** should be balanced against execution time[15]. Complex bash commands or extensive file operations can slow command execution significantly.

**Caching strategies** can be implemented for commands that fetch external 

```markdown
<!-- Check if cache exists and is recent -->
Cache status: !`test -f .cache/api_data.json && find .cache/api_data.json -mmin -60 || echo "expired"`

<!-- Use cached data if available, otherwise fetch new data -->
```

### Team Integration

**Version control** of project commands enables team collaboration[3][16]. Commands in `.claude/commands/` should be committed to the repository to share workflows across the team.

**Documentation standards** for commands help team members understand and extend existing commands[3][17]:

```markdown
---
description: Deploy to staging with health checks
author: dev-team
created: 2024-01-15
last-modified: 2024-02-01  
argument-hint: [quick|full|rollback]
---

# Staging Deployment Command

This command handles deployment to our staging environment...
```

## Integration with Claude Code Ecosystem

### CLAUDE.md Integration

Slash commands work synergistically with **CLAUDE.md files**[17][18]. The CLAUDE.md provides persistent project context that informs command execution, while commands provide structured workflows that utilize that context.

Example CLAUDE.md structure that supports slash commands:

```markdown
# Project: E-commerce Platform

## Architecture
- Frontend: React with TypeScript
- Backend: Node.js with Express  
- Database: PostgreSQL
- Deployment: Docker containers

## Available Commands
- `/deploy`: Staging deployment with health checks
- `/test-api`: Run API integration tests
- `/review-pr`: Comprehensive pull request review

## Coding Standards  
- ESLint configuration in .eslintrc.js
- Prettier for code formatting
- Jest for testing framework
```

### Hooks Integration

**Claude Code hooks** complement slash commands by providing automatic execution at specific lifecycle events[19][13][20]. While slash commands are manually invoked, hooks trigger automatically:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command", 
            "command": "prettier --write $CLAUDE_FILE_PATHS"
          }
        ]
      }
    ]
  }
}
```

### Multi-Agent Workflows  

Advanced users can create **multi-agent workflows** using slash commands that spawn sub-processes[11][14]:

```markdown  
<!-- .claude/commands/parallel-review.md -->
Execute parallel code review process:

1. Start main review agent for architecture analysis
2. Spawn security review subagent: !`claude -p "/security-review @src/**/*.js"`  
3. Spawn performance review subagent: !`claude -p "/performance-review @src/**/*.js"`
4. Coordinate and merge findings from all agents
5. Generate comprehensive review report
```

## Future Directions and Advanced Patterns

### Workflow Orchestration

The evolution of slash commands toward **sophisticated workflow orchestration** represents the cutting edge of AI-assisted development[11][21]. Advanced patterns include:

**Pipeline Commands** that chain multiple operations with error handling and rollback capabilities[21].

**Context-Aware Commands** that analyze current project state and adapt their behavior accordingly[22][11].

**Learning Commands** that improve their effectiveness based on usage patterns and outcomes[15].

### Community and Ecosystem Development

The **open-source community** around Claude Code slash commands continues to grow, with repositories sharing production-ready commands and best practices[23][24][25]. Notable community resources include:

- **Command libraries** providing pre-built solutions for common development tasks[24][25]
- **Template repositories** offering starting points for different project types[26]
- **Best practice guides** from experienced practitioners[27][14]

## Conclusion

Claude Code slash commands represent a **paradigm shift** in AI-assisted development, transforming Claude from a conversational assistant into an intelligent automation platform[3][14]. The combination of built-in utilities, custom command creation, and MCP integration provides developers with unprecedented flexibility to automate workflows, maintain project knowledge, and scale development processes.

The true power lies not in individual commands, but in the **systematic approach** to development automation they enable[22][11]. By treating repetitive tasks as opportunities for command creation, teams can build sophisticated development environments that evolve with their needs while maintaining consistency and quality standards.

As the ecosystem continues to mature, slash commands will undoubtedly become central to modern software development workflows, offering a bridge between human creativity and AI capability that enhances both productivity and code quality[28][29]. The investment in learning and implementing these patterns pays dividends in reduced development time, improved consistency, and enhanced collaboration across development teams.

Sources
[1] Slash commands - Anthropic https://docs.anthropic.com/en/docs/claude-code/slash-commands
[
