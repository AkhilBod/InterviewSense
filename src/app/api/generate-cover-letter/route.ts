import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Ensure GEMINI_API_KEY is set in your environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey || "");

const SUPPORTED_RESUME_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
];

export async function POST(req: Request) {
    console.log("=== Cover Letter Generation API Started ===");
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Parsing form data...");
        const formData = await req.formData();

        const jobDescription = formData.get("jobDescription") as string | null;
        const companyName = formData.get("companyName") as string | null;
        const resumeFile = formData.get("resume") as File | null;

        console.log("Received data:", {
            jobDescriptionLength: jobDescription?.length,
            companyName: companyName,
            resumeFileName: resumeFile?.name,
            resumeFileSize: resumeFile?.size,
            resumeFileType: resumeFile?.type,
        });

        if (!jobDescription || !companyName || !resumeFile) {
            const missingFields = [
                !jobDescription && "Job Description",
                !companyName && "Company Name",
                !resumeFile && "Resume",
            ].filter(Boolean).join(", ");

            console.log(`Missing required fields: ${missingFields}`);
            const errorResponse = { error: `Missing required fields: ${missingFields}.` };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        if (!resumeFile.type || !SUPPORTED_RESUME_MIME_TYPES.includes(resumeFile.type)) {
            console.log(`Unsupported resume file type: ${resumeFile.type}`);
            const errorResponse = {
                error: `Unsupported resume file type: '${resumeFile.type}'. Please upload PDF, DOCX, DOC, or TXT.`,
            };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        console.log("Converting resume file to base64...");
        const bytes = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const resumeBase64 = buffer.toString('base64');
        const resumeMimeType = resumeFile.type;
        console.log(`Resume file '${resumeFile.name}' processed.`);

        const currentDate = new Date().toLocaleDateString();

        const promptText = `You are an expert cover letter writer with extensive experience in helping candidates land interviews at top companies. You understand what hiring managers want to see and how to make candidates stand out in competitive job markets.

**ANALYSIS APPROACH:**
1. **Deep Resume Analysis** - Extract specific achievements, skills, metrics, and unique value propositions
2. **Job Requirements Mapping** - Identify key requirements and map candidate's experience to each one
3. **Strategic Alignment** - Create compelling connections between candidate background and role needs
4. **Industry Contextualization** - Use appropriate terminology and demonstrate industry knowledge

**PERSONALIZATION REQUIREMENTS:**
- Use specific metrics, numbers, and quantifiable achievements from the resume
- Reference particular technologies, tools, and methodologies mentioned
- Incorporate industry-specific terminology that shows expertise
- Address 3-4 specific job requirements with concrete examples from candidate's background
- Demonstrate understanding of company challenges and how candidate can solve them
- Show cultural fit through soft skills and work style alignment

**CONTENT STRUCTURE:**
1. **Opening Hook** - Immediate value proposition specific to the role
2. **Value Proposition** (2-3 specific examples with metrics/results)
3. **Technical/Skills Alignment** - Direct mapping to job requirements
4. **Cultural/Soft Skills Fit** - Leadership, collaboration, problem-solving examples
5. **Forward-Looking Close** - Vision for contribution and growth

**HIRING MANAGER FOCUS:**
Write for busy hiring managers who need to see:
- Immediate evidence of relevant experience and results
- Problem-solving ability with concrete demonstrations
- Understanding of role challenges and how to address them
- Cultural fit indicators and team collaboration skills
- Results-driven mindset with quantifiable achievements
- Growth potential and learning agility

**TASK:** Create a complete, professional cover letter by extracting information from the resume and job description.

**STEP 1: EXTRACT INFORMATION**
From the RESUME, extract:
- Candidate's full name
- Email address 
- Phone number
- Address (if available)
- Key skills and experiences with specific technologies/tools
- Notable achievements with quantified results and metrics
- Educational background and certifications
- Professional background/industry expertise
- Leadership and collaboration examples
- Problem-solving and innovation instances

From the JOB DESCRIPTION, extract:
- Job title
- Company name
- Key requirements and qualifications (prioritize top 3-4)
- Specific skills, technologies, and tools mentioned
- Company values, culture, and mission (if mentioned)
- Hiring manager name (if mentioned)
- Company challenges or goals (if mentioned)
- Growth opportunities and career progression

**STEP 2: CREATE COVER LETTER**
Using the extracted information, create a professional cover letter that:

1. **Uses proper business letter format:**
   - Candidate contact information at top
   - Date (use "${currentDate}")
   - Professional salutation (use "Dear Hiring Manager" if specific name not found)
   - 3-4 body paragraphs
   - Professional closing and signature

2. **Contains compelling content:**
   - Opening: Express genuine interest in the specific role
   - Body: Highlight 2-3 most relevant experiences/achievements from resume
   - Include specific examples with quantified results when possible
   - Show alignment between candidate's background and job requirements
   - Demonstrate knowledge of the company (when available in job description)
   - Closing: Express enthusiasm and suggest next steps

3. **Writing style:**
   - Professional yet personable tone
   - Confident but not arrogant
   - Specific rather than generic
   - Action-oriented language
   - Error-free grammar and spelling

**FORMATTING REQUIREMENTS:**
- Use double line breaks (\\n\\n) between sections
- Keep paragraphs concise (3-4 sentences each)
- Total length: 300-400 words for body content
- Use standard business letter spacing

**IMPORTANT INSTRUCTIONS:** 
- Extract ALL information from the provided documents - do not ask for additional input
- Do NOT include company address or hiring manager address sections in the letter
- Do NOT use placeholders like [Company Name], [Hiring Manager Name], [Company Address] anywhere in the letter
- Use the provided company name "${companyName}" throughout the letter to personalize it
- Use "Dear Hiring Manager" as the salutation if no specific name is provided
- If specific information is not available in the resume, use the candidate's information where available or omit sections gracefully
- Create a complete, compelling narrative using the candidate's actual experiences
- Make the letter specific to both the candidate's background AND the job requirements
- Write the complete cover letter with all actual content - no placeholders anywhere
- Use the actual extracted names, companies, and details throughout the letter
- Show specific knowledge and enthusiasm about ${companyName} based on the job description

**COMPANY NAME:** ${companyName}

**JOB DESCRIPTION:**
${jobDescription}

**RESUME ANALYSIS:**
Please read the attached resume file carefully and extract all relevant information to create a personalized cover letter.

Now analyze the attached resume file and the job description above to create a professional cover letter for ${companyName} using the extracted information.`;

        const modelParts: Part[] = [{ text: promptText }];

        if (resumeBase64 && resumeMimeType) {
            modelParts.unshift({ // Add resume at the beginning if it exists
                inlineData: {
                    mimeType: resumeMimeType,
                    data: resumeBase64,
                },
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const generationConfig = {
            temperature: 0.75, // A bit of creativity but not too wild
            topK: 30,
            topP: 0.95,
            maxOutputTokens: 2048, // Standard for cover letters
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        console.log("Sending request to Gemini API with new prompt strategy...");

        const result = await model.generateContent({
            contents: [{ role: "user", parts: modelParts }],
            generationConfig,
            safetySettings
        });

        const geminiResponse = result.response;
        const generatedRawText = geminiResponse?.text() ?? null;

        if (!generatedRawText) {
            console.log("No response text from Gemini. Prompt Feedback:", geminiResponse?.promptFeedback);
            let noResponseErrorMessage = "Failed to generate cover letter. The AI did not return any text.";
            if (geminiResponse?.promptFeedback?.blockReason) {
                noResponseErrorMessage += ` Reason: ${geminiResponse.promptFeedback.blockReason}`;
            } else {
                noResponseErrorMessage += " This could be due to content restrictions or internal processing issues.";
            }
            const noResponseError = { error: noResponseErrorMessage };
            console.log("Error Response:", noResponseError);
            return NextResponse.json(noResponseError, { status: 500 });
        }

        console.log("Received raw text from Gemini, length:", generatedRawText.length);

        // Return the generated cover letter directly since it's already complete
        console.log("=== Cover Letter Generation API Completed Successfully ===");
        return NextResponse.json({ coverLetter: generatedRawText.trim() });

    } catch (error: any) {
        console.error("=== Cover Letter Generation API Error ===");
        console.error("Error details:", error);
        let errorMessage = `Failed to generate cover letter. Please try again.`;

        if (error.message) {
            errorMessage += ` Server Error: ${error.message}`;
        }

        // Check for specific Gemini API error structures
        if (error.response && error.response.promptFeedback) { // Error from model.generateContent()
            console.error("Gemini Prompt Feedback:", error.response.promptFeedback);
            const blockReason = error.response.promptFeedback.blockReason;
            const safetyRatings = error.response.promptFeedback.safetyRatings;
            errorMessage += ` (AI processing issue: ${blockReason || 'Unknown reason'}. Safety Ratings: ${JSON.stringify(safetyRatings)})`;
        } else if (error.status && error.details) { // Error from other GoogleGenerativeAI errors
            console.error("Gemini API Error Status:", error.status, "Details:", error.details);
            errorMessage += ` (AI API Error: ${error.details})`;
        } else if (error.message && error.message.toLowerCase().includes("fetch")) {
            errorMessage += " (A network issue or AI service unavailability may have occurred)";
        } else if (error.message && error.message.toLowerCase().includes("api key not valid")) {
            errorMessage = "Failed to generate cover letter: Invalid API Key. Please check server configuration.";
        }

        const errorResponse = { error: errorMessage };
        console.log("Error Response:", errorResponse);
        return NextResponse.json(errorResponse, { status: 500 });
    }
}