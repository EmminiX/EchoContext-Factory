#!/usr/bin/env node

/**
 * Interactive Question Handler for EchoContext Factory
 * Manages the Claude Code interactive question flow for start-project
 */

const { QuestionEngine } = require('./question-engine');
const { ResearchEngine } = require('./research-engine');
const { TemplateProcessor } = require('./template-processor');
const { ContextAssembler } = require('./context-assembler');

class InteractiveQuestionHandler {
  constructor() {
    this.questionEngine = new QuestionEngine();
    this.researchEngine = new ResearchEngine();
    this.templateProcessor = new TemplateProcessor();
    this.contextAssembler = new ContextAssembler();
    this.answers = {};
    this.currentQuestionNumber = 1;
  }

  /**
   * Start the question flow and return first question
   */
  startFlow() {
    this.questionEngine.startFlow('base');
    const questionResult = this.questionEngine.getNextQuestion();
    return this.formatQuestionForDisplay(questionResult);
  }

  /**
   * Process an answer and get the next question
   */
  processAnswer(answer, questionId = null) {
    // If questionId is provided, ensure we're on the right question
    if (questionId) {
      const currentFlow = this.questionEngine.currentFlow;
      const currentIndex = this.questionEngine.currentQuestion;
      if (currentFlow[currentIndex] !== questionId) {
        return { error: `Expected answer for ${currentFlow[currentIndex]}, but received answer for ${questionId}` };
      }
    }

    // Process the answer
    const result = this.questionEngine.processAnswer(answer);
    
    if (result.error) {
      return result;
    }

    // If flow is complete, finalize context
    if (result.complete) {
      return {
        complete: true,
        context: result.context,
        message: '✅ All questions completed! Ready to proceed with MCP research and documentation generation.'
      };
    }

    // Format next question for display
    return this.formatQuestionForDisplay(result);
  }

  /**
   * Format question for consistent display in Claude Code
   */
  formatQuestionForDisplay(questionResult) {
    if (questionResult.error) {
      return questionResult;
    }

    if (questionResult.complete) {
      return questionResult;
    }

    const progress = questionResult.progress || { current: 1, total: 9, percentage: 11 };
    const formattedQuestion = {
      questionId: questionResult.questionId,
      question: questionResult.question,
      type: questionResult.type,
      progress: progress,
      required: questionResult.required,
      placeholder: questionResult.placeholder,
      validation: questionResult.validation
    };

    // Format options for select questions
    if (questionResult.type === 'select' && questionResult.options) {
      formattedQuestion.options = questionResult.options.map((option, index) => ({
        letter: String.fromCharCode(65 + index), // A, B, C, etc.
        value: option.value,
        label: option.label,
        display: `${String.fromCharCode(65 + index)}) ${option.label}`
      }));
    }

    return formattedQuestion;
  }

  /**
   * Generate display text for a question
   */
  generateQuestionDisplay(questionData) {
    const progress = questionData.progress;
    const progressBar = this.generateProgressBar(progress.percentage);
    
    let display = `\n## 📋 Setup Phase ${Math.ceil(progress.current / 3)}: Question ${progress.current} of ${progress.total}\n\n`;
    display += `📊 Progress: ${progressBar} ${progress.percentage}% Complete\n\n`;
    display += `**${questionData.question}**\n\n`;

    if (questionData.type === 'select' && questionData.options) {
      display += `Please choose the option that best matches your vision:\n\n`;
      questionData.options.forEach(option => {
        display += `${option.display}\n`;
      });
      display += `\n`;
    } else if (questionData.type === 'textarea') {
      if (questionData.placeholder) {
        display += `*${questionData.placeholder}*\n\n`;
      }
      display += `Please provide your detailed description:\n\n`;
    } else {
      if (questionData.placeholder) {
        display += `*Placeholder: ${questionData.placeholder}*\n\n`;
      }
    }

    return display;
  }

  /**
   * Generate ASCII progress bar
   */
  generateProgressBar(percentage) {
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Get current question state for debugging
   */
  getCurrentState() {
    return {
      currentQuestion: this.questionEngine.currentQuestion,
      totalQuestions: this.questionEngine.currentFlow.length,
      answers: this.questionEngine.answers,
      currentFlow: this.questionEngine.currentFlow
    };
  }

  /**
   * Convert letter answer (A, B, C) to option value
   */
  convertLetterToValue(letter, questionData) {
    if (!questionData.options) {
      return letter; // Not a select question
    }

    const upperLetter = letter.toUpperCase();
    const option = questionData.options.find(opt => opt.letter === upperLetter);
    return option ? option.value : letter;
  }

  /**
   * Execute research phase after questions complete
   */
  async executeResearch(context) {
    console.log('\n🧠 **Phase 3: Comprehensive MCP Research & Context Assembly** 🔍');
    console.log('📊 Progress: [██████░░░░] 60% Complete (Phase 3 of 5)');
    
    try {
      const researchResults = await this.researchEngine.executeResearch(context);
      const enrichedContext = this.contextAssembler.assembleContext({
        ...context,
        research: researchResults,
        researchResults: researchResults
      });
      
      return enrichedContext;
    } catch (error) {
      console.warn('⚠️ MCP research encountered issues:', error.message);
      return this.contextAssembler.assembleContext(context);
    }
  }

  /**
   * Generate documentation phase
   */
  async generateDocumentation(context) {
    console.log('\n📝 **Phase 4: MCP-Enhanced Documentation Generation** 📄');
    console.log('📊 Progress: [████████░░] 80% Complete (Phase 4 of 5)');
    
    const documents = [
      { name: 'CLAUDE.md', template: 'CLAUDE.md', description: 'Complete project context' },
      { name: 'PRD.md', template: 'PRD.md', description: 'Product requirements document' },
      { name: 'TASKS.md', template: 'TASKS.md', description: 'Implementation task breakdown' }
    ];
    
    const results = [];
    
    for (const doc of documents) {
      try {
        const content = this.templateProcessor.processTemplate(doc.template, context);
        results.push({
          name: doc.name,
          content: content,
          description: doc.description,
          success: true
        });
      } catch (error) {
        results.push({
          name: doc.name,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }
}

module.exports = { InteractiveQuestionHandler };

// Allow running directly for testing
if (require.main === module) {
  const handler = new InteractiveQuestionHandler();
  const firstQuestion = handler.startFlow();
  console.log(JSON.stringify(firstQuestion, null, 2));
}