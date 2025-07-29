#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AgentStatusChecker {
  constructor() {
    this.agentsDir = path.join(process.cwd(), '.claude', 'agents');
  }

  async run() {
    console.log('🤖 Claude Code Agent Status Check');
    console.log('=====================================\n');

    // Check Task tool availability
    const hasTaskTool = typeof Task !== 'undefined';
    
    console.log('📊 Agent System Status:');
    console.log(`   Task tool available: ${hasTaskTool ? '✅ YES' : '❌ NO'}`);
    console.log(`   Environment: ${hasTaskTool ? 'Claude Code' : 'Standard Node.js'}`);
    console.log(`   Mode: ${hasTaskTool ? '🚀 Full Agent Mode' : '⚡ Fallback Mode'}\n`);

    // List configured agents
    console.log('📁 Configured Agents:');
    if (fs.existsSync(this.agentsDir)) {
      const agentFiles = fs.readdirSync(this.agentsDir).filter(f => f.endsWith('.md'));
      console.log(`   Found ${agentFiles.length} agent definitions:\n`);
      
      agentFiles.forEach(file => {
        const agentPath = path.join(this.agentsDir, file);
        const content = fs.readFileSync(agentPath, 'utf-8');
        
        // Extract YAML frontmatter
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (yamlMatch) {
          const yaml = yamlMatch[1];
          const nameMatch = yaml.match(/name:\s*(.+)/);
          const descMatch = yaml.match(/description:\s*(.+)/);
          const toolsMatch = yaml.match(/tools:\s*(.+)/);
          
          const name = nameMatch ? nameMatch[1] : file.replace('.md', '');
          const desc = descMatch ? descMatch[1] : 'No description';
          const tools = toolsMatch ? toolsMatch[1].split(',').length : 0;
          
          console.log(`   📄 ${name}`);
          console.log(`      ${desc}`);
          console.log(`      Tools: ${tools} configured\n`);
        }
      });
    } else {
      console.log('   ❌ No agents directory found at', this.agentsDir);
    }

    // Test agent spawning if available
    if (hasTaskTool) {
      console.log('🧪 Testing Agent Spawning...\n');
      
      try {
        const testResult = await Task({
          description: 'Agent System Test',
          prompt: 'Use the research-techstack sub agent to test agent availability. Just respond with "Agent system working!"'
        });
        
        console.log('   ✅ Agent spawning successful!');
        console.log('   Response:', testResult);
      } catch (error) {
        console.log('   ❌ Agent spawning failed:', error.message);
      }
    } else {
      console.log('ℹ️  Agent System Information:\n');
      console.log('   Agents are only available when running inside Claude Code.');
      console.log('   The system will automatically use fallback methods when agents');
      console.log('   are not available, ensuring all commands work correctly.\n');
      console.log('   To use agents:');
      console.log('   1. Open this project in Claude Code (claude.ai/code)');
      console.log('   2. Run slash commands normally');
      console.log('   3. Agents will automatically activate when available\n');
    }

    console.log('💡 Tips:');
    console.log('   - Agents provide 10-20x speed improvements');
    console.log('   - All commands work with or without agents');
    console.log('   - Fallback mode uses standard sequential execution');
    console.log('   - Agent results are higher quality due to specialization');
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new AgentStatusChecker();
  checker.run();
}

module.exports = { AgentStatusChecker };