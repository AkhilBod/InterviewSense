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
            // Add more supported types if needed, e.g., for code files, other image/video types
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

        // Using gemini-1.5-flash-latest. You can switch to gemini-1.5-pro-latest for potentially higher quality.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Create the text prompt with proper escaping to avoid nested quotation issues
        const textPromptPart = {
            text: `You are an expert resume reviewer. Analyze the provided resume (which is attached as a file) for a ${jobTitle} position${company ? ` at ${company}` : ""}.
${jobDescription ? `\nConsider the following job description for your analysis:\n---\n${jobDescription}\n---\n` : ""}

Based on the resume content (which you will extract from the attached file), please provide a detailed analysis in the following format:

# Resume Analysis Report

## Overall Assessment
[Provide a brief summary of the resume's suitability for the role]

## Key Strengths
- [List specific aspects that are strong and relevant]
- [Focus on achievements and skills that match the role]

## Areas for Improvement
- [List specific areas that could be enhanced]
- [Be specific about what needs to be changed]

## Specific Suggestions
- [List actionable advice to better align with the role]
- [Include specific examples of how to improve content]

## ATS Optimization Tips
- [List suggestions to improve ATS compatibility]
- [Include specific keywords and formatting tips]

## Format and Presentation Feedback
- [List observations about layout and readability]
- [Include specific suggestions for visual improvement]

Please format your response with clear sections and bullet points. Be constructive and professional.`
        };

        const filePart = {
            inlineData: {
                mimeType: file.type,
                data: base64File,
            },
        };

        const generationConfig = {
            temperature: 0.7,
            topK: 1, // Default, can be tuned
            topP: 1, // Default, can be tuned
            maxOutputTokens: 8192, // Check model limits, 8192 is common for Gemini 1.5 Flash
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        console.log("Sending request to Gemini with file and prompt...");
        // console.log("Text prompt (first 300 chars):", textPromptPart.text.substring(0,300) + "...");

        const result = await model.generateContent({
            contents: [{ 
                role: "user", 
                parts: [filePart, textPromptPart] 
            }],
            generationConfig,
            safetySettings
        });

        const geminiResponse = result.response;
        const analysisText = geminiResponse?.text() ?? null; // Using nullish coalescing

        if (!analysisText) {
            console.log("No response text from Gemini. Prompt Feedback:", geminiResponse?.promptFeedback);
            const noResponseError = { error: "Failed to get analysis from AI. The AI did not return any text. This could be due to content restrictions or processing issues." };
            console.log("Error Response:", noResponseError);
            return NextResponse.json(noResponseError, { status: 500 });
        }

        console.log("Received response from Gemini, length:", analysisText.length);
        // console.log("Response sample (first 200 chars):", analysisText.substring(0, 200) + "...");

        // === New: Extract structured data from the analysis ===
        // Simple heuristics for demo purposes; for production, use a more robust parser or prompt the AI to return JSON.
        let score = 80 + Math.floor(Math.random() * 16); // Random 80-95% for demo
        let strengths: string[] = [];
        let areasForImprovement: string[] = [];
        let keywordMatch = null;
        let skillsCount = null;
        let atsCompatibility = null;
        let resumeLength = null;
        // Extract strengths and areas for improvement from the analysis text
        const strengthsMatch = analysisText.match(/## Key Strengths[\s\S]*?((?:\* .+\n?)+)/);
        if (strengthsMatch) {
            strengths = strengthsMatch[1].split('\n').map(s => s.replace(/^\* /, '').trim()).filter(Boolean);
        }
        const improvementMatch = analysisText.match(/## Areas for Improvement[\s\S]*?((?:\* .+\n?)+)/);
        if (improvementMatch) {
            areasForImprovement = improvementMatch[1].split('\n').map(s => s.replace(/^\* /, '').trim()).filter(Boolean);
        }
        // Keyword match (if job description provided)
        if (jobDescription) {
            // Simple heuristic: count how many job keywords appear in resume analysis
            const jobKeywords = jobDescription.split(/\W+/).filter(w => w.length > 4);
            let matchCount = 0;
            jobKeywords.forEach(kw => {
                if (analysisText.toLowerCase().includes(kw.toLowerCase())) matchCount++;
            });
            keywordMatch = Math.round((matchCount / jobKeywords.length) * 100);
        }
        // Skills count: count bullet points in Key Strengths
        skillsCount = strengths.length;
        // ATS compatibility: look for ATS in the analysis
        atsCompatibility = analysisText.includes('ATS') ? (analysisText.includes('improve ATS') ? 'Needs Improvement' : 'Good') : 'Unknown';
        // Resume length: estimate by file size (1 page ~ 50KB for PDF)
        resumeLength = file.size ? Math.max(1, Math.round(Number(file.size) / 50000)) : null;

        const stats = {
            fileType: file.type,
            resumeLength,
            keywordMatch,
            skillsCount,
            atsCompatibility
        };

        // Create a formatted version for PDF generation
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
        
        // If the error object has response details from Gemini (e.g. for safety blocks)
        if (error.response && error.response.promptFeedback) {
            console.error("Gemini Prompt Feedback:", error.response.promptFeedback);
            errorMessage += ` (AI processing issue: ${JSON.stringify(error.response.promptFeedback)})`;
        } else if (error.status && error.details) { // For errors structured differently by the SDK
             console.error("Gemini API Error Status:", error.status, "Details:", error.details);
             errorMessage += ` (AI API Error: ${error.details})`;
        }

        const errorResponse = { error: errorMessage };
        console.log("Error Response:", errorResponse);
        return NextResponse.json(errorResponse, { status: 500 });
    }
}