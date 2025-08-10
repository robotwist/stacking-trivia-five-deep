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
    console.log('\n📋 Method distribution:');
    Object.entries(methodCount).forEach(([method, count]) => {
      console.log(`    ${method}: ${count}`);
    });
    
    if (analysis.summary.duplicateCheck.length > 0) {
      console.log('\n⚠️  Potential duplicates found:');
      analysis.summary.duplicateCheck.forEach(dup => {
        console.log(`    ${dup}`);
      });
    }
    
    console.log('\n🔍 Found routes:');
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
