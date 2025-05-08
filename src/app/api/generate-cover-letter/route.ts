import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";

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
        console.log("Parsing form data...");
        const formData = await req.formData();

        const jobTitle = formData.get("jobTitle") as string | null;
        const company = formData.get("company") as string | null;
        const jobDescription = formData.get("jobDescription") as string | null;
        const candidateName = formData.get("candidateName") as string | null;
        const candidateEmail = formData.get("candidateEmail") as string | null;
        const candidatePhone = formData.get("candidatePhone") as string | null;
        const candidateAddress = formData.get("candidateAddress") as string | null; // Added
        const hiringManagerName = formData.get("hiringManagerName") as string | null; // Added
        const hiringManagerTitle = formData.get("hiringManagerTitle") as string | null; // Added
        const resumeFile = formData.get("resume") as Blob | null;

        console.log("Received data:", {
            jobTitle,
            company,
            jobDescriptionLength: jobDescription?.length,
            candidateName,
            candidateEmail,
            candidatePhone,
            candidateAddress,
            hiringManagerName,
            hiringManagerTitle,
            resumeFileName: resumeFile?.name,
            resumeFileSize: resumeFile?.size,
            resumeFileType: resumeFile?.type,
        });

        if (!jobTitle || !company || !candidateName || !candidateEmail || !candidatePhone) {
            const missingFields = [
                !jobTitle && "Job Title",
                !company && "Company Name",
                !candidateName && "Candidate Name",
                !candidateEmail && "Candidate Email",
                !candidatePhone && "Candidate Phone",
            ].filter(Boolean).join(", ");

            console.log(`Missing required fields: ${missingFields}`);
            const errorResponse = { error: `Missing required fields: ${missingFields}.` };
            console.log("Error Response:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        let resumeBase64: string | null = null;
        let resumeMimeType: string | null = null;

        if (resumeFile) {
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
            resumeBase64 = buffer.toString('base64');
            resumeMimeType = resumeFile.type;
            console.log(`Resume file '${resumeFile.name}' processed.`);
        }

        let promptText = `You are a professional cover letter writer. Generate a compelling and tailored cover letter.

Candidate's Name: ${candidateName}
Candidate's Email: ${candidateEmail}
Candidate's Phone: ${candidatePhone}
`;

        if (candidateAddress) {
            promptText += `Candidate's Address: ${candidateAddress}\n`;
        }

        promptText += `
Target Job Title: ${jobTitle}
Target Company: ${company}
`;
        if (hiringManagerName) {
            promptText += `Hiring Manager's Name: ${hiringManagerName}\n`;
        }
        if (hiringManagerTitle) {
            promptText += `Hiring Manager's Title: ${hiringManagerTitle}\n`;
        }

        if (jobDescription) {
            promptText += `\nJob Description:\n---\n${jobDescription}\n---\n`;
        }

        if (resumeFile) {
            promptText += `\nThe candidate's resume is attached as a file. Please thoroughly analyze the content of the attached resume.
Craft the cover letter to highlight the candidate's most relevant skills and experiences from the resume, aligning them with the target job title and company.
If a job description is provided, ensure the letter is tailored to address its specific requirements.
`;
        } else {
            promptText += `\nCraft the cover letter highlighting general suitability for the role based on the provided candidate and job details.
Since a resume is not provided, focus on expressing the candidate's enthusiasm and potential, even without specific resume content. Make sure it sounds like a human wrote it. and its genuinely personalized to the candidate and the job.
`;
        }

        promptText += `
Ensure the tone is enthusiastic, confident, and professional. Structure it like a standard cover letter, using the provided information.  Do not include any placeholders. BUT MAKE SURE IT DOESNT SOUND TOO AI GENERATED.
`;
        // Removed specific structure instructions.
        const modelParts: Part[] = [{ text: promptText }];

        if (resumeBase64 && resumeMimeType) {
            modelParts.unshift({
                inlineData: {
                    mimeType: resumeMimeType,
                    data: resumeBase64,
                },
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const generationConfig = {
            temperature: 0.75,
            topK: 30,
            topP: 0.95,
            maxOutputTokens: 2048,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        console.log("Sending request to Gemini API...");

        const result = await model.generateContent({
            contents: [{ role: "user", parts: modelParts }],
            generationConfig,
            safetySettings
        });

        const geminiResponse = result.response;
        const generatedCoverLetter = geminiResponse?.text() ?? null;

        if (!generatedCoverLetter) {
             console.log("No response text from Gemini. Prompt Feedback:", geminiResponse?.promptFeedback);
            const noResponseError = { error: "Failed to generate cover letter. The AI did not return any text. This could be due to content restrictions or processing issues." };
            if (geminiResponse?.promptFeedback?.blockReason) {
                noResponseError.error += ` Reason: ${geminiResponse.promptFeedback.blockReason}`;
            }
            console.log("Error Response:", noResponseError);
            return NextResponse.json(noResponseError, { status: 500 });
        }

        console.log("Received cover letter from Gemini, length:", generatedCoverLetter.length);

        const filledCoverLetter = generateCoverLetterWithParams(generatedCoverLetter.trim(), {  // Using the helper
            candidateName,
            candidateAddress,
            candidatePhone,
            candidateEmail,
            date: new Date().toLocaleDateString(), // Use current date,
            hiringManagerName,
            hiringManagerTitle,
            company
        });

        console.log("=== Cover Letter Generation API Completed Successfully ===");
        return NextResponse.json({ coverLetter: filledCoverLetter });

    } catch (error: any) {
        console.error("=== Cover Letter Generation API Error ===");
        console.error("Error details:", error);
        let errorMessage = `Failed to generate cover letter. Please try again.`;

        if (error.message) {
            errorMessage += ` Server Error: ${error.message}`;
        }

        if (error.response && error.response.promptFeedback) {
            console.error("Gemini Prompt Feedback:", error.response.promptFeedback);
            const blockReason = error.response.promptFeedback.blockReason;
            const safetyRatings = error.response.promptFeedback.safetyRatings;
            errorMessage += ` (AI processing issue: ${blockReason || 'Unknown reason'}. Safety Ratings: ${JSON.stringify(safetyRatings)})`;
        } else if (error.status && error.details) {
            console.error("Gemini API Error Status:", error.status, "Details:", error.details);
            errorMessage += ` (AI API Error: ${error.details})`;
        } else if (error.message && error.message.includes("fetch")) {
            errorMessage += " (Network issue or AI service unavailable)"
        }

        const errorResponse = { error: errorMessage };
        console.log("Error Response:", errorResponse);
        return NextResponse.json(errorResponse, { status: 500 });
    }
}
function generateCoverLetterWithParams(template: string, params: {
    candidateName: string;
    candidateAddress?: string;
    candidatePhone: string;
    candidateEmail: string;
    date: string;
    hiringManagerName?: string;
    hiringManagerTitle?: string;
    company: string;

}): string {

    let filledLetter = template;

    filledLetter = filledLetter.replace(/\[Your Name\]/g, params.candidateName);
    if (params.candidateAddress) {
        filledLetter = filledLetter.replace(/\[Your Address\]/g, params.candidateAddress);
    } else {
         filledLetter = filledLetter.replace(/\[Your Address\]\n/g, ''); // Remove the line
    }
    filledLetter = filledLetter.replace(/\[Your Phone Number\]/g, params.candidatePhone);
    filledLetter = filledLetter.replace(/\[Your Email\]/g, params.candidateEmail);
    filledLetter = filledLetter.replace(/\[Date\]/g, params.date);
    filledLetter = filledLetter.replace(/\[Company Name\]/g, params.company);


    if (params.hiringManagerName) {
        filledLetter = filledLetter.replace(/\[Hiring Manager Name\]/g, params.hiringManagerName);
    } else {
        filledLetter = filledLetter.replace(/\[Hiring Manager Name\]/g, "Hiring Manager");
    }

    if (params.hiringManagerTitle) {
        filledLetter = filledLetter.replace(/\[Hiring Manager Title\]/g, params.hiringManagerTitle);
    } else {
         filledLetter = filledLetter.replace(/\[Hiring Manager Title\]/g, ''); //remove line
    }

    return filledLetter;
}