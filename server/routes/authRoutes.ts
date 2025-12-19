import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import passport from "passport";
import { google } from "googleapis";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    if (!user.password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Current User (Me)
import { verifyToken } from "../middleware/auth";
// We need to extend Request interface locally or assume req.user is there to avoid TS errors easier for now, 
// or import the extended interface. simplified for brevity.
interface AuthRequest extends express.Request {
  user?: any;
}

router.get("/me", verifyToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Update Profile
router.put("/me", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});



// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.events.readonly"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const user = req.user as any;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    // Redirect to frontend with token
    // In production (nip.io), we redirect to the https domain
    // In dev, localhost
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? "https://35.94.16.120.nip.io"
      : "http://localhost:6000"; // Assuming dev runs on 6000 via nginx or 5173 direct.
    // Actually user uses 6001 for client in docker-compose.

    // Better strategy: Use a query param or cookie.
    // We will redirect to a special frontend route /auth/success?token=...
    res.redirect(`${frontendUrl}/?token=${token}`);
  }
);

// Calendar Events
router.get("/calendar/events", verifyToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.accessToken) {
      return res.status(400).json({ message: "User not connected to Google Calendar" });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json(response.data.items);
  } catch (error) {
    console.error("Calendar API Error:", error);
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
});

export default router;
