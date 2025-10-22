// ForgeChat Configuration Helper
// Simplifies setup and integration with Buildly Labs and BabbleBeaver

class ForgeChatConfig {
  constructor() {
    this.defaultConfig = {
      // BabbleBeaver Integration (Required)
      apiEndpoint: 'https://api.buildlycore.com',
      organizationUuid: '',
      productUuid: '',
      authToken: '',
      
      // Widget Appearance
      title: 'ForgeChat Assistant',
      placeholder: 'Type your message...',
      theme: 'light', // 'light' | 'dark' | 'auto'
      position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
      primaryColor: '#1976d2',
      
      // Behavior
      autoOpen: false,
      persistSession: true,
      maxMessages: 100,
      enablePunchlist: true,
      enableFileUpload: false,
      
      // Buildly Labs Integration (Optional)
      labsIntegration: false,
      projectUuid: null,
      labsApiEndpoint: 'https://api.buildly.io',
      labsAuthToken: null,
      
      // Forge Features
      forgeMode: true,
      analyticsEnabled: false,
      supportChannelEnabled: false,
      
      // Advanced Options
      customCSS: '',
      debug: false,
      
      // Callbacks
      onReady: null,
      onMessage: null,
      onPunchlistSubmit: null,
      onLabsSync: null,
      onError: null
    };
  }

  /**
   * Create configuration from environment variables (for Docker/server deployment)
   */
  fromEnvironment() {
    const config = { ...this.defaultConfig };
    
    // Map environment variables to config
    const envMap = {
      'BABBLEBEAVER_API_URL': 'apiEndpoint',
      'BABBLEBEAVER_ORG_UUID': 'organizationUuid',
      'BABBLEBEAVER_PRODUCT_UUID': 'productUuid',
      'BABBLEBEAVER_AUTH_TOKEN': 'authToken',
      'CHAT_TITLE': 'title',
      'CHAT_THEME': 'theme',
      'CHAT_POSITION': 'position',
      'CHAT_PRIMARY_COLOR': 'primaryColor',
      'CHAT_AUTO_OPEN': 'autoOpen',
      'CHAT_ENABLE_PUNCHLIST': 'enablePunchlist',
      'CHAT_ENABLE_FILE_UPLOAD': 'enableFileUpload',
      'CHAT_MAX_MESSAGES': 'maxMessages',
      'LABS_PROJECT_UUID': 'projectUuid',
      'LABS_INTEGRATION_ENABLED': 'labsIntegration',
      'LABS_API_ENDPOINT': 'labsApiEndpoint',
      'LABS_AUTH_TOKEN': 'labsAuthToken',
      'ANALYTICS_ENABLED': 'analyticsEnabled'
    };

    // Only process if we have process.env (Node.js environment)
    if (typeof process !== 'undefined' && process.env) {
      Object.entries(envMap).forEach(([envVar, configKey]) => {
        if (process.env[envVar]) {
          let value = process.env[envVar];
          
          // Convert string booleans
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          
          // Convert string numbers
          if (configKey === 'maxMessages' && !isNaN(value)) {
            value = parseInt(value);
          }
          
          config[configKey] = value;
        }
      });
    }

    return config;
  }

  /**
   * Create configuration for quick BabbleBeaver setup
   */
  quickSetup(orgUuid, productUuid, authToken, options = {}) {
    return {
      ...this.defaultConfig,
      organizationUuid: orgUuid,
      productUuid: productUuid,
      authToken: authToken,
      ...options
    };
  }

  /**
   * Create configuration for Buildly Labs project integration
   */
  labsProject(projectUuid, labsAuthToken, babbleBeaverConfig = {}) {
    return {
      ...this.defaultConfig,
      labsIntegration: true,
      projectUuid: projectUuid,
      labsAuthToken: labsAuthToken,
      ...babbleBeaverConfig,
      
      // Enable Labs-specific features
      supportChannelEnabled: true,
      analyticsEnabled: true,
      
      // Labs project branding
      title: 'Project Assistant',
      primaryColor: '#1976d2'
    };
  }

  /**
   * Create embedded widget configuration
   */
  embedWidget(targetElement, config = {}) {
    return {
      ...this.defaultConfig,
      ...config,
      
      // Embed-specific settings
      targetElement: targetElement,
      position: null, // Will be embedded in target element
      autoOpen: false // Don't auto-open when embedded
    };
  }

  /**
   * Validate configuration before initialization
   */
  validate(config) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!config.organizationUuid) {
      errors.push('organizationUuid is required for BabbleBeaver integration');
    }
    if (!config.productUuid) {
      errors.push('productUuid is required for BabbleBeaver integration');
    }
    if (!config.authToken) {
      errors.push('authToken is required for BabbleBeaver integration');
    }

    // Validate theme
    if (!['light', 'dark', 'auto'].includes(config.theme)) {
      warnings.push(`Invalid theme '${config.theme}', falling back to 'light'`);
      config.theme = 'light';
    }

    // Validate position
    const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    if (config.position && !validPositions.includes(config.position)) {
      warnings.push(`Invalid position '${config.position}', falling back to 'bottom-right'`);
      config.position = 'bottom-right';
    }

    // Validate color
    if (config.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(config.primaryColor)) {
      warnings.push(`Invalid primaryColor '${config.primaryColor}', should be hex format like #1976d2`);
    }

    // Labs integration checks
    if (config.labsIntegration) {
      if (!config.projectUuid) {
        warnings.push('labsIntegration enabled but no projectUuid provided');
      }
      if (!config.labsAuthToken) {
        warnings.push('labsIntegration enabled but no labsAuthToken provided');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config
    };
  }

  /**
   * Get configuration examples for documentation
   */
  getExamples() {
    return {
      basic: {
        organizationUuid: 'your-org-uuid-here',
        productUuid: 'your-product-uuid-here',
        authToken: 'your-auth-token-here'
      },
      
      customized: {
        organizationUuid: 'your-org-uuid-here',
        productUuid: 'your-product-uuid-here',
        authToken: 'your-auth-token-here',
        title: 'Customer Support',
        theme: 'dark',
        position: 'bottom-left',
        primaryColor: '#9c27b0',
        autoOpen: true,
        onMessage: (message) => console.log('New message:', message)
      },
      
      labsIntegrated: {
        organizationUuid: 'your-org-uuid-here',
        productUuid: 'your-product-uuid-here',
        authToken: 'your-auth-token-here',
        labsIntegration: true,
        projectUuid: 'your-labs-project-uuid',
        labsAuthToken: 'your-labs-token'
      },
      
      embedded: {
        organizationUuid: 'your-org-uuid-here',
        productUuid: 'your-product-uuid-here',
        authToken: 'your-auth-token-here',
        targetElement: '#chat-container',
        position: null,
        autoOpen: false
      }
    };
  }
}

// Export for different module systems
if (typeof window !== 'undefined') {
  window.ForgeChatConfig = ForgeChatConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForgeChatConfig;
}