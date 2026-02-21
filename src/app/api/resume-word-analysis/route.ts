import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface WordImprovementSuggestion {
  original: string;
  improved: string;
  severity: "red" | "yellow" | "green";
  category: "quantify_impact" | "communication" | "length_depth" | "drive" | "analytical" | "general";
  explanation: string;
  position?: {
    start: number;
    end: number;
  };
  textPosition?: {
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function POST(req: Request) {
  console.log("=== Resume Word Analysis API Started ===");
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json({ error: "API configuration error. Please try again later." }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", session.user.email);

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobTitle = formData.get("jobTitle") as string | null;
    const company = formData.get("company") as string | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    console.log("Form data received:", { 
      hasFile: !!file, 
      jobTitle, 
      company: company || "none", 
      hasJobDescription: !!jobDescription 
    });

    if (!file || !jobTitle) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "Resume file and job title are required." }, { status: 400 });
    }

    const supportedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/markdown",
      "text/html",
    ];

    if (!file.type || !supportedMimeTypes.includes(file.type)) {
      console.log("Unsupported file type:", file.type);
      return NextResponse.json({
        error: `Unsupported file type: '${file.type}'. Please try PDF, DOCX, DOC, or text formats.`
      }, { status: 400 });
    }

    console.log("File validation passed. Processing file...");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');

    console.log("File converted to base64. Size:", Math.round(base64File.length / 1024), "KB");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const textPromptPart = {
      text: `You are an expert resume reviewer specializing in identifying specific words and phrases that need improvement for the "${jobTitle}" role${company ? ` at "${company}"` : ""}.

Your task is to analyze the resume and identify EXACT words, phrases, or sentences that should be improved, categorizing them by severity and improvement type.

Focus on these key areas:
1. QUANTIFY IMPACT: Identify vague statements that need specific numbers, percentages, or metrics
2. COMMUNICATION: Find weak action verbs, passive language, or unclear descriptions
3. LENGTH & DEPTH: Spot overly brief descriptions that need more detail or overly verbose sections
4. DRIVE: Identify language that doesn't show initiative, leadership, or proactive behavior
5. ANALYTICAL: Find missing analytical thinking, problem-solving, or data-driven decision making

${jobDescription ? `\nJob Description Context:\n${jobDescription}\n` : ""}

Return your analysis in this EXACT JSON format - no additional text, markdown, or formatting:

{
  "wordImprovements": [
    {
      "original": "Worked on software projects",
      "improved": "Led development of 3 software projects that increased user engagement by 40%",
      "severity": "red",
      "category": "quantify_impact",
      "explanation": "Vague statement lacks specific metrics and leadership indicators"
    },
    {
      "original": "good communication skills",
      "improved": "proven ability to present technical concepts to C-level executives and lead cross-functional teams of 8+ members",
      "severity": "yellow", 
      "category": "communication",
      "explanation": "Generic phrase should be replaced with specific examples"
    }
  ],
  "overallScore": 75,
  "severityBreakdown": {
    "red": 5,
    "yellow": 8,
    "green": 2
  },
  "categoryBreakdown": {
    "quantify_impact": 6,
    "communication": 4,
    "length_depth": 3,
    "drive": 1,
    "analytical": 1
  }
}

SEVERITY LEVELS:
- RED (Urgent): Critical issues that significantly hurt candidacy (vague achievements, weak verbs, no metrics)
- YELLOW (Next Priority): Important improvements that would strengthen the resume (generic phrases, missed opportunities)
- GREEN (Good with minor tweaks): Already good content that could be slightly enhanced

CATEGORIES:
- quantify_impact: Add numbers, percentages, dollar amounts, timeframes
- communication: Stronger action verbs, clearer language, specific communication examples
- length_depth: Right-size descriptions (more detail for achievements, concise for routine tasks)
- drive: Show initiative, leadership, proactive behavior, ownership
- analytical: Demonstrate problem-solving, data analysis, strategic thinking

Find 10-20 specific improvements. Focus on the most impactful changes that hiring managers for ${jobTitle} positions would notice.`
    };

    const generationConfig = {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const parts = [
      textPromptPart,
      {
        inlineData: {
          mimeType: file.type,
          data: base64File,
        },
      },
    ];

    console.log("Sending request to Gemini API for word analysis...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    console.log("Received response from Gemini API");

    const response = result.response;
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("No candidates in Gemini response");
      return NextResponse.json({ error: "Failed to generate word analysis." }, { status: 500 });
    }

    const analysisText = response.candidates[0].content.parts.map(part => part.text).join("");
    
    if (!analysisText) {
      console.error("Empty analysis text received");
      return NextResponse.json({ error: "Received empty analysis." }, { status: 500 });
    }

    console.log("Analysis text length:", analysisText.length);
    console.log("Raw Gemini response preview:", analysisText.substring(0, 200) + "...");

    try {
      // Clean the response to extract JSON
      let cleanedText = analysisText.trim();
      
      // Remove any markdown code blocks
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find the JSON object
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("No JSON found in response");
      }
      
      const jsonString = cleanedText.substring(jsonStart, jsonEnd);
      const parsedAnalysis = JSON.parse(jsonString);

      // Validate the structure
      if (!parsedAnalysis.wordImprovements || !Array.isArray(parsedAnalysis.wordImprovements)) {
        throw new Error("Invalid response structure");
      }

      console.log("Successfully parsed word analysis");
      return NextResponse.json({
        success: true,
        analysis: parsedAnalysis,
        fileName: file.name,
        jobTitle,
        company: company || undefined,
        analysisDate: new Date().toISOString()
      });

    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Raw response was:", analysisText);
      
      // Fallback: try to extract information manually
      const fallbackAnalysis = extractAnalysisManually(analysisText);
      
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        fileName: file.name,
        jobTitle,
        company: company || undefined,
        analysisDate: new Date().toISOString(),
        note: "Parsed with fallback method"
      });
    }

  } catch (error) {
    console.error("=== Error in word analysis API ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Provide more specific error messages
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "API configuration error. Please try again later.";
      } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
        errorMessage = "Service temporarily unavailable. Please try again in a few minutes.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  }
}

