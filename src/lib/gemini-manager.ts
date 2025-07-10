import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
interface ApiKey {
  key: string;
  status: 'active' | 'rate_limited' | 'failed';
  failures: number;
  lastUsed: Date | null;
  cooldownUntil: Date | null;
}

interface GenerateContentOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

// Your exact model hierarchy
const GEMINI_MODEL_HIERARCHY = [
  "gemini-2.0-flash",      // Current favorite  
  "gemini-2.0-flash-lite", // Lighter version
  "gemini-1.5-flash",      // Deprecated but works
  "gemini-1.5-flash-8b"    // Last resort
] as const;

class GeminiManager {
  private apiKeys: ApiKey[] = [];
  private currentKeyIndex = 0;
  private readonly RATE_LIMIT_COOLDOWN = 60 * 1000; // 1 minute (Gemini free tier resets every minute)
  private readonly FAILURE_THRESHOLD = 3; // Mark as failed after 3 consecutive failures

  constructor() {
    this.initializeApiKeys();
  }

  private initializeApiKeys() {
    // Get all Gemini API keys from environment
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean) as string[];

    if (keys.length === 0) {
      throw new Error('No Gemini API keys found in environment variables');
    }

    this.apiKeys = keys.map(key => ({
      key,
      status: 'active' as const,
      failures: 0,
      lastUsed: null,
      cooldownUntil: null,
    }));

