#!/usr/bin/env node

/**
 * Context Assembler for EchoContext Factory
 * Aggregates context from multiple sources and generates comprehensive project context
 */

const fs = require('fs');
const path = require('path');

class ContextAssembler {
  constructor(patternsPath = '~/.claude/data/patterns.json') {
    this.patternsPath = patternsPath.replace(/^~/, process.env.HOME);
    this.patterns = this.loadPatterns();
    this.context = {};
  }

  loadPatterns() {
    try {
      const patternsData = fs.readFileSync(this.patternsPath, 'utf8');
      return JSON.parse(patternsData);
    } catch (error) {
      console.error('Error loading patterns:', error.message);
      return { patterns: {}, common_combinations: {}, context_templates: {} };
    }
  }

  /**
   * Assembles comprehensive context from question engine results
   */
  assembleContext(questionResults) {
    const context = {
      ...questionResults,
      generated: {
        timestamp: new Date().toISOString(),
        version: '2.5.0'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '2.5.0',
        generator: 'EchoContext Factory',
        designer: 'Emmi C.',
        designerUrl: 'https://emmi.zone',
        attribution: 'Designed and engineered by Emmi C. (https://emmi.zone)'
      }
    };

    // Enhance with pattern matching
    context.patterns = this.matchPatterns(context);
    
    // Generate project structure
    context.projectStructure = this.generateProjectStructure(context);
    
    // Generate security context
    context.securityContext = this.generateSecurityContext(context);
    
    // Generate development context
    context.developmentContext = this.generateDevelopmentContext(context);
    
    // Generate deployment context
    context.deploymentContext = this.generateDeploymentContext(context);
    
    // Generate research metadata for templates
    context.researchMetadata = this.generateResearchMetadata(context);

    return context;
  }

  /**
   * Matches context against known patterns
   */
  matchPatterns(context) {
    const matches = [];
    
    // Check common combinations
    for (const [key, combination] of Object.entries(this.patterns.common_combinations || {})) {
      if (this.matchesCombination(context, combination)) {
        matches.push({
          type: 'combination',
          name: combination.name,
          description: combination.description,
          components: combination.components,
          confidence: this.calculateConfidence(context, combination)
        });
      }
    }

    // Check project structure patterns
    const projectStructure = this.findProjectStructurePattern(context);
    if (projectStructure) {
      matches.push({
        type: 'structure',
        name: projectStructure.name,
        description: projectStructure.description,
        pattern: projectStructure
      });
    }

    return matches;
  }

  /**
   * Checks if context matches a combination pattern
   */
  matchesCombination(context, combination) {
    const techStack = context.techStack || {};
    const answers = context.answers || {};
    const components = combination.components || [];
    
    let matches = 0;
    for (const component of components) {
      if (Object.values(techStack).includes(component) || 
          answers[component] === component) {
        matches++;
      }
    }
    
    return matches >= Math.floor(components.length * 0.6); // 60% match threshold
  }

  /**
   * Calculates confidence score for pattern matching
   */
  calculateConfidence(context, pattern) {
    const techStack = context.techStack || {};
    const components = pattern.components || [];
    
    let matches = 0;
    for (const component of components) {
      if (Object.values(techStack).includes(component)) {
        matches++;
      }
    }
    
    return Math.round((matches / components.length) * 100);
  }

  /**
   * Finds the best matching project structure pattern
   */
  findProjectStructurePattern(context) {
    const projectType = context.projectType || 'webapp';
    const techStack = context.techStack || {};
    
    const patterns = this.patterns.patterns?.project_structures || {};
    
    // Try to find specific pattern based on type and tech stack
    const patternKey = `${projectType}_${techStack.frontend || techStack.backend || techStack.language}`;
    
    if (patterns[patternKey]) {
      return patterns[patternKey];
    }
    
    // Fallback to generic patterns
    return patterns[projectType] || patterns.webapp_react;
  }

  /**
   * Generates project structure recommendations
   */
  generateProjectStructure(context) {
    const pattern = this.findProjectStructurePattern(context);
    
    if (!pattern) {
      return this.getDefaultStructure(context);
    }

    return {
      directories: pattern.directories || [],
      files: pattern.files || [],
      recommendations: this.generateStructureRecommendations(context, pattern)
    };
  }

  /**
   * Generates default project structure
   */
  getDefaultStructure(context) {
    const projectType = context.projectType || 'webapp';
    
    const structures = {
      webapp: {
        directories: ['src', 'public', 'docs', 'tests'],
        files: ['package.json', 'README.md', 'tsconfig.json']
      },
      api: {
        directories: ['src', 'tests', 'docs'],
        files: ['package.json', 'README.md', 'Dockerfile']
      },
      cli: {
        directories: ['src', 'bin', 'tests'],
        files: ['package.json', 'README.md', 'bin/cli.js']
      }
    };

    return structures[projectType] || structures.webapp;
  }

