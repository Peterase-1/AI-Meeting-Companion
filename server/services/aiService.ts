import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const analyzeMeeting = async (transcript: string) => {
  try {
    // Phase 1: Deep Analysis (Summary, Action Items, Decisions)
    const analysisCompletion = await openai.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        {
          role: "system",
          content: `You are an expert meeting assistant. Analyze the following meeting transcript and provide a structured JSON output containing:
          1. "summary": A clean multi-paragraph summary (short and long versions).
          2. "actionItems": A list of action items with "who", "what", "dueDate" (if mentioned, else null), and "priority" (High/Medium/Low).
          3. "decisions": Key decisions made.
          4. "attendees": List of attendees and their roles (inferred).
          
          Output must be valid JSON.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(analysisCompletion.choices[0].message.content || "{}");

    // Phase 2: Fast Insights (Sentiment, Tone)
    const sentimentCompletion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "system",
          content: `Analyze the sentiment and tone of this meeting transcript. Provide a JSON output with:
          1. "sentiment": Overall sentiment (Positive/Neutral/Negative).
          2. "tone": A brief description of the tone (e.g., Professional, Tense, Casual).
          3. "highlights": 3-5 key highlights or memorable moments.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    const sentimentResult = JSON.parse(sentimentCompletion.choices[0].message.content || "{}");

    return {
      ...analysisResult,
      ...sentimentResult
    };

  } catch (error) {
    console.error("AI Processing Error:", error);
    throw new Error("Failed to process meeting data");
  }
};
