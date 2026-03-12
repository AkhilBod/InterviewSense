import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { convertToHighlights } from "@/lib/highlight-converter";
import { logActivity } from "@/lib/activity-logger";

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

        console.log("Converting file to buffer...");
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = buffer.toString('base64');

        // Extract text from PDF using pdf-parse for higher accuracy & lower token usage
        let pdfText: string | null = null;
        if (file.type === 'application/pdf') {
          try {
            // Use require() to avoid pdf-parse triggering its test suite on dynamic import
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const pdfParse = require('pdf-parse/lib/pdf-parse.js');
            const pdfData = await pdfParse(buffer);
            if (pdfData.text && pdfData.text.trim().length > 50) {
              pdfText = pdfData.text;
              console.log(`PDF text extracted: ${pdfData.text.length} characters`);
            }
          } catch (pdfErr) {
            console.warn("pdf-parse extraction failed, falling back to vision:", pdfErr);
          }
        }

        const textPrompt = `You are a senior hiring manager and resume expert who has reviewed thousands of resumes for the "${jobTitle}" role${company ? ` at "${company}"` : ""}. Your job is to give honest, blunt, accurate feedback. The user needs a real score — not encouragement.
${jobDescription ? `\nJob description to evaluate against:\n---\n${jobDescription}\n---\n` : ""}

SCORING CALIBRATION — be strict:
- 90-100: Exceptional. Every bullet quantified, compelling narrative, perfect role alignment. Top 1% of candidates.
- 80-89: Strong. Most bullets quantified, clear impact, strong action verbs throughout.
- 70-79: Decent. Some bullets have metrics, but at least half are vague, lack outcomes, or use weak verbs.
- 60-69: Weak. Most bullets are duty-lists with no measurable outcomes. Generic phrasing dominates.
- 50-59: Very weak. Almost no quantification, vague throughout, poor formatting.
- Below 50: Needs a full rewrite. Would be auto-rejected.

IMPORTANT: Most real-world resumes score 55-70. Only award 75+ if the majority of bullets are genuinely quantified with real numbers. If you see bullets like "helped with X", "responsible for Y", "worked on Z" — these are red flags that should pull the score toward 50-65. Do not default to 70. Be accurate.

RED FLAGS — actively look for and call these out in your feedback:
- High school activities, clubs, awards, or GPA listed on a college student/grad resume (immediate red flag — remove everything pre-college)
- GPA listed when it's below 3.5 (should be omitted)
- Objective statements or summaries that are generic (e.g., "Seeking a challenging position...")
- Job titles listed without any bullets or description
- Responsibilities written as job duties ("Responsible for...", "Duties included...") with zero outcomes
- Bullets starting with the same weak verb repeated multiple times (e.g., 5 bullets all starting with "Worked on")
- No GitHub link, portfolio, or project links for a CS/engineering role
- Projects section missing or only listing academic assignments with no deployed link or measurable outcome
- Skills section listing irrelevant tools (e.g., Microsoft Word, Google Docs for a SWE role)
- Resume longer than 1 page for a student/new grad with under 3 years experience
- Missing core CS skills expected for the role (e.g., no Git, no testing frameworks, no cloud platforms)
- Education section missing expected info (graduation date, GPA if strong, relevant coursework)
- Dates missing or inconsistent (gaps unexplained, or future graduation date formatted incorrectly)
- Email addresses that are unprofessional (e.g., coolkid123@gmail.com)
- Using first-person pronouns ("I built", "My project")

Please analyze the resume below and respond using ONLY this exact structure, with plain text and no markdown:

RESUME ANALYSIS REPORT FOR ${jobTitle.toUpperCase()} POSITION

OVERALL ASSESSMENT
Give an honest, direct evaluation. Start with: "Overall Score: XX/100 - " then explain why, calling out specific areas of strength and weakness.

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
        } else if (file.type.includes('pdf') && pdfText) {
            // PDFs with extracted text — send as plain text (much cheaper, more accurate)
            messages.push({
                role: 'user',
                content: `${textPrompt}\n\n--- RESUME TEXT ---\n${pdfText}\n--- END RESUME TEXT ---`
            });
        } else if (file.type.includes('pdf')) {
            // PDFs where text extraction failed — fallback to base64 file input
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
            model: 'gpt-4.1',
            messages,
            temperature: 0.3,
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
        console.log("=== RAW AI RESPONSE (first 800 chars) ===");
        console.log(analysisText.slice(0, 800));
        console.log("=========================================");
        
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

        const successResponse = {
            analysis: analysisText, 
            score: structuredAnalysis.overallScore ?? 0,
            impactScore: structuredAnalysis.impactScore ?? structuredAnalysis.overallScore ?? 0,
            styleScore: structuredAnalysis.styleScore ?? structuredAnalysis.overallScore ?? 0,
            skillsScore: structuredAnalysis.skillsScore ?? structuredAnalysis.overallScore ?? 0,
            strengths: structuredAnalysis.strengths,
            areasForImprovement: structuredAnalysis.improvements,
            formattedAnalysis,
            stats,
            structuredData: structuredAnalysis,
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

            // Log activity for dashboard
            logActivity(user.id, {
              activityType: 'resume',
              score: structuredAnalysis.overallScore || 0,
              metadata: { jobTitle, company },
            });
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

    // Strip ALL markdown formatting variants the model might use
    const cleanedText = analysisText
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s*/g, '')
        .replace(/_/g, '');

    // Helper: extract first integer from a line matching a label
    const extractScore = (label: string): number | null => {
        // Matches things like:
        //   "Overall Score: 72/100"
        //   "Overall Score: 72 / 100 - ..."
        //   "Overall Score: 72 out of 100"
        //   "Overall Score (72/100)"
        //   "72/100" anywhere after the label
        const re = new RegExp(
            label + '[^\\d]{0,20}(\\d{1,3})\\s*(?:\\/|out of)\\s*100',
            'i'
        );
        const m = cleanedText.match(re);
        if (m) return parseInt(m[1], 10);

        // Fallback: label followed by standalone number on same line
        const re2 = new RegExp(label + '[^\\n]{0,40}?[:\\s(]+(\\d{1,3})(?:\\s*\\/\\s*100)?', 'i');
        const m2 = cleanedText.match(re2);
        if (m2) {
            const n = parseInt(m2[1], 10);
            if (n >= 0 && n <= 100) return n;
        }
        return null;
    };

    sections.overallScore = extractScore('Overall Score');
    sections.impactScore  = extractScore('Impact Score');
    sections.styleScore   = extractScore('Style Score');
    sections.skillsScore  = extractScore('Skills Score');

    console.log('Parsed scores:', {
        overall: sections.overallScore,
        impact: sections.impactScore,
        style: sections.styleScore,
        skills: sections.skillsScore,
    });

    // Parse strengths
    const strengthsRegex = /ROLE-SPECIFIC STRENGTHS\s*([\s\S]*?)(?=AREAS FOR IMPROVEMENT|$)/i;
    const strengthsMatch = cleanedText.match(strengthsRegex);
    if (strengthsMatch && strengthsMatch[1]) {
        sections.strengths = strengthsMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/i))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse improvements
    const improvementsRegex = /AREAS FOR IMPROVEMENT\s*([\s\S]*?)(?=INDUSTRY-SPECIFIC RECOMMENDATIONS|ATS OPTIMIZATION|FORMAT AND PRESENTATION|$)/i;
    const improvementsMatch = cleanedText.match(improvementsRegex);
    if (improvementsMatch && improvementsMatch[1]) {
        sections.improvements = improvementsMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/i))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse ATS optimization
    const atsRegex = /ATS OPTIMIZATION SUGGESTIONS\s*([\s\S]*?)(?=FORMAT AND PRESENTATION|INDUSTRY-SPECIFIC|$)/i;
    const atsMatch = cleanedText.match(atsRegex);
    if (atsMatch && atsMatch[1]) {
        sections.atsOptimization = atsMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/i))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse industry recommendations
    const industryRegex = /INDUSTRY-SPECIFIC RECOMMENDATIONS\s*([\s\S]*?)(?=ATS OPTIMIZATION|FORMAT AND PRESENTATION|$)/i;
    const industryMatch = cleanedText.match(industryRegex);
    if (industryMatch && industryMatch[1]) {
        sections.industryRecommendations = industryMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/i))
            .map(item => item.endsWith('.') ? item : item + '.');
    }

    // Parse format feedback (plain text format)
    const formatRegex = /FORMAT AND PRESENTATION FEEDBACK\s*([\s\S]*?)$/i;
    const formatMatch = cleanedText.match(formatRegex);
    if (formatMatch && formatMatch[1]) {
        sections.formatFeedback = formatMatch[1]
            .split(/\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 10 && !item.match(/^(ROLE-SPECIFIC|AREAS FOR|ATS OPTIMIZATION|INDUSTRY-SPECIFIC|FORMAT AND)/i))
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
async function generateWordAnalysis(file: File, jobTitle: string, company: string | null, jobDescription: string | null, _unused: any, base64File: string, pdfText?: string | null) {
    console.log("Generating word analysis...");

    const wordAnalysisPrompt = `You are a senior resume reviewer with experience screening resumes for top tech companies. You are reviewing this resume for the "${jobTitle}" role${company ? ` at "${company}"` : ""}.

