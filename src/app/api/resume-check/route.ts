// pages/api/resume-check.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Ensure GOOGLE_AI_KEY is set in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const CREDIT_COST_RESUME = 1;

export async function POST(req: Request) {
    console.log("=== Resume Check API Started (Direct File Upload Method) ===");
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Deduct credits
        try {
            const creditResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/user/credits`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Pass along the session cookie if your API route is protected
                    // This might require handling cookies on the server-side if not already done
                    // For simplicity, assuming the /api/user/credits route can re-verify session
                },
                body: JSON.stringify({ featureType: 'resume' }),
            });

            if (!creditResponse.ok) {
                const errorData = await creditResponse.json();
                if (creditResponse.status === 402) { // Insufficient credits
                    return NextResponse.json({ error: "Insufficient credits to check resume." }, { status: 402 });
                }
                return NextResponse.json({ error: errorData.error || "Failed to deduct credits." }, { status: creditResponse.status });
            }
        } catch (creditError) {
            console.error("Credit deduction error:", creditError);
            return NextResponse.json({ error: "Failed to process credit deduction." }, { status: 500 });
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

Please provide a detailed, structured resume analysis focused on this specific role in the following format:

# Resume Analysis Report for ${jobTitle} Position

## Overall Assessment
[Provide a role-specific evaluation of the resume's suitability, using a rating out of 100 (e.g., "Overall Score: 85/100 - This resume demonstrates strong technical skills for the ${jobTitle} position but needs more emphasis on domain expertise."). Ensure the score is explicitly mentioned as "Overall Score: XX/100" so it can be parsed.]

## Role-Specific Strengths
- [List achievements, skills, and experiences that align SPECIFICALLY with the ${jobTitle} position requirements]
- [Focus on industry-relevant accomplishments and quantifiable results that matter for this role]
- [Highlight technical skills, domain knowledge, or certifications particularly valuable for this position]

## Role-Specific Improvements Needed
- [List aspects that need enhancement to better align with ${jobTitle} position expectations]
- [Provide actionable advice tailored to this specific role and industry]

## Industry-Specific Recommendations
- [Suggest precise additions of keywords, experiences, or accomplishments typical for successful candidates in this exact role]
- [Recommend role-specific wording changes or enhancements based on industry standards]

## ATS Optimization for This Role
- [List suggestions to improve Applicant Tracking System (ATS) compatibility specifically for ${jobTitle} positions]
- [Include advice on industry-specific keywords and formatting practices for this role]

## Format and Presentation Feedback
- [Provide feedback on formatting with special attention to what hiring managers for ${jobTitle} positions typically expect]
- [Suggest improvements aligned with industry standards for this specific role]

Please ensure all sections are present and use clear, concise language. The sections "Overall Assessment", "Key Strengths", "Areas for Improvement", "Specific Suggestions", "ATS Optimization Tips", and "Format and Presentation Feedback" should always appear.`
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
        // console.log("Analysis Text (first 500 chars):", analysisText.substring(0, 500));

        // Attempt to parse the Overall Score
        let overallScore = null;
        const scoreMatch = analysisText.match(/Overall Score: (\d{1,3})\/100/);
        if (scoreMatch && scoreMatch[1]) {
            overallScore = parseInt(scoreMatch[1], 10);
            console.log(`Parsed Overall Score: ${overallScore}`);
        } else {
            console.log("Could not parse Overall Score from the analysis.");
        }

        const successResponse = { analysis: analysisText, overallScore };
        // console.log("Success Response:", successResponse);
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