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
      !r.path.match(/\/(health|login|signup)$/) &&
      (!r.middleware || !r.middleware.some(m => m.includes('auth')))
    );

    console.log('\n🔍 === Enhanced API Route Audit Results ===\n');

    if (missingInCode.length || extraInCode.length) {
      console.error('🚨 Route mismatches detected:');
      
      if (missingInCode.length) {
        console.error('\n❌ Defined in spec but missing in implementation:');
        missingInCode.forEach(r => {
          console.error(`    ${r.method.padEnd(6)} ${r.path.padEnd(30)} (${r.operationId})`);
        });
      }
      
      if (extraInCode.length) {
        console.error('\n⚠️  Implemented but not in spec:');
        extraInCode.forEach(r => {
          const security = r.middleware && r.middleware.length > 0 ? '🔒' : '🔓';
          console.error(`    ${r.method.padEnd(6)} ${r.path.padEnd(30)} ${security}`);
        });
      }

      if (unprotectedRoutes.length > 0) {
        console.error('\n🔓 Potentially unprotected API routes:');
        unprotectedRoutes.forEach(r => {
          console.error(`    ${r.method.padEnd(6)} ${r.path}`);
        });
      }

      console.error(`\n📊 Summary: ${missingInCode.length} missing, ${extraInCode.length} extra, ${unprotectedRoutes.length} unprotected\n`);
      process.exit(1);
    } else {
      console.log('✅ Perfect compliance! All routes match specification.');
      console.log(`📊 Validated ${normalizedRoutes.length} endpoints successfully.\n`);
    }

  } catch (error) {
    console.error('❌ Route comparison failed:', error.message);
    process.exit(1);
  }
}

compareRoutes();
