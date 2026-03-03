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
    "image/png",
    "image/jpeg",
    "image/webp",
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

        const promptText = `You are an expert cover letter writer. Create a professional, ready-to-send cover letter.

**TASK:** Generate ONLY the cover letter text. Do not include any analysis, candidate summaries, or metadata.

**COVER LETTER FORMAT:**
1. Start with candidate's name and contact info (single line each)
2. Current date: ${currentDate}
3. "Dear Hiring Manager,"
4. 3-4 compelling body paragraphs
5. Professional closing: "Sincerely," followed by candidate's name

**CONTENT GUIDELINES:**
- Opening: Express genuine interest in the specific role at ${companyName}
- Body: Highlight 2-3 most relevant experiences/achievements with quantified results
- Show alignment between candidate's background and job requirements
- Closing: Express enthusiasm and suggest next steps
- Total body length: 250-350 words
- Use professional yet personable tone

**CRITICAL INSTRUCTIONS:**
- Output ONLY the cover letter text, nothing else
- No markdown formatting (no ** or #)
- No "Candidate Information" blocks
- No "Cover Letter for X:" headers
- No code blocks or backticks
- Do not use placeholders like [Your Name] - extract real information
- Start directly with the candidate's name at the top

**JOB DESCRIPTION:**
${jobDescription}

Analyze the attached resume and create the cover letter now.`;

        // Prepare messages for OpenAI
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        // Handle different file types appropriately
        if (resumeMimeType.includes('image')) {
            // For images, use vision capabilities with image_url
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
        } else if (resumeMimeType === 'application/pdf') {
            // PDFs: send as base64-encoded file input so the model reads actual content
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: promptText },
                    {
                        type: 'file',
                        file: {
                            filename: resumeFile.name,
                            file_data: `data:application/pdf;base64,${resumeBase64}`
                        }
                    } as unknown as OpenAI.Chat.ChatCompletionContentPartText
                ]
            });
        } else {
            // DOCX/DOC and other text-based documents — include filename in prompt
            messages.push({
                role: 'user',
                content: `${promptText}\n\n[Document file: ${resumeFile.name}, type: ${resumeMimeType}. Analyze the resume content embedded in this document.]`
            });
        }

        console.log("Sending request to OpenAI API with file upload...");

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Supports PDFs + images
            messages,
            temperature: 0.75,
            max_completion_tokens: 2048,
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