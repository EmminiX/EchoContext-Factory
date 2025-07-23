#!/usr/bin/env node

/**
 * Template Processor for EchoContext Factory
 * Handles template loading, variable substitution, and dynamic content generation
 */

const fs = require('fs');
const path = require('path');

class TemplateProcessor {
  constructor(templatesPath = null) {
    // Use project-relative templates path if not specified
    if (!templatesPath) {
      const projectRoot = path.resolve(__dirname, '..');
      this.templatesPath = path.join(projectRoot, 'templates');
    } else {
      this.templatesPath = templatesPath.replace(/^~/, process.env.HOME);
    }
    this.templates = {};
    this.loadTemplates();
  }

  /**
   * Loads all templates from the templates directory
   */
  loadTemplates() {
    try {
      this.loadTemplatesRecursive(this.templatesPath);
    } catch (error) {
      console.warn('Could not load templates:', error.message);
    }
  }

  /**
   * Recursively loads templates from directory structure
   */
  loadTemplatesRecursive(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively load from subdirectories
        this.loadTemplatesRecursive(fullPath);
      } else if (item.endsWith('.template')) {
        // Load template file
        const templateName = item.replace('.template', '');
        const templateContent = fs.readFileSync(fullPath, 'utf8');
        this.templates[templateName] = templateContent;
        
        // Also create alias without .md extension for backward compatibility
        if (templateName.endsWith('.md')) {
          const aliasName = templateName.replace('.md', '');
          this.templates[aliasName] = templateContent;
        }
      }
    }
  }

  /**
   * Processes a template with given context
   */
  processTemplate(templateName, context) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    let result = template;

    // Process variable substitutions
    result = this.substituteVariables(result, context);
    
    // Process conditional sections
    result = this.processConditionals(result, context);
    
    // Process loops
    result = this.processLoops(result, context);
    
    // Process includes
    result = this.processIncludes(result, context);
    
    // Process research integration
    result = this.processResearchIntegration(result, context);
    
    // Clean up extra whitespace
    result = this.cleanupWhitespace(result);

    return result;
  }

  /**
   * Substitutes variables in template {{variable}}
   */
  substituteVariables(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const value = this.getNestedValue(context, variable.trim());
      return value !== undefined ? value : match;
    });
  }

  /**
   * Processes conditional sections {{#if condition}}...{{/if}}
   */
  processConditionals(template, context) {
    // Handle if conditions
    template = template.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const value = this.getNestedValue(context, condition.trim());
      return this.isTruthy(value) ? content : '';
    });

    // Handle unless conditions
    template = template.replace(/\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (match, condition, content) => {
      const value = this.getNestedValue(context, condition.trim());
      return this.isTruthy(value) ? '' : content;
    });

    // Handle if-else conditions
    template = template.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, ifContent, elseContent) => {
      const value = this.getNestedValue(context, condition.trim());
      return this.isTruthy(value) ? ifContent : elseContent;
    });

    return template;
  }

  /**
   * Processes loops {{#each array}}...{{/each}}
   */
  processLoops(template, context) {
    return template.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, content) => {
      const array = this.getNestedValue(context, arrayPath.trim());
      
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, index) => {
        let processedContent = content;
        
        // Replace {{.}} with current item
        processedContent = processedContent.replace(/\{\{\.\}\}/g, item);
        
        // Replace {{@index}} with current index
        processedContent = processedContent.replace(/\{\{@index\}\}/g, index);
        
        // Replace {{@first}} and {{@last}}
        processedContent = processedContent.replace(/\{\{@first\}\}/g, index === 0);
        processedContent = processedContent.replace(/\{\{@last\}\}/g, index === array.length - 1);
        
        // Process nested object properties
        if (typeof item === 'object' && item !== null) {
          processedContent = this.substituteVariables(processedContent, item);
        }
        
        return processedContent;
      }).join('');
    });
  }

  /**
   * Processes template includes {{> templateName}}
   */
  processIncludes(template, context) {
    return template.replace(/\{\{>\s*([^}]+)\}\}/g, (match, templateName) => {
      const includedTemplate = this.templates[templateName.trim()];
      if (!includedTemplate) {
        console.warn(`Included template not found: ${templateName}`);
        return match;
      }
      
      return this.processTemplate(templateName.trim(), context);
    });
  }

  /**
   * Processes research integration placeholders {{#research}} and {{#mcp-sources}}
   */
  processResearchIntegration(template, context) {
    // Process automatic research insertion {{#research}}
    template = template.replace(/\{\{#research\}\}/g, (match) => {
      if (context.research && context.research.formattedLinks) {
        return context.research.formattedLinks;
      } else if (context.researchResults && context.researchResults.formattedLinks) {
        return context.researchResults.formattedLinks;
      }
      return '';
    });

    // Process MCP research results {{#mcp-research}}
    template = template.replace(/\{\{#mcp-research\}\}/g, (match) => {
      if (context.research && context.research.mcpResults) {
        return this.formatMCPResearchSection(context.research);
      } else if (context.researchResults && context.researchResults.mcpResults) {
        return this.formatMCPResearchSection(context.researchResults);
      }
      return '';
    });

    // Process research sources list {{#research-sources}}
    template = template.replace(/\{\{#research-sources\}\}/g, (match) => {
      return this.formatResearchSourcesList(context);
    });

    // Process research confidence {{#research-confidence}}
    template = template.replace(/\{\{#research-confidence\}\}/g, (match) => {
      return this.formatResearchConfidence(context);
    });

    // Process research methodology {{#research-methodology}}
    template = template.replace(/\{\{#research-methodology\}\}/g, (match) => {
      return this.formatResearchMethodology(context);
    });

    return template;
  }

  /**
   * Gets nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Checks if value is truthy for conditionals
   */
  isTruthy(value) {
    if (value === undefined || value === null || value === false) {
      return false;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Cleans up extra whitespace from processed template
   */
  cleanupWhitespace(template) {
    return template
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove multiple blank lines
      .replace(/^\s*\n/gm, '\n') // Remove leading whitespace from empty lines
      .trim();
  }

  /**
   * Registers a new template
   */
  registerTemplate(name, content) {
    this.templates[name] = content;
  }

  /**
   * Saves a template to file
   */
  saveTemplate(name, content) {
    const templatePath = path.join(this.templatesPath, `${name}.template`);
    fs.writeFileSync(templatePath, content, 'utf8');
    this.templates[name] = content;
  }

  /**
   * Lists available templates
   */
  listTemplates() {
    return Object.keys(this.templates);
  }

  /**
   * Validates template syntax
   */
  validateTemplate(template) {
    const errors = [];
    
    // Check for unmatched braces
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unmatched template braces');
    }

    // Check for unmatched conditionals
    const ifCount = (template.match(/\{\{#if/g) || []).length;
    const endIfCount = (template.match(/\{\{\/if\}\}/g) || []).length;
    
    if (ifCount !== endIfCount) {
      errors.push('Unmatched if/endif statements');
    }

    // Check for unmatched loops
    const eachCount = (template.match(/\{\{#each/g) || []).length;
    const endEachCount = (template.match(/\{\{\/each\}\}/g) || []).length;
    
    if (eachCount !== endEachCount) {
      errors.push('Unmatched each/endeach statements');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Processes a template string directly (without loading from file)
   */
  processTemplateString(templateString, context) {
    let result = templateString;

    result = this.substituteVariables(result, context);
    result = this.processConditionals(result, context);
    result = this.processLoops(result, context);
    result = this.processIncludes(result, context);
    result = this.cleanupWhitespace(result);

    return result;
  }

  /**
   * Generates a template from a pattern
   */
  generateFromPattern(patternName, context) {
    const patterns = {
      'project-overview': this.generateProjectOverview,
      'technical-requirements': this.generateTechnicalRequirements,
      'security-context': this.generateSecurityContext,
      'file-structure': this.generateFileStructure
    };

    const generator = patterns[patternName];
    if (!generator) {
      throw new Error(`Pattern not found: ${patternName}`);
    }

    return generator.call(this, context);
  }

  /**
   * Generates project overview template
   */
  generateProjectOverview(context) {
    return `# {{projectName}}

## Project Overview

**Description:** {{projectDescription}}
**Type:** {{projectType}}
**Tech Stack:** {{techStack.frontend}}{{#if techStack.backend}} + {{techStack.backend}}{{/if}}{{#if techStack.database}} + {{techStack.database}}{{/if}}

### Key Features
{{#each features}}
- {{.}}
{{/each}}

### Security Requirements
- Security Level: {{security.level}}
- Authentication: {{security.authentication}}
- Data Protection: {{security.dataProtection}}

### Generated: {{metadata.timestamp}}`;
  }

  /**
   * Generates technical requirements template
   */
  generateTechnicalRequirements(context) {
    return `## Technical Requirements

### Frontend
{{#if techStack.frontend}}
- Framework: {{techStack.frontend}}
- Language: {{techStack.language}}
- Styling: {{techStack.styling}}
{{/if}}

### Backend
{{#if techStack.backend}}
- Framework: {{techStack.backend}}
- Database: {{techStack.database}}
- Authentication: {{security.authentication}}
{{/if}}

### Development
- Package Manager: {{techStack.packageManager}}
- Testing: {{techStack.testing}}
- Build Tool: {{developmentContext.workflow.buildTool}}

### Dependencies
{{#each developmentContext.dependencies}}
- {{.}}
{{/each}}

### Dev Dependencies
{{#each developmentContext.devDependencies}}
- {{.}}
{{/each}}`;
  }

  /**
   * Generates security context template
   */
  generateSecurityContext(context) {
    return `## Security Context

### Security Level: {{securityContext.level}}

### Features
{{#each securityContext.features}}
- {{.}}
{{/each}}

### Recommendations
{{#each securityContext.recommendations}}
- **{{category}}**: {{message}} (Priority: {{priority}})
{{/each}}

### Best Practices
- Input validation on all user inputs
- Parameterized queries for database operations
- Security headers implementation
- Rate limiting on sensitive endpoints
- HTTPS enforcement in production
- Regular security audits and updates`;
  }

  /**
   * Generates file structure template
   */
  generateFileStructure(context) {
    let structure = `## Project Structure

\`\`\`
{{projectName}}/
{{#each projectStructure.directories}}
├── {{.}}/
{{/each}}
{{#each projectStructure.files}}
├── {{.}}
{{/each}}
\`\`\`

### Directory Purpose
{{#each projectStructure.directories}}
- **{{.}}/** - {{this.description}}
{{/each}}

### Key Files
{{#each projectStructure.files}}
- **{{.}}** - {{this.description}}
{{/each}}`;

    return structure;
  }

  /**
   * Formats MCP research section for templates
   */
  formatMCPResearchSection(researchData) {
    if (!researchData || !researchData.mcpResults) return '';
    
    let section = '\n## 🔬 MCP Research Integration\n\n';
    section += '*This documentation includes research conducted using advanced MCP (Model Context Protocol) tools for enhanced accuracy and current best practices.*\n\n';
    
    const mcpResults = researchData.mcpResults;
    const confidence = researchData.confidence || 0;
    
    if (confidence > 0) {
      section += `### Research Quality Metrics\n\n`;
      section += `- **Overall Confidence**: ${Math.round(confidence * 100)}%\n`;
      section += `- **Research Tools Used**: ${Object.keys(mcpResults).join(', ')} MCP\n`;
      section += `- **Total Research Queries**: ${researchData.queries?.length || 0}\n`;
      section += `- **Cross-Referenced Sources**: ${researchData.totalResults || 0}\n\n`;
    }
    
    return section;
  }

  /**
   * Formats research sources list
   */
  formatResearchSourcesList(context) {
    const sources = this.extractResearchSources(context);
    if (!sources || sources.length === 0) return '';
    
    let sourcesList = '### 📚 Research Sources\n\n';
    
    // Group by MCP tool
    const sourcesByTool = {};
    sources.forEach(source => {
      const tool = source.mcpTool || source.mcpTools?.[0] || 'standard';
      if (!sourcesByTool[tool]) sourcesByTool[tool] = [];
      sourcesByTool[tool].push(source);
    });
    
    Object.entries(sourcesByTool).forEach(([tool, toolSources]) => {
      if (tool !== 'standard') {
        sourcesList += `**${tool.toUpperCase()} MCP Sources:**\n\n`;
      }
      
      toolSources.slice(0, 5).forEach(source => {
        sourcesList += `- [${source.title || 'Research Source'}](${source.url || '#'})\n`;
        if (source.description) {
          sourcesList += `  ${source.description}\n`;
        }
        if (source.confidence) {
          sourcesList += `  *Confidence: ${Math.round(source.confidence * 100)}%*\n`;
        }
        sourcesList += '\n';
      });
    });
    
    return sourcesList + '\n';
  }

  /**
   * Formats research confidence indicator
   */
  formatResearchConfidence(context) {
    const confidence = this.extractResearchConfidence(context);
    if (!confidence || confidence === 0) return '';
    
    const percentage = Math.round(confidence * 100);
    let indicator = `### 🎯 Research Confidence: ${percentage}%\n\n`;
    
    if (percentage >= 80) {
      indicator += '**High Confidence** - Multiple authoritative sources with cross-validation\n\n';
    } else if (percentage >= 60) {
      indicator += '**Medium Confidence** - Good source quality with some cross-validation\n\n';
    } else {
      indicator += '**Lower Confidence** - Limited sources available, manual verification recommended\n\n';
    }
    
    return indicator;
  }

  /**
   * Formats research methodology section
   */
  formatResearchMethodology(context) {
    const researchMethod = context.research?.researchMethod || context.researchResults?.researchMethod;
    if (!researchMethod) return '';
    
    let methodology = '### 🔍 Research Methodology\n\n';
    
    switch (researchMethod) {
      case 'mcp-enhanced':
        methodology += 'This documentation was enhanced using MCP (Model Context Protocol) tools:\n\n';
        methodology += '- **Context7 MCP**: Comprehensive analysis and documentation research\n';
        methodology += '- **Perplexity MCP**: Current best practices and expert insights\n';
        methodology += '- **Cross-validation**: Results compared across multiple tools for accuracy\n';
        methodology += '- **Quality scoring**: Sources ranked by authority and relevance\n\n';
        break;
        
      case 'standard-fallback':
        methodology += 'Research conducted using standard web search with quality filtering:\n\n';
        methodology += '- **Source prioritization**: Official documentation and trusted community sources\n';
        methodology += '- **Recency filtering**: Focus on current practices and 2025 standards\n';
        methodology += '- **Quality validation**: Manual curation of relevant resources\n\n';
        break;
        
      default:
        methodology += 'Research methodology varies based on available tools and data sources.\n\n';
    }
    
    return methodology;
  }

  /**
   * Extracts research sources from context
   */
  extractResearchSources(context) {
    const sources = [];
    
    // Extract from research.sections
    if (context.research?.sections) {
      Object.values(context.research.sections).forEach(sectionSources => {
        sources.push(...sectionSources);
      });
    }
    
    // Extract from researchResults.sections
    if (context.researchResults?.sections) {
      Object.values(context.researchResults.sections).forEach(sectionSources => {
        sources.push(...sectionSources);
      });
    }
    
    // Extract from MCP results
    if (context.research?.mcpResults) {
      context.research.mcpResults.forEach(mcpResult => {
        if (mcpResult.combinedSources) {
          sources.push(...mcpResult.combinedSources);
        }
      });
    }
    
    return sources;
  }

  /**
   * Extracts research confidence from context
   */
  extractResearchConfidence(context) {
    return context.research?.confidence || 
           context.researchResults?.confidence || 
           0;
  }

  /**
   * Enhances context with research integration support
   */
  enhanceContextWithResearch(context, researchData) {
    if (!researchData) return context;
    
    const enhancedContext = { ...context };
    
    // Add research data to context
    if (researchData.formattedLinks) {
      enhancedContext.researchSources = researchData.formattedLinks;
    }
    
    // Add research metadata
    enhancedContext.researchMetadata = {
      hasResearch: true,
      researchMethod: researchData.researchMethod || 'standard',
      confidence: researchData.confidence || 0,
      totalSources: researchData.totalResults || 0,
      researchDate: new Date().toISOString()
    };
    
    // Add project vision if available
    if (context.answers?.project_vision_description) {
      enhancedContext.projectVision = context.answers.project_vision_description;
    }
    
    return enhancedContext;
  }
}

module.exports = { TemplateProcessor };