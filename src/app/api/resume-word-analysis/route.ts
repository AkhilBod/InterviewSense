import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { convertToHighlights } from "@/lib/highlight-converter";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

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
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
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

    const textPrompt = `You are an experienced recruiter and career coach reviewing a resume for the "${jobTitle}" role${company ? ` at "${company}"` : ""}. Give honest, constructive feedback that helps the candidate improve without being demoralizing.

GRADING SCALE (be honest and calibrated):
- 85-100: Strong resume — clear metrics throughout, compelling impact, well-targeted to role
- 70-84: Good resume — solid fundamentals, most bullets show impact, minor gaps
- 55-69: Average resume — decent structure but several vague bullets or weak verbs
- 40-54: Below average — vague descriptions, many weak action verbs, little measurable impact
- Below 40: Needs significant work — almost no specifics or metrics

IMPORTANT: Good resumes SHOULD score 75+. Do not penalize a resume with strong metrics and clear impact just to seem harsh. Likewise, do not inflate a weak resume. Score it accurately.

SEVERITY GUIDE:
- RED (Critical): Bullets with NO useful specifics ("helped with projects", "worked on team"), clear weak verbs with zero context ("was responsible for", "assisted with"), or completely missing required skills. Flag these only when they genuinely hurt candidacy.
- YELLOW (Important): Bullets with some value but missing a key metric or a stronger verb. Most suggestions should be YELLOW.
- GREEN (Minor): Small wording tweaks, optional polish, minor improvements.

BALANCE RULE: Roughly 25-35% RED, 45-55% YELLOW, 15-20% GREEN. Never flag every bullet as red — that's not useful. Reserve RED for real problems.

${jobDescription ? `\nJob Description Context:\n${jobDescription}\n` : ""}

INSTRUCTIONS:
- Find 12-18 specific improvements — focus on the highest-impact ones
- The "original" field MUST contain the EXACT text as it appears in the resume
- Be direct but constructive — explain WHY it's weak and HOW to fix it specifically

Return ONLY this JSON (no markdown, no extra text):

{
  "wordImprovements": [
    {
      "original": "Worked on software projects",
      "improved": "Built and shipped 3 internal tools that reduced manual reporting time by 60% for the operations team",
      "severity": "red",
      "category": "quantify_impact",
      "explanation": "'Worked on' is too vague — a recruiter can't tell what you did or what impact it had. Add what you built and the outcome."
    },
    {
      "original": "Improved team performance",
      "improved": "Introduced weekly code review sessions that reduced bug rate by 25% over 3 months",
      "severity": "yellow",
      "category": "quantify_impact",
      "explanation": "Good direction, but 'improved' is vague. Adding a specific metric and timeframe makes this significantly more compelling."
    }
  ],
  "overallScore": 68,
  "severityBreakdown": {
    "red": 4,
    "yellow": 10,
    "green": 3
  },
  "categoryBreakdown": {
    "quantify_impact": 7,
    "communication": 4,
    "length_depth": 2,
    "drive": 2,
    "analytical": 1,
    "general": 1
  }
}

SEVERITY LEVELS:
- red: Genuine problems that hurt candidacy — only for truly weak content
- yellow: Good content that could be stronger — most issues should be here
- green: Minor optional polish

CATEGORIES:
- quantify_impact: Add numbers, percentages, dollar amounts, user counts, timeframes
- communication: Replace weak verbs, clarify unclear descriptions
- length_depth: Expand thin bullets or condense verbose ones
- drive: Show initiative, leadership, ownership
- analytical: Demonstrate data-driven decisions, problem-solving
- general: Formatting, keyword optimization, removing clichés`;

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // Check if file is an image
    const isImage = file.type.includes('image');

    if (isImage) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: textPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${file.type};base64,${base64File}`
            }
          }
        ]
      });
    } else if (file.type.includes('pdf')) {
      // For PDFs, send as file input so the model reads actual content
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: textPrompt },
          {
            type: 'file',
            file: {
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64File}`
            }
          } as unknown as OpenAI.Chat.ChatCompletionContentPartText
        ]
      });
    } else {
      // For DOCX/DOC and other text-based documents
      messages.push({
        role: 'user',
        content: `${textPrompt}\n\n[Document file: ${file.name}, type: ${file.type}. Analyze the resume content embedded in this document.]`
      });
    }

    console.log("Sending request to OpenAI API for word analysis...");
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_completion_tokens: 4096,
    });

    console.log("Received response from OpenAI API");

    const analysisText = completion.choices[0].message.content;
    
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

      // Derive severityBreakdown from actual item severities (AI sometimes mismatches)
      const derived = { red: 0, yellow: 0, green: 0 };
      for (const item of parsedAnalysis.wordImprovements) {
        if (item.severity === 'red') derived.red++;
        else if (item.severity === 'yellow') derived.yellow++;
        else derived.green++;
      }
      parsedAnalysis.severityBreakdown = derived;

      // Derive categoryBreakdown from actual items too
      const cats: Record<string, number> = {};
      for (const item of parsedAnalysis.wordImprovements) {
        cats[item.category] = (cats[item.category] || 0) + 1;
      }
      parsedAnalysis.categoryBreakdown = cats;

      // Convert word improvements to highlights for PDF viewer
      const highlights = convertToHighlights(parsedAnalysis.wordImprovements || []);
      
      return NextResponse.json({
        success: true,
        analysis: parsedAnalysis,
        highlights,
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
      
      // Convert to highlights even with fallback
      const highlights = convertToHighlights(fallbackAnalysis.wordImprovements || []);
      
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        highlights,
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
