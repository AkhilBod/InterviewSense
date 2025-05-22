// A simple script to test email sending
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing email with the following credentials:');
  console.log({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT), 
    user: process.env.EMAIL_SERVER_USER,
    password: process.env.EMAIL_SERVER_PASSWORD ? '********' : 'NOT PROVIDED',
    from: process.env.EMAIL_FROM
  });

  try {
    // Create a test account if needed
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      },
      debug: true, // Show debug output
      logger: true // Log information into the console
    });

    // Verify connection configuration
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Server is ready to take our messages');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_SERVER_USER, // Send to yourself
      subject: 'Test Email from InterviewSense',
      text: 'This is a test email to verify server configuration.',
      html: '<strong>This is a test email to verify server configuration.</strong>'
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testEmail();
