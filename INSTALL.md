# ForgeChat Installation Guide

ForgeChat is an AI-powered chat widget that integrates with BabbleBeaver endpoints. This guide covers all installation methods supported by the Buildly Forge.

## 📋 Prerequisites

- BabbleBeaver API credentials (organization UUID, product UUID, auth token)
- Modern web browser or hosting environment
- Basic understanding of HTML/JavaScript (for manual installation)

## 🚀 Installation Methods

### Method 1: GitHub Pages (Static Site)

Perfect for static websites and personal projects.

#### Prerequisites
- GitHub account
- BabbleBeaver API credentials

#### Steps
1. **Fork or clone the ForgeChat repository:**
   ```bash
   # Option A: Fork the repository on GitHub
   # Go to https://github.com/Buildly-Marketplace/ForgeChat and click "Fork"
   
   # Option B: Clone directly
   git clone https://github.com/Buildly-Marketplace/ForgeChat.git
   cd ForgeChat
   
   # Option C: Use as template (if template is enabled)
   gh repo create my-forgechat --template Buildly-Marketplace/ForgeChat --public
   ```

2. **Configure repository secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add your BabbleBeaver credentials:
     - `BABBLEBEAVER_API_URL`
     - `BABBLEBEAVER_ORG_UUID`
     - `BABBLEBEAVER_PRODUCT_UUID`
     - `BABBLEBEAVER_AUTH_TOKEN`

3. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Select "GitHub Actions" as source
   - Push to main branch to deploy

4. **Access your widget:**
   - Visit `https://yourusername.github.io/repository-name/`

### Method 2: Docker Container

Ideal for self-hosted environments and production deployments.

#### Prerequisites
- Docker Engine 20.10+
- 512MB RAM minimum
- BabbleBeaver API credentials

#### Quick Start
```bash
# Clone the ForgeChat repository
git clone https://github.com/Buildly-Marketplace/ForgeChat.git
cd ForgeChat

# Copy environment template
cp ops/.env.example ops/.env

# Edit .env with your BabbleBeaver credentials
nano ops/.env

# Deploy with Docker
./ops/deploy.sh production
```

#### Manual Docker Setup
```bash
# Clone and build the image locally
git clone https://github.com/Buildly-Marketplace/ForgeChat.git
cd ForgeChat
docker build -f ops/Dockerfile -t forgechat .

# Run with environment variables
docker run -d \
  --name forgechat \
  -p 3000:3000 \
  -e BABBLEBEAVER_API_URL=https://api.buildlycore.com \
  -e BABBLEBEAVER_ORG_UUID=your-org-uuid \
  -e BABBLEBEAVER_PRODUCT_UUID=your-product-uuid \
  -e BABBLEBEAVER_AUTH_TOKEN=your-auth-token \
  forgechat
```

#### Docker Compose
```bash
# Using the provided docker-compose.yml
cd ops
docker-compose up -d
```

### Method 3: Widget Embed

Embed directly into existing websites with minimal setup.

#### Self-Hosted Method (Recommended)
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Include ForgeChat CSS (host these files yourself) -->
    <link rel="stylesheet" href="/path/to/forgechat.css">
</head>
<body>
    <!-- Your existing website content -->
    
    <!-- Include ForgeChat JS (host these files yourself) -->
    <script src="/path/to/forgechat.js"></script>
    
    <!-- Initialize ForgeChat -->
    <script>
    ForgeChat.init({
        apiEndpoint: 'https://api.buildlycore.com',
        organizationUuid: 'your-org-uuid-here',
        productUuid: 'your-product-uuid-here',
        authToken: 'your-auth-token-here',
        
        // Optional customization
        title: 'Customer Support',
        theme: 'light',
        position: 'bottom-right',
        primaryColor: '#1976d2'
    });
    </script>
