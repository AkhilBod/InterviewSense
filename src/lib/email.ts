import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Get mail configuration from environment variables
    // Try multiple possible names for password (Vercel might store it differently)
    const host = process.env.EMAIL_SERVER_HOST;
    const port = Number(process.env.EMAIL_SERVER_PORT);
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD || 
                 process.env.EMAIL_PASSWORD ||
                 process.env.SMTP_PASSWORD ||
                 '$parkY623456'; // Fallback hardcoded password for testing
    const from = process.env.EMAIL_FROM;
    
    console.log('[EMAIL] Checking environment variables:', {
      EMAIL_SERVER_HOST: !!process.env.EMAIL_SERVER_HOST,
      EMAIL_SERVER_PORT: !!process.env.EMAIL_SERVER_PORT,
      EMAIL_SERVER_USER: !!process.env.EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD: !!process.env.EMAIL_SERVER_PASSWORD,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
    });
    
    console.log('[EMAIL] Configuration summary:', {
      host: host ? `${host.substring(0, 10)}...` : 'MISSING',
      port: port || 'MISSING',
      user: user ? `${user.substring(0, 5)}...` : 'MISSING',
      pass: pass ? `[PASSWORD SET - length: ${pass.length}]` : 'MISSING',
      from: from ? from : 'MISSING',
    });
    
    // Validate required email configuration
    if (!host || !port || !user || !pass || !from) {
      console.error('[EMAIL] Missing email configuration:', { 
        host: !!host,
        port: !!port,
        user: !!user,
        pass: !!pass,
        from: !!from,
      });
      throw new Error('Email configuration incomplete. Check environment variables.');
    }
    
    console.log('[EMAIL] Creating transporter with host:', host, 'port:', port);
    
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

    console.log('[EMAIL] Email sent successfully:', {
      to,
      messageId: info.messageId,
      response: info.response
    });
    return info;
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', {
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any).code,
      command: (error as any).command,
      responseCode: (error as any).responseCode
    });
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

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    console.log('Sending welcome email to:', email);
    
    await sendEmail({
      to: email,
      subject: 'Welcome to InterviewSense!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>InterviewSense is Live!</title>
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
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            
            .header {
              text-align: center;
              margin-bottom: 32px;
              padding-bottom: 24px;
              border-bottom: 1px solid #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .logo-container {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 12px;
            }
            
            .logo-icon {
              margin-right: 10px;
              width: 36px;
              height: 36px;
            }
            
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #2563eb;
              letter-spacing: -0.5px;
            }
            
            .tagline {
              font-size: 16px;
              color: #666;
              font-weight: 500;
            }
            
            .hero {
              background: #0f172a;
              border-radius: 8px;
              padding: 32px 24px;
              margin-bottom: 32px;
              text-align: center;
              color: white;
            }
            
            .hero-title {
              font-size: 28px;
              font-weight: 700;
              color: white;
              margin-bottom: 12px;
            }
            
            .hero-subtitle {
              font-size: 20px;
              font-weight: 600;
              color: #3b82f6;
              margin-bottom: 16px;
            }
            
            .hero-text {
              font-size: 16px;
              color: #e2e8f0;
            }
            
            .content {
              color: #333;
            }
            
            h2 {
              font-size: 20px;
              margin-bottom: 16px;
              color: #111827;
            }
            
            p {
              margin: 16px 0;
              font-size: 16px;
              color: #4b5563;
            }
            
            .features {
              margin: 24px 0;
              background: #f8fafc;
              border-radius: 8px;
              padding: 20px;
            }
            
            .feature {
              display: flex;
              align-items: flex-start;
              margin-bottom: 20px;
            }
            
            .feature:last-child {
              margin-bottom: 0;
            }
            
            .feature-icon {
              margin-right: 16px;
              font-size: 20px;
              color: #2563eb;
              min-width: 24px;
              text-align: center;
            }
            
            .feature-text {
              flex: 1;
            }
            
            .feature-text strong {
              color: #1e40af;
            }
            
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            
            .button {
              display: inline-block;
              background: #2563eb;
              color: #ffffff !important;
              padding: 16px 36px;
              text-decoration: none;
              border-radius: 9999px;
              font-weight: 600;
              transition: background-color 0.2s;
              text-align: center;
              line-height: 1.5;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25);
            }
            
            .button:hover {
              background: #1d4ed8;
            }
            
            .secondary-button {
              display: block;
              margin-top: 12px;
              text-align: center;
              color: #2563eb;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
            }
            
            .secondary-button:hover {
              text-decoration: underline;
            }
            
            .social {
              display: flex;
              justify-content: center;
              margin-top: 32px;
              gap: 20px;
            }
            
            .social a {
              color: #64748b;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s;
            }
            
            .social a:hover {
              color: #2563eb;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 24px;
              border-top: 1px solid #f0f0f0;
              font-size: 14px;
              color: #94a3b8;
            }
            
            @media (max-width: 640px) {
              .container {
                padding: 24px 16px;
                margin: 20px auto;
              }
            }

            .custom-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.1);
              color: #2563eb;
              margin-right: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="logo-container">
                  <div class="logo">InterviewSense</div>
                </div>
                <div class="tagline">Your AI-powered interview success partner</div>
              </div>
            </div>
            
            <div class="hero">
              <div class="hero-title">Welcome to InterviewSense! 🚀</div>
              <div class="hero-subtitle">Ace Your Next Interview with AI-Powered Practice</div>
              <div class="hero-text">Your journey toward interview success begins now.</div>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for creating your <strong>InterviewSense</strong> account! We're thrilled to have you join our community of job seekers who are taking their interview preparation to the next level.</p>
              
              <h2>What Can You Do with InterviewSense?</h2>
              <div class="features">
                <div class="feature">
                  <div class="custom-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 8v4l3 3"></path>
                    </svg>
                  </div>
                  <div class="feature-text"><strong>Realistic Mock Interviews:</strong> Experience AI-powered simulations tailored specifically to your target roles and industry.</div>
                </div>
                <div class="feature">
                  <div class="custom-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div class="feature-text"><strong>Personalized Feedback:</strong> Receive detailed analysis and actionable improvement tips after each practice session.</div>
                </div>
                <div class="feature">
                  <div class="custom-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  <div class="feature-text"><strong>Comprehensive Question Library:</strong> Access thousands of interview questions curated across diverse industries and positions.</div>
                </div>
                <div class="feature">
                  <div class="custom-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <div class="feature-text"><strong>Progress Tracking:</strong> Monitor your improvement with detailed performance analytics and identify areas for growth.</div>
                </div>
              </div>
              
              <p>Your account is all set up and ready to go. Click the button below to start practicing and take a significant step toward your next successful interview:</p>
              
              <div class="button-container">
                <a href="https://www.interviewsense.org/dashboard" class="button">Start Practicing Now</a>
                <a href="https://www.interviewsense.org/start" class="secondary-button">Learn how it works first</a>
              </div>
              
              <p>We built InterviewSense based on feedback from job seekers like you. Have suggestions or need assistance? Reply directly to this email—we're committed to making your interview preparation as effective as possible.</p>
              
              <p>Here's to landing your dream job,</p>
              <p><strong>The InterviewSense Team</strong></p>
              
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} InterviewSense. All rights reserved.</p>
              <p style="margin-top: 8px;">Helping you succeed in your career journey.</p>
              <p style="margin-top: 16px; font-size: 12px;">
                You received this email because you signed up for InterviewSense.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Welcome email sent');
  } catch (error) {
    console.error('Welcome email error:', error);
    throw error;
  }
}