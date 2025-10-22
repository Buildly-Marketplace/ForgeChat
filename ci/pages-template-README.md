# ForgeChat Pages Template

This template provides a quick start for deploying ForgeChat to GitHub Pages.

## Setup Instructions

### 1. Fork ForgeChat Repository
Go to https://github.com/Buildly-Marketplace/ForgeChat and click "Fork" to create your own copy.

### 2. Configure Repository Secrets
Add the following secrets to your repository (Settings → Secrets and variables → Actions):

**Required BabbleBeaver Configuration:**
- `BABBLEBEAVER_API_URL` - Your BabbleBeaver API endpoint
- `BABBLEBEAVER_ORG_UUID` - Your organization UUID  
- `BABBLEBEAVER_PRODUCT_UUID` - Your product UUID
- `BABBLEBEAVER_AUTH_TOKEN` - Your API authentication token

**Optional Widget Configuration:**
- `CHAT_TITLE` - Custom chat window title (default: "ForgeChat Assistant")
- `CHAT_THEME` - Theme: "light" or "dark" (default: "light")
- `CHAT_POSITION` - Position: "bottom-right", "bottom-left", "top-right", "top-left" (default: "bottom-right")
- `CHAT_PRIMARY_COLOR` - Hex color code (default: "#1976d2")

### 3. Enable GitHub Pages
1. Go to Settings → Pages
2. Select "GitHub Actions" as the source
3. The site will automatically deploy when you push to the main branch

### 4. Customize Your Site
Edit `index.html` to customize the demo page, or create your own pages in the repository.

## File Structure

```
/
├── .github/workflows/pages.yml    # Deployment workflow
├── src/
│   ├── forgechat.js              # Main ForgeChat widget
│   └── forgechat.css             # Widget styles
├── examples/                     # Usage examples
└── index.html                    # Demo page
```

## Usage

Once deployed, your ForgeChat widget will be available at `https://yourusername.github.io/your-repo-name/`.

To embed the widget on other sites:

```html
<!-- Include ForgeChat CSS and JS -->
<link rel="stylesheet" href="https://yourusername.github.io/ForgeChat/src/forgechat.css">
<script src="https://yourusername.github.io/ForgeChat/src/forgechat.js"></script>

<!-- Initialize the widget -->
<script>
ForgeChat.init({
  apiEndpoint: 'YOUR_BABBLEBEAVER_API_URL',
  organizationUuid: 'YOUR_ORG_UUID',
  productUuid: 'YOUR_PRODUCT_UUID',
  authToken: 'YOUR_AUTH_TOKEN'
});
</script>
```

## Support

For support with ForgeChat deployment:
1. Check the [main documentation](https://github.com/Buildly-Marketplace/ForgeChat)
2. **Issues & Bugs**: [GitHub Issues](https://github.com/Buildly-Marketplace/ForgeChat/issues)
3. **Questions**: [GitHub Discussions](https://github.com/Buildly-Marketplace/ForgeChat/discussions)
4. **Buildly Labs Customers**: Contact through your project dashboard