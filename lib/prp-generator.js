#!/usr/bin/env node

/**
 * PRP Generator for Context Engineering Factory
 * Generates Product Requirements Prompts (PRP) for AI-optimized feature development
 */

const fs = require('fs');
const path = require('path');
const { QuestionEngine } = require('./question-engine');
const { ContextAssembler } = require('./context-assembler');
const { ResearchEngine } = require('./research-engine');
const { TemplateProcessor } = require('./template-processor');

class PRPGenerator {
  constructor() {
    this.questionEngine = new QuestionEngine();
    this.contextAssembler = new ContextAssembler();
    this.researchEngine = new ResearchEngine();
    this.templateProcessor = new TemplateProcessor();
    this.outputDir = path.join(process.cwd(), 'generated-prps');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate PRP for a feature - main entry point
   */
  async generatePRP(options = {}) {
    try {
      console.log('🎯 Starting PRP Generation Process...');
      
      // Step 1: Feature Discovery through interactive questions
      console.log('\n📋 Step 1: Feature Discovery');
      const featureContext = await this.conductFeatureDiscovery(options);
      
      // Step 2: Context Assembly and Analysis
      console.log('\n🧠 Step 2: Context Assembly');
      const assembledContext = await this.assembleFeatureContext(featureContext);
      
      // Step 3: Research Phase
      console.log('\n🔍 Step 3: Research & Best Practices');
      const researchResults = await this.conductResearch(assembledContext);
      
      // Step 4: PRP Generation
      console.log('\n📝 Step 4: PRP Document Generation');
      const prpDocument = await this.generatePRPDocument(assembledContext, researchResults);
      
      // Step 5: Save and return results
      console.log('\n💾 Step 5: Saving PRP Document');
      const outputPath = await this.savePRPDocument(prpDocument, assembledContext);
      
      console.log('✅ PRP Generation Complete!');
      console.log(`📄 PRP saved to: ${outputPath}`);
      
      return {
        success: true,
        outputPath: outputPath,
        prpDocument: prpDocument,
        context: assembledContext,
        research: researchResults
      };
      
    } catch (error) {
      console.error('❌ PRP Generation Failed:', error.message);
      return {
        success: false,
        error: error.message,
        outputPath: null
      };
    }
  }

  /**
   * Conduct interactive feature discovery
   */
  async conductFeatureDiscovery(options = {}) {
    const questions = this.getPRPQuestions(options);
    
    console.log('🎯 Feature Discovery Questions:');
    const answers = await this.questionEngine.askQuestions(questions);
    
    // Analyze existing codebase if available
    const codebaseAnalysis = await this.analyzeCodebase();
    
    return {
      answers,
      codebaseAnalysis,
      options,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get PRP-specific questions based on feature type
   */
  getPRPQuestions(options = {}) {
    const baseQuestions = [
      {
        key: 'feature_name',
        question: 'What is the name of the feature you want to develop?',
        type: 'text',
        required: true,
        placeholder: 'e.g., User Authentication System'
      },
      {
        key: 'feature_purpose',
        question: 'What problem does this feature solve?',
        type: 'text',
        required: true,
        placeholder: 'Describe the core problem this feature addresses'
      },
      {
        key: 'target_users',
        question: 'Who are the primary users of this feature?',
        type: 'text',
        required: true,
        placeholder: 'e.g., End users, Administrators, API consumers'
      },
      {
        key: 'feature_scope',
        question: 'What is the scope of this feature?',
        type: 'choice',
        choices: [
          { value: 'component', label: 'Single Component' },
          { value: 'feature', label: 'Complete Feature' },
          { value: 'module', label: 'Module/System' },
          { value: 'integration', label: 'Integration/API' }
        ],
        required: true
      },
      {
        key: 'integration_points',
        question: 'What existing systems/components will this integrate with?',
        type: 'text',
        required: false,
        placeholder: 'List existing components, APIs, or systems'
      },
      {
        key: 'technical_constraints',
        question: 'Are there any technical constraints or requirements?',
        type: 'text',
        required: false,
        placeholder: 'Performance, compatibility, security requirements'
      },
      {
        key: 'success_criteria',
        question: 'How will you measure success for this feature?',
        type: 'text',
        required: true,
        placeholder: 'Specific, measurable success criteria'
      },
      {
        key: 'priority_level',
        question: 'What is the priority level of this feature?',
        type: 'choice',
        choices: [
          { value: 'critical', label: 'Critical (Must have)' },
          { value: 'high', label: 'High Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'low', label: 'Low Priority' }
        ],
        required: true
      }
    ];

    // Add conditional questions based on feature type
    if (options.includeUI) {
      baseQuestions.push({
        key: 'ui_requirements',
        question: 'Describe the UI/UX requirements for this feature',
        type: 'text',
        required: false,
        placeholder: 'Layout, interactions, accessibility requirements'
      });
    }

    if (options.includeAPI) {
      baseQuestions.push({
        key: 'api_requirements',
        question: 'Describe the API requirements (endpoints, data formats)',
        type: 'text',
        required: false,
        placeholder: 'REST endpoints, GraphQL queries, data structures'
      });
    }

    return baseQuestions;
  }

  /**
   * Analyze existing codebase for context
   */
  async analyzeCodebase() {
    try {
      const codebaseInfo = {
        projectStructure: await this.analyzeProjectStructure(),
        techStack: await this.detectTechStack(),
        existingPatterns: await this.analyzeCodePatterns(),
        dependencies: await this.analyzeDependencies()
      };

      return codebaseInfo;
    } catch (error) {
      console.warn('⚠️ Codebase analysis failed:', error.message);
      return {
        projectStructure: null,
        techStack: null,
        existingPatterns: null,
        dependencies: null
      };
    }
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure() {
    const currentDir = process.cwd();
    const structure = {
      rootDir: currentDir,
      hasPackageJson: fs.existsSync(path.join(currentDir, 'package.json')),
      hasDockerfile: fs.existsSync(path.join(currentDir, 'Dockerfile')),
      hasReadme: fs.existsSync(path.join(currentDir, 'README.md')),
      directories: []
    };

    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      structure.directories = items
        .filter(item => item.isDirectory() && !item.name.startsWith('.'))
        .map(dir => dir.name);
    } catch (error) {
      console.warn('Could not analyze project structure:', error.message);
    }

    return structure;
  }

  /**
   * Detect technology stack from project files
   */
  async detectTechStack() {
    const techStack = {
      frontend: null,
      backend: null,
      database: null,
      language: null,
      framework: null
    };

    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };

        // Detect frontend frameworks
        if (deps.react) techStack.frontend = 'react';
        else if (deps.vue) techStack.frontend = 'vue';
        else if (deps.svelte) techStack.frontend = 'svelte';
        else if (deps.next) techStack.frontend = 'nextjs';

        // Detect backend frameworks
        if (deps.express) techStack.backend = 'express';
        else if (deps.fastify) techStack.backend = 'fastify';
        else if (deps.koa) techStack.backend = 'koa';

        // Detect databases
        if (deps.pg || deps.postgresql) techStack.database = 'postgresql';
        else if (deps.mysql) techStack.database = 'mysql';
        else if (deps.mongoose) techStack.database = 'mongodb';

        // Detect language
        if (deps.typescript || packageData.devDependencies?.typescript) {
          techStack.language = 'typescript';
        } else {
          techStack.language = 'javascript';
        }
      }
    } catch (error) {
      console.warn('Could not detect tech stack:', error.message);
    }

    return techStack;
  }

  /**
   * Analyze code patterns in the project
   */
  async analyzeCodePatterns() {
    // This would analyze existing code patterns
    // For now, return basic pattern information
    return {
      hasTests: fs.existsSync(path.join(process.cwd(), 'test')) || 
                fs.existsSync(path.join(process.cwd(), 'tests')) ||
                fs.existsSync(path.join(process.cwd(), '__tests__')),
      hasLinting: fs.existsSync(path.join(process.cwd(), '.eslintrc.js')) ||
                  fs.existsSync(path.join(process.cwd(), '.eslintrc.json')),
      hasTypeScript: fs.existsSync(path.join(process.cwd(), 'tsconfig.json')),
      hasDocker: fs.existsSync(path.join(process.cwd(), 'Dockerfile'))
    };
  }

  /**
   * Analyze project dependencies
   */
  async analyzeDependencies() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return {
          dependencies: Object.keys(packageData.dependencies || {}),
          devDependencies: Object.keys(packageData.devDependencies || {}),
          scripts: Object.keys(packageData.scripts || {})
        };
      }
    } catch (error) {
      console.warn('Could not analyze dependencies:', error.message);
    }
    return null;
  }

  /**
   * Assemble feature context with enhanced information
   */
  async assembleFeatureContext(featureContext) {
    const context = {
      ...featureContext,
      projectName: featureContext.answers.feature_name || 'Unnamed Feature',
      projectType: 'feature',
      featureType: featureContext.answers.feature_scope || 'component',
      techStack: featureContext.codebaseAnalysis?.techStack || {},
      security: {
        level: 'standard',
        authentication: 'none',
        dataProtection: 'standard'
      }
    };

    // Use context assembler to enhance the context
    const assembledContext = this.contextAssembler.assembleContext(context);
    
    return assembledContext;
  }

  /**
   * Conduct research for the feature
   */
  async conductResearch(context) {
    console.log('🔍 Conducting research for feature development...');
    
    const researchQueries = this.generateFeatureResearchQueries(context);
    const researchResults = await this.researchEngine.executeResearch({
      projectType: context.featureType,
      techStack: context.techStack,
      features: [context.projectName],
      queries: researchQueries
    });

    return researchResults;
  }

  /**
   * Generate research queries specific to the feature
   */
  generateFeatureResearchQueries(context) {
    const queries = [];
    const featureName = context.answers.feature_name;
    const techStack = context.techStack;

    // Core feature queries
    queries.push(`${featureName} implementation best practices`);
    queries.push(`${featureName} design patterns`);
    queries.push(`${featureName} testing strategies`);

    // Technology-specific queries
    if (techStack.frontend) {
      queries.push(`${featureName} ${techStack.frontend} implementation`);
    }
    if (techStack.backend) {
      queries.push(`${featureName} ${techStack.backend} API design`);
    }
    if (techStack.database) {
      queries.push(`${featureName} ${techStack.database} schema design`);
    }

    // Security and performance queries
    queries.push(`${featureName} security considerations`);
    queries.push(`${featureName} performance optimization`);

    return queries;
  }

  /**
   * Generate the PRP document
   */
  async generatePRPDocument(context, research) {
    const prpTemplate = this.createPRPTemplate();
    
    const templateContext = {
      ...context,
      research: research,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const prpDocument = this.templateProcessor.processTemplateString(prpTemplate, templateContext);
    
    return prpDocument;
  }

  /**
   * Create PRP template
   */
  createPRPTemplate() {
    return `# Feature PRP: {{answers.feature_name}}

## 🎯 Context & Purpose

**Problem Statement**: {{answers.feature_purpose}}

**Target Users**: {{answers.target_users}}

**Feature Scope**: {{answers.feature_scope}}

**Success Criteria**: {{answers.success_criteria}}

**Priority Level**: {{answers.priority_level}}

## 🏗️ Technical Implementation

### Architecture
{{#if codebaseAnalysis.techStack}}
- **Frontend**: {{codebaseAnalysis.techStack.frontend}}
- **Backend**: {{codebaseAnalysis.techStack.backend}}
- **Database**: {{codebaseAnalysis.techStack.database}}
- **Language**: {{codebaseAnalysis.techStack.language}}
{{/if}}

### Integration Points
{{#if answers.integration_points}}
{{answers.integration_points}}
{{/if}}

### Technical Constraints
{{#if answers.technical_constraints}}
{{answers.technical_constraints}}
{{/if}}

### Dependencies
{{#if codebaseAnalysis.dependencies}}
{{#each codebaseAnalysis.dependencies.dependencies}}
- {{.}}
{{/each}}
{{/if}}

## 🧪 Testing Strategy

### Unit Testing
- Component-level testing for all feature components
- Mock external dependencies and integrations
- Test edge cases and error conditions

### Integration Testing
- Test integration with existing systems
- Verify API contracts and data flows
- Test database interactions and transactions

### User Acceptance Testing
- Validate against success criteria
- Test user workflows and interactions
- Verify accessibility and usability requirements

## 🔗 Integration Guidelines

### API Contracts
{{#if answers.api_requirements}}
{{answers.api_requirements}}
{{/if}}

### Data Flow
- Input validation and sanitization
- Data transformation and processing
- Output formatting and response handling

### Configuration
- Environment variables and settings
- Feature flags and toggles
- Deployment configuration

## 🛡️ Security & Compliance

### Authentication & Authorization
- User authentication requirements
- Role-based access control (RBAC)
- Permission validation

### Data Protection
- Input validation and sanitization
- Data encryption at rest and in transit
- Privacy and compliance considerations

### Security Best Practices
- OWASP security guidelines
- Secure coding practices
- Regular security audits

## 🔍 Implementation Details

### File Structure
\`\`\`
{{#if codebaseAnalysis.projectStructure}}
{{codebaseAnalysis.projectStructure.rootDir}}/
{{#each codebaseAnalysis.projectStructure.directories}}
├── {{.}}/
{{/each}}
\`\`\`
{{/if}}

### Development Workflow
1. **Setup**: Initialize development environment
2. **Implementation**: Build feature components
3. **Testing**: Comprehensive testing strategy
4. **Integration**: Connect with existing systems
5. **Deployment**: Deploy to production

## 📚 Research & Best Practices

{{#if research.formattedLinks}}
{{research.formattedLinks}}
{{/if}}

## 🎯 AI Assistant Context

### Codebase Information
- **Project Type**: {{featureType}}
- **Tech Stack**: {{#if techStack}}{{techStack.frontend}}{{#if techStack.backend}} + {{techStack.backend}}{{/if}}{{/if}}
- **Existing Patterns**: Component-based architecture
- **Code Standards**: {{#if codebaseAnalysis.existingPatterns.hasLinting}}ESLint enabled{{/if}}{{#if codebaseAnalysis.existingPatterns.hasTypeScript}}, TypeScript{{/if}}

### Development Tools
{{#if codebaseAnalysis.dependencies.scripts}}
**Available Scripts**:
{{#each codebaseAnalysis.dependencies.scripts}}
- \`{{.}}\`
{{/each}}
{{/if}}

### Implementation Notes
- Follow existing code patterns and conventions
- Maintain consistency with current architecture
- Use established testing frameworks and patterns
- Follow security best practices throughout development

---

**Generated**: {{generatedAt}}
**Version**: {{version}}
**Created by**: EchoContext Factory PRP Generator v2.1.0

*This PRP is optimized for AI-assisted development with Claude Code*`;
  }

  /**
   * Save PRP document to file
   */
  async savePRPDocument(prpDocument, context) {
    const filename = this.generatePRPFilename(context);
    const outputPath = path.join(this.outputDir, filename);
    
    try {
      fs.writeFileSync(outputPath, prpDocument, 'utf8');
      console.log(`💾 PRP document saved: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('❌ Failed to save PRP document:', error.message);
      throw error;
    }
  }

  /**
   * Generate PRP filename
   */
  generatePRPFilename(context) {
    const featureName = context.answers.feature_name || 'unnamed-feature';
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = featureName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `PRP-${sanitizedName}-${timestamp}.md`;
  }

  /**
   * Quick PRP generation for simple features
   */
  async generateQuickPRP(featureName, featureDescription) {
    const quickOptions = {
      answers: {
        feature_name: featureName,
        feature_purpose: featureDescription,
        target_users: 'Application users',
        feature_scope: 'component',
        success_criteria: 'Feature works as expected',
        priority_level: 'medium'
      }
    };

    return this.generatePRP(quickOptions);
  }
}

module.exports = { PRPGenerator };