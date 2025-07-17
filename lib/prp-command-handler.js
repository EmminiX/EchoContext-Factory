#!/usr/bin/env node

/**
 * PRP Command Handler for Context Engineering Factory
 * Handles execution of the /generate-prp command with proper integration
 */

const { PRPGenerator } = require('./prp-generator');
const path = require('path');
const fs = require('fs');

class PRPCommandHandler {
  constructor() {
    this.prpGenerator = new PRPGenerator();
    this.startTime = Date.now();
  }

  /**
   * Main command execution entry point
   */
  async execute(args = []) {
    try {
      console.log('🎯 PRP Generator v2.1.0 - Feature Requirements Prompt Generation');
      console.log('══════════════════════════════════════════════════════════════');
      
      // Parse command arguments
      const options = this.parseArguments(args);
      
      // Show welcome message
      this.showWelcomeMessage();
      
      // Execute PRP generation
      const result = await this.prpGenerator.generatePRP(options);
      
      // Handle results
      if (result.success) {
        await this.handleSuccess(result);
      } else {
        await this.handleError(result);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ PRP Command Handler Error:', error.message);
      return {
        success: false,
        error: error.message,
        outputPath: null
      };
    }
  }

  /**
   * Parse command line arguments
   */
  parseArguments(args) {
    const options = {
      includeUI: false,
      includeAPI: false,
      includeSecurity: false,
      featureName: null,
      featureType: null,
      quickMode: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--feature':
          options.featureName = args[i + 1];
          i++;
          break;
        case '--component':
          options.featureType = 'component';
          break;
        case '--ui':
          options.includeUI = true;
          break;
        case '--api':
          options.includeAPI = true;
          break;
        case '--security-review':
          options.includeSecurity = true;
          break;
        case '--quick':
          options.quickMode = true;
          break;
        case '--analyze-codebase':
          options.analyzeCodebase = true;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
          break;
      }
    }

    return options;
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    console.log('\n🚀 Welcome to PRP Generator!');
    console.log('═══════════════════════════════');
    console.log('This tool will help you create a comprehensive Product Requirements Prompt (PRP)');
    console.log('for AI-optimized feature development.\n');
    console.log('📋 Process Overview:');
    console.log('  1. Interactive feature discovery questions');
    console.log('  2. Automated codebase analysis');
    console.log('  3. Live web research for best practices');
    console.log('  4. Professional PRP document generation');
    console.log('  5. File output to generated-prps/ directory\n');
    console.log('Let\'s get started! 🎯\n');
  }

  /**
   * Handle successful PRP generation
   */
  async handleSuccess(result) {
    const executionTime = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('\n✅ PRP Generation Completed Successfully!');
    console.log('═══════════════════════════════════════════');
    console.log(`⏱️  Generation Time: ${executionTime} seconds`);
    console.log(`📄 PRP Document: ${result.outputPath}`);
    console.log(`🔍 Research Sources: ${result.research?.totalResults || 0} resources found`);
    console.log(`📊 Context Quality: ${result.context?.completeness || 0}% complete`);
    
    // Show file contents preview
    if (result.outputPath && fs.existsSync(result.outputPath)) {
      const fileStats = fs.statSync(result.outputPath);
      console.log(`📋 Document Size: ${Math.round(fileStats.size / 1024)}KB`);
      console.log(`📁 Full Path: ${path.resolve(result.outputPath)}`);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('  1. Review the generated PRP document');
    console.log('  2. Use the PRP with Claude Code for feature development');
    console.log('  3. Reference the research links for additional context');
    console.log('  4. Follow the implementation guidelines provided');
    
    // Voice notification (if enabled)
    await this.announceCompletion(result);
  }

  /**
   * Handle PRP generation errors
   */
  async handleError(result) {
    const executionTime = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('\n❌ PRP Generation Failed');
    console.log('═══════════════════════════');
    console.log(`⏱️  Execution Time: ${executionTime} seconds`);
    console.log(`🚨 Error: ${result.error}`);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check your internet connection for web research');
    console.log('  2. Ensure all required dependencies are installed');
    console.log('  3. Verify write permissions for generated-prps/ directory');
    console.log('  4. Try again with --quick flag for simplified generation');
    
    // Voice notification (if enabled)
    await this.announceError(result);
  }

  /**
   * Voice announcement for completion
   */
  async announceCompletion(result) {
    try {
      // Check if voice system is available
      const voiceScript = path.join(__dirname, '../hooks/voice_control.py');
      if (fs.existsSync(voiceScript)) {
        const { spawn } = require('child_process');
        const featureName = result.context?.answers?.feature_name || 'feature';
        const message = `PRP generation complete for ${featureName}. Document saved successfully.`;
        
        spawn('python3', [voiceScript, 'announce', message], { 
          stdio: 'ignore',
          detached: true 
        });
      }
    } catch (error) {
      // Voice announcement is optional, don't fail the command
      console.log('📢 Voice announcement not available');
    }
  }

  /**
   * Voice announcement for errors
   */
  async announceError(result) {
    try {
      const voiceScript = path.join(__dirname, '../hooks/voice_control.py');
      if (fs.existsSync(voiceScript)) {
        const { spawn } = require('child_process');
        const message = `PRP generation failed. Please check the console for error details.`;
        
        spawn('python3', [voiceScript, 'announce', message], { 
          stdio: 'ignore',
          detached: true 
        });
      }
    } catch (error) {
      // Voice announcement is optional, don't fail the command
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🎯 PRP Generator - Help

USAGE:
  node lib/prp-command-handler.js [OPTIONS]

OPTIONS:
  --feature <name>        Specify feature name
  --component             Generate for single component
  --ui                    Include UI-specific questions
  --api                   Include API-specific questions  
  --security-review       Include security-focused questions
  --quick                 Quick mode with minimal questions
  --analyze-codebase      Deep codebase analysis
  --help                  Show this help message

EXAMPLES:
  node lib/prp-command-handler.js --feature "User Authentication"
  node lib/prp-command-handler.js --component --ui
  node lib/prp-command-handler.js --quick --feature "Shopping Cart"
  node lib/prp-command-handler.js --api --security-review

OUTPUT:
  Generated PRP documents are saved to: generated-prps/
  
MORE INFO:
  For detailed information about PRP generation process, see:
  commands/generate-prp.md
`);
  }

  /**
   * Quick generation mode for simple features
   */
  async executeQuickGeneration(featureName, featureDescription) {
    console.log(`🚀 Quick PRP Generation for: ${featureName}`);
    
    const result = await this.prpGenerator.generateQuickPRP(featureName, featureDescription);
    
    if (result.success) {
      console.log(`✅ Quick PRP generated: ${result.outputPath}`);
    } else {
      console.error(`❌ Quick PRP generation failed: ${result.error}`);
    }
    
    return result;
  }
}

// Command line execution
if (require.main === module) {
  const handler = new PRPCommandHandler();
  const args = process.argv.slice(2);
  
  handler.execute(args)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { PRPCommandHandler };