import express from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../middleware/auth";
import { analyzeMeeting, generateActionPlan, answerQuestion, clusterTopics, generateSlideContent, convertDocument } from "../services/aiService";

const router = express.Router();

// Interface for AuthRequest (extend Express Request)
interface AuthRequest extends express.Request {
  user?: any;
}

// 1. Process & Save Meeting
router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { transcript, title, date, summary, sentiment, actionItems, decisions, actionPlan, topics, fileUrl } = req.body;
    const userId = req.user.id;

    let analysisData: any = {};

    // If analysis data is provided, use it directly (Save what the user sees)
    if (summary && sentiment && actionItems && decisions) {
      console.log("Saving existing analysis data...");
      analysisData = {
        summary: typeof summary === 'string' ? JSON.parse(summary) : summary,
        sentiment: typeof sentiment === 'string' ? JSON.parse(sentiment) : sentiment,
        actionItems: actionItems, // Frontend sends array of objects
        decisions: decisions, // Frontend sends array of strings
        actionPlan: actionPlan,
        topics: topics
      };
    } else {
      // Fallback: Reform analysis (Only if data is missing)
      console.log("No analysis data provided, running AI analysis...");
      if (!transcript) {
        return res.status(400).json({ message: "Transcript is required" });
      }
      const aiResult = await analyzeMeeting(transcript);
      analysisData = aiResult;
    }

    // Helper to remove null bytes and non-printable characters
    const sanitize = (str: any) => {
      if (typeof str !== 'string') return str;
      // Remove null bytes and ensure valid UTF-8
      return str.replace(/\0/g, '').replace(/\u0000/g, '');
    };

    // Save to Database
    const meeting = await prisma.meeting.create({
      data: {
        userId,
        title: sanitize(title) || "Untitled Meeting",
        date: date ? new Date(date) : new Date(),
        transcript: sanitize(transcript) || "",
        fileUrl: sanitize(fileUrl) || null,
        summary: sanitize(JSON.stringify(analysisData.summary)),
        sentiment: sanitize(JSON.stringify(analysisData.sentiment)),
        actionPlan: analysisData.actionPlan ? analysisData.actionPlan : undefined,
        actionItems: {
          create: (analysisData.actionItems || []).map((item: any) => ({
            description: sanitize(item.description || item.what || "No description"),
            assignee: sanitize(item.assignee || item.who || null),
            dueDate: (() => {
              const d = item.dueDate || item.deadline;
              if (!d) return null;
              const dateObj = new Date(d);
              return isNaN(dateObj.getTime()) ? null : dateObj;
            })(),
            priority: sanitize(item.priority || "MEDIUM")
          }))
        },
        decisions: {
          create: (analysisData.decisions || []).map((desc: any) => ({
            description: sanitize(typeof desc === 'string' ? desc : (desc.description || JSON.stringify(desc)))
          }))
        },
        topics: {
          create: (analysisData.topics || []).map((topic: any) => ({
            name: sanitize(topic.name),
            content: sanitize(topic.description)
          }))
        }
      },
      include: {
        actionItems: true,
        decisions: true,
        topics: true
      }
    });

    res.status(201).json(meeting);
  } catch (error: any) {
    console.error("Save Meeting Error:", error);
    res.status(500).json({ message: "Failed to save meeting", error: error.message, details: error });
  }
});

// 2. List Meetings
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { id: true, title: true, date: true, createdAt: true }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});

// 3. Get Meeting Details
router.get("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { actionItems: true, decisions: true, topics: true }
    });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meeting details" });
  }
});

// 4. Generate Action Plan
router.post("/:id/action-plan", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available" });
    }

    const actionPlan = await generateActionPlan(meeting.transcript);

    // Save generated plan
    await prisma.meeting.update({
      where: { id },
      data: { actionPlan }
    });

    res.json(actionPlan);
  } catch (error) {
    console.error("Action Plan Error:", error);
    res.status(500).json({ message: "Failed to generate action plan" });
  }
});

// 5. Chat Q&A
router.post("/:id/chat", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { query, history } = req.body;

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available" });
    }

    const answer = await answerQuestion(meeting.transcript, query, history);
    res.json({ answer });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "Failed to process chat" });
  }
});

// 6. Topic Clustering
router.post("/:id/topics", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available" });
    }

    const clusters = await clusterTopics(meeting.transcript);

    // Clear old topics
    await prisma.topic.deleteMany({ where: { meetingId: id } });

    for (const topic of clusters.topics) {
      await prisma.topic.create({
        data: {
          meetingId: id,
          name: topic.name,
          content: topic.description
        }
      });
    }

    res.json(clusters);
  } catch (error) {
    console.error("Topic Error:", error);
    res.status(500).json({ message: "Failed to cluster topics" });
  }
});

// 7. Generate Content (Slides/Docs)
router.post("/:id/generate/:type", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id, type } = req.params; // type: 'slides' | 'proposal' | 'technical_spec' | etc.
    const { language } = req.body;

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available" });
    }

    let result;
    if (type === 'slides') {
      result = await generateSlideContent(meeting.transcript, language);
    } else {
      // Assume other types are documents
      result = await convertDocument(meeting.transcript, type, language);
    }

    res.json(result);
  } catch (error) {
    console.error("Generation Error:", error);
    res.status(500).json({ message: "Failed to generate content" });
  }
});

// 8. Regenerate Summary with Role
router.post("/:id/regenerate", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { role } = req.body; // e.g., "CEO", "Engineer"

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available" });
    }

    const aiResult = await analyzeMeeting(meeting.transcript, role);

    // Update the meeting with new summary/data
    // Note: We might want to overwrite or store as a variant. For now, we overwrite.
    await prisma.meeting.update({
      where: { id },
      data: {
        summary: JSON.stringify(aiResult.summary),
        // We could also update action items if the role demands different tasks, but usually summary is the key.
        // For showcase, let's keep it simple and just return the new data without saving, 
        // OR save it. Let's return it so frontend can display it dynamically.
      }
    });

    res.json(aiResult);
  } catch (error) {
    console.error("Regenerate Error:", error);
    res.status(500).json({ message: "Failed to regenerate summary" });
  }
});

export default router;
