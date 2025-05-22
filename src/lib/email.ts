import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Get mail configuration from environment variables
    const host = process.env.EMAIL_SERVER_HOST;
    const port = Number(process.env.EMAIL_SERVER_PORT);
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;
    const from = process.env.EMAIL_FROM;
    
    // Validate required email configuration
    if (!host || !port || !user || !pass || !from) {
      console.error('Missing email configuration:', { 
        hostProvided: !!host, 
        portProvided: !!port, 
        userProvided: !!user, 
        passProvided: !!pass,
        fromProvided: !!from
      });
      throw new Error('Email configuration incomplete. Check environment variables.');
    }
    
    console.log('Creating transporter with:', {
      host,
      port,
      user,
      from,
      secure: true,
    });
    
    // Create the nodemailer transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true, // use TLS
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    console.log('Sending verification to:', email);
    
    await sendEmail({
      to: email,
      subject: 'Verify your InterviewSense account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #333;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
              background-color: #f5f5f5;
            }
            
            .container {
              max-width: 600px;
              margin: 40px auto;
              padding: 40px;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            
            .title {
              font-size: 20px;
              font-weight: 600;
              color: #333;
              margin-top: 16px;
            }
            
            .content {
              color: #333;
            }
            
            p {
              margin: 16px 0;
              font-size: 16px;
            }
            
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            
            .button {
              display: inline-block;
              background: #2563eb;
              color: #ffffff !important;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 9999px;
              font-weight: 600;
              transition: background-color 0.2s;
              text-align: center;
              line-height: 1.5;
            }
            
            .button:hover {
              background: #1d4ed8;
            }
            
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #71717a;
              font-size: 0.875rem;
            }
            
            .note {
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 24px 0;
              padding: 12px;
              background: #f0f7ff;
              border-radius: 4px;
              font-size: 14px;
              color: #333;
            }
            
            .note-icon {
              font-size: 18px;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 14px;
              color: #666;
            }
            
            @media (max-width: 640px) {
              .container {
                padding: 24px 16px;
                margin: 20px auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">InterviewSense</div>
            </div>
            
            <div class="content">
              <p>Hi there,</p>
              <p>Thanks for signing up for InterviewSense! We're excited to help you prepare for your upcoming interviews.</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or you can copy and paste this link into your browser:</p>
              <div class="link-container">
                <span class="link">${verificationUrl}</span>
              </div>
              
              <div class="note">
                <span class="note-icon">ℹ️</span>
                <span>This verification link will expire in 24 hours for security reasons.</span>
              </div>
              
              <p>If you didn't sign up for InterviewSense, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} InterviewSense. All rights reserved.</p>
              <p style="margin-top: 8px;">Helping you succeed in your career journey.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Verification email sent');
  } catch (error) {
    console.error('Verification email error:', error);
    throw error;
  }
}