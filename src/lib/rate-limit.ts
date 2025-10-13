import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory store for rate limiting
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;   // Time window in milliseconds
  max: number;        // Maximum number of requests in the time window
  message?: string;   // Message to return when limit is reached
}

/**
 * Creates a rate limiter middleware for Next.js API routes (Pages Router)
 */
export function rateLimiter(options: RateLimitOptions) {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 5,             // 5 requests per minute by default
    message = 'Too many requests, please try again later.',
  } = options;

  return async function rateLimit(
    req: NextApiRequest,
    res: NextApiResponse,
    next?: () => void
  ) {
    const ip = req.headers['x-forwarded-for'] || 'unknown';
    const key = `rate-limit:${ip}:${req.url}`;
    const now = Date.now();
    
    // Clean up expired entries
    for (const [storeKey, data] of inMemoryStore.entries()) {
      if (now > data.resetTime) {
        inMemoryStore.delete(storeKey);
      }
    }

    // Get or initialize the record
    const record = inMemoryStore.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    // Increment the counter
    record.count += 1;

    // Check if the rate limit is exceeded
    if (record.count > max) {
      res.status(429).json({ error: message });
      return;
    }

    // Store the updated record
    inMemoryStore.set(key, record);

    // Continue to the next middleware/handler
    if (next) next();
  };
}

/**
 * Helper function to apply rate limiting to API Route Handler in App Router
 */
export async function applyRateLimit(
  req: Request,
  options: RateLimitOptions
): Promise<{ success: boolean; message?: string }> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(req.url).pathname;
  
  const key = `rate-limit:${ip}:${url}`;
  const now = Date.now();
  
  // Simple in-memory implementation
  // Clean up expired entries
  for (const [storeKey, data] of inMemoryStore.entries()) {
    if (now > data.resetTime) {
      inMemoryStore.delete(storeKey);
    }
  }
  
  // Get or initialize record
  const record = inMemoryStore.get(key) || {
    count: 0,
    resetTime: now + options.windowMs,
  };
  
  // Increment counter
  record.count += 1;
  
  // Check if limit exceeded
  if (record.count > options.max) {
    return { 
      success: false, 
      message: options.message || 'Too many requests, please try again later.' 
    };
  }
  
  // Store updated record
  inMemoryStore.set(key, record);
  
  return { success: true };
}
