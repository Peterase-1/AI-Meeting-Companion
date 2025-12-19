# AI Meeting Companion

Transform your meetings with data-driven insights using the AI Meeting Companion. This advanced application leverages Artificial Intelligence to automatically transcribe, analyze, and summarize your meetings, converting chaotic discussions into structured, actionable data.

## Features

AI Meeting Companion is designed to be the ultimate productivity tool for modern teams, offering a suite of intelligent features.

### 1. Comprehensive Input Support
The system is built to handle data from any source.
*   **File Upload**: Drag and drop audio files (MP3, M4A) for automatic transcription or text documents (PDF, DOCX, TXT) for instant analysis.
*   **Live Recording**: Use the integrated microphone to capture real-time audio from in-person or virtual meetings, with live streaming transcription.
*   **Text Input**: Paste existing transcripts or notes directly for quick summarization.

### 2. Intelligent Summarization & Roles
Go beyond simple summaries with perspective-based analysis.
*   **Smart Summary**: Automatically extracts the core narrative, key points, and overall sentiment.
*   **Role-Based Views**: Toggle the summary perspective to suit your audience—choose from General, CEO (strategic), Engineer (technical), or Sales (client-focused).

### 3. Actionable Task Management
Turn conversation into execution.
*   **Action Item Extraction**: The AI identifies tasks, assignees, and deadlines, creating a structured table of "Who needs to do What".
*   **Gantt Chart Visualization**: Automatically projects timelines and task dependencies onto a visual Gantt chart, helping you plan the next steps immediately.

### 4. Advanced Topic Analysis
Understand the structure of your conversation.
*   **Cluster Map**: Visualizes the main topics of discussion and their relationships in an interactive node graph.
*   **Topic Drill-Down**: Click on any topic to explore specific details and context associated with that theme.

### 5. Interactive AI Assistant
Have a conversation with your meeting data.
*   **Q&A Interface**: Ask specific questions like "What was the budget for Q4?" or "Did we mention the client deadline?" and get accurate answers based on the transcript.

### 6. Multi-Language Support
Built for global teams with specific support for Amharic.
*   **Auto-Detection**: The system automatically detects Amharic language input.
*   **Bi-Lingual Output**: Generate summaries, slides, and reports in either English or Amharic with a single click.

### 7. Productivity Widgets
Tools to keep you organized.
*   **Calendar Integration**: View your upcoming schedule directly within the application profile.
*   **AI Proxy Attendee**: Simulate an AI agent that monitors meetings for you, listening for specific keywords or mentions.

## Technology Stack

This project is engineered for performance, scalability, and maintainability using a modern tech stack.

### Frontend
*   **React**: Component-based UI library.
*   **TypeScript**: Static typing for robust code.
*   **Vite**: Next-generation frontend tooling.
*   **Redux Toolkit**: Efficient state management.
*   **Tailwind CSS**: Utility-first styling framework.
*   **Shadcn UI**: Accessible component library.

### Backend
*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Fast web framework for API routing.
*   **Prisma**: Next-generation ORM for database management.
*   **PostgreSQL**: Reliable relational database.
*   **Multer**: Middleware for handling `multipart/form-data`.

### AI & Services
*   **OpenRouter**: Gateway to advanced LLMs.
*   **FileStack**: File management and uploading service.
*   **Web Speech API**: Native browser support for speech-to-text.

### DevOps & Deployment
*   **Docker**: Containerization for consistent environments.
*   **Docker Compose**: Multi-container orchestration.
*   **Nginx**: High-performance web server and reverse proxy.

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm (Node Package Manager)
*   Docker Desktop (optional, for containerized run)

### Local Development

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd ai-meeting-companion
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    cp .env.example .env
    # Configure your .env usage keys
    npm start
    ```

3.  **Client Setup**
    ```bash
    cd ../client
    npm install
    npm run dev
    ```

4.  **Access App**
    Open `http://localhost:6000` in your browser.

## Deployment

The application is fully containerized and ready for deployment.

1.  **Build and Push**
    Use the provided PowerShell script to build Docker images and push them to your registry.
    ```powershell
    .\scripts\build_and_push.ps1
    ```

2.  **Deploy on Server**
    Copy `docker-compose.yml` and `scripts/cleanup_and_deploy.sh` to your remote server and run:
    ```bash
    ./cleanup_and_deploy.sh
    ```

## License

Copyright © 2025 AI Meeting Companion. All rights reserved.
