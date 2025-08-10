import fs from 'fs';
import yaml from 'js-yaml';

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

console.log('\n=== API Route Audit Results ===\n');

if (missingInCode.length || extraInCode.length) {
  console.error('🚨 Route mismatches found:');
  if (missingInCode.length) {
    console.error('\n❌ In spec but missing in code:');
    missingInCode.forEach(r => console.error(`    ${r.method} ${r.path}`));
  }
  if (extraInCode.length) {
    console.error('\n⚠️  In code but not in spec:');
    extraInCode.forEach(r => console.error(`    ${r.method} ${r.path}`));
  }
  console.error('\n');
  process.exit(1);
} else {
  console.log('✅ All routes match spec perfectly!');
}
