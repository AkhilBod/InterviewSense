import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deductCredits, hasEnoughCredits } from "@/lib/credits";
import { FeatureType } from "@prisma/client";

// Ensure OPENAI_API_KEY is set in your environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("OPENAI_API_KEY is not set in environment variables.");
}
const openai = new OpenAI({ apiKey: apiKey || "" });

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

        // Get user ID
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has enough credits
        const creditCheck = await hasEnoughCredits(user.id, FeatureType.COVER_LETTER);
        if (!creditCheck.hasCredits) {
            return NextResponse.json({
                error: "Insufficient credits",
                message: `You need ${creditCheck.required} credits but only have ${creditCheck.available} remaining today. Upgrade your plan for more credits.`,
                creditsAvailable: creditCheck.available,
                creditsRequired: creditCheck.required,
            }, { status: 402 });
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

        // Prepare messages for OpenAI
        // gpt-4o supports both images AND PDFs (up to 100 pages, 32MB)
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        // gpt-4o can handle images, PDFs, and documents via base64
        messages.push({
            role: 'user',
            content: [
                { type: 'text', text: promptText },
                {
                    type: 'image_url',
                    image_url: {
                        url: `data:${resumeMimeType};base64,${resumeBase64}`
                    }
                }
            ]
        });

        console.log("Sending request to OpenAI API with file upload...");

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Supports PDFs + images
            messages,
            temperature: 0.75,
            max_tokens: 2048,
        });

        const generatedRawText = completion.choices[0].message.content;

        if (!generatedRawText) {
            console.log("No response text from OpenAI.");
            let noResponseErrorMessage = "Failed to generate cover letter. The AI did not return any text.";
            noResponseErrorMessage += " This could be due to content restrictions or internal processing issues.";
            const noResponseError = { error: noResponseErrorMessage };
            console.log("Error Response:", noResponseError);
            return NextResponse.json(noResponseError, { status: 500 });
        }

        console.log("Received raw text from OpenAI, length:", generatedRawText.length);

        // Deduct credits after successful generation
        const deduction = await deductCredits(
            user.id,
            FeatureType.COVER_LETTER,
            1,
            {
                companyName,
                jobDescriptionLength: jobDescription.length,
                resumeFileName: resumeFile.name,
            }
        );

        if (!deduction.success) {
            console.error("Failed to deduct credits:", deduction.error);
            // Still return the cover letter but log the error
        }

        // Return the generated cover letter directly since it's already complete
        console.log("=== Cover Letter Generation API Completed Successfully ===");
        return NextResponse.json({
            coverLetter: generatedRawText.trim(),
            creditsRemaining: deduction.remainingCredits,
        });

    } catch (error: any) {
        console.error("=== Cover Letter Generation API Error ===");
        console.error("Error details:", error);
        let errorMessage = `Failed to generate cover letter. Please try again.`;

        if (error.message) {
            errorMessage += ` Server Error: ${error.message}`;
        }

        // Check for specific OpenAI API error structures
        if (error.message && error.message.toLowerCase().includes("fetch")) {
            errorMessage += " (A network issue or AI service unavailability may have occurred)";
        } else if (error.message && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("authentication"))) {
            errorMessage = "Failed to generate cover letter: Invalid API Key. Please check server configuration.";
        } else if (error.message && error.message.toLowerCase().includes("content_policy")) {
            errorMessage += " (Content policy violation detected)";
        }

        const errorResponse = { error: errorMessage };
        console.log("Error Response:", errorResponse);
        return NextResponse.json(errorResponse, { status: 500 });
    }
}