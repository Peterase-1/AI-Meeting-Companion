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
    const { transcript, title, date } = req.body;
    const userId = req.user.id;

    if (!transcript) {
      return res.status(400).json({ message: "Transcript is required" });
    }

    // AI Analysis
    const analysis = await analyzeMeeting(transcript);

    // Save to Database
    const meeting = await prisma.meeting.create({
      data: {
        userId,
        title: title || "Untitled Meeting",
        date: date ? new Date(date) : new Date(),
        transcript,
        summary: JSON.stringify(analysis.summary),
        sentiment: JSON.stringify(analysis.sentiment),
        actionItems: {
          create: analysis.actionItems.map((item: any) => ({
            description: item.what,
            assignee: item.who,
            dueDate: (() => {
              if (!item.dueDate) return null;
              const date = new Date(item.dueDate);
              return isNaN(date.getTime()) ? null : date;
            })(),
            priority: item.priority || "MEDIUM" // Default to medium if missing
          }))
        },
        decisions: {
          create: analysis.decisions.map((desc: string) => ({
            description: desc
          }))
        }
      },
      include: {
        actionItems: true,
        decisions: true
      }
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error("Save Meeting Error:", error);
    res.status(500).json({ message: "Failed to save meeting" });
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

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available" });
    }

    let result;
    if (type === 'slides') {
      result = await generateSlideContent(meeting.transcript);
    } else {
      // Assume other types are documents
      result = await convertDocument(meeting.transcript, type);
    }

    res.json(result);
  } catch (error) {
    console.error("Generation Error:", error);
    res.status(500).json({ message: "Failed to generate content" });
  }
});

export default router;
