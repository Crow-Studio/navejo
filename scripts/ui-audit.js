#!/usr/bin/env node
// scripts/ui-audit.js
// Audit script to check for UI consistency issues

const fs = require('fs');
const path = require('path');

// UI consistency rules
const UI_RULES = {
  // Background and text color combinations that should be consistent
  colorCombinations: [
    { bg: 'bg-black', text: 'text-white', description: 'Black background should have white text' },
    { bg: 'bg-white', text: 'text-black', description: 'White background should have black text' },
    { bg: 'bg-gray-900', text: 'text-white', description: 'Dark gray background should have white text' },
    { bg: 'bg-gray-800', text: 'text-white', description: 'Gray-800 background should have white text' },
  ],
  
  // Button variants that should be consistent
  buttonVariants: [
    'bg-blue-600 hover:bg-blue-700 text-white', // Primary
    'bg-gray-700 hover:bg-gray-600 text-white border-gray-600', // Secondary
    'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white', // Outline
    'text-gray-400 hover:text-white hover:bg-gray-800', // Ghost
  ],
  
  // Modal/Dialog styling that should be consistent
  modalStyling: [
    'bg-gray-900 border-gray-700 text-white', // Dialog content
    'border-gray-700', // Dialog borders
  ],
  
  // Input styling that should be consistent
  inputStyling: [
    'bg-gray-800 border-gray-700 text-white placeholder-gray-400',
  ]
};

// Files to check
const COMPONENT_DIRS = [
  'components',
  'app',
];

// Files to exclude from checks
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '__tests__',
  '.test.',
  '.spec.',
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function findFiles(dir, extension = '.tsx') {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !shouldExcludeFile(fullPath)) {
        traverse(fullPath);
      } else if (stat.isFile() && fullPath.endsWith(extension) && !shouldExcludeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function checkUIConsistency() {
  console.log('🔍 Starting UI consistency audit...\n');
  
  const issues = [];
  let totalFiles = 0;
  
  for (const dir of COMPONENT_DIRS) {
    if (!fs.existsSync(dir)) continue;
    
    const files = findFiles(dir);
    totalFiles += files.length;
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileIssues = checkFileConsistency(file, content);
        issues.push(...fileIssues);
      } catch (error) {
        console.error(`❌ Error reading file ${file}:`, error.message);
      }
    }
  }
  
  // Report results
  console.log(`📊 Audit Results:`);
  console.log(`   Files checked: ${totalFiles}`);
  console.log(`   Issues found: ${issues.length}\n`);
  
  if (issues.length > 0) {
    console.log('🚨 UI Consistency Issues:\n');
    
    const groupedIssues = groupIssuesByType(issues);
    
    for (const [type, typeIssues] of Object.entries(groupedIssues)) {
      console.log(`📋 ${type}:`);
      for (const issue of typeIssues) {
        console.log(`   ❌ ${issue.file}:${issue.line} - ${issue.message}`);
      }
      console.log('');
    }
    
    return false;
  } else {
    console.log('✅ No UI consistency issues found!');
    return true;
  }
}

function checkFileConsistency(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for inconsistent color combinations
    checkColorCombinations(filePath, line, lineNumber, issues);
    
    // Check for inconsistent button styling
    checkButtonStyling(filePath, line, lineNumber, issues);
    
    // Check for modal/dialog consistency
    checkModalStyling(filePath, line, lineNumber, issues);
    
    // Check for accessibility issues
    checkAccessibility(filePath, line, lineNumber, issues);
  });
  
  return issues;
}

function checkColorCombinations(filePath, line, lineNumber, issues) {
  // Check for bg-black without text-white
  if (line.includes('bg-black') && !line.includes('text-white')) {
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'Color Consistency',
      message: 'bg-black should be paired with text-white for proper contrast'
    });
  }
  
  // Check for bg-white without text-black
  if (line.includes('bg-white') && !line.includes('text-black') && line.includes('className')) {
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'Color Consistency',
      message: 'bg-white should be paired with text-black for proper contrast'
    });
  }
}

function checkButtonStyling(filePath, line, lineNumber, issues) {
  // Check for inconsistent button styling
  if (line.includes('<Button') || line.includes('className=') && line.includes('bg-white text-black')) {
    if (line.includes('bg-white text-black hover:bg-gray-100')) {
      issues.push({
        file: filePath,
        line: lineNumber,
        type: 'Button Consistency',
        message: 'Consider using consistent button variant (bg-blue-600 hover:bg-blue-700 text-white)'
      });
    }
  }
}

function checkModalStyling(filePath, line, lineNumber, issues) {
  // Check for DialogContent without proper dark theme
  if (line.includes('DialogContent') && line.includes('text-black')) {
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'Modal Consistency',
      message: 'DialogContent should use dark theme: bg-gray-900 border-gray-700 text-white'
    });
  }
}

function checkAccessibility(filePath, line, lineNumber, issues) {
  // Check for missing alt text on images
  if (line.includes('<img') && !line.includes('alt=')) {
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'Accessibility',
      message: 'Image missing alt attribute for accessibility'
    });
  }
  
  // Check for buttons without proper labels
  if (line.includes('<button') && !line.includes('aria-label') && !line.includes('title') && line.includes('onClick')) {
    const hasTextContent = line.includes('>') && line.includes('</button>');
    if (!hasTextContent) {
      issues.push({
        file: filePath,
        line: lineNumber,
        type: 'Accessibility',
        message: 'Button without text content should have aria-label or title'
      });
    }
  }
}

function groupIssuesByType(issues) {
  return issues.reduce((groups, issue) => {
    const type = issue.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(issue);
    return groups;
  }, {});
}

// Run the audit
if (require.main === module) {
  const success = checkUIConsistency();
  process.exit(success ? 0 : 1);
}

module.exports = { checkUIConsistency };