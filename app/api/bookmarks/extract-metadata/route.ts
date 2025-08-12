import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { metadataExtractor } from "@/lib/metadata-extractor";
import { z } from "zod";

// Request validation schema
const extractMetadataSchema = z.object({
  url: z.string().url("Invalid URL format")
});

// Simple in-memory cache for metadata (in production, use Redis or similar)
interface CachedMetadata {
  data: {
    metadata?: {
      title: string;
      description: string;
      favicon: string | null;
      imageUrl: string | null;
      siteName: string | null;
      author: string | null;
      publishedAt: Date | null;
    };
    failed?: boolean;
    error?: string;
    fallbackData?: Record<string, unknown> | null;
    url?: string;
    extractedAt?: string;
  };
  timestamp: number;
  ttl: number;
}

const metadataCache = new Map<string, CachedMetadata>();

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, {
  requests: number;
  resetTime: number;
}>();

// Configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per minute per user

/**
 * Rate limiting middleware
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userKey = `metadata_extract_${userId}`;
  
  const userLimit = rateLimitStore.get(userKey);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit window
    rateLimitStore.set(userKey, {
      requests: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (userLimit.requests >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment request count
  userLimit.requests++;
  rateLimitStore.set(userKey, userLimit);
  return true;
}

/**
 * Get cached metadata if available and not expired
 */
function getCachedMetadata(url: string) {
  const cached = metadataCache.get(url);
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  if (now > cached.timestamp + cached.ttl) {
    // Cache expired, remove it
    metadataCache.delete(url);
    return null;
  }
  
  return cached.data;
}

/**
 * Cache metadata with TTL
 */
function setCachedMetadata(url: string, data: CachedMetadata['data'], ttl: number = CACHE_TTL) {
  metadataCache.set(url, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

// POST /api/bookmarks/extract-metadata - Extract metadata from URL
export const POST = withAuth(async (user, request) => {
  try {
    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString()
          }
        }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = validateRequestBody(extractMetadataSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const { url } = validatedData;

    // Check cache first
    const cachedMetadata = getCachedMetadata(url);
    if (cachedMetadata) {
      return NextResponse.json({
        metadata: cachedMetadata.metadata,
        cached: true,
        message: "Metadata retrieved from cache"
      });
    }

    // Extract metadata using the service
    const result = await metadataExtractor.extractMetadata(url);

    if (!result.success) {
      // Handle extraction errors
      const errorResponse = {
        error: result.error || "Failed to extract metadata",
        fallbackData: result.fallbackData || null,
        url: url
      };

      // Cache failed results for a shorter time to avoid repeated failures
      setCachedMetadata(url, { failed: true, ...errorResponse }, 5 * 60 * 1000); // 5 minutes

      return NextResponse.json(errorResponse, { status: 422 });
    }

    // Cache successful result
    const responseData = {
      metadata: result.metadata,
      cached: false,
      extractedAt: new Date().toISOString()
    };

    setCachedMetadata(url, responseData);

    return NextResponse.json({
      ...responseData,
      message: "Metadata extracted successfully"
    });

  } catch (error) {
    console.error("Error extracting metadata:", error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("Invalid URL")) {
        return NextResponse.json(
          { error: "Invalid URL format provided" },
          { status: 400 }
        );
      }
      
      if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
        return NextResponse.json(
          { error: "Request timeout - the URL took too long to respond" },
          { status: 408 }
        );
      }
      
      if (error.message.includes("network") || error.message.includes("NETWORK")) {
        return NextResponse.json(
          { error: "Network error - unable to reach the URL" },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error during metadata extraction" },
      { status: 500 }
    );
  }
});

// GET method not allowed for this endpoint
export const GET = async () => {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to extract metadata." },
    { status: 405 }
  );
};