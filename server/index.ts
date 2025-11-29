import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { analyzeMeeting } from "./services/aiService";

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

app.post("/api/process", async (req, res) => {
  const { transcript, filePath } = req.body;

  if (!transcript && !filePath) {
    return res.status(400).send("No transcript or file provided.");
  }

  try {
    let textToProcess = transcript;

    if (filePath) {
      // Check if it's a remote URL (FileStack)
      if (filePath.startsWith('http')) {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
        }
        textToProcess = await response.text();
      }
      // Fallback to local file system (legacy support or if upload failed to FileStack but saved locally)
      else if (fs.existsSync(filePath)) {
        if (filePath.endsWith('.txt')) {
          textToProcess = fs.readFileSync(filePath, 'utf-8');
        } else {
          // Placeholder for audio transcription
          return res.status(501).send("Audio transcription not yet implemented. Please upload a text file or paste transcript.");
        }
      } else {
        return res.status(404).send("File not found.");
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

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    console.log("File uploaded locally:", req.file.path);

    // Upload to FileStack via REST API
    const fileBuffer = fs.readFileSync(req.file.path);
    const apiKey = process.env.FILESTACK_API_KEY;
    if (!apiKey) {
      throw new Error("FileStack API key not configured.");
    }

    const response = await fetch(`https://www.filestackapi.com/api/store/S3?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': req.file.mimetype
      },
      body: fileBuffer
    });

    if (!response.ok) {
      throw new Error(`FileStack API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    console.log("File uploaded to FileStack:", data);

    // Delete local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting local file:", err);
      else console.log("Local file deleted.");
    });

    res.json({ message: "File uploaded successfully", filePath: data.url, filename: req.file.originalname });
  } catch (error) {
    console.error("FileStack upload error:", error);
    res.status(500).json({ error: "Error uploading file to storage." });
  }
});

app.get("/", (req, res) => {
  res.send("AI Meeting Companion Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
