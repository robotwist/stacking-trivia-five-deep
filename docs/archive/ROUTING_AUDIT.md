# RESTful API Lint & Audit Pipeline

This doc sets up a portable pipeline to **lint**, **audit**, and **compare** your REST API routes against a single source of truth (OpenAPI spec).  
Copy this into any project and adapt paths/names as needed.

---

## 1. OpenAPI Spec (Source of Truth)

Create `openapi.yaml` in the project root.

```yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: OK
    post:
      summary: Create user
      responses:
        '201':
          description: Created
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
Keep all intended routes in here. If it’s not in the spec, it doesn’t exist.

2. Install Tools
bash
Copy
Edit
npm install --save-dev @redocly/cli express-list-endpoints js-yaml
3. Lint Config
Create .redocly.yaml:

yaml
Copy
Edit
lint:
  extends:
    - recommended
  rules:
    operation-ids: error
    path-params-defined: error
    path-declaration-must-exist: error
    no-unused-components: warn
    operation-summary: error
  # Custom rule: ban verbs in paths
  no-verbs-in-paths:
    description: "Don't put verbs in paths, use HTTP methods instead."
    severity: error
    given: $.paths[*]~
    then:
      function: pattern
      functionOptions:
        notMatch: "(get|create|update|delete)"
4. Route Dumper Script
scripts/listRoutes.js:

js
Copy
Edit
const listEndpoints = require('express-list-endpoints');
const app = require('../app'); // path to your Express app
const fs = require('fs');

const routes = listEndpoints(app).map(r => ({
  path: r.path,
  methods: r.methods.map(m => m.toUpperCase())
}));

fs.writeFileSync('routes.json', JSON.stringify(routes, null, 2));
console.log('Routes written to routes.json');
5. Route Comparison Script
scripts/compareRoutes.js:

js
Copy
Edit
const fs = require('fs');
const yaml = require('js-yaml');

const routes = JSON.parse(fs.readFileSync('routes.json', 'utf8'));
const openapi = yaml.load(fs.readFileSync('openapi.yaml', 'utf8'));

const specPaths = [];
for (const [path, methods] of Object.entries(openapi.paths)) {
  for (const method of Object.keys(methods)) {
    specPaths.push({ path, method: method.toUpperCase() });
  }
}

function normalizePath(p) {
  // Express uses :param, OpenAPI uses {param}
  return p.replace(/:([^/]+)/g, '{$1}');
}

const normalizedRoutes = routes.flatMap(r =>
  r.methods.map(m => ({ path: normalizePath(r.path), method: m }))
);

// Missing in code but in spec
const missingInCode = specPaths.filter(
  sp => !normalizedRoutes.some(r => r.path === sp.path && r.method === sp.method)
);

// Extra in code but not in spec
const extraInCode = normalizedRoutes.filter(
  r => !specPaths.some(sp => sp.path === r.path && sp.method === r.method)
);

if (missingInCode.length || extraInCode.length) {
  console.error('Route mismatches found:');
  if (missingInCode.length) {
    console.error('\nIn spec but missing in code:');
    missingInCode.forEach(r => console.error(`  ${r.method} ${r.path}`));
  }
  if (extraInCode.length) {
    console.error('\nIn code but not in spec:');
    extraInCode.forEach(r => console.error(`  ${r.method} ${r.path}`));
  }
  process.exit(1);
} else {
  console.log('All routes match spec.');
}
6. CI Integration (GitHub Actions)
.github/workflows/lint-api.yml:

yaml
Copy
Edit
name: API Lint & Audit
on: [push, pull_request]

jobs:
  lint-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx redocly lint openapi.yaml
      - run: node scripts/listRoutes.js
      - run: node scripts/compareRoutes.js
7. Workflow Summary
Define endpoints in openapi.yaml.

Lint the spec with Redocly (npx redocly lint openapi.yaml).

Dump Express routes to routes.json.

Compare actual routes to the spec.

CI fails if they differ.

Why This Works
Spec-first ensures your design follows REST conventions before code is written.

Linting enforces naming, HTTP method use, and structure.

Comparison catches drift between spec and implementation.

CI fail keeps rogue routes out of production.
rules:
  # Already existing rules...
  operation-ids: error
  path-params-defined: error
  path-declaration-must-exist: error
  no-unused-components: warn
  operation-summary: error

  # Custom: ban verbs in paths
  no-verbs-in-paths:
    description: "Don't put verbs in paths, use HTTP methods instead."
    severity: error
    given: $.paths[*]~
    then:
      function: pattern
      functionOptions:
        notMatch: "(get|create|update|delete)"

  # Custom: enforce plural nouns for collections
  plural-resource-names:
    description: "Top-level resources must be plural."
    severity: error
    given: $.paths[*]~
    then:
      function: pattern
      functionOptions:
        match: "^/(?!auth|login|logout)([a-z]+s)(/|$)"

  # Custom: enforce path params only at the end or clearly nested
  path-param-position:
    description: "Path parameters must be at the end of the resource or in a subresource segment."
    severity: error
    given: $.paths[*]~
    then:
      function: pattern
      functionOptions:
        match: "^(/[a-z]+s)(/{[^/]+})?(/[a-z]+s)?(/{[^/]+})?$"

---

**repeatable, portable REST auditing** anywhere.  
