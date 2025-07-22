#!/usr/bin/env node

/**
 * MCP Integration Module for EchoContext Factory
 * Provides centralized MCP tool calling functionality with Context7 and Perplexity MCP
 */

const fs = require('fs');
const path = require('path');

class MCPIntegration {
  constructor() {
    this.mcpTools = {
      tavily: { available: false, priority: 1 }, // Prioritize for source links
      context7: { available: false, priority: 2 },
      perplexity: { available: false, priority: 3 }
    };
    
    this.resultCache = new Map();
    this.cacheDir = path.join(process.env.HOME, '.claude', 'data', 'cache', 'mcp');
    this.ensureCacheDir();
    this.checkMCPAvailability();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Check which MCP tools are available in the current environment
   */
  async checkMCPAvailability() {
    try {
      // Check factory configuration for MCP settings
      const configPath = path.join(process.env.HOME, '.claude', 'config', 'factory.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const mcpConfig = config.multiAgent?.researchCapabilities?.mcpTools || {};
        
        this.mcpTools.context7.available = mcpConfig.context7 || false;
        this.mcpTools.perplexity.available = mcpConfig.perplexity || false;
        this.mcpTools.tavily.available = mcpConfig.tavily || false;
      }
    } catch (error) {
      console.warn('Failed to load MCP configuration, using defaults');
    }
  }

  /**
   * Get available MCP tools sorted by priority
   */
  getAvailableMCPTools() {
    return Object.entries(this.mcpTools)
      .filter(([_, config]) => config.available)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name, _]) => name);
  }

  /**
   * Use Context7 MCP for comprehensive research and documentation
   */
  async useContext7MCP(query, options = {}) {
    if (!this.mcpTools.context7.available) {
      throw new Error('Context7 MCP not available');
    }

    try {
      console.log(`🔍 Context7 MCP research: ${query}`);
      
      // Check cache first
      const cacheKey = `context7_${query.toLowerCase().replace(/\s+/g, '_')}`;
      const cachedResult = this.getCachedResult(cacheKey, 24); // 24 hour cache
      if (cachedResult) {
        console.log(`📋 Using cached Context7 results for: ${query}`);
        return cachedResult;
      }

      // Execute Context7 MCP tool
      const result = await this.executeContext7MCP(query, options);
      
      // Cache results
      this.cacheResult(cacheKey, result);
      
      console.log(`✅ Context7 MCP completed: ${query} (${result.sources?.length || 0} sources)`);
      return result;
      
    } catch (error) {
      console.error(`❌ Context7 MCP failed for query: ${query}`, error.message);
      throw error;
    }
  }

  /**
   * Execute Context7 MCP tool - integrates with Claude Code's MCP system
   */
  async executeContext7MCP(query, options = {}) {
    try {
      // Context7 MCP provides comprehensive research with source attribution
      // When executed within Claude Code context with MCP, this will call actual Context7 MCP
      
      const context7Options = {
        query: query,
        maxResults: options.maxResults || 10,
        includeSnippets: true,
        includeSources: true,
        researchDepth: options.depth || 'standard',
        ...options
      };

      // This will be replaced with actual Context7 MCP call when executed by Claude Code with MCP
      const mcpResult = await this.callMCPTool('context7', context7Options);
      
      return this.formatContext7Results(mcpResult);
      
    } catch (error) {
      console.error('Context7 MCP execution failed:', error.message);
      throw new Error('Context7 MCP not available - requires Claude Code with Context7 MCP integration');
    }
  }

  /**
   * Use Perplexity MCP for current best practices and expert insights
   */
  async usePerplexityMCP(query, options = {}) {
    if (!this.mcpTools.perplexity.available) {
      throw new Error('Perplexity MCP not available');
    }

    try {
      console.log(`🔍 Perplexity MCP research: ${query}`);
      
      // Check cache first
      const cacheKey = `perplexity_${query.toLowerCase().replace(/\s+/g, '_')}`;
      const cachedResult = this.getCachedResult(cacheKey, 12); // 12 hour cache for current info
      if (cachedResult) {
        console.log(`📋 Using cached Perplexity results for: ${query}`);
        return cachedResult;
      }

      // Execute Perplexity MCP tool
      const result = await this.executePerplexityMCP(query, options);
      
      // Cache results
      this.cacheResult(cacheKey, result);
      
      console.log(`✅ Perplexity MCP completed: ${query} (${result.sources?.length || 0} sources)`);
      return result;
      
    } catch (error) {
      console.error(`❌ Perplexity MCP failed for query: ${query}`, error.message);
      throw error;
    }
  }

  /**
   * Execute Perplexity MCP tool - integrates with Claude Code's MCP system
   */
  async executePerplexityMCP(query, options = {}) {
    try {
      // Perplexity MCP provides current best practices and expert analysis
      // When executed within Claude Code context with MCP, this will call actual Perplexity MCP
      
      const perplexityOptions = {
        query: query,
        maxResults: options.maxResults || 8,
        includeSources: true,
        expertLevel: options.expertLevel || 'professional',
        currentYear: 2025,
        ...options
      };

      // This will be replaced with actual Perplexity MCP call when executed by Claude Code with MCP
      const mcpResult = await this.callMCPTool('perplexity', perplexityOptions);
      
      return this.formatPerplexityResults(mcpResult);
      
    } catch (error) {
      console.error('Perplexity MCP execution failed:', error.message);
      throw new Error('Perplexity MCP not available - requires Claude Code with Perplexity MCP integration');
    }
  }

  /**
   * Execute comprehensive research using both Context7 and Perplexity MCP
   */
  async executeComprehensiveResearch(query, projectContext = {}) {
    console.log(`🔍 Starting comprehensive MCP research for: ${query}`);
    
    const availableTools = this.getAvailableMCPTools();
    if (availableTools.length === 0) {
      throw new Error('No MCP tools available for research');
    }

    const results = {
      query: query,
      projectContext: projectContext,
      mcpResults: {},
      combinedSources: [],
      researchSummary: '',
      confidence: 0,
      timestamp: new Date().toISOString()
    };

    // Execute research with available MCP tools in parallel
    // Prioritize Tavily for source links, then Context7, then Perplexity
    const researchPromises = [];

    if (availableTools.includes('tavily')) {
      researchPromises.push(
        this.useTavilyMCP(query, { 
          maxResults: 8,
          includeRawContent: false,
          includeAnswer: true
        }).then(result => ({ tool: 'tavily', result }))
      );
    }

    if (availableTools.includes('context7')) {
      researchPromises.push(
        this.useContext7MCP(query, { 
          depth: 'comprehensive',
          maxResults: 10,
          projectType: projectContext.projectType
        }).then(result => ({ tool: 'context7', result }))
      );
    }

    if (availableTools.includes('perplexity')) {
      researchPromises.push(
        this.usePerplexityMCP(query, { 
          expertLevel: 'professional',
          maxResults: 8,
          techStack: projectContext.techStack
        }).then(result => ({ tool: 'perplexity', result }))
      );
    }

    // Wait for all MCP tools to complete
    try {
      const researchResults = await Promise.allSettled(researchPromises);
      
      // Process results from each MCP tool
      for (const promiseResult of researchResults) {
        if (promiseResult.status === 'fulfilled') {
          const { tool, result } = promiseResult.value;
          results.mcpResults[tool] = result;
          
          if (result.sources && Array.isArray(result.sources)) {
            results.combinedSources.push(...result.sources.map(source => ({
              ...source,
              mcpTool: tool,
              confidence: this.calculateSourceConfidence(source, tool)
            })));
          }
        } else {
          console.warn(`MCP tool failed: ${promiseResult.reason}`);
        }
      }

      // Cross-reference and validate results
      results.combinedSources = this.crossReferenceResults(results.combinedSources);
      results.researchSummary = this.generateResearchSummary(results);
      results.confidence = this.calculateOverallConfidence(results);

      console.log(`✅ Comprehensive research completed: ${results.combinedSources.length} sources from ${Object.keys(results.mcpResults).length} MCP tools`);
      
      return results;
      
    } catch (error) {
      console.error('Comprehensive research failed:', error.message);
      throw error;
    }
  }

  /**
   * Use Tavily MCP as fallback research tool
   */
  async useTavilyMCP(query, options = {}) {
    if (!this.mcpTools.tavily.available) {
      throw new Error('Tavily MCP not available');
    }

    try {
      console.log(`🔍 Tavily MCP research: ${query}`);
      
      const tavilyOptions = {
        query: query,
        maxResults: options.maxResults || 6,
        includeAnswer: true,
        includeRawContent: options.includeRawContent || false,
        ...options
      };

      const mcpResult = await this.callMCPTool('tavily', tavilyOptions);
      return this.formatTavilyResults(mcpResult);
      
    } catch (error) {
      console.error('Tavily MCP execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Generic MCP tool caller - to be replaced with actual MCP integration
   */
  async callMCPTool(toolName, options) {
    // This method will be replaced with actual MCP tool calls when executed by Claude Code
    // For now, it throws an error to indicate MCP tools are required
    
    console.log(`📡 Calling ${toolName} MCP with options:`, JSON.stringify(options, null, 2));
    
    // In actual Claude Code context with MCP integration, this would make real MCP calls
    throw new Error(`${toolName} MCP tool not available - this code must be executed within Claude Code context with ${toolName} MCP integration`);
  }

  /**
   * Format Context7 MCP results to standard format
   */
  formatContext7Results(mcpResult) {
    return {
      tool: 'context7',
      query: mcpResult.query,
      sources: mcpResult.results?.map(result => ({
        title: result.title || 'Untitled',
        url: result.url || '#',
        description: result.description || result.content || 'No description available',
        content: result.content || '',
        relevance: result.relevance || 'medium',
        authority: result.authority || 'standard',
        lastUpdated: result.lastUpdated || null
      })) || [],
      summary: mcpResult.summary || '',
      confidence: mcpResult.confidence || 0.7,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format Perplexity MCP results to standard format
   */
  formatPerplexityResults(mcpResult) {
    return {
      tool: 'perplexity',
      query: mcpResult.query,
      sources: mcpResult.citations?.map(citation => ({
        title: citation.title || 'Expert Analysis',
        url: citation.url || '#',
        description: citation.text || citation.content || 'Expert insight',
        content: citation.content || citation.text || '',
        relevance: 'high',
        authority: 'expert',
        lastUpdated: new Date().toISOString()
      })) || [],
      summary: mcpResult.answer || mcpResult.summary || '',
      confidence: mcpResult.confidence || 0.8,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format Tavily MCP results to standard format
   */
  formatTavilyResults(mcpResult) {
    return {
      tool: 'tavily',
      query: mcpResult.query,
      sources: mcpResult.results?.map(result => ({
        title: result.title || 'Research Result',
        url: result.url || '#',
        description: result.content || result.snippet || 'Research finding',
        content: result.content || '',
        relevance: 'medium',
        authority: 'standard',
        score: result.score || 0.5
      })) || [],
      summary: mcpResult.answer || '',
      confidence: mcpResult.confidence || 0.6,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cross-reference results from multiple MCP tools
   */
  crossReferenceResults(combinedSources) {
    // Remove duplicates based on URL similarity
    const uniqueSources = [];
    const seenUrls = new Set();
    
    for (const source of combinedSources) {
      const urlKey = this.normalizeUrl(source.url);
      if (!seenUrls.has(urlKey)) {
        seenUrls.add(urlKey);
        uniqueSources.push(source);
      } else {
        // If we've seen this URL, boost the confidence of the existing source
        const existingSource = uniqueSources.find(s => this.normalizeUrl(s.url) === urlKey);
        if (existingSource) {
          existingSource.confidence = Math.min(1.0, existingSource.confidence + 0.1);
          existingSource.mcpTools = existingSource.mcpTools || [];
          existingSource.mcpTools.push(source.mcpTool);
        }
      }
    }
    
    // Sort by confidence and relevance
    return uniqueSources.sort((a, b) => {
      const aScore = a.confidence + (a.authority === 'expert' ? 0.2 : 0) + (a.relevance === 'high' ? 0.1 : 0);
      const bScore = b.confidence + (b.authority === 'expert' ? 0.2 : 0) + (b.relevance === 'high' ? 0.1 : 0);
      return bScore - aScore;
    });
  }

  /**
   * Calculate source confidence based on MCP tool and source characteristics
   */
  calculateSourceConfidence(source, mcpTool) {
    let confidence = 0.5; // Base confidence
    
    // MCP tool-specific adjustments
    switch (mcpTool) {
      case 'context7':
        confidence += 0.2; // High confidence for comprehensive analysis
        break;
      case 'perplexity':
        confidence += 0.3; // Highest confidence for expert insights
        break;
      case 'tavily':
        confidence += 0.1; // Standard confidence
        break;
    }
    
    // Source quality indicators
    if (source.authority === 'expert') confidence += 0.1;
    if (source.relevance === 'high') confidence += 0.1;
    if (source.url && (source.url.includes('github.com') || source.url.includes('docs.'))) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Calculate overall research confidence
   */
  calculateOverallConfidence(results) {
    const toolCount = Object.keys(results.mcpResults).length;
    const sourceCount = results.combinedSources.length;
    const avgConfidence = results.combinedSources.reduce((sum, s) => sum + s.confidence, 0) / sourceCount || 0;
    
    // Base confidence from tool diversity and source quality
    let confidence = avgConfidence * 0.7;
    
    // Boost for multiple MCP tools
    if (toolCount >= 2) confidence += 0.1;
    if (toolCount >= 3) confidence += 0.1;
    
    // Boost for sufficient sources
    if (sourceCount >= 5) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Generate research summary from MCP results
   */
  generateResearchSummary(results) {
    const summaries = Object.values(results.mcpResults)
      .map(result => result.summary)
      .filter(summary => summary && summary.length > 0);
    
    if (summaries.length === 0) {
      return `Research completed using ${Object.keys(results.mcpResults).join(', ')} MCP tools. Found ${results.combinedSources.length} relevant sources.`;
    }
    
    return summaries.join(' ');
  }

  /**
   * Normalize URL for comparison
   */
  normalizeUrl(url) {
    if (!url || url === '#') return url;
    return url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .replace(/www\./, '');
  }

  /**
   * Cache MCP results
   */
  cacheResult(cacheKey, result) {
    try {
      const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
      const cacheData = {
        timestamp: Date.now(),
        result: result
      };
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.warn('Failed to cache MCP result:', error.message);
    }
  }

  /**
   * Get cached MCP results
   */
  getCachedResult(cacheKey, maxAgeHours = 24) {
    try {
      const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
      if (!fs.existsSync(cacheFile)) return null;
      
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const ageHours = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
      
      if (ageHours <= maxAgeHours) {
        return cached.result;
      }
    } catch (error) {
      console.warn('Failed to read cached MCP result:', error.message);
    }
    
    return null;
  }

  /**
   * Generate formatted research output for documentation
   */
  formatMCPResearchForDocumentation(comprehensiveResults) {
    let markdown = '\n## 🔬 Comprehensive Research Results\n\n';
    markdown += `*Research conducted using ${Object.keys(comprehensiveResults.mcpResults).join(', ')} MCP tools*\n\n`;
    
    // Add research summary
    if (comprehensiveResults.researchSummary) {
      markdown += '### Research Summary\n\n';
      markdown += `${comprehensiveResults.researchSummary}\n\n`;
    }
    
    // Add confidence indicator
    markdown += '### Research Confidence\n\n';
    const confidencePercent = Math.round(comprehensiveResults.confidence * 100);
    markdown += `**Overall Confidence**: ${confidencePercent}% (based on ${comprehensiveResults.combinedSources.length} sources from ${Object.keys(comprehensiveResults.mcpResults).length} research tools)\n\n`;
    
    // Group sources by authority level
    const expertSources = comprehensiveResults.combinedSources.filter(s => s.authority === 'expert');
    const standardSources = comprehensiveResults.combinedSources.filter(s => s.authority === 'standard');
    
    if (expertSources.length > 0) {
      markdown += '### 🌟 Expert Sources\n\n';
      expertSources.slice(0, 5).forEach(source => {
        markdown += `- **[${source.title}](${source.url})** *(${source.mcpTool} MCP)*\n`;
        markdown += `  ${source.description}\n`;
        markdown += `  *Confidence: ${Math.round(source.confidence * 100)}%*\n\n`;
      });
    }
    
    if (standardSources.length > 0) {
      markdown += '### 📚 Additional Research Sources\n\n';
      standardSources.slice(0, 8).forEach(source => {
        markdown += `- **[${source.title}](${source.url})** *(${source.mcpTool} MCP)*\n`;
        markdown += `  ${source.description}\n\n`;
      });
    }
    
    // Add MCP tool details
    markdown += '### 🛠️ Research Tools Used\n\n';
    Object.entries(comprehensiveResults.mcpResults).forEach(([toolName, result]) => {
      markdown += `- **${toolName.toUpperCase()} MCP**: ${result.sources?.length || 0} sources, confidence ${Math.round(result.confidence * 100)}%\n`;
    });
    
    markdown += '\n### 🔍 Research Methodology\n\n';
    markdown += 'This research was conducted using multiple MCP (Model Context Protocol) tools:\n';
    markdown += '- **Context7 MCP**: Comprehensive analysis and documentation research\n';
    markdown += '- **Perplexity MCP**: Current best practices and expert insights\n';
    markdown += '- **Cross-validation**: Results compared across multiple tools for accuracy\n';
    markdown += '- **Source ranking**: Prioritized by authority, relevance, and cross-tool validation\n\n';
    
    markdown += `*Research completed: ${comprehensiveResults.timestamp}*\n\n`;
    
    return markdown;
  }
}

module.exports = { MCPIntegration };