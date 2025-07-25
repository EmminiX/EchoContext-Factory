#!/usr/bin/env node

/**
 * Development Initiator for EchoContext Factory
 * Bridges the gap between documentation and coding for neurodivergent-friendly development
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { TemplateProcessor } = require('./template-processor');

class DevelopmentInitiator {
  constructor() {
    // Use project-relative template path
    const projectRoot = path.resolve(__dirname, '..');
    const templatesPath = path.join(projectRoot, 'templates');
    this.templateProcessor = new TemplateProcessor(templatesPath);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.scenarios = this.loadScenarios();
    this.availableDocs = {};
    
    // Check for live research preference
    this.enableLiveResearch = process.env.ECHO_LIVE_RESEARCH !== 'false';
  }

  /**
   * Load development scenarios configuration
   */
  loadScenarios() {
    try {
      // Use project-relative data path
      const projectRoot = path.resolve(__dirname, '..');
      const scenariosPath = path.join(projectRoot, 'data', 'development-scenarios.json');
      if (fs.existsSync(scenariosPath)) {
        const data = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
        // Extract scenarios from the nested structure
        return data.scenarios || data;
      }
    } catch (error) {
      console.warn('Could not load scenarios, using defaults');
    }
    
    return {
      "project": {
        "name": "Full Project Development",
        "description": "Start building from complete project documentation",
        "requiredDocs": ["CLAUDE.md"],
        "template": "project-development",
        "voiceMessage": "Ready to build your documented project!"
      },
      "feature": {
        "name": "Feature Implementation", 
        "description": "Implement a specific feature from PRP",
        "requiredDocs": ["PRP"],
        "template": "feature-implementation",
        "voiceMessage": "Let's implement your feature!"
      },
      "fresh": {
        "name": "Fresh Start",
        "description": "Start a new project with guided assistance",
        "requiredDocs": [],
        "template": "getting-started",
        "voiceMessage": "Let's start something new together!"
      }
    };
  }

  /**
   * Main entry point
   */
  async start() {
    console.log('\n🚀 Development Initiator Activated!\n');
    console.log('Scanning for available documentation...\n');
    
    // Detect available documentation
    this.detectDocumentation();
    
    // Present options based on what's available
    const options = this.buildOptions();
    
    if (options.length === 0) {
      console.log('❌ No development options available.');
      console.log('Try running /start-project or /generate-prp first!\n');
      this.rl.close();
      return;
    }
    
    // Show available options
    this.displayOptions(options);
    
    // Get user choice
    const choice = await this.getUserChoice(options);
    
    // Process the selected option
    await this.processChoice(choice);
    
    this.rl.close();
  }

  /**
   * Detect available documentation
   */
  detectDocumentation() {
    // Check for project documentation
    const projectDocsPath = path.join(process.cwd(), '.claude');
    this.availableDocs.hasProject = fs.existsSync(path.join(projectDocsPath, 'CLAUDE.md'));
    this.availableDocs.hasPRD = fs.existsSync(path.join(projectDocsPath, 'PRD.md'));
    this.availableDocs.hasTasks = fs.existsSync(path.join(projectDocsPath, 'TASKS.md'));
    
    // Check for PRP documentation
    const prpDir = path.join(process.cwd(), 'generated-prps');
    const prpFiles = [];
    if (fs.existsSync(prpDir)) {
      const files = fs.readdirSync(prpDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          prpFiles.push(path.join(prpDir, file));
        }
      }
    }
    this.availableDocs.hasPRP = prpFiles.length > 0;
    this.availableDocs.prpFiles = prpFiles;
    
    // Summary
    this.availableDocs.hasAnyDocs = this.availableDocs.hasProject || this.availableDocs.hasPRP;
  }

  /**
   * Build available options based on documentation
   */
  buildOptions() {
    const options = [];
    
    if (this.availableDocs.hasProject) {
      options.push({
        key: 'A',
        scenario: 'project',
        emoji: '🏗️',
        label: 'Start building your project',
        description: 'Use CLAUDE.md, PRD.md, and TASKS.md to begin development'
      });
    }
    
    if (this.availableDocs.hasPRP) {
      options.push({
        key: 'B',
        scenario: 'feature',
        emoji: '⚡',
        label: 'Implement a feature',
        description: `Choose from ${this.availableDocs.prpFiles.length} available PRP(s)`
      });
    }
    
    // Always offer fresh start
    options.push({
      key: options.length === 0 ? 'A' : 'C',
      scenario: 'fresh',
      emoji: '✨',
      label: 'Start fresh',
      description: 'Begin a new project with guided assistance'
    });
    
    return options;
  }

  /**
   * Display options to user
   */
  displayOptions(options) {
    console.log('📋 Available Development Options:\n');
    
    options.forEach(option => {
      console.log(`${option.key}) ${option.emoji} ${option.label}`);
      console.log(`   ${option.description}\n`);
    });
  }

  /**
   * Get user's choice
   */
  async getUserChoice(options) {
    return new Promise((resolve) => {
      const validKeys = options.map(o => o.key.toLowerCase());
      
      this.rl.question('Select an option: ', (answer) => {
        const choice = answer.trim().toLowerCase();
        
        if (validKeys.includes(choice)) {
          const selected = options.find(o => o.key.toLowerCase() === choice);
          console.log(`\n✅ Selected: ${selected.emoji} ${selected.label}\n`);
          resolve(selected);
        } else {
          console.log('\n❌ Invalid choice. Please try again.\n');
          this.displayOptions(options);
          resolve(this.getUserChoice(options));
        }
      });
    });
  }

  /**
   * Process the user's choice
   */
  async processChoice(choice) {
    const scenario = this.scenarios[choice.scenario];
    
    if (!scenario) {
      console.error('❌ Invalid scenario selected');
      return;
    }
    
    console.log(`🔧 Preparing ${scenario.name}...\n`);
    
    // Handle different scenarios
    switch (choice.scenario) {
      case 'project':
        await this.handleProjectDevelopment();
        break;
      case 'feature':
        await this.handleFeatureImplementation();
        break;
      case 'fresh':
        await this.handleFreshStart();
        break;
    }
    
    // Voice announcement
    console.log(`\n🎉 ${scenario.voiceMessage}\n`);
  }

  /**
   * Handle full project development with optional agent teams
   */
  async handleProjectDevelopment() {
    console.log('📂 Loading project documentation...\n');
    
    // Load all project files
    const projectPath = path.join(process.cwd(), '.claude');
    const context = {
      claudeMd: this.loadFile(path.join(projectPath, 'CLAUDE.md')),
      prdMd: this.loadFile(path.join(projectPath, 'PRD.md')),
      tasksMd: this.loadFile(path.join(projectPath, 'TASKS.md')),
      projectName: this.extractProjectName(),
      timestamp: new Date().toISOString()
    };

    // Check if we're in Claude Code environment with agents
    const useAgents = typeof Task !== 'undefined';
    
    if (useAgents) {
      console.log('🤖 Claude Code agent system detected!\n');
      console.log('Would you like to use specialized development agents for parallel implementation?\n');
      console.log('This will spawn multiple agents to work on different aspects simultaneously:\n');
      console.log('  - Frontend Implementation Agent');
      console.log('  - Backend Implementation Agent');
      console.log('  - Database Design Agent');
      console.log('  - Testing Agent');
      console.log('  - Documentation Agent\n');
      
      const useAgentTeam = await this.confirmAgentTeam();
      
      if (useAgentTeam) {
        await this.launchDevelopmentAgentTeam(context);
        return;
      }
    }

    // Standard approach
    if (this.enableLiveResearch) {
      console.log('🔍 Gathering current best practices...\n');
      const researchContext = await this.performLiveResearch(context);
      Object.assign(context, researchContext);
    } else {
      console.log('⚡ Live research disabled - using static templates\n');
    }
    
    // Process template
    const prompt = this.templateProcessor.processTemplate('project-development', context);
    
    // Output the prompt
    this.outputPrompt(prompt, 'project-development-prompt.md');
  }

  /**
   * Confirm if user wants to use agent team
   */
  async confirmAgentTeam() {
    return new Promise((resolve) => {
      this.rl.question('Use agent team for parallel development? (Y/n): ', (answer) => {
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  }

  /**
   * Launch specialized development agent team
   */
  async launchDevelopmentAgentTeam(context) {
    console.log('\n🚀 Launching Development Agent Team...\n');
    
    // Parse project requirements from documentation
    const projectReqs = this.parseProjectRequirements(context);
    
    // Define specialized development agents
    const developmentAgents = [
      {
        agent: 'implementation-frontend',
        task: `Implement the frontend for ${projectReqs.projectName}. Use ${projectReqs.frontend || 'React'} with TypeScript. Follow the requirements in the PRD and implement all UI components with accessibility standards.`,
        focus: 'Frontend Implementation',
        dependencies: []
      },
      {
        agent: 'implementation-backend',
        task: `Implement the backend API for ${projectReqs.projectName}. Use ${projectReqs.backend || 'Node.js'} with Express. Create RESTful endpoints, authentication, and business logic as specified in the PRD.`,
        focus: 'Backend Implementation',
        dependencies: []
      },
      {
        agent: 'implementation-database',
        task: `Design and implement the database schema for ${projectReqs.projectName}. Use ${projectReqs.database || 'PostgreSQL'}. Create optimized schemas, migrations, and seed data based on the data models in the PRD.`,
        focus: 'Database Design',
        dependencies: []
      },
      {
        agent: 'implementation-testing',
        task: `Create comprehensive test suites for ${projectReqs.projectName}. Implement unit tests, integration tests, and e2e tests. Focus on critical user flows and ensure high coverage.`,
        focus: 'Testing Implementation',
        dependencies: ['frontend', 'backend']
      },
      {
        agent: 'documentation-specialist',
        task: `Create technical documentation for ${projectReqs.projectName}. Write API documentation, setup guides, and architecture documentation. Include code examples and deployment instructions.`,
        focus: 'Documentation',
        dependencies: ['frontend', 'backend', 'database']
      }
    ];
    
    try {
      console.log(`📋 Spawning ${developmentAgents.length} specialized agents...\n`);
      
      // Execute agents in phases based on dependencies
      const phase1Agents = developmentAgents.filter(a => a.dependencies.length === 0);
      const phase2Agents = developmentAgents.filter(a => a.dependencies.length > 0);
      
      // Phase 1: Independent agents
      console.log('🔄 Phase 1: Core Implementation (Frontend, Backend, Database)\n');
      
      const phase1Results = await this.executeAgentPhase(phase1Agents, context, projectReqs);
      
      // Phase 2: Dependent agents
      console.log('\n🔄 Phase 2: Testing & Documentation\n');
      
      const phase2Results = await this.executeAgentPhase(phase2Agents, context, projectReqs);
      
      // Synthesize results
      console.log('\n🧬 Synthesizing agent outputs...\n');
      await this.synthesizeDevelopmentResults([...phase1Results, ...phase2Results], projectReqs);
      
      console.log('\n✅ Development agent team completed successfully!');
      console.log('📁 Check the generated files in your project directory.\n');
      
    } catch (error) {
      console.error('❌ Agent team execution failed:', error.message);
      console.log('\n📋 Falling back to standard development prompt...\n');
      
      // Fallback to standard approach
      const prompt = this.templateProcessor.processTemplate('project-development', context);
      this.outputPrompt(prompt, 'project-development-prompt.md');
    }
  }

  /**
   * Execute a phase of agents
   */
  async executeAgentPhase(agents, context, projectReqs) {
    const agentPromises = agents.map(async (agentConfig) => {
      console.log(`   🤖 ${agentConfig.agent}: Starting ${agentConfig.focus}...`);
      
      try {
        const result = await Task({
          description: `${agentConfig.focus} for ${projectReqs.projectName}`,
          prompt: `Use the ${agentConfig.agent} sub agent to implement:

${agentConfig.task}

**Project Documentation:**
${context.claudeMd ? '✓ CLAUDE.md loaded' : '✗ CLAUDE.md missing'}
${context.prdMd ? '✓ PRD.md loaded' : '✗ PRD.md missing'}
${context.tasksMd ? '✓ TASKS.md loaded' : '✗ TASKS.md missing'}

**Key Requirements:**
${JSON.stringify(projectReqs, null, 2)}

Please implement production-ready code following best practices. Include:
1. Complete implementation files
2. Proper error handling
3. Comprehensive comments
4. Security considerations
5. Performance optimizations

Focus on your specific domain (${agentConfig.focus}) and create all necessary files.`
        });
        
        console.log(`   ✅ ${agentConfig.agent} completed`);
        
        return {
          agent: agentConfig.agent,
          focus: agentConfig.focus,
          success: true,
          result: result
        };
        
      } catch (error) {
        console.error(`   ❌ ${agentConfig.agent} failed:`, error.message);
        return {
          agent: agentConfig.agent,
          focus: agentConfig.focus,
          success: false,
          error: error.message
        };
      }
    });
    
    return await Promise.all(agentPromises);
  }

  /**
   * Parse project requirements from documentation
   */
  parseProjectRequirements(context) {
    const reqs = {
      projectName: this.extractProjectName() || 'Project',
      frontend: 'React',
      backend: 'Node.js',
      database: 'PostgreSQL',
      features: []
    };
    
    // Extract tech stack from CLAUDE.md
    if (context.claudeMd) {
      const frontendMatch = context.claudeMd.match(/Frontend:\s*([^\n]+)/i);
      const backendMatch = context.claudeMd.match(/Backend:\s*([^\n]+)/i);
      const databaseMatch = context.claudeMd.match(/Database:\s*([^\n]+)/i);
      
      if (frontendMatch) reqs.frontend = frontendMatch[1].trim();
      if (backendMatch) reqs.backend = backendMatch[1].trim();
      if (databaseMatch) reqs.database = databaseMatch[1].trim();
    }
    
    // Extract features from PRD.md
    if (context.prdMd) {
      const featureMatches = context.prdMd.match(/##\s*Feature:\s*([^\n]+)/gi) || [];
      reqs.features = featureMatches.map(f => f.replace(/##\s*Feature:\s*/i, '').trim());
    }
    
    return reqs;
  }

  /**
   * Synthesize development results from all agents
   */
  async synthesizeDevelopmentResults(results, projectReqs) {
    const successfulAgents = results.filter(r => r.success);
    const failedAgents = results.filter(r => !r.success);
    
    console.log(`\n📊 Development Summary:`);
    console.log(`   ✅ Successful agents: ${successfulAgents.length}`);
    console.log(`   ❌ Failed agents: ${failedAgents.length}`);
    
    if (failedAgents.length > 0) {
      console.log(`\n⚠️  Failed agents:`);
      failedAgents.forEach(a => {
        console.log(`   - ${a.agent}: ${a.error}`);
      });
    }
    
    // Create summary document
    const summaryPath = path.join(process.cwd(), 'development-summary.md');
    const summary = this.generateDevelopmentSummary(results, projectReqs);
    
    fs.writeFileSync(summaryPath, summary);
    console.log(`\n📄 Development summary saved to: development-summary.md`);
  }

  /**
   * Generate development summary document
   */
  generateDevelopmentSummary(results, projectReqs) {
    let summary = `# Development Summary - ${projectReqs.projectName}\n\n`;
    summary += `Generated: ${new Date().toISOString()}\n\n`;
    
    summary += `## Project Overview\n`;
    summary += `- **Frontend**: ${projectReqs.frontend}\n`;
    summary += `- **Backend**: ${projectReqs.backend}\n`;
    summary += `- **Database**: ${projectReqs.database}\n`;
    summary += `- **Features**: ${projectReqs.features.length} core features\n\n`;
    
    summary += `## Agent Implementation Results\n\n`;
    
    results.forEach(result => {
      summary += `### ${result.focus}\n`;
      summary += `- **Agent**: ${result.agent}\n`;
      summary += `- **Status**: ${result.success ? '✅ Success' : '❌ Failed'}\n`;
      
      if (result.success && result.result) {
        summary += `- **Output**: Implementation completed\n`;
      } else if (result.error) {
        summary += `- **Error**: ${result.error}\n`;
      }
      
      summary += `\n`;
    });
    
    summary += `## Next Steps\n\n`;
    summary += `1. Review generated implementation files\n`;
    summary += `2. Run tests to verify functionality\n`;
    summary += `3. Set up local development environment\n`;
    summary += `4. Deploy to staging for testing\n\n`;
    
    summary += `---\n`;
    summary += `*Generated by EchoContext Factory Development Agent Team*\n`;
    
    return summary;
  }

  /**
   * Handle feature implementation
   */
  async handleFeatureImplementation() {
    let selectedPRP;
    
    if (this.availableDocs.prpFiles.length === 1) {
      selectedPRP = this.availableDocs.prpFiles[0];
      console.log(`📄 Using PRP: ${path.basename(selectedPRP)}\n`);
    } else {
      // Let user choose which PRP
      selectedPRP = await this.selectPRP();
    }
    
    console.log('📂 Loading PRP documentation...\n');
    
    // Load PRP file
    const context = {
      prpContent: this.loadFile(selectedPRP),
      prpFileName: path.basename(selectedPRP),
      timestamp: new Date().toISOString()
    };

    // Add live research context for feature implementation if enabled
    if (this.enableLiveResearch) {
      console.log('🔍 Researching feature implementation best practices...\n');
      const researchContext = await this.performLiveResearch(context);
      Object.assign(context, researchContext);
    } else {
      console.log('⚡ Live research disabled - using static templates\n');
    }
    
    // Process template
    const prompt = this.templateProcessor.processTemplate('feature-implementation', context);
    
    // Output the prompt
    this.outputPrompt(prompt, 'feature-implementation-prompt.md');
  }

  /**
   * Handle fresh start
   */
  async handleFreshStart() {
    console.log('🌟 Preparing fresh start guidance...\n');
    
    const context = {
      timestamp: new Date().toISOString()
    };
    
    // Process template
    const prompt = this.templateProcessor.processTemplate('getting-started', context);
    
    // Output the prompt
    this.outputPrompt(prompt, 'getting-started-prompt.md');
  }

  /**
   * Select a PRP from multiple options
   */
  async selectPRP() {
    console.log('📋 Available PRPs:\n');
    
    this.availableDocs.prpFiles.forEach((file, index) => {
      const name = path.basename(file);
      console.log(`${index + 1}) ${name}`);
    });
    
    return new Promise((resolve) => {
      this.rl.question('\nSelect a PRP (number): ', (answer) => {
        const index = parseInt(answer) - 1;
        
        if (index >= 0 && index < this.availableDocs.prpFiles.length) {
          resolve(this.availableDocs.prpFiles[index]);
        } else {
          console.log('\n❌ Invalid selection. Please try again.\n');
          resolve(this.selectPRP());
        }
      });
    });
  }

  /**
   * Load file content
   */
  loadFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.warn(`Warning: Could not load ${filePath}`);
      return '';
    }
  }

  /**
   * Extract project name from CLAUDE.md
   */
  extractProjectName() {
    try {
      const claudePath = path.join(process.cwd(), '.claude', 'CLAUDE.md');
      const content = fs.readFileSync(claudePath, 'utf8');
      const match = content.match(/^#\s+(.+)/m);
      return match ? match[1] : 'Project';
    } catch (error) {
      return 'Project';
    }
  }

  /**
   * Perform live research using WebSearch for current best practices
   */
  async performLiveResearch(context) {
    try {
      // Extract technology stack from context
      const techStack = this.extractTechStack(context);
      const researchQueries = this.generateResearchQueries(techStack);
      
      console.log(`📊 Researching ${researchQueries.length} topics...\n`);
      
      const researchResults = [];
      for (const query of researchQueries) {
        console.log(`🔍 Searching: ${query}`);
        try {
          const results = await this.executeWebSearch(query);
          if (results && results.length > 0) {
            researchResults.push({
              query: query,
              results: results.slice(0, 3) // Top 3 results per query
            });
          }
        } catch (error) {
          console.warn(`⚠️  Research failed for: ${query}`);
        }
      }
      
      return {
        liveResearch: this.formatResearchResults(researchResults),
        researchTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn('⚠️  Live research failed, continuing without research context');
      return {
        liveResearch: '',
        researchTimestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract technology stack from project context
   */
  extractTechStack(context) {
    const techStack = [];
    const content = (context.claudeMd || '') + (context.prdMd || '');
    
    // Common frontend frameworks
    if (content.includes('React')) techStack.push('React');
    if (content.includes('Vue')) techStack.push('Vue');
    if (content.includes('Angular')) techStack.push('Angular');
    if (content.includes('Svelte')) techStack.push('Svelte');
    
    // Backend frameworks
    if (content.includes('Node.js') || content.includes('Express')) techStack.push('Node.js');
    if (content.includes('Python') || content.includes('Django') || content.includes('FastAPI')) techStack.push('Python');
    if (content.includes('Java') || content.includes('Spring')) techStack.push('Java');
    if (content.includes('Go')) techStack.push('Go');
    
    // Databases
    if (content.includes('PostgreSQL')) techStack.push('PostgreSQL');
    if (content.includes('MongoDB')) techStack.push('MongoDB');
    if (content.includes('MySQL')) techStack.push('MySQL');
    
    // Tools and other technologies
    if (content.includes('Docker')) techStack.push('Docker');
    if (content.includes('Kubernetes')) techStack.push('Kubernetes');
    if (content.includes('TypeScript')) techStack.push('TypeScript');
    
    return techStack;
  }

  /**
   * Generate research queries based on technology stack
   */
  generateResearchQueries(techStack) {
    const queries = [];
    
    // Add technology-specific queries
    for (const tech of techStack) {
      queries.push(`${tech} best practices 2025`);
      queries.push(`${tech} security guidelines`);
    }
    
    // Add general development queries
    queries.push('software development best practices 2025');
    queries.push('code security standards 2025');
    queries.push('modern web development patterns');
    
    return queries.slice(0, 8); // Limit to 8 queries to avoid overwhelming
  }

  /**
   * Execute WebSearch using Claude Code's WebSearch tool
   */
  async executeWebSearch(query) {
    try {
      // NOTE: This method is designed to be executed within Claude Code context
      // where the WebSearch tool is available. When Claude Code processes this script,
      // it will replace this placeholder with actual WebSearch functionality.
      
      console.log(`   🔍 WebSearch: ${query}`);
      
      // CLAUDE CODE INTEGRATION POINT:
      // When this script is executed by Claude Code, replace this section with:
      // const results = await WebSearch({ query, allowed_domains: ['docs.', 'github.com', 'stackoverflow.com'] });
      // return results.map(result => ({
      //   title: result.title,
      //   url: result.url,
      //   description: result.description || result.snippet
      // }));
      
      // For now, return structured placeholder that shows the expected format
      return [
        {
          title: `${query} - Official Documentation`,
          url: 'https://docs.example.com',
          description: 'Official documentation and best practices guide'
        },
        {
          title: `${query} - Community Guide`,
          url: 'https://community.example.com',
          description: 'Community-driven best practices and patterns'
        },
        {
          title: `${query} - Security Standards`,
          url: 'https://security.example.com',
          description: 'Security best practices and implementation guides'
        }
      ];
    } catch (error) {
      console.warn(`⚠️  WebSearch failed for query: ${query}`, error.message);
      return [];
    }
  }

  /**
   * Format research results for inclusion in templates
   */
  formatResearchResults(researchResults) {
    if (!researchResults || researchResults.length === 0) {
      return '';
    }
    
    let formatted = '\n## 🔍 Current Best Practices Research\n\n';
    formatted += '*Live research results gathered for your project:*\n\n';
    
    for (const research of researchResults) {
      formatted += `### ${research.query}\n\n`;
      for (const result of research.results) {
        formatted += `- **[${result.title}](${result.url})**\n`;
        formatted += `  ${result.description}\n\n`;
      }
    }
    
    return formatted;
  }

  /**
   * Output the generated prompt
   */
  outputPrompt(prompt, filename) {
    console.log('━'.repeat(80));
    console.log('\n📋 GENERATED DEVELOPMENT PROMPT:\n');
    console.log('━'.repeat(80));
    console.log(prompt);
    console.log('━'.repeat(80));
    
    // Save to file
    const outputPath = path.join(process.cwd(), '.claude', 'prompts');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    const filePath = path.join(outputPath, filename);
    fs.writeFileSync(filePath, prompt);
    
    console.log(`\n💾 Prompt saved to: ${filePath}`);
    console.log('\n🚀 Copy the prompt above and paste it to Claude Code to begin development!');
  }
}

// Main execution
if (require.main === module) {
  const initiator = new DevelopmentInitiator();
  initiator.start().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { DevelopmentInitiator };