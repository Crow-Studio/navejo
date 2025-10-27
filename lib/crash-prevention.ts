/**
 * Crash Prevention Utilities
 * 
 * This module provides utilities to prevent common crashes in the application,
 * especially when dealing with profile visibility changes and data inconsistencies.
 */

import { toast } from "sonner";

/**
 * Safely executes an async function with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  errorMessage?: string
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe async error:', error);
    if (errorMessage) {
      toast.error(errorMessage);
    }
    return fallback;
  }
}

/**
 * Safely accesses nested object properties
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback?: T
): T | undefined {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validates profile data to prevent crashes
 */
export function validateProfile(profile: any): boolean {
  if (!profile) return false;
  if (typeof profile !== 'object') return false;
  if (!profile.id || !profile.name) return false;
  return true;
}

/**
 * Validates bookmark data to prevent crashes
 */
export function validateBookmark(bookmark: any): boolean {
  if (!bookmark) return false;
  if (typeof bookmark !== 'object') return false;
  if (!bookmark.id || !bookmark.title || !bookmark.url) return false;
  return true;
}

/**
 * Safely filters an array, removing invalid items
 */
export function safeFilter<T>(
  array: any[],
  validator: (item: any) => boolean
): T[] {
  if (!Array.isArray(array)) return [];
  return array.filter(validator);
}

/**
 * Handles API response errors gracefully
 */
export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  try {
    return await response.json();
  } catch {
    // If response is not JSON, return empty object
    return {};
  }
}

/**
 * Debounces a function to prevent excessive calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retries an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Creates a safe URL that won't crash the app
 */
export function createSafeUrl(url: string, fallback: string = '/'): string {
  try {
    // Basic URL validation
    if (!url || typeof url !== 'string') return fallback;
    
    // Handle relative URLs
    if (url.startsWith('/')) return url;
    
    // Validate absolute URLs
    new URL(url);
    return url;
  } catch {
    return fallback;
  }
}

/**
 * Safely parses JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Checks if a value is a valid React component prop
 */
export function isValidProp(value: any): boolean {
  return value !== null && value !== undefined && typeof value !== 'function';
}

/**
 * Sanitizes user input to prevent XSS and other issues
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser behavior
      event.preventDefault();
      
      // Show user-friendly error message
      toast.error('An unexpected error occurred. Please try again.');
    });
    
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Show user-friendly error message for critical errors
      if (event.error?.message?.includes('profile') || event.error?.message?.includes('bookmark')) {
        toast.error('Content is no longer available. Refreshing...');
        setTimeout(() => window.location.reload(), 2000);
      }
    });
  }
}