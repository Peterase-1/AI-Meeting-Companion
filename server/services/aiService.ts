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
      model: "google/gemini-2.0-flash-lite-preview-02-05:free",
      messages: [
        {
          role: "system",
          content: `You are an expert meeting assistant. Analyze the following meeting transcript and provide a structured JSON output containing:
          1. "summary": { "short": "A clean paragraph summary", "long": "Detailed notes" }
          2. "actionItems": [{ "who": "Name", "what": "Task", "dueDate": "Date/null", "priority": "High/Medium/Low" }]
          3. "decisions": ["Decision 1", "Decision 2"]
          4. "attendees": [{ "name": "Name", "role": "Role" }]
          
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

    // Default structure to ensure frontend doesn't break
    const defaultStructure = {
      summary: { short: "", long: "" },
      actionItems: [],
      decisions: [],
      attendees: []
    };

    const finalAnalysis = { ...defaultStructure, ...analysisResult };

    // Phase 2: Fast Insights (Sentiment, Tone)
    const sentimentCompletion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "system",
          content: `Analyze the sentiment and tone of this meeting transcript. Provide a JSON output with:
          1. "sentiment": Overall sentiment (Positive/Neutral/Negative).
          2. "tone": A brief description of the tone (e.g., Professional, Tense, Casual).
          3. "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]`
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
      ...finalAnalysis,
      sentiment: sentimentResult
    };

  } catch (error: any) {
    console.error("AI Processing Error:", error);

    // Check for OpenAI specific errors
    if (error.status) {
      throw { status: error.status, message: error.message || "AI Service Error" };
    }

    throw { status: 500, message: "Failed to process meeting data" };
  }
};
