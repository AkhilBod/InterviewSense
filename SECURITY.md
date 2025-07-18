# Security Policy

## Reporting Security Vulnerabilities

The InterviewSense team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **akhil@interviewsense.org**

### What to Include

When reporting a security vulnerability, please include:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths** of source file(s) related to the manifestation of the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### Response Timeline

- **Within 48 hours**: We'll acknowledge receipt of your report
- **Within 7 days**: We'll provide a detailed response with our evaluation and next steps
- **Ongoing**: We'll keep you updated on our progress

### Responsible Disclosure

- Give us reasonable time to investigate and fix the issue before any disclosure
- Make a good faith effort to avoid privacy violations and disruption to our service
- Don't access or modify data that doesn't belong to you
- Don't perform DoS attacks or spam our services

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Security Features

InterviewSense implements several security measures:

### Authentication & Authorization
- **NextAuth.js**: Secure authentication with multiple providers
- **JWT Tokens**: Secure session management with HttpOnly cookies
- **Email Verification**: Required for account activation
- **Password Requirements**: Strong password policies enforced

### Data Protection
- **Environment Variables**: All secrets stored securely
- **Input Validation**: Comprehensive data sanitization using Zod
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy and input sanitization

### Rate Limiting
- **Account Creation**: 5 attempts per hour per IP
- **Password Reset**: 3 attempts per 15 minutes per IP
- **API Endpoints**: Custom rate limiting per route
- **Exponential Backoff**: Progressive delays for repeated failures

### Infrastructure Security
- **HTTPS Enforcement**: All traffic encrypted in transit
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Security Headers**: Comprehensive security headers
- **Secure Cookies**: HttpOnly, Secure, SameSite attributes

### Database Security
- **Connection Encryption**: SSL/TLS encrypted database connections
- **Least Privilege**: Database users with minimal required permissions
- **Regular Backups**: Automated backups with encryption
- **Access Logging**: All database access logged

## Security Best Practices for Contributors

### Code Security
- Never commit secrets, API keys, or passwords
- Use environment variables for all sensitive configuration
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without information leakage

### Authentication & Authorization
- Always verify user permissions before data access
- Use secure session management
- Implement proper logout functionality
- Use HTTPS for all authentication flows

### Data Handling
- Minimize data collection and retention
- Encrypt sensitive data at rest
- Use secure protocols for data transmission
- Implement proper access controls

## Vulnerability Disclosure History

We believe in transparency. Past security issues and their resolutions will be documented here:

*No security issues have been reported yet.*

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## Contact

For security-related questions or concerns:
- **Email**: security@interviewsense.org
- **PGP Key**: Available upon request

Thank you for helping keep InterviewSense secure! 🔒
