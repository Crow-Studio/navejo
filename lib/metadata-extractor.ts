import { z } from 'zod';

// Types for extracted metadata
export interface ExtractedMetadata {
  title: string;
  description: string;
  favicon: string | null;
  imageUrl: string | null;
  siteName: string | null;
  author: string | null;
  publishedAt: Date | null;
}

export interface MetadataExtractionResult {
  success: boolean;
  metadata?: ExtractedMetadata;
  error?: string;
  fallbackData?: Partial<ExtractedMetadata>;
}

// URL validation schema
const urlSchema = z.string().url();

// Constants
const EXTRACTION_TIMEOUT = 10000; // 10 seconds
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const USER_AGENT = 'Mozilla/5.0 (compatible; NavejoBotMetadataExtractor/1.0)';

export class MetadataExtractor {
  /**
   * Validates if a URL is properly formatted
   */
  validateUrl(url: string): boolean {
    try {
      urlSchema.parse(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitizes and normalizes a URL
   */
  sanitizeUrl(url: string): string {
    try {
      // Remove leading/trailing whitespace
      url = url.trim();
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Parse and reconstruct URL to normalize it
      const parsedUrl = new URL(url);
      
      // Remove tracking parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'ref', 'source'
      ];
      
      trackingParams.forEach(param => {
        parsedUrl.searchParams.delete(param);
      });
      
      return parsedUrl.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Extracts metadata from a URL
   */
  async extractMetadata(url: string): Promise<MetadataExtractionResult> {
    try {
      // Validate and sanitize URL
      if (!this.validateUrl(url)) {
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }

      const sanitizedUrl = this.sanitizeUrl(url);
      
      // Fetch page content with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EXTRACTION_TIMEOUT);
      
      const response = await fetch(sanitizedUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        return {
          success: false,
          error: 'URL does not point to an HTML page'
        };
      }

      const html = await response.text();
      const metadata = await this.parseHtmlMetadata(html, sanitizedUrl);

      return {
        success: true,
        metadata
      };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - page took too long to load'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred during metadata extraction'
      };
    }
  }

  /**
   * Parses HTML content to extract metadata
   */
  private async parseHtmlMetadata(html: string, url: string): Promise<ExtractedMetadata> {
    // Create a simple HTML parser using regex (for server-side compatibility)
    const getMetaContent = (property: string): string | null => {
      const patterns = [
        new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+property=["']${property}["']`, 'i'),
        new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+name=["']${property}["']`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return this.decodeHtmlEntities(match[1].trim());
        }
      }
      return null;
    };

    const getTitle = (): string => {
      // Priority: og:title > twitter:title > title tag
      return getMetaContent('og:title') ||
             getMetaContent('twitter:title') ||
             this.extractTitleTag(html) ||
             'Untitled';
    };

    const getDescription = (): string => {
      // Priority: og:description > twitter:description > meta description
      return getMetaContent('og:description') ||
             getMetaContent('twitter:description') ||
             getMetaContent('description') ||
             '';
    };

    const getImageUrl = async (): Promise<string | null> => {
      // Priority: og:image > twitter:image > first suitable img tag
      let imageUrl = getMetaContent('og:image') ||
                     getMetaContent('twitter:image') ||
                     getMetaContent('twitter:image:src');
      
      if (!imageUrl) {
        imageUrl = this.extractFirstImage(html);
      }
      
      if (imageUrl) {
        imageUrl = this.resolveUrl(imageUrl, url);
        const isValid = await this.validateImageUrl(imageUrl);
        return isValid ? imageUrl : null;
      }
      
      return null;
    };

    const getFavicon = (): string | null => {
      const faviconPatterns = [
        /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i
      ];
      
      for (const pattern of faviconPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return this.resolveUrl(match[1], url);
        }
      }
      
      // Fallback to default favicon location
      try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
      } catch {
        return null;
      }
    };

    const getSiteName = (): string | null => {
      return getMetaContent('og:site_name') ||
             getMetaContent('application-name') ||
             null;
    };

    const getAuthor = (): string | null => {
      return getMetaContent('author') ||
             getMetaContent('article:author') ||
             null;
    };

    const getPublishedAt = (): Date | null => {
      const dateStr = getMetaContent('article:published_time') ||
                      getMetaContent('datePublished') ||
                      getMetaContent('date');
      
      if (dateStr) {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    };

    return {
      title: getTitle(),
      description: getDescription(),
      imageUrl: await getImageUrl(),
      favicon: getFavicon(),
      siteName: getSiteName(),
      author: getAuthor(),
      publishedAt: getPublishedAt()
    };
  }

  /**
   * Extracts title from HTML title tag
   */
  private extractTitleTag(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? this.decodeHtmlEntities(match[1].trim()) : null;
  }

  /**
   * Extracts the first suitable image from HTML content
   */
  private extractFirstImage(html: string): string | null {
    const imgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgPattern.exec(html)) !== null) {
      const src = match[1];
      if (src && !src.startsWith('data:') && this.isLikelyContentImage(src)) {
        return src;
      }
    }
    
    return null;
  }

  /**
   * Checks if an image URL is likely to be a content image (not icon/logo)
   */
  private isLikelyContentImage(src: string): boolean {
    const lowercaseSrc = src.toLowerCase();
    
    // Skip common icon/logo patterns
    const skipPatterns = [
      'icon', 'logo', 'favicon', 'sprite', 'button', 'badge',
      'avatar', 'profile', 'thumb', 'small'
    ];
    
    return !skipPatterns.some(pattern => lowercaseSrc.includes(pattern));
  }

  /**
   * Resolves relative URLs to absolute URLs
   */
  private resolveUrl(relativeUrl: string, baseUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).toString();
    } catch {
      return relativeUrl;
    }
  }

  /**
   * Validates if an image URL is accessible and meets size requirements
   */
  private async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for images
      
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': USER_AGENT
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return false;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return false;
      }
      
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Decodes HTML entities in text content
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' '
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
      return entities[entity] || entity;
    });
  }
}

// Export singleton instance
export const metadataExtractor = new MetadataExtractor();