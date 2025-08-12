// Test script for TagInput component functionality
// This script tests the tag API endpoints

const API_BASE = 'http://localhost:3000/api';

async function testTagAPI() {
  console.log('🧪 Testing Tag API endpoints...\n');

  try {
    // Test GET /api/tags
    console.log('1. Testing GET /api/tags...');
    const response = await fetch(`${API_BASE}/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET /api/tags successful');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.json();
      console.log('❌ GET /api/tags failed');
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n📝 Tag API test completed');
}

// Test with different query parameters
async function testTagAPIWithParams() {
  console.log('\n🔍 Testing Tag API with query parameters...\n');

  const testCases = [
    { query: 'javascript', description: 'Search for "javascript" tags' },
    { query: 'react', description: 'Search for "react" tags' },
    { limit: '5', description: 'Limit results to 5 tags' },
    { workspaceId: 'test-workspace', description: 'Filter by workspace' },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.description}`);
      const params = new URLSearchParams(testCase);
      const response = await fetch(`${API_BASE}/tags?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success');
        console.log(`Found ${data.tags?.length || 0} tags`);
      } else {
        const error = await response.json();
        console.log('❌ Failed:', error.error);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');
  }
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testTagAPI().then(() => testTagAPIWithParams());
} else {
  // Browser environment
  testTagAPI().then(() => testTagAPIWithParams());
}

console.log(`
📋 Tag Input Component Test Instructions:

1. Start the development server: npm run dev
2. Open the browser and navigate to a page with the TagInput component
3. Test the following functionality:

   ✅ Basic Tag Input:
   - Click the tag input field
   - Type a tag name and press Enter
   - Verify the tag appears as a badge
   - Try removing tags by clicking the X button

   ✅ Autocomplete:
   - Type partial tag names
   - Verify existing tags appear in dropdown
   - Select tags from the dropdown

   ✅ Tag Creation:
   - Type a new tag name that doesn't exist
   - Verify "Create [tag name]" option appears
   - Select it to create a new tag

   ✅ Validation:
   - Try adding duplicate tags (should show error)
   - Try adding empty tags (should show error)
   - Try adding very long tag names (should show error)
   - Try adding more than the maximum allowed tags

   ✅ Workspace Context:
   - Test in different workspace contexts
   - Verify tags are filtered by workspace when applicable

   ✅ Keyboard Navigation:
   - Use arrow keys to navigate dropdown
   - Use Enter to select tags
   - Use Escape to close dropdown
   - Use Backspace to remove last tag when input is empty

4. Check the browser console for any errors
5. Verify the tag data is properly sent when submitting forms
`);