#!/usr/bin/env node

/**
 * Dynamic File Generator for Multi-Agent Results
 * Creates appropriate markdown files based on task type and agent outputs
 */

const fs = require('fs');
const path = require('path');

class FileGenerator {
  constructor() {
    this.outputDir = path.join(process.env.HOME, '.claude');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate appropriate file(s) based on task type and results
   */
  generateFiles(aggregatedReport, taskDescription) {
    const files = [];
    const taskType = this.determineTaskType(aggregatedReport);
    
    switch (taskType) {
      case 'research':
        files.push(this.generateResearchReport(aggregatedReport, taskDescription));
        break;
      
      case 'analysis':
        files.push(this.generateAnalysisReport(aggregatedReport, taskDescription));
        break;
      
      case 'implementation':
        files.push(this.generateImplementationReport(aggregatedReport, taskDescription));
        break;
      
      case 'validation':
        files.push(this.generateValidationReport(aggregatedReport, taskDescription));
        break;
      
      case 'mixed':
        files.push(this.generateComprehensiveReport(aggregatedReport, taskDescription));
        break;
      
      default:
        files.push(this.generateGeneralReport(aggregatedReport, taskDescription));
        break;
    }
    
    return files;
  }

  /**
   * Determine task type based on agent types in results
   */
  determineTaskType(aggregatedReport) {
    const agentTypes = aggregatedReport.summary.agentTypes;
    
    if (agentTypes.length === 1) {
      return agentTypes[0];
    } else if (agentTypes.length > 1) {
      return 'mixed';
    } else {
      return 'general';
    }
  }

  /**
   * Generate research-focused report
   */
  generateResearchReport(aggregatedReport, taskDescription) {
    const filename = this.generateFilename(taskDescription, 'research');
    const filepath = path.join(this.outputDir, filename);
    
    let content = `# Research Report: ${taskDescription}\n\n`;
    content += `**Generated**: ${aggregatedReport.timestamp}\n`;
    content += `**Research Agents**: ${aggregatedReport.summary.totalAgents}\n`;
    content += `**Success Rate**: ${aggregatedReport.summary.completionRate}%\n\n`;

    // Executive Summary
    content += `## Executive Summary\n\n`;
    content += `This research report compiles findings from ${aggregatedReport.summary.totalAgents} specialized research agents focused on "${taskDescription}". `;
    content += `The research achieved a ${aggregatedReport.summary.completionRate}% success rate and provides comprehensive insights, resources, and recommendations.\n\n`;

    // Research Findings
    if (aggregatedReport.agentResults.research) {
      content += `## Research Findings\n\n`;
      aggregatedReport.agentResults.research.forEach((result, index) => {
        content += `### Research Agent ${index + 1}: ${result.description}\n\n`;
        content += `${result.output}\n\n`;
      });
    }

    // Key Insights
    content += `## Key Insights\n\n`;
    content += this.extractKeyInsights(aggregatedReport.agentResults.research || []);

    // Resources and References
    content += `## Resources and References\n\n`;
    content += this.extractReferences(aggregatedReport.agentResults.research || []);

    // Recommendations
    content += this.formatRecommendations(aggregatedReport.recommendations);

    // Next Steps
    content += this.formatNextSteps(aggregatedReport.nextSteps);

    // Footer
    content += `\n---\n\n`;
    content += `*Research compiled by EchoContext Factory Multi-Agent System*\n`;
    content += `*Task: ${taskDescription}*\n`;
    content += `*Generated: ${aggregatedReport.timestamp}*\n`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Research report saved: ${filename}`);
    
    return { filename, filepath, type: 'research' };
  }

  /**
   * Generate analysis-focused report
   */
  generateAnalysisReport(aggregatedReport, taskDescription) {
    const filename = this.generateFilename(taskDescription, 'analysis');
    const filepath = path.join(this.outputDir, filename);
    
    let content = `# Analysis Report: ${taskDescription}\n\n`;
    content += `**Generated**: ${aggregatedReport.timestamp}\n`;
    content += `**Analysis Agents**: ${aggregatedReport.summary.totalAgents}\n`;
    content += `**Success Rate**: ${aggregatedReport.summary.completionRate}%\n\n`;

    // Executive Summary
    content += `## Executive Summary\n\n`;
    content += `This analysis report presents findings from ${aggregatedReport.summary.totalAgents} specialized analysis agents examining "${taskDescription}". `;
    content += `The analysis identifies key issues, opportunities, and provides actionable recommendations for improvement.\n\n`;

    // Analysis Results
    if (aggregatedReport.agentResults.analysis) {
      content += `## Analysis Results\n\n`;
      aggregatedReport.agentResults.analysis.forEach((result, index) => {
        content += `### Analysis Agent ${index + 1}: ${result.description}\n\n`;
        content += `${result.output}\n\n`;
      });
    }

    // Key Findings
    content += `## Key Findings\n\n`;
    content += this.extractKeyFindings(aggregatedReport.agentResults.analysis || []);

    // Issues and Opportunities
    content += `## Issues and Opportunities\n\n`;
    content += this.extractIssuesAndOpportunities(aggregatedReport.agentResults.analysis || []);

    // Recommendations
    content += this.formatRecommendations(aggregatedReport.recommendations);

    // Implementation Priority
    content += `## Implementation Priority\n\n`;
    content += `Based on the analysis, the following priority order is recommended:\n\n`;
    content += `1. **Critical Issues**: Address immediately to prevent system failures\n`;
    content += `2. **High Impact**: Implement for significant improvements\n`;
    content += `3. **Medium Impact**: Schedule for next development cycle\n`;
    content += `4. **Low Impact**: Consider for future enhancement\n\n`;

    // Next Steps
    content += this.formatNextSteps(aggregatedReport.nextSteps);

    // Footer
    content += `\n---\n\n`;
    content += `*Analysis compiled by EchoContext Factory Multi-Agent System*\n`;
    content += `*Task: ${taskDescription}*\n`;
    content += `*Generated: ${aggregatedReport.timestamp}*\n`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Analysis report saved: ${filename}`);
    
    return { filename, filepath, type: 'analysis' };
  }

  /**
   * Generate implementation-focused report
   */
  generateImplementationReport(aggregatedReport, taskDescription) {
    const filename = this.generateFilename(taskDescription, 'implementation');
    const filepath = path.join(this.outputDir, filename);
    
    let content = `# Implementation Guide: ${taskDescription}\n\n`;
    content += `**Generated**: ${aggregatedReport.timestamp}\n`;
    content += `**Implementation Agents**: ${aggregatedReport.summary.totalAgents}\n`;
    content += `**Success Rate**: ${aggregatedReport.summary.completionRate}%\n\n`;

    // Executive Summary
    content += `## Executive Summary\n\n`;
    content += `This implementation guide provides comprehensive technical guidance for "${taskDescription}". `;
    content += `The implementation was designed by ${aggregatedReport.summary.totalAgents} specialized agents and includes code examples, best practices, and deployment instructions.\n\n`;

    // Implementation Results
    if (aggregatedReport.agentResults.implementation) {
      content += `## Implementation Details\n\n`;
      aggregatedReport.agentResults.implementation.forEach((result, index) => {
        content += `### Implementation Agent ${index + 1}: ${result.description}\n\n`;
        content += `${result.output}\n\n`;
      });
    }

    // Technical Specifications
    content += `## Technical Specifications\n\n`;
    content += this.extractTechnicalSpecs(aggregatedReport.agentResults.implementation || []);

    // Code Examples
    content += `## Code Examples\n\n`;
    content += this.extractCodeExamples(aggregatedReport.agentResults.implementation || []);

    // Deployment Instructions
    content += `## Deployment Instructions\n\n`;
    content += this.extractDeploymentInstructions(aggregatedReport.agentResults.implementation || []);

    // Testing Guidelines
    content += `## Testing Guidelines\n\n`;
    content += `Before deploying the implementation:\n\n`;
    content += `1. **Unit Tests**: Verify individual components function correctly\n`;
    content += `2. **Integration Tests**: Ensure components work together\n`;
    content += `3. **Performance Tests**: Validate performance requirements\n`;
    content += `4. **Security Tests**: Check for vulnerabilities\n\n`;

    // Recommendations
    content += this.formatRecommendations(aggregatedReport.recommendations);

    // Next Steps
    content += this.formatNextSteps(aggregatedReport.nextSteps);

    // Footer
    content += `\n---\n\n`;
    content += `*Implementation guide compiled by EchoContext Factory Multi-Agent System*\n`;
    content += `*Task: ${taskDescription}*\n`;
    content += `*Generated: ${aggregatedReport.timestamp}*\n`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Implementation guide saved: ${filename}`);
    
    return { filename, filepath, type: 'implementation' };
  }

  /**
   * Generate validation-focused report
   */
  generateValidationReport(aggregatedReport, taskDescription) {
    const filename = this.generateFilename(taskDescription, 'validation');
    const filepath = path.join(this.outputDir, filename);
    
    let content = `# Validation Report: ${taskDescription}\n\n`;
    content += `**Generated**: ${aggregatedReport.timestamp}\n`;
    content += `**Validation Agents**: ${aggregatedReport.summary.totalAgents}\n`;
    content += `**Success Rate**: ${aggregatedReport.summary.completionRate}%\n\n`;

    // Executive Summary
    content += `## Executive Summary\n\n`;
    content += `This validation report presents comprehensive quality assurance findings for "${taskDescription}". `;
    content += `The validation was performed by ${aggregatedReport.summary.totalAgents} specialized agents and provides detailed test results, quality metrics, and remediation recommendations.\n\n`;

    // Validation Results
    if (aggregatedReport.agentResults.validation) {
      content += `## Validation Results\n\n`;
      aggregatedReport.agentResults.validation.forEach((result, index) => {
        content += `### Validation Agent ${index + 1}: ${result.description}\n\n`;
        content += `${result.output}\n\n`;
      });
    }

    // Test Results Summary
    content += `## Test Results Summary\n\n`;
    content += this.extractTestResults(aggregatedReport.agentResults.validation || []);

    // Quality Metrics
    content += `## Quality Metrics\n\n`;
    content += this.extractQualityMetrics(aggregatedReport.agentResults.validation || []);

    // Issues Found
    content += `## Issues Found\n\n`;
    content += this.extractValidationIssues(aggregatedReport.agentResults.validation || []);

    // Recommendations
    content += this.formatRecommendations(aggregatedReport.recommendations);

    // Remediation Plan
    content += `## Remediation Plan\n\n`;
    content += `Based on validation findings, the following remediation steps are recommended:\n\n`;
    aggregatedReport.nextSteps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });
    content += `\n`;

