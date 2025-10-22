# ForgeChat

> AI-powered chat widget with BabbleBeaver integration for the Buildly Forge

ForgeChat is a drop-in AI chat widget that connects to BabbleBeaver endpoints to provide intelligent customer support, FAQ assistance, and seamless integration with Buildly Labs projects. Perfect for adding AI-powered chat to any website or frontend application with minimal configuration.

[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE.md)
[![Forge Marketplace](https://img.shields.io/badge/Buildly-Forge%20Marketplace-orange.svg)](https://collab.buildly.io/marketplace/app/forgechat/)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/Buildly-Marketplace/ForgeChat)
[![GitHub Pages](https://img.shields.io/badge/deploy-github%20pages-green.svg)](https://buildly-marketplace.github.io/ForgeChat/)

## ✨ Features

- 🤖 **AI-Powered Responses** - Intelligent chat powered by BabbleBeaver
- 🎨 **Customizable Themes** - Light/dark modes with custom styling
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🔧 **Easy Integration** - Drop-in widget for any website
- 📋 **Punchlist Support** - Task and issue submission capabilities
- 💬 **Session Persistence** - Remembers conversations across visits
- 🔒 **Secure & Private** - GDPR compliant with optional data collection
- 🚀 **Multiple Deploy Options** - GitHub Pages, Docker, or direct embed

## 🚀 Quick Start

### Option 1: GitHub Pages (Free)
```bash
# Fork the ForgeChat repository
# Go to https://github.com/Buildly-Marketplace/ForgeChat and click "Fork"
# Or clone and create your own repository
git clone https://github.com/Buildly-Marketplace/ForgeChat.git
# Configure your BabbleBeaver credentials in GitHub Secrets
# Deploy automatically via GitHub Actions
```

### Option 2: Docker (Self-hosted)
```bash
# Clone and build locally
git clone https://github.com/Buildly-Marketplace/ForgeChat.git
cd ForgeChat
docker build -f ops/Dockerfile -t forgechat .
docker run -d -p 3000:3000 \
  -e BABBLEBEAVER_ORG_UUID=your-org-uuid \
  -e BABBLEBEAVER_PRODUCT_UUID=your-product-uuid \
  -e BABBLEBEAVER_AUTH_TOKEN=your-token \
  forgechat
```

### Option 3: Direct Embed (GitHub Pages CDN)
```html
<!-- Add to your website -->
<link rel="stylesheet" href="https://buildly-marketplace.github.io/ForgeChat/src/forgechat.css">
<script src="https://buildly-marketplace.github.io/ForgeChat/src/forgechat.js"></script>
<script>
ForgeChat.init({
  apiEndpoint: 'https://api.buildlycore.com',
  organizationUuid: 'your-org-uuid',
  productUuid: 'your-product-uuid',
  authToken: 'your-auth-token'
});
</script>
```

## 🎨 Customization & Branding

ForgeChat is designed to be fully customizable to match your brand and requirements.

### Logo and Branding

Replace the default ForgeChat branding with your own:

1. **Replace the Logo SVG**:
   ```bash
   # Replace the logo file
   cp your-logo.svg assets/logo.svg
   
   # Or create a new 512x512 PNG
   cp your-logo-512.png assets/logo-512.png
   ```

2. **Update Chat Bubble Icon**:
   ```javascript
   ForgeChat.init({
     // ... other config
     customIcon: '/path/to/your-chat-icon.svg', // Custom chat bubble icon
     customCSS: `
       .chatbot-bubble {
         background: linear-gradient(135deg, #your-color1, #your-color2);
       }
     `
   });
   ```

3. **Custom Branding in HTML**:
   ```html
   <!-- Update the demo page title and branding -->
   <h1 class="demo-title">💬 YourBrand Chat <span class="forge-badge">Powered by ForgeChat</span></h1>
   ```

### Color Themes

Create custom color schemes:

```javascript
ForgeChat.init({
  // ... other config
  primaryColor: '#your-brand-color',
  customCSS: `
    :root {
      --chatbot-primary: #your-primary-color;
      --chatbot-secondary: #your-secondary-color;
      --chatbot-success: #your-success-color;
    }
    
    /* Custom styling */
    .chatbot-header {
      background: linear-gradient(135deg, #color1, #color2);
    }
  `
});
```

### Message Customization

Personalize messages and content:

```javascript
ForgeChat.init({
  // ... other config
  title: 'Your Company Support',
  placeholder: 'How can we help you today?',
  welcomeMessage: 'Hi! Welcome to Your Company. How can I assist you?',
  
  // Custom punchlist labels
  punchlistConfig: {
    buttonText: 'Report Issue',
    title: 'Submit Support Ticket',
    successMessage: 'Thank you! We\'ll get back to you soon.'
  }
});
```

### Advanced Customization

For extensive customization, you can:

1. **Fork the Repository**: Create your own version with custom modifications
2. **Override CSS Classes**: Use `customCSS` to override default styling
3. **Custom JavaScript**: Add event listeners and custom behavior
4. **White-label Version**: Remove all ForgeChat branding for your own product

Example of complete white-labeling:

```javascript
ForgeChat.init({
  // ... BabbleBeaver config
  title: 'YourBrand Assistant',
  customCSS: `
    /* Hide ForgeChat branding */
    .forge-badge { display: none !important; }
    
    /* Your custom styling */
    .chatbot-bubble {
      background: url('/your-logo-icon.svg') center/24px no-repeat, 
                  linear-gradient(135deg, #your-color1, #your-color2);
    }
  `,
  
  // Custom callbacks for analytics, etc.
  onMessage: (message) => {
    // Your analytics tracking
    yourAnalytics.track('chat_message_sent', { message });
  }
});
```

## ⚙️ Configuration

### Required Configuration
```javascript
{
    apiUrl: 'https://your-api.buildly.io/',           // Your Buildly API URL
    babbleBeaverUrl: 'https://labs-babble.buildly.dev/', // BabbleBeaver AI service URL
    productUuid: 'dcba4947-07e3-46a0-b429-46dcdacb6ec6', // Your product UUID
    appName: 'Your Application Name',                 // Display name for your app
    version: '1.0.0'                                 // Your app version
}
```

### Optional Configuration
```javascript
{
    // UI Customization
    theme: 'light',                    // 'light' or 'dark'
    primaryColor: '#1976d2',           // Primary brand color
    position: 'bottom-right',          // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    
    // Behavior
    autoOpen: false,                   // Open chat automatically
    showWelcome: true,                 // Show welcome message
    enablePunchlist: true,             // Enable punchlist submission
    enableFileUpload: false,           // Enable file attachments
    
    // Authentication (optional)
    authToken: null,                   // If user is already authenticated
    userInfo: {                        // Pre-filled user information
        name: 'John Doe',
        email: 'john@example.com'
    },
    
    // Customization
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Type your message...',
    title: 'BabbleBeaver Assistant'
}
```

## 📁 Project Structure

```
ForgeChat/
├── BUILDLY.yaml                 # Forge marketplace metadata
├── LICENSE.md                   # BSL 1.1 license
├── README.md                    # This file
├── INSTALL.md                   # Installation guide
├── package.json                 # Node.js project config
├── index.html                   # Demo page
├── src/
│   ├── forgechat.js            # Main widget script
│   ├── forgechat.css           # Widget styles
│   └── config.js               # Configuration helper
├── ops/
│   ├── Dockerfile              # Container build
│   ├── docker-compose.yml      # Multi-container setup
│   ├── .env.example            # Environment template
│   └── deploy.sh               # Deployment script
├── ci/
│   └── .github/workflows/      # GitHub Actions
├── assets/
│   ├── logo.svg                # ForgeChat logo (customize this!)
│   └── README.md               # Asset guidelines
└── examples/
    ├── forge-embed-demo.html    # Interactive demo
    ├── basic-integration.html   # Simple example
    ├── custom-styling.html      # Styling examples
    └── iframe-integration.html  # iframe setup
```

## 🚀 Quick Examples

### Basic Setup
```html
<link rel="stylesheet" href="https://buildly-marketplace.github.io/ForgeChat/src/forgechat.css">
<script src="https://buildly-marketplace.github.io/ForgeChat/src/forgechat.js"></script>
<script>
ForgeChat.init({
  organizationUuid: 'your-org-uuid',
  productUuid: 'your-product-uuid',
  authToken: 'your-auth-token'
});
</script>
```

### With Custom Branding
```javascript
ForgeChat.init({
  // Required BabbleBeaver config
  organizationUuid: 'your-org-uuid',
  productUuid: 'your-product-uuid', 
  authToken: 'your-auth-token',
  
  // Your custom branding
  title: 'YourBrand Support',
  primaryColor: '#your-brand-color',
  customIcon: '/your-chat-icon.svg',
  
  customCSS: `
    .forge-badge { display: none; } /* Remove ForgeChat branding */
    .chatbot-bubble { 
      background: linear-gradient(135deg, #your-color1, #your-color2); 
    }
  `
});
```

For complete setup instructions, see [INSTALL.md](INSTALL.md).

## 🔧 Framework Integration

### React Hook Example
```jsx
import { useEffect } from 'react';

const useForgeChat = (config) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://buildly-marketplace.github.io/ForgeChat/src/forgechat.js';
    script.onload = () => window.ForgeChat.init(config);
    document.body.appendChild(script);
    
    return () => window.ForgeChat?.destroy();
  }, [config]);
};
```

### Vue Composable
```javascript
import { onMounted, onUnmounted } from 'vue';

export function useForgeChat(config) {
  onMounted(() => {
    const script = document.createElement('script');
    script.src = 'https://buildly-marketplace.github.io/ForgeChat/src/forgechat.js';
    script.onload = () => window.ForgeChat.init(config);
    document.body.appendChild(script);
  });
  
  onUnmounted(() => window.ForgeChat?.destroy());
}
```

## 🆘 Support & Issues

### Report Issues
- **Bug Reports**: [GitHub Issues](https://github.com/Buildly-Marketplace/ForgeChat/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Buildly-Marketplace/ForgeChat/discussions)
- **Questions**: Use GitHub Discussions for community help

### Commercial Support
- **Buildly Labs Customers**: Contact through your project dashboard
- **Enterprise Support**: Available through Buildly Labs partnerships
- **Custom Development**: Request custom features via Buildly Labs

### Self-Help Resources
1. **Installation Issues**: See [INSTALL.md](INSTALL.md) troubleshooting section
2. **Configuration Help**: Check the [examples/](examples/) directory
3. **Debug Mode**: Enable `debug: true` in your config for detailed logs
4. **Browser Console**: Check for JavaScript errors and network issues

## 📄 License

Licensed under the Business Source License 1.1 (BSL 1.1).

- ✅ **Free to use**: Modify, self-host, and deploy for your projects
- ✅ **Open source**: Full source code available
- ✅ **Future Apache 2.0**: Automatically converts to Apache 2.0 on October 22, 2027
- ❌ **Commercial restriction**: No commercial hosting/resale without license

See [LICENSE.md](LICENSE.md) for complete terms.

## 🔧 Installation Methods

### 1. Download and Host
1. Download the `standalone-chatbot` folder
2. Upload to your web server
3. Include the script and initialize

### 2. CDN (if available)
```html
<script src="https://cdn.buildly.io/chatbot/v1/babblebeaver-chatbot.min.js"></script>
```

### 3. NPM Package (future)
```bash
npm install @buildly/babblebeaver-chatbot
```

## 🎨 Customization

### CSS Custom Properties
```css
:root {
    --chatbot-primary: #1976d2;
    --chatbot-secondary: #757575;
    --chatbot-background: #ffffff;
    --chatbot-text: #333333;
    --chatbot-border: #e0e0e0;
    --chatbot-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

### JavaScript Events
```javascript
// Listen for chatbot events
window.addEventListener('babblebeaver:ready', () => {
    console.log('ChatBot is ready');
});

window.addEventListener('babblebeaver:message', (event) => {
    console.log('New message:', event.detail);
});

window.addEventListener('babblebeaver:punchlist', (event) => {
    console.log('Punchlist submitted:', event.detail);
});
```

## 🔐 Authentication

### No Authentication (Public Mode)
```javascript
BabbleBeaverChatBot.init({
    // ... config
    authMode: 'public'  // Allows punchlist submission without login
});
```

### Token-based Authentication
```javascript
BabbleBeaverChatBot.init({
    // ... config
    authToken: 'your-jwt-token',
    authMode: 'token'
});
```

### Custom Authentication
```javascript
BabbleBeaverChatBot.init({
    // ... config
    authMode: 'custom',
    authHandler: async () => {
        // Your custom auth logic
        return {
            token: 'token',
            user: { name: 'User', email: 'user@example.com' }
        };
    }
});
```

## 🌐 API Endpoints Used

The widget connects to these API endpoints:
- `POST /punchlist/` - Submit punchlist items
- `GET /products/{uuid}/releases/` - Get release information
- `POST /ai/chat` - BabbleBeaver AI conversations
- `GET /products/{uuid}/` - Product information

## 📱 Responsive Design

The widget is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Mobile devices
- ✅ Tablets
- ✅ Different screen orientations

## 🔍 Debugging

Enable debug mode:
```javascript
BabbleBeaverChatBot.init({
    // ... config
    debug: true  // Enables console logging
});
```

## 🆘 Support

### Community Support
- **GitHub Issues:** [Report bugs and request features](https://github.com/Buildly-Marketplace/ForgeChat/issues)
- **Documentation:** Check README.md, INSTALL.md, and BRANDING.md in this repository
- **GitHub Discussions:** [Community help and questions](https://github.com/Buildly-Marketplace/ForgeChat/discussions)

### Commercial Support
- **Buildly Forge:** [Purchase commercial license and premium support](https://collab.buildly.io/marketplace/app/forgechat/)
- **Buildly Labs:** Contact through your project dashboard for enterprise solutions

### Self-Help Checklist
1. Check the browser console for errors
2. Verify your configuration
3. Check API connectivity
4. Review the troubleshooting guide in INSTALL.md

## 📄 License

ForgeChat is licensed under the [Business Source License 1.1 (BSL 1.1)](LICENSE.md).

### Key Points:
- **Free for non-commercial use** - Development, testing, and personal projects
- **Commercial use requires purchase** - [Get commercial license via Buildly Forge](https://collab.buildly.io/marketplace/app/forgechat/)
- **Apache 2.0 conversion** - Automatically converts to Apache 2.0 on October 22, 2027
- **30-day support included** - Premium support included with Forge marketplace purchase

For detailed licensing information, see [LICENSE.md](LICENSE.md).

Copyright © 2025 Buildly Labs. All rights reserved.