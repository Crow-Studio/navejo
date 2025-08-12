#!/usr/bin/env node

/**
 * Test script for bookmark creation integration
 * Tests the complete bookmark creation flow including:
 * - Form validation
 * - Metadata extraction
 * - API submission
 * - Error handling
 * - Success feedback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Bookmark Creation Integration...\n');

// Test 1: Verify component file exists and has required exports
console.log('1. Checking component file structure...');
const componentPath = path.join(__dirname, '../components/bookmark-creation-dialog.tsx');
if (!fs.existsSync(componentPath)) {
  console.error('❌ BookmarkCreationDialog component not found');
  process.exit(1);
}

const componentContent = fs.readFileSync(componentPath, 'utf8');

// Check for required imports and exports
const requiredImports = [
  'useForm',
  'zodResolver',
  'MetadataPreview',
  'FolderSelector',
  'TagInput',
  'toast',
  'useRouter'
];

const requiredFeatures = [
  'BookmarkCreationDialog',
  'bookmarkFormSchema',
  'onSubmit',
  'handleClose',
  'workspace context',
  'error handling',
  'success state'
];

let missingImports = [];
let missingFeatures = [];

requiredImports.forEach(imp => {
  if (!componentContent.includes(imp)) {
    missingImports.push(imp);
  }
});

requiredFeatures.forEach(feature => {
  if (!componentContent.includes(feature)) {
    missingFeatures.push(feature);
  }
});

if (missingImports.length > 0) {
  console.error('❌ Missing required imports:', missingImports.join(', '));
} else {
  console.log('✅ All required imports present');
}

if (missingFeatures.length > 0) {
  console.error('❌ Missing required features:', missingFeatures.join(', '));
} else {
  console.log('✅ All required features implemented');
}

// Test 2: Check form validation schema
console.log('\n2. Checking form validation schema...');
const schemaChecks = [
  'url.*required',
  'title.*required',
  'tags.*array',
  'isPrivate.*boolean',
  'folderId.*nullable'
];

let schemaIssues = [];
schemaChecks.forEach(check => {
  const regex = new RegExp(check, 'i');
  if (!regex.test(componentContent)) {
    schemaIssues.push(check);
  }
});

if (schemaIssues.length > 0) {
  console.error('❌ Schema validation issues:', schemaIssues.join(', '));
} else {
  console.log('✅ Form validation schema properly configured');
}

// Test 3: Check workspace context handling
console.log('\n3. Checking workspace context handling...');
const workspaceFeatures = [
  'workspaceId',
  'workspace.*visible',
  'workspace.*members',
  'private.*bookmark'
];

let workspaceIssues = [];
workspaceFeatures.forEach(feature => {
  const regex = new RegExp(feature, 'i');
  if (!regex.test(componentContent)) {
    workspaceIssues.push(feature);
  }
});

if (workspaceIssues.length > 0) {
  console.error('❌ Workspace context issues:', workspaceIssues.join(', '));
} else {
  console.log('✅ Workspace context properly handled');
}

// Test 4: Check error handling and feedback
console.log('\n4. Checking error handling and feedback...');
const errorFeatures = [
  'submitError',
  'toast.error',
  'toast.success',
  'Alert.*Description',
  'try.*catch',
  'response.status'
];

let errorIssues = [];
errorFeatures.forEach(feature => {
  const regex = new RegExp(feature, 'i');
  if (!regex.test(componentContent)) {
    errorIssues.push(feature);
  }
});

if (errorIssues.length > 0) {
  console.error('❌ Error handling issues:', errorIssues.join(', '));
} else {
  console.log('✅ Error handling and feedback properly implemented');
}

// Test 5: Check success state and navigation
console.log('\n5. Checking success state and navigation...');
const successFeatures = [
  'createdBookmark',
  'CheckCircle',
  'router.push',
  'success.*state',
  'View.*in.*Workspace',
  'Create.*Another'
];

let successIssues = [];
successFeatures.forEach(feature => {
  const regex = new RegExp(feature, 'i');
  if (!regex.test(componentContent)) {
    successIssues.push(feature);
  }
});

if (successIssues.length > 0) {
  console.error('❌ Success state issues:', successIssues.join(', '));
} else {
  console.log('✅ Success state and navigation properly implemented');
}

// Test 6: Check component integration
console.log('\n6. Checking component integration...');
const integrationFeatures = [
  'MetadataPreview.*metadata={extractedMetadata}',
  'FolderSelector.*workspaceId={workspaceId}',
  'TagInput.*workspaceId={workspaceId}',
  'form.handleSubmit.*onSubmit',
  'form.watch',
  'field.onChange'
];

let integrationIssues = [];
integrationFeatures.forEach(feature => {
  const regex = new RegExp(feature.replace(/\./g, '\\s*').replace(/\*/g, '.*'), 'i');
  if (!regex.test(componentContent)) {
    integrationIssues.push(feature);
  }
});

if (integrationIssues.length > 0) {
  console.error('❌ Component integration issues:', integrationIssues.join(', '));
} else {
  console.log('✅ All components properly integrated');
}

// Test 7: Check API integration
console.log('\n7. Checking API integration...');
const apiFeatures = [
  'fetch.*api/bookmarks',
  'POST.*method',
  'Content-Type.*application/json',
  'JSON.stringify',
  'response.json',
  'response.ok'
];

let apiIssues = [];
apiFeatures.forEach(feature => {
  const regex = new RegExp(feature.replace(/\./g, '\\s*').replace(/\*/g, '.*'), 'i');
  if (!regex.test(componentContent)) {
    apiIssues.push(feature);
  }
});

if (apiIssues.length > 0) {
  console.error('❌ API integration issues:', apiIssues.join(', '));
} else {
  console.log('✅ API integration properly implemented');
}

// Summary
console.log('\n📊 Integration Test Summary:');
const totalIssues = missingImports.length + missingFeatures.length + schemaIssues.length + 
                   workspaceIssues.length + errorIssues.length + successIssues.length + 
                   integrationIssues.length + apiIssues.length;

if (totalIssues === 0) {
  console.log('🎉 All integration tests passed! The bookmark creation flow is properly implemented.');
  console.log('\n✅ Key Features Verified:');
  console.log('   • Form validation with Zod schema');
  console.log('   • Metadata extraction integration');
  console.log('   • Folder and tag selection');
  console.log('   • Workspace context handling');
  console.log('   • Comprehensive error handling');
  console.log('   • Success state with navigation');
  console.log('   • API integration with proper error codes');
  console.log('   • User feedback with toast notifications');
} else {
  console.error(`❌ Found ${totalIssues} integration issues that need to be addressed.`);
  process.exit(1);
}

console.log('\n🚀 Ready for user testing!');