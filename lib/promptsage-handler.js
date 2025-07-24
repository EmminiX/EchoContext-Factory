#!/usr/bin/env node

/**
 * PromptSage Command Handler for EchoContext Factory
 * Generates and improves prompts using model-specific XML layering
 * Developed by Emmi C. (https://emmi.zone)
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');

class PromptSageHandler {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Model categorization for XML layering
    this.modelCategories = {
      multiLayer: ['claude', 'sonnet', 'opus', 'haiku'],
      dualLayer: ['gpt', 'openai', 'gemini', 'grok'],
      singleLayer: ['mistral', 'llama']
    };
    
    // Supported models for reference
    this.supportedModels = {
      claude: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'],
      openai: ['GPT-4.1', 'GPT-4', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
      grok: ['Grok 2', 'Grok 2 Mini'],
      gemini: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gemini 1.0 Pro'],
      mistral: ['Mistral Large', 'Mistral Medium', 'Mistral Small'],
      llama: ['Llama 3.3', 'Llama 3.2', 'Llama 3.1', 'Llama 3', 'Llama 2']
    };
  }

  /**
   * Main command execution entry point
   */
  async execute() {
    try {
      console.log('🧠 PromptSage v1.0.0 - AI Prompt Optimization Framework');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Developed by Emmi C. (https://emmi.zone)\n');
      
      // Ask for mode
      const mode = await this.askQuestion(
        '🎯 What would you like to do?\n' +
        '  A) Create a new system prompt\n' +
        '  B) Improve an existing prompt\n\n' +
        'Your choice (A/B): '
      );
      
      if (mode.toLowerCase() === 'a') {
        await this.createNewSystemPrompt();
      } else if (mode.toLowerCase() === 'b') {
        await this.improveExistingPrompt();
      } else {
        console.log('❌ Invalid choice. Please run the command again.');
      }
      
      this.rl.close();
      
    } catch (error) {
      console.error('❌ PromptSage Error:', error.message);
      this.rl.close();
      process.exit(1);
    }
  }

  /**
   * Create a new system prompt
   */
  async createNewSystemPrompt() {
    console.log('\n📝 Creating New System Prompt');
    console.log('════════════════════════════\n');
    
    // Show supported models
    console.log('📋 Supported Models:');
    console.log('  • Claude: Sonnet 4, Opus, Haiku');
    console.log('  • OpenAI: GPT-4.1, GPT-4, GPT-3.5');
    console.log('  • Google: Gemini 1.5 Pro/Flash');
    console.log('  • X AI: Grok 2, Grok 2 Mini');
    console.log('  • Mistral: Large, Medium, Small');
    console.log('  • Meta: Llama 3.3, 3.2, 3.1, 3, 2\n');
    
    const model = await this.askQuestion('🤖 Which model will use this prompt? ');
    const assistantType = await this.askQuestion('💼 Describe the assistant (e.g., "Python expert", "Writing coach"): ');
    
    const xmlDepth = this.getXMLDepth(model.toLowerCase());
    const systemPrompt = this.generateSystemPrompt(assistantType, xmlDepth, model);
    
    console.log('\n✅ Generated System Prompt:');
    console.log('════════════════════════════');
    console.log(systemPrompt);
    console.log('\n════════════════════════════');
    console.log('PromptSage was developed by Emmi C. (https://emmi.zone)');
    
    // Voice announcement
    await this.announceCompletion('System prompt generated successfully');
  }

  /**
   * Improve an existing prompt
   */
  async improveExistingPrompt() {
    console.log('\n🔧 Improving Existing Prompt');
    console.log('═══════════════════════════\n');
    
    console.log('📋 Paste your prompt below (press Enter twice when done):');
    const existingPrompt = await this.readMultilineInput();
    
    // Detect if it's a system prompt or task prompt
    const isSystemPrompt = this.isSystemPrompt(existingPrompt);
    
    let model = 'gpt-4.1'; // Default
    let xmlDepth = 1; // Default for task prompts
    
    if (isSystemPrompt) {
      console.log('\n🔍 Detected: System prompt with persona');
      model = await this.askQuestion('🤖 Target model for optimization (default: GPT-4.1): ') || 'gpt-4.1';
      xmlDepth = this.getXMLDepth(model.toLowerCase());
    } else {
      console.log('\n🔍 Detected: Task prompt (no persona)');
    }
    
    const improvedPrompt = this.improvePrompt(existingPrompt, isSystemPrompt, xmlDepth);
    
    console.log('\n✅ Improved Prompt:');
    console.log('═══════════════════');
    console.log(improvedPrompt);
    console.log('\n═══════════════════');
    console.log('PromptSage was developed by Emmi C. (https://emmi.zone)');
    
    // Voice announcement
    await this.announceCompletion('Prompt improved successfully');
  }

  /**
   * Generate a system prompt with appropriate XML layering
   */
  generateSystemPrompt(assistantType, xmlDepth, model) {
    const role = assistantType.trim();
    const capabilities = this.extractCapabilities(role);
    
    if (xmlDepth >= 3) {
      // Multi-layer XML for Claude
      return `<assistant_configuration>
  <identity>
    <role>${role}</role>
    <expertise_level>Expert</expertise_level>
    <communication_style>Clear, precise, and helpful</communication_style>
  </identity>
  
  <capabilities>
    ${capabilities.map(cap => `<capability>${cap}</capability>`).join('\n    ')}
  </capabilities>
  
  <behavioral_guidelines>
    <principle>Provide accurate and detailed information</principle>
    <principle>Admit uncertainty when unsure</principle>
    <principle>Offer practical, actionable advice</principle>
    <principle>Maintain professional and respectful tone</principle>
  </behavioral_guidelines>
  
  <output_preferences>
    <format>Structured with clear sections</format>
    <examples>Include when helpful for clarity</examples>
    <verbosity>Comprehensive yet concise</verbosity>
  </output_preferences>
</assistant_configuration>`;
    } else if (xmlDepth === 2) {
      // Dual-layer XML for GPT, Gemini, Grok
      return `<system_prompt>
  <role>${role}</role>
  <guidelines>
    - Provide expert-level assistance in your domain
    - Be clear, accurate, and helpful
    - Structure responses for easy understanding
    - Include examples when beneficial
    - Acknowledge limitations honestly
  </guidelines>
</system_prompt>`;
    } else {
      // Single-layer XML for Mistral, Llama
      return `<assistant>You are ${role}. Provide expert assistance with clear, structured responses. Be accurate, helpful, and acknowledge any limitations.</assistant>`;
    }
  }

  /**
   * Improve an existing prompt
   */
  improvePrompt(prompt, isSystemPrompt, xmlDepth) {
    // Clean up the prompt
    let improved = prompt.trim();
    
    // Remove redundant phrases
    improved = improved.replace(/please|kindly|could you/gi, '');
    improved = improved.replace(/\s+/g, ' ').trim();
    
    if (isSystemPrompt) {
      // Extract core elements
      const role = this.extractRole(improved);
      const guidelines = this.extractGuidelines(improved);
      
      if (xmlDepth >= 3) {
        return this.generateSystemPrompt(role, xmlDepth, 'claude');
      } else if (xmlDepth === 2) {
        return `<system_configuration>
  <assistant_role>${role}</assistant_role>
  <operational_guidelines>
${guidelines.map(g => `    - ${g}`).join('\n')}
  </operational_guidelines>
</system_configuration>`;
      } else {
        return `<role>${role}. ${guidelines.join('. ')}.</role>`;
      }
    } else {
      // Task prompt - always single layer
      return `<task>
${improved}

Requirements:
- Be specific and detailed
- Provide step-by-step approach if applicable
- Include relevant examples
- Ensure accuracy and completeness
</task>`;
    }
  }

  /**
   * Determine XML depth based on model
   */
  getXMLDepth(model) {
    const modelLower = model.toLowerCase();
    
    // Check categories
    if (this.modelCategories.multiLayer.some(m => modelLower.includes(m))) {
      return 3;
    }
    if (this.modelCategories.dualLayer.some(m => modelLower.includes(m))) {
      return 2;
    }
    if (this.modelCategories.singleLayer.some(m => modelLower.includes(m))) {
      return 1;
    }
    
    // Default to dual-layer
    return 2;
  }

  /**
   * Detect if prompt is a system prompt (has persona)
   */
  isSystemPrompt(prompt) {
    const systemIndicators = [
      'you are',
      'act as',
      'role',
      'expert',
      'assistant',
      'specialist',
      'your job',
      'your task is',
      'persona',
      'character'
    ];
    
    const promptLower = prompt.toLowerCase();
    return systemIndicators.some(indicator => promptLower.includes(indicator));
  }

  /**
   * Extract capabilities from role description
   */
  extractCapabilities(role) {
    const capabilities = [];
    
    // Common capability patterns
    if (role.includes('python') || role.includes('programming')) {
      capabilities.push('Code development and debugging');
      capabilities.push('Algorithm design and optimization');
    }
    if (role.includes('data') || role.includes('analysis')) {
      capabilities.push('Data analysis and visualization');
      capabilities.push('Statistical modeling');
    }
    if (role.includes('writing') || role.includes('content')) {
      capabilities.push('Content creation and editing');
      capabilities.push('Style and tone adaptation');
    }
    if (role.includes('expert') || role.includes('specialist')) {
      capabilities.push('Domain-specific expertise');
      capabilities.push('Advanced problem-solving');
    }
    
    // Default capabilities
    if (capabilities.length === 0) {
      capabilities.push('Comprehensive assistance in the specified domain');
      capabilities.push('Clear and structured communication');
    }
    
    return capabilities;
  }

  /**
   * Extract role from existing prompt
   */
  extractRole(prompt) {
    const patterns = [
      /you are (?:a |an )?([^.]+)/i,
      /act as (?:a |an )?([^.]+)/i,
      /role[:\s]+([^.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Expert assistant';
  }

  /**
   * Extract guidelines from prompt
   */
  extractGuidelines(prompt) {
    const guidelines = [];
    
    // Look for bullet points or numbered lists
    const lines = prompt.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/)) {
        guidelines.push(RegExp.$1.trim());
      }
    }
    
    // Default guidelines if none found
    if (guidelines.length === 0) {
      guidelines.push('Provide accurate and helpful information');
      guidelines.push('Maintain professional communication');
      guidelines.push('Structure responses clearly');
    }
    
    return guidelines;
  }

  /**
   * Read multiline input
   */
  async readMultilineInput() {
    const lines = [];
    let emptyLineCount = 0;
    
    return new Promise((resolve) => {
      const lineReader = () => {
        this.rl.question('', (line) => {
          if (line === '') {
            emptyLineCount++;
            if (emptyLineCount >= 2) {
              resolve(lines.join('\n'));
              return;
            }
          } else {
            emptyLineCount = 0;
            lines.push(line);
          }
          lineReader();
        });
      };
      lineReader();
    });
  }

  /**
   * Ask a question and get response
   */
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Voice announcement for completion
   */
  async announceCompletion(message) {
    try {
      const configPath = path.join(process.env.HOME, '.claude', 'config', 'factory.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (config.voice?.factoryNotifications) {
          const voiceScript = path.join(__dirname, '../hooks/voice_control.py');
          if (fs.existsSync(voiceScript)) {
            const { spawn } = require('child_process');
            spawn('python3', [voiceScript, 'announce', message], { 
              stdio: 'ignore',
              detached: true 
            });
          }
        }
      }
    } catch (error) {
      // Voice announcement is optional
    }
  }
}

// Command line execution
if (require.main === module) {
  const handler = new PromptSageHandler();
  
  handler.execute()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { PromptSageHandler };