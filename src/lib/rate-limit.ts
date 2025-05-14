import type { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';
import Redis from 'ioredis';

// Initialize Redis client if REDIS_URL is provided in environment variables
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  
  // Log Redis connection status
  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });
}

interface RateLimitOptions {
  windowMs: number;   // Time window in milliseconds
  max: number;        // Maximum number of requests in the time window
  message?: string;   // Message to return when limit is reached
  keyGenerator?: (req: NextApiRequest) => string; // Custom key generator function
}

/**
 * Creates a rate limiter middleware for Next.js API routes
 * Falls back to memory store if Redis is not configured
 */
export function rateLimiter(options: RateLimitOptions) {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 5,             // 5 requests per minute by default
    message = 'Too many requests, please try again later.',
    keyGenerator = (req: NextApiRequest) => {
      const ip = getClientIp(req) || 'unknown';
      return `rate-limit:${ip}:${req.url}`;
    }
  } = options;

  // In-memory store fallback if Redis is not available
  const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

  return async function rateLimit(
    req: NextApiRequest,
    res: NextApiResponse,
    next?: () => void
  ) {
    const key = keyGenerator(req);
    const now = Date.now();

    // If Redis client is available, use it
    if (redisClient) {
      try {
        // Use Redis for distributed rate limiting
        const current = await redisClient.get(key);
        const count = current ? parseInt(current, 10) : 0;
        
        if (count >= max) {
          // Rate limit exceeded
          res.status(429).json({ error: message });
          return;
        }
        
        // Increment counter and set expiration
        if (count === 0) {
          // Set initial counter with expiration
          await redisClient.set(key, '1', 'PX', windowMs);
        } else {
          // Increment existing counter
          await redisClient.incr(key);
        }
      } catch (error) {
        console.error('Redis rate limiting error:', error);
        // Fall back to memory store if Redis fails
        useMemoryStore();
      }
    } else {
      // Use in-memory store if Redis is not configured
      useMemoryStore();
    }

    // Continue to the next middleware/handler
    if (next) next();

    // In-memory rate limiting implementation
    function useMemoryStore() {
      // Clean up expired entries
      for (const [storeKey, data] of inMemoryStore.entries()) {
        if (now > data.resetTime) {
          inMemoryStore.delete(storeKey);
        }
      }

      // Get or initialize the record for this key
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
    }
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
  
  // Try to use Redis first if available
  if (redisClient) {
    try {
      // Get current request count
      const current = await redisClient.get(key);
      const count = current ? parseInt(current, 10) : 0;
      
      // Check if limit exceeded
      if (count >= options.max) {
        return { 
          success: false, 
          message: options.message || 'Too many requests, please try again later.' 
        };
      }
      
      // Set or increment counter
      if (count === 0) {
        await redisClient.set(key, '1', 'PX', options.windowMs);
      } else {
        await redisClient.incr(key);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fall back to memory store
    }
  }
  
  // In-memory fallback (less reliable for distributed environments)
  const inMemoryStore = new Map<string, { count: number; resetTime: number }>();
  
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
