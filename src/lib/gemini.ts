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

    let typeInstructions = '';
    if (jobDetails.interviewType === 'Technical') {
      typeInstructions = `Focus on technical skills, coding, algorithms, system design, and problem-solving. Include questions about relevant technologies, frameworks, and technical scenarios for a ${jobDetails.jobTitle}.`;
    } else if (jobDetails.interviewType === 'Behavioral') {
      typeInstructions = `Focus on past experiences, soft skills, teamwork, leadership, conflict resolution, and cultural fit. Include scenario-based questions relevant to the ${jobDetails.jobTitle} role.`;
    } else if (jobDetails.interviewType === 'Case Study') {
      typeInstructions = `Focus on analytical thinking, business problem-solving, and case-based scenarios relevant to the role.`;
    } else if (jobDetails.interviewType === 'System Design') {
      typeInstructions = `Focus on architecture, scalability, technical decision-making, and system design scenarios for a ${jobDetails.jobTitle}.`;
    } else if (jobDetails.interviewType === 'Leadership') {
      typeInstructions = `Focus on team management, decision-making, strategic thinking, and leadership scenarios.`;
    } else {
      typeInstructions = `Include a mix of technical and behavioral questions.`;
    }

    const prompt = `Generate 20 interview questions for a ${jobDetails.experienceLevel} ${jobDetails.jobTitle} position${jobDetails.company ? ` at ${jobDetails.company}` : ''} in the ${jobDetails.industry} industry.\n\nThis is a ${jobDetails.interviewType} interview at the ${jobDetails.interviewStage} stage.\n\n${jobDetails.jobAd ? `Here is the job description to reference:\n${jobDetails.jobAd}\n\n` : ''}${typeInstructions}\n\nMake sure the questions are appropriate for a ${jobDetails.experienceLevel} level position.\n\nReturn ONLY a JSON array of objects with 'id' and 'question' fields. Do not include any markdown formatting or additional text.`;

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