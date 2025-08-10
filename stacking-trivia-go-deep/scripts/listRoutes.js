import listEndpoints from 'express-list-endpoints';
import fs from 'fs';

// Import the Express app
async function listRoutes() {
  try {
    // Import the server using dynamic import since it's ES modules
    const { default: app } = await import('../server.js');
    
    const routes = listEndpoints(app).map(r => ({
      path: r.path,
      methods: r.methods.map(m => m.toUpperCase())
    }));

    fs.writeFileSync('routes.json', JSON.stringify(routes, null, 2));
    console.log('Routes written to routes.json');
    console.log('\n🔍 Found routes:');
    routes.forEach(route => {
      route.methods.forEach(method => {
        console.log(`    ${method} ${route.path}`);
      });
    });
  } catch (error) {
    console.error('Error listing routes:', error);
    process.exit(1);
  }
}

listRoutes();
