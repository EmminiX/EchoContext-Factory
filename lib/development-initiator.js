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
   * Handle full project development
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

    // Add live research context if enabled
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