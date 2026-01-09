/**
 * ForgeChat - AI-powered chat widget for Buildly Forge
 * A fully featured AI-powered chatbot with BabbleBeaver integration
 * Version: 1.0.0
 * License: BSL 1.1 (converts to Apache 2.0 on 2027-10-22)
 * 
 * Copyright (c) 2024 Buildly Labs, Inc.
 */

// Global configuration from window.ForgeChatConfig (for GitHub Pages deployment)
const DEFAULT_CONFIG = window.ForgeChatConfig || {};

class ForgeChat {
  constructor(options = {}) {
    // Merge with default config from global configuration
    const config = { ...DEFAULT_CONFIG, ...options };
    
    this.options = {
      // API Configuration
      apiEndpoint: config.apiEndpoint || 'https://api.buildlycore.com',
      productUuid: config.productUuid || '',
      organizationUuid: config.organizationUuid || '',
      authToken: config.authToken || null,
      
      // UI Configuration
      position: config.position || 'bottom-right',
      theme: config.theme || 'light',
      title: config.title || 'ForgeChat Assistant',
      placeholder: config.placeholder || 'Type your message...',
      
      // Behavior Configuration
      autoOpen: options.autoOpen || false,
      persistSession: options.persistSession !== false,
      maxMessages: options.maxMessages || 100,
      enablePunchlist: options.enablePunchlist !== false,
      enableFileUpload: options.enableFileUpload || false,
      
      // Customization
      primaryColor: config.primaryColor || '#1976d2',
      customCSS: config.customCSS || '',
      
      // Forge Integration
      forgeMode: config.forgeMode !== false, // Enable Forge-specific features by default
      labsIntegration: config.labsIntegration || false,
      projectUuid: config.projectUuid || null,
      
      // Callbacks
      onMessage: config.onMessage || null,
      onPunchlistSubmit: config.onPunchlistSubmit || null,
      onError: config.onError || null,
      onReady: config.onReady || null,
      
      // Debug
      debug: options.debug || false
    };

    this.isOpen = false;
    this.messages = [];
    this.sessionId = this.generateSessionId();
    this.conversationId = null;
    this.contextHash = null; // Store context hash from BabbleBeaver for efficient follow-ups
    this.container = null;
    this.isTyping = false;
    this.isSubmitting = false;
    this.contextData = null;

    this.init();
  }

  /**
   * Initialize the chatbot
   */
  async init() {
    this.log('Initializing ForgeChat widget...', this.options);
    
    // Load session if persistence is enabled
    if (this.options.persistSession) {
      this.loadSession();
    }

    // Create and inject the chatbot HTML
    this.createChatbot();
    
    // Apply custom styling
    this.applyCustomStyling();
    
    // Bind event listeners
    this.bindEvents();
    
    // Load context and suggested questions
    await this.loadContext();
    
    // Auto-open if configured
    if (this.options.autoOpen) {
      this.open();
    }

    // Initialize Labs integration if enabled
    if (this.options.labsIntegration && this.options.projectUuid) {
      this.initLabsIntegration();
    }

    // Trigger ready callback
    if (this.options.onReady) {
      this.options.onReady(this);
    }

    this.log('ForgeChat widget initialized successfully');
  }

  /**
   * Load context data from backend
   */
  async loadContext() {
    try {
      const response = await fetch('/chat/context');
      if (response.ok) {
        this.contextData = await response.json();
        this.updateSuggestedQuestions();
        this.log('Context loaded:', this.contextData);
      }
    } catch (error) {
      this.log('Failed to load context:', error);
    }
  }

  /**
   * Update suggested questions based on context
   */
  updateSuggestedQuestions() {
    if (!this.contextData || !this.contextData.suggested_questions) return;
    
    const suggestionsContainer = this.container.querySelector('.chatbot-suggestions');
    const suggestionsList = this.container.querySelector('.suggestions-list');
    
    if (!suggestionsContainer || !suggestionsList) return;
    
    // Clear existing suggestions
    suggestionsList.innerHTML = '';
    
    // Add new suggestions
    this.contextData.suggested_questions.forEach(question => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn';
      btn.textContent = question;
      btn.onclick = () => {
        this.elements.input.value = question;
        this.handleInputChange();
        this.sendMessage();
      };
      suggestionsList.appendChild(btn);
    });
    
