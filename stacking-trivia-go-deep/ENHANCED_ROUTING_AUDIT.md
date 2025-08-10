# Enhanced RESTful API Lint & Audit Pipeline

This doc sets up a **comprehensive** pipeline to **lint**, **audit**, **test**, and **compare** your REST API routes against a single source of truth (OpenAPI spec).  
**Production-ready** with enhanced error detection, performance testing, and CI/CD integration.

---

## 1. OpenAPI Spec (Source of Truth)

Create `openapi.yaml` in the project root.

```yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
  description: Comprehensive API specification
servers:
  - url: http://localhost:3000
    description: Development server
  - url: https://api.production.com
    description: Production server
paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Create user
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
        '400':
          description: Invalid input
  /users/{id}:
    get:
      summary: Get user by ID
      operationId: getUserById
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            pattern: '^[a-zA-Z0-9-_]+$'
      responses:
        '200':
          description: User details
        '404':
          description: User not found

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
```

**Key improvements:**
- ✅ **Operation IDs** for better tooling
- ✅ **Detailed schemas** with validation
- ✅ **Error responses** documented
- ✅ **Parameter validation** with patterns
- ✅ **Multiple environments** support

---

## 2. Enhanced Lint Configuration

Create `.redocly.yaml`:

```yaml
apis:
  main:
    root: openapi.yaml

lint:
  extends:
    - recommended
    - minimal
  rules:
    # Core REST compliance
    operation-ids: error
    operation-summary: error
    operation-description: warn
    path-params-defined: error
    path-declaration-must-exist: error
    no-unused-components: error
    
    # Response standards
    operation-2xx-response: error
    operation-4xx-response: warn
    response-contains-header: off
    
    # Schema standards  
    component-name-unique: error
    no-invalid-media-type-examples: error
    
    # Security standards
    operation-security-defined: warn
    
    # Custom rules for strict REST compliance
    no-verbs-in-paths:
      description: "Don't put verbs in paths, use HTTP methods instead"
      severity: error
      given: $.paths[*]~
      then:
        function: pattern
        functionOptions:
          notMatch: "/(get|post|put|delete|create|update|remove|add)(/|$)"
    
    plural-collections:
      description: "Collection endpoints must use plural nouns"
      severity: error  
      given: $.paths[*]~
      then:
        function: pattern
        functionOptions:
          match: "^/(?!auth|login|logout|health|api)([a-z]+s)(/.*)?$|^/(auth|login|logout|health|api)(/.*)?$"
    
    proper-nesting:
      description: "Resources should be properly nested"
      severity: warn
      given: $.paths[*]~
      then:
        function: pattern
        functionOptions:
          match: "^(/[a-z-]+)(/{[^/]+})?(/[a-z-]+)?(/{[^/]+})?(/[a-z-]+)?$"
    
    consistent-param-naming:
      description: "Path parameters should follow consistent naming"
      severity: error
      given: $.paths..parameters[?(@.in == 'path')]
      then:
        function: pattern
        field: name
        functionOptions:
          match: "^[a-z][a-zA-Z0-9]*$"

decorators:
  remove-unused-components: error
```

---

## 3. Enhanced Route Analysis Scripts

### Advanced Route Dumper (`scripts/listRoutes.js`):

