// Test script for dashboard stats API
const fetch = require('node-fetch');

async function testDashboardStats() {
  try {
    console.log('Testing dashboard stats API...');
    
    // This would normally require authentication
    // For testing purposes, we'll just check if the endpoint exists
    const response = await fetch('http://localhost:3000/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ API endpoint exists and requires authentication (expected)');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard stats response:', data);
    } else {
      console.log('❌ Unexpected response:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error testing dashboard stats:', error.message);
  }
}

// Run the test
testDashboardStats();