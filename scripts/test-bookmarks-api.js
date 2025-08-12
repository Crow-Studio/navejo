// Test script for bookmarks API
async function testBookmarksAPI() {
  try {
    console.log('Testing bookmarks API...');
    
    // Test the debug endpoint first
    const debugResponse = await fetch('http://localhost:3000/api/debug/bookmarks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Debug response status:', debugResponse.status);
    
    if (debugResponse.status === 401) {
      console.log('✅ Debug API endpoint exists and requires authentication (expected)');
    } else if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Debug response:', debugData);
    } else {
      console.log('❌ Unexpected debug response:', await debugResponse.text());
    }

    // Test the main bookmarks endpoint
    const bookmarksResponse = await fetch('http://localhost:3000/api/bookmarks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Bookmarks response status:', bookmarksResponse.status);
    
    if (bookmarksResponse.status === 401) {
      console.log('✅ Bookmarks API endpoint exists and requires authentication (expected)');
    } else if (bookmarksResponse.ok) {
      const bookmarksData = await bookmarksResponse.json();
      console.log('✅ Bookmarks response:', bookmarksData);
    } else {
      console.log('❌ Unexpected bookmarks response:', await bookmarksResponse.text());
    }

  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
  }
}

// Run the test
testBookmarksAPI();