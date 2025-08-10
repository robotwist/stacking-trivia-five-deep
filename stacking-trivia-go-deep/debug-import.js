// Quick debug script to test if gameRoutes import is working
import gameRoutes from './src/api/game.js';

console.log('gameRoutes type:', typeof gameRoutes);
console.log('gameRoutes:', gameRoutes);

if (typeof gameRoutes === 'function') {
  console.log('✅ gameRoutes is a valid Express router');
} else {
  console.log('❌ gameRoutes is not a function - import issue');
}
