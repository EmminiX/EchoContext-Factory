#!/usr/bin/env node

/**
 * Template Processor for Context Engineering Factory
 * Handles template loading, variable substitution, and dynamic content generation
 */

const fs = require('fs');
const path = require('path');

class TemplateProcessor {
  constructor(templatesPath = '~/.claude/templates/') {
    this.templatesPath = templatesPath.replace(/^~/, process.env.HOME);
    this.templates = {};
    this.loadTemplates();
  }

  /**
   * Loads all templates from the templates directory
   */
  loadTemplates() {
    try {
      const templateFiles = fs.readdirSync(this.templatesPath);
      
      for (const file of templateFiles) {
        if (file.endsWith('.template')) {
          const templateName = file.replace('.template', '');
          const templatePath = path.join(this.templatesPath, file);
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          this.templates[templateName] = templateContent;
        }
      }
    } catch (error) {
      console.warn('Could not load templates:', error.message);
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
}

module.exports = { TemplateProcessor };