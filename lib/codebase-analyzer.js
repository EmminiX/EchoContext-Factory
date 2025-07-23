#!/usr/bin/env node

/**
 * Advanced Codebase Analyzer for EchoContext Factory
 * Provides deep analysis of project structure, patterns, and architecture
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

class CodebaseAnalyzer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.analysisCache = new Map();
    this.supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.php'];
  }

  /**
   * Perform comprehensive codebase analysis
   */
  async analyzeCodebase(options = {}) {
    const analysis = {
      timestamp: new Date().toISOString(),
      projectPath: this.projectPath,
      structure: await this.analyzeProjectStructure(),
      techStack: await this.analyzeTechStack(),
      patterns: await this.analyzeCodePatterns(),
      dependencies: await this.analyzeDependencies(),
      architecture: await this.analyzeArchitecture(),
      codeMetrics: await this.analyzeCodeMetrics(),
      testCoverage: await this.analyzeTestCoverage(),
      security: await this.analyzeSecurityPatterns(),
      performance: await this.analyzePerformancePatterns()
    };

    // Cache the analysis
    this.analysisCache.set('full_analysis', analysis);
    
    return analysis;
  }

  /**
   * Analyze project structure in detail
   */
  async analyzeProjectStructure() {
    const structure = {
      rootDir: this.projectPath,
      totalFiles: 0,
      totalDirectories: 0,
      fileTypes: {},
      directories: [],
      importantFiles: [],
      configFiles: [],
      documentationFiles: []
    };

    try {
      await this.walkDirectory(this.projectPath, structure);
      
      // Identify important files
      structure.importantFiles = this.identifyImportantFiles();
      structure.configFiles = this.identifyConfigFiles();
      structure.documentationFiles = this.identifyDocumentationFiles();
      
    } catch (error) {
      console.warn('Project structure analysis failed:', error.message);
    }

    return structure;
  }

  /**
   * Walk directory recursively
   */
  async walkDirectory(dirPath, structure, depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        const relativePath = path.relative(this.projectPath, itemPath);
        
        // Skip hidden files and node_modules
        if (item.name.startsWith('.') || item.name === 'node_modules') {
          continue;
        }

        if (item.isDirectory()) {
          structure.totalDirectories++;
          structure.directories.push({
            name: item.name,
            path: relativePath,
            depth: depth
          });
          
          await this.walkDirectory(itemPath, structure, depth + 1);
        } else {
          structure.totalFiles++;
          const ext = path.extname(item.name);
          structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
        }
      }
    } catch (error) {
      console.warn(`Could not analyze directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Identify important files
   */
  identifyImportantFiles() {
    const importantFiles = [];
    const importantPatterns = [
      'package.json',
      'tsconfig.json',
      'webpack.config.js',
      'vite.config.js',
      'next.config.js',
      'tailwind.config.js',
      'jest.config.js',
      'cypress.config.js',
      'docker-compose.yml',
      'Dockerfile',
      'README.md',
      'CHANGELOG.md'
    ];

    for (const pattern of importantPatterns) {
      const filePath = path.join(this.projectPath, pattern);
      if (fs.existsSync(filePath)) {
        importantFiles.push({
          name: pattern,
          path: pattern,
          type: this.getFileType(pattern)
        });
      }
    }

    return importantFiles;
  }

  /**
   * Identify configuration files
   */
  identifyConfigFiles() {
    const configFiles = [];
    const configPatterns = [
      '.eslintrc.js',
      '.eslintrc.json',
      '.prettierrc',
      '.babelrc',
      '.env',
      '.env.example',
      '.gitignore',
      'vercel.json',
      'netlify.toml'
    ];

    for (const pattern of configPatterns) {
      const filePath = path.join(this.projectPath, pattern);
      if (fs.existsSync(filePath)) {
        configFiles.push({
          name: pattern,
          path: pattern,
          type: this.getFileType(pattern)
        });
      }
    }

    return configFiles;
  }

  /**
   * Identify documentation files
   */
  identifyDocumentationFiles() {
    const docFiles = [];
    const docPatterns = ['README.md', 'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md'];

    for (const pattern of docPatterns) {
      const filePath = path.join(this.projectPath, pattern);
      if (fs.existsSync(filePath)) {
        docFiles.push({
          name: pattern,
          path: pattern,
          type: 'documentation'
        });
      }
    }

    return docFiles;
  }

  /**
   * Get file type from filename
   */
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'react',
      '.ts': 'typescript',
      '.tsx': 'react-typescript',
      '.json': 'config',
      '.md': 'documentation',
      '.yml': 'config',
      '.yaml': 'config',
      '.toml': 'config'
    };

    return typeMap[ext] || 'unknown';
  }

  /**
   * Analyze technology stack
   */
  async analyzeTechStack() {
    const techStack = {
      frontend: null,
      backend: null,
      database: null,
      language: null,
      framework: null,
      buildTool: null,
      testing: null,
      styling: null,
      packageManager: null,
      deployment: null,
      confidence: {}
    };

    try {
      // Analyze package.json
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        this.analyzeTechStackFromPackageJson(packageData, techStack);
      }

      // Analyze config files
      await this.analyzeTechStackFromConfigFiles(techStack);
      
      // Analyze file patterns
      await this.analyzeTechStackFromFilePatterns(techStack);
      
      // Calculate confidence scores
      this.calculateTechStackConfidence(techStack);
      
    } catch (error) {
      console.warn('Tech stack analysis failed:', error.message);
    }

    return techStack;
  }

  /**
   * Analyze tech stack from package.json
   */
  analyzeTechStackFromPackageJson(packageData, techStack) {
    const deps = { ...packageData.dependencies, ...packageData.devDependencies };

    // Frontend frameworks
    if (deps.react) {
      techStack.frontend = 'react';
      techStack.confidence.frontend = 0.9;
    } else if (deps.vue) {
      techStack.frontend = 'vue';
      techStack.confidence.frontend = 0.9;
    } else if (deps.svelte) {
      techStack.frontend = 'svelte';
      techStack.confidence.frontend = 0.9;
    } else if (deps.next) {
      techStack.frontend = 'nextjs';
      techStack.confidence.frontend = 0.95;
    } else if (deps.nuxt) {
      techStack.frontend = 'nuxt';
      techStack.confidence.frontend = 0.95;
    }

    // Backend frameworks
    if (deps.express) {
      techStack.backend = 'express';
      techStack.confidence.backend = 0.9;
    } else if (deps.fastify) {
      techStack.backend = 'fastify';
      techStack.confidence.backend = 0.9;
    } else if (deps.koa) {
      techStack.backend = 'koa';
      techStack.confidence.backend = 0.9;
    } else if (deps.nestjs) {
      techStack.backend = 'nestjs';
      techStack.confidence.backend = 0.9;
    }

    // Database
    if (deps.pg || deps.postgresql) {
      techStack.database = 'postgresql';
      techStack.confidence.database = 0.8;
    } else if (deps.mysql) {
      techStack.database = 'mysql';
      techStack.confidence.database = 0.8;
    } else if (deps.mongoose) {
      techStack.database = 'mongodb';
      techStack.confidence.database = 0.8;
    } else if (deps.sqlite3) {
      techStack.database = 'sqlite';
      techStack.confidence.database = 0.8;
    }

    // Language
    if (deps.typescript || packageData.devDependencies?.typescript) {
      techStack.language = 'typescript';
      techStack.confidence.language = 0.9;
    } else {
      techStack.language = 'javascript';
      techStack.confidence.language = 0.7;
    }

    // Build tools
    if (deps.vite) {
      techStack.buildTool = 'vite';
      techStack.confidence.buildTool = 0.9;
    } else if (deps.webpack) {
      techStack.buildTool = 'webpack';
      techStack.confidence.buildTool = 0.8;
    } else if (deps.rollup) {
      techStack.buildTool = 'rollup';
      techStack.confidence.buildTool = 0.8;
    }

    // Testing
    if (deps.jest) {
      techStack.testing = 'jest';
      techStack.confidence.testing = 0.9;
    } else if (deps.vitest) {
      techStack.testing = 'vitest';
      techStack.confidence.testing = 0.9;
    } else if (deps.cypress) {
      techStack.testing = 'cypress';
      techStack.confidence.testing = 0.8;
    }

    // Styling
    if (deps.tailwindcss) {
      techStack.styling = 'tailwindcss';
      techStack.confidence.styling = 0.9;
    } else if (deps['styled-components']) {
      techStack.styling = 'styled-components';
      techStack.confidence.styling = 0.9;
    } else if (deps.sass) {
      techStack.styling = 'sass';
      techStack.confidence.styling = 0.8;
    }

    // Package manager
    if (fs.existsSync(path.join(this.projectPath, 'bun.lockb'))) {
      techStack.packageManager = 'bun';
      techStack.confidence.packageManager = 1.0;
    } else if (fs.existsSync(path.join(this.projectPath, 'pnpm-lock.yaml'))) {
      techStack.packageManager = 'pnpm';
      techStack.confidence.packageManager = 1.0;
    } else if (fs.existsSync(path.join(this.projectPath, 'yarn.lock'))) {
      techStack.packageManager = 'yarn';
      techStack.confidence.packageManager = 1.0;
    } else {
      techStack.packageManager = 'npm';
      techStack.confidence.packageManager = 0.7;
    }
  }

  /**
   * Analyze tech stack from config files
   */
  async analyzeTechStackFromConfigFiles(techStack) {
    // Check for Next.js
    if (fs.existsSync(path.join(this.projectPath, 'next.config.js'))) {
      techStack.frontend = 'nextjs';
      techStack.confidence.frontend = 0.95;
    }

    // Check for Nuxt.js
    if (fs.existsSync(path.join(this.projectPath, 'nuxt.config.js'))) {
      techStack.frontend = 'nuxt';
      techStack.confidence.frontend = 0.95;
    }

    // Check for Vite
    if (fs.existsSync(path.join(this.projectPath, 'vite.config.js'))) {
      techStack.buildTool = 'vite';
      techStack.confidence.buildTool = 0.9;
    }

    // Check for Tailwind
    if (fs.existsSync(path.join(this.projectPath, 'tailwind.config.js'))) {
      techStack.styling = 'tailwindcss';
      techStack.confidence.styling = 0.9;
    }

    // Check for Docker
    if (fs.existsSync(path.join(this.projectPath, 'Dockerfile'))) {
      techStack.deployment = 'docker';
      techStack.confidence.deployment = 0.8;
    }

    // Check for Vercel
    if (fs.existsSync(path.join(this.projectPath, 'vercel.json'))) {
      techStack.deployment = 'vercel';
      techStack.confidence.deployment = 0.9;
    }
  }

  /**
   * Analyze tech stack from file patterns
   */
  async analyzeTechStackFromFilePatterns(techStack) {
    // Check for TypeScript files
    const tsFiles = this.findFilesByExtension(['.ts', '.tsx']);
    if (tsFiles.length > 0) {
      techStack.language = 'typescript';
      techStack.confidence.language = Math.min(0.9, 0.5 + (tsFiles.length * 0.1));
    }

    // Check for React files
    const reactFiles = this.findFilesByExtension(['.jsx', '.tsx']);
    if (reactFiles.length > 0 && !techStack.frontend) {
      techStack.frontend = 'react';
      techStack.confidence.frontend = Math.min(0.8, 0.5 + (reactFiles.length * 0.1));
    }
  }

  /**
   * Find files by extension
   */
  findFilesByExtension(extensions) {
    const files = [];
    // This is a simplified version - in a full implementation, 
    // we would recursively search through the project
    return files;
  }

  /**
   * Calculate tech stack confidence scores
   */
  calculateTechStackConfidence(techStack) {
    for (const [key, value] of Object.entries(techStack)) {
      if (value && key !== 'confidence') {
        if (!techStack.confidence[key]) {
          techStack.confidence[key] = 0.5; // Default confidence
        }
      }
    }
  }

  /**
   * Analyze code patterns
   */
  async analyzeCodePatterns() {
    const patterns = {
      hasTests: false,
      hasLinting: false,
      hasTypeScript: false,
      hasDocker: false,
      hasCI: false,
      hasHooks: false,
      architecture: null,
      folderStructure: null,
      namingConventions: null,
      codeOrganization: null
    };

    try {
      // Check for tests
      const testDirs = ['test', 'tests', '__tests__', 'spec'];
      patterns.hasTests = testDirs.some(dir => 
        fs.existsSync(path.join(this.projectPath, dir))
      );

      // Check for linting
      const lintFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml'];
      patterns.hasLinting = lintFiles.some(file => 
        fs.existsSync(path.join(this.projectPath, file))
      );

      // Check for TypeScript
      patterns.hasTypeScript = fs.existsSync(path.join(this.projectPath, 'tsconfig.json'));

      // Check for Docker
      patterns.hasDocker = fs.existsSync(path.join(this.projectPath, 'Dockerfile'));

      // Check for CI
      patterns.hasCI = fs.existsSync(path.join(this.projectPath, '.github/workflows')) ||
                       fs.existsSync(path.join(this.projectPath, '.gitlab-ci.yml'));

      // Check for hooks
      patterns.hasHooks = fs.existsSync(path.join(this.projectPath, '.husky')) ||
                          fs.existsSync(path.join(this.projectPath, '.githooks'));

      // Analyze architecture patterns
      patterns.architecture = this.analyzeArchitecturePatterns();
      
      // Analyze folder structure
      patterns.folderStructure = this.analyzeFolderStructure();

    } catch (error) {
      console.warn('Code patterns analysis failed:', error.message);
    }

    return patterns;
  }

  /**
   * Analyze architecture patterns
   */
  analyzeArchitecturePatterns() {
    const srcPath = path.join(this.projectPath, 'src');
    if (!fs.existsSync(srcPath)) return 'unknown';

    try {
      const srcContents = fs.readdirSync(srcPath);
      
      // Check for common architecture patterns
      if (srcContents.includes('components') && srcContents.includes('pages')) {
        return 'component-based';
      }
      
      if (srcContents.includes('modules') || srcContents.includes('features')) {
        return 'feature-based';
      }
      
      if (srcContents.includes('controllers') && srcContents.includes('models')) {
        return 'mvc';
      }
      
      if (srcContents.includes('services') && srcContents.includes('repositories')) {
        return 'service-repository';
      }
      
      return 'custom';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Analyze folder structure
   */
  analyzeFolderStructure() {
    const commonStructures = {
      'src/components': 'component-based',
      'src/pages': 'page-based',
      'src/modules': 'module-based',
      'src/features': 'feature-based',
      'src/services': 'service-oriented',
      'src/utils': 'utility-based',
      'src/hooks': 'hook-based',
      'src/contexts': 'context-based'
    };

    const foundStructures = [];
    
    for (const [structure, type] of Object.entries(commonStructures)) {
      if (fs.existsSync(path.join(this.projectPath, structure))) {
        foundStructures.push(type);
      }
    }

    return foundStructures;
  }

  /**
   * Analyze dependencies
   */
  async analyzeDependencies() {
    const dependencies = {
      production: [],
      development: [],
      scripts: [],
      outdated: [],
      security: [],
      bundleSize: null
    };

    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        dependencies.production = Object.keys(packageData.dependencies || {});
        dependencies.development = Object.keys(packageData.devDependencies || {});
        dependencies.scripts = Object.keys(packageData.scripts || {});
        
        // TODO: Add outdated and security analysis
        // This would require npm audit or similar tools
      }
    } catch (error) {
      console.warn('Dependencies analysis failed:', error.message);
    }

    return dependencies;
  }

  /**
   * Analyze architecture
   */
  async analyzeArchitecture() {
    const architecture = {
      type: 'unknown',
      patterns: [],
      layering: null,
      dataFlow: null,
      stateManagement: null,
      routing: null
    };

    try {
      // Analyze architecture based on file structure and dependencies
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };

        // State management
        if (deps.redux) {
          architecture.stateManagement = 'redux';
        } else if (deps.zustand) {
          architecture.stateManagement = 'zustand';
        } else if (deps.mobx) {
          architecture.stateManagement = 'mobx';
        }

        // Routing
        if (deps['react-router-dom']) {
          architecture.routing = 'react-router';
        } else if (deps['next/router']) {
          architecture.routing = 'next-router';
        }

        // Architecture type
        if (deps.next) {
          architecture.type = 'ssr';
        } else if (deps.react) {
          architecture.type = 'spa';
        } else if (deps.express) {
          architecture.type = 'api';
        }
      }
    } catch (error) {
      console.warn('Architecture analysis failed:', error.message);
    }

    return architecture;
  }

  /**
   * Analyze code metrics
   */
  async analyzeCodeMetrics() {
    const metrics = {
      totalLines: 0,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0,
      files: {
        total: 0,
        byType: {}
      },
      complexity: 'unknown',
      maintainability: 'unknown'
    };

    try {
      // This would require a more sophisticated code analysis
      // For now, we'll provide basic file counting
      const structure = await this.analyzeProjectStructure();
      metrics.files.total = structure.totalFiles;
      metrics.files.byType = structure.fileTypes;
    } catch (error) {
      console.warn('Code metrics analysis failed:', error.message);
    }

    return metrics;
  }

  /**
   * Analyze test coverage
   */
  async analyzeTestCoverage() {
    const coverage = {
      hasTestFramework: false,
      framework: null,
      coverageConfig: false,
      estimatedCoverage: 'unknown',
      testTypes: []
    };

    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };

        // Test frameworks
        if (deps.jest) {
          coverage.hasTestFramework = true;
          coverage.framework = 'jest';
        } else if (deps.vitest) {
          coverage.hasTestFramework = true;
          coverage.framework = 'vitest';
        } else if (deps.mocha) {
          coverage.hasTestFramework = true;
          coverage.framework = 'mocha';
        }

        // Test types
        if (deps.cypress) coverage.testTypes.push('e2e');
        if (deps.playwright) coverage.testTypes.push('e2e');
        if (deps['@testing-library/react']) coverage.testTypes.push('unit');
        if (deps.supertest) coverage.testTypes.push('integration');
      }
    } catch (error) {
      console.warn('Test coverage analysis failed:', error.message);
    }

    return coverage;
  }

  /**
   * Analyze security patterns
   */
  async analyzeSecurityPatterns() {
    const security = {
      hasSecurityFramework: false,
      frameworks: [],
      patterns: [],
      vulnerabilities: [],
      recommendations: []
    };

    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };

        // Security frameworks
        if (deps.helmet) {
          security.hasSecurityFramework = true;
          security.frameworks.push('helmet');
          security.patterns.push('security headers');
        }

        if (deps.bcrypt) {
          security.frameworks.push('bcrypt');
          security.patterns.push('password hashing');
        }

        if (deps.jsonwebtoken) {
          security.frameworks.push('jwt');
          security.patterns.push('token authentication');
        }

        if (deps['express-rate-limit']) {
          security.frameworks.push('rate-limiting');
          security.patterns.push('ddos protection');
        }

        // Security recommendations
        if (!deps.helmet) {
          security.recommendations.push('Add helmet for security headers');
        }
        if (!deps.bcrypt && deps.express) {
          security.recommendations.push('Add bcrypt for password hashing');
        }
      }
    } catch (error) {
      console.warn('Security analysis failed:', error.message);
    }

    return security;
  }

  /**
   * Analyze performance patterns
   */
  async analyzePerformancePatterns() {
    const performance = {
      optimizationTools: [],
      patterns: [],
      buildOptimizations: [],
      runtimeOptimizations: [],
      recommendations: []
    };

    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (fs.existsExists(packageJsonPath)) {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };

        // Performance tools
        if (deps.webpack) {
          performance.optimizationTools.push('webpack');
          performance.buildOptimizations.push('code splitting');
        }

        if (deps.vite) {
          performance.optimizationTools.push('vite');
          performance.buildOptimizations.push('hot module replacement');
        }

        if (deps.react) {
          performance.runtimeOptimizations.push('virtual dom');
        }

        // Recommendations
        if (!deps.webpack && !deps.vite) {
          performance.recommendations.push('Add build optimization tool');
        }
      }
    } catch (error) {
      console.warn('Performance analysis failed:', error.message);
    }

    return performance;
  }

  /**
   * Get cached analysis or perform new analysis
   */
  async getCachedAnalysis(key, analysisFunction) {
    if (this.analysisCache.has(key)) {
      return this.analysisCache.get(key);
    }

    const result = await analysisFunction();
    this.analysisCache.set(key, result);
    return result;
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }

  /**
   * Generate analysis summary
   */
  generateAnalysisSummary(analysis) {
    const summary = {
      projectType: this.determineProjectType(analysis),
      complexity: this.assessComplexity(analysis),
      maturity: this.assessMaturity(analysis),
      recommendations: this.generateRecommendations(analysis),
      score: this.calculateQualityScore(analysis)
    };

    return summary;
  }

  /**
   * Determine project type
   */
  determineProjectType(analysis) {
    if (analysis.techStack.frontend && analysis.techStack.backend) {
      return 'fullstack';
    } else if (analysis.techStack.frontend) {
      return 'frontend';
    } else if (analysis.techStack.backend) {
      return 'backend';
    } else {
      return 'unknown';
    }
  }

  /**
   * Assess project complexity
   */
  assessComplexity(analysis) {
    let score = 0;
    
    if (analysis.structure.totalFiles > 100) score += 2;
    else if (analysis.structure.totalFiles > 50) score += 1;
    
    if (analysis.dependencies.production.length > 20) score += 2;
    else if (analysis.dependencies.production.length > 10) score += 1;
    
    if (analysis.patterns.hasTests) score += 1;
    if (analysis.patterns.hasTypeScript) score += 1;
    
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Assess project maturity
   */
  assessMaturity(analysis) {
    let score = 0;
    
    if (analysis.patterns.hasTests) score += 2;
    if (analysis.patterns.hasLinting) score += 1;
    if (analysis.patterns.hasTypeScript) score += 1;
    if (analysis.patterns.hasCI) score += 1;
    if (analysis.patterns.hasDocker) score += 1;
    if (analysis.security.hasSecurityFramework) score += 1;
    
    if (score >= 6) return 'mature';
    if (score >= 4) return 'developing';
    return 'early';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.patterns.hasTests) {
      recommendations.push('Add comprehensive testing framework');
    }
    
    if (!analysis.patterns.hasLinting) {
      recommendations.push('Add code linting and formatting');
    }
    
    if (!analysis.patterns.hasTypeScript && analysis.techStack.language === 'javascript') {
      recommendations.push('Consider migrating to TypeScript');
    }
    
    if (!analysis.patterns.hasCI) {
      recommendations.push('Set up continuous integration');
    }
    
    if (!analysis.security.hasSecurityFramework) {
      recommendations.push('Add security middleware and practices');
    }
    
    return recommendations;
  }

  /**
   * Calculate quality score
   */
  calculateQualityScore(analysis) {
    let score = 0;
    
    // Testing (25%)
    if (analysis.patterns.hasTests) score += 25;
    
    // Code quality (20%)
    if (analysis.patterns.hasLinting) score += 10;
    if (analysis.patterns.hasTypeScript) score += 10;
    
    // Architecture (20%)
    if (analysis.architecture.type !== 'unknown') score += 10;
    if (analysis.patterns.folderStructure && analysis.patterns.folderStructure.length > 0) score += 10;
    
    // Security (15%)
    if (analysis.security.hasSecurityFramework) score += 15;
    
    // Performance (10%)
    if (analysis.performance.optimizationTools.length > 0) score += 10;
    
    // Documentation (10%)
    if (analysis.structure.documentationFiles.length > 0) score += 10;
    
    return Math.min(100, score);
  }
}

module.exports = { CodebaseAnalyzer };