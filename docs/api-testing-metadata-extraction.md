# Testing the Metadata Extraction API Endpoint

## Endpoint Details

**URL:** `POST /api/bookmarks/extract-metadata`

**Authentication:** Required (session cookie)

**Rate Limiting:** 30 requests per minute per user

**Caching:** 24-hour TTL for successful extractions, 5-minute TTL for failures

## Request Format

```json
{
  "url": "https://example.com"
}
```

## Response Format

### Success Response (200)
```json
{
  "metadata": {
    "title": "Example Domain",
    "description": "This domain is for use in illustrative examples...",
    "favicon": "https://example.com/favicon.ico",
    "imageUrl": "https://example.com/image.png",
    "siteName": "Example",
    "author": "John Doe",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  },
  "cached": false,
  "extractedAt": "2024-01-15T10:30:00.000Z",
  "message": "Metadata extracted successfully"
}
```

### Cached Response (200)
```json
{
  "metadata": {
    "title": "Example Domain",
    "description": "This domain is for use in illustrative examples...",
    "favicon": "https://example.com/favicon.ico",
    "imageUrl": "https://example.com/image.png",
    "siteName": "Example",
    "author": "John Doe",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  },
  "cached": true,
  "message": "Metadata retrieved from cache"
}
```

### Error Responses

#### Rate Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

#### Invalid URL (400)
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "field": "url",
      "message": "Invalid URL format"
    }
  ]
}
```

#### Extraction Failed (422)
```json
{
  "error": "HTTP 404: Not Found",
  "fallbackData": null,
  "url": "https://example.com/nonexistent"
}
```

#### Authentication Required (401)
```json
{
  "error": "Authentication required. Please log in."
}
```

## Manual Testing with cURL

### 1. First, authenticate and get a session cookie
```bash
# Sign in through the web interface first, then extract the session cookie
```

### 2. Test successful extraction
```bash
curl -X POST http://localhost:3000/api/bookmarks/extract-metadata \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_token_here" \
  -d '{"url": "https://github.com"}'
```

### 3. Test invalid URL
```bash
curl -X POST http://localhost:3000/api/bookmarks/extract-metadata \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_token_here" \
  -d '{"url": "not-a-valid-url"}'
```

### 4. Test rate limiting
```bash
# Run this command 31 times quickly to trigger rate limiting
for i in {1..31}; do
  curl -X POST http://localhost:3000/api/bookmarks/extract-metadata \
    -H "Content-Type: application/json" \
    -H "Cookie: session=your_session_token_here" \
    -d '{"url": "https://example.com"}' &
done
wait
```

### 5. Test caching
```bash
# First request (should extract)
curl -X POST http://localhost:3000/api/bookmarks/extract-metadata \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_token_here" \
  -d '{"url": "https://github.com"}'

# Second request (should return cached result)
curl -X POST http://localhost:3000/api/bookmarks/extract-metadata \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_token_here" \
  -d '{"url": "https://github.com"}'
```

## Testing with Browser DevTools

1. Open the application in your browser and sign in
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run this JavaScript code:

```javascript
// Test successful extraction
fetch('/api/bookmarks/extract-metadata', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://github.com'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));

// Test invalid URL
fetch('/api/bookmarks/extract-metadata', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'invalid-url'
  })
})
.then(response => response.json())
.then(data => console.log('Invalid URL:', data))
.catch(error => console.error('Error:', error));
```

## Expected Behavior

1. **Authentication**: All requests must include a valid session cookie
2. **Rate Limiting**: Users are limited to 30 requests per minute
3. **Caching**: Successful extractions are cached for 24 hours, failures for 5 minutes
4. **Error Handling**: Appropriate HTTP status codes and error messages for different failure scenarios
5. **Metadata Extraction**: Prioritizes Open Graph tags, then Twitter cards, then standard HTML meta tags
6. **URL Validation**: Validates and sanitizes URLs before processing
7. **Timeout Handling**: Requests timeout after 10 seconds to prevent hanging

## Features Implemented

✅ POST /api/bookmarks/extract-metadata endpoint  
✅ Integration with metadata extraction service  
✅ Response caching with TTL  
✅ Rate limiting (30 requests/minute)  
✅ Comprehensive error handling  
✅ Authentication requirement  
✅ Input validation with Zod  
✅ Proper HTTP status codes  
✅ TypeScript type safety  