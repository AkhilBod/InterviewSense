import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobDetails } = await request.json();

    if (!jobDetails || !jobDetails.jobTitle) {
      return NextResponse.json({ error: 'Job details are required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    let typeInstructions = '';
    if (jobDetails.interviewType === 'Technical') {
      typeInstructions = `Focus on technical skills, coding, algorithms, system design, and problem-solving. Include questions about:
- Specific technologies and frameworks relevant to ${jobDetails.jobTitle}${jobDetails.industry ? ` in ${jobDetails.industry}` : ''}
- Real-world technical challenges and their solutions
- System architecture and scalability considerations
- Code optimization and performance
- Technical decision-making processes
- Problem-solving approaches and debugging strategies
- Technical leadership and mentoring${jobDetails.industry ? `\n- Industry-specific technical requirements for ${jobDetails.industry}` : ''}`;
    } else if (jobDetails.interviewType === 'Behavioral') {
      typeInstructions = `Focus on past experiences, soft skills, and scenarios relevant to ${jobDetails.jobTitle}. Include questions about:
- Leadership experiences and team management
- Conflict resolution and interpersonal skills
- Project management and deadline handling
- Cross-functional collaboration
- Innovation and process improvement
- Handling high-pressure situations
- Problem-solving and decision-making
- Cultural fit and team dynamics
- Communication with stakeholders
- Adaptability to change and learning new skills`;
    } else if (jobDetails.interviewType === 'Case Study') {
      typeInstructions = `Focus on analytical thinking and business problem-solving${jobDetails.industry ? ` specific to ${jobDetails.industry}` : ''}. Include questions about:${jobDetails.industry ? `\n- Industry-specific business challenges` : '\n- General business challenges'}
- Market analysis and strategy
- Data-driven decision making
- Risk assessment and management
- Resource optimization
- Competitive analysis
- Business process improvement
- Stakeholder management
- ROI and business impact${jobDetails.industry ? `\n- Industry trends and adaptation` : ''}`;
    } else if (jobDetails.interviewType === 'System Design') {
      typeInstructions = `Focus on architecture and system design${jobDetails.industry ? ` specific to ${jobDetails.industry}` : ''}. Include questions about:
- Scalable system architecture
- Performance optimization
- Security considerations
- Data modeling and storage
- API design and integration
- Microservices architecture
- Cloud infrastructure
- System reliability and fault tolerance${jobDetails.industry ? `\n- Industry-specific technical requirements` : ''}
- System monitoring and maintenance`;
    } else if (jobDetails.interviewType === 'Leadership') {
      typeInstructions = `Focus on leadership and management${jobDetails.industry ? ` in ${jobDetails.industry}` : ''}. Include questions about:
- Team building and development
- Strategic planning and execution
- Change management
- Performance management
- Resource allocation
- Stakeholder communication
- Innovation leadership
- Crisis management${jobDetails.industry ? `\n- Industry-specific leadership challenges` : ''}
- Mentoring and coaching`;
    } else {
      typeInstructions = `Include a balanced mix of technical and behavioral questions specific to ${jobDetails.jobTitle}${jobDetails.industry ? ` in ${jobDetails.industry}` : ''}, covering:
- Technical expertise and problem-solving
- Leadership and team management${jobDetails.industry ? `\n- Industry-specific knowledge` : ''}
- Communication and collaboration
- Innovation and strategic thinking
- Project management
- Stakeholder management
- Professional development${jobDetails.industry ? `\n- Industry trends and adaptation` : ''}
- Cultural fit and values`;
    }

    const numQuestions = jobDetails.numberOfQuestions || 20;

    const prompt = `Generate EXACTLY ${numQuestions} highly specific and targeted interview questions for a ${jobDetails.experienceLevel} ${jobDetails.jobTitle} position${jobDetails.company ? ` at ${jobDetails.company}` : ''}${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? ` in the ${jobDetails.industry} industry` : ''}.

This is a ${jobDetails.interviewType} interview at the ${jobDetails.interviewStage} stage.

${jobDetails.jobAd ? `Here is the job description to reference:\n${jobDetails.jobAd}\n\n` : ''}

${typeInstructions}

Additional Requirements:
${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `- Questions should be specific to ${jobDetails.industry} industry context` : '- Questions should be relevant to the role and general business context'}
- Include scenario-based questions relevant to ${jobDetails.experienceLevel} level
- Focus on real-world applications and challenges
${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `- Consider industry-specific tools, technologies, and methodologies\n- Include questions about industry trends and future developments` : '- Focus on transferable skills and universal competencies'}
- Ensure questions test both technical knowledge and soft skills
${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? `- Include questions about handling industry-specific challenges` : '- Include questions about handling general workplace challenges'}
- Consider the company's size and market position if provided

Make sure the questions are appropriate for a ${jobDetails.experienceLevel} level position${jobDetails.industry && jobDetails.interviewType !== 'Behavioral' ? ` and reflect the specific requirements of the ${jobDetails.industry} industry` : ''}.

Return ONLY a JSON array of EXACTLY ${numQuestions} objects with 'id' and 'question' fields. Do not include any markdown formatting or additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 2048,
    });

    const text = completion.choices[0].message.content || '';
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const questions = JSON.parse(cleanText);

    if (!Array.isArray(questions) || questions.length !== numQuestions) {
      throw new Error(`Invalid number of questions received. Expected ${numQuestions}, got ${questions.length}`);
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
