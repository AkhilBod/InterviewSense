import { NextResponse } from 'next/server';
import { sendEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Apply rate limiting - 5 requests per 5 minutes
    const rateLimit = await applyRateLimit(request, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // 5 requests per window
      message: "Too many contact form submissions. Please try again later.",
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }
    
    const data = await request.json();
    const { name, email, company = '', inquiryType, message } = data;

    // Basic validation
    if (!name || !email || !inquiryType || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Format inquiry type for better readability
    const formattedInquiryType = 
      inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1);

    // Send email to admin 
    await sendEmail({
      to: "akhil@interviewsense.org", // Use organization email since we're using SpaceMail now
      subject: `InterviewSense Contact Form: ${formattedInquiryType} Inquiry`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; }
            .message { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
              <p>You have received a new inquiry from the InterviewSense contact form.</p>
            </div>
            
            <div class="section">
              <p><span class="label">Name:</span> ${name}</p>
              <p><span class="label">Email:</span> ${email}</p>
              <p><span class="label">Inquiry Type:</span> ${formattedInquiryType}</p>
              ${company ? `<p><span class="label">Company:</span> ${company}</p>` : ''}
            </div>
            
            <div class="section">
              <p class="label">Message:</p>
              <div class="message">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Contact inquiry received',
    }, { status: 200 });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
