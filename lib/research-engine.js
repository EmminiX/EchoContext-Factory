#!/usr/bin/env node

/**
 * Research Engine for EchoContext Factory
 * Handles automated web research and best practices integration
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { MCPIntegration } = require('./mcp-integration');

class ResearchEngine {
  constructor() {
    this.researchCache = new Map();
    this.cacheDir = path.join(process.env.HOME, '.claude', 'data', 'cache');
    this.mcpIntegration = new MCPIntegration();
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate research queries based on project context
   */
  generateResearchQueries(projectContext) {
    const queries = [];
    const { projectType, techStack, features } = projectContext;

    // Base technology queries
    if (techStack) {
      if (techStack.frontend && techStack.frontend !== 'none') {
        queries.push(`${techStack.frontend} best practices 2025`);
        queries.push(`${techStack.frontend} production deployment guide`);
        queries.push(`${techStack.frontend} security guidelines`);
      }

      if (techStack.backend && techStack.backend !== 'none') {
        queries.push(`${techStack.backend} API best practices`);
        queries.push(`${techStack.backend} performance optimization`);
        queries.push(`${techStack.backend} security implementation`);
      }

      if (techStack.database && techStack.database !== 'none') {
        queries.push(`${techStack.database} best practices`);
        queries.push(`${techStack.database} production configuration`);
        queries.push(`${techStack.database} security hardening`);
      }

      if (techStack.language && techStack.language !== 'javascript') {
        queries.push(`${techStack.language} coding standards`);
        queries.push(`${techStack.language} project structure`);
      }
    }

    // Project type specific queries
    if (projectType) {
      queries.push(`${projectType} architecture patterns 2025`);
      queries.push(`${projectType} development workflow`);
      queries.push(`${projectType} testing strategies`);
    }

    // Feature-specific queries
    if (features && features.length > 0) {
      features.forEach(feature => {
        queries.push(`${feature} implementation guide`);
        queries.push(`${feature} best practices`);
      });
    }

    // General development queries
    queries.push('software development best practices 2025');
    queries.push('code quality standards');
    queries.push('CI/CD pipeline setup');
    queries.push('Docker containerization best practices');

    return queries.slice(0, 15); // Limit to prevent overwhelming
  }

  /**
   * Execute MCP research for a specific query - no longer uses WebSearch
   */
  async executeWebSearch(query) {
    // This method is kept for backward compatibility but now uses MCP
    console.log(`🔍 Redirecting to MCP research for: ${query}`);
    
    try {
      // Use MCP integration for research
      const mcpResult = await this.mcpIntegration.executeComprehensiveResearch(query, {});
      
      // Extract sources from MCP results
      if (mcpResult && mcpResult.combinedSources) {
        return mcpResult.combinedSources.map(source => ({
          title: source.title,
          url: source.url,
          description: source.description,
          score: source.confidence || 10
        }));
      }
      
      return [];
    } catch (error) {
      console.warn(`MCP research failed for query: ${query}`, error.message);
      return [];
    }
  }



  /**
   * Process and validate research results
   */
  processResearchResults(results) {
    const validatedResults = [];

    for (const result of results) {
      // Basic validation
      if (!result.url || !result.title) continue;
      
      // Quality scoring (simple heuristic)
      let score = 0;
      
      // Prefer official documentation
      if (result.url.includes('docs.') || 
          result.url.includes('.dev') || 
          result.url.includes('official') ||
          result.url.includes('github.com')) {
        score += 10;
      }
      
      // Prefer recent content
      if (result.title.includes('2025')) {
        score += 5;
      }
      
      // Prefer best practices content
      if (result.title.toLowerCase().includes('best practices') ||
          result.title.toLowerCase().includes('guide') ||
          result.title.toLowerCase().includes('tutorial')) {
        score += 5;
      }

      validatedResults.push({
        ...result,
        score
      });
    }

    // Sort by score and return top results
    return validatedResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 results per query
  }

  /**
   * Generate research sections for documentation
   */
  generateResearchSections(allResults) {
    const sections = {};

    // Group results by category
    const categories = {
      'Frontend': ['react', 'vue', 'svelte', 'frontend'],
      'Backend': ['node', 'express', 'fastapi', 'backend', 'api'],
      'Database': ['postgresql', 'mysql', 'mongodb', 'database'],
      'DevOps': ['docker', 'kubernetes', 'deployment', 'ci/cd'],
      'Security': ['security', 'authentication', 'authorization'],
      'Performance': ['performance', 'optimization', 'caching'],
      'Testing': ['testing', 'jest', 'cypress', 'unit test'],
      'General': []
    };

    for (const [category, keywords] of Object.entries(categories)) {
      sections[category] = [];
    }

    // Categorize results
    for (const result of allResults) {
      let categorized = false;
      const searchText = (result.title + ' ' + result.description).toLowerCase();

      for (const [category, keywords] of Object.entries(categories)) {
        if (category === 'General') continue;
        
        if (keywords.some(keyword => searchText.includes(keyword))) {
          sections[category].push(result);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        sections['General'].push(result);
      }
    }

    // Remove empty sections
    Object.keys(sections).forEach(key => {
      if (sections[key].length === 0) {
        delete sections[key];
      }
    });

    return sections;
  }

  /**
   * Format research links for documentation
   */
  formatResearchLinks(researchSections) {
    let markdown = '\n## 📚 Research & Best Practices References\n\n';
    markdown += '*The following resources were automatically curated to provide comprehensive guidance for your project development.*\n\n';

    for (const [category, results] of Object.entries(researchSections)) {
      if (results.length === 0) continue;

      markdown += `### ${category}\n\n`;
      
      for (const result of results) {
        markdown += `- **[${result.title}](${result.url})**\n`;
        markdown += `  ${result.description}\n\n`;
      }
    }

    markdown += '### 🔍 Research Notes\n\n';
    markdown += 'These resources were selected based on:\n';
    markdown += '- **Relevance**: Matched to your specific technology stack and requirements\n';
    markdown += '- **Authority**: Prioritized official documentation and community-trusted sources\n';
    markdown += '- **Recency**: Focused on current best practices and 2025 standards\n';
    markdown += '- **Practical Value**: Selected for actionable guidance and implementation details\n\n';
    markdown += '*Use these links to enhance context when working with AI assistants or when you need additional clarification on implementation details.*\n\n';

    return markdown;
  }

  /**
   * Execute comprehensive research for project context using MCP tools
   */
  async executeResearch(projectContext) {
    try {
      console.log('🔍 Initiating comprehensive MCP research for best practices...');
      
      // Generate research queries
      const queries = this.generateResearchQueries(projectContext);
      console.log(`📋 Generated ${queries.length} research queries`);

      // Execute MCP research for each query in parallel
      const allMCPResults = [];
      console.log(`🔎 Executing ${queries.length} MCP research queries...`);
      
      const mcpPromises = queries.map(async (query) => {
        try {
          console.log(`🔍 Starting MCP research: ${query}`);
          const mcpResult = await this.mcpIntegration.executeComprehensiveResearch(query, projectContext);
          console.log(`✅ Completed MCP research: ${query} (${mcpResult.combinedSources?.length || 0} sources)`);
          return mcpResult;
        } catch (error) {
          console.warn(`❌ MCP research failed for query: ${query}`, error.message);
          // Return null if MCP fails - no fallback to WebSearch
          return null;
        }
      });
      
      // Wait for all MCP research to complete
      const mcpResults = await Promise.allSettled(mcpPromises);
      
      // Process MCP results
      for (let i = 0; i < mcpResults.length; i++) {
        const result = mcpResults[i];
        const query = queries[i];
        
        if (result.status === 'fulfilled' && result.value) {
          allMCPResults.push(result.value);
        } else {
          console.warn(`❌ Complete research failed for query: ${query}`);
        }
      }

      // Combine all sources from MCP research
      const allSources = [];
      allMCPResults.forEach(mcpResult => {
        if (mcpResult.combinedSources) {
          allSources.push(...mcpResult.combinedSources.map(source => ({
            ...source,
            query: mcpResult.query,
            mcpTools: source.mcpTool ? [source.mcpTool] : source.mcpTools || [],
            researchMethod: mcpResult.fallbackUsed || 'mcp'
          })));
        }
      });

      console.log(`📊 Found ${allSources.length} relevant sources from MCP research`);

      // Organize results using existing method but with MCP-enhanced data
      const researchSections = this.generateResearchSections(allSources);
      
      // Generate MCP-enhanced formatted output
      const formattedLinks = this.formatMCPResearchLinks(researchSections, allMCPResults);

      console.log('✅ MCP research compilation complete');

      return {
        sections: researchSections,
        formattedLinks: formattedLinks,
        totalResults: allSources.length,
        queries: queries,
        mcpResults: allMCPResults,
        researchMethod: 'mcp-enhanced',
        confidence: this.calculateAverageConfidence(allMCPResults)
      };

    } catch (error) {
      console.error('❌ MCP research engine error:', error.message);
      
      // Fallback to standard research if MCP completely fails
      console.log('🔄 Falling back to standard research methods...');
      try {
        return await this.executeStandardResearch(projectContext);
      } catch (fallbackError) {
        console.error('❌ All research methods failed:', fallbackError.message);
        return {
          sections: {},
          formattedLinks: '\n## 📚 Research & Best Practices References\n\n*Research data unavailable. MCP tools and fallback methods failed. Please manually research best practices for your technology stack.*\n\n',
          totalResults: 0,
          queries: [],
          researchMethod: 'failed'
        };
      }
    }
  }

  /**
   * Execute standard research as fallback when MCP fails
   */
  async executeStandardResearch(projectContext) {
    console.log('🔍 Executing standard research fallback...');
    
    const queries = this.generateResearchQueries(projectContext);
    const allResults = [];
    
    const searchPromises = queries.map(async (query) => {
      try {
        const results = await this.executeWebSearch(query);
        return this.processResearchResults(results);
      } catch (error) {
        console.warn(`Standard search failed for: ${query}`);
        return [];
      }
    });
    
    const searchResults = await Promise.allSettled(searchPromises);
    
    searchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });
    
    const researchSections = this.generateResearchSections(allResults);
    const formattedLinks = this.formatResearchLinks(researchSections);
    
    return {
      sections: researchSections,
      formattedLinks: formattedLinks,
      totalResults: allResults.length,
      queries: queries,
      researchMethod: 'standard-fallback'
    };
  }

  /**
   * Get cached research if available
   */
  getCachedResearch(projectType, techStack) {
    const cacheKey = `${projectType}_${JSON.stringify(techStack)}`.replace(/[^a-zA-Z0-9_]/g, '_');
    const cacheFile = path.join(this.cacheDir, `research_${cacheKey}.json`);
    
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        // Use cache if less than 7 days old
        if (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return cached.research;
        }
      } catch (error) {
        // Invalid cache file, will regenerate
      }
    }
    
    return null;
  }

  /**
   * Cache research results
   */
  cacheResearch(projectType, techStack, research) {
    const cacheKey = `${projectType}_${JSON.stringify(techStack)}`.replace(/[^a-zA-Z0-9_]/g, '_');
    const cacheFile = path.join(this.cacheDir, `research_${cacheKey}.json`);
    
    const cacheData = {
      timestamp: Date.now(),
      projectType,
      techStack,
      research
    };
    
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.warn('Failed to cache research results:', error.message);
    }
  }

  /**
   * Execute targeted research for multi-agent tasks
   */
  async executeMultiAgentResearch(taskDescription, agentType = 'research') {
    try {
      console.log(`🔍 Starting ${agentType} agent research for: ${taskDescription}`);
      
      // Generate focused queries based on task and agent type
      const queries = this.generateMultiAgentQueries(taskDescription, agentType);
      console.log(`📋 Generated ${queries.length} specialized queries`);

      // Execute searches with agent-specific focus in parallel
      const allResults = [];
      console.log(`🔎 ${agentType} agent executing ${queries.length} searches in parallel...`);
      
      const searchPromises = queries.map(async (query) => {
        console.log(`🔍 ${agentType} starting: ${query}`);
        const results = await this.executeWebSearch(query);
        const validatedResults = this.processResearchResults(results);
        console.log(`✅ ${agentType} completed: ${query} (${validatedResults.length} results)`);
        return validatedResults;
      });
      
      // Wait for all searches to complete
      const searchResults = await Promise.allSettled(searchPromises);
      
      // Process results
      for (let i = 0; i < searchResults.length; i++) {
        const result = searchResults[i];
        const query = queries[i];
        
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        } else {
          console.warn(`❌ ${agentType} search failed for query: ${query}`, result.reason);
        }
      }

      console.log(`📊 Found ${allResults.length} relevant resources for ${agentType} agent`);

      // Generate agent-specific research report
      const researchReport = this.generateAgentResearchReport(allResults, taskDescription, agentType);
      
      return {
        agentType: agentType,
        taskDescription: taskDescription,
        totalResults: allResults.length,
        queries: queries,
        results: allResults,
        report: researchReport
      };

    } catch (error) {
      console.error(`❌ Multi-agent research failed for ${agentType}:`, error.message);
      return {
        agentType: agentType,
        taskDescription: taskDescription,
        totalResults: 0,
        queries: [],
        results: [],
        report: `# ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Research Results\n\n*Research data unavailable. Please manually research relevant information.*\n\n`
      };
    }
  }

  /**
   * Generate specialized queries for multi-agent tasks
   */
  generateMultiAgentQueries(taskDescription, agentType) {
    const queries = [];
    const taskLower = taskDescription.toLowerCase();

    // Base queries based on agent type
    switch (agentType) {
      case 'research':
        queries.push(`${taskDescription} best practices 2025`);
        queries.push(`${taskDescription} implementation guide`);
        queries.push(`${taskDescription} official documentation`);
        break;

      case 'analysis':
        queries.push(`${taskDescription} code review checklist`);
        queries.push(`${taskDescription} performance optimization`);
        queries.push(`${taskDescription} common issues problems`);
        break;

      case 'implementation':
        queries.push(`${taskDescription} code examples`);
        queries.push(`${taskDescription} tutorial step by step`);
        queries.push(`${taskDescription} boilerplate template`);
        break;

      case 'validation':
        queries.push(`${taskDescription} testing strategies`);
        queries.push(`${taskDescription} validation checklist`);
        queries.push(`${taskDescription} quality assurance`);
        break;

      case 'integration':
        queries.push(`${taskDescription} integration patterns`);
        queries.push(`${taskDescription} deployment guide`);
        queries.push(`${taskDescription} troubleshooting`);
        break;
    }

    // Add technology-specific queries
    const techKeywords = ['react', 'node', 'python', 'java', 'go', 'rust', 'javascript', 'typescript'];
    for (const tech of techKeywords) {
      if (taskLower.includes(tech)) {
        queries.push(`${tech} ${taskDescription}`);
        queries.push(`${tech} ${agentType} best practices`);
      }
    }

    // Add domain-specific queries
    if (taskLower.includes('api')) {
      queries.push('REST API design principles');
      queries.push('API security best practices');
    }
    if (taskLower.includes('database')) {
      queries.push('database design patterns');
      queries.push('database performance optimization');
    }
    if (taskLower.includes('frontend')) {
      queries.push('frontend architecture patterns');
      queries.push('UI/UX best practices');
    }

    return queries.slice(0, 10); // Limit to prevent overwhelming
  }

  /**
   * Generate agent-specific research report
   */
  generateAgentResearchReport(results, taskDescription, agentType) {
    let report = `# ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent Research Report\n\n`;
    report += `**Task**: ${taskDescription}\n`;
    report += `**Agent Type**: ${agentType}\n`;
    report += `**Research Date**: ${new Date().toISOString()}\n`;
    report += `**Total Resources**: ${results.length}\n\n`;

    if (results.length === 0) {
      report += '## No Research Results Found\n\n';
      report += 'Unable to find relevant research for this task. Consider:\n';
      report += '- Refining the task description\n';
      report += '- Checking for typos or unclear requirements\n';
      report += '- Manually searching for relevant information\n\n';
      return report;
    }

    // Group results by relevance score
    const highQuality = results.filter(r => r.score >= 15);
    const mediumQuality = results.filter(r => r.score >= 10 && r.score < 15);
    const standardQuality = results.filter(r => r.score < 10);

    if (highQuality.length > 0) {
      report += '## 🌟 High-Quality Resources\n\n';
      highQuality.forEach(result => {
        report += `- **[${result.title}](${result.url})**\n`;
        report += `  ${result.description}\n`;
        report += `  *Quality Score: ${result.score}/20*\n\n`;
      });
    }

    if (mediumQuality.length > 0) {
      report += '## 📚 Additional Resources\n\n';
      mediumQuality.forEach(result => {
        report += `- **[${result.title}](${result.url})**\n`;
        report += `  ${result.description}\n\n`;
      });
    }

    if (standardQuality.length > 0) {
      report += '## 📖 Related Information\n\n';
      standardQuality.forEach(result => {
        report += `- [${result.title}](${result.url})\n`;
      });
      report += '\n';
    }

    // Add agent-specific recommendations
    report += this.generateAgentRecommendations(agentType, results);

    report += '\n---\n';
    report += `*Research compiled by ${agentType} specialist agent*\n`;
    report += `*Generated: ${new Date().toISOString()}*\n`;

    return report;
  }

  /**
   * Generate agent-specific recommendations based on research
   */
  generateAgentRecommendations(agentType, results) {
    let recommendations = `## 🎯 ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Recommendations\n\n`;
    
    switch (agentType) {
      case 'research':
        recommendations += 'Based on the research findings:\n';
        recommendations += '- Focus on official documentation and authoritative sources\n';
        recommendations += '- Prioritize recent (2025) best practices and patterns\n';
        recommendations += '- Consider both theoretical foundations and practical implementation\n';
        recommendations += '- Validate findings against multiple sources\n\n';
        break;

      case 'analysis':
        recommendations += 'For effective analysis:\n';
        recommendations += '- Use the research to identify key performance metrics\n';
        recommendations += '- Focus on common pitfalls and optimization opportunities\n';
        recommendations += '- Consider security implications in your analysis\n';
        recommendations += '- Document findings with specific examples\n\n';
        break;

      case 'implementation':
        recommendations += 'Implementation guidance:\n';
        recommendations += '- Start with proven patterns and examples from research\n';
        recommendations += '- Follow established coding standards and conventions\n';
        recommendations += '- Include proper error handling and validation\n';
        recommendations += '- Document your implementation decisions\n\n';
        break;

      case 'validation':
        recommendations += 'Validation approach:\n';
        recommendations += '- Use research to establish quality benchmarks\n';
        recommendations += '- Implement comprehensive testing strategies\n';
        recommendations += '- Validate against industry standards\n';
        recommendations += '- Document validation results and recommendations\n\n';
        break;

      case 'integration':
        recommendations += 'Integration considerations:\n';
        recommendations += '- Ensure compatibility with existing systems\n';
        recommendations += '- Follow deployment best practices from research\n';
        recommendations += '- Plan for monitoring and maintenance\n';
        recommendations += '- Document integration procedures\n\n';
        break;
    }

    return recommendations;
  }

  /**
   * Format MCP research links with enhanced attribution
   */
  formatMCPResearchLinks(researchSections, allMCPResults) {
    let markdown = '\n## 🔬 Comprehensive Research Results (MCP-Enhanced)\n\n';
    markdown += '*Research conducted using advanced MCP (Model Context Protocol) tools for enhanced accuracy and depth.*\n\n';

    // Add overall research summary if available
    const overallConfidence = this.calculateAverageConfidence(allMCPResults);
    if (overallConfidence > 0) {
      markdown += `### Research Quality Indicators\n\n`;
      markdown += `**Overall Confidence**: ${Math.round(overallConfidence * 100)}% *(based on cross-validated MCP research)*\n`;
      markdown += `**Research Tools**: ${this.getUsedMCPTools(allMCPResults).join(', ')} MCP\n`;
      markdown += `**Total Sources**: ${this.getTotalSources(allMCPResults)} cross-referenced sources\n\n`;
    }

    // Add research sections with MCP attribution
    for (const [category, results] of Object.entries(researchSections)) {
      if (results.length === 0) continue;

      markdown += `### ${category}\n\n`;
      
      for (const result of results) {
        markdown += `- **[${result.title}](${result.url})**`;
        
        // Add MCP tool attribution
        if (result.mcpTools && result.mcpTools.length > 0) {
          markdown += ` *(${result.mcpTools.join(', ')} MCP)*`;
        } else if (result.researchMethod === 'websearch') {
          markdown += ' *(WebSearch fallback)*';
        }
        
        markdown += `\n  ${result.description}`;
        
        // Add confidence indicator for MCP results
        if (result.confidence && result.confidence > 0) {
          markdown += `\n  *Confidence: ${Math.round(result.confidence * 100)}%*`;
        }
        
        markdown += '\n\n';
      }
    }

    // Add methodology section
    markdown += '### 🛠️ Research Methodology\n\n';
    markdown += 'This research leverages multiple MCP (Model Context Protocol) tools:\n\n';
    
    const usedTools = this.getUsedMCPTools(allMCPResults);
    if (usedTools.includes('context7')) {
      markdown += '- **Context7 MCP**: Comprehensive codebase analysis and documentation research\n';
    }
    if (usedTools.includes('perplexity')) {
      markdown += '- **Perplexity MCP**: Current industry best practices and expert insights\n';
    }
    if (usedTools.includes('tavily')) {
      markdown += '- **Tavily MCP**: Supplementary research and validation\n';
    }

    markdown += '\n**Quality Assurance Features**:\n';
    markdown += '- **Cross-validation**: Results compared across multiple MCP tools\n';
    markdown += '- **Source ranking**: Prioritized by authority, relevance, and tool consensus\n';
    markdown += '- **Confidence scoring**: Each source rated for reliability\n';
    markdown += '- **Duplicate removal**: Consolidated sources from multiple tools\n\n';

    markdown += `*Research completed: ${new Date().toISOString()}*\n\n`;

    return markdown;
  }

  /**
   * Calculate average confidence from MCP results
   */
  calculateAverageConfidence(allMCPResults) {
    if (!allMCPResults || allMCPResults.length === 0) return 0;
    
    const confidenceValues = allMCPResults
      .filter(result => result.confidence && result.confidence > 0)
      .map(result => result.confidence);
    
    if (confidenceValues.length === 0) return 0;
    
    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }

  /**
   * Get list of MCP tools used in research
   */
  getUsedMCPTools(allMCPResults) {
    const toolsSet = new Set();
    
    allMCPResults.forEach(result => {
      if (result.mcpResults) {
        Object.keys(result.mcpResults).forEach(tool => toolsSet.add(tool));
      }
    });
    
    return Array.from(toolsSet);
  }

  /**
   * Get total number of sources from all MCP results
   */
  getTotalSources(allMCPResults) {
    return allMCPResults.reduce((total, result) => {
      return total + (result.combinedSources ? result.combinedSources.length : 0);
    }, 0);
  }
}

module.exports = { ResearchEngine };