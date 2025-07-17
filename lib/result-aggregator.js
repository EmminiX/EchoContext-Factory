#!/usr/bin/env node

/**
 * Result Aggregator for Multi-Agent Task Coordination
 * Handles collection, merging, and formatting of agent outputs
 */

const fs = require('fs');
const path = require('path');

class ResultAggregator {
  constructor() {
    this.results = [];
    this.errors = [];
    this.summary = {};
  }

  /**
   * Add agent result to the aggregator
   */
  addResult(agentResult) {
    if (agentResult.success) {
      this.results.push(agentResult);
    } else {
      this.errors.push(agentResult);
    }
  }

  /**
   * Generate comprehensive aggregated report
   */
  generateAggregatedReport(taskDescription, taskType = 'general') {
    const report = {
      taskDescription: taskDescription,
      taskType: taskType,
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      agentResults: this.organizeResultsByType(),
      errors: this.errors,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(taskType)
    };

    return report;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const agentTypes = new Set(this.results.map(r => r.agentType));
    const totalOutputLength = this.results.reduce((sum, r) => sum + (r.output?.length || 0), 0);
    
    return {
      totalAgents: this.results.length,
      failedAgents: this.errors.length,
      agentTypes: Array.from(agentTypes),
      totalOutputLength: totalOutputLength,
      averageOutputLength: Math.round(totalOutputLength / Math.max(this.results.length, 1)),
      completionRate: Math.round((this.results.length / (this.results.length + this.errors.length)) * 100)
    };
  }

  /**
   * Organize results by agent type
   */
  organizeResultsByType() {
    const organized = {};
    
    this.results.forEach(result => {
      if (!organized[result.agentType]) {
        organized[result.agentType] = [];
      }
      organized[result.agentType].push(result);
    });

    return organized;
  }

  /**
   * Generate recommendations based on results
   */
  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();

    // Error-based recommendations
    if (this.errors.length > 0) {
      recommendations.push({
        type: 'error_handling',
        priority: 'high',
        message: `${this.errors.length} agent(s) failed. Review errors and consider retry or alternative approaches.`,
        details: this.errors.map(e => ({ agent: e.agentType, error: e.error }))
      });
    }

    // Completion rate recommendations
    if (summary.completionRate < 80) {
      recommendations.push({
        type: 'quality_concern',
        priority: 'high',
        message: `Low completion rate (${summary.completionRate}%). Consider task simplification or agent optimization.`
      });
    }

    // Agent type coverage recommendations
    const hasResearch = summary.agentTypes.includes('research');
    const hasImplementation = summary.agentTypes.includes('implementation');
    const hasValidation = summary.agentTypes.includes('validation');

    if (hasResearch && hasImplementation && !hasValidation) {
      recommendations.push({
        type: 'workflow',
        priority: 'medium',
        message: 'Research and implementation complete. Consider adding validation phase.'
      });
    }

    if (hasImplementation && !hasValidation) {
      recommendations.push({
        type: 'quality_assurance',
        priority: 'medium',
        message: 'Implementation complete. Quality validation recommended before deployment.'
      });
    }

    // Output quality recommendations
    if (summary.averageOutputLength < 500) {
      recommendations.push({
        type: 'output_quality',
        priority: 'low',
        message: 'Agent outputs are relatively short. Consider requesting more detailed analysis.'
      });
    }

