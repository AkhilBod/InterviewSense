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

    const textPrompt = `You are a BRUTALLY HONEST, elite resume reviewer who has screened 10,000+ resumes for top companies like Google, Meta, and Goldman Sachs. You have IMPOSSIBLY HIGH STANDARDS. You are reviewing this resume for the "${jobTitle}" role${company ? ` at "${company}"` : ""}.

Your job is to RUTHLESSLY critique this resume. Most resumes are mediocre at best. Be harsh. Be critical. The candidate needs to hear the truth, not sugar-coated feedback.

GRADING SCALE (be harsh):
- 90-100: World-class resume (reserved for top 1% — clear metrics everywhere, perfect formatting, compelling narrative)
- 80-89: Strong resume with minor issues (top 10% — mostly quantified, good verbs, clear impact)
- 70-79: Decent but needs work (average — some metrics, some vague areas)
- 60-69: Weak resume with significant issues (below average — many vague bullets, weak verbs)
- 50-59: Poor resume that needs major revision (problematic — almost no metrics, generic phrases)
- Below 50: Resume needs complete rewrite (severe issues — would be rejected immediately)

CRITICAL ISSUES TO FLAG (mark as RED):
- ANY bullet point without a specific number, percentage, dollar amount, or measurable outcome
- ANY weak action verb: "worked", "helped", "assisted", "was responsible for", "handled", "managed" (without metrics), "participated", "contributed"
- ANY generic phrases: "good communication skills", "team player", "fast learner", "detail-oriented", "hard-working"
- ANY bullet that doesn't show clear IMPACT (so what? why does this matter?)
- Missing technical skills that are REQUIRED for ${jobTitle}
- Inconsistent formatting, typos, or grammatical errors
- Bullet points that are too long (>2 lines) or too short (<10 words)

IMPORTANT ISSUES TO FLAG (mark as YELLOW):
- Bullets with metrics but could be stronger
- Good action verbs but missing specific context
- Missing keywords from the job description
- Skills listed without demonstrated application

${jobDescription ? `\nJob Description Context (check for missing keywords!):\n${jobDescription}\n` : ""}

INSTRUCTIONS:
- Find AT LEAST 20-30 specific improvements — be thorough
- The average resume should score 55-65. Only exceptional resumes score 75+
- Flag EVERY SINGLE bullet point that lacks quantifiable metrics as RED
- Flag EVERY weak action verb as RED
- The "original" field MUST contain the EXACT text as it appears in the resume — copy it character-by-character
- Your overallScore MUST match your severity breakdown: if you have 10+ RED issues, score should be below 65
- If more than half the bullets lack metrics, score should be below 60

SCORING CONSISTENCY RULES:
- 0-3 RED issues = score 80-100
- 4-7 RED issues = score 70-79
- 8-12 RED issues = score 60-69
- 13-18 RED issues = score 50-59
- 19+ RED issues = score below 50

Return your analysis in this EXACT JSON format - no additional text, markdown, or formatting:

{
  "wordImprovements": [
    {
      "original": "Worked on software projects",
      "improved": "Architected and deployed 3 microservices handling 50K+ daily requests, reducing system latency by 40% and saving $25K/month in infrastructure costs",
      "severity": "red",
      "category": "quantify_impact",
      "explanation": "CRITICAL: Extremely vague. 'Worked on' is one of the weakest action verbs. No metrics, no impact, no specifics. What projects? What was your role? What was the outcome?"
    },
    {
      "original": "Managed a team",
      "improved": "Led and mentored a cross-functional team of 8 engineers, delivering 12 features ahead of schedule and improving team velocity by 35%",
      "severity": "red",
      "category": "drive",
      "explanation": "CRITICAL: 'Managed' alone means nothing. How many people? What did you achieve? A manager who shipped nothing is not impressive."
    }
  ],
  "overallScore": 52,
  "severityBreakdown": {
    "red": 15,
    "yellow": 8,
    "green": 2
  },
  "categoryBreakdown": {
    "quantify_impact": 10,
    "communication": 4,
    "length_depth": 3,
    "drive": 3,
    "analytical": 2,
    "general": 3
  }
}

SEVERITY LEVELS:
- RED (Critical): Immediate fixes needed — these hurt your candidacy severely (vague achievements, weak verbs, no metrics, generic phrases)
- YELLOW (Important): Should fix before applying — missed opportunities to stand out
- GREEN (Minor): Good content with small tweaks possible

CATEGORIES:
- quantify_impact: Add specific numbers, percentages, dollar amounts, user counts, timeframes
- communication: Replace weak verbs with powerful action verbs, clarify unclear descriptions
- length_depth: Expand thin bullets with context, condense verbose sections
- drive: Show initiative, leadership, ownership, going above and beyond
- analytical: Demonstrate problem-solving, data-driven decisions, strategic thinking
- general: Formatting, keyword optimization, removing clichés and buzzwords

Find 20-30 specific issues. Be BRUTALLY honest. This candidate needs real feedback, not validation. Scan EVERY bullet point — if it lacks a metric, flag it. A hiring manager at ${jobTitle} positions spends 6 seconds on a resume — every weak phrase is a reason to reject.`;

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
