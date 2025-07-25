#!/usr/bin/env node

/**
 * Multi-Agent Coordinator for Complex Task Management
 * Handles intelligent task decomposition and agent coordination
 */

const fs = require('fs');
const path = require('path');
const { ResultAggregator } = require('./result-aggregator');
const { FileGenerator } = require('./file-generator');

class MultiAgentCoordinator {
  constructor() {
    this.activeAgents = new Map();
    this.completedTasks = [];
    this.agentTemplates = this.loadAgentTemplates();
    this.maxConcurrentAgents = 6; // Reasonable limit to prevent overload
    this.resultAggregator = new ResultAggregator();
    this.fileGenerator = new FileGenerator();
  }

  /**
   * Load predefined agent templates for different specializations
   */
  loadAgentTemplates() {
    return {
      research: {
        name: "Research Specialist",
        description: "Information gathering and analysis expert",
        promptTemplate: `You are a specialized research agent with expertise in {domain}. 

Your task: {task_description}

Research Focus: {research_focus}

Instructions:
1. Conduct comprehensive research on the specified topic
2. Gather information from credible sources and best practices
3. Provide detailed findings with actionable insights
4. Include relevant URLs and documentation references
5. Structure your response with clear sections and bullet points

Research Parameters:
- Domain: {domain}
- Scope: {scope}
- Quality: Focus on authoritative and recent sources
- Depth: Provide comprehensive coverage of the topic

Expected Output:
- Executive summary of findings
- Detailed analysis with supporting evidence
- Best practices and recommendations
- Relevant resources and documentation links
- Implementation guidance where applicable

Please be thorough, accurate, and focus on practical value for the specified domain.`
      },

      analysis: {
        name: "Analysis Specialist", 
        description: "Code and system analysis expert",
        promptTemplate: `You are a code analysis specialist with deep expertise in {technology_stack}.

Your task: {task_description}

Analysis Target: {analysis_target}

Instructions:
1. Examine the specified system/code thoroughly
2. Identify patterns, issues, and optimization opportunities
3. Provide specific findings with code examples
4. Suggest concrete improvements and best practices
5. Focus on {analysis_focus}

Analysis Parameters:
- Technology Stack: {technology_stack}
- Focus Areas: {analysis_focus}
- Quality Standards: Industry best practices
- Output Format: Detailed technical analysis

Expected Output:
- Current state assessment
- Identified issues and bottlenecks
- Specific recommendations with examples
- Implementation priority ranking
- Risk assessment and mitigation strategies

Please provide actionable insights that can directly improve the system.`
      },

      implementation: {
        name: "Implementation Specialist",
        description: "Code generation and file creation expert", 
        promptTemplate: `You are an implementation specialist for {technology_stack}.

Your task: {task_description}

Implementation Requirements: {requirements}

Instructions:
1. Create production-ready {deliverable_type}
2. Follow industry best practices and coding standards
3. Include comprehensive error handling and validation
4. Provide clear documentation and comments
5. Ensure security and performance considerations

Implementation Parameters:
- Technology Stack: {technology_stack}
- Deliverable: {deliverable_type}
- Quality Level: Production-ready
- Standards: Industry best practices

Expected Output:
- Complete, functional implementation
- Comprehensive documentation
- Usage examples and integration guidance
- Testing recommendations
- Deployment and configuration notes

Please create high-quality, maintainable code that follows established patterns.`
      },

      validation: {
        name: "Validation Specialist",
        description: "Testing and quality assurance expert",
        promptTemplate: `You are a quality assurance specialist focusing on {validation_type}.

Your task: {task_description}

Validation Target: {validation_target}

Instructions:
1. Validate {validation_target} against {criteria}
2. Perform comprehensive testing and quality checks
3. Identify potential issues and vulnerabilities
4. Provide specific improvement recommendations
5. Create testing strategies and validation procedures

Validation Parameters:
- Target: {validation_target}
- Criteria: {criteria}
- Standards: {quality_standards}
- Scope: {validation_scope}

Expected Output:
- Comprehensive validation report
- Test results and quality metrics
- Identified issues with severity ranking
- Specific remediation recommendations
- Testing strategy and procedures

Please provide thorough quality assessment with actionable improvement guidance.`
      },

      integration: {
        name: "Integration Specialist",
        description: "System integration and coordination expert",
        promptTemplate: `You are an integration specialist responsible for coordinating multiple components.

Your task: {task_description}

Integration Components: {components}

Instructions:
1. Analyze all provided components for compatibility
2. Identify integration requirements and dependencies
3. Resolve conflicts and inconsistencies
4. Create unified, coherent final output
5. Ensure all requirements are properly addressed

Integration Parameters:
- Components: {components}
- Requirements: {integration_requirements}
- Quality Standards: Consistency and completeness
- Output Format: {output_format}

Expected Output:
- Integrated final deliverable
- Component compatibility analysis
- Conflict resolution documentation
- Integration testing recommendations
- Deployment and maintenance guidance

Please create a cohesive, high-quality integrated solution.`
      }
    };
  }