    // Footer
    content += `\n---\n\n`;
    content += `*Validation report compiled by EchoContext Factory Multi-Agent System*\n`;
    content += `*Task: ${taskDescription}*\n`;
    content += `*Generated: ${aggregatedReport.timestamp}*\n`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Validation report saved: ${filename}`);
    
    return { filename, filepath, type: 'validation' };
  }

  /**
   * Generate comprehensive report for mixed agent types
   */
  generateComprehensiveReport(aggregatedReport, taskDescription) {
    const filename = this.generateFilename(taskDescription, 'comprehensive');
    const filepath = path.join(this.outputDir, filename);
    
    let content = `# Comprehensive Report: ${taskDescription}\n\n`;
    content += `**Generated**: ${aggregatedReport.timestamp}\n`;
    content += `**Total Agents**: ${aggregatedReport.summary.totalAgents}\n`;
    content += `**Agent Types**: ${aggregatedReport.summary.agentTypes.join(', ')}\n`;
    content += `**Success Rate**: ${aggregatedReport.summary.completionRate}%\n\n`;

    // Executive Summary
    content += `## Executive Summary\n\n`;
    content += `This comprehensive report combines findings from ${aggregatedReport.summary.totalAgents} specialized agents `;
    content += `(${aggregatedReport.summary.agentTypes.join(', ')}) working on "${taskDescription}". `;
    content += `The multi-agent approach provides complete coverage from research through implementation and validation.\n\n`;

