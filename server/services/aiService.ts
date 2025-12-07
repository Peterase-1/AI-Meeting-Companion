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
      model: "kwaipilot/kat-coder-pro:free",
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

    const content = analysisCompletion.choices[0].message.content || "{}";
    console.log("Raw Analysis Response:", content);

    // Clean potential markdown blocks
    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();

    const analysisResult = JSON.parse(cleanContent);

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
      model: "kwaipilot/kat-coder-pro:free",
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

export const generateActionPlan = async (transcript: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          role: "system",
          content: `You are a project manager expert. Extract a detailed action plan from the meeting transcript.
          Output JSON format:
          {
            "goals": ["Goal 1", "Goal 2"],
            "tasks": [
              {
                "description": "Task description",
                "owner": "Name or Role",
                "deadline": "YYYY-MM-DD or 'ASAP'",
                "priority": "High/Medium/Low",
                "status": "Pending"
              }
            ],
            "timeline": [
              { "milestone": "Milestone Name", "date": "Date" }
            ]
          }`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error("Action Plan Error:", error);
    throw { status: 500, message: "Failed to generate action plan" };
  }
};

export const answerQuestion = async (transcript: string, query: string, history: { role: "user" | "model"; content: string }[] = []) => {
  try {
    // transform history to openai format
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful meeting assistant. You answer questions based ONLY on the provided meeting transcript.
        Transcript: ${transcript}
        
        If the answer is not in the transcript, say "I couldn't find that information in the meeting."`
      }
    ];

    // Add recent history context (last 5 messages)
    history.slice(-5).forEach(msg => {
      messages.push({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content });
    });

    messages.push({ role: "user", content: query });

    const completion = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: messages,
    });

    return completion.choices[0].message.content || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Q&A Error:", error);
    throw { status: 500, message: "Failed to answer question" };
  }
};

export const clusterTopics = async (transcript: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          role: "system",
          content: `Analyze the meeting transcript and identify key topics discussed. Group relevant content under each topic.
          Output JSON format:
          {
            "topics": [
              {
                "name": "Topic Name (e.g., Budget)",
                "description": "Brief summary of discussion",
                "keywords": ["keyword1", "keyword2"]
              }
            ]
          }`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error("Topic Cluster Error:", error);
    throw { status: 500, message: "Failed to cluster topics" };
  }
};

export const generateSlideContent = async (transcript: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          role: "system",
          content: `Create a presentation outline from the meeting transcript.
          Output JSON format:
          {
            "title": "Meeting Title",
            "slides": [
              {
                "title": "Slide Title",
                "bullets": ["Point 1", "Point 2"],
                "speakerNotes": "Notes for speaker"
              }
            ]
          }
          Ensure at least 5 slides covering: Agenda, Key Discussion, Decisions, Action Items, Next Steps.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error("Slide Gen Error:", error);
    throw { status: 500, message: "Failed to generate slides" };
  }
};

export const convertDocument = async (transcript: string, type: string) => {
  try {
    const prompts: any = {
      proposal: "Write a Project Proposal based on this meeting. Include Background, Objectives, Scope, and Timeline.",
      user_stories: "Generate User Stories with Acceptance Criteria based on requirements discussed.",
      technical_spec: "Write a Technical Design Document (TDD) based on the discussion, including Architecture, API endpoints if mentioned, and Data Models.",
      marketing: "Write a Marketing Copy or Blog Post summarizing the key announcements from this meeting.",
      requirements: "Write a formal Requirements Specification document."
    };

    const prompt = prompts[type] || "Write a detailed document summarizing the meeting contents.";

    const completion = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          role: "system",
          content: `You are an expert technical writer. ${prompt}
          Output the document in Markdown format.`
        },
        {
          role: "user",
          content: transcript
        }
      ]
    });

    return { content: completion.choices[0].message.content || "Failed to generate content." };
  } catch (error: any) {
    console.error("Doc Gen Error:", error);
    throw { status: 500, message: "Failed to generate document" };
  }
};