  /**
   * Analyze task complexity and determine if multi-agent approach is beneficial
   */
  analyzeTaskComplexity(taskDescription) {
    const complexityIndicators = [
      'multiple technologies', 'full-stack', 'comprehensive', 'complete system',
      'research and implement', 'analyze and create', 'frontend and backend',
      'database and api', 'testing and deployment', 'security and performance',
      'documentation and code', 'multiple formats', 'different approaches'
    ];

    const componentIndicators = [
      'research', 'analyze', 'implement', 'create', 'build', 'design',
      'test', 'validate', 'deploy', 'document', 'optimize', 'secure'
    ];

    const taskLower = taskDescription.toLowerCase();
    
    const complexityScore = complexityIndicators.reduce((score, indicator) => {
      return taskLower.includes(indicator) ? score + 1 : score;
    }, 0);

    const componentCount = componentIndicators.reduce((count, indicator) => {
      return taskLower.includes(indicator) ? count + 1 : count;
    }, 0);

    return {
      score: complexityScore,
      componentCount: componentCount,
      isComplex: complexityScore >= 2 || componentCount >= 3,
      estimatedAgents: Math.min(Math.max(componentCount, 2), this.maxConcurrentAgents)
    };
  }

  /**
   * Decompose complex task into parallelizable components
   */
  decomposeTask(taskDescription) {
    const analysis = this.analyzeTaskComplexity(taskDescription);
    
    if (!analysis.isComplex) {
      return {
        useMultiAgent: false,
        reason: "Task is not complex enough to benefit from multi-agent approach",
        suggestedApproach: "single-agent"
      };
    }

    // Identify task components based on keywords and patterns
    const components = [];
    const taskLower = taskDescription.toLowerCase();

    // Research component
    if (taskLower.includes('research') || 
        taskLower.includes('investigate') || 
        taskLower.includes('analyze options') ||
        taskLower.includes('best practices')) {
      components.push({
        type: 'research',
        priority: 1,
        description: 'Research and gather comprehensive information',
        dependencies: []
      });
    }

    // Analysis component
    if (taskLower.includes('analyze') || 
        taskLower.includes('examine') || 
        taskLower.includes('review') ||
        taskLower.includes('assess')) {
      components.push({
        type: 'analysis',
        priority: 1,
        description: 'Analyze existing systems and requirements',
        dependencies: []
      });
    }

    // Implementation components
    const implementationKeywords = ['create', 'build', 'implement', 'develop', 'generate'];
    if (implementationKeywords.some(keyword => taskLower.includes(keyword))) {
      
      // Frontend implementation
      if (taskLower.includes('frontend') || taskLower.includes('ui') || taskLower.includes('interface')) {
        components.push({
          type: 'implementation',
          subtype: 'frontend',
          priority: 2,
          description: 'Implement frontend/UI components',
          dependencies: ['research', 'analysis']
        });
      }

      // Backend implementation
      if (taskLower.includes('backend') || taskLower.includes('api') || taskLower.includes('server')) {
        components.push({
          type: 'implementation',
          subtype: 'backend',
          priority: 2,
          description: 'Implement backend/API components',
          dependencies: ['research', 'analysis']
        });
      }

      // Database implementation
      if (taskLower.includes('database') || taskLower.includes('db') || taskLower.includes('data model')) {
        components.push({
          type: 'implementation',
          subtype: 'database',
          priority: 2,
          description: 'Implement database and data models',
          dependencies: ['research', 'analysis']
        });
      }

      // General implementation if no specific type found
      if (!components.some(c => c.type === 'implementation')) {
        components.push({
          type: 'implementation',
          priority: 2,
          description: 'Implement core functionality',
          dependencies: ['research', 'analysis']
        });
      }
    }

    // Testing/Validation component
    if (taskLower.includes('test') || 
        taskLower.includes('validate') || 
        taskLower.includes('verify') ||
        taskLower.includes('quality')) {
      components.push({
        type: 'validation',
        priority: 3,
        description: 'Test and validate implementation',
        dependencies: ['implementation']
      });
    }

    // Documentation component
    if (taskLower.includes('document') || 
        taskLower.includes('documentation') || 
        taskLower.includes('guide') ||
        taskLower.includes('readme')) {
      components.push({
        type: 'implementation',
        subtype: 'documentation',
        priority: 3,
        description: 'Create comprehensive documentation',
        dependencies: ['implementation']
      });
    }

    return {
      useMultiAgent: components.length >= 2,
      components: components,
      estimatedDuration: components.length * 10, // minutes
      parallelizable: components.filter(c => c.priority === 2).length > 1
    };
  }

