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
        const candidateAddress = formData.get("candidateAddress") as string | null;
        const hiringManagerName = formData.get("hiringManagerName") as string | null;
        const hiringManagerTitle = formData.get("hiringManagerTitle") as string | null;
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

        const currentDate = new Date().toLocaleDateString(); // Get current date for context

        let promptText = `You are an expert cover letter writer. Create a concise and compelling cover letter.
The letter should use structural placeholders (like \`[Your Name]\`, \`[Date]\`) ONLY for contact information, date, and salutation.

**KEY REQUIREMENTS:**
1. COMPLETE NARRATIVE - Write the full body of the letter without any "[insert X]" placeholders.
2. CONCISE FORMAT - Keep the letter concise (3-4 short paragraphs total) and focused on key qualifications.
3. EMAIL FORMAT - Use proper spacing and professional email structure.

**CONTENT APPROACH:**
* **Resume Data:** If provided, extract and integrate key skills, experiences, and accomplishments directly into natural-sounding sentences.
* **Job Description:** Identify key requirements and demonstrate alignment with the candidate's qualifications.
* **Keep it Brief:** Focus on the most relevant qualifications for the specific role.

**GENERATING RELEVANT CONTENT:**
    * Often, a cover letter is strengthened by details like how the candidate found the role, specific company initiatives they admire, or elaborating on skills/experiences relevant to the job title.
    * **YOUR TASK:**
        * Always try to use information explicitly provided by the user or directly extracted from the resume/job description first.
        * **HOWEVER, IF SPECIFIC DETAILS FOR THESE ENHANCING SECTIONS ARE NOT DIRECTLY PROVIDED OR FOUND, YOU MUST **GENERATE PLAUSIBLE, PROFESSIONAL, AND CONTEXTUALLY RELEVANT CONTENT** FOR THESE PARTS.** The aim is to make the letter sound complete, informed, and personalized, even if some specifics had to be intelligently inferred or created by you.
    * **EXAMPLES OF WHERE AND HOW TO GENERATE CONTENT:**
        * **Source of Job Discovery:** If the user doesn't specify where they saw the ad, you could generate a phrase like: "I was very interested to learn about the ${jobTitle} opportunity through my professional research into leading companies in the relevant industry sector, such as ${company}." or "Having followed ${company}'s innovative work in its field, I was delighted to see the opening for a ${jobTitle}."
        * **Alignment with Company Values/Projects:** If the user doesn't mention a specific company project or value, you could generate something like: "I am particularly drawn to ${company}'s commitment to [e.g., innovation, customer-centric solutions, sustainable practices – pick something plausible and relevant to the company's likely field/reputation], which resonates strongly with my own professional values." For a well-known company, you might infer a general positive attribute.
        * **Elaborating on Skills/Experience (especially if resume is sparse for the role):** If the resume is brief or doesn't explicitly detail experiences highly relevant to the \`${jobTitle}\`, you should generate plausible examples of skills or experiences. For a "${jobTitle}" role, even if the resume is light, you could write: "My background has equipped me with a strong understanding of [mention 2-3 plausible key skills for the job title, e.g., 'full-stack development and cloud-based architectures' for a software engineer], and I am adept at [mention a plausible relevant soft skill, e.g., 'collaborating with cross-functional teams to deliver impactful results']."
    * **The goal is a polished, complete narrative. The user should not see any bracketed prompts in the body of the letter you generate and make sure it is in an email format.

3.  **STRUCTURAL PLACEHOLDERS (FOR SYSTEM USE - NOT FOR BODY NARRATIVE):**
    These are the ONLY placeholders you should output, and only in their standard locations (header, date, salutation, etc.).
    * \`[Your Name]\`
    * \`[Your Address]\`
    * \`[Your Phone Number]\`
    * \`[Your Email]\`
    * \`[Date]\`
    * \`[Hiring Manager Name]\`
    * \`[Hiring Manager Title]\`
    * \`[Company Name]\`
    * The typed name after the closing (e.g., "Sincerely,") should also use \`[Your Name]\`.

**INFORMATION PROVIDED TO YOU (Use this to write the letter body and for context for structural placeholders):**

**Candidate Details:**
Name: ${candidateName}
Email: ${candidateEmail}
Phone: ${candidatePhone}
`;

        if (candidateAddress) {
            promptText += `Address: ${candidateAddress}\n`;
        } else {
            promptText += `Address: Not provided (The structural placeholder \`[Your Address]\` should be included in the template; our system will manage its omission if no data is supplied).\n`;
        }

        promptText += `
**Target Role & Company:**
Job Title: ${jobTitle}
Company: ${company}
`;
        if (hiringManagerName) {
            promptText += `Hiring Manager's Name: ${hiringManagerName}\n`;
        } else {
            promptText += `Hiring Manager's Name: Not provided (The structural placeholder \`[Hiring Manager Name]\` should be included; our system will use a default like "Hiring Team" or "Hiring Manager").\n`;
        }
        if (hiringManagerTitle) {
            promptText += `Hiring Manager's Title: ${hiringManagerTitle}\n`;
        } else {
            promptText += `Hiring Manager's Title: Not provided (The structural placeholder \`[Hiring Manager Title]\` should be included; our system will manage its omission).\n`;
        }

        if (jobDescription) {
            promptText += `
**Job Description (Analyze carefully. Extract requirements and keywords. The letter BODY must show how the candidate's profile (from resume or your generated relevant content) meets these):**
---
${jobDescription}
---
`;
        } else {
            promptText += `\n**Job Description:** Not provided. (Write the letter BODY focusing on general suitability for the \`${jobTitle}\` role at \`${company}\`. You will need to generate more plausible content about relevant skills and experiences).\n`;
        }

        if (resumeFile) {
            promptText += `
**Candidate's Resume Data (CRITICAL INPUT - ATTACHED AS A FILE FOR YOU TO READ AND USE):**
* You MUST read the attached resume data thoroughly.
* Extract specific skills, experiences, projects, and achievements. Weave these DIRECTLY into the letter body as complete, natural sentences.
* **If the resume is brief or lacks specific details directly applicable to the \`${jobTitle}\` at \`${company}\`, you MUST creatively and professionally GENERATE plausible, relevant examples of skills, experiences, or motivations that a strong candidate for this role would possess.** This generated content must be seamlessly integrated into the narrative.
* **DO NOT output placeholders like "[mention skills from resume]". Instead, if the resume says "Java, Spring Boot," your text should say something like, "I have strong experience with Java and the Spring Boot framework." If the resume is vague on projects, for a 'Project Manager' role, you might generate: "My background includes a proven ability to lead complex projects, manage stakeholder expectations, and ensure timely delivery of objectives."**
`;
        } else {
            promptText += `
**Candidate's Resume Data:** Not provided.
* For the letter body, you MUST **generate plausible and relevant skills, experiences, motivations, and project examples** appropriate for a candidate applying for the \`${jobTitle}\` role at \`${company}\`. This content should be well-written and integrated seamlessly. Do not use placeholders.
`;
        }

        promptText += `
**Overall Tone:** Enthusiastic, confident, and professional.
**Final Output Requirement:** A complete cover letter. The body must be fully written by you, using a smart combination of provided information and your own generation of relevant, plausible content where specifics are missing. **The body MUST NOT contain any bracketed placeholders.** The only placeholders allowed are the structural ones (like \`[Your Name]\`) listed for system use. The current date for context is ${currentDate}; please use the \`[Date]\` placeholder in the letter structure where the date should appear.
`;

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
        // console.log("Raw Gemini Output:\n", generatedRawText); // Optional: Log raw output for debugging

        // The generateCoverLetterWithParams function will now fill in the *structural* placeholders.
        // The AI should have already handled the body content, including generating text for gaps.
        const filledCoverLetter = generateCoverLetterWithParams(generatedRawText.trim(), {
            candidateName: candidateName!,
            candidateAddress: candidateAddress || undefined, // Pass undefined if null
            candidatePhone: candidatePhone!,
            candidateEmail: candidateEmail!,
            date: currentDate, // Use the same date used in the prompt context
            hiringManagerName: hiringManagerName || undefined,
            hiringManagerTitle: hiringManagerTitle || undefined,
            company: company!,
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

function generateCoverLetterWithParams(template: string, params: {
    candidateName: string;
    candidateAddress?: string; // Optional
    candidatePhone: string;
    candidateEmail: string;
    date: string;
    hiringManagerName?: string; // Optional
    hiringManagerTitle?: string; // Optional
    company: string;
}): string {
    let filledLetter = template;

    // Replace structural placeholders
    filledLetter = filledLetter.replace(/\[Your Name\]/g, params.candidateName);
    if (params.candidateAddress) {
        filledLetter = filledLetter.replace(/\[Your Address\]/g, params.candidateAddress);
    } else {
        // If address is not provided, remove the placeholder and potentially the line it's on.
        // This regex tries to remove the line if it solely contains the placeholder or is empty after replacement.
        filledLetter = filledLetter.replace(/^\s*\[Your Address\]\s*[\r\n]/gm, '');
        filledLetter = filledLetter.replace(/\[Your Address\]/g, ''); // Failsafe if it's not on its own line
    }
    filledLetter = filledLetter.replace(/\[Your Phone Number\]/g, params.candidatePhone);
    filledLetter = filledLetter.replace(/\[Your Email\]/g, params.candidateEmail);
    filledLetter = filledLetter.replace(/\[Date\]/g, params.date);
    filledLetter = filledLetter.replace(/\[Company Name\]/g, params.company);

    if (params.hiringManagerName) {
        filledLetter = filledLetter.replace(/\[Hiring Manager Name\]/g, params.hiringManagerName);
    } else {
        // If no hiring manager name, replace with a generic term or ensure salutation is handled.
        // For a salutation like "Dear [Hiring Manager Name]," this makes it "Dear Hiring Team,"
        filledLetter = filledLetter.replace(/Dear \[Hiring Manager Name\]/g, "Dear Hiring Team");
        filledLetter = filledLetter.replace(/\[Hiring Manager Name\]/g, "Hiring Manager"); // For address block
    }

    if (params.hiringManagerTitle) {
        filledLetter = filledLetter.replace(/\[Hiring Manager Title\]/g, params.hiringManagerTitle);
    } else {
        // If title is not provided, remove the placeholder and potentially the line.
        filledLetter = filledLetter.replace(/^\s*\[Hiring Manager Title\]\s*[\r\n]/gm, '');
        filledLetter = filledLetter.replace(/\[Hiring Manager Title\]/g, '');
    }

    // Clean up any potentially remaining empty lines that might result from optional placeholders
    filledLetter = filledLetter.replace(/^\s*[\r\n]/gm, '');

    return filledLetter;
}