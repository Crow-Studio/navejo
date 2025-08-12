// Simple test script for metadata extraction endpoint
// Run with: node scripts/test-metadata-extraction.js

const { metadataExtractor } = require('../lib/metadata-extractor');

async function testMetadataExtraction() {
  console.log('Testing metadata extraction service...\n');

  const testUrls = [
    'https://github.com',
    'https://www.example.com',
    'https://invalid-url-that-should-fail.nonexistent'
  ];

  for (const url of testUrls) {
    console.log(`Testing URL: ${url}`);
    try {
      const result = await metadataExtractor.extractMetadata(url);
      
      if (result.success) {
        console.log('✅ Success!');
        console.log('Title:', result.metadata?.title);
        console.log('Description:', result.metadata?.description?.substring(0, 100) + '...');
        console.log('Favicon:', result.metadata?.favicon);
        console.log('Image URL:', result.metadata?.imageUrl);
        console.log('Site Name:', result.metadata?.siteName);
      } else {
        console.log('❌ Failed:', result.error);
        if (result.fallbackData) {
          console.log('Fallback data available:', Object.keys(result.fallbackData));
        }
      }
    } catch (error) {
      console.log('💥 Exception:', error.message);
    }
    console.log('---\n');
  }

  // Test URL validation
  console.log('Testing URL validation...');
  const validUrls = ['https://example.com', 'http://test.com'];
  const invalidUrls = ['not-a-url', 'ftp://example.com', ''];

  validUrls.forEach(url => {
    const isValid = metadataExtractor.validateUrl(url);
    console.log(`${url}: ${isValid ? '✅' : '❌'}`);
  });

  invalidUrls.forEach(url => {
    const isValid = metadataExtractor.validateUrl(url);
    console.log(`"${url}": ${isValid ? '✅' : '❌'}`);
  });

  // Test URL sanitization
  console.log('\nTesting URL sanitization...');
  const urlsToSanitize = [
    'example.com',
    'https://example.com?utm_source=test&utm_medium=email&ref=newsletter',
    '  https://example.com/path  '
  ];

  urlsToSanitize.forEach(url => {
    try {
      const sanitized = metadataExtractor.sanitizeUrl(url);
      console.log(`"${url}" -> "${sanitized}"`);
    } catch (error) {
      console.log(`"${url}" -> Error: ${error.message}`);
    }
  });
}

// Run the test
testMetadataExtraction().catch(console.error);