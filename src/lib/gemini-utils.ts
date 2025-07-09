import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
 * Robust Gemini API call with retry logic and model fallback
 */
export async function generateContentWithRetry(
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

  // List of models to try in order of preference
  const modelFallbacks = [
    model,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  // Remove duplicates and filter out the originally requested model if it fails
  const uniqueModels = [...new Set(modelFallbacks)];

  let lastError: Error | null = null;

  for (const modelName of uniqueModels) {
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
        return response.text();

      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed for model ${modelName}:`, error);

        // If this is a 503 (overloaded) or 429 (rate limit) error, retry with backoff
        if (error instanceof Error && 
            (error.message.includes('503') || 
             error.message.includes('overloaded') ||
             error.message.includes('429') ||
             error.message.includes('rate limit'))) {
          
          if (attempt < maxRetries) {
            const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
            console.log(`Retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
        }

        // For other errors, try the next model immediately
        break;
      }
    }
  }

  // If all models and retries failed, throw the last error
  throw new Error(`All Gemini models failed after retries. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Utility function to sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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

/**
 * Get a fallback response for different types of AI content
 */
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
