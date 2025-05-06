import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: true,
  });
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email address for InterviewSense',
    text: `Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you did not sign up for InterviewSense, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6; text-align: center;">InterviewSense</h2>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Verify your email address</h3>
          <p>Thanks for signing up for InterviewSense! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="margin-bottom: 0; color: #666; font-size: 14px;">If you did not sign up for InterviewSense, please ignore this email.</p>
        </div>
        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
          <p>© ${new Date().getFullYear()} InterviewSense. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}