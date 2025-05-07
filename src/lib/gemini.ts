import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

interface JobDetails {
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
}

export async function generateBehavioralQuestions(jobDetails: JobDetails) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 20 behavioral interview questions for a ${jobDetails.experienceLevel} ${jobDetails.jobTitle} position${jobDetails.company ? ` at ${jobDetails.company}` : ''} in the ${jobDetails.industry} industry. 
    
    The questions should include:
    1. 5-6 highly specific questions about ${jobDetails.company ? jobDetails.company + "'s" : 'the company\'s'} business context, products, and ${jobDetails.jobTitle} role
    2. 4-5 questions about real-world scenarios and technical knowledge required for this position
    3. 4-5 questions about industry-specific challenges and trends in ${jobDetails.industry}
    4. 5-6 general behavioral questions about:
       - Leadership and team management
       - Problem-solving and decision-making
       - Communication and collaboration
       - Innovation and creativity
       - Conflict resolution
       - Time management and prioritization
    
    Make sure the specific questions reference:
    - Actual technologies, tools, or frameworks used in this role
    - Real business challenges in ${jobDetails.industry}
    - Specific scenarios that ${jobDetails.jobTitle}s typically face
    - Company-specific products or services (if company is provided)
    
    Return ONLY a JSON array of objects with 'id' and 'question' fields. Do not include any markdown formatting or additional text.`;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini:', text);
    
    // Clean the response text by removing markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    console.log('Cleaned response:', cleanText);
    
    // Parse the JSON response
    const questions = JSON.parse(cleanText);
    console.log('Parsed questions:', questions);
    return questions;
  } catch (error: any) {
    console.error('Error generating questions:', error);
    throw error;
  }
} 