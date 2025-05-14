# Rate Limiting Implementation

This document outlines the rate limiting implementation for InterviewSense's authentication system.

## Overview

Rate limiting has been implemented across all authentication endpoints to protect against brute force attacks, credential stuffing, and other security threats. When deploying for 100+ users, this protection is essential.

## Implementation Details

The application uses a flexible rate limiting approach with the following features:

- **Redis Support**: Uses Redis for distributed rate limiting when available
- **Fallback Mechanism**: Falls back to in-memory storage if Redis is not configured
- **Per-IP Tracking**: Limits are applied per IP address by default
- **Customizable Limits**: Different limits for different authentication operations

## Rate Limits by Endpoint

| Endpoint | Operation | Window | Limit | Rationale |
|----------|-----------|--------|-------|-----------|
| `/api/auth/[...nextauth]` | GET requests (sessions) | 1 minute | 60 | Session checks are frequent but should still be limited |
| `/api/auth/[...nextauth]` | POST login attempts | 5 minutes | 5 | Prevent brute force attacks on login |
| `/api/auth/[...nextauth]` | Other POST operations | 1 minute | 10 | Limit other auth operations |
| `/api/auth/signup` | User registration | 1 hour | 5 | Prevent mass account creation |
| `/api/auth/forgot-password` | Password reset requests | 15 minutes | 3 | Prevent email bombing and user enumeration |
| `/api/auth/reset-password` | Password reset submission | 10 minutes | 5 | Prevent token brute forcing |

## Configuration

To use Redis for rate limiting in production (recommended):

1. Set up a Redis instance (can be self-hosted or use a cloud provider like Redis Labs, AWS ElastiCache, etc.)
2. Add the following to your `.env` file:
   ```
   REDIS_URL=redis://username:password@your-redis-host:port
   ```

## Monitoring

For production environments, consider:

1. Setting up alerts for high numbers of rate limit violations
2. Logging rate limit events to detect potential attacks
3. Reviewing rate limit thresholds periodically based on legitimate usage patterns

## Security Considerations

- The rate limiter uses the client's IP address for identification
- If your application is behind a proxy, ensure proper `X-Forwarded-For` header handling
- Consider implementing CAPTCHA as an additional layer for sensitive operations
