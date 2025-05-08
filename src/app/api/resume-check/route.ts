import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

export async function POST(req: Request) {
  console.log("=== Resume Check API Started ===");
  try {
    console.log("Parsing form data...");
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const jobTitle = formData.get("jobTitle") as string;
    const company = formData.get("company") as string;
    const jobDescription = formData.get("jobDescription") as string;

    console.log("Received data:", {
      fileName: file?.name,
      fileSize: file?.size,
      jobTitle,
      company,
      jobDescriptionLength: jobDescription?.length
    });

    if (!file || !jobTitle) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Resume and job title are required" },
        { status: 400 }
      );
    }

    // Process file in memory
    console.log("Processing file:", file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileContent = buffer.toString('utf-8');

    console.log("Creating Gemini prompt");
    // Create Gemini prompt
    const prompt = `Analyze this resume for a ${jobTitle} position${company ? ` at ${company}` : ""}:
    
Resume Content:
${fileContent}

${jobDescription ? `Job Description:\n${jobDescription}\n` : ""}

Please provide:
1. Overall assessment
2. Key strengths
3. Areas for improvement
4. Specific suggestions to better align with the role
5. ATS optimization tips
6. Format and presentation feedback

Format the response in clear sections with bullet points where appropriate.`;

    console.log("Sending request to Gemini");
    // Get Gemini response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.log("No response from Gemini");
      return NextResponse.json(
        { error: "Failed to get analysis from AI. Please try again." },
        { status: 500 }
      );
    }
    console.log("Received response from Gemini, length:", text.length);

    console.log("=== Resume Check API Completed Successfully ===");
    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error("=== Resume Check API Error ===");
    console.error("Error details:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
} 