</body>
</html>
```

#### Alternative: GitHub Pages Hosting
```html
<!-- If you've deployed ForgeChat to GitHub Pages -->
<link rel="stylesheet" href="https://buildly-marketplace.github.io/ForgeChat/src/forgechat.css">
<script src="https://buildly-marketplace.github.io/ForgeChat/src/forgechat.js"></script>
<script>
ForgeChat.init({
    // Your configuration here
});
</script>
```

## ⚙️ Configuration Options

### Required Configuration
```javascript
{
    apiEndpoint: 'https://api.buildlycore.com',     // BabbleBeaver API URL
    organizationUuid: 'your-org-uuid',              // Your organization UUID
    productUuid: 'your-product-uuid',               // Your product UUID
    authToken: 'your-auth-token'                    // API authentication token
}
```

### Optional Configuration
```javascript
{
    // UI Customization
    title: 'Chat Assistant',                        // Chat window title
    placeholder: 'Type your message...',            // Input placeholder text
    theme: 'light',                                 // 'light' or 'dark'
    position: 'bottom-right',                       // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    primaryColor: '#1976d2',                        // Hex color code
    customCSS: '',                                  // Additional CSS styles
    
    // Behavior
    autoOpen: false,                                // Auto-open chat on page load
    persistSession: true,                           // Remember chat history
    maxMessages: 100,                               // Maximum messages to keep
    enablePunchlist: true,                          // Enable punchlist submission
    enableFileUpload: false,                        // Enable file uploads
    
    // Callbacks
    onMessage: function(message) { /* ... */ },     // Called when message sent
    onReady: function(widget) { /* ... */ },        // Called when widget ready
    onError: function(error) { /* ... */ }          // Called on errors
}
```

## 🔧 Environment Variables (Docker)

### Required Variables
- `BABBLEBEAVER_API_URL` - BabbleBeaver API endpoint
- `BABBLEBEAVER_ORG_UUID` - Organization UUID
- `BABBLEBEAVER_PRODUCT_UUID` - Product UUID  
- `BABBLEBEAVER_AUTH_TOKEN` - Authentication token

### Optional Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `CHAT_TITLE` - Default chat title
- `CHAT_THEME` - Default theme
- `CHAT_POSITION` - Default position
- `CHAT_PRIMARY_COLOR` - Default color

## 🏗️ Framework Integration

### React
```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load ForgeChat script (update path to your hosted files)
    const script = document.createElement('script');
    script.src = '/path/to/forgechat.js';
    script.onload = () => {
      window.ForgeChat.init({
        // Your configuration
      });
    };
    document.body.appendChild(script);
    
    return () => {
      // Cleanup if needed
      if (window.ForgeChat) {
        window.ForgeChat.destroy();
      }
    };
  }, []);

  return <div>Your App</div>;
}
```

### Vue.js
```vue
<template>
  <div>Your App</div>
</template>

<script>
export default {
  mounted() {
    this.loadForgeChat();
  },
  methods: {
    loadForgeChat() {
      const script = document.createElement('script');
      script.src = '/path/to/forgechat.js'; // Update to your hosted files
      script.onload = () => {
        window.ForgeChat.init({
          // Your configuration
        });
      };
      document.body.appendChild(script);
    }
  }
};
</script>
```

### WordPress
1. Install via plugin or add to theme's `functions.php`:
```php
function add_forgechat() {
    wp_enqueue_style('forgechat-css', get_template_directory_uri() . '/js/forgechat.css');
    wp_enqueue_script('forgechat-js', get_template_directory_uri() . '/js/forgechat.js', [], '1.0.0', true);
    
    wp_add_inline_script('forgechat-js', '
        ForgeChat.init({
            apiEndpoint: "' . get_option('forgechat_api_endpoint') . '",
            organizationUuid: "' . get_option('forgechat_org_uuid') . '",
            productUuid: "' . get_option('forgechat_product_uuid') . '",
            authToken: "' . get_option('forgechat_auth_token') . '"
        });
    ');
}
add_action('wp_enqueue_scripts', 'add_forgechat');
```

## 🔍 Troubleshooting

### Common Issues

**Chat widget not appearing:**
- Check browser console for JavaScript errors
- Verify API credentials are correct
- Ensure CSS and JS files are loading properly

**Connection errors:**
- Verify BabbleBeaver API endpoint is accessible
- Check that organization and product UUIDs are valid
- Confirm authentication token has proper permissions

**Styling issues:**
- Check for CSS conflicts with existing styles
- Use browser developer tools to inspect elements
- Try different themes or custom CSS overrides

### Debug Mode
Enable debug mode to see detailed logs:
```javascript
ForgeChat.init({
    // ... your config
    debug: true
});
```

### Health Checks
For Docker deployments, check the health endpoint:
```bash
curl http://localhost:3000/health
```

## 📞 Support

### Paid Support (30 days included with Forge purchase)
- **Channel:** Buildly Labs project chat
- **SLA:** First response < 1 business day
- **Scope:** Installation, configuration, first deployment

### Community Support
- **Documentation:** See README.md and INSTALL.md in this repository
- **Issues:** Report bugs and request features via [GitHub Issues](https://github.com/Buildly-Marketplace/ForgeChat/issues)
- **Discussions:** Use [GitHub Discussions](https://github.com/Buildly-Marketplace/ForgeChat/discussions) for questions and community help

### Commercial Support
For extended support or custom features:
- **Buildly Labs:** Contact through your Buildly Labs project dashboard
- **Enterprise:** Custom solutions available through Buildly Labs partnerships