// Test script for profile API
const testProfileAPI = async () => {
  try {
    console.log('Testing Profile API...')
    
    // Test data
    const testData = {
      displayName: "Test User",
      bio: "This is a test bio",
      isPublic: true
    }
    
    console.log('Sending PUT request with data:', testData)
    
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    console.log('Response status:', response.status)
    
    const result = await response.json()
    console.log('Response body:', result)
    
    if (!response.ok) {
      console.error('API Error:', result.error)
    } else {
      console.log('✅ Profile API test successful!')
    }
    
  } catch (error) {
    console.error('❌ Profile API test failed:', error)
  }
}

// Run the test
testProfileAPI()