// Fallback function to extract analysis manually if JSON parsing fails
function extractAnalysisManually(text: string): any {
  const improvements: WordImprovementSuggestion[] = [];
  
  // Try to extract individual improvements from the text
  const lines = text.split('\n');
  let currentImprovement: Partial<WordImprovementSuggestion> = {};
  
  lines.forEach(line => {
    line = line.trim();
    if (line.includes('original') && line.includes(':')) {
      const original = line.split(':')[1]?.replace(/[",]/g, '').trim();
      if (original) currentImprovement.original = original;
    }
    if (line.includes('improved') && line.includes(':')) {
      const improved = line.split(':')[1]?.replace(/[",]/g, '').trim();
      if (improved) currentImprovement.improved = improved;
    }
    if (line.includes('severity') && line.includes(':')) {
      const severity = line.split(':')[1]?.replace(/[",]/g, '').trim() as "red" | "yellow" | "green";
      if (severity) currentImprovement.severity = severity;
    }
    if (line.includes('category') && line.includes(':')) {
      const category = line.split(':')[1]?.replace(/[",]/g, '').trim() as any;
      if (category) currentImprovement.category = category;
    }
    if (line.includes('explanation') && line.includes(':')) {
      const explanation = line.split(':')[1]?.replace(/[",]/g, '').trim();
      if (explanation) {
        currentImprovement.explanation = explanation;
        // If we have all required fields, add to improvements
        if (currentImprovement.original && currentImprovement.improved && 
            currentImprovement.severity && currentImprovement.category) {
          improvements.push(currentImprovement as WordImprovementSuggestion);
          currentImprovement = {};
        }
      }
    }
  });

  // Create a basic structure if we couldn't parse properly
  if (improvements.length === 0) {
    improvements.push({
      original: "Generic resume content detected",
      improved: "Add specific metrics and achievements",
      severity: "red",
      category: "quantify_impact",
      explanation: "Resume needs more specific details and quantifiable achievements"
    });
  }

  const redCount = improvements.filter(i => i.severity === 'red').length;
  const yellowCount = improvements.filter(i => i.severity === 'yellow').length;
  const greenCount = improvements.filter(i => i.severity === 'green').length;

  return {
    wordImprovements: improvements,
    overallScore: Math.max(30, 85 - (redCount * 10) - (yellowCount * 5)),
    severityBreakdown: {
      red: redCount,
      yellow: yellowCount,
      green: greenCount
    },
    categoryBreakdown: {
      quantify_impact: improvements.filter(i => i.category === 'quantify_impact').length,
      communication: improvements.filter(i => i.category === 'communication').length,
      length_depth: improvements.filter(i => i.category === 'length_depth').length,
      drive: improvements.filter(i => i.category === 'drive').length,
      analytical: improvements.filter(i => i.category === 'analytical').length
    }
  };
}
