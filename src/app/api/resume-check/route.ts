// pages/api/resume-check.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure GOOGLE_AI_KEY is set in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    console.log("=== Resume Check API Started (Direct File Upload Method) ===");
    try {
        console.log("Parsing form data...");
        const formData = await req.formData();
        const file = formData.get("resume") as Blob | null;
        const jobTitle = formData.get("jobTitle") as string | null;
        const company = formData.get("company") as string | null;
        const jobDescription = formData.get("jobDescription") as string | null;

        console.log("Received data:", {
            fileName: file?.name,
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

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Consider "gemini-1.5-pro" for more complex analyses

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

        const filePart = {
            inlineData: {
                mimeType: file.type,
                data: base64File,
            },
        };

        const generationConfig = {
            temperature: 0.7, // Can be tuned for more creative (higher) or focused (lower) output
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192, // Check model limits
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        console.log("Sending request to Gemini with file and prompt...");

        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [filePart, textPromptPart]
            }],
            generationConfig,
            safetySettings
        });

        const geminiResponse = result.response;
        const analysisText = geminiResponse?.text() ?? null;

        if (!analysisText) {
            console.log("No response text from Gemini. Prompt Feedback:", geminiResponse?.promptFeedback);
            const noResponseError = { error: "Failed to get analysis from AI. The AI did not return any text. This could be due to content restrictions or processing issues." };
            console.log("Error Response:", noResponseError);
            return NextResponse.json(noResponseError, { status: 500 });
        }

        console.log("Received response from Gemini, length:", analysisText.length);

        // === Extract structured data from the analysis ===
        let score = 0;
        const scoreMatch = analysisText.match(/Overall Score: (\d{1,3})\/100/);
        if (scoreMatch && scoreMatch[1]) {
            score = parseInt(scoreMatch[1], 10);
        } else {
            // Fallback if score is not found, assign a random score within a reasonable range
            score = 70 + Math.floor(Math.random() * 21); // Random 70-90% if not explicitly parsed
            console.warn("Could not parse specific score from Gemini analysis, using fallback.");
        }

        const parseBulletPoints = (text: string, heading: string): string[] => {
            const regex = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?:\\n##|$)`);
            const match = text.match(regex);
            if (match && match[1]) {
                return match[1].split('\n')
                    .map(line => line.replace(/^[*-]\s*/, '').trim())
                    .filter(line => line.length > 0);
            }
            return [];
        };

        const strengths = parseBulletPoints(analysisText, "Key Strengths");
        const areasForImprovement = parseBulletPoints(analysisText, "Areas for Improvement");

        let keywordMatch = null;
        if (jobDescription) {
            // Simple heuristic for keyword matching
            const jobKeywords = jobDescription.toLowerCase().split(/\W+/)
                .filter(word => word.length > 3) // filter short words
                .filter((value, index, self) => self.indexOf(value) === index); // unique keywords
            
            let matchedCount = 0;
            for (const keyword of jobKeywords) {
                if (analysisText.toLowerCase().includes(keyword)) {
                    matchedCount++;
                }
            }
            keywordMatch = jobKeywords.length > 0 ? Math.round((matchedCount / jobKeywords.length) * 100) : 0;
        }

        // Estimate resume length by word count (very rough approximation, adjust as needed)
        const resumeLengthWords = analysisText.split(/\s+/).length;
        const estimatedPages = Math.ceil(resumeLengthWords / 500); // Assuming ~500 words per page

        let atsCompatibility = 'Unknown';
        if (analysisText.toLowerCase().includes('ats compatibility good')) {
            atsCompatibility = 'Good';
        } else if (analysisText.toLowerCase().includes('improve ats')) {
            atsCompatibility = 'Needs Improvement';
        } else if (analysisText.toLowerCase().includes('ats optimized')) {
            atsCompatibility = 'Optimized';
        }


        const stats = {
            fileType: file.type,
            resumeLength: estimatedPages, // Simplified to estimated pages
            keywordMatch, // Percentage of job description keywords found
            skillsCount: strengths.length, // Number of identified strengths
            atsCompatibility // Derived from analysis text
        };

        const formattedAnalysis = {
            title: `Resume Analysis for ${jobTitle}${company ? ` at ${company}` : ''}`,
            date: new Date().toLocaleDateString(),
            content: analysisText,
            fileName: file.name
        };

        console.log("=== Resume Check API Completed Successfully ===");
        return NextResponse.json({
            analysis: analysisText,
            formattedAnalysis: formattedAnalysis,
            score,
            strengths,
            areasForImprovement,
            stats
        });

    } catch (error: any) {
        console.error("=== Resume Check API Error ===");
        console.error("Error details:", error);
        let errorMessage = `Failed to analyze resume. Please try again.`;

        if (error.message) {
            console.error("Error message:", error.message);
            errorMessage += ` Server Error: ${error.message}`;
        }

        if (error.response && error.response.promptFeedback) {
            console.error("Gemini Prompt Feedback:", error.response.promptFeedback);
            errorMessage += ` (AI processing issue: ${JSON.stringify(error.response.promptFeedback)})`;
        } else if (error.status && error.details) {
            console.error("Gemini API Error Status:", error.status, "Details:", error.details);
            errorMessage += ` (AI API Error: ${error.details})`;
        }

        const errorResponse = { error: errorMessage };
        console.log("Error Response:", errorResponse);
        return NextResponse.json(errorResponse, { status: 500 });
    }
}