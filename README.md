# 🌌 Idea Bubbles

> **A personal, AI-powered universe for capturing, organizing, developing, and rediscovering ideas.**

Idea Bubbles transforms fleeting thoughts into living, interactive bubbles floating in an animated cosmic canvas. Designed around the principle: **"Capture now. Organize later. Develop whenever inspiration returns."**

---

## ✨ Features

- **🌌 Midnight Universe Canvas**: Translucent, softly glowing bubbles drifting with gentle 2D physics, collision handling, zoom, pan, and manual positioning.
- **⚡ Frictionless Capture**: Instant capture via typing, voice dictation (Web Speech API), URL pasting, or file uploads. Ideas are saved immediately—never blocked by AI latency.
- **🪐 The Idea Workspace**: Slide-in deep development panel featuring:
  - **Overview**: Title, raw thought, status (Spark, Exploring, Developing, Active Project, Archived), tags, and priority.
  - **Notes**: Chronological, markdown-supported progress entries.
  - **References**: Bookmark external links (YouTube, articles, papers) with safe SSRF-protected metadata preview cards.
  - **Tasks & Milestones**: Lightweight checklists to convert concepts into active projects.
  - **Connections**: Relate ideas to each other and visualize thought networks.
  - **Attachments**: Drag-and-drop file and image previews.
- **🤖 Dedicated AI Studio**:
  - Context-grounded **Chat with an Idea** using notes and references as memory.
  - Automatic summarization and expansion (directions, assumptions, next experiments).
  - Graceful fallback: 100% usable offline even without API keys!
- **🔭 Serendipitous Rediscovery**: Intelligently resurfaces dormant or forgotten ideas based on dormancy and thematic affinity.
- **🔍 Full-Text Search & List View**: Instant search and accessible list view for quick filtering by category, tag, or status.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, HTML5 Physics Canvas.
- **Backend**: Python 3.9+, FastAPI, SQLAlchemy 2.0 ORM, Alembic, Pydantic v2.
- **Database**: PostgreSQL (production) with automated SQLite fallback (zero-config local dev).
- **Authentication**: Stateless JWT with Bcrypt password hashing.
- **AI**: Modular provider service supporting Google Gemini, OpenAI, or local heuristic fallback.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 main.py
```
*Backend runs on `http://localhost:8000`. Interactive API documentation available at `http://localhost:8000/docs`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Running Backend Tests
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

---

## 📚 Living Technical Documentation

For the comprehensive guide explaining every architectural decision, data flows, database entity-relationship models, security considerations, and a step-by-step beginner's code walkthrough:

👉 See [**`MAJOR_DECISIONS_AND_IMPLEMENTATIONS.md`**](file:///Users/srishti/Projects/idea_bubbles/MAJOR_DECISIONS_AND_IMPLEMENTATIONS.md)
