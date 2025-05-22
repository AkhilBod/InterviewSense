// A simple script to test welcome email sending
const { sendWelcomeEmail } = require('./dist/lib/email');
require('dotenv').config({ path: '.env.local' });

async function testWelcomeEmail() {
  console.log('Testing welcome email with the following credentials:');
  console.log({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT), 
    user: process.env.EMAIL_SERVER_USER,
    password: process.env.EMAIL_SERVER_PASSWORD ? '********' : 'NOT PROVIDED',
    from: process.env.EMAIL_FROM
  });

  try {
    // Send test welcome email
    console.log('Sending test welcome email...');
    await sendWelcomeEmail('test@example.com', 'Test User');
    
    console.log('Welcome email test completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testWelcomeEmail();
