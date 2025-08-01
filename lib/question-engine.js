#!/usr/bin/env node

/**
 * Question Engine for EchoContext Factory
 * Handles dynamic question flows, answer validation, and context building
 */

const fs = require('fs');
const path = require('path');
const { Validator } = require('./validation');

class QuestionEngine {
  constructor(questionsPath = '~/.claude/data/questions.json') {
    this.validator = new Validator();
    this.questionsPath = questionsPath.replace(/^~/, process.env.HOME);
    this.questions = this.loadQuestions();
    this.context = {};
    this.currentFlow = [];
    this.currentQuestion = 0;
    this.answers = {};
  }

  loadQuestions() {
    try {
      const questionsData = fs.readFileSync(this.questionsPath, 'utf8');
      return JSON.parse(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error.message);
      return this.getDefaultQuestions();
    }
  }

  getDefaultQuestions() {
    return {
      categories: {
        project_basics: {
          questions: [
            {
              id: 'project_name',
              type: 'text',
              required: true,
              question: 'What is the name of your project?',
              validation: { minLength: 1, maxLength: 50 }
            },
            {
              id: 'project_type',
              type: 'select',
              required: true,
              question: 'What type of project are you building?',
              options: [
                { value: 'webapp', label: 'Web Application' },
                { value: 'api', label: 'API/Backend Service' },
                { value: 'cli', label: 'Command Line Tool' }
              ]
            }
          ]
        }
      },
      flows: {
        webapp: ['project_name', 'project_type'],
        api: ['project_name', 'project_type'],
        cli: ['project_name', 'project_type']
      }
    };
  }

  /**
   * Starts a new question flow with adaptive questioning (max 9 questions)
   */
  startFlow(projectType = 'base') {
    // Always start with the base 3 questions: name, description, type
    this.currentFlow = [...this.questions.flows.base];
    this.currentQuestion = 0;
    this.answers = {};
    this.context = { projectType };
    this.adaptiveQuestionsSelected = false;
    
    return this.getNextQuestion();
  }

  /**
   * Gets the next question in the adaptive flow (max 9 questions)
   */
  getNextQuestion() {
    // After project_type question (question 3), select adaptive questions
    if (this.currentQuestion === 3 && !this.adaptiveQuestionsSelected) {
      this.selectAdaptiveQuestions();
    }

    if (this.currentQuestion >= this.currentFlow.length) {
      console.log('✅ Question flow complete - all questions answered');
      return { complete: true, context: this.buildContext() };
    }

    const questionId = this.currentFlow[this.currentQuestion];
    const question = this.findQuestion(questionId);
    
    if (!question) {
      console.warn(`Question not found: ${questionId}`);
      this.currentQuestion++;
      return this.getNextQuestion();
    }

    return {
      complete: false,
      questionId,
      question: question.question,
      type: question.type,
      options: question.options,
      formattedOptions: question.options ? this.formatOptionsForDisplay(question.options) : null,
      required: question.required,
      placeholder: question.placeholder,
      validation: question.validation,
      progress: {
        current: this.currentQuestion + 1,
        total: 9, // Always 9 questions for consistent progress
        percentage: Math.round((this.currentQuestion + 1) * 11.11) // Fixed 11% increments for 9 questions
      }
    };
  }

  /**
   * Processes an answer and moves to the next question
   */
  processAnswer(answer) {
    if (this.currentQuestion >= this.currentFlow.length) {
      return { error: 'No active question to answer' };
    }

    const questionId = this.currentFlow[this.currentQuestion];
    const question = this.findQuestion(questionId);
    
    if (!question) {
      return { error: `Question not found: ${questionId}` };
    }

    // Validate the answer
    const validation = this.validator.validateInput(answer, question.type, question.validation);
    if (!validation.valid) {
      return { 
        error: validation.reason,
        code: validation.code,
        retry: true 
      };
    }

    // Store the answer
    this.answers[questionId] = answer;
    
    // Move to next question
    this.currentQuestion++;
    
    return this.getNextQuestion();
  }

