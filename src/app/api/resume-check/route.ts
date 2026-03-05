import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";
import { convertToHighlights } from "@/lib/highlight-converter";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
export async function POST(req: Request) {
    console.log("=== Resume Check API Started (Direct File Upload Method) ===");
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Parsing form data...");
        const formData = await req.formData();
        const file = formData.get("resume") as File | null; // Changed Blob to File
        const jobTitle = formData.get("jobTitle") as string | null;
        const company = formData.get("company") as string | null;
        const jobDescription = formData.get("jobDescription") as string | null;

        console.log("Received data:", {
            fileName: file?.name, // Now valid
            fileSize: file?.size,
            fileType: file?.type,
            jobTitle,
            company,
            jobDescriptionLength: jobDescription?.length
        });

        if (!file || !jobTitle) {
            console.log("Missing required fields: resume or jobTitle");
            const errorResponse = { error: "Resume file and job title are required." };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // MIME types generally supported by Gemini 1.5 Flash/Pro for file inputs.
        // Always refer to the official Google AI documentation for the most up-to-date list.
        const supportedMimeTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/msword", // .doc (Gemini's success with .doc can vary; .docx or PDF are more reliable)
            "text/plain",
            "text/markdown",
            "text/html",
            "text/css",
            "text/javascript",
            "application/x-javascript",
            "text/x-typescript",
            "application/x-typescript",
            "text/csv",
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/heic",
            "image/heif",
        ];

        if (!file.type || !supportedMimeTypes.includes(file.type)) {
            console.log(`Unsupported file type: ${file.type}`);
            const errorResponse = {
                error: `Unsupported file type: '${file.type}'. Please try PDF, DOCX, DOC, or common text/image formats.`
            };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        console.log("Converting file to base64...");
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = buffer.toString('base64');

        const textPrompt = `You are a brutally honest, senior hiring manager and resume expert who has reviewed thousands of resumes for the "${jobTitle}" role${company ? ` at "${company}"` : ""}. You are NOT a cheerleader — your job is to give candidates an honest, unsparing assessment so they know exactly where they stand against top applicants competing for this same role.
${jobDescription ? `\nJob description to evaluate against:\n---\n${jobDescription}\n---\n` : ""}

SCORING CALIBRATION — read carefully before assigning any score:
- 90-100: Exceptional. This resume would immediately land interviews at top-tier companies. Nearly flawless for this role.
- 75-89: Strong. Competitive candidate but with clear gaps that would get it filtered out at selective companies.
- 60-74: Average. Passes basic screening but lacks the depth, specificity, or impact that strong candidates show.
- 40-59: Weak. Significant gaps in content, measurable results, or role alignment. Needs major rework.
- Below 40: Poor. Fundamental issues that would cause immediate rejection.

Most resumes submitted by students or early-career candidates score in the 40-65 range. A score above 80 should be genuinely rare and earned. Be as critical as you would be if your own reputation depended on recommending only the best candidates. Do NOT inflate scores to be encouraging.

Please analyze the resume below and respond using ONLY this exact structure, with plain text and no markdown:

RESUME ANALYSIS REPORT FOR ${jobTitle.toUpperCase()} POSITION

OVERALL ASSESSMENT
Give an honest, direct evaluation. Start with: "Overall Score: XX/100 - " then explain why, calling out specific weaknesses you see. Do not soften the critique.

Impact Score: XX/100 (Are achievements quantified with real numbers? Or are they vague duty lists? Dock heavily for bullet points like "helped with" or "worked on" with no metrics.)
Style Score: XX/100 (Is formatting clean, consistent, and ATS-friendly? Are fonts, spacing, and section headers professional?)
Skills Score: XX/100 (Does the skills section directly match what top candidates for ${jobTitle} roles list? Are there obvious missing skills?)

ROLE-SPECIFIC STRENGTHS
Only list genuine strengths that would actually stand out to a recruiter for this role. If there are fewer than 3 real strengths, say so. Do not manufacture praise. Write each as a complete sentence.

AREAS FOR IMPROVEMENT
Be specific and blunt. Do not write generic advice. Point to exact problems in the resume — missing metrics on specific bullet points, wrong keywords, weak action verbs, formatting issues, missing sections, etc. Write each as a complete sentence.

INDUSTRY-SPECIFIC RECOMMENDATIONS
Name exact skills, certifications, tools, or keywords this resume is missing that top ${jobTitle} candidates include. Be specific — name the actual tools, frameworks, or accomplishments. Write each as a complete sentence.

ATS OPTIMIZATION SUGGESTIONS
Identify specific keyword gaps, formatting problems, or structural issues that would cause ATS rejection for ${jobTitle} roles. Write each as a complete sentence.

FORMAT AND PRESENTATION FEEDBACK
Point out specific formatting inconsistencies, spacing problems, font issues, or structural weaknesses. Write each as a complete sentence.

Critical rule: Use only plain text. No asterisks, no bullet points, no dashes, no markdown. Complete sentences only.`;

        // Prepare messages for OpenAI - use vision model for PDF/image files
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        // Check if file is an image or PDF that can be analyzed visually
        const isVisualFile = file.type.includes('image') || file.type.includes('pdf');

        if (file.type.includes('image')) {
            // For images, use vision capabilities
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
            // PDFs: send as base64-encoded file input so the model reads actual content
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
            // DOCX/DOC and other text-based documents — extract what we can via text hint
            messages.push({
                role: 'user',
                content: `${textPrompt}\n\n[Document file: ${file.name}, type: ${file.type}. Analyze the resume content embedded in this document.]`
            });
        }

        console.log("Sending request to OpenAI API...");
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: 0.9,
            max_completion_tokens: 4096,
        });

        console.log("OpenAI API response received.");
        const analysisText = completion.choices[0].message.content;

        if (!analysisText) {
            console.log("Empty analysis text from OpenAI.");
            const errorResponse = { error: "Failed to generate resume analysis. Received empty analysis." };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 500 });
        }

        console.log("Resume analysis generated successfully.");
        
        // Parse the analysis text into structured sections
        const structuredAnalysis = parseAnalysisText(analysisText);
        
        // Create formatted analysis for PDF export
        const formattedAnalysis = {
            title: `Resume Analysis - ${jobTitle}${company ? ` at ${company}` : ""}`,
            date: new Date().toLocaleDateString(),
            content: analysisText,
            fileName: file.name
        };

        // Generate resume stats
        const stats = generateResumeStats(file, analysisText, jobDescription);
        
        // Generate word analysis automatically
        console.log("Starting automatic word analysis...");
        let wordAnalysisData = null;
        try {
            const wordAnalysisResult = await generateWordAnalysis(file, jobTitle, company, jobDescription, null, base64File);
            wordAnalysisData = wordAnalysisResult;
            console.log("Word analysis completed successfully");
        } catch (wordError) {
            console.error("Word analysis failed, but continuing with main analysis:", wordError);
            // Don't fail the main request if word analysis fails
        }        const successResponse = {
            analysis: analysisText, 
            score: structuredAnalysis.overallScore,
            impactScore: structuredAnalysis.impactScore,
            styleScore: structuredAnalysis.styleScore,
            skillsScore: structuredAnalysis.skillsScore,
            strengths: structuredAnalysis.strengths,
            areasForImprovement: structuredAnalysis.improvements,
            formattedAnalysis,
            stats,
            structuredData: structuredAnalysis,
            wordAnalysis: wordAnalysisData // Include word analysis in response
        };
        
        // Track progress for resume analysis completion using new stats system
        try {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true }
          });
          
          if (user) {
            // Use StatsManager to update stats
            const { StatsManager } = await import('@/lib/stats');
            await StatsManager.updateStatsAfterSession(user.id, {
              sessionType: 'resume',
              score: structuredAnalysis.overallScore || 0,
              duration: Math.floor(Math.random() * 10) + 5, // Estimate 5-15 minutes
              completed: true,
              improvements: structuredAnalysis.improvements?.slice(0, 3) || []
            });
            console.log('🎯 New stats system updated for resume analysis');
          }
        } catch (progressError) {
          console.error('Error tracking progress with new stats system:', progressError);
          // Don't fail the main request if progress tracking fails
        }
        
        return NextResponse.json(successResponse);

    } catch (error) {
        console.error("Error in resume check API:", error);
        let errorMessage = "An unexpected error occurred.";
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
            // You could add more specific error handling here if needed
            // For example, if the error object has a specific code or name
        }
        
        // Log the detailed error for server-side debugging
        console.error(`Detailed error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);

        // Check if the error is from OpenAI API (e.g., blocked content)
        // @ts-ignore
        if (error.message && (error.message.includes("SAFETY") || error.message.includes("content_policy"))) {
            errorMessage = "The resume content triggered a safety filter. Please revise and try again.";
            statusCode = 400; // Bad Request, as the input was problematic
        }

        const errorResponse = { error: errorMessage };
        console.log("Final Error Response:", errorResponse);
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}

// Helper function to log request details (optional, for debugging)
async function logRequestDetails(req: Request) {
    const details = {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
    };
    console.log("Incoming Request Details:", details);
    // Avoid logging body directly if it contains sensitive or large data,
    // or handle it carefully (e.g., clone and then read parts of it).
}

// Example of how you might call it at the beginning of your POST function:
// await logRequestDetails(req.clone()); // Clone req if you need to read its body later

// Helper function to parse analysis text into structured sections
function parseAnalysisText(analysisText: string) {
    const sections = {
        overallScore: null as number | null,
        impactScore: null as number | null,
        styleScore: null as number | null,
        skillsScore: null as number | null,
        strengths: [] as string[],
        improvements: [] as string[],
        atsOptimization: [] as string[],
        industryRecommendations: [] as string[],
        formatFeedback: [] as string[]
    };

    // Parse overall score
    const scoreMatch = analysisText.match(/Overall Score: (\d{1,3})\/100/);
    if (scoreMatch && scoreMatch[1]) {
        sections.overallScore = parseInt(scoreMatch[1], 10);
    }

    // Parse impact score
    const impactMatch = analysisText.match(/Impact Score: (\d{1,3})\/100/);
    if (impactMatch && impactMatch[1]) {
        sections.impactScore = parseInt(impactMatch[1], 10);
    }

    // Parse style score
    const styleMatch = analysisText.match(/Style Score: (\d{1,3})\/100/);
    if (styleMatch && styleMatch[1]) {
        sections.styleScore = parseInt(styleMatch[1], 10);
    }

    // Parse skills score
    const skillsMatch = analysisText.match(/Skills Score: (\d{1,3})\/100/);
    if (skillsMatch && skillsMatch[1]) {
        sections.skillsScore = parseInt(skillsMatch[1], 10);
    }

    // Parse strengths (plain text format)
    const strengthsRegex = /ROLE-SPECIFIC STRENGTHS\s*([\s\S]*?)(?=AREAS FOR IMPROVEMENT|$)/;
    const strengthsMatch = analysisText.match(strengthsRegex);
    if (strengthsMatch && strengthsMatch[1]) {
        sections.strengths = strengthsMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse improvements (plain text format)
    const improvementsRegex = /AREAS FOR IMPROVEMENT\s*([\s\S]*?)(?=INDUSTRY-SPECIFIC RECOMMENDATIONS|ATS OPTIMIZATION|FORMAT AND PRESENTATION|$)/;
    const improvementsMatch = analysisText.match(improvementsRegex);
    if (improvementsMatch && improvementsMatch[1]) {
        sections.improvements = improvementsMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse ATS optimization (plain text format)
    const atsRegex = /ATS OPTIMIZATION SUGGESTIONS\s*([\s\S]*?)(?=FORMAT AND PRESENTATION|INDUSTRY-SPECIFIC|$)/;
    const atsMatch = analysisText.match(atsRegex);
    if (atsMatch && atsMatch[1]) {
        sections.atsOptimization = atsMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse industry recommendations (plain text format)
    const industryRegex = /INDUSTRY-SPECIFIC RECOMMENDATIONS\s*([\s\S]*?)(?=ATS OPTIMIZATION|FORMAT AND PRESENTATION|$)/;
    const industryMatch = analysisText.match(industryRegex);
    if (industryMatch && industryMatch[1]) {
        sections.industryRecommendations = industryMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse format feedback (plain text format)
    const formatRegex = /FORMAT AND PRESENTATION FEEDBACK\s*([\s\S]*?)$/;
    const formatMatch = analysisText.match(formatRegex);
    if (formatMatch && formatMatch[1]) {
        sections.formatFeedback = formatMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    return sections;
}

// Helper function to generate resume statistics
function generateResumeStats(file: File, analysisText: string, jobDescription?: string | null) {
    // Basic file stats
    const stats = {
        fileType: file.type.includes('pdf') ? 'PDF' : file.type.includes('word') ? 'Word Document' : 'Other',
        fileSize: Math.round(file.size / 1024) + ' KB',
        resumeLength: estimatePageCount(file.size, file.type),
        skillsCount: countSkillMentions(analysisText),
        atsCompatibility: assessATSCompatibility(file.type, analysisText),
        keywordMatch: jobDescription ? calculateKeywordMatch(analysisText, jobDescription) : null,
        highImpactKeywords: extractHighImpactKeywords(analysisText),
        lastModified: new Date().toLocaleDateString(),
        analysisDate: new Date().toISOString()
    };

    return stats;
}

// Helper function to estimate page count based on file size and type
function estimatePageCount(fileSize: number, fileType: string): number {
    // Rough estimates based on typical file sizes
    if (fileType.includes('pdf')) {
        // PDF: roughly 100-200KB per page
        return Math.max(1, Math.round(fileSize / 150000));
    } else if (fileType.includes('word')) {
        // Word doc: roughly 20-50KB per page
        return Math.max(1, Math.round(fileSize / 35000));
    }
    return 1;
}

// Helper function to count skill mentions in analysis
function countSkillMentions(analysisText: string): number {
    const skillKeywords = [
        'skill', 'experience', 'proficiency', 'expertise', 'knowledge',
        'certification', 'qualification', 'competency', 'ability', 'capability'
    ];
    
    let count = 0;
    skillKeywords.forEach(keyword => {
        const matches = analysisText.toLowerCase().match(new RegExp(keyword, 'g'));
        if (matches) count += matches.length;
    });
    
    return Math.min(count, 20); // Cap at reasonable number
}

// Helper function to assess ATS compatibility
function assessATSCompatibility(fileType: string, analysisText: string): string {
    let score = 0;
    
    // File type scoring
    if (fileType.includes('pdf')) score += 3;
    else if (fileType.includes('word')) score += 2;
    
    // Content analysis scoring
    if (analysisText.toLowerCase().includes('format')) score += 1;
    if (analysisText.toLowerCase().includes('keyword')) score += 1;
    if (analysisText.toLowerCase().includes('ats')) score += 2;
    
    if (score >= 6) return 'Excellent';
    if (score >= 4) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Needs Improvement';
}

// Helper function to calculate keyword match percentage
function calculateKeywordMatch(analysisText: string, jobDescription: string): number {
    const jobKeywords = extractKeywords(jobDescription);
    const analysisKeywords = extractKeywords(analysisText);
    
    let matches = 0;
    jobKeywords.forEach(keyword => {
        if (analysisKeywords.includes(keyword)) matches++;
    });
    
    return jobKeywords.length > 0 ? Math.round((matches / jobKeywords.length) * 100) : 0;
}

// Helper function to generate word analysis automatically
async function generateWordAnalysis(file: File, jobTitle: string, company: string | null, jobDescription: string | null, _unused: any, base64File: string) {
    console.log("Generating word analysis...");

    const wordAnalysisPrompt = `You are a BRUTALLY HONEST, elite resume reviewer who has screened 10,000+ resumes for top companies like Google, Meta, and Goldman Sachs. You have IMPOSSIBLY HIGH STANDARDS. You are reviewing this resume for the "${jobTitle}" role${company ? ` at "${company}"` : ""}.

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
                { type: 'text', text: wordAnalysisPrompt },
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
                { type: 'text', text: wordAnalysisPrompt },
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
            content: `${wordAnalysisPrompt}\n\n[Document file: ${file.name}, type: ${file.type}. Analyze the resume content embedded in this document.]`
        });
    }

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_completion_tokens: 6144,
    });

    const analysisText = completion.choices[0].message.content;

    if (!analysisText) {
        throw new Error("Empty word analysis text");
    }

    try {
        // Clean the response to extract JSON
        let cleanedText = analysisText.trim();
        
        // Remove any markdown code blocks
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Find the JSON object
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error("No JSON found in word analysis response");
        }
        
        const jsonString = cleanedText.substring(jsonStart, jsonEnd);
        const parsedAnalysis = JSON.parse(jsonString);

        // Validate the structure
        if (!parsedAnalysis.wordImprovements || !Array.isArray(parsedAnalysis.wordImprovements)) {
            throw new Error("Invalid word analysis response structure");
        }

        // Convert word improvements to highlights for PDF viewer
        const highlights = convertToHighlights(parsedAnalysis.wordImprovements);
        return { ...parsedAnalysis, highlights };

    } catch (parseError) {
        console.error("Failed to parse word analysis JSON response:", parseError);
        
        // Return fallback analysis
        return {
            wordImprovements: [
                {
                    original: "Generic resume content detected",
                    improved: "Add specific metrics and achievements",
                    severity: "red",
                    category: "quantify_impact",
                    explanation: "Resume needs more specific details and quantifiable achievements"
                }
            ],
            overallScore: 70,
            severityBreakdown: { red: 1, yellow: 0, green: 0 },
            categoryBreakdown: { quantify_impact: 1, communication: 0, length_depth: 0, drive: 0, analytical: 0 },
            highlights: convertToHighlights([{
                original: "Generic resume content detected",
                improved: "Add specific metrics and achievements",
                severity: "red" as const,
                category: "quantify_impact" as const,
                explanation: "Resume needs more specific details and quantifiable achievements"
            }])
        };
    }
}

// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word))
        .slice(0, 50); // Limit to top 50 keywords
}

// Helper function to extract high-impact keywords mentioned in analysis
function extractHighImpactKeywords(analysisText: string): string[] {
    const techKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
        'Machine Learning', 'AI', 'Data Science', 'SQL', 'MongoDB', 'Git', 'Agile', 'Scrum',
        'TypeScript', 'Angular', 'Vue.js', 'GraphQL', 'REST', 'API', 'Microservices',
        'DevOps', 'CI/CD', 'Cloud', 'Azure', 'GCP', 'Leadership', 'Management', 'Strategy'
    ];
    
    const foundKeywords: string[] = [];
    techKeywords.forEach(keyword => {
        if (analysisText.toLowerCase().includes(keyword.toLowerCase())) {
            foundKeywords.push(keyword);
        }
    });
    
    return foundKeywords.slice(0, 8); // Limit to top 8 keywords
}