    return recommendations;
  }

  /**
   * Generate next steps based on task type
   */
  generateNextSteps(taskType) {
    const steps = [];
    const summary = this.generateSummary();

    switch (taskType.toLowerCase()) {
      case 'research':
        steps.push('Review research findings and identify key insights');
        steps.push('Validate information against multiple sources');
        steps.push('Create implementation plan based on research');
        steps.push('Consider additional research if gaps are identified');
        break;

      case 'analysis':
        steps.push('Review analysis findings and prioritize issues');
        steps.push('Create action plan for identified improvements');
        steps.push('Implement recommended changes');
        steps.push('Validate changes through testing');
        break;

      case 'implementation':
        steps.push('Review implementation results and test functionality');
        steps.push('Validate against requirements and best practices');
        steps.push('Deploy to appropriate environment');
        steps.push('Monitor performance and gather feedback');
        break;

      case 'validation':
        steps.push('Review validation results and address any issues');
        steps.push('Update implementation based on validation feedback');
        steps.push('Re-run validation if significant changes made');
        steps.push('Document validation outcomes and decisions');
        break;

      default:
        steps.push('Review all agent outputs for completeness');
        steps.push('Identify any gaps or inconsistencies');
        steps.push('Implement recommended solutions');
        steps.push('Test and validate final results');
        break;
    }

    return steps;
  }

  /**
   * Generate markdown report based on task type
   */
  generateMarkdownReport(taskDescription, taskType = 'general') {
    const report = this.generateAggregatedReport(taskDescription, taskType);
    let markdown = '';

    // Header
    markdown += `# Multi-Agent Task Results: ${taskDescription}\n\n`;
    markdown += `**Task Type**: ${taskType}\n`;
    markdown += `**Generated**: ${report.timestamp}\n`;
    markdown += `**Completion Rate**: ${report.summary.completionRate}%\n\n`;

    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Total Agents**: ${report.summary.totalAgents}\n`;
    markdown += `- **Failed Agents**: ${report.summary.failedAgents}\n`;
    markdown += `- **Agent Types**: ${report.summary.agentTypes.join(', ')}\n`;
    markdown += `- **Total Output**: ${report.summary.totalOutputLength} characters\n\n`;

    // Agent Results
    markdown += `## Agent Results\n\n`;
    
    for (const [agentType, results] of Object.entries(report.agentResults)) {
      markdown += `### ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent Results\n\n`;
      
      results.forEach((result, index) => {
        markdown += `#### ${agentType} Agent ${index + 1}\n\n`;
        markdown += `**Description**: ${result.description}\n\n`;
        
        if (result.output) {
          markdown += `**Output**:\n\n`;
          markdown += `${result.output}\n\n`;
        }
        
        if (result.phase) {
          markdown += `**Execution Phase**: ${result.phase}\n\n`;
        }
        
        markdown += `---\n\n`;
      });
    }

    // Errors
    if (report.errors.length > 0) {
      markdown += `## Errors and Issues\n\n`;
      report.errors.forEach(error => {
        markdown += `- **${error.agentType}**: ${error.error}\n`;
      });
      markdown += `\n`;
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `### ${rec.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} (${rec.priority})\n\n`;
        markdown += `${rec.message}\n\n`;
        
        if (rec.details) {
          markdown += `**Details**:\n`;
          rec.details.forEach(detail => {
            markdown += `- ${detail.agent}: ${detail.error}\n`;
          });
          markdown += `\n`;
        }
      });
    }

    // Next Steps
    if (report.nextSteps.length > 0) {
      markdown += `## Next Steps\n\n`;
      report.nextSteps.forEach((step, index) => {
        markdown += `${index + 1}. ${step}\n`;
      });
      markdown += `\n`;
    }

    // Footer
    markdown += `---\n\n`;
    markdown += `*Generated by EchoContext Factory Multi-Agent System*\n`;
    markdown += `*Task Type: ${taskType} | Completion: ${report.summary.completionRate}%*\n`;
    markdown += `*${report.timestamp}*\n`;

    return markdown;
  }

  /**
   * Save aggregated results to file
   */
  saveResultsToFile(taskDescription, taskType, outputPath) {
    try {
      const markdown = this.generateMarkdownReport(taskDescription, taskType);
      const filename = this.generateFilename(taskDescription, taskType);
      const fullPath = path.join(outputPath, filename);
      
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, markdown, 'utf8');
      console.log(`✅ Results saved to: ${fullPath}`);
      
      return fullPath;
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
      return null;
    }
  }

  /**
   * Generate appropriate filename based on task type
   */
  generateFilename(taskDescription, taskType) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const cleanDescription = taskDescription
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);
    
    return `${taskType}-${cleanDescription}-${timestamp}.md`;
  }

  /**
   * Generate task-specific report based on agent types
   */
  generateTaskSpecificReport(taskDescription) {
    const summary = this.generateSummary();
    const agentTypes = summary.agentTypes;
    
    // Determine task type based on agent types
    let taskType = 'general';
    if (agentTypes.includes('research') && agentTypes.length === 1) {
      taskType = 'research';
    } else if (agentTypes.includes('analysis') && agentTypes.length === 1) {
      taskType = 'analysis';
    } else if (agentTypes.includes('implementation')) {
      taskType = 'implementation';
    } else if (agentTypes.includes('validation') && agentTypes.length === 1) {
      taskType = 'validation';
    }

    return this.generateMarkdownReport(taskDescription, taskType);
  }

  /**
   * Validate result quality and completeness
   */
  validateResults() {
    const validation = {
      isValid: true,
      issues: [],
      score: 100
    };

    // Check for minimum content
    if (this.results.length === 0) {
      validation.isValid = false;
      validation.issues.push('No successful agent results');
      validation.score -= 50;
    }

    // Check for excessive errors
    const errorRate = this.errors.length / (this.results.length + this.errors.length);
    if (errorRate > 0.5) {
      validation.issues.push(`High error rate: ${Math.round(errorRate * 100)}%`);
      validation.score -= 30;
    }

    // Check for output quality
    const avgOutputLength = this.results.reduce((sum, r) => sum + (r.output?.length || 0), 0) / Math.max(this.results.length, 1);
    if (avgOutputLength < 200) {
      validation.issues.push('Agent outputs are very short');
      validation.score -= 20;
    }

    // Check for agent diversity
    const agentTypes = new Set(this.results.map(r => r.agentType));
    if (agentTypes.size < 2 && this.results.length > 1) {
      validation.issues.push('All agents are the same type');
      validation.score -= 15;
    }

    validation.score = Math.max(0, validation.score);
    return validation;
  }

  /**
   * Reset aggregator for new task
   */
  reset() {
    this.results = [];
    this.errors = [];
    this.summary = {};
  }
}

module.exports = { ResultAggregator };