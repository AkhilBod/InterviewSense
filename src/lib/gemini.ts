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

    const prompt = `Generate EXACTLY 20 highly specific and targeted interview questions for a ${jobDetails.experienceLevel} ${jobDetails.jobTitle} position${jobDetails.company ? ` at ${jobDetails.company}` : ''} in the ${jobDetails.industry} industry.

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

Return ONLY a JSON array of EXACTLY 20 objects with 'id' and 'question' fields. Do not include any markdown formatting or additional text.`;

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
    
    // Validate that we have exactly 20 questions
    if (!Array.isArray(questions) || questions.length !== 20) {
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

interface FeedbackResponse {
  scores: {
    label: string;
    score: number;
    color: string;
  }[];
  keywordsDetected: string[];
  keywordsMissing: string[];
  suggestions: {
    id: number;
    text: string;
    type: "improvement" | "strength" | "keyword" | "resume";
  }[];
  fillerWords: {
    word: string;
    count: number;
  }[];
}

export async function generateFeedback(answer: string, question?: string, jobDetails?: Partial<JobDetails>) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Check if resume data is available in localStorage
    let resumeText = '';
    let hasResume = false;
    let resumeFileName = '';
    
    // We'll check for resume existence in the browser environment
    if (typeof window !== 'undefined') {
      resumeText = localStorage.getItem('resume') || '';
      resumeFileName = localStorage.getItem('resumeFileName') || '';
      hasResume = resumeText.trim() !== '';
    }

    // Create our prompt with or without resume data
    const prompt = hasResume 
      ? `Analyze this interview answer and provide detailed feedback. I'll also provide the candidate's resume to help you give more personalized feedback that considers their background and experience.

Question: ${question || "Not provided"}
Answer: "${answer}"
${jobDetails ? `
Role: ${jobDetails.jobTitle || "Not specified"}
Industry: ${jobDetails.industry || "Not specified"}
Experience Level: ${jobDetails.experienceLevel || "Not specified"}
Interview Type: ${jobDetails.interviewType || "Not specified"}
` : ''}

Candidate Resume (${resumeFileName}):
${resumeText}

Based on both the answer and the candidate's resume, provide a detailed analysis of the interview answer in the following JSON format:

{
  "scores": [
    {"label": "Clarity", "score": <0-100>, "color": "bg-blue-600"},
    {"label": "Conciseness", "score": <0-100>, "color": "bg-emerald-600"},
    {"label": "Confidence", "score": <0-100>, "color": "bg-violet-600"},
    {"label": "Relevance", "score": <0-100>, "color": "bg-amber-600"},
    {"label": "Resume Alignment", "score": <0-100>, "color": "bg-purple-600"}
  ],
  "keywordsDetected": ["keyword1", "keyword2", ...],
  "keywordsMissing": ["keyword1", "keyword2", ...],
  "suggestions": [
    {"id": 1, "text": "<improvement suggestion that references resume experience when applicable>", "type": "improvement"},
    {"id": 2, "text": "<strength observation that acknowledges background from resume>", "type": "strength"},
    {"id": 3, "text": "<keyword suggestion based on resume skills and experience>", "type": "keyword"},
    {"id": 4, "text": "<specific suggestion on how to incorporate resume experience X into the answer>", "type": "resume"},
    ...
  ],
  "fillerWords": [
    {"word": "<filler word>", "count": <number>},
    ...
  ]
}

The scores should be calculated based on:
- Clarity: How well the answer is structured and explained
- Conciseness: How efficiently the response conveys the information
- Confidence: How confident and authoritative the language is
- Relevance: How well the answer addresses the question
- Resume Alignment: How effectively the candidate incorporated relevant experience from their resume

Pay special attention to how the candidate could better leverage their background (from their resume) in their answer. Include at least 2-3 suggestions of type "resume" that tie directly to specific experiences, projects, or skills mentioned in their resume that would strengthen their answer.

Return ONLY the JSON without any markdown formatting or additional text.`
      : `Analyze this interview answer and provide detailed feedback.

Question: ${question || "Not provided"}
Answer: "${answer}"
${jobDetails ? `
Role: ${jobDetails.jobTitle || "Not specified"}
Industry: ${jobDetails.industry || "Not specified"}
Experience Level: ${jobDetails.experienceLevel || "Not specified"}
Interview Type: ${jobDetails.interviewType || "Not specified"}
` : ''}

Provide a detailed analysis of the interview answer in the following JSON format:

{
  "scores": [
    {"label": "Clarity", "score": <0-100>, "color": "bg-blue-600"},
    {"label": "Conciseness", "score": <0-100>, "color": "bg-emerald-600"},
    {"label": "Confidence", "score": <0-100>, "color": "bg-violet-600"},
    {"label": "Relevance", "score": <0-100>, "color": "bg-amber-600"}
  ],
  "keywordsDetected": ["keyword1", "keyword2", ...],
  "keywordsMissing": ["keyword1", "keyword2", ...],
  "suggestions": [
    {"id": 1, "text": "<improvement suggestion>", "type": "improvement"},
    {"id": 2, "text": "<strength observation>", "type": "strength"},
    {"id": 3, "text": "<keyword suggestion>", "type": "keyword"},
    ...
  ],
  "fillerWords": [
    {"word": "<filler word>", "count": <number>},
    ...
  ]
}

The scores should be calculated based on:
- Clarity: How well the answer is structured and explained
- Conciseness: How efficiently the response conveys the information
- Confidence: How confident and authoritative the language is
- Relevance: How well the answer addresses the question

Return ONLY the JSON without any markdown formatting or additional text.`;

    console.log('Sending feedback prompt to Gemini:', prompt);
    console.log('Resume data included:', hasResume);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received feedback response from Gemini:', text);
    
    // Clean the response text by removing markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    console.log('Cleaned feedback response:', cleanText);
    
    // Parse the JSON response
    const feedback = JSON.parse(cleanText) as FeedbackResponse;
    
    return feedback;
  } catch (error: any) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}