    // Results by Agent Type
    for (const [agentType, results] of Object.entries(aggregatedReport.agentResults)) {
      content += `## ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Results\n\n`;
      results.forEach((result, index) => {
        content += `### ${agentType} Agent ${index + 1}: ${result.description}\n\n`;
        content += `${result.output}\n\n`;
      });
    }

    // Integrated Findings
    content += `## Integrated Findings\n\n`;
    content += this.generateIntegratedFindings(aggregatedReport.agentResults);

    // Recommendations
    content += this.formatRecommendations(aggregatedReport.recommendations);

    // Next Steps
    content += this.formatNextSteps(aggregatedReport.nextSteps);

    // Footer
    content += `\n---\n\n`;
    content += `*Comprehensive report compiled by EchoContext Factory Multi-Agent System*\n`;
    content += `*Task: ${taskDescription}*\n`;
    content += `*Generated: ${aggregatedReport.timestamp}*\n`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Comprehensive report saved: ${filename}`);
    
    return { filename, filepath, type: 'comprehensive' };
  }

  /**
   * Generate general report for unspecified task types
   */
  generateGeneralReport(aggregatedReport, taskDescription) {
    const filename = this.generateFilename(taskDescription, 'results');
    const filepath = path.join(this.outputDir, filename);
    
    let content = `# Multi-Agent Results: ${taskDescription}\n\n`;
    content += `**Generated**: ${aggregatedReport.timestamp}\n`;
    content += `**Total Agents**: ${aggregatedReport.summary.totalAgents}\n`;
    content += `**Success Rate**: ${aggregatedReport.summary.completionRate}%\n\n`;

