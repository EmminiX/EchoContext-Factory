#!/usr/bin/env node

/**
 * Validation utilities for EchoContext Factory
 * Provides security validation, input sanitization, and path checking
 */

const fs = require('fs');
const path = require('path');

class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}

class Validator {
  constructor(configPath = '~/.claude/config/security.json') {
    this.config = this.loadConfig(configPath);
  }

  loadConfig(configPath) {
    try {
      const expandedPath = configPath.replace(/^~/, process.env.HOME);
      const config = JSON.parse(fs.readFileSync(expandedPath, 'utf8'));
      return config;
    } catch (error) {
      console.warn('Could not load security config, using defaults');
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      security: { enabled: true, strictMode: true },
      dangerousCommands: ['rm -rf', 'rm -r', 'sudo rm', 'dd if='],
      dangerousPatterns: ['.*\\|\\s*sh\\s*$', '.*\\|\\s*bash\\s*$'],
      protectedPaths: ['/System/', '/usr/bin/', '/etc/', '~/.ssh/'],
      validation: {
        maxPathLength: 260,
        maxFileSize: '10MB',
        allowedFileTypes: ['.md', '.txt', '.json', '.js', '.ts'],
        blockedExtensions: ['.exe', '.bat', '.cmd', '.scr']
      }
    };
  }

  /**
   * Validates a command for dangerous patterns
   */
  validateCommand(command) {
    if (!this.config.security.enabled) {
      return { valid: true };
    }

    const cmd = command.trim().toLowerCase();

    // Check dangerous commands
    for (const dangerous of this.config.dangerousCommands) {
      if (cmd.includes(dangerous.toLowerCase())) {
        return {
          valid: false,
          reason: `Dangerous command detected: ${dangerous}`,
          code: 'DANGEROUS_COMMAND'
        };
      }
    }

    // Check dangerous patterns
    for (const pattern of this.config.dangerousPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(cmd)) {
        return {
          valid: false,
          reason: `Dangerous pattern detected: ${pattern}`,
          code: 'DANGEROUS_PATTERN'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validates a file path for security
   */
  validatePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return {
        valid: false,
        reason: 'Invalid path provided',
        code: 'INVALID_PATH'
      };
    }

    const expandedPath = filePath.replace(/^~/, process.env.HOME);
    const resolvedPath = path.resolve(expandedPath);

    // Check path length
    if (resolvedPath.length > this.config.validation.maxPathLength) {
      return {
        valid: false,
        reason: 'Path too long',
        code: 'PATH_TOO_LONG'
      };
    }

    // Check protected paths
    for (const protectedPath of this.config.protectedPaths) {
      const expandedProtected = protectedPath.replace(/^~/, process.env.HOME);
      if (resolvedPath.startsWith(expandedProtected)) {
        return {
          valid: false,
          reason: `Access to protected path denied: ${protectedPath}`,
          code: 'PROTECTED_PATH'
        };
      }
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (this.config.validation.blockedExtensions.includes(ext)) {
      return {
        valid: false,
        reason: `Blocked file extension: ${ext}`,
        code: 'BLOCKED_EXTENSION'
      };
    }

    return { valid: true, resolvedPath };
  }

  /**
   * Validates user input
   */
  validateInput(input, type, options = {}) {
    if (!input && options.required) {
      return {
        valid: false,
        reason: 'Required field is empty',
        code: 'REQUIRED_FIELD'
      };
    }

    if (!input && !options.required) {
      return { valid: true };
    }

    switch (type) {
      case 'text':
        return this.validateText(input, options);
      case 'email':
        return this.validateEmail(input, options);
      case 'url':
        return this.validateUrl(input, options);
      case 'number':
        return this.validateNumber(input, options);
      case 'select':
        return this.validateSelect(input, options);
      default:
        return { valid: true };
    }
  }

  validateText(text, options) {
    if (options.minLength && text.length < options.minLength) {
      return {
        valid: false,
        reason: `Text too short (minimum ${options.minLength} characters)`,
        code: 'TEXT_TOO_SHORT'
      };
    }

    if (options.maxLength && text.length > options.maxLength) {
      return {
        valid: false,
        reason: `Text too long (maximum ${options.maxLength} characters)`,
        code: 'TEXT_TOO_LONG'
      };
    }

    if (options.pattern) {
      const regex = new RegExp(options.pattern);
      if (!regex.test(text)) {
        return {
          valid: false,
          reason: 'Text does not match required pattern',
          code: 'PATTERN_MISMATCH'
        };
      }
    }

    return { valid: true };
  }

  validateEmail(email, options) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        reason: 'Invalid email format',
        code: 'INVALID_EMAIL'
      };
    }

    return { valid: true };
  }

  validateUrl(url, options) {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        reason: 'Invalid URL format',
        code: 'INVALID_URL'
      };
    }
  }

  validateNumber(number, options) {
    const num = parseFloat(number);
    if (isNaN(num)) {
      return {
        valid: false,
        reason: 'Invalid number format',
        code: 'INVALID_NUMBER'
      };
    }

    if (options.min !== undefined && num < options.min) {
      return {
        valid: false,
        reason: `Number too small (minimum ${options.min})`,
        code: 'NUMBER_TOO_SMALL'
      };
    }

    if (options.max !== undefined && num > options.max) {
      return {
        valid: false,
        reason: `Number too large (maximum ${options.max})`,
        code: 'NUMBER_TOO_LARGE'
      };
    }

    return { valid: true };
  }

  validateSelect(value, options) {
    if (!options.options || !Array.isArray(options.options)) {
      return { valid: true };
    }

    const validValues = options.options.map(opt => 
      typeof opt === 'string' ? opt : opt.value
    );

    if (!validValues.includes(value)) {
      return {
        valid: false,
        reason: 'Invalid selection',
        code: 'INVALID_SELECTION'
      };
    }

    return { valid: true };
  }

  /**
   * Sanitizes user input
   */
  sanitizeInput(input, type = 'text') {
    if (!input || typeof input !== 'string') {
      return input;
    }

    switch (type) {
      case 'text':
        return input.trim().replace(/[<>]/g, '');
      case 'filename':
        return input.replace(/[^a-zA-Z0-9._-]/g, '');
      case 'path':
        return input.replace(/\.\./g, '').replace(/[<>|]/g, '');
      default:
        return input.trim();
    }
  }

  /**
   * Validates project configuration
   */
  validateProjectConfig(config) {
    const errors = [];

    if (!config.name || typeof config.name !== 'string') {
      errors.push('Project name is required');
    }

    if (!config.type || typeof config.type !== 'string') {
      errors.push('Project type is required');
    }

    if (config.name && config.name.length > 50) {
      errors.push('Project name too long (max 50 characters)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = { Validator, ValidationError };