// Legacy compatibility layer - now uses the enhanced GeminiManager
import { generateContentWithRetry as newGenerateContentWithRetry, getFallbackResponse as newGetFallbackResponse } from './gemini-manager';

// Re-export with same interface for backward compatibility
export const generateContentWithRetry = newGenerateContentWithRetry;

// Keep these interfaces for backward compatibility
interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface GenerateContentOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

/**
 * Check if an error is retryable (503, 429, network errors)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return message.includes('503') ||
         message.includes('overloaded') ||
         message.includes('429') ||
         message.includes('rate limit') ||
         message.includes('network') ||
         message.includes('timeout') ||
         message.includes('connection');
}

// Re-export getFallbackResponse for backward compatibility
export const getFallbackResponse = newGetFallbackResponse;
