import nodemailer from 'nodemailer';

async function sendTestAbandonedCheckoutEmail(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: 'mail.spacemail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'akhil@interviewsense.org',
      pass: '$parkY623456',
    },
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your InterviewSense Setup</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333; line-height: 1.6; -webkit-font-smoothing: antialiased; background-color: #f5f5f5;
        }
        .container {
          max-width: 600px; margin: 40px auto; padding: 40px;
          background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #f0f0f0; }
        .logo { font-size: 28px; font-weight: 700; color: #2563eb; letter-spacing: -0.5px; }
        .tagline { font-size: 16px; color: #666; font-weight: 500; }
        .hero {
          background: #0f172a; border-radius: 8px; padding: 32px 24px;
          margin-bottom: 32px; text-align: center; color: white;
        }
        .hero-title { font-size: 24px; font-weight: 700; color: white; margin-bottom: 10px; }
        .hero-subtitle { font-size: 18px; font-weight: 600; color: #3b82f6; margin-bottom: 12px; }
        .hero-text { font-size: 15px; color: #e2e8f0; }
        p { margin: 16px 0; font-size: 16px; color: #4b5563; }
        .features { margin: 24px 0; background: #f8fafc; border-radius: 8px; padding: 20px; }
        .feature { display: flex; align-items: flex-start; margin-bottom: 16px; }
        .feature:last-child { margin-bottom: 0; }
        .feature-text { flex: 1; font-size: 15px; color: #374151; }
        .feature-text strong { color: #1e40af; }
        .button-container { text-align: center; margin: 32px 0; }
        .button {
          display: inline-block; background: #2563eb; color: #ffffff !important;
          padding: 16px 36px; text-decoration: none; border-radius: 9999px;
          font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37,99,235,0.25);
        }
        .cancel-note { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 8px; }
        .footer {
          text-align: center; margin-top: 40px; padding-top: 24px;
          border-top: 1px solid #f0f0f0; font-size: 14px; color: #94a3b8;
        }
        @media (max-width: 640px) { .container { padding: 24px 16px; margin: 20px auto; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">InterviewSense</div>
          <div class="tagline">Your AI-powered interview success partner</div>
        </div>

        <div class="hero">
          <div class="hero-title">Your free trial is still waiting</div>
          <div class="hero-subtitle">3 days free, no charge until it ends</div>
          <div class="hero-text">Cancel anytime, no questions asked.</div>
        </div>

        <p>Hey ${name},</p>
        <p>We noticed you started setting up your InterviewSense Pro account but didn't quite finish. Your free trial is still available, here's what you'll get access to:</p>

        <div class="features">
          <div class="feature">
            <div class="feature-text"><strong>Unlimited Mock Interviews</strong> - AI-powered simulations tailored to your target role</div>
          </div>
          <div class="feature">
            <div class="feature-text"><strong>Personalized Feedback</strong> - detailed analysis and actionable tips after every session</div>
          </div>
          <div class="feature">
            <div class="feature-text"><strong>Technical and Behavioral Prep</strong> - coding, system design, and soft skills all in one place</div>
          </div>
          <div class="feature">
            <div class="feature-text"><strong>Resume Review</strong> - get AI feedback on your resume before you apply</div>
          </div>
        </div>

        <div class="button-container">
          <a href="https://www.interviewsense.org/pricing" class="button">Complete Your Setup</a>
          <div class="cancel-note">Cancel anytime from your account settings, no questions asked.</div>
        </div>

        <p>If you have any concerns or questions, just respond to this email and we will get back to you.</p>
        <p><strong>The InterviewSense Team</strong></p>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} InterviewSense. All rights reserved.</p>
          <p style="margin-top: 8px;">Helping you succeed in your career journey.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: 'akhil@interviewsense.org',
    to: email,
    subject: 'You left something behind - finish your InterviewSense setup',
    html,
  });

  console.log('Test email sent:', info.messageId);
}

sendTestAbandonedCheckoutEmail('akkiisan9@gmail.com', 'Akhil').catch(console.error);