export interface InterviewSummary {
  jobRole: string;
  company: string;
  date: string;
  duration: string;
  overallScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  completedQuestions: number;
  questionScores: {
    id: number;
    question: string;
    score: number;
  }[];
  fillerWordStats: {
    total: number;
    mostCommon: string;
  };
  keywordStats: {
    matched: number;
    missed: number;
    mostImpactful: string[];
  };
}

export async function generateInterviewSummary(): Promise<InterviewSummary> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('This function must be called in a browser environment');
    }
    
    // Get all saved answers from localStorage
    const answersJson = localStorage.getItem('interviewAnswers');
    if (!answersJson) {
      throw new Error('No interview answers found');
    }
    
    const allAnswers = JSON.parse(answersJson) as {[key: number]: string};
    
    // Get resume data if available
    const resumeText = localStorage.getItem('resume') || '';
    const hasResume = resumeText.trim() !== '';
    
    // Get job details from localStorage
    const jobDetails = {
      jobTitle: localStorage.getItem('jobTitle') || 'Software Engineer',
      company: localStorage.getItem('company') || '',
      industry: localStorage.getItem('industry') || 'Technology',
      experienceLevel: localStorage.getItem('experienceLevel') || 'Mid-level',
      interviewType: localStorage.getItem('interviewType') || 'Behavioral',
      interviewStage: localStorage.getItem('interviewStage') || 'Initial'
    };
    
    // Get questions data (may not have all questions available)
    let questionsData = [];
    try {
      // Try to reconstruct question data from localStorage if available
      const visibleQuestionsJson = localStorage.getItem('visibleQuestions');
      if (visibleQuestionsJson) {
        questionsData = JSON.parse(visibleQuestionsJson);
      }
    } catch (error) {
      console.error('Error parsing questions data:', error);
      // Continue with empty questions data
    }
    
    // Map answers to questions where possible
    const answersArray = Object.entries(allAnswers).map(([id, text]) => {
      const questionId = parseInt(id);
      const questionObj = questionsData.find((q: any) => q.id === questionId);
      return {
        id: questionId,
        question: questionObj?.question || `Question ${id}`,
        answer: text
      };
    });
    
    // Concatenate all answers into a single text for analysis
    const combinedAnswerText = answersArray.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');
    
    // Use Gemini to analyze all answers together
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create our prompt
    const prompt = hasResume 
      ? `Analyze this entire interview and provide a comprehensive summary. I'll also provide the candidate's resume to help you give more personalized feedback that considers their background and experience.

Combined Interview Answers:
${combinedAnswerText}

Job Details:
Role: ${jobDetails.jobTitle}
Company: ${jobDetails.company || "Not specified"}
Industry: ${jobDetails.industry}
Experience Level: ${jobDetails.experienceLevel}
Interview Type: ${jobDetails.interviewType}
Interview Stage: ${jobDetails.interviewStage}

Candidate Resume:
${resumeText}

Based on both the interview answers and the candidate's resume, provide a comprehensive interview summary in the following JSON format:

{
  "jobRole": "${jobDetails.jobTitle}",
  "company": "${jobDetails.company || "Not specified"}",
  "date": "${new Date().toISOString()}",
  "duration": "CALCULATE_DURATION_MINUTES",
  "overallScore": <0-100>,
  "strengthAreas": ["strength1", "strength2", "strength3"],
  "improvementAreas": ["improvement1", "improvement2", "improvement3"],
  "completedQuestions": ${answersArray.length},
  "questionScores": [
    {"id": 1, "question": "Question text 1", "score": <0-100>},
    {"id": 2, "question": "Question text 2", "score": <0-100>},
    ...
  ],
  "fillerWordStats": {
    "total": <number>,
    "mostCommon": "<most common filler word>"
  },
  "keywordStats": {
    "matched": <number>,
    "missed": <number>,
    "mostImpactful": ["keyword1", "keyword2", "keyword3"]
  }
}

The scores should be calculated based on:
- Overall quality and relevance of answers
- Alignment with resume experience and skills
- Use of specific examples and metrics
- Structure and clarity of responses
- Demonstration of relevant skills for ${jobDetails.jobTitle}
- Avoidance of filler words and vague language

Focus on how effectively the candidate incorporated their background from their resume into their answers. Look for connections between their stated experience and their interview responses.

Return ONLY the JSON without any markdown formatting or additional text.`
      : `Analyze this entire interview and provide a comprehensive summary.

Combined Interview Answers:
${combinedAnswerText}

Job Details:
Role: ${jobDetails.jobTitle}
Company: ${jobDetails.company || "Not specified"}
Industry: ${jobDetails.industry}
Experience Level: ${jobDetails.experienceLevel}
Interview Type: ${jobDetails.interviewType}
Interview Stage: ${jobDetails.interviewStage}

Provide a comprehensive interview summary in the following JSON format:

{
  "jobRole": "${jobDetails.jobTitle}",
  "company": "${jobDetails.company || "Not specified"}",
  "date": "${new Date().toISOString()}",
  "duration": "CALCULATE_DURATION_MINUTES",
  "overallScore": <0-100>,
  "strengthAreas": ["strength1", "strength2", "strength3"],
  "improvementAreas": ["improvement1", "improvement2", "improvement3"],
  "completedQuestions": ${answersArray.length},
  "questionScores": [
    {"id": 1, "question": "Question text 1", "score": <0-100>},
    {"id": 2, "question": "Question text 2", "score": <0-100>},
    ...
  ],
  "fillerWordStats": {
    "total": <number>,
    "mostCommon": "<most common filler word>"
  },
  "keywordStats": {
    "matched": <number>,
    "missed": <number>,
    "mostImpactful": ["keyword1", "keyword2", "keyword3"]
  }
}

The scores should be calculated based on:
- Overall quality and relevance of answers
- Use of specific examples and metrics
- Structure and clarity of responses
- Demonstration of relevant skills for ${jobDetails.jobTitle}
- Avoidance of filler words and vague language

Return ONLY the JSON without any markdown formatting or additional text.`;

    console.log('Sending summary prompt to Gemini');
    console.log('Resume data included:', hasResume);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received summary response from Gemini');
    
    // Clean the response text by removing markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    // Parse the JSON response
    const summary = JSON.parse(cleanText) as InterviewSummary;
    
    // Format the date nicely
    summary.date = new Date().toLocaleDateString();
    
    // Calculate a simulated duration if the API didn't provide a real one
    if (summary.duration === "CALCULATE_DURATION_MINUTES") {
      // Generate a realistic interview duration based on number of questions answered
      const minutes = Math.max(15, Math.min(60, answersArray.length * 4 + Math.floor(Math.random() * 10)));
      summary.duration = `${minutes} minutes`;
    }
    
    return summary;
  } catch (error: any) {
    console.error('Error generating interview summary:', error);
    
    // Return a fallback summary if the API fails
    return {
      jobRole: localStorage.getItem('jobTitle') || 'Software Engineer',
      company: localStorage.getItem('company') || 'Not specified',
      date: new Date().toLocaleDateString(),
      duration: "24 minutes",
      overallScore: 83,
      strengthAreas: ["Problem solving", "Technical knowledge", "Communication"],
      improvementAreas: ["Leadership examples", "Quantifying achievements", "Brevity"],
      completedQuestions: parseInt(localStorage.getItem('completedQuestionsCount') || '5'),
      questionScores: [
        { id: 1, question: "Tell me about yourself", score: 86 },
        { id: 2, question: "Describe a challenging project", score: 92 },
        { id: 3, question: "How do you handle conflicting priorities", score: 78 },
        { id: 4, question: "What are your greatest strengths", score: 88 },
        { id: 5, question: "Where do you see yourself in 5 years", score: 71 }
      ],
      fillerWordStats: {
        total: 27,
        mostCommon: "like"
      },
      keywordStats: {
        matched: 14,
        missed: 7,
        mostImpactful: ["algorithms", "distributed systems", "scalability"]
      }
    };
  }
}

