/**
 * Swagger UI Integration
 * Mounts OpenAPI documentation at /api/docs
 * Provides interactive API documentation for developers
 */

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

/**
 * Load OpenAPI specification from YAML file
 * @returns {Object} OpenAPI specification object
 */
function loadOpenAPISpec() {
  const specPath = path.join(__dirname, '../../../../../openapi/auth-farmer.yaml');

  if (!fs.existsSync(specPath)) {
    console.warn(`⚠️  OpenAPI spec not found at: ${specPath}`);
    // Return minimal spec if file not found
    return {
      openapi: '3.0.3',
      info: {
        title: 'GACP Auth Farmer API',
        version: '1.0.0',
        description: 'OpenAPI specification not loaded',
      },
      paths: {},
    };
  }

  try {
    const spec = YAML.load(specPath);
    console.log('✅ OpenAPI specification loaded successfully');
    return spec;
  } catch (error) {
    console.error('❌ Error loading OpenAPI spec:', error.message);
    return {
      openapi: '3.0.3',
      info: {
        title: 'GACP Auth Farmer API',
        version: '1.0.0',
        description: 'Error loading OpenAPI specification',
      },
      paths: {},
    };
  }
}

/**
 * Swagger UI options
 */
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: {
      theme: 'monokai',
    },
    tryItOutEnabled: true,
    persistAuthorization: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GACP Auth Farmer API Docs',
};

/**
 * Mount Swagger UI on Express app
 * @param {Object} app - Express application instance
 * @param {string} basePath - Base path for docs (default: /api/docs)
 */
function mountSwagger(app, basePath = '/api/docs') {
  const spec = loadOpenAPISpec();

  // Serve Swagger UI at /api/docs
  app.use(basePath, swaggerUi.serve, swaggerUi.setup(spec, swaggerOptions));

  // Also provide JSON endpoint for programmatic access
  app.get(`${basePath}.json`, (req, res) => {
    res.json(spec);
  });

  console.log(`📚 Swagger UI mounted at: ${basePath}`);
  console.log(`📄 OpenAPI JSON available at: ${basePath}.json`);
}

/**
 * Mount multiple OpenAPI specs (for modular documentation)
 * @param {Object} app - Express application instance
 * @param {Array} specs - Array of spec configs: [{ path, file }]
 */
function mountMultipleSpecs(app, specs = []) {
  specs.forEach(({ path: mountPath, file }) => {
    const specPath = path.join(__dirname, '../../../../../openapi', file);

    if (!fs.existsSync(specPath)) {
      console.warn(`⚠️  Spec not found: ${specPath}`);
      return;
    }

    try {
      const spec = YAML.load(specPath);
      app.use(mountPath, swaggerUi.serve, swaggerUi.setup(spec, swaggerOptions));
      console.log(`📚 Swagger UI mounted at: ${mountPath}`);
    } catch (error) {
      console.error(`❌ Error loading spec ${file}:`, error.message);
    }
  });
}

/**
 * Create API docs index page (if you have multiple modules)
 * @param {Object} app - Express application instance
 */
function createDocsIndex(app) {
  const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GACP API Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #27ae60;
      padding-bottom: 10px;
    }
    .api-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .api-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .api-card h2 {
      color: #27ae60;
      margin-top: 0;
    }
    .api-card p {
      color: #666;
      line-height: 1.6;
    }
    .api-card a {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 20px;
      background: #27ae60;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .api-card a:hover {
      background: #229954;
    }
  </style>
</head>
<body>
  <h1>🌿 GACP Botanical Audit Framework - API Documentation</h1>
  
  <div class="api-card">
    <h2>🔐 Auth Farmer API</h2>
    <p>Authentication endpoints for farmer users including registration, login, email verification, and password reset.</p>
    <a href="/api/docs">View Documentation →</a>
  </div>

  <div class="api-card">
    <h2>📊 Additional APIs</h2>
    <p>More API documentation coming soon...</p>
  </div>
</body>
</html>
  `;

  app.get('/docs', (req, res) => {
    res.send(indexHTML);
  });

  console.log('📖 API docs index page available at: /docs');
}

module.exports = {
  mountSwagger,
  mountMultipleSpecs,
  createDocsIndex,
  loadOpenAPISpec,
};