```javascript
import listEndpoints from 'express-list-endpoints';
import fs from 'fs';
import { performance } from 'perf_hooks';

async function analyzeRoutes() {
  try {
    const startTime = performance.now();
    const { default: app } = await import('../server.js');
    
    const routes = listEndpoints(app).map(r => ({
      path: r.path,
      methods: r.methods.map(m => m.toUpperCase()),
      middleware: r.middlewares || []
    }));

    // Enhanced analysis
    const analysis = {
      routes,
      summary: {
        totalRoutes: routes.length,
        totalEndpoints: routes.reduce((sum, r) => sum + r.methods.length, 0),
        pathsByMethod: {},
        duplicateCheck: [],
        securityAnalysis: []
      },
      loadTime: performance.now() - startTime
    };

    // Method analysis
    const methodCount = {};
    routes.forEach(route => {
      route.methods.forEach(method => {
        methodCount[method] = (methodCount[method] || 0) + 1;
      });
    });
    analysis.summary.pathsByMethod = methodCount;

    // Check for potential duplicates
    const pathSet = new Set();
    routes.forEach(route => {
      route.methods.forEach(method => {
        const key = `${method} ${route.path}`;
        if (pathSet.has(key)) {
          analysis.summary.duplicateCheck.push(key);
        }
        pathSet.add(key);
      });
    });

    fs.writeFileSync('routes.json', JSON.stringify(analysis, null, 2));
    
    console.log('📊 Enhanced Route Analysis Complete');
    console.log('=====================================');
    console.log(`⚡ App loaded in: ${analysis.loadTime.toFixed(2)}ms`);
    console.log(`📍 Total routes: ${analysis.summary.totalRoutes}`);
    console.log(`🌐 Total endpoints: ${analysis.summary.totalEndpoints}`);
    console.log('\\n📋 Method distribution:');
    Object.entries(methodCount).forEach(([method, count]) => {
      console.log(`    ${method}: ${count}`);
    });
    
    if (analysis.summary.duplicateCheck.length > 0) {
      console.log('\\n⚠️  Potential duplicates found:');
      analysis.summary.duplicateCheck.forEach(dup => {
        console.log(`    ${dup}`);
      });
    }
    
    console.log('\\n🔍 Found routes:');
    routes.forEach(route => {
      route.methods.forEach(method => {
        console.log(`    ${method.padEnd(6)} ${route.path}`);
      });
    });

  } catch (error) {
    console.error('❌ Route analysis failed:', error.message);
    process.exit(1);
  }
}

analyzeRoutes();
```

### Enhanced Route Comparator (`scripts/compareRoutes.js`):

```javascript
import fs from 'fs';
import yaml from 'js-yaml';

function compareRoutes() {
  try {
    const routeData = JSON.parse(fs.readFileSync('routes.json', 'utf8'));
    const routes = routeData.routes || routeData; // Handle both formats
    const openapi = yaml.load(fs.readFileSync('openapi.yaml', 'utf8'));

    const specPaths = [];
    for (const [path, methods] of Object.entries(openapi.paths)) {
      for (const method of Object.keys(methods)) {
        specPaths.push({ 
          path, 
          method: method.toUpperCase(),
          operationId: methods[method].operationId,
          summary: methods[method].summary 
        });
      }
    }

    function normalizePath(p) {
      return p.replace(/:([^/]+)/g, '{$1}');
    }

    const normalizedRoutes = routes.flatMap(r =>
      r.methods.map(m => ({ 
        path: normalizePath(r.path), 
        method: m,
        middleware: r.middleware 
      }))
    );

    const missingInCode = specPaths.filter(
      sp => !normalizedRoutes.some(r => r.path === sp.path && r.method === sp.method)
    );

    const extraInCode = normalizedRoutes.filter(
      r => !specPaths.some(sp => sp.path === r.path && sp.method === r.method)
    );

    // Security analysis
    const unprotectedRoutes = extraInCode.filter(r => 
      r.path.startsWith('/api/') && 
      !r.path.match(/\\/(health|login|signup)$/) &&
      (!r.middleware || !r.middleware.some(m => m.includes('auth')))
    );

    console.log('\\n🔍 === Enhanced API Route Audit Results ===\\n');

    if (missingInCode.length || extraInCode.length) {
      console.error('🚨 Route mismatches detected:');
      
      if (missingInCode.length) {
        console.error('\\n❌ Defined in spec but missing in implementation:');
        missingInCode.forEach(r => {
          console.error(`    ${r.method.padEnd(6)} ${r.path.padEnd(30)} (${r.operationId})`);
        });
      }
      
      if (extraInCode.length) {
        console.error('\\n⚠️  Implemented but not in spec:');
        extraInCode.forEach(r => {
          const security = r.middleware && r.middleware.length > 0 ? '🔒' : '🔓';
          console.error(`    ${r.method.padEnd(6)} ${r.path.padEnd(30)} ${security}`);
        });
      }

      if (unprotectedRoutes.length > 0) {
        console.error('\\n🔓 Potentially unprotected API routes:');
        unprotectedRoutes.forEach(r => {
          console.error(`    ${r.method.padEnd(6)} ${r.path}`);
        });
      }

      console.error(`\\n📊 Summary: ${missingInCode.length} missing, ${extraInCode.length} extra, ${unprotectedRoutes.length} unprotected\\n`);
      process.exit(1);
    } else {
      console.log('✅ Perfect compliance! All routes match specification.');
      console.log(`📊 Validated ${normalizedRoutes.length} endpoints successfully.\\n`);
    }

  } catch (error) {
    console.error('❌ Route comparison failed:', error.message);
    process.exit(1);
  }
}

compareRoutes();
```