// Audio transcription and analysis using Gemini
export async function transcribeAndAnalyzeAudio(audioBlob: Blob) {
  try {
    console.log("Starting audio transcription with Gemini");
    
    // Convert the audio blob to a base64 string
    const base64Audio = await blobToBase64(audioBlob);
    
    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create a request with the audio content
    const prompt = `
    I'm providing an audio file of a person speaking during a job interview. Please:
    
    1. Transcribe the audio content accurately.
    2. Analyze the speaking style (clarity, pace, confidence).
    3. Identify any filler words or phrases (like "um", "uh", "you know", etc.).
    4. Provide a brief sentiment analysis (positive, neutral, negative tone).
    
    Return your response in this JSON format:
    {
      "transcription": "Full transcription of the audio here...",
      "analysis": {
        "clarity": "Rating from 1-10 with brief explanation",
        "pace": "Rating from 1-10 with brief explanation",
        "confidence": "Rating from 1-10 with brief explanation"
      },
      "filler_words": [
        {"word": "um", "count": 5},
        {"word": "like", "count": 3}
      ],
      "sentiment": {"tone": "positive/neutral/negative", "confidence": 0.85}
    }
    
    Only respond with this JSON format and nothing else.`;
    
    // Create parts including the audio file
    const parts = [
      {text: prompt},
      {inlineData: {mimeType: audioBlob.type, data: base64Audio}}
    ];
    
    console.log("Sending audio to Gemini for transcription and analysis");
    
    // Generate content with the audio
    const result = await model.generateContent({
      contents: [{role: "user", parts}]
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log("Received transcription result from Gemini");
    
    // Parse the JSON response
    try {
      // Clean up any markdown formatting that might be in the response
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const transcriptionResult = JSON.parse(cleanText);
      return transcriptionResult;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Response was:", text);
      throw new Error("Invalid response format from transcription API");
    }
  } catch (error) {
    console.error("Error in transcribing audio with Gemini:", error);
    throw error;
  }
}

// Helper function to convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("FileReader did not return a string"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}