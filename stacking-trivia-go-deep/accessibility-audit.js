#!/usr/bin/env node

// Comprehensive Accessibility Audit Tool
import fs from 'fs';
import path from 'path';

console.log('🔍 DeepStack Trivia - Accessibility Audit\n');

// Color contrast issues found in code
const colorContrastIssues = [];
const missingAltText = [];
const focusIssues = [];
const semanticIssues = [];

// Scan JSX files for accessibility issues
function scanJSXFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    
    // Check for color contrast issues
    const lightTextOnLightBg = content.match(/text-amber-[0-6]00.*bg-amber-[0-6]00|text-yellow-[0-6]00.*bg-yellow-[0-6]00/g);
    if (lightTextOnLightBg) {
      colorContrastIssues.push({
        file: filename,
        issue: 'Light text on light background detected',
        matches: lightTextOnLightBg
      });
    }
    
    // Check for missing alt text on images
    const imgTags = content.match(/<img[^>]*>/g);
    if (imgTags) {
      imgTags.forEach(tag => {
        if (!tag.includes('alt=')) {
          missingAltText.push({
            file: filename,
            issue: 'Image without alt text',
            tag: tag
          });
        }
      });
    }
    
    // Check for missing labels on inputs
    const inputTags = content.match(/<input[^>]*>/g);
    if (inputTags) {
      inputTags.forEach(tag => {
        if (!tag.includes('aria-label') && !content.includes('<label')) {
          focusIssues.push({
            file: filename,
            issue: 'Input without label or aria-label',
            tag: tag
          });
        }
      });
    }
    
    // Check for semantic HTML issues
    if (content.includes('<div') && !content.includes('<main') && filename === 'App.jsx') {
      semanticIssues.push({
        file: filename,
        issue: 'Missing semantic HTML - consider using <main>, <header>, <nav>',
        suggestion: 'Use semantic HTML elements for better screen reader navigation'
      });
    }
    
    // Check for heading hierarchy
    const headings = content.match(/<h[1-6][^>]*>/g);
    if (headings) {
      let prevLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.match(/h([1-6])/)[1]);
        if (level > prevLevel + 1) {
          semanticIssues.push({
            file: filename,
            issue: `Heading level jumps from h${prevLevel} to h${level}`,
            suggestion: 'Maintain proper heading hierarchy (h1 -> h2 -> h3, etc.)'
          });
        }
        prevLevel = level;
      });
    }
    
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
  }
}

// Scan all JSX files
function scanAllFiles() {
  const srcDir = 'src';
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
        scanJSXFile(fullPath);
      }
    });
  }
  
  scanDirectory(srcDir);
}

// Specific checks for the trivia app
function checkTriviaSpecificIssues() {
  console.log('🎯 Trivia-Specific Accessibility Checks:\n');
  
  // Check GameStack component for keyboard navigation
  try {
    const gameStackContent = fs.readFileSync('src/components/GameStack.jsx', 'utf8');
    
    if (!gameStackContent.includes('onKeyDown') && !gameStackContent.includes('onKeyPress')) {
      focusIssues.push({
        file: 'GameStack.jsx',
        issue: 'Missing keyboard event handlers',
        suggestion: 'Add keyboard navigation for answer submission'
      });
    }
    
    if (!gameStackContent.includes('aria-live') && !gameStackContent.includes('role="status"')) {
      semanticIssues.push({
        file: 'GameStack.jsx',
        issue: 'Missing live region for dynamic feedback',
        suggestion: 'Add aria-live="polite" to feedback messages for screen readers'
      });
    }
  } catch (error) {
    console.log('❌ Could not analyze GameStack component');
  }
  
  // Check AuthModal for accessibility
  try {
    const authModalContent = fs.readFileSync('src/components/AuthModal.jsx', 'utf8');
    
    if (!authModalContent.includes('role="dialog"') && !authModalContent.includes('aria-modal')) {
      semanticIssues.push({
        file: 'AuthModal.jsx',
        issue: 'Modal missing proper ARIA attributes',
        suggestion: 'Add role="dialog" and aria-modal="true" to modal'
      });
    }
    
    if (!authModalContent.includes('aria-labelledby') && !authModalContent.includes('aria-describedby')) {
      semanticIssues.push({
        file: 'AuthModal.jsx',
        issue: 'Modal missing descriptive ARIA labels',
        suggestion: 'Add aria-labelledby for title and aria-describedby for description'
      });
    }
  } catch (error) {
    console.log('❌ Could not analyze AuthModal component');
  }
}

// Run the audit
scanAllFiles();
checkTriviaSpecificIssues();

// Report findings
console.log('📊 ACCESSIBILITY AUDIT RESULTS\n');

if (colorContrastIssues.length > 0) {
  console.log('🎨 COLOR CONTRAST ISSUES:');
  colorContrastIssues.forEach(issue => {
    console.log(`  ❌ ${issue.file}: ${issue.issue}`);
    if (issue.matches) {
      issue.matches.forEach(match => console.log(`     • ${match}`));
    }
  });
  console.log();
}

if (missingAltText.length > 0) {
  console.log('🖼️  MISSING ALT TEXT:');
  missingAltText.forEach(issue => {
    console.log(`  ❌ ${issue.file}: ${issue.issue}`);
    console.log(`     • ${issue.tag}`);
  });
  console.log();
}

if (focusIssues.length > 0) {
  console.log('⌨️  KEYBOARD & FOCUS ISSUES:');
  focusIssues.forEach(issue => {
    console.log(`  ❌ ${issue.file}: ${issue.issue}`);
    if (issue.tag) console.log(`     • ${issue.tag}`);
    if (issue.suggestion) console.log(`     💡 ${issue.suggestion}`);
  });
  console.log();
}

if (semanticIssues.length > 0) {
  console.log('🏗️  SEMANTIC HTML ISSUES:');
  semanticIssues.forEach(issue => {
    console.log(`  ❌ ${issue.file}: ${issue.issue}`);
    if (issue.suggestion) console.log(`     💡 ${issue.suggestion}`);
  });
  console.log();
}

// Calculate score
const totalIssues = colorContrastIssues.length + missingAltText.length + focusIssues.length + semanticIssues.length;
const maxScore = 100;
const deductionPerIssue = 5;
const score = Math.max(0, maxScore - (totalIssues * deductionPerIssue));

console.log('🏆 ACCESSIBILITY SCORE:', score + '/100');

if (totalIssues === 0) {
  console.log('✅ No major accessibility issues detected!');
} else {
  console.log(`❌ Found ${totalIssues} accessibility issues to fix`);
}

console.log('\n🔧 RECOMMENDATIONS:');
console.log('1. Fix color contrast issues first (affects readability)');
console.log('2. Add ARIA labels and semantic HTML');
console.log('3. Ensure keyboard navigation works throughout');
console.log('4. Test with a screen reader');
console.log('5. Run: npm run a11y:audit after starting server');

export { colorContrastIssues, missingAltText, focusIssues, semanticIssues, score };
