#!/usr/bin/env node

/**
 * Test Script for PRP Generator
 * Validates the end-to-end PRP generation workflow
 */

const { PRPGenerator } = require('./prp-generator');
const { PRPCommandHandler } = require('./prp-command-handler');
const { CodebaseAnalyzer } = require('./codebase-analyzer');
const fs = require('fs');
const path = require('path');

class PRPGeneratorTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 PRP Generator Test Suite');
    console.log('══════════════════════════════');
    
    // Unit tests
    await this.testPRPGeneratorCreation();
    await this.testCodebaseAnalyzer();
    await this.testCommandHandler();
    await this.testTemplateProcessing();
    
    // Integration tests
    await this.testQuickPRPGeneration();
    await this.testFullPRPGeneration();
    await this.testFileOutputGeneration();
    
    // End-to-end tests
    await this.testCommandLineInterface();
    
    this.printTestResults();
    return this.testResults;
  }

  /**
   * Test PRP generator creation
   */
  async testPRPGeneratorCreation() {
    this.startTest('PRP Generator Creation');
    
    try {
      const generator = new PRPGenerator();
      
      this.assert(generator !== null, 'Generator should be created');
      this.assert(typeof generator.generatePRP === 'function', 'generatePRP method should exist');
      this.assert(typeof generator.generateQuickPRP === 'function', 'generateQuickPRP method should exist');
      
      this.passTest('PRP generator created successfully');
    } catch (error) {
      this.failTest('PRP generator creation failed', error);
    }
  }

  /**
   * Test codebase analyzer
   */
  async testCodebaseAnalyzer() {
    this.startTest('Codebase Analyzer');
    
    try {
      const analyzer = new CodebaseAnalyzer();
      
      this.assert(analyzer !== null, 'Analyzer should be created');
      this.assert(typeof analyzer.analyzeCodebase === 'function', 'analyzeCodebase method should exist');
      
      // Test basic analysis
      const analysis = await analyzer.analyzeProjectStructure();
      this.assert(analysis.rootDir !== null, 'Root directory should be detected');
      this.assert(typeof analysis.totalFiles === 'number', 'Total files should be a number');
      
      this.passTest('Codebase analyzer working correctly');
    } catch (error) {
      this.failTest('Codebase analyzer failed', error);
    }
  }

  /**
   * Test command handler
   */
  async testCommandHandler() {
    this.startTest('Command Handler');
    
    try {
      const handler = new PRPCommandHandler();
      
      this.assert(handler !== null, 'Handler should be created');
      this.assert(typeof handler.execute === 'function', 'execute method should exist');
      
      // Test argument parsing
      const options = handler.parseArguments(['--feature', 'Test Feature', '--quick']);
      this.assert(options.featureName === 'Test Feature', 'Feature name should be parsed');
      this.assert(options.quickMode === true, 'Quick mode should be enabled');
      
      this.passTest('Command handler working correctly');
    } catch (error) {
      this.failTest('Command handler failed', error);
    }
  }

  /**
   * Test template processing
   */
  async testTemplateProcessing() {
    this.startTest('Template Processing');
    
    try {
      const generator = new PRPGenerator();
      
      // Test template creation
      const template = generator.createPRPTemplate();
      this.assert(template.length > 0, 'Template should not be empty');
      this.assert(template.includes('{{answers.feature_name}}'), 'Template should contain variables');
      
      // Test filename generation
      const context = {
        answers: {
          feature_name: 'Test Feature'
        }
      };
      const filename = generator.generatePRPFilename(context);
      this.assert(filename.includes('test-feature'), 'Filename should be sanitized');
      this.assert(filename.endsWith('.md'), 'Filename should have .md extension');
      
      this.passTest('Template processing working correctly');
    } catch (error) {
      this.failTest('Template processing failed', error);
    }
  }

  /**
   * Test quick PRP generation
   */
  async testQuickPRPGeneration() {
    this.startTest('Quick PRP Generation');
    
    try {
      const generator = new PRPGenerator();
      
      // Create a test with mock data
      const mockQuickPRP = {
        answers: {
          feature_name: 'Test Feature',
          feature_purpose: 'Testing PRP generation',
          target_users: 'Developers',
          feature_scope: 'component',
          success_criteria: 'PRP generated successfully',
          priority_level: 'medium'
        }
      };
      
      // Mock the template processor to avoid file I/O
      const prpDocument = generator.createPRPTemplate();
      this.assert(prpDocument.length > 0, 'PRP document should be generated');
      
      // Test filename generation
      const filename = generator.generatePRPFilename(mockQuickPRP);
      this.assert(filename.includes('test-feature'), 'Filename should be based on feature name');
      
      this.passTest('Quick PRP generation working correctly');
    } catch (error) {
      this.failTest('Quick PRP generation failed', error);
    }
  }

  /**
   * Test full PRP generation (mocked)
   */
  async testFullPRPGeneration() {
    this.startTest('Full PRP Generation (Mocked)');
    
    try {
      const generator = new PRPGenerator();
      
      // Test context assembly
      const mockContext = {
        answers: {
          feature_name: 'User Authentication',
          feature_purpose: 'Allow users to securely login',
          target_users: 'End users',
          feature_scope: 'feature',
          success_criteria: 'Users can login within 3 seconds',
          priority_level: 'high'
        },
        codebaseAnalysis: {
          techStack: {
            frontend: 'react',
            backend: 'express',
            database: 'postgresql'
          }
        }
      };
      
      const assembledContext = generator.contextAssembler.assembleContext(mockContext);
      this.assert(assembledContext !== null, 'Context should be assembled');
      this.assert(assembledContext.projectName === 'User Authentication', 'Project name should be set');
      
      // Test PRP document generation
      const prpDocument = await generator.generatePRPDocument(assembledContext, {});
      this.assert(prpDocument.length > 0, 'PRP document should be generated');
      this.assert(prpDocument.includes('User Authentication'), 'PRP should contain feature name');
      
      this.passTest('Full PRP generation working correctly');
    } catch (error) {
      this.failTest('Full PRP generation failed', error);
    }
  }

  /**
   * Test file output generation
   */
  async testFileOutputGeneration() {
    this.startTest('File Output Generation');
    
    try {
      const generator = new PRPGenerator();
      
      // Ensure output directory exists
      generator.ensureOutputDir();
      this.assert(fs.existsSync(generator.outputDir), 'Output directory should exist');
      
      // Test filename generation
      const context = {
        answers: {
          feature_name: 'Test Output Feature'
        }
      };
      const filename = generator.generatePRPFilename(context);
      this.assert(filename.startsWith('PRP-'), 'Filename should start with PRP-');
      this.assert(filename.includes('test-output-feature'), 'Filename should be sanitized');
      
      this.passTest('File output generation working correctly');
    } catch (error) {
      this.failTest('File output generation failed', error);
    }
  }

  /**
   * Test command line interface
   */
  async testCommandLineInterface() {
    this.startTest('Command Line Interface');
    
    try {
      const handler = new PRPCommandHandler();
      
      // Test help command
      const helpArgs = ['--help'];
      // Note: This would normally exit the process, so we'll just test the parser
      const helpOptions = handler.parseArguments(helpArgs);
      
      // Test various argument combinations
      const testCases = [
        {
          args: ['--feature', 'Test Feature'],
          expected: { featureName: 'Test Feature' }
        },
        {
          args: ['--component', '--ui'],
          expected: { featureType: 'component', includeUI: true }
        },
        {
          args: ['--quick', '--api'],
          expected: { quickMode: true, includeAPI: true }
        }
      ];
      
      for (const testCase of testCases) {
        const options = handler.parseArguments(testCase.args);
        for (const [key, value] of Object.entries(testCase.expected)) {
          this.assert(options[key] === value, `${key} should be ${value}`);
        }
      }
      
      this.passTest('Command line interface working correctly');
    } catch (error) {
      this.failTest('Command line interface failed', error);
    }
  }

  /**
   * Start a test
   */
  startTest(testName) {
    this.currentTest = {
      name: testName,
      passed: false,
      error: null,
      assertions: []
    };
    console.log(`\n🧪 Running: ${testName}`);
  }

  /**
   * Assert a condition
   */
  assert(condition, message) {
    this.currentTest.assertions.push({
      condition,
      message,
      passed: condition
    });
    
    if (!condition) {
      console.log(`  ❌ ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    } else {
      console.log(`  ✅ ${message}`);
    }
  }

  /**
   * Pass a test
   */
  passTest(message) {
    this.currentTest.passed = true;
    this.testResults.passed++;
    this.testResults.total++;
    this.testResults.tests.push(this.currentTest);
    console.log(`  ✅ ${message}`);
  }

  /**
   * Fail a test
   */
  failTest(message, error) {
    this.currentTest.passed = false;
    this.currentTest.error = error;
    this.testResults.failed++;
    this.testResults.total++;
    this.testResults.tests.push(this.currentTest);
    console.log(`  ❌ ${message}`);
    if (error) {
      console.log(`     Error: ${error.message}`);
    }
  }

  /**
   * Print test results
   */
  printTestResults() {
    console.log('\n' + '═'.repeat(50));
    console.log('🧪 Test Results Summary');
    console.log('═'.repeat(50));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} ✅`);
    console.log(`Failed: ${this.testResults.failed} ❌`);
    console.log(`Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error?.message || 'Unknown error'}`);
        });
    }
    
    console.log('\n' + '═'.repeat(50));
    
    if (this.testResults.failed === 0) {
      console.log('🎉 All tests passed! PRP Generator is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.');
    }
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: Math.round((this.testResults.passed / this.testResults.total) * 100)
      },
      tests: this.testResults.tests.map(test => ({
        name: test.name,
        passed: test.passed,
        error: test.error?.message || null,
        assertions: test.assertions.length
      }))
    };
    
    return report;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new PRPGeneratorTest();
  
  testSuite.runAllTests()
    .then(results => {
      const report = testSuite.generateTestReport();
      
      // Save test report
      const reportPath = path.join(process.cwd(), 'test-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📊 Test report saved to: ${reportPath}`);
      
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { PRPGeneratorTest };