import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressService } from "@/lib/progress";

// Ensure GOOGLE_AI_KEY is set in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const textPromptPart = {
            text: `You are an expert resume reviewer specifically focused on the "${jobTitle}" role${company ? ` at "${company}"` : ""}. Analyze the provided resume (which is attached as a file) with particular attention to industry-specific standards, required skills, and experiences most valued for this exact position.
${jobDescription ? `\nConsider the following job description for your role-specific analysis:\n---\n${jobDescription}\n---\n` : ""}

Please provide a detailed, structured resume analysis focused on this specific role. Format your response as clean, readable text without any markdown symbols, hashtags, or special formatting. Use the following structure:

RESUME ANALYSIS REPORT FOR ${jobTitle.toUpperCase()} POSITION

OVERALL ASSESSMENT
Provide a role-specific evaluation of the resume's suitability, using a rating out of 100 (e.g., "Overall Score: 85/100 - This resume demonstrates strong technical skills for the ${jobTitle} position but needs more emphasis on domain expertise."). Ensure the score is explicitly mentioned as "Overall Score: XX/100" so it can be parsed.

Additionally, provide these specific category scores:
Impact Score: XX/100 (measuring quantifiable achievements, results, and career progression)
Style Score: XX/100 (measuring formatting, readability, and professional presentation)
Skills Score: XX/100 (measuring technical competencies and relevant qualifications for this role)

ROLE-SPECIFIC STRENGTHS
List achievements, skills, and experiences that align specifically with the ${jobTitle} position requirements. Focus on industry-relevant accomplishments and quantifiable results that matter for this role. Highlight technical skills, domain knowledge, or certifications particularly valuable for this position. Present each point as a complete sentence without bullet points or dashes.

AREAS FOR IMPROVEMENT
List aspects that need enhancement to better align with ${jobTitle} position expectations. Provide actionable advice tailored to this specific role and industry. Present each point as a complete sentence without bullet points or dashes.

INDUSTRY-SPECIFIC RECOMMENDATIONS
Suggest precise additions of keywords, experiences, or accomplishments typical for successful candidates in this exact role. Recommend role-specific wording changes or enhancements based on industry standards. Present each point as a complete sentence without bullet points or dashes.

ATS OPTIMIZATION SUGGESTIONS
List suggestions to improve Applicant Tracking System (ATS) compatibility specifically for ${jobTitle} positions. Include advice on industry-specific keywords and formatting practices for this role. Present each point as a complete sentence without bullet points or dashes.

FORMAT AND PRESENTATION FEEDBACK
Provide feedback on formatting with special attention to what hiring managers for ${jobTitle} positions typically expect. Suggest improvements aligned with industry standards for this specific role. Present each point as a complete sentence without bullet points or dashes.

Important: Use only plain text without any markdown formatting, asterisks, hashtags, bullet points, or special characters. Write in complete sentences and paragraphs for better readability.`
        };

        const generationConfig = {
            temperature: 0.6, // Slightly more creative but still grounded
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096, // Increased for potentially longer, detailed analysis
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
            console.log("No content in Gemini response or response.text() is undefined.");
            const errorResponse = { error: "Failed to generate resume analysis. No content received from AI." };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 500 });
        }

        const analysisText = response.candidates[0].content.parts.map(part => part.text).join("");
        
        if (!analysisText) {
            console.log("Empty analysis text from Gemini.");
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
        const stats = generateResumeStats(file, analysisText, jobDescription);        const successResponse = {
            analysis: analysisText, 
            score: structuredAnalysis.overallScore,
            impactScore: structuredAnalysis.impactScore,
            styleScore: structuredAnalysis.styleScore,
            skillsScore: structuredAnalysis.skillsScore,
            strengths: structuredAnalysis.strengths,
            areasForImprovement: structuredAnalysis.improvements,
            formattedAnalysis,
            stats,
            structuredData: structuredAnalysis
        };
        
        // Track progress for resume analysis completion
        try {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true }
          });
          
          if (user) {
            // Check for recent duplicate analyses (within 30 seconds) to prevent duplicates
            const recentAnalysis = await prisma.resumeAnalysis.findFirst({
              where: {
                userId: user.id,
                createdAt: {
                  gte: new Date(Date.now() - 30000) // 30 seconds ago
                }
              },
              orderBy: { createdAt: 'desc' }
            });
            
            if (!recentAnalysis) {
              await ProgressService.updateResumeProgress(user.id, {
                score: structuredAnalysis.overallScore || 0,
                improvementCount: structuredAnalysis.improvements?.length || 0,
                wordCount: 1000, // Could extract actual word count if needed
                analysis: structuredAnalysis,
                categories: {
                  impact: structuredAnalysis.impactScore || 0,
                  style: structuredAnalysis.styleScore || 0,
                  skills: structuredAnalysis.skillsScore || 0
                }
              });
              console.log('🎯 Progress tracked for resume analysis');
            } else {
              console.log('⚠️ Duplicate resume analysis prevented');
            }
          }
        } catch (progressError) {
          console.error('Error tracking progress:', progressError);
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

        // Check if the error is from Gemini API (e.g., blocked content)
        // This is a generic check; specific Gemini error types might need more detailed handling
        // @ts-ignore
        if (error.message && error.message.includes("SAFETY")) {
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