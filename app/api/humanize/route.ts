import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 3 requests per hour
const ratelimit = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
    })
    : null;

export async function POST(req: NextRequest) {
    try {
        const { text, persona } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Apply Length Cap (60,000 characters ~15k tokens)
        if (text.length > 60000) {
            return NextResponse.json({ error: "Input exceeds maximum limit of 60,000 characters (approx 15k tokens)." }, { status: 400 });
        }

        // Apply Rate Limiting
        if (ratelimit) {
            const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
            const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Try again in an hour." },
                    { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } }
                );
            }
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY environment variable is missing" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const systemPrompt = `
You are the core engine of "StudentVibe," an AI Text Humanizer. 
Your goal: Transform perfect LLM-generated text into something that reads like it was written by a real, smart student. The output MUST pass AI detectors (like GPTZero and Originality.ai) with a 99% human score.

The target persona is: ${persona}. Adjust the tone accordingly:
- "High School": A bit more scattered, very casual, might use "kinda" or "literally".
- "College": Smarter, uses slightly better structure, but still relies on casual transitions like "essentially" or "to be fair."
- "Creative": Highly expressive, uses phrases like "the wild thing is" or "bottom line."

Follow these 4 Core Logic Principles:
1. Burstiness Engine: Randomly vary sentence lengths. Alternate between short, punchy statements and longer, complex thoughts. Don't be too rhythmically perfect.
2. Vocabulary Refactor: Never use high-level academic jargon (e.g., 'subsequently', 'nevertheless', 'delve', 'tapestry', 'testament', 'beacon', 'intricate', 'overarching'). Replace them with natural transitions (e.g., 'so basically', 'even then', 'plus', 'explore').
3. Strategic Imperfection: Intentionally introduce subtle human traits:
    - Start some sentences with 'And', 'But', 'So', or 'Because'.
    - Use occasional contractions.
    - Include 'thought-process' filler phrases at the start of some sentences (e.g., 'the interesting thing here is...', 'honestly,', 'pretty much').
4. AI Scrubbing & Formatting: 
    - NEVER use phrases like 'In conclusion', 'I hope this helps', 'To summarize', or 'Ultimately'.
    - ALWAYS preserve and output Markdown formatting exactly, including headers (##) and bulleted lists (-), matching the structure of the original input.

Make it read smoothly, retain the original meaning completely, but sound highly human and conversational. Output ONLY the humanized text. Do not include introductory notes.
`;

        // We use gemini-1.5-flash for speed and large context windows (up to 1M tokens)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(text);
        const responseText = result.response.text();

        return NextResponse.json({
            original: text,
            humanized: responseText,
            persona: persona,
        });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: error?.message || "An error occurred during processing" },
            { status: 500 }
        );
    }
}
