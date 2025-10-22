# 🎨 ForgeChat Branding & Customization Guide

ForgeChat is designed to be fully white-labeled and customized for your brand. This guide shows you how to make it truly yours.

## 🖼️ Replace the Logo & Assets

### 1. Update the Logo
Replace the ForgeChat logo with your own:

```bash
# Replace the main logo (512x512 recommended)
cp your-company-logo.png assets/logo-512.png

# Or use SVG for scalability
cp your-company-logo.svg assets/logo.svg
```

### 2. Update Chat Bubble Icon
Create a custom chat bubble icon:

```javascript
ForgeChat.init({
  // ... your config
  customIcon: '/path/to/your-chat-icon.svg',
  // Or use a FontAwesome icon
  customIcon: '<i class="fas fa-comments"></i>'
});
```

### 3. Screenshots for Your Deployment
Replace the example screenshots:

```bash
# Add your branded screenshots
cp your-screenshot-1.png assets/screenshot-1.png
cp your-screenshot-2.png assets/screenshot-2.png  
cp your-screenshot-3.png assets/screenshot-3.png
```

## 🎨 Complete Brand Customization

### Remove ForgeChat Branding
```javascript
ForgeChat.init({
  // ... your BabbleBeaver config
  
  // Hide all ForgeChat branding
  customCSS: `
    .forge-badge { display: none !important; }
    .demo-title .forge-badge { display: none !important; }
  `,
  
  // Your branding
  title: 'YourBrand Assistant',
  placeholder: 'How can YourBrand help you today?'
});
```

### Custom Color Scheme
```javascript
ForgeChat.init({
  // ... config
  primaryColor: '#your-primary-color',
  customCSS: `
    :root {
      --chatbot-primary: #your-primary-color;
      --chatbot-primary-dark: #your-primary-color-dark;
      --chatbot-secondary: #your-secondary-color;
      --chatbot-success: #your-success-color;
      --chatbot-warning: #your-warning-color;
      --chatbot-error: #your-error-color;
    }
    
    /* Custom gradient backgrounds */
    .chatbot-bubble {
      background: linear-gradient(135deg, #your-color1, #your-color2);
    }
    
    .chatbot-header {
      background: linear-gradient(90deg, #your-brand-primary, #your-brand-secondary);
    }
    
    /* Custom message styling */
    .message-bubble.ai {
      background: #your-ai-message-color;
      color: #your-ai-text-color;
    }
  `
});
```

### Advanced White-Labeling
For complete white-labeling, update the demo page:

1. **Update HTML Title and Content**:
```html
<!-- In index.html or your demo page -->
<title>YourBrand Chat Assistant</title>
<h1 class="demo-title">💬 YourBrand Support</h1>
<p class="demo-subtitle">AI-Powered Customer Support</p>
```

2. **Custom Feature Descriptions**:
```html
<div class="feature">
    <h3>🤖 YourBrand AI Assistant</h3>
    <p>Powered by advanced AI to help your customers instantly.</p>
</div>
```

3. **Your Contact Information**:
```html
<!-- Replace support links -->
<p>Need help? Contact <a href="mailto:support@yourbrand.com">support@yourbrand.com</a></p>
```

## 🏢 Multi-Brand Support

If you manage multiple brands, you can create brand-specific configurations:

```javascript
// Brand configuration object
const brandConfigs = {
  'brand-a': {
    title: 'Brand A Support',
    primaryColor: '#ff6b35',
    logo: '/brands/brand-a-logo.svg',
    welcomeMessage: 'Welcome to Brand A! How can we help?'
  },
  'brand-b': {
    title: 'Brand B Assistant', 
    primaryColor: '#4a90e2',
    logo: '/brands/brand-b-logo.svg',
    welcomeMessage: 'Hi there! Brand B support is here to help.'
  }
};

// Initialize with brand
const currentBrand = 'brand-a'; // Could come from URL, database, etc.
const brandConfig = brandConfigs[currentBrand];

ForgeChat.init({
  // ... your BabbleBeaver config
  ...brandConfig,
  customCSS: `
    .chatbot-bubble {
      background: url('${brandConfig.logo}') center/24px no-repeat,
                  ${brandConfig.primaryColor};
    }
  `
});
```

## 📱 Mobile App Integration

For mobile apps using WebView:

```javascript
ForgeChat.init({
  // ... config
  
  // Mobile-optimized settings
  position: 'fullscreen', // Custom position for mobile
  autoOpen: true, // Open immediately on mobile
  
  // Native app integration
  onMessage: (message) => {
    // Send to native app
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'chat_message',
        message: message
      }));
    }
  }
});
```

## 🎯 Domain-Specific Customization

Automatically customize based on the domain:

```javascript
// Auto-detect brand from domain
const domainBranding = {
  'yoursite1.com': {
    title: 'Site 1 Support',
    primaryColor: '#e74c3c'
  },
  'yoursite2.com': {
    title: 'Site 2 Assistant', 
    primaryColor: '#3498db'
  }
};

const currentDomain = window.location.hostname;
const branding = domainBranding[currentDomain] || {};

ForgeChat.init({
  // ... your config
  ...branding
});
```

## 🔄 Dynamic Branding Updates

Update branding dynamically without reload:

```javascript
// Initialize ForgeChat
const chat = ForgeChat.init({ /* config */ });

// Later, update branding
chat.updateConfig({
  title: 'New Brand Name',
  primaryColor: '#new-color',
  customCSS: '/* new styles */'
});

// Update logo dynamically
document.querySelector('.chatbot-bubble').style.backgroundImage = 
  'url("/new-logo.svg")';
```

## 📦 Build Your Own Branded Package

To create a completely branded version:

1. **Fork the Repository**:
```bash
git clone https://github.com/Buildly-Marketplace/ForgeChat.git
cd ForgeChat
```

2. **Replace All Assets**:
```bash
# Replace logos and assets
cp your-assets/* assets/

# Update package.json
sed -i 's/ForgeChat/YourBrandChat/g' package.json
```

3. **Update Documentation**:
```bash
# Update README with your branding
sed -i 's/ForgeChat/YourBrandChat/g' README.md
```

4. **Deploy Your Version**:
```bash
# Deploy to your own GitHub Pages
git remote set-url origin https://github.com/yourusername/yourbrandchat.git
git push origin main

# Enable GitHub Pages in your repository settings
```

## 🔐 License Compliance

When white-labeling ForgeChat:

✅ **Allowed under BSL 1.1**:
- Use for your own projects and customers
- Modify and customize extensively  
- Remove ForgeChat branding
- Self-host and deploy

❌ **Requires commercial license**:
- Reselling as a hosted service
- Including in a competing chat widget product
- Commercial redistribution before 2027

✅ **After October 22, 2027**: Becomes Apache 2.0, allowing all commercial uses

## 💡 Tips for Best Results

1. **Consistent Branding**: Use the same colors, fonts, and style as your main site
2. **Mobile First**: Test on mobile devices - most users will interact via mobile
3. **Accessibility**: Ensure good contrast ratios and keyboard navigation
4. **Performance**: Optimize custom images and CSS for fast loading
5. **Testing**: Test with your actual BabbleBeaver credentials, not demo data

Need help with customization? Create an issue in the [ForgeChat repository](https://github.com/Buildly-Marketplace/ForgeChat/issues) or contact Buildly Labs for commercial support.