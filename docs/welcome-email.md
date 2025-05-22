# User Welcome Email

## Overview

The welcome email is an important part of the user onboarding process in InterviewSense. It is sent automatically to users after they have successfully verified their email address. 

The welcome email serves several purposes:
- Confirms that the user has successfully created and verified their account
- Creates a positive first impression of the InterviewSense platform
- Introduces key features and benefits of the service
- Provides clear next steps to encourage engagement
- Establishes the brand identity and tone

## Implementation Details

### Email Sending Flow

1. User completes the signup process at `/signup`
2. The system sends a verification email to the user
3. When the user verifies their email by clicking the link, the `/api/auth/verify` endpoint:
   - Marks the user's email as verified in the database
   - Sends a welcome email to the user
   - Redirects the user to the login page

### Welcome Email Template

The welcome email template includes:
- A branded header with the InterviewSense logo and tagline
- A hero section with a motivational headline and subtitle
- A personalized greeting using the user's name
- An overview of key features with icons
- Call-to-action buttons to direct users to important sections
- Contact information for support
- Legal footer with copyright information

### Manual Sending

For testing or special cases, welcome emails can also be sent manually through:
1. The `/api/welcome-email` endpoint (requires authentication or API secret)
2. The `test-welcome-email.js` script for development testing

## Configuration

The welcome email uses the standard email configuration from environment variables:
- `EMAIL_SERVER_HOST`: SMTP server hostname
- `EMAIL_SERVER_PORT`: SMTP server port
- `EMAIL_SERVER_USER`: SMTP server username
- `EMAIL_SERVER_PASSWORD`: SMTP server password
- `EMAIL_FROM`: The sender email address
- `NEXTAUTH_URL`: Base URL of the application (used for links in the email)

## Testing

To test the welcome email:
1. Run `node test-welcome-email.js` to send a test welcome email
2. Check the recipient inbox to verify the email was received
3. Verify that all links in the email point to correct URLs
4. Test the email in different email clients to ensure compatibility

### Troubleshooting

If welcome emails are not being sent:
1. Check that all email environment variables are properly configured
2. Verify that the SMTP server is accessible
3. Check for any errors in the server logs
4. Ensure the user's email is correctly stored in the database
