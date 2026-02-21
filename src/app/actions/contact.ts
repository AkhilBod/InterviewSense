'use server'

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function submitContactForm(formData: {
  name: string;
  email: string;
  company?: string;
  inquiryType: string;
  message: string;
}) {
  const { name, email, company = '', inquiryType, message } = formData;

  try {
    // Basic validation
    if (!name || !email || !inquiryType || !message) {
      throw new Error('Missing required fields');
    }

    // Create contact inquiry in database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        company,
        inquiryType,
        message,
        status: 'PENDING',
      },
    });

    // You could also send an email notification here
    // using your email utilities

    // Revalidate the contact page to show the latest data
    revalidatePath('/contact');

    return {
      success: true,
      message: 'Contact inquiry received successfully',
      id: inquiry.id
    };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit contact form'
    };
  }
}
