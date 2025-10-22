# Use Node.js Alpine as base image for smaller size
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files (if they exist)
COPY package*.json ./

# Install dependencies (create package.json if it doesn't exist)
RUN if [ ! -f package.json ]; then \
    npm init -y && \
    npm install express serve-static cors helmet compression; \
  else \
    npm ci --only=production; \
  fi

# Create minimal Express server
COPY <<EOF server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for chat widget
}));
app.use(compression());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ForgeChat',
    version: process.env.VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`ForgeChat server running on port \${PORT}\`);
});
EOF

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S forgechat -u 1001

# Set working directory
WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./

# Copy application files
COPY src/ ./public/
COPY index.html ./public/
COPY examples/ ./public/examples/

# Set ownership
RUN chown -R forgechat:nodejs /app
USER forgechat

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# Metadata labels
LABEL org.opencontainers.image.title="ForgeChat"
LABEL org.opencontainers.image.description="AI-powered chat widget with BabbleBeaver integration"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Buildly Labs"
LABEL org.opencontainers.image.source="https://github.com/Buildly-Marketplace/ForgeChat"
LABEL org.opencontainers.image.licenses="BSL-1.1"