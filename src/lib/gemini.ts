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
  jobAd?: string;
  interviewType: string;
  interviewStage: string;
}

export async function generateBehavioralQuestions(jobDetails: JobDetails) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 20 interview questions for a ${jobDetails.experienceLevel} ${jobDetails.jobTitle} position${jobDetails.company ? ` at ${jobDetails.company}` : ''} in the ${jobDetails.industry} industry. 
    
    This is a ${jobDetails.interviewType} interview at the ${jobDetails.interviewStage} stage.
    
    ${jobDetails.jobAd ? `Here is the job description to reference:\n${jobDetails.jobAd}\n\n` : ''}
    
    The questions should be tailored based on:
    1. Interview Type (${jobDetails.interviewType}):
       ${jobDetails.interviewType === 'Technical' ? '- Focus on technical skills, problem-solving, and coding/system design' :
         jobDetails.interviewType === 'Behavioral' ? '- Focus on past experiences, soft skills, and cultural fit' :
         jobDetails.interviewType === 'Case Study' ? '- Focus on analytical thinking and business problem-solving' :
         jobDetails.interviewType === 'System Design' ? '- Focus on architecture, scalability, and technical decision-making' :
         jobDetails.interviewType === 'Leadership' ? '- Focus on team management, decision-making, and strategic thinking' :
         '- Mix of technical and behavioral questions'}
    
    2. Interview Stage (${jobDetails.interviewStage}):
       ${jobDetails.interviewStage === 'Initial Screening' ? '- Focus on basic qualifications and cultural fit' :
         jobDetails.interviewStage === 'Technical Assessment' ? '- Focus on core technical skills and problem-solving' :
         jobDetails.interviewStage === 'Team Interview' ? '- Focus on collaboration and team dynamics' :
         jobDetails.interviewStage === 'Final Round' ? '- Focus on strategic thinking and long-term fit' :
         '- Focus on executive-level decision making and vision'}
    
    Include a mix of:
    1. 5-6 highly specific questions about:
       - ${jobDetails.company ? jobDetails.company + "'s" : 'The company\'s'} business context and products
       - Technical skills and tools mentioned in the job description
       - Industry-specific challenges in ${jobDetails.industry}
       - Role-specific scenarios for ${jobDetails.jobTitle}
    
    2. 4-5 questions about:
       - Real-world scenarios and technical knowledge
       - Problem-solving approaches
       - Industry best practices
       - Tools and technologies used in this role
    
    3. 4-5 questions about:
       - Industry trends and challenges in ${jobDetails.industry}
       - Market dynamics and competition
       - Future of the industry
       - Role evolution and growth
    
    4. 5-6 general questions about:
       - Leadership and team management
       - Problem-solving and decision-making
       - Communication and collaboration
       - Innovation and creativity
       - Conflict resolution
       - Time management and prioritization
    
    Make sure the questions are appropriate for a ${jobDetails.experienceLevel} level position.
    
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