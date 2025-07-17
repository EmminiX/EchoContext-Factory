#!/usr/bin/env node

/**
 * Development Initiator for EchoContext Factory
 * Bridges the gap between documentation and coding for neurodivergent-friendly development
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const glob = require('glob');
const { TemplateProcessor } = require('./template-processor');

class DevelopmentInitiator {
  constructor() {
    this.templateProcessor = new TemplateProcessor();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.scenarios = this.loadScenarios();
    this.availableDocs = {};
  }

  /**
   * Load development scenarios configuration
   */
  loadScenarios() {
    try {
      const scenariosPath = path.join(process.env.HOME, '.claude', 'data', 'development-scenarios.json');
      if (fs.existsSync(scenariosPath)) {
        return JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
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
    const prpFiles = glob.sync('generated-prps/*.md');
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