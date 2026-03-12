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

    // Extract text from PDF using pdf-parse, or use base64 for images
    let resumeText = '';
    const isImage = file.type.includes('image');
    const isPdf = file.type.includes('pdf');

    if (isPdf) {
      try {
        const pdfParse = require('pdf-parse/lib/pdf-parse.js');
        const pdfData = await pdfParse(buffer);
        resumeText = pdfData.text;
        console.log("PDF text extracted:", resumeText.length, "characters");
      } catch (pdfErr) {
        console.error("PDF parse failed, falling back to base64:", pdfErr);
        // Fall through — will send as base64 image
      }
    }

    const base64File = buffer.toString('base64');
    console.log("File processed. Text length:", resumeText.length, "| Base64 size:", Math.round(base64File.length / 1024), "KB");

    const textPrompt = `You are a senior resume reviewer with experience screening resumes for top tech companies. You are reviewing this resume for the "${jobTitle}" role${company ? ` at "${company}"` : ""}.

Your job is to give honest, blunt, accurate feedback. The user needs a real score — not encouragement.

SCORING GUIDE — be strict:
- 90-100: Exceptional. Every bullet quantified, compelling narrative, perfect role alignment. Top 1%.
- 80-89: Strong. Most bullets quantified, strong verbs, clear impact throughout.
- 70-79: Decent. Some bullets have metrics but at least half are vague duty-lists.
- 60-69: Weak. Most bullets are generic with no measurable outcomes.
- 50-59: Very weak. Almost no quantification, vague throughout.
- Below 50: Needs a full rewrite. Would be auto-rejected.

IMPORTANT: Most real-world resumes score 55-70. Bullets like "helped with X", "responsible for Y", "worked on Z" are red flags pulling toward 50-65. Do not default to 70. Be accurate.

RED FLAGS — actively look for these and flag them as "red" severity:
- High school activities, clubs, honors, or awards listed anywhere on the resume (massive red flag for college/post-grad candidates — should be removed entirely)
- GPA below 3.5 listed (suggest omitting it)
- Objective/summary statements that are generic filler
- Bullets starting with "Responsible for", "Helped with", "Worked on", "Assisted with" — zero-impact phrasing
- Same weak verb used to start 3+ bullets in a row
- No GitHub link or project portfolio for a CS/SWE role
- Projects that are only coursework with no real link, deployment, or measurable outcome
- Skills section listing irrelevant tools (Microsoft Word, PowerPoint, Google Docs for a SWE role)
- Resume over 1 page for a student or new grad with under 3 years of experience
- Missing Git, testing frameworks, or cloud platforms for a CS/engineering role
- First-person pronouns used ("I built", "My project", "I worked on")
- Unprofessional email address

${jobDescription ? `\nJob Description Context:\n${jobDescription}\n` : ""}

ANALYSIS RULES:
1. CRITICAL — "original" must be the EXACT verbatim text copied character-for-character from the resume. Do NOT paraphrase, summarize, or rewrite it. It must match what is literally written on the resume so it can be highlighted. If a bullet says "Created lesson plans for elementary students", write exactly "Created lesson plans for elementary students".
2. For each improvement, explain WHY it matters specifically for the "${jobTitle}" role, not in generic terms.
3. The "improved" version must be a realistic rewrite the candidate could actually use — not an exaggerated fantasy with made-up numbers.
4. Assign severity accurately:
   - "red": The bullet has NO measurable outcome AND uses a weak/vague verb. Or a red flag item (high school, irrelevant skills, etc.).
   - "yellow": The bullet has SOME specificity but is missing a key element (metric, context, or impact).
   - "green": The bullet is solid and only has a minor enhancement opportunity.
5. Assign each item exactly ONE category from: "quantify_impact", "communication", "length_depth", "drive", "analytical", "general".
6. Find 8-15 specific improvements — focus on the highest-impact ones.

Return ONLY this JSON (no markdown, no extra text):

{
  "wordImprovements": [
    {
      "original": "Exact text copied from the resume",
      "improved": "Realistic rewritten version with actual metrics",
      "severity": "red | yellow | green",
      "category": "quantify_impact | communication | length_depth | drive | analytical | general",
      "explanation": "Specific explanation tied to the target role"
    }
  ],
  "overallScore": 62,
  "severityBreakdown": {
    "red": 4,
    "yellow": 7,
    "green": 2
  },
  "categoryBreakdown": {
    "quantify_impact": 5,
    "communication": 3,
    "length_depth": 1,
    "drive": 2,
    "analytical": 1,
    "general": 1
  }
}`;

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (isImage) {
      // For images, send as image_url so the model can read it visually
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
    } else if (resumeText) {
      // For PDFs (and any file where we extracted text), send as plain text
      messages.push({
        role: 'user',
        content: `${textPrompt}\n\n--- RESUME TEXT ---\n${resumeText}\n--- END RESUME TEXT ---`
      });
    } else {
      // Fallback for DOCX/DOC and other text-based documents
      messages.push({
        role: 'user',
        content: `${textPrompt}\n\n[Document file: ${file.name}, type: ${file.type}. Analyze the resume content embedded in this document.]`
      });
    }

    console.log("Sending request to OpenAI API for word analysis...");
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
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
    console.log("Raw OpenAI response preview:", analysisText.substring(0, 200) + "...");

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

      console.log("Final parsed analysis:", {
        wordImprovements: parsedAnalysis.wordImprovements.length,
        severityBreakdown: parsedAnalysis.severityBreakdown,
        categoryBreakdown: parsedAnalysis.categoryBreakdown
      });

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