Your job is to give honest, blunt, accurate feedback. The user needs a real score — not encouragement.

SCORING GUIDE — be strict:
- 90-100: Exceptional. Every bullet quantified, compelling narrative, perfect role alignment. Top 1%.
- 80-89: Strong. Most bullets quantified, strong verbs, clear impact throughout.
- 70-79: Decent. Some bullets have metrics but at least half are vague duty-lists.
- 60-69: Weak. Most bullets are generic with no measurable outcomes.
- 50-59: Very weak. Almost no quantification, vague throughout.
- Below 50: Needs a full rewrite. Would be auto-rejected.

IMPORTANT: Most real-world resumes score 55-70. Bullets like "helped with X", "responsible for Y", "worked on Z" are red flags pulling toward 50-65. Do not default to 70. Be accurate.

RED FLAGS — actively look for these and flag them as "red" severity in wordImprovements, and call them out in weaknesses:
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
   - "red": The bullet has NO measurable outcome AND uses a weak/vague verb (e.g., "helped", "worked on", "responsible for"). Or there is a formatting/grammar error.
   - "yellow": The bullet has SOME specificity but is missing a key element (metric, context, or impact). Or uses an acceptable verb that could be stronger.
   - "green": The bullet is solid and only has a minor enhancement opportunity.
