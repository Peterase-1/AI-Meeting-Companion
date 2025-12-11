# AI Meeting Companion - User Guide

Welcome to the **AI Meeting Companion**! This tool helps you capture, analyze, and extract insights from your meetings using advanced AI.

## 1. Getting Started

### Creating an Account / Logging In
You can explore the interface as a guest, but to **process data** or **save results**, you must be logged in.

1.  Click the **Log in** button in the top right corner (person icon).
2.  In the popup window:
    *   **New User?** Click the "Register" tab. Enter your Name, Email, and Password.
    *   **Returning User?** Stick to the "Login" tab and enter your credentials.
3.  Once logged in, your name will appear in the top right corner.

---

## 2. Capturing Meeting Data

You have three ways to provide meeting content for analysis:

### Option A: Upload File (Recommended)
Best for pre-recorded meetings or existing documents.
1.  Go to the **"Upload File"** tab.
2.  Drag and drop your file or click **"Select File"**.
    *   *Supported Audio*: `.mp3`, `.m4a`
    *   *Supported Text*: `.txt`, `.docx`, `.pdf`
3.  Click **"Process Uploaded File"**. The AI will transcribe (if audio) and analyze the content.

### Option B: Paste Text
Best for copying notes from another app (e.g., Zoom, Teams, Google Docs).
1.  Go to the **"Paste Text"** tab.
2.  Paste your transcript or meeting notes into the text box.
3.  Click **"Process Text"**.

### Option C: Live Transcript (Microphone)
Best for real-time meetings.
1.  Go to the **"Live Transcript"** tab.
2.  Click the big **Microphone** button.
    *   *Note: You must allow microphone permissions. If you are not on `localhost`, you must be using HTTPS.*
3.  Speak or let the meeting play. Text will appear in real-time.
4.  Click the Microphone again to stop.
5.  Click **"Process Recording"** to analyze the captured text.

---

## 3. Analyzing Results

Once processing is complete, the application will scroll down to the **"Meeting Insights"** section.

### 🏠 Summary Tab
*   **Overview**: A concise summary of the entire meeting.
*   **Key Points**: Bullet points of the most important takeaways.
*   **Sentiment**: Analysis of the meeting's tone (Positive/Neutral/Negative).

### 🕸️ Topics Tab (Interactive)
*   Visualizes the main topics discussed as a cluster map.
*   **Interact**: Click on bubbles to see how topics relate.
*   *Data Persistence*: This data is saved even if you switch tabs.

### 💬 Chat Assistant Tab
*   Have a conversation with your meeting!
*   **Ask questions**: "What did we decide about the budget?", "Who is responsible for marketing?"
*   *Data Persistence*: Your chat history is saved while you switch tabs.

### 📋 Action Plan Tab
*   Generates a structured list of tasks.
*   **Columns**: Action Item, Assignee, Priority, Due Date.
*   *Data Persistence*: The plan remains available while you switch tabs.

### 📤 Export Tab
*   Download your insights to share with the team.
*   **Download Report**: Get a Text file summary.
*   **Download Slides**: Generate a PowerPoint (.pptx) presentation.

---

## 4. Saving Your Work

*   **Save Meeting**: Click the "Save Meeting" button (often located near the results) to store the analysis in your history (Database).
*   **Previous Meetings**: (Coming Soon) Access your saved history from your profile.

---

## Troubleshooting

*   **"Microphone access blocked"**:
    *   Ensure you clicked "Allow" on the browser popup.
    *   If using a remote server, ensure you are accessing via `HTTPS`, or add the IP to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.
*   **"AI Usage Limit Reached"**:
    *   This means the backend AI service is temporarily busy or out of credits. Please try again in a few minutes.
