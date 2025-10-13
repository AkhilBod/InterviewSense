// API endpoint for specific resume analysis with severity highlighting
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  console.log("=== Resume Specific Analysis API Started ===");
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

    console.log("Received data:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      jobTitle,
      company,
      jobDescriptionLength: jobDescription?.length
    });

    if (!file || !jobTitle) {
      console.log("Missing required fields: file or jobTitle");
      return NextResponse.json({ error: "Resume file and job title are required." }, { status: 400 });
    }

    // File validation
    const supportedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain"
    ];

    if (!supportedMimeTypes.includes(file.type)) {
      console.log(`Unsupported file type: ${file.type}`);
      return NextResponse.json({ 
        error: `Unsupported file type: '${file.type}'. Please upload PDF, DOCX, DOC, or TXT.` 
      }, { status: 400 });
    }

    console.log("File validation passed. Processing file...");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');

    console.log("File converted to base64. Size:", Math.round(base64File.length / 1024), "KB");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const textPromptPart = {
      text: `You are an expert resume reviewer specializing in providing specific, actionable recommendations for the "${jobTitle}" role${company ? ` at "${company}"` : ""}.

Your task is to analyze the resume and provide EXACT, specific improvements categorized by importance and improvement type.

Focus on these critical areas:
1. QUANTIFY IMPACT: Identify statements that need specific numbers, percentages, metrics, or dollar amounts
2. COMMUNICATION: Find weak action verbs, passive language, unclear descriptions that need strengthening  
3. LENGTH & DEPTH: Spot descriptions that are too brief and need more detail or are too verbose
4. DRIVE: Identify language that doesn't show initiative, leadership, or proactive behavior
5. ANALYTICAL: Find missing analytical thinking, problem-solving, or data-driven examples

${jobDescription ? `\nJob Description Context:\n${jobDescription}\n` : ""}

Return your analysis in this EXACT JSON format - no additional text, markdown, or formatting:

{
  "specificImprovements": [
    {
      "original": "Worked on software projects",
      "improved": "Led development of 3 enterprise software projects that increased user engagement by 40% and reduced processing time by 25%",
      "severity": "red",
      "category": "quantify_impact",
      "explanation": "Vague statement lacks specific metrics, leadership indicators, and quantifiable business impact",
      "location": "Experience section, Software Developer role"
    },
    {
      "original": "good communication skills",
      "improved": "proven ability to present technical concepts to C-level executives and lead cross-functional teams of 8+ members",
      "severity": "yellow", 
      "category": "communication",
      "explanation": "Generic phrase should be replaced with specific examples of communication impact",
      "location": "Skills section"
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
  },
  "improvementSummary": {
    "criticalIssues": "Resume lacks quantified achievements and specific metrics that demonstrate business impact",
    "keyOpportunities": "Add specific numbers to accomplishments, strengthen action verbs, and include leadership examples",
    "strengthsToKeep": "Strong technical skills section and relevant experience progression"
  }
}

SEVERITY LEVELS:
- RED (Critical): Issues that significantly hurt candidacy (vague achievements, weak verbs, no metrics)
- YELLOW (Important): Improvements that would strengthen the resume (generic phrases, missed opportunities)  
- GREEN (Polish): Minor enhancements for optimization (formatting, word choice refinements)

CATEGORIES:
- quantify_impact: Add specific numbers, percentages, dollar amounts, timeframes
- communication: Strengthen action verbs, clarify descriptions, improve language
- length_depth: Expand brief descriptions or condense verbose sections
- drive: Add leadership, initiative, and proactive behavior examples
- analytical: Include problem-solving, data analysis, strategic thinking examples

Be extremely specific with the "original" text - use exact phrases from the resume. Provide detailed "improved" versions that are role-specific and quantified where possible.`
    };

    const generationConfig = {
      temperature: 0.7,
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

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    console.log("Gemini API response received.");
    const response = result.response;

    if (!response || !response.candidates || response.candidates.length === 0) {
      console.log("No content in Gemini response");
      return NextResponse.json({ error: "Failed to generate analysis. No content received from AI." }, { status: 500 });
    }

    const analysisText = response.candidates[0].content.parts.map(part => part.text).join("");
    
    if (!analysisText) {
      console.log("Empty analysis text from Gemini");
      return NextResponse.json({ error: "Failed to generate analysis. Received empty response." }, { status: 500 });
    }

    console.log("Analysis generated successfully");

    let parsedAnalysis;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedAnalysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.log("Raw response:", analysisText);
      return NextResponse.json({ error: "Failed to parse analysis response. Please try again." }, { status: 500 });
    }

    const successResponse = { 
      analysis: parsedAnalysis,
      success: true
    };
    
    console.log("Specific analysis completed successfully");
    return NextResponse.json(successResponse);

  } catch (error) {
    console.error("Error in resume specific analysis API:", error);
    let errorMessage = "An unexpected error occurred during analysis.";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(`Detailed error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);

    const errorResponse = { error: errorMessage };
    console.log("Final Error Response:", errorResponse);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