5. Assign each item exactly ONE category from: "quantify_impact", "communication", "length_depth", "drive", "analytical", "general".
6. For strengths and weaknesses: reference SPECIFIC lines or sections of the resume. Do not say generic things like "good use of action verbs" — say exactly which bullets are strong and why.

DO NOT include severityBreakdown or categoryBreakdown in your response. Only return the wordImprovements array, overallScore, strengths, and weaknesses.

Return your analysis in this EXACT JSON format - no additional text, markdown, or formatting:

{
  "wordImprovements": [
    {
      "original": "Helped with database migration project",
      "improved": "Realistic rewritten version with actual metrics",
      "severity": "red | yellow | green",
      "category": "quantify_impact | communication | length_depth | drive | analytical | general",
      "explanation": "Specific explanation tied to the target role, referencing the exact text"
    }
  ],
  "overallScore": 72,
  "strengths": [
    "Your bullet about deploying the payment microservice is strong because it includes latency reduction (40%) and cost savings ($12K/mo), which directly maps to backend engineering impact metrics.",
    "The project management section clearly shows leadership with team size (8 engineers) and delivery timeline (2 weeks ahead of schedule)."
  ],
  "weaknesses": [
    "Your second work experience section has 4 bullets that all start with 'Responsible for...' — this passive phrasing hides your actual contributions. Rewrite with active verbs and outcomes.",
    "No mention of testing or CI/CD anywhere, which is a core requirement for this role."
  ]
}`;

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
    } else if (file.type.includes('pdf') && pdfText) {
        // PDFs with extracted text — send as plain text
        messages.push({
            role: 'user',
            content: `${wordAnalysisPrompt}\n\n--- RESUME TEXT ---\n${pdfText}\n--- END RESUME TEXT ---`
        });
    } else if (file.type.includes('pdf')) {
        // PDFs where text extraction failed — fallback to base64 file input
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
        model: 'gpt-4.1',
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

        // Compute severityBreakdown and categoryBreakdown from the actual array
        // Do NOT trust the AI's counts — compute them ourselves
        const severityBreakdown = { red: 0, yellow: 0, green: 0 };
        const categoryBreakdown: Record<string, number> = {};

        for (const item of parsedAnalysis.wordImprovements) {
          if (item.severity in severityBreakdown) {
            severityBreakdown[item.severity as keyof typeof severityBreakdown]++;
          }
          if (item.category) {
            categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
          }
        }

        parsedAnalysis.severityBreakdown = severityBreakdown;
        parsedAnalysis.categoryBreakdown = categoryBreakdown;

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