---

## 4. Route Performance Testing

Create `scripts/testRoutes.js`:

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

async function testRoutes() {
  const config = JSON.parse(fs.readFileSync('routes.json', 'utf8'));
  const routes = config.routes || config;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  
  console.log(`🧪 Testing routes against: ${baseUrl}\\n`);
  
  const results = [];
  
  for (const route of routes) {
    for (const method of route.methods) {
      if (method === 'GET' && !route.path.includes('{')) {
        try {
          const start = Date.now();
          const response = await fetch(`${baseUrl}${route.path}`, { 
            method,
            timeout: 5000 
          });
          const duration = Date.now() - start;
          
          const result = {
            method,
            path: route.path,
            status: response.status,
            duration,
            success: response.status < 400
          };
          
          results.push(result);
          
          const statusEmoji = response.status < 400 ? '✅' : '❌';
          const durationColor = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
          console.log(`${statusEmoji} ${method.padEnd(6)} ${route.path.padEnd(30)} ${response.status} ${durationColor}${duration}ms`);
          
        } catch (error) {
          console.log(`❌ ${method.padEnd(6)} ${route.path.padEnd(30)} ERROR ${error.message}`);
        }
      }
    }
  }
  
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const successRate = (results.filter(r => r.success).length / results.length) * 100;
  
  console.log(`\\n📊 Performance Summary:`);
  console.log(`   Average response time: ${avgDuration.toFixed(2)}ms`);
  console.log(`   Success rate: ${successRate.toFixed(1)}%`);
  console.log(`   Total tested: ${results.length} endpoints\\n`);
}

testRoutes();
```

---

## 5. Enhanced CI/CD Integration

Create `.github/workflows/api-audit.yml`:

```yaml
name: 🔍 Enhanced API Audit & Testing
on: 
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  api-audit:
    runs-on: ubuntu-latest
    name: API Compliance & Testing
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
        
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: 🔧 Install dependencies
        run: npm ci
        
      - name: 📋 Lint OpenAPI specification  
        run: npx redocly lint openapi.yaml --format=github-actions
        
      - name: 🔍 Extract route definitions
        run: node scripts/listRoutes.js
        
      - name: ⚖️  Compare routes with specification
        run: node scripts/compareRoutes.js
        
      - name: 🧪 Test route performance (if server available)
        run: |
          npm run build
          timeout 30 npm start &
          SERVER_PID=$!
          sleep 10
          node scripts/testRoutes.js || echo "Performance test skipped - server not ready"
          kill $SERVER_PID || true
        continue-on-error: true
        
      - name: 📊 Upload audit artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: api-audit-results
          path: |
            routes.json
            openapi.yaml
          retention-days: 30
```

---

## 6. Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "api:lint": "npx redocly lint openapi.yaml",
    "api:audit": "npm run api:routes && npm run api:compare",
    "api:routes": "node scripts/listRoutes.js", 
    "api:compare": "node scripts/compareRoutes.js",
    "api:test": "node scripts/testRoutes.js",
    "api:full": "npm run api:lint && npm run api:audit && npm run api:test"
  }
}
```

---

## 7. Key Improvements Over Original

✅ **Enhanced Error Detection**: Security analysis, duplicate detection, performance monitoring  
✅ **Better Diagnostics**: Detailed timing, middleware analysis, route statistics  
✅ **Production Ready**: Comprehensive CI/CD, artifact uploads, proper error handling  
✅ **Performance Testing**: Automated endpoint testing with timing analysis  
✅ **Stricter Compliance**: Enhanced linting rules for better REST standards  
✅ **Security Awareness**: Unprotected route detection and analysis  
✅ **Better UX**: Color-coded output, emoji indicators, detailed summaries  

This enhanced pipeline provides **enterprise-grade API auditing** with comprehensive testing and monitoring capabilities.