    // Executive Summary
    content += `## Executive Summary\n\n`;
    content += `This report presents results from ${aggregatedReport.summary.totalAgents} agents working on "${taskDescription}". `;
    content += `The multi-agent approach achieved a ${aggregatedReport.summary.completionRate}% success rate.\n\n`;

    // Agent Results
    for (const [agentType, results] of Object.entries(aggregatedReport.agentResults)) {
      content += `## ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Results\n\n`;
      results.forEach((result, index) => {
        content += `### ${agentType} Agent ${index + 1}: ${result.description}\n\n`;
        content += `${result.output}\n\n`;
      });
    }

    // Recommendations
    content += this.formatRecommendations(aggregatedReport.recommendations);

    // Next Steps
    content += this.formatNextSteps(aggregatedReport.nextSteps);

    // Footer
    content += `\n---\n\n`;
    content += `*Results compiled by EchoContext Factory Multi-Agent System*\n`;
    content += `*Task: ${taskDescription}*\n`;
    content += `*Generated: ${aggregatedReport.timestamp}*\n`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ General report saved: ${filename}`);
    
    return { filename, filepath, type: 'general' };
  }

  /**
   * Generate appropriate filename based on task and type
   */
  generateFilename(taskDescription, type) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const cleanDescription = taskDescription
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40);
    
    return `${type}-${cleanDescription}-${timestamp}.md`;
  }

  /**
   * Extract key insights from research results
   */
  extractKeyInsights(results) {
    let insights = '';
    results.forEach((result, index) => {
      insights += `- **Insight ${index + 1}**: Key findings from ${result.description}\n`;
    });
    return insights || '- No specific insights extracted\n';
  }

  /**
   * Extract references from research results
   */
  extractReferences(results) {
    let references = '';
    results.forEach((result, index) => {
      references += `- **Source ${index + 1}**: References from ${result.description}\n`;
    });
    return references || '- No references available\n';
  }

  /**
   * Extract key findings from analysis results
   */
  extractKeyFindings(results) {
    let findings = '';
    results.forEach((result, index) => {
      findings += `- **Finding ${index + 1}**: Analysis results from ${result.description}\n`;
    });
    return findings || '- No specific findings extracted\n';
  }

  /**
   * Extract issues and opportunities from analysis results
   */
  extractIssuesAndOpportunities(results) {
    let content = '';
    content += `### Issues Identified\n\n`;
    content += `- Issues will be extracted from agent outputs\n\n`;
    content += `### Opportunities Identified\n\n`;
    content += `- Opportunities will be extracted from agent outputs\n\n`;
    return content;
  }

  /**
   * Extract technical specifications from implementation results
   */
  extractTechnicalSpecs(results) {
    let specs = '';
    results.forEach((result, index) => {
      specs += `- **Spec ${index + 1}**: Technical details from ${result.description}\n`;
    });
    return specs || '- No technical specifications available\n';
  }

  /**
   * Extract code examples from implementation results
   */
  extractCodeExamples(results) {
    let examples = '';
    results.forEach((result, index) => {
      examples += `### Code Example ${index + 1}\n\n`;
      examples += `From ${result.description}:\n\n`;
      examples += `\`\`\`\n`;
      examples += `// Code examples will be extracted from agent outputs\n`;
      examples += `\`\`\`\n\n`;
    });
    return examples || '### No Code Examples Available\n\n';
  }

  /**
   * Extract deployment instructions from implementation results
   */
  extractDeploymentInstructions(results) {
    let instructions = '';
    instructions += `1. **Preparation**: Ensure all dependencies are installed\n`;
    instructions += `2. **Configuration**: Update configuration files as needed\n`;
    instructions += `3. **Deployment**: Follow deployment procedures from agent outputs\n`;
    instructions += `4. **Verification**: Verify successful deployment\n\n`;
    return instructions;
  }

  /**
   * Extract test results from validation results
   */
  extractTestResults(results) {
    let testResults = '';
    testResults += `- **Total Tests**: Information extracted from validation agents\n`;
    testResults += `- **Passed**: Success metrics from validation\n`;
    testResults += `- **Failed**: Failure metrics from validation\n`;
    testResults += `- **Coverage**: Coverage metrics from validation\n\n`;
    return testResults;
  }

  /**
   * Extract quality metrics from validation results
   */
  extractQualityMetrics(results) {
    let metrics = '';
    metrics += `- **Code Quality**: Metrics from validation agents\n`;
    metrics += `- **Performance**: Performance metrics from validation\n`;
    metrics += `- **Security**: Security assessment from validation\n`;
    metrics += `- **Maintainability**: Maintainability metrics from validation\n\n`;
    return metrics;
  }

  /**
   * Extract validation issues from validation results
   */
  extractValidationIssues(results) {
    let issues = '';
    results.forEach((result, index) => {
      issues += `- **Issue ${index + 1}**: Issues found by ${result.description}\n`;
    });
    return issues || '- No validation issues identified\n';
  }

  /**
   * Generate integrated findings from mixed agent results
   */
  generateIntegratedFindings(agentResults) {
    let findings = '';
    findings += `The multi-agent approach provides comprehensive coverage:\n\n`;
    
    if (agentResults.research) {
      findings += `- **Research**: ${agentResults.research.length} research agent(s) provided foundational information\n`;
    }
    if (agentResults.analysis) {
      findings += `- **Analysis**: ${agentResults.analysis.length} analysis agent(s) identified key issues and opportunities\n`;
    }
    if (agentResults.implementation) {
      findings += `- **Implementation**: ${agentResults.implementation.length} implementation agent(s) provided technical solutions\n`;
    }
    if (agentResults.validation) {
      findings += `- **Validation**: ${agentResults.validation.length} validation agent(s) ensured quality and correctness\n`;
    }
    
    findings += `\nThis integrated approach ensures comprehensive coverage from research through implementation and validation.\n\n`;
    return findings;
  }

  /**
   * Format recommendations section
   */
  formatRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '';
    }

    let content = `## Recommendations\n\n`;
    recommendations.forEach(rec => {
      content += `### ${rec.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${rec.priority})\n\n`;
      content += `${rec.message}\n\n`;
    });
    return content;
  }

  /**
   * Format next steps section
   */
  formatNextSteps(nextSteps) {
    if (!nextSteps || nextSteps.length === 0) {
      return '';
    }

    let content = `## Next Steps\n\n`;
    nextSteps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });
    content += `\n`;
    return content;
  }
}

module.exports = { FileGenerator };