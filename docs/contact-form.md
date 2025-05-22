# Contact Form Implementation

This document outlines how the contact form is implemented in InterviewSense.

## Overview

The contact form allows users to send inquiries directly to the InterviewSense team. 
Unlike previous implementations, the current version does not store any user data in the database. 
Instead, it sends emails directly to the administrator's email address.

## Implementation Details

### Form Submission Flow

1. User fills out the contact form at `/contact`
2. The form submits data to `/api/contact` endpoint via POST request
3. The API route validates the submission data
4. If valid, it sends two emails:
   - A notification email to the administrator (akkiisan9@gmail.com)
   - A confirmation email to the user

### Email Templates

Two email templates are used:
1. **Admin notification email**: Contains all form details including name, email, company, inquiry type, and the full message.
2. **User confirmation email**: Contains a summary of their inquiry and sets expectations for response times.

### Data Handling

- No user data is stored in the database
- The contact form submission data is only transmitted via email
- This approach enhances privacy since no personal information is persisted

### Security Measures

- Rate limiting is applied to prevent abuse (5 requests per 5 minutes)
- Input validation ensures data integrity
- Email format validation prevents invalid emails

## Configuration

The email functionality uses environment variables:
- `EMAIL_SERVER_HOST`: SMTP server hostname
- `EMAIL_SERVER_PORT`: SMTP server port
- `EMAIL_SERVER_USER`: SMTP server username
- `EMAIL_SERVER_PASSWORD`: SMTP server password
- `EMAIL_FROM`: The sender email address

## Testing

To test the contact form:
1. Fill out all required fields in the form
2. Submit the form
3. Verify that a success message is displayed
4. Check that the admin receives the notification email
5. Verify that the user receives a confirmation email

### Troubleshooting

If emails are not being sent:
1. Check that all email environment variables are properly configured
2. Verify that the SMTP server is accessible
3. Check for any errors in the server logs
