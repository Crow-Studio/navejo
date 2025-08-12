// lib/server/__tests__/bookmark.test.ts
// Test data structures for bookmark functionality
// This file contains mock data and type validation for future testing

import { createBookmark, getUserBookmarks } from '../bookmark';
import type { ExtractedMetadata } from '@/lib/metadata-extractor';

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

export const mockMetadata: ExtractedMetadata = {
  title: 'Test Website',
  description: 'A test website for unit testing',
  favicon: 'https://example.com/favicon.ico',
  imageUrl: 'https://example.com/image.jpg',
  siteName: 'Example.com',
  author: 'Test Author',
  publishedAt: new Date('2024-01-01')
};

export const mockBookmarkData = {
  url: 'https://example.com/test',
  title: 'Test Bookmark',
  description: 'Test description',
  notes: 'Test notes',
  tags: ['test', 'example'],
  isPrivate: true,
  metadata: mockMetadata
};

// Type validation functions
export function validateBookmarkDataStructure(data: typeof mockBookmarkData): boolean {
  return (
    typeof data.url === 'string' &&
    typeof data.title === 'string' &&
    typeof data.metadata === 'object' &&
    Array.isArray(data.tags)
  );
}

export function validateMetadataStructure(metadata: ExtractedMetadata): boolean {
  return (
    typeof metadata.title === 'string' &&
    typeof metadata.description === 'string' &&
    (metadata.favicon === null || typeof metadata.favicon === 'string') &&
    (metadata.imageUrl === null || typeof metadata.imageUrl === 'string') &&
    (metadata.siteName === null || typeof metadata.siteName === 'string') &&
    (metadata.author === null || typeof metadata.author === 'string') &&
    (metadata.publishedAt === null || metadata.publishedAt instanceof Date)
  );
}

// Function signature validation
export function validateFunctionSignatures(): boolean {
  return (
    typeof createBookmark === 'function' &&
    typeof getUserBookmarks === 'function'
  );
}

// Run basic validation
console.log('Bookmark data structure valid:', validateBookmarkDataStructure(mockBookmarkData));
console.log('Metadata structure valid:', validateMetadataStructure(mockMetadata));
console.log('Function signatures valid:', validateFunctionSignatures());