  /**
   * Create specialized agent prompt based on task component
   */
  createAgentPrompt(component, taskContext) {
    const template = this.agentTemplates[component.type];
    if (!template) {
      throw new Error(`No template found for agent type: ${component.type}`);
    }

    let prompt = template.promptTemplate;
    
    // Replace placeholders with context-specific values
    const replacements = {
      '{task_description}': component.description,
      '{domain}': taskContext.domain || 'general',
      '{technology_stack}': taskContext.techStack || 'modern web development',
      '{deliverable_type}': component.subtype || 'implementation',
      '{requirements}': taskContext.requirements || component.description,
      '{analysis_target}': taskContext.analysisTarget || 'the specified system',
      '{analysis_focus}': taskContext.analysisFocus || 'performance and best practices',
      '{validation_target}': taskContext.validationTarget || 'the implementation',
      '{criteria}': taskContext.validationCriteria || 'best practices and quality standards',
      '{scope}': taskContext.scope || 'comprehensive',
      '{research_focus}': taskContext.researchFocus || component.description,
      '{components}': taskContext.components || 'all task components',
      '{integration_requirements}': taskContext.integrationRequirements || 'seamless integration',
      '{output_format}': taskContext.outputFormat || 'comprehensive documentation',
      '{quality_standards}': taskContext.qualityStandards || 'industry best practices',
      '{validation_scope}': taskContext.validationScope || 'complete system',
      '{validation_type}': taskContext.validationType || 'comprehensive quality assurance'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return prompt;
  }

  /**
   * Extract task context from user description
   */
  extractTaskContext(taskDescription) {
    const context = {
      domain: 'general',
      techStack: 'modern web development',
      requirements: taskDescription,
      scope: 'comprehensive'
    };

    const taskLower = taskDescription.toLowerCase();

    // Detect technology stack
    const techPatterns = {
      'react': ['react', 'jsx', 'react.js'],
      'vue': ['vue', 'vue.js'],
      'angular': ['angular'],
      'node.js': ['node', 'nodejs', 'node.js', 'express'],
      'python': ['python', 'flask', 'django', 'fastapi'],
      'java': ['java', 'spring', 'springboot'],
      'go': ['golang', 'go programming'],
      'rust': ['rust programming'],
      'typescript': ['typescript', 'ts'],
      'javascript': ['javascript', 'js']
    };

    for (const [tech, patterns] of Object.entries(techPatterns)) {
      if (patterns.some(pattern => taskLower.includes(pattern))) {
        context.techStack = tech;
        break;
      }
    }

    // Detect domain
    if (taskLower.includes('web') || taskLower.includes('frontend') || taskLower.includes('backend')) {
      context.domain = 'web development';
    } else if (taskLower.includes('mobile') || taskLower.includes('ios') || taskLower.includes('android')) {
      context.domain = 'mobile development';
    } else if (taskLower.includes('data') || taskLower.includes('ml') || taskLower.includes('ai')) {
      context.domain = 'data science';
    } else if (taskLower.includes('devops') || taskLower.includes('infrastructure')) {
      context.domain = 'devops';
    }

    // Detect scope
    if (taskLower.includes('full') || taskLower.includes('complete') || taskLower.includes('comprehensive')) {
      context.scope = 'comprehensive';
    } else if (taskLower.includes('quick') || taskLower.includes('simple') || taskLower.includes('basic')) {
      context.scope = 'basic';
    }

    return context;
  }

  /**
   * Generate execution plan for multi-agent task
   */
  generateExecutionPlan(taskDescription) {
    const decomposition = this.decomposeTask(taskDescription);
    
    if (!decomposition.useMultiAgent) {
      return decomposition;
    }

    const taskContext = this.extractTaskContext(taskDescription);
    const agents = [];

    // Create agents for each component
    for (const component of decomposition.components) {
      const agentPrompt = this.createAgentPrompt(component, taskContext);
      
      agents.push({
        id: `agent_${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: component.type,
        subtype: component.subtype,
        prompt: agentPrompt,
        priority: component.priority,
        dependencies: component.dependencies,
        description: component.description,
        status: 'pending'
      });
    }

    // Sort agents by priority and dependencies
    const sortedAgents = this.sortAgentsByPriority(agents);

    return {
      useMultiAgent: true,
      agents: sortedAgents,
      executionOrder: this.calculateExecutionOrder(sortedAgents),
      estimatedDuration: decomposition.estimatedDuration,
      parallelizable: decomposition.parallelizable,
      taskContext: taskContext
    };
  }

  /**
   * Sort agents by priority and dependencies
   */
  sortAgentsByPriority(agents) {
    return agents.sort((a, b) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by dependency count (fewer dependencies first)
      return a.dependencies.length - b.dependencies.length;
    });
  }

  /**
   * Calculate optimal execution order considering dependencies
   */
  calculateExecutionOrder(agents) {
    const executionPhases = [];
    const remaining = [...agents];
    const completed = new Set();

    while (remaining.length > 0) {
      const phase = [];
      const nextRemaining = [];

      for (const agent of remaining) {
        // Check if all dependencies are completed
        const dependenciesMet = agent.dependencies.every(dep => completed.has(dep));
        
        if (dependenciesMet) {
          phase.push(agent);
          completed.add(agent.type);
        } else {
          nextRemaining.push(agent);
        }
      }

      if (phase.length === 0 && nextRemaining.length > 0) {
        // Circular dependency or missing dependency - add all remaining
        phase.push(...nextRemaining);
        break;
      }

      executionPhases.push(phase);
      remaining.splice(0, remaining.length, ...nextRemaining);
    }

    return executionPhases;
  }

  /**
   * Format execution plan for display
   */
  formatExecutionPlan(plan) {
    if (!plan.useMultiAgent) {
      return `📋 **Single Agent Approach Recommended**

${plan.reason}

**Suggested Action**: Proceed with standard single-agent task execution.`;
    }

    let output = `🤖 **Multi-Agent Execution Plan**

**Task Analysis**:
- Domain: ${plan.taskContext.domain}
- Technology: ${plan.taskContext.techStack}
- Scope: ${plan.taskContext.scope}
- Agents Required: ${plan.agents.length}
- Estimated Duration: ${plan.estimatedDuration} minutes
- Parallelizable: ${plan.parallelizable ? 'Yes' : 'No'}

**Agent Specializations**:
`;

    for (const agent of plan.agents) {
      const template = this.agentTemplates[agent.type];
      output += `- **${template.name}**: ${agent.description}\n`;
    }

    output += `\n**Execution Phases**:\n`;
    
    for (let i = 0; i < plan.executionOrder.length; i++) {
      const phase = plan.executionOrder[i];
      output += `\n**Phase ${i + 1}** ${phase.length > 1 ? '(Parallel)' : ''}:\n`;
      
      for (const agent of phase) {
        const template = this.agentTemplates[agent.type];
        output += `  - ${template.name}: ${agent.description}\n`;
      }
    }

    return output;
  }

  /**
   * Validate execution plan quality
   */
  validateExecutionPlan(plan) {
    const issues = [];
    
    if (plan.agents.length > this.maxConcurrentAgents) {
      issues.push(`Too many agents (${plan.agents.length} > ${this.maxConcurrentAgents})`);
    }

    if (plan.executionOrder.length > 5) {
      issues.push('Too many execution phases - consider simplifying');
    }

    const agentTypes = new Set(plan.agents.map(a => a.type));
    if (agentTypes.size < 2) {
      issues.push('All agents are the same type - multi-agent may not be beneficial');
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 20))
    };
  }

  /**
   * Execute agents in parallel using Claude Code's Task tool
   */
  async executeAgents(plan) {
    if (!plan.useMultiAgent) {
      return { 
        success: false, 
        reason: 'Multi-agent execution not recommended for this task' 
      };
    }

    const results = [];
    const errors = [];

    console.log(`🚀 Starting multi-agent execution with ${plan.agents.length} agents`);

    try {
      // Execute agents in phases based on dependencies
      for (let phaseIndex = 0; phaseIndex < plan.executionOrder.length; phaseIndex++) {
        const phase = plan.executionOrder[phaseIndex];
        console.log(`\n📋 Phase ${phaseIndex + 1}: Executing ${phase.length} agent(s)${phase.length > 1 ? ' in parallel' : ''}`);

        // Execute agents in this phase (potentially in parallel)
        const phaseResults = await Promise.allSettled(
          phase.map(agent => this.executeAgent(agent, plan.taskContext))
        );

        // Process phase results
        for (let i = 0; i < phaseResults.length; i++) {
          const result = phaseResults[i];
          const agent = phase[i];

          if (result.status === 'fulfilled') {
            results.push({
              agentId: agent.id,
              agentType: agent.type,
              subtype: agent.subtype,
              description: agent.description,
              output: result.value,
              phase: phaseIndex + 1,
              success: true
            });
            console.log(`✅ ${agent.type} agent completed successfully`);
          } else {
            errors.push({
              agentId: agent.id,
              agentType: agent.type,
              error: result.reason,
              phase: phaseIndex + 1
            });
            console.log(`❌ ${agent.type} agent failed: ${result.reason}`);
          }
        }

        // If this phase had critical failures, consider stopping
        const criticalFailures = phaseResults.filter(r => r.status === 'rejected').length;
        if (criticalFailures > phase.length / 2) {
          console.log(`⚠️  Too many failures in phase ${phaseIndex + 1}, continuing with available results`);
        }
      }

      return {
        success: true,
        results: results,
        errors: errors,
        summary: {
          totalAgents: plan.agents.length,
          successfulAgents: results.length,
          failedAgents: errors.length,
          phases: plan.executionOrder.length
        }
      };

    } catch (error) {
      console.error('❌ Multi-agent execution failed:', error);
      return {
        success: false,
        error: error.message,
        results: results,
        errors: errors
      };
    }
  }

  /**
   * Execute a single agent using Claude Code's Task tool
   */
  async executeAgent(agent, taskContext) {
    try {
      console.log(`🤖 Starting ${agent.type} agent (${agent.id})`);

      // Create a specialized prompt for the agent
      const agentPrompt = `You are a ${agent.type} specialist agent working on a complex multi-agent task.

${agent.prompt}

**Important Instructions:**
1. Focus specifically on your assigned component: ${agent.description}
2. Provide detailed, actionable output in markdown format
3. Include specific findings, recommendations, and next steps
4. Structure your response with clear headings and bullet points
5. Use MCP tools (Context7, Perplexity, Tavily) for comprehensive research
6. For implementation tasks, provide complete, working code examples
7. For analysis tasks, include specific issues and recommendations
8. For research tasks, include credible sources with MCP attribution

**Your specialized role**: ${this.agentTemplates[agent.type].name}
**Task context**: ${JSON.stringify(taskContext, null, 2)}
**Current year**: 2025 - Focus on latest practices and standards

**IMPORTANT**: You MUST use the appropriate MCP tools:
- Context7 MCP for technical documentation and code examples
- Perplexity MCP for best practices and current trends
- Tavily MCP for supplementary research and validation

Please execute your specialized task and provide comprehensive results.`;

      // Use Claude Code's Task tool to execute the agent
      // This will spawn a new Claude instance with the specialized prompt
      const taskResult = await this.executeTask(agentPrompt, agent);

      return taskResult;

    } catch (error) {
      console.error(`❌ Agent ${agent.type} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute task using Claude Code's Task tool - real implementation
   */
  async executeTask(prompt, agent) {
    console.log(`📝 Executing task for ${agent.type} agent using Claude Code Task tool...`);
    
    try {
      // Map agent types to specialized Claude Code sub-agents
      const agentMapping = {
        'research': 'research-techstack',
        'analysis': 'research-architecture', 
        'implementation': 'implementation-backend',
        'validation': 'implementation-testing',
        'integration': 'synthesis-specialist'
      };
      
      // Get the appropriate sub-agent name
      const subAgentName = agentMapping[agent.type] || agent.type;
      
      // When running in Claude Code, this will use the actual Task tool
      // to spawn the specified sub-agent with the given prompt
      if (typeof Task !== 'undefined') {
        console.log(`🚀 Spawning ${subAgentName} sub-agent...`);
        
        // Use Claude Code's Task tool to execute the agent
        const result = await Task({
          description: `${agent.type} specialist: ${agent.description}`,
          prompt: `Use the ${subAgentName} sub agent to complete this task:\n\n${prompt}`
        });
        
        console.log(`✅ ${subAgentName} sub-agent completed successfully`);
        return result;
      } else {
        // Fallback for development/testing outside Claude Code
        console.warn(`⚠️ Task tool not available - running in fallback mode`);
        
        // In fallback mode, return a mock result for testing
        return {
          success: true,
          agentType: agent.type,
          subAgent: subAgentName,
          output: `[Fallback Mode] ${agent.type} agent would execute:\n${agent.prompt}`,
          fallbackMode: true
        };
      }
      
    } catch (error) {
      console.error(`❌ Task execution failed for ${agent.type} agent:`, error.message);
      
      // If Task tool fails, try alternative execution method
      if (error.message.includes('not found') || error.message.includes('not available')) {
        console.log(`🔄 Attempting alternative execution for ${agent.type} agent...`);
        
        // Return structured error for handling
        return {
          success: false,
          agentType: agent.type,
          error: error.message,
          fallbackMessage: 'Agent execution requires Claude Code environment with sub-agents configured'
        };
      }
      
      throw error;
    }
  }

  /**
   * Aggregate results from multiple agents using ResultAggregator
   */
  aggregateResults(executionResults, taskDescription) {
    if (!executionResults.success) {
      return {
        success: false,
        error: 'Agent execution failed',
        details: executionResults
      };
    }

    const { results, errors, summary } = executionResults;
    
    // Reset aggregator for new task
    this.resultAggregator.reset();
    
    // Add all results to aggregator
    results.forEach(result => {
      this.resultAggregator.addResult(result);
    });
    
    // Add errors to aggregator
    errors.forEach(error => {
      this.resultAggregator.addResult({ ...error, success: false });
    });

    // Generate comprehensive report
    const aggregatedReport = this.resultAggregator.generateAggregatedReport(taskDescription);
    const markdownOutput = this.resultAggregator.generateTaskSpecificReport(taskDescription);
    
    // Validate results quality
    const validation = this.resultAggregator.validateResults();

    return {
      success: true,
      aggregatedReport: aggregatedReport,
      markdownOutput: markdownOutput,
      validation: validation,
      resultAggregator: this.resultAggregator
    };
  }

  /**
   * Generate recommendations based on execution results
   */
  generateRecommendations(results, errors) {
    const recommendations = [];

    if (errors.length > 0) {
      recommendations.push({
        type: 'error_handling',
        message: `${errors.length} agent(s) failed during execution. Review error details and consider retry.`,
        priority: 'high'
      });
    }

    if (results.length > 0) {
      recommendations.push({
        type: 'integration',
        message: 'Results are ready for integration. Consider validation and quality checks.',
        priority: 'medium'
      });
    }

    const agentTypes = new Set(results.map(r => r.agentType));
    if (agentTypes.has('research') && agentTypes.has('implementation')) {
      recommendations.push({
        type: 'workflow',
        message: 'Research and implementation results available. Consider validation phase.',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Generate files based on task results
   */
  generateResultFiles(aggregatedReport, taskDescription) {
    try {
      console.log(`📝 Generating result files for: ${taskDescription}`);
      
      // Generate appropriate files based on task type
      const generatedFiles = this.fileGenerator.generateFiles(aggregatedReport, taskDescription);
      
      console.log(`✅ Generated ${generatedFiles.length} file(s)`);
      return generatedFiles;
      
    } catch (error) {
      console.error('❌ Failed to generate result files:', error.message);
      return [];
    }
  }

  /**
   * Complete multi-agent workflow with file generation
   */
  async completeMultiAgentWorkflow(taskDescription) {
    try {
      console.log(`🚀 Starting complete multi-agent workflow for: ${taskDescription}`);
      
      // Step 1: Generate execution plan
      const plan = this.generateExecutionPlan(taskDescription);
      console.log(`📋 Execution plan generated: ${plan.useMultiAgent ? 'Multi-agent' : 'Single-agent'}`);
      
      if (!plan.useMultiAgent) {
        return {
          success: false,
          reason: 'Task does not require multi-agent approach',
          plan: plan
        };
      }
      
      // Step 2: Execute agents
      const executionResults = await this.executeAgents(plan);
      console.log(`🏁 Agent execution completed: ${executionResults.success ? 'Success' : 'Failed'}`);
      
      // Step 3: Aggregate results
      const aggregatedResults = this.aggregateResults(executionResults, taskDescription);
      console.log(`📊 Results aggregated: ${aggregatedResults.success ? 'Success' : 'Failed'}`);
      
      // Step 4: Generate result files
      const generatedFiles = this.generateResultFiles(aggregatedResults.aggregatedReport, taskDescription);
      console.log(`📝 Files generated: ${generatedFiles.length} file(s)`);
      
      return {
        success: true,
        plan: plan,
        executionResults: executionResults,
        aggregatedResults: aggregatedResults,
        generatedFiles: generatedFiles,
        summary: {
          taskDescription: taskDescription,
          totalAgents: plan.agents.length,
          successfulAgents: executionResults.summary.successfulAgents,
          failedAgents: executionResults.summary.failedAgents,
          filesGenerated: generatedFiles.length,
          completionTime: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Multi-agent workflow failed:', error.message);
      return {
        success: false,
        error: error.message,
        taskDescription: taskDescription
      };
    }
  }

  /**
   * Format aggregated results as markdown
   */
  formatAggregatedResults(report) {
    let markdown = `# ${report.title}

## Executive Summary
- **Total Agents**: ${report.summary.totalAgents}
- **Successful**: ${report.summary.successfulAgents}
- **Failed**: ${report.summary.failedAgents}
- **Phases**: ${report.summary.phases}
- **Execution Time**: ${report.summary.executionTime}

`;

    // Add results by agent type
    for (const [agentType, agentResults] of Object.entries(report.results)) {
      markdown += `## ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Results\n\n`;
      
      agentResults.forEach(result => {
        markdown += `### ${result.description}\n`;
        markdown += `${result.output}\n\n`;
      });
    }

    // Add errors if any
    if (report.errors.length > 0) {
      markdown += `## Errors and Issues\n\n`;
      report.errors.forEach(error => {
        markdown += `- **${error.agentType}**: ${error.error}\n`;
      });
      markdown += `\n`;
    }

    // Add recommendations
    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- **${rec.type}** (${rec.priority}): ${rec.message}\n`;
      });
    }

    markdown += `\n---\n*Generated by EchoContext Factory Multi-Agent System*\n*${new Date().toISOString()}*`;

    return markdown;
  }
}

module.exports = { MultiAgentCoordinator };