  /**
   * Selects adaptive questions based on project type and description
   */
  selectAdaptiveQuestions() {
    const projectType = this.answers.project_type || 'webapp';
    const projectDescription = this.answers.project_description || '';
    
    // Get base adaptive questions for the project type
    const availableQuestions = this.questions.adaptive_questions[projectType] || this.questions.adaptive_questions.webapp;
    
    // Select up to 6 additional questions (total 9: name, description, type + 6 adaptive)
    const selectedQuestions = this.intelligentQuestionSelection(projectDescription, availableQuestions);
    
    // Add selected questions to the flow
    this.currentFlow.push(...selectedQuestions);
    this.adaptiveQuestionsSelected = true;
    
    console.log(`🧠 Selected ${selectedQuestions.length} adaptive questions based on project type: ${projectType}`);
  }

  /**
   * Intelligently selects questions based on project description keywords
   */
  intelligentQuestionSelection(description, availableQuestions) {
    const descriptionLower = description.toLowerCase();
    const selectedQuestions = [];
    
    // Priority mapping based on keywords in description
    const keywordPriority = {
      'user': ['target_audience'],
      'auth': ['authentication'],
      'database': ['database'],
      'mobile': ['mobile_platform'],
      'web': ['frontend_framework', 'backend_framework'],
      'api': ['backend_framework', 'authentication'],
      'secure': ['security_level', 'authentication'],
      'test': ['testing_framework'],
      'deploy': ['deployment_target'],
      'enterprise': ['security_level', 'documentation_level'],
      'scale': ['backend_framework', 'database']
    };
    
    // Add questions based on keyword matches
    for (const [keyword, questions] of Object.entries(keywordPriority)) {
      if (descriptionLower.includes(keyword)) {
        for (const question of questions) {
          if (availableQuestions.includes(question) && !selectedQuestions.includes(question)) {
            selectedQuestions.push(question);
          }
        }
      }
    }
    
    // Fill remaining slots with default questions for the project type
    for (const question of availableQuestions) {
      if (selectedQuestions.length >= 6) break; // Max 6 adaptive questions
      if (!selectedQuestions.includes(question)) {
        selectedQuestions.push(question);
      }
    }
    
    return selectedQuestions.slice(0, 6); // Ensure max 6 questions
  }

  /**
   * Finds a question by ID across all categories
   */
  findQuestion(questionId) {
    for (const category of Object.values(this.questions.categories)) {
      const question = category.questions.find(q => q.id === questionId);
      if (question) {
        return question;
      }
    }
    return null;
  }

  /**
   * Builds the final context from all answers
   */
  buildContext() {
    const context = {
      ...this.context,
      answers: this.answers,
      metadata: {
        timestamp: new Date().toISOString(),
        version: this.questions.version || '1.0.0',
        completedQuestions: this.currentQuestion
      }
    };

    // Extract key information
    context.projectName = this.answers.project_name || 'Unnamed Project';
    context.projectType = this.answers.project_type || 'webapp';
    context.projectDescription = this.answers.project_description || '';
    context.projectVision = this.answers.project_description || ''; // Use description as vision since it's comprehensive
    
    // Build tech stack information
    context.techStack = this.buildTechStack();
    
    // Build feature list
    context.features = this.buildFeatureList();
    
    // Build security requirements
    context.security = this.buildSecurityRequirements();

    // Add additional context for research
    context.targetAudience = this.answers.target_audience || 'general';
    context.projectScope = this.answers.project_scope || 'mvp';
    context.aiIntegration = this.answers.ai_integration || 'none';
    context.performanceRequirements = this.answers.performance_requirements || 'basic';
    context.documentationLevel = this.answers.documentation_level || 'standard';

    return context;
  }

