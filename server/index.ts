import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://ai-meeting-companion.onrender.com"
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

import { analyzeMeeting } from "./services/aiService";

// ... existing imports

app.post("/api/process", async (req, res) => {
  const { transcript, filePath } = req.body;

  if (!transcript && !filePath) {
    return res.status(400).send("No transcript or file provided.");
  }

  try {
    let textToProcess = transcript;

    if (filePath) {
      // TODO: Implement file reading/transcription (e.g., using Whisper or simple text read)
      // For now, assuming text files or just reading the file content if it's text
      if (filePath.endsWith('.txt')) {
        textToProcess = fs.readFileSync(filePath, 'utf-8');
      } else {
        // Placeholder for audio transcription
        return res.status(501).send("Audio transcription not yet implemented. Please upload a text file or paste transcript.");
      }
    }

    const result = await analyzeMeeting(textToProcess);
    res.json(result);
  } catch (error: any) {
    console.error("Processing error:", error);

    const statusCode = error.status || 500;
    const message = error.message || "Error processing meeting data";

    res.status(statusCode).json({ error: message });
  }
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  // ... existing upload handler
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log("File uploaded:", req.file.path);
  res.json({ message: "File uploaded successfully", filePath: req.file.path });
});

app.get("/", (req, res) => {
  res.send("AI Meeting Companion Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
