import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId, payload } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `Role: You are a professional personal brand marketing expert and Product Manager, skilled at transforming scattered skill fragments into highly attractive "service packages".

Task: I will provide you with a user's raw survey data (including their mic drop topic, 3-step rescue logic, and teaching experience). Please generate a complete set of personal home page copy in English based on this information.

Brand Tone: Professional, warm, concise, and action-oriented. Avoid excessive marketing jargon; sound like a senior/mentor sharing practical experience.

Input Data (Slash Survey):
- Core Topic (Mic Drop): ${payload.micDropTopic || 'Not provided'}
- Topic Details: ${payload.micDropDetails || 'Not provided'}
- Primary Skill: ${payload.primarySkill || 'Not provided'}
- Years of Experience: ${payload.experienceYears || 'Not provided'}
- Teaching Story: ${payload.skillTeachingStory || 'Not provided'}
- Skill Tags: ${(payload.selectedSkills || []).join(', ')}
- Problem solving (SOS Problem): ${payload.sosProblem || 'Not provided'}
- Step 1 (Problem definition): ${payload.sosStep1 || 'Not provided'}
- Step 2 (The Action): ${payload.sosStep2 || 'Not provided'}
- Step 3 (The Result): ${payload.sosStep3 || 'Not provided'}

Output Requirements (MUST be in English):
1. **heading**: Within 10-15 words, a concise and specific professional title or headline, similar to a high-quality LinkedIn heading (e.g., "Full-stack Developer & UI/UX Enthusiast", "Marketing Strategist for E-commerce Growth"). It should feel like a person's title.
2. **story**: The Slash Story. A warm and emotive first-person narrative, STRICTLY under 75 words. DO NOT use emdashes (—). Structure it as: Pain point -> Discovery of solution -> Why I want to help you. It should feel personal and connecting.
3. **services**: A list of 3 suggested service modules. For each service, generate a logical unit-based blueprint that best fits the service type and the user's needs:
    - title: An engaging title for the service.
    - description: A brief summary of the service.
    - category: Service category (Choose ONLY one from: [1-on-1 Mentorship, Consultation, Group Workshop, Group Sharing Event, Multi-week Bootcamp, Step-by-step Program]).
    - price: Suggested market price in USD as a pure integer (e.g., 100). DO NOT include "$" or currency symbols.
    - price_unit: The billing unit for the price. Choose ONLY one from: [session, hr, word, project].
    - duration: Suggested duration in minutes as a pure integer (e.g., 60). DO NOT include "min" or "hours".
    - blueprint: An array of units that form the curriculum or service flow. Each unit MUST have a "title" and "content". You can decide the number of units (e.g., 2, 3, or more) and their specific focus based on what is most effective for this service.

JSON Output Format:
{
  "heading": "A high-impact personal brand statement under 15 words",
  "story": "A professional and warm brand story (under 75 words) structured as: Pain point -> Discovery -> Why I help",
  "services": [
    {
      "title": "Service Title",
      "description": "Short description",
      "category": "Chosen Category",
      "price": 100,
      "price_unit": "hr",
      "duration": 60,
      "blueprint": [
        { "title": "Unit 1: [Specific Title]", "content": "[Specific Content]" },
        { "title": "Unit 2: [Specific Title]", "content": "[Specific Content]" }
      ]
    }
  ]
}

Ensure all generated text is in English. Return ONLY the JSON object.`;

    console.log('Generating profile for payload:', JSON.stringify(payload, null, 2));

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('--- AI RAW RESPONSE START ---');
    console.log(text);
    console.log('--- AI RAW RESPONSE END ---');

    // Robust JSON extraction using regex to find the first '{' and last '}'
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    try {
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse text:', jsonStr);
      return NextResponse.json({
        error: 'AI returned invalid JSON format',
        details: parseError instanceof Error ? parseError.message : String(parseError),
        raw: text
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({
      error: 'Failed to generate profile via Gemini',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