    console.log(`🔑 Initialized ${this.apiKeys.length} Gemini API keys`);
  }

  private getNextAvailableKey(): ApiKey | null {
    const now = new Date();
    
    // First, recover any keys that are past their cooldown
    this.apiKeys.forEach(apiKey => {
      if (apiKey.status === 'rate_limited' && apiKey.cooldownUntil && apiKey.cooldownUntil <= now) {
        apiKey.status = 'active';
        apiKey.cooldownUntil = null;
        apiKey.failures = 0;
        console.log('🔄 API key recovered from rate limit');
      }
    });

    // Find next active key, starting from current index
    for (let i = 0; i < this.apiKeys.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
      const apiKey = this.apiKeys[keyIndex];
      
      if (apiKey.status === 'active') {
        this.currentKeyIndex = keyIndex;
        return apiKey;
      }
    }

    return null;
  }

  private markKeyAsRateLimited(key: string) {
    const apiKey = this.apiKeys.find(k => k.key === key);
    if (apiKey) {
      apiKey.status = 'rate_limited';
      apiKey.cooldownUntil = new Date(Date.now() + this.RATE_LIMIT_COOLDOWN);
      console.warn(`⏱️ API key marked as rate limited until ${apiKey.cooldownUntil.toISOString()}`);
    }
  }

  private markKeyFailure(key: string) {
    const apiKey = this.apiKeys.find(k => k.key === key);
    if (apiKey) {
      apiKey.failures++;
      if (apiKey.failures >= this.FAILURE_THRESHOLD) {
        apiKey.status = 'failed';
        console.warn(`❌ API key marked as failed after ${apiKey.failures} failures`);
      }
    }
  }

  private markKeySuccess(key: string) {
    const apiKey = this.apiKeys.find(k => k.key === key);
    if (apiKey) {
      apiKey.failures = 0;
      apiKey.lastUsed = new Date();
      if (apiKey.status === 'failed') {
        apiKey.status = 'active';
        console.log('✅ Failed API key recovered');
      }
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('503') ||
           message.includes('overloaded') ||
           message.includes('network') ||
           message.includes('timeout') ||
           message.includes('connection') ||
           message.includes('temporary');
  }

  private isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('429') ||
           message.includes('quota') ||
           message.includes('rate limit') ||
           message.includes('too many requests');
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateContent(
    prompt: string | any,
    options: GenerateContentOptions = {},
    retryOptions: RetryOptions = {}
  ): Promise<string> {
    const {
      model = "gemini-2.0-flash",
      temperature = 0.7,
      topP = 0.8,
      topK = 40,
      maxOutputTokens = 4096
    } = options;

    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2
    } = retryOptions;

    // Determine model hierarchy starting from requested model
    const startIndex = GEMINI_MODEL_HIERARCHY.findIndex(m => m === model);
    const modelsToTry = startIndex >= 0 
      ? GEMINI_MODEL_HIERARCHY.slice(startIndex)
      : GEMINI_MODEL_HIERARCHY;

    console.log(`🚀 Starting Gemini request with ${this.apiKeys.length} keys and ${modelsToTry.length} models`);

    let lastError: Error | null = null;

    // Try each API key
    for (let keyAttempt = 0; keyAttempt < this.apiKeys.length; keyAttempt++) {
      const apiKey = this.getNextAvailableKey();
      
      if (!apiKey) {
        console.warn('⚠️ No available API keys, waiting for cooldown...');
        await this.sleep(10000); // Wait 10s and try again
        continue;
      }

      console.log(`🔑 Trying API key ${keyAttempt + 1}/${this.apiKeys.length}`);
      const genAI = new GoogleGenerativeAI(apiKey.key);

      // Try each model with this key
      for (const modelName of modelsToTry) {
        console.log(`🧠 Trying model: ${modelName}`);

        // Retry logic for this specific key + model combination
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const geminiModel = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                temperature,
                topP,
                topK,
                maxOutputTokens,
              }
            });

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Success! Mark key as successful and return
            this.markKeySuccess(apiKey.key);
            console.log(`✅ Success with key ${keyAttempt + 1}, model: ${modelName}`);
            return text;

          } catch (error) {
            lastError = error as Error;
            console.warn(`❌ Attempt ${attempt + 1}/${maxRetries + 1} failed for model ${modelName}:`, error);

            // Handle rate limit errors - switch to next key immediately
            if (this.isRateLimitError(lastError)) {
              this.markKeyAsRateLimited(apiKey.key);
              console.log('🔄 Rate limited, switching to next key...');
              break; // Break out of retry loop and try next key
            }

            // Handle retryable errors - retry with this key/model
            if (this.isRetryableError(lastError) && attempt < maxRetries) {
              const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
              console.log(`⏳ Retrying in ${delay}ms...`);
              await this.sleep(delay);
              continue;
            }

            // For other errors or max retries reached, try next model
            break;
          }
        }
      }

      // If we get here, all models failed with this key
      this.markKeyFailure(apiKey.key);
      
      // Move to next key
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    }

    // If we get here, everything failed
    const errorMessage = `All Gemini API keys and models failed. Last error: ${lastError?.message || 'Unknown error'}`;
    console.error('💥 Complete failure:', errorMessage);
    throw new Error(errorMessage);
  }

  // Get status of all API keys for monitoring
  getKeysStatus() {
    return this.apiKeys.map((key, index) => ({
      index: index + 1,
      status: key.status,
      failures: key.failures,
      lastUsed: key.lastUsed?.toISOString(),
      cooldownUntil: key.cooldownUntil?.toISOString(),
    }));
  }

  // Reset all keys to active (for testing)
  resetAllKeys() {
    this.apiKeys.forEach(key => {
      key.status = 'active';
      key.failures = 0;
      key.cooldownUntil = null;
    });
    console.log('🔄 All API keys reset to active status');
  }
}

// Singleton instance
export const geminiManager = new GeminiManager();

// Convenience function to maintain compatibility with existing code
export async function generateContentWithRetry(
  prompt: string | any,
  options: GenerateContentOptions = {},
  retryOptions: RetryOptions = {}
): Promise<string> {
  return geminiManager.generateContent(prompt, options, retryOptions);
}

// Fallback responses for different content types
export function getFallbackResponse(type: 'behavioral' | 'technical' | 'general'): string {
  switch (type) {
    case 'behavioral':
      return "Sample answer: Focus on a specific situation where you demonstrated the relevant skill. Use the STAR method (Situation, Task, Action, Result) to structure your response, and highlight what you learned from the experience.";
    
    case 'technical':
      return "Analysis temporarily unavailable. Please review your solution manually and consider: 1) Does it solve the problem correctly? 2) Is the time/space complexity optimal? 3) Is the code clean and readable?";
    
    case 'general':
    default:
      return "Response temporarily unavailable due to high demand. Please try again in a few moments.";
  }
} 