  /**
   * Builds tech stack information from answers
   */
  buildTechStack() {
    const techStack = {
      frontend: this.answers.frontend_framework || 'none',
      backend: this.answers.backend_framework || 'none',
      database: this.answers.database || 'none',
      language: this.answers.language || 'javascript',
      packageManager: this.answers.package_manager || 'npm',
      testing: this.answers.testing_framework || 'jest',
      styling: this.answers.styling_approach || 'css'
    };

    return techStack;
  }

  /**
   * Builds feature list from answers
   */
  buildFeatureList() {
    const features = [];
    
    if (this.answers.authentication && this.answers.authentication !== 'none') {
      features.push(`Authentication (${this.answers.authentication})`);
    }
    
    if (this.answers.database && this.answers.database !== 'none') {
      features.push(`Database integration (${this.answers.database})`);
    }
    
    if (this.answers.testing_framework && this.answers.testing_framework !== 'none') {
      features.push(`Testing framework (${this.answers.testing_framework})`);
    }

    if (this.answers.ai_integration && this.answers.ai_integration !== 'none') {
      features.push(`AI integration (${this.answers.ai_integration})`);
    }

    if (this.answers.performance_requirements && this.answers.performance_requirements !== 'basic') {
      features.push(`Performance optimization (${this.answers.performance_requirements})`);
    }

    // Add features based on project scope
    if (this.answers.project_scope) {
      switch (this.answers.project_scope) {
        case 'enterprise':
          features.push('Enterprise-grade architecture');
          features.push('Scalability and high availability');
          break;
        case 'realtime':
          features.push('Real-time functionality');
          features.push('WebSocket integration');
          break;
        case 'mvp':
          features.push('MVP-focused implementation');
          break;
      }
    }

    return features;
  }

  /**
   * Builds security requirements from answers
   */
  buildSecurityRequirements() {
    return {
      level: this.answers.security_level || 'basic',
      authentication: this.answers.authentication || 'none',
      dataProtection: this.answers.security_level === 'high' ? 'encryption' : 'basic',
      compliance: this.answers.security_level === 'enterprise' ? ['SOC2', 'GDPR'] : []
    };
  }

  /**
   * Formats options for proper display with neurodivergent-friendly spacing
   */
  formatOptionsForDisplay(options) {
    return options.map((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, etc.
      return {
        letter: letter,
        display: `${letter}) ${option.label}`,
        value: option.value,
        label: option.label
      };
    });
  }

  /**
   * Gets question suggestions based on current context
   */
  getSuggestions(partialAnswer) {
    const currentQuestionId = this.currentFlow[this.currentQuestion];
    const question = this.findQuestion(currentQuestionId);
    
    if (!question || !question.options) {
      return [];
    }

    return question.options
      .filter(option => {
        const label = option.label || option.value || option;
        return label.toLowerCase().includes(partialAnswer.toLowerCase());
      })
      .slice(0, 5);
  }

  /**
   * Validates the current context for completeness
   */
  validateContext() {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!this.answers.project_name) {
      errors.push('Project name is required');
    }

    if (!this.answers.project_type) {
      errors.push('Project type is required');
    }

    // Check for common missing combinations
    if (this.answers.project_type === 'webapp' && !this.answers.frontend_framework) {
      warnings.push('Frontend framework not specified for web application');
    }

    if (this.answers.database && this.answers.database !== 'none' && !this.answers.backend_framework) {
      warnings.push('Backend framework recommended when using a database');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Resets the question engine
   */
  reset() {
    this.currentFlow = [];
    this.currentQuestion = 0;
    this.answers = {};
    this.context = {};
    this.adaptiveQuestionsSelected = false;
  }

  /**
   * Exports the current state for resuming later
   */
  exportState() {
    return {
      currentFlow: this.currentFlow,
      currentQuestion: this.currentQuestion,
      answers: this.answers,
      context: this.context
    };
  }

  /**
   * Imports a previous state to resume
   */
  importState(state) {
    this.currentFlow = state.currentFlow || [];
    this.currentQuestion = state.currentQuestion || 0;
    this.answers = state.answers || {};
    this.context = state.context || {};
  }
}

module.exports = { QuestionEngine };