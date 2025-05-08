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
      typeInstructions = `Focus on technical skills, coding, algorithms, system design, and problem-solving. Include questions about:
- Specific technologies and frameworks relevant to ${jobDetails.jobTitle} in ${jobDetails.industry}
- Real-world technical challenges and their solutions
- System architecture and scalability considerations
- Code optimization and performance
- Technical decision-making processes
- Problem-solving approaches and debugging strategies
- Technical leadership and mentoring
- Industry-specific technical requirements for ${jobDetails.industry}`;
    } else if (jobDetails.interviewType === 'Behavioral') {
      typeInstructions = `Focus on past experiences, soft skills, and scenarios relevant to ${jobDetails.jobTitle} in ${jobDetails.industry}. Include questions about:
- Leadership experiences and team management
- Conflict resolution in ${jobDetails.industry} context
- Project management and deadline handling
- Cross-functional collaboration
- Innovation and process improvement
- Handling high-pressure situations
- Industry-specific challenges and solutions
- Cultural fit and team dynamics
- Communication with stakeholders
- Adaptability to industry changes`;
    } else if (jobDetails.interviewType === 'Case Study') {
      typeInstructions = `Focus on analytical thinking and business problem-solving specific to ${jobDetails.industry}. Include questions about:
- Industry-specific business challenges
- Market analysis and strategy
- Data-driven decision making
- Risk assessment and management
- Resource optimization
- Competitive analysis
- Business process improvement
- Stakeholder management
- ROI and business impact
- Industry trends and adaptation`;
    } else if (jobDetails.interviewType === 'System Design') {
      typeInstructions = `Focus on architecture and system design specific to ${jobDetails.industry}. Include questions about:
- Scalable system architecture
- Performance optimization
- Security considerations
- Data modeling and storage
- API design and integration
- Microservices architecture
- Cloud infrastructure
- System reliability and fault tolerance
- Industry-specific technical requirements
- System monitoring and maintenance`;
    } else if (jobDetails.interviewType === 'Leadership') {
      typeInstructions = `Focus on leadership and management in ${jobDetails.industry}. Include questions about:
- Team building and development
- Strategic planning and execution
- Change management
- Performance management
- Resource allocation
- Stakeholder communication
- Innovation leadership
- Crisis management
- Industry-specific leadership challenges
- Mentoring and coaching`;
    } else {
      typeInstructions = `Include a balanced mix of technical and behavioral questions specific to ${jobDetails.jobTitle} in ${jobDetails.industry}, covering:
- Technical expertise and problem-solving
- Leadership and team management
- Industry-specific knowledge
- Communication and collaboration
- Innovation and strategic thinking
- Project management
- Stakeholder management
- Professional development
- Industry trends and adaptation
- Cultural fit and values`;
    }

    const prompt = `Generate EXACTLY 100 highly specific and targeted interview questions for a ${jobDetails.experienceLevel} ${jobDetails.jobTitle} position${jobDetails.company ? ` at ${jobDetails.company}` : ''} in the ${jobDetails.industry} industry.

This is a ${jobDetails.interviewType} interview at the ${jobDetails.interviewStage} stage.

${jobDetails.jobAd ? `Here is the job description to reference:\n${jobDetails.jobAd}\n\n` : ''}

${typeInstructions}

Additional Requirements:
- Questions should be specific to ${jobDetails.industry} industry context
- Include scenario-based questions relevant to ${jobDetails.experienceLevel} level
- Focus on real-world applications and challenges
- Consider industry-specific tools, technologies, and methodologies
- Include questions about industry trends and future developments
- Ensure questions test both technical knowledge and soft skills
- Include questions about handling industry-specific challenges
- Consider the company's size and market position if provided

Make sure the questions are appropriate for a ${jobDetails.experienceLevel} level position and reflect the specific requirements of the ${jobDetails.industry} industry.

Return ONLY a JSON array of EXACTLY 100 objects with 'id' and 'question' fields. Do not include any markdown formatting or additional text.`;

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
    
    // Validate that we have exactly 100 questions
    if (!Array.isArray(questions) || questions.length !== 100) {
      console.error('Invalid number of questions received:', questions.length);
      throw new Error('Invalid number of questions received from API');
    }
    
    console.log('Parsed questions:', questions);
    return questions;
  } catch (error: any) {
    console.error('Error generating questions:', error);
    throw error;
  }
} 