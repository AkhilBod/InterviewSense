// Client-side wrapper functions that call server-side API routes
// All OpenAI API calls happen server-side — these functions just relay to /api/* routes

interface JobDetails {
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
  jobAd?: string;
  interviewType: string;
  interviewStage: string;
  numberOfQuestions?: number;
}

export async function generateBehavioralQuestions(jobDetails: JobDetails) {
  try {
    console.log('Generating questions via API route...');
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDetails }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate questions');
    }

    console.log('Received questions from API:', data.questions.length);
    return data.questions;
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

export async function generateFeedback(answer: string, question?: string, jobDetails?: Partial<JobDetails>): Promise<FeedbackResponse> {
  try {
    // Get resume data from localStorage if available
    let resumeText = '';
    let resumeFileName = '';
    if (typeof window !== 'undefined') {
      resumeText = localStorage.getItem('resume') || '';
      resumeFileName = localStorage.getItem('resumeFileName') || '';
    }

    console.log('Generating feedback via API route...');
    const response = await fetch('/api/generate-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, question, jobDetails, resumeText, resumeFileName }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate feedback');
    }

    return data.feedback as FeedbackResponse;
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
    if (typeof window === 'undefined') {
      throw new Error('This function must be called in a browser environment');
    }

    // Get all saved answers
    const answersJson = sessionStorage.getItem('interviewAnswers') || localStorage.getItem('interviewAnswers');
    if (!answersJson) {
      throw new Error('No interview answers found');
    }

    const allAnswers = JSON.parse(answersJson) as { [key: number]: string };
    const resumeText = localStorage.getItem('resume') || '';

    // Get job details from localStorage
    const interviewType = localStorage.getItem('interviewType') || 'Behavioral';
    const jobDetails = {
      jobTitle: localStorage.getItem('jobTitle') || 'Software Engineer',
      company: localStorage.getItem('company') || '',
      industry: interviewType === 'Behavioral' ? '' : (localStorage.getItem('industry') || 'Technology'),
      experienceLevel: localStorage.getItem('experienceLevel') || 'Mid-level',
      interviewType: interviewType,
      interviewStage: localStorage.getItem('interviewStage') || 'Initial',
    };

    // Get questions data
    let questionsData: any[] = [];
    try {
      const visibleQuestionsJson = localStorage.getItem('visibleQuestions');
      if (visibleQuestionsJson) {
        questionsData = JSON.parse(visibleQuestionsJson);
      }
    } catch (error) {
      console.error('Error parsing questions data:', error);
    }

    // Map answers to questions
    const answersArray = Object.entries(allAnswers).map(([id, text]) => {
      const questionId = parseInt(id);
      const questionObj = questionsData.find((q: any) => q.id === questionId);
      return {
        id: questionId,
        question: questionObj?.question || `Question ${id}`,
        answer: text,
      };
    });

    console.log('Generating interview summary via API route...');
    const response = await fetch('/api/interview-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answersArray, jobDetails, resumeText }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate summary');
    }

    return data.summary as InterviewSummary;
  } catch (error: any) {
    console.error('Error generating interview summary:', error);

    // Return a fallback summary if the API fails
    return {
      jobRole: localStorage.getItem('jobTitle') || 'Software Engineer',
      company: localStorage.getItem('company') || 'Not specified',
      date: new Date().toLocaleDateString(),
      duration: '24 minutes',
      overallScore: 83,
      strengthAreas: ['Problem solving', 'Technical knowledge', 'Communication'],
      improvementAreas: ['Leadership examples', 'Quantifying achievements', 'Brevity'],
      completedQuestions: parseInt(localStorage.getItem('completedQuestionsCount') || '5'),
      questionScores: [
        { id: 1, question: 'Tell me about yourself', score: 86 },
        { id: 2, question: 'Describe a challenging project', score: 92 },
        { id: 3, question: 'How do you handle conflicting priorities', score: 78 },
        { id: 4, question: 'What are your greatest strengths', score: 88 },
        { id: 5, question: 'Where do you see yourself in 5 years', score: 71 },
      ],
      fillerWordStats: { total: 27, mostCommon: 'like' },
      keywordStats: { matched: 14, missed: 7, mostImpactful: ['algorithms', 'distributed systems', 'scalability'] },
    };
  }
}

// Fallback transcription using browser's Speech Recognition API
export async function fallbackSpeechRecognition(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Browser speech recognition not supported'));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve({
        transcription: transcript,
        analysis: {
          clarity: 'Browser transcription - analysis not available',
          pace: 'Browser transcription - analysis not available',
          confidence: 'Browser transcription - analysis not available',
        },
        filler_words: [],
        sentiment: { tone: 'neutral', confidence: 0.5 },
      });
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
}

export async function transcribeAndAnalyzeAudio(audioBlob: Blob) {
  try {
    console.log('Transcribing audio via API route...');
    console.log('Audio size:', Math.round(audioBlob.size / 1024), 'KB');

    // Send audio to server-side API route
    const formData = new FormData();
    formData.append('audio', new File([audioBlob], 'audio.webm', { type: audioBlob.type }));

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // Map server error types to thrown errors for backward compatibility
      if (data.error === 'QUOTA_EXCEEDED') {
        throw new Error('QUOTA_EXCEEDED');
      }
      if (data.error === 'AUTHENTICATION_ERROR') {
        throw new Error('AUTHENTICATION_ERROR');
      }
      throw new Error(data.error || 'SERVICE_UNAVAILABLE');
    }

    return {
      transcription: data.transcription,
      analysis: data.analysis,
      filler_words: data.filler_words,
      sentiment: data.sentiment,
    };
  } catch (error) {
    console.error('Error in transcribing audio:', error);

    if (error instanceof Error) {
      const msg = error.message;
      if (msg === 'QUOTA_EXCEEDED' || msg === 'AUTHENTICATION_ERROR' || msg === 'SERVICE_UNAVAILABLE') {
        throw error;
      }
    }

    throw new Error('SERVICE_UNAVAILABLE');
  }
}