  /**
   * Generates structure recommendations
   */
  generateStructureRecommendations(context, pattern) {
    const recommendations = [];
    
    // Security recommendations
    if (context.security?.level === 'high') {
      recommendations.push({
        type: 'security',
        message: 'Consider adding a security/ directory for security policies and configs',
        priority: 'high'
      });
    }

    // Testing recommendations
    if (context.techStack?.testing !== 'none') {
      recommendations.push({
        type: 'testing',
        message: 'Add comprehensive test directory structure with unit, integration, and e2e tests',
        priority: 'medium'
      });
    }

    // Documentation recommendations
    const answers = context.answers || {};
    if (answers.documentation_level === 'comprehensive') {
      recommendations.push({
        type: 'documentation',
        message: 'Create detailed documentation structure with API docs, guides, and examples',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Generates security context
   */
  generateSecurityContext(context) {
    const securityLevel = context.security?.level || 'basic';
    const authentication = context.security?.authentication || 'none';
    
    const securityContext = {
      level: securityLevel,
      authentication: authentication,
      features: [],
      recommendations: []
    };

    // Add security features based on level
    switch (securityLevel) {
      case 'enterprise':
        securityContext.features.push('Advanced threat protection', 'Compliance monitoring');
        // fallthrough
      case 'high':
        securityContext.features.push('Encryption at rest', 'Audit logging');
        // fallthrough
      case 'standard':
        securityContext.features.push('Authentication', 'Authorization');
        // fallthrough
      case 'basic':
        securityContext.features.push('Input validation', 'HTTPS enforcement');
        break;
    }

    // Add authentication-specific features
    if (authentication !== 'none') {
      securityContext.features.push('Secure session management', 'Password policies');
      
      if (authentication === 'oauth') {
        securityContext.features.push('OAuth2 integration', 'Social login');
      }
    }

    // Generate recommendations
    securityContext.recommendations = this.generateSecurityRecommendations(context);

    return securityContext;
  }

  /**
   * Generates security recommendations
   */
  generateSecurityRecommendations(context) {
    const recommendations = [];
    
    // Always recommend basic security
    recommendations.push({
      category: 'headers',
      message: 'Implement security headers (helmet.js)',
      priority: 'high'
    });

    recommendations.push({
      category: 'validation',
      message: 'Add comprehensive input validation',
      priority: 'high'
    });

    // Database security
    if (context.techStack?.database !== 'none') {
      recommendations.push({
        category: 'database',
        message: 'Use parameterized queries to prevent SQL injection',
        priority: 'high'
      });
    }

    // Authentication recommendations
    if (context.security?.authentication !== 'none') {
      recommendations.push({
        category: 'auth',
        message: 'Implement rate limiting for authentication endpoints',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Generates development context
   */
  generateDevelopmentContext(context) {
    const techStack = context.techStack || {};
    
    return {
      workflow: {
        packageManager: techStack.packageManager || 'npm',
        buildTool: this.getBuildTool(context),
        testing: techStack.testing || 'jest',
        linting: this.getLintingConfig(context),
        formatting: 'prettier'
      },
      scripts: this.generateScripts(context),
      dependencies: this.generateDependencies(context),
      devDependencies: this.generateDevDependencies(context)
    };
  }

  /**
   * Determines build tool based on context
   */
  getBuildTool(context) {
    const frontend = context.techStack?.frontend;
    
    if (frontend === 'react' || frontend === 'vue') {
      return 'vite';
    }
    
    if (frontend === 'nextjs') {
      return 'next';
    }
    
    return 'webpack';
  }

  /**
   * Generates linting configuration
   */
  getLintingConfig(context) {
    const language = context.techStack?.language || 'javascript';
    
    if (language === 'typescript') {
      return {
        eslint: '@typescript-eslint/eslint-plugin',
        config: 'eslint-config-typescript'
      };
    }
    
    return {
      eslint: 'eslint',
      config: 'eslint-config-standard'
    };
  }

  /**
   * Generates package.json scripts
   */
  generateScripts(context) {
    const scripts = {
      'dev': 'npm run dev',
      'build': 'npm run build',
      'test': 'npm run test',
      'lint': 'eslint .',
      'format': 'prettier --write .'
    };

    // Add framework-specific scripts
    const frontend = context.techStack?.frontend;
    if (frontend === 'react') {
      scripts.dev = 'vite';
      scripts.build = 'vite build';
    } else if (frontend === 'nextjs') {
      scripts.dev = 'next dev';
      scripts.build = 'next build';
    }

    return scripts;
  }

  /**
   * Generates dependency list
   */
  generateDependencies(context) {
    const dependencies = [];
    const techStack = context.techStack || {};

    // Frontend dependencies
    if (techStack.frontend === 'react') {
      dependencies.push('react', 'react-dom');
    } else if (techStack.frontend === 'vue') {
      dependencies.push('vue');
    }

    // Backend dependencies
    if (techStack.backend === 'express') {
      dependencies.push('express', 'cors', 'helmet');
    }

    // Database dependencies
    if (techStack.database === 'postgresql') {
      dependencies.push('pg');
    } else if (techStack.database === 'mongodb') {
      dependencies.push('mongoose');
    }

    // Authentication dependencies
    if (context.security?.authentication === 'jwt') {
      dependencies.push('jsonwebtoken', 'bcrypt');
    }

    return dependencies;
  }

  /**
   * Generates dev dependency list
   */
  generateDevDependencies(context) {
    const devDependencies = ['eslint', 'prettier'];
    const techStack = context.techStack || {};

    // TypeScript
    if (techStack.language === 'typescript') {
      devDependencies.push('typescript', '@types/node');
    }

    // Testing
    if (techStack.testing === 'jest') {
      devDependencies.push('jest');
    } else if (techStack.testing === 'vitest') {
      devDependencies.push('vitest');
    }

    // Build tools
    if (techStack.frontend === 'react') {
      devDependencies.push('vite', '@vitejs/plugin-react');
    }

    return devDependencies;
  }

  /**
   * Generates deployment context
   */
  generateDeploymentContext(context) {
    const answers = context.answers || {};
    const deploymentTarget = answers.deployment_target || 'docker';
    
    return {
      target: deploymentTarget,
      requirements: this.getDeploymentRequirements(deploymentTarget),
      configuration: this.getDeploymentConfiguration(context, deploymentTarget),
      recommendations: this.getDeploymentRecommendations(context, deploymentTarget)
    };
  }

  /**
   * Gets deployment requirements
   */
  getDeploymentRequirements(target) {
    const requirements = {
      docker: ['Docker', 'Docker Compose'],
      vercel: ['Vercel CLI', 'Node.js'],
      aws: ['AWS CLI', 'Terraform (optional)'],
      heroku: ['Heroku CLI'],
      netlify: ['Netlify CLI']
    };

    return requirements[target] || requirements.docker;
  }

  /**
   * Gets deployment configuration
   */
  getDeploymentConfiguration(context, target) {
    const configs = {
      docker: {
        files: ['Dockerfile', 'docker-compose.yml', '.dockerignore'],
        environment: 'containerized'
      },
      vercel: {
        files: ['vercel.json'],
        environment: 'serverless'
      },
      aws: {
        files: ['buildspec.yml', 'terraform/main.tf'],
        environment: 'cloud'
      }
    };

    return configs[target] || configs.docker;
  }

  /**
   * Gets deployment recommendations
   */
  getDeploymentRecommendations(context, target) {
    const recommendations = [];
    
    // Security recommendations
    if (context.security?.level === 'high') {
      recommendations.push({
        category: 'security',
        message: 'Enable HTTPS and security headers in production',
        priority: 'high'
      });
    }

    // Performance recommendations
    recommendations.push({
      category: 'performance',
      message: 'Configure caching and compression',
      priority: 'medium'
    });

    // Monitoring recommendations
    recommendations.push({
      category: 'monitoring',
      message: 'Set up application monitoring and logging',
      priority: 'medium'
    });

    return recommendations;
  }

  /**
   * Validates assembled context
   */
  validateContext(context) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!context.projectName) {
      errors.push('Project name is required');
    }

    if (!context.projectType) {
      errors.push('Project type is required');
    }

    // Check for missing tech stack components
    if (!context.techStack) {
      warnings.push('Tech stack information is incomplete');
    }

    // Check security configuration
    if (!context.securityContext) {
      warnings.push('Security context is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      completeness: this.calculateCompleteness(context)
    };
  }

  /**
   * Generates research metadata for template processing
   */
  generateResearchMetadata(context) {
    const hasResearch = context.research && (
      (context.research.mcpResults && context.research.mcpResults.length > 0) ||
      (context.research.sections && Object.keys(context.research.sections).length > 0)
    );

    let totalSources = 0;
    let researchMethod = 'Manual Analysis';
    let confidence = 85; // Default confidence

    if (hasResearch) {
      // Count MCP research sources
      if (context.research.mcpResults) {
        context.research.mcpResults.forEach(result => {
          if (result.combinedSources) {
            totalSources += result.combinedSources.length;
          }
        });
      }

      // Count additional research sections
      if (context.research.sections) {
        Object.values(context.research.sections).forEach(sources => {
          totalSources += sources.length;
        });
      }

      // Determine research method based on available sources
      if (context.research.mcpResults && context.research.mcpResults.length > 0) {
        researchMethod = 'Comprehensive MCP Integration (Context7 + Perplexity)';
        confidence = Math.min(95, 75 + (totalSources * 2)); // Higher confidence with more sources
      } else {
        researchMethod = 'Standard Research Integration';
        confidence = Math.min(90, 70 + (totalSources * 1.5));
      }
    }

    return {
      hasResearch: hasResearch,
      researchMethod: researchMethod,
      totalSources: totalSources,
      confidence: confidence,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculates context completeness percentage
   */
  calculateCompleteness(context) {
    const requiredFields = [
      'projectName', 'projectType', 'techStack', 'securityContext',
      'developmentContext', 'projectStructure'
    ];

    const presentFields = requiredFields.filter(field => 
      context[field] && Object.keys(context[field]).length > 0
    );

    return Math.round((presentFields.length / requiredFields.length) * 100);
  }
}

module.exports = { ContextAssembler };