    // Show suggestions if we have any
    if (this.contextData.suggested_questions.length > 0) {
      suggestionsContainer.style.display = 'block';
    }
  }

  /**
   * Create the chatbot HTML structure
   */
  createChatbot() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = `babblebeaver-chatbot position-${this.options.position}`;
    this.container.setAttribute('data-chatbot-theme', this.options.theme);

    // Create chatbot HTML
    this.container.innerHTML = `
      <div class="chatbot-bubble" role="button" aria-label="Open chat" tabindex="0">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>
      
      <div class="chatbot-window" role="dialog" aria-labelledby="chatbot-title" aria-hidden="true">
        <div class="chatbot-header">
          <h2 id="chatbot-title" class="chatbot-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            ${this.options.title}
          </h2>
          <button class="chatbot-close" aria-label="Close chat" tabindex="0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="chatbot-messages" role="log" aria-live="polite" aria-label="Chat messages">
          <!-- Messages will be inserted here -->
        </div>
        
        <div class="chatbot-suggestions" style="display: none;">
          <div class="suggestions-title">💡 Suggested Questions:</div>
          <div class="suggestions-list"></div>
        </div>
        
        <div class="chatbot-input-area">
          <div class="chatbot-input-container">
            <textarea 
              class="chatbot-input" 
              placeholder="${this.options.placeholder}"
              rows="1"
              aria-label="Type your message"
              maxlength="1000"
            ></textarea>
            <button class="chatbot-send" aria-label="Send message" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          
          <div class="chatbot-actions">
            ${this.options.enablePunchlist ? `
              <button class="chatbot-action-btn" data-action="punchlist">
                📝 Submit to Punchlist
              </button>
            ` : ''}
            <button class="chatbot-action-btn" data-action="help">
              ❓ Help
            </button>
          </div>
          
          ${this.options.enablePunchlist ? `
            <div class="punchlist-form">
              <div class="form-group">
                <label class="form-label">Title *</label>
                <input type="text" class="form-input" name="title" required maxlength="100">
              </div>
              
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" name="description" maxlength="500"></textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-select" name="priority">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" name="category">
                  <option value="bug">Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="improvement">Improvement</option>
                  <option value="question">Question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div class="form-buttons">
                <button type="button" class="btn btn-secondary" data-action="cancel-punchlist">
                  Cancel
                </button>
                <button type="button" class="btn btn-primary" data-action="submit-punchlist">
                  Submit
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Append to body
    document.body.appendChild(this.container);

    // Cache DOM elements
    this.elements = {
      bubble: this.container.querySelector('.chatbot-bubble'),
      window: this.container.querySelector('.chatbot-window'),
      closeBtn: this.container.querySelector('.chatbot-close'),
      messages: this.container.querySelector('.chatbot-messages'),
      input: this.container.querySelector('.chatbot-input'),
      sendBtn: this.container.querySelector('.chatbot-send'),
      punchlistForm: this.container.querySelector('.punchlist-form')
    };
  }

  /**
   * Apply custom styling
   */
  applyCustomStyling() {
    if (this.options.primaryColor) {
      this.container.style.setProperty('--chatbot-primary', this.options.primaryColor);
    }

    if (this.options.customCSS) {
      const style = document.createElement('style');
      style.textContent = this.options.customCSS;
      document.head.appendChild(style);
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Bubble click
    this.elements.bubble.addEventListener('click', () => this.toggle());
    this.elements.bubble.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Close button
    this.elements.closeBtn.addEventListener('click', () => this.close());
    this.elements.closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.close();
      }
    });

    // Input handling
    this.elements.input.addEventListener('input', () => this.handleInputChange());
    this.elements.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));

    // Send button
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

    // Action buttons
    this.container.addEventListener('click', (e) => {
      if (e.target.matches('[data-action]')) {
        this.handleAction(e.target.dataset.action, e.target);
      }
    });

    // Outside click to close
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Handle input changes
   */
  handleInputChange() {
    const input = this.elements.input;
    const sendBtn = this.elements.sendBtn;
    
    // Auto-resize textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    
    // Enable/disable send button
    sendBtn.disabled = !input.value.trim() || this.isSubmitting;
  }

  /**
   * Handle input keydown
   */
  handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!this.elements.sendBtn.disabled) {
        this.sendMessage();
      }
    }
  }

  /**
   * Handle action button clicks
   */
  handleAction(action, button) {
    switch (action) {
      case 'punchlist':
        this.showPunchlistForm();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'submit-punchlist':
        this.submitPunchlist();
        break;
      case 'cancel-punchlist':
        this.hidePunchlistForm();
        break;
      default:
        this.log('Unknown action:', action);
    }
  }

  /**
   * Open the chatbot
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.elements.window.classList.add('visible');
    this.elements.window.setAttribute('aria-hidden', 'false');
    this.elements.input.focus();
    
    // Add welcome message if no messages exist
    if (this.messages.length === 0) {
      this.addMessage('bot', 'Hello! I\'m your BabbleBeaver assistant. How can I help you today?');
    }
    
    this.log('Chatbot opened');
  }

  /**
   * Close the chatbot
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.elements.window.classList.remove('visible');
    this.elements.window.setAttribute('aria-hidden', 'true');
    this.hidePunchlistForm();
    
    this.log('Chatbot closed');
  }

  /**
   * Toggle chatbot open/close
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Send a message
   */
  async sendMessage() {
    const input = this.elements.input;
    const message = input.value.trim();
    
    if (!message || this.isSubmitting) return;
    
    // Hide suggestions panel after first message
    const suggestionsContainer = this.container.querySelector('.chatbot-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
    
    // Add user message
    this.addMessage('user', message);
    
    // Clear input
    input.value = '';
    this.handleInputChange();
    
    // Show typing indicator
    this.showTyping();
    
    try {
      // Send to AI service
      const response = await this.sendToAI(message);
      
      // Hide typing indicator
      this.hideTyping();
      
      // Add bot response - check multiple possible field names from BabbleBeaver
      const botResponse = response.response || response.message || response.reply || response.output || response.text || response.answer || response.content;
      this.log('Extracted bot response:', botResponse);
      this.addMessage('bot', botResponse || 'I understand. How else can I assist you?');
      
      // Handle special responses
      if (response.suggestPunchlist) {
        this.suggestPunchlist(response.suggestedTitle, response.suggestedDescription);
      }
      
    } catch (error) {
      this.hideTyping();
      this.addMessage('bot', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.');
      this.handleError('Message sending failed', error);
    }
  }

  /**
   * Send message to AI service
   */
  async sendToAI(message) {
    // Fetch current context if not already loaded (first message only)
    if (!this.contextData) {
      try {
        const contextResponse = await fetch('/chat/context');
        if (contextResponse.ok) {
          this.contextData = await contextResponse.json();
        }
      } catch (error) {
        this.log('Failed to load context:', error);
      }
    }
    
    // Build payload in BabbleBeaver format
    // Include instruction for concise responses
    const conciseInstruction = 'Please provide a concise response (2-3 short paragraphs max). Use bullet points for lists. Avoid lengthy explanations unless specifically asked for details.';
    const payload = {
      prompt: `${conciseInstruction}\n\nUser question: ${message}`,
    };
    
    // Use context_hash if we have one (more efficient for follow-up messages)
    if (this.contextHash) {
      payload.context_hash = this.contextHash;
      this.log('Using context hash for efficient follow-up');
    } else {
      // First message: include history (empty for new conversation)
      payload.history = {
        user: [],
        bot: []
      };
      payload.tokens = 0;
    }
    
    // Always send context (any JSON structure - BabbleBeaver enriches system prompt)
    // Include product_uuid for Buildly Agent enrichment
    payload.context = {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      page_title: document.title,
      current_section: this.getCurrentSection(),
      viewport_width: window.innerWidth,
      ...this.contextData
    };
    
    // Add product_uuid if available (triggers Buildly Agent enrichment)
    if (this.options.productUuid) {
      payload.product_uuid = this.options.productUuid;
    }
    
    this.log('Sending to BabbleBeaver:', payload);

    const response = await fetch(`${this.options.apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.authToken && { 'Authorization': `Bearer ${this.options.authToken}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store context_hash from server for next message (performance optimization)
    if (data.context_hash) {
      this.contextHash = data.context_hash;
      this.log('Context hash received, next message will be more efficient');
    }
    
    // Log product enrichment if available
    if (data.product_context && data.product_context.enriched) {
      this.log('Product context enriched by Buildly Agent');
    }

    return data;
  }

  /**
   * Get current section/page context
   */
  getCurrentSection() {
    const path = window.location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/roadmap')) return 'roadmap';
    if (path.includes('/backlog')) return 'backlog';
    if (path.includes('/products')) return 'products';
    if (path.includes('/milestones')) return 'milestones';
    if (path.includes('/releases')) return 'releases';
    if (path.includes('/punchlist')) return 'punchlist';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/settings')) return 'settings';
    return 'general';
  }

  /**
   * Build system prompt with context awareness
   */
  buildSystemPrompt(context) {
    let prompt = "You are an AI assistant for Buildly Labs, a product development platform. ";
    
    // Add user context
    if (context.user) {
      prompt += `You are helping ${context.user.first_name || context.user.username}. `;
    }
    
    // Add organization context
    if (context.organization) {
      prompt += `They are working in the "${context.organization.name}" organization. `;
    }
    
    // Add product context
    if (context.product) {
      prompt += `They are currently viewing the product "${context.product.name}"`;
      if (context.product.description) {
        prompt += ` (${context.product.description})`;
      }
      prompt += `. `;
    }
    
    // Add page context
    if (context.current_section) {
      const sectionNames = {
        'dashboard': 'Dashboard',
        'roadmap': 'Product Roadmap',
        'backlog': 'Backlog/Kanban Board',
        'products': 'Products Portfolio',
        'milestones': 'Milestones & Goals',
        'releases': 'Release Planning',
        'punchlist': 'Punchlist (Issues & Tasks)',
        'profile': 'User Profile',
        'settings': 'Settings'
      };
      const sectionName = sectionNames[context.current_section] || context.current_section;
      prompt += `They are on the ${sectionName} page. `;
    }
    
    // Instructions
    prompt += "\n\nIMPORTANT: Use the provided context to give specific, relevant answers. ";
    prompt += "When they ask about 'this product', 'my product', 'the current product', etc., ";
    prompt += "refer to the product information provided in the context. ";
    prompt += "Always provide actionable advice specific to their current view and product. ";
    prompt += "Reference Buildly Labs documentation at https://docs.buildly.io when helpful.";
    
    return prompt;
  }

  /**
   * Add a message to the chat
   */
  addMessage(sender, content, timestamp = new Date()) {
    const message = {
      id: this.generateMessageId(),
      sender,
      content,
      timestamp
    };

    this.messages.push(message);

    // Limit message history
    if (this.messages.length > this.options.maxMessages) {
      this.messages = this.messages.slice(-this.options.maxMessages);
    }

    // Render message
    this.renderMessage(message);

    // Save session
    if (this.options.persistSession) {
      this.saveSession();
    }

    // Trigger callback
    if (this.options.onMessage) {
      this.options.onMessage(message);
    }

    this.log('Message added:', message);
  }

  /**
   * Render a message in the chat
   */
  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.sender}`;
    
    // Bot messages get markdown rendering, user messages are escaped
    const content = message.sender === 'bot' 
      ? this.renderMarkdown(message.content)
      : this.escapeHtml(message.content);
    
    messageEl.innerHTML = `
      <div class="message-bubble markdown-content">${content}</div>
      <div class="message-time">${this.formatTime(message.timestamp)}</div>
    `;

    this.elements.messages.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  showTyping() {
    if (this.isTyping) return;
    
    this.isTyping = true;
    
    const typingEl = document.createElement('div');
    typingEl.className = 'message bot typing-message';
    typingEl.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

    this.elements.messages.appendChild(typingEl);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTyping() {
    if (!this.isTyping) return;
    
    this.isTyping = false;
    
    const typingEl = this.elements.messages.querySelector('.typing-message');
    if (typingEl) {
      typingEl.remove();
    }
  }

  /**
   * Show punchlist form
   */
  showPunchlistForm() {
    if (!this.elements.punchlistForm) return;
    
    this.elements.punchlistForm.classList.add('visible');
    
    // Focus on title field
    const titleField = this.elements.punchlistForm.querySelector('input[name="title"]');
    if (titleField) {
      titleField.focus();
    }
  }

  /**
   * Hide punchlist form
   */
  hidePunchlistForm() {
    if (!this.elements.punchlistForm) return;
    
    this.elements.punchlistForm.classList.remove('visible');
    
    // Reset form
    const form = this.elements.punchlistForm;
    form.querySelectorAll('input, textarea, select').forEach(field => {
      if (field.type === 'select-one') {
        field.selectedIndex = field.querySelector('[selected]')?.index || 0;
      } else {
        field.value = '';
      }
    });
  }

  /**
   * Submit punchlist item
   */
  async submitPunchlist() {
    if (!this.elements.punchlistForm || this.isSubmitting) return;
    
    const form = this.elements.punchlistForm;
    const formData = new FormData();
    
    // Collect form data
    const data = {
      title: form.querySelector('input[name="title"]').value.trim(),
      description: form.querySelector('textarea[name="description"]').value.trim(),
      priority: form.querySelector('select[name="priority"]').value,
      category: form.querySelector('select[name="category"]').value,
      product_uuid: this.options.productUuid,
      organization_uuid: this.options.organizationUuid
    };

    // Validate required fields
    if (!data.title) {
      this.showNotification('Please enter a title for the punchlist item', 'error');
      return;
    }

    this.isSubmitting = true;
    
    // Update submit button
    const submitBtn = form.querySelector('[data-action="submit-punchlist"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div> Submitting...</div>';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.options.apiEndpoint}/punchlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.authToken && { 'Authorization': `Bearer ${this.options.authToken}` })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit punchlist item: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Success feedback
      this.showNotification('Punchlist item submitted successfully!', 'success');
      this.addMessage('bot', `Great! I've added "${data.title}" to your punchlist. You can track its progress in your dashboard.`);
      this.hidePunchlistForm();
      
      // Trigger callback
      if (this.options.onPunchlistSubmit) {
        this.options.onPunchlistSubmit(result);
      }

    } catch (error) {
      this.showNotification('Failed to submit punchlist item. Please try again.', 'error');
      this.handleError('Punchlist submission failed', error);
    } finally {
      this.isSubmitting = false;
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  /**
   * Suggest creating a punchlist item
   */
  suggestPunchlist(title, description) {
    if (!this.options.enablePunchlist) return;
    
    this.addMessage('bot', 'It sounds like this might be something you\'d want to track. Would you like me to help you create a punchlist item?');
    
    // Pre-fill form if shown
    setTimeout(() => {
      if (this.elements.punchlistForm) {
        const titleField = this.elements.punchlistForm.querySelector('input[name="title"]');
        const descField = this.elements.punchlistForm.querySelector('textarea[name="description"]');
        
        if (title && titleField) titleField.value = title;
        if (description && descField) descField.value = description;
      }
    }, 100);
  }

  /**
   * Show help information
   */
  showHelp() {
    const helpMessage = `
      I'm your BabbleBeaver assistant! Here's how I can help:
      
      • Ask me questions about your project
      • Get suggestions and recommendations
      • Submit items to your punchlist for tracking
      • Provide context about issues or ideas
      
      Just type your message and I'll do my best to assist you!
    `;
    
    this.addMessage('bot', helpMessage.trim());
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('visible'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    const messages = this.elements.messages;
    messages.scrollTop = messages.scrollHeight;
  }

  /**
   * Save session to localStorage
   */
  saveSession() {
    if (!this.options.persistSession) return;
    
    try {
      const sessionData = {
        sessionId: this.sessionId,
        conversationId: this.conversationId,
        messages: this.messages.slice(-50), // Keep last 50 messages
        timestamp: Date.now()
      };
      
      localStorage.setItem('babblebeaver_session', JSON.stringify(sessionData));
    } catch (error) {
      this.log('Failed to save session:', error);
    }
  }

  /**
   * Load session from localStorage
   */
  loadSession() {
    if (!this.options.persistSession) return;
    
    try {
      const sessionData = localStorage.getItem('babblebeaver_session');
      if (!sessionData) return;
      
      const data = JSON.parse(sessionData);
      
      // Check if session is not too old (24 hours)
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('babblebeaver_session');
        return;
      }
      
      this.sessionId = data.sessionId || this.sessionId;
      this.conversationId = data.conversationId;
      this.messages = (data.messages || []).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      this.log('Session loaded:', data);
    } catch (error) {
      this.log('Failed to load session:', error);
      localStorage.removeItem('babblebeaver_session');
    }
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.messages = [];
    this.conversationId = null;
    this.sessionId = this.generateSessionId();
    
    if (this.options.persistSession) {
      localStorage.removeItem('babblebeaver_session');
    }
    
    // Clear messages display
    this.elements.messages.innerHTML = '';
    
    this.log('Session cleared');
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'bb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render markdown to HTML for bot messages
   * Supports: headers, bold, italic, code, lists, links, blockquotes
   */
  renderMarkdown(text) {
    if (!text) return '';
    
    let html = this.escapeHtml(text);
    
    // Code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers (## Header) - process from h6 to h1
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^##\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^#\s+(.+)$/gm, '<h4>$1</h4>');
    
    // Bold (**text** or __text__)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
    
    // Strikethrough (~~text~~)
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Blockquotes (> text)
    html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rules (--- or ***)
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^\*\*\*+$/gm, '<hr>');
    
    // Unordered lists (- item or * item)
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Ordered lists (1. item)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Checkboxes [ ] and [x]
    html = html.replace(/\[\s*\]/g, '<input type="checkbox" disabled>');
    html = html.replace(/\[x\]/gi, '<input type="checkbox" checked disabled>');
    
    // Emoji shortcuts
    const emojis = {
      '1️⃣': '1️⃣', '2️⃣': '2️⃣', '3️⃣': '3️⃣', '4️⃣': '4️⃣', '5️⃣': '5️⃣',
      '6️⃣': '6️⃣', '7️⃣': '7️⃣', '8️⃣': '8️⃣', '📋': '📋', '🚀': '🚀'
    };
    
    // Convert line breaks to <br> (but not inside pre/code blocks)
    html = html.replace(/\n/g, '<br>');
    
    // Clean up multiple <br> tags
    html = html.replace(/(<br>){3,}/g, '<br><br>');
    
    return html;
  }

  /**
   * Handle errors
   */
  handleError(context, error) {
    this.log(`Error in ${context}:`, error);
    
    if (this.options.onError) {
      this.options.onError(error, context);
    }
  }

  /**
   * Initialize Buildly Labs integration
   */
  initLabsIntegration() {
    this.log('Initializing Buildly Labs integration...');
    
    if (!this.options.projectUuid) {
      this.log('Warning: Labs integration enabled but no projectUuid provided');
      return;
    }

    // Set up Labs API client
    this.labsApi = {
      endpoint: this.options.labsApiEndpoint || 'https://api.buildly.io',
      token: this.options.labsAuthToken,
      projectUuid: this.options.projectUuid
    };

    // Enable Labs-specific features
    this.setupLabsFeatures();
    
    // Sync with Labs project if authenticated
    if (this.labsApi.token) {
      this.syncWithLabsProject();
    }
  }

  /**
   * Setup Labs-specific features
   */
  setupLabsFeatures() {
    // Add Labs branding to chat header
    if (this.options.forgeMode) {
      const header = this.container.querySelector('.chatbot-header');
      if (header) {
        const labsBadge = document.createElement('span');
        labsBadge.className = 'labs-badge';
        labsBadge.innerHTML = '⚡ Labs';
        labsBadge.style.cssText = `
          font-size: 10px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          margin-left: 8px;
        `;
        header.appendChild(labsBadge);
      }
    }

    // Enhanced punchlist integration with Labs
    if (this.options.enablePunchlist) {
      this.enableLabsPunchlistSync();
    }
  }

  /**
   * Sync chat data with Buildly Labs project
   */
  async syncWithLabsProject() {
    try {
      const projectData = await this.fetchLabsProject();
      
      if (projectData) {
        // Update chat title with project name
        const headerTitle = this.container.querySelector('.chatbot-title');
        if (headerTitle && projectData.name) {
          headerTitle.textContent = `${projectData.name} Assistant`;
        }

        // Sync project context to BabbleBeaver for better responses
        this.syncProjectContext(projectData);
        
        // Trigger Labs sync callback
        if (this.options.onLabsSync) {
          this.options.onLabsSync(projectData);
        }
      }
    } catch (error) {
      this.handleError('Labs sync', error);
    }
  }

  /**
   * Fetch project data from Labs API
   */
  async fetchLabsProject() {
    if (!this.labsApi.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.labsApi.endpoint}/projects/${this.labsApi.projectUuid}/`, {
        headers: {
          'Authorization': `Bearer ${this.labsApi.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      this.log('Failed to fetch Labs project data:', error);
    }

    return null;
  }

  /**
   * Enable enhanced punchlist sync with Labs
   */
  enableLabsPunchlistSync() {
    // Override the default punchlist submission to also sync with Labs
    const originalPunchlistSubmit = this.submitPunchlistItem;
    
    this.submitPunchlistItem = async (itemData) => {
      // Submit to BabbleBeaver as usual
      const result = await originalPunchlistSubmit.call(this, itemData);
      
      // Also create task in Labs project if Labs integration is enabled
      if (this.labsApi.token && result.success) {
        try {
          await this.createLabsTask(itemData, result);
        } catch (error) {
          this.log('Failed to sync punchlist item to Labs:', error);
        }
      }
      
      return result;
    };
  }

  /**
   * Create task in Buildly Labs project
   */
  async createLabsTask(itemData, babbleBeaverResult) {
    if (!this.labsApi.token) {
      return;
    }

    try {
      const taskData = {
        title: itemData.title || 'Chat Issue',
        description: itemData.description || itemData.message,
        project: this.labsApi.projectUuid,
        priority: itemData.priority || 'medium',
        created_via: 'forgechat',
        external_refs: {
          babblebeaver_id: babbleBeaverResult.id,
          conversation_id: this.conversationId
        }
      };

      const response = await fetch(`${this.labsApi.endpoint}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.labsApi.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const task = await response.json();
        this.log('Created Labs task:', task);
        return task;
      }
    } catch (error) {
      this.log('Failed to create Labs task:', error);
    }
  }

  /**
   * Debug logging
   */
  log(...args) {
    if (this.options.debug) {
      console.log('[ForgeChat]', ...args);
    }
  }

  /**
   * Destroy the chatbot
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.log('BabbleBeaver ChatBot destroyed');
  }

  /**
   * Public API methods
   */
  
  // Open programmatically
  openChat() {
    this.open();
  }

  // Close programmatically
  closeChat() {
    this.close();
  }

  // Send message programmatically
  sendChatMessage(message) {
    if (typeof message === 'string' && message.trim()) {
      this.addMessage('user', message.trim());
      this.sendToAI(message.trim()).then(response => {
        this.addMessage('bot', response.message || 'Message received.');
      }).catch(error => {
        this.addMessage('bot', 'I apologize, but I\'m having trouble responding right now.');
        this.handleError('Programmatic message sending failed', error);
      });
    }
  }

  // Get current messages
  getMessages() {
    return [...this.messages];
  }

  // Update configuration
  updateConfig(newOptions) {
    Object.assign(this.options, newOptions);
    this.applyCustomStyling();
  }

  // Check if chatbot is open
  isOpen() {
    return this.isOpen;
  }

  // Static initialization method for Forge
  static init(options = {}) {
    if (window.forgeChatInstance) {
      console.warn('ForgeChat already initialized. Use updateConfig() to modify settings.');
      return window.forgeChatInstance;
    }
    
    window.forgeChatInstance = new ForgeChat(options);
    return window.forgeChatInstance;
  }

  // Destroy instance
  static destroy() {
    if (window.forgeChatInstance) {
      window.forgeChatInstance.close();
      if (window.forgeChatInstance.container) {
        window.forgeChatInstance.container.remove();
      }
      window.forgeChatInstance = null;
    }
  }
}

// Global API setup
if (typeof window !== 'undefined') {
  // ForgeChat API
  window.ForgeChat = ForgeChat;
  
  // Backward compatibility
  window.BabbleBeaverChatBot = ForgeChat;
  
  // Auto-initialize if config is found
  if (window.ForgeChatConfig && window.ForgeChatConfig.autoInit !== false) {
    document.addEventListener('DOMContentLoaded', () => {
      ForgeChat.init(window.ForgeChatConfig);
    });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForgeChat;
}