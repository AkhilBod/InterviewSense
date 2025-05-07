import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    console.log('Creating email transporter with config:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    console.log('Sending email to:', to);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log('Sending verification email to:', email);
    
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    console.log('Verification URL:', verificationUrl);
    
    await sendEmail({
      to: email,
      subject: 'Verify your InterviewSense account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your InterviewSense account</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #e4e4e7;
              margin: 0;
              padding: 0;
              background: linear-gradient(to bottom, #18181b, #27272a);
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .content {
              background: rgba(39, 39, 42, 0.5);
              padding: 30px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-top: none;
              border-radius: 0 0 8px 8px;
              backdrop-filter: blur(8px);
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 9999px;
              margin: 20px 0;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            .button:hover {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              transform: translateY(-1px);
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #71717a;
              font-size: 0.875rem;
            }
            .warning {
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.2);
              color: #fca5a5;
              padding: 12px;
              border-radius: 6px;
              margin-top: 20px;
            }
            p {
              color: #a1a1aa;
            }
            .link {
              color: #3b82f6;
              word-break: break-all;
            }
            .logo {
              margin-bottom: 16px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: 600;
              color: white;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <h1 class="logo-text">InterviewSense</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9);">Verify your email address</p>
            </div>
            <div class="content">
              <p>Thank you for signing up! We're excited to have you join our community of interview preparation enthusiasts.</p>
              
              <p>To get started, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p class="link">${verificationUrl}</p>
              
              <div class="warning">
                <strong>Note:</strong> This verification link will expire in 24 hours.
              </div>
              
              <p>If you didn't create an account with InterviewSense, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} InterviewSense. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
} 