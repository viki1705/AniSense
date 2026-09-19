<div align="center">
  <h1>🎌 AniSense</h1>
  <p><strong>AI-Powered Anime Recommendation Engine with RAG &amp; Personalization</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
    <img src="https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
    <img src="https://img.shields.io/badge/Ollama-Llama3-black?style=for-the-badge&logo=ollama&logoColor=white"/>
    <img src="https://img.shields.io/badge/ChromaDB-0.4+-orange?style=for-the-badge"/>
    <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-project-structure">Project Structure</a>
  </p>
</div>

---

## ✨ What is AniSense?

AniSense is a **locally-run, privacy-first anime recommendation system** that combines the power of **Retrieval-Augmented Generation (RAG)** with a **personalized user preference engine**. Instead of simple keyword matching, AniSense understands the *semantic meaning* of your query — so asking for *"dark psychological thriller"* actually finds anime that feel dark and psychological, not just ones with those words in the title.

All AI inference runs **100% locally** via [Ollama](https://ollama.com/), meaning zero API costs and full data privacy.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🧠 **RAG Pipeline** | Semantic search with `gte-base` embeddings + ChromaDB vector store |
| 🤖 **Local LLM** | Llama 3 8B via Ollama — natural language explanations, no cloud dependency |
| 🎯 **Personalized Recommendations** | Onboarding flow captures genre/theme preferences with intelligent score boosting |
| 📈 **Interaction Learning** | Likes/dislikes automatically refine future recommendations |
| 📺 **Watchlist** | Persistent SQLite-backed watchlist with add/remove/view |
| 🔍 **Semantic Search** | 768-dimensional embeddings for cosine similarity retrieval |
| 🎨 **Dark Glassmorphism UI** | Animated React frontend with Framer Motion transitions |
| ⚡ **GPU Acceleration** | Auto-detects NVIDIA CUDA for faster embeddings and LLM inference |
| 🌐 **Franchise Graph** | Visual anime franchise relationship explorer |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AniSense System                           │
│                                                             │
│  ┌──────────────┐      ┌────────────────────────────────┐   │
│  │   React UI   │ ───► │         FastAPI Backend         │   │
│  │  (Port 5173) │      │          (Port 8000)            │   │
│  └──────────────┘      │                                │   │
│                         │  ┌──────────────────────────┐ │   │
│                         │  │      RAG Pipeline        │ │   │
│                         │  │  Query → Embeddings      │ │   │
│                         │  │     (gte-base 768-dim)   │ │   │
│                         │  │  ChromaDB Vector Search  │ │   │
│                         │  │  LLMService → Llama3     │ │   │
│                         │  └──────────────────────────┘ │   │
│                         │                                │   │
│                         │  ┌──────────┐  ┌───────────┐  │   │
│                         │  │  SQLite  │  │ ChromaDB  │  │   │
│                         │  │Watchlist │  │163 anime  │  │   │
│                         │  │  Users   │  │ vectors   │  │   │
│                         │  └──────────┘  └───────────┘  │   │
│                         └────────────────────────────────┘   │
│                                                             │
│                    ┌──────────────────┐                      │
│                    │  Ollama Server   │                      │
│                    │  (Port 11434)    │                      │
│                    └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query
  ↓
React Frontend (Vite + TailwindCSS)
  ↓  HTTP POST
FastAPI Backend
  ↓
EmbeddingService  →  768-dim vector (thenlper/gte-base)
  ↓
ChromaDB          →  Top-K similar anime (cosine distance)
  ↓
PersonalizationService  →  Preference boosting & filtering
  ↓
LLMService (Ollama/Llama3)  →  Natural language explanation
  ↓
JSON Response
  ↓
React UI  →  Animated recommendation cards
```

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — Async Python web framework
- **[ChromaDB](https://www.trychroma.com/)** — Local vector database with HNSW index
- **[sentence-transformers](https://www.sbert.net/)** — `thenlper/gte-base` for 768-dim embeddings
- **[Ollama](https://ollama.com/)** — Local LLM runtime (Llama 3 8B)
- **[LangChain](https://www.langchain.com/)** — LLM orchestration utilities
- **SQLite** — Lightweight persistent storage for watchlists & user profiles
- **PyTorch** — Tensor operations (CUDA-accelerated when available)

### Frontend
- **[React 18](https://react.dev/)** — Component-based UI
- **[Vite 5](https://vitejs.dev/)** — Lightning-fast dev server & bundler
- **[Tailwind CSS 3](https://tailwindcss.com/)** — Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — Fluid animations & page transitions
- **[React Router 6](https://reactrouter.com/)** — Client-side routing
- **[Axios](https://axios-http.com/)** — HTTP client
- **[Lucide React](https://lucide.dev/)** — Icon library

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **[Ollama](https://ollama.com/download)** installed and running
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/viki1705/AniSense.git
cd AniSense
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# For NVIDIA GPU acceleration (optional but recommended)
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

### 3. Configure Environment

```bash
# Edit the .env file in the backend directory
```

`backend/.env` contents:
```env
EMBEDDING_MODEL=thenlper/gte-base
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3
FRONTEND_URL=http://localhost:5173
```

### 4. Load Anime Data into ChromaDB

```bash
# From the backend/data directory
cd data
python load_anime_only.py
```

> This populates ChromaDB with 163 anime titles, their genres, synopses, and pre-computed embeddings.

### 5. Pull the Llama 3 Model

```bash
ollama pull llama3
```

> First-time download is ~4.7 GB. Subsequent runs are instant.

### 6. Frontend Setup

```bash
cd ../frontend
npm install
```

### 7. Start All Services

**Option A — One-click (Windows PowerShell):**
```powershell
# From the project root
.\start_system.ps1
```

**Option B — Manual (3 terminals):**

```bash
# Terminal 1: Ollama LLM Server
ollama serve

# Terminal 2: FastAPI Backend
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 3: React Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser. 🎉

---

## 📂 Project Structure

```
AniSense/
│
├── backend/                        # FastAPI backend
│   ├── main.py                     # App entry point, startup health checks
│   ├── config.py                   # Pydantic settings (env vars)
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Environment config (not committed)
│   │
│   ├── routers/                    # API route handlers
│   │   ├── recommend.py            # /recommend/* endpoints
│   │   ├── franchise.py            # /franchise/* endpoints
│   │   ├── watchlist.py            # /api/watchlist/* endpoints
│   │   └── user_preferences.py     # /api/users/* onboarding & prefs
│   │
│   ├── services/                   # Business logic layer
│   │   ├── embeddings.py           # Sentence-transformer wrapper
│   │   ├── rag_service.py          # ChromaDB search & retrieval
│   │   ├── llm_service.py          # Ollama/Llama3 integration
│   │   ├── personalization_service.py  # Preference boosting engine
│   │   └── gpu_utils.py            # CUDA device detection
│   │
│   ├── models/                     # Data layer
│   │   ├── database.py             # SQLite ORM (Users, Watchlist, Interactions)
│   │   └── schemas.py              # Pydantic request/response models
│   │
│   ├── data/                       # Anime dataset
│   │   ├── anime_clean.csv         # Cleaned anime dataset
│   │   └── load_anime_only.py      # ChromaDB data loader script
│   │
│   └── tests/
│       └── test_rag_pipeline.py    # RAG performance & correctness tests
│
├── frontend/                       # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   │
│   └── src/
│       ├── App.jsx                 # Root component & routing
│       ├── main.jsx                # React DOM entry point
│       ├── index.css               # Global styles + Tailwind
│       │
│       ├── pages/
│       │   ├── Home.jsx            # Landing page with search
│       │   ├── Dashboard.jsx       # Personalized recommendation feed
│       │   ├── Onboarding.jsx      # Multi-step preference setup
│       │   ├── Explore.jsx         # Browse all anime
│       │   ├── Chat.jsx            # RAG chat interface
│       │   ├── Watchlist.jsx       # User watchlist management
│       │   └── Settings.jsx        # User preference settings
│       │
│       ├── components/
│       │   ├── Navbar.jsx              # Navigation & branding
│       │   ├── RecommendationCard.jsx  # Anime display card
│       │   ├── ChatInterface.jsx       # Streaming chat UI
│       │   ├── AnimeDetailModal.jsx    # Full anime info modal
│       │   ├── SearchBar.jsx           # Semantic search input
│       │   ├── FranchiseGraph.jsx      # Franchise relationship viz
│       │   └── onboarding/             # Step-based onboarding components
│       │       ├── WelcomeStep.jsx
│       │       ├── GenreStep.jsx
│       │       ├── ThemeStep.jsx
│       │       └── CompletionStep.jsx
│       │
│       ├── contexts/
│       │   └── UserContext.jsx     # Global user state & preferences
│       │
│       └── services/               # API client functions
│
├── Champion.csv                    # Source anime dataset
├── start_system.ps1                # Windows one-click startup script
└── README.md
```

---

## 🔌 API Reference

### Health Check
```http
GET /health
```
Returns status of all services (ChromaDB, Ollama, Embeddings).

---

### Recommendations

#### Semantic Search Recommendations
```http
POST /recommend/query
Content-Type: application/json

{
  "query": "dark psychological thriller with mind games"
}
```
**Response:**
```json
{
  "query": "dark psychological thriller with mind games",
  "retrieved_anime": [
    {
      "title": "Death Note",
      "genres": "Mystery, Supernatural, Thriller",
      "rating": 8.62,
      "synopsis": "...",
      "episodes": 37,
      "similarity_score": 0.9234
    }
  ],
  "explanation": "These anime were selected because...",
  "timestamp": "2026-04-15T10:30:00Z"
}
```

#### Find Similar Anime
```http
POST /recommend/by-anime
Content-Type: application/json

{
  "anime_title": "Attack on Titan",
  "limit": 5
}
```

---

### Personalized Recommendations
```http
POST /api/users/recommendations/personalized
Content-Type: application/json

{
  "user_id": "user_1234",
  "query": "optional override query",
  "limit": 12
}
```

---

### Onboarding Flow

| Step | Endpoint | Payload | Description |
|------|----------|---------|-------------|
| 1 | `POST /api/users/onboarding/start` | `{ user_id, username }` | Create user account |
| 2 | `POST /api/users/onboarding/genres` | `{ user_id, genres[] }` | Save 3–5 favorite genres |
| 3 | `POST /api/users/onboarding/themes` | `{ user_id, themes[] }` | Save 2–5 mood/themes |
| 4 | `POST /api/users/onboarding/complete` | `{ user_id }` | Finalize & get first recs |

---

### Watchlist

```http
POST   /api/watchlist/add        # Add anime to watchlist
DELETE /api/watchlist/remove     # Remove from watchlist
GET    /api/watchlist            # Get full watchlist
```

---

### User Preferences

```http
GET  /api/users/preferences/{user_id}     # Get preferences
PUT  /api/users/preferences/{user_id}     # Update preferences
POST /api/users/interactions              # Record like/dislike/view
GET  /api/users/interactions/{user_id}   # Get interaction history
GET  /api/users/search/autocomplete?q=   # Anime title autocomplete
```

---

## 📊 Performance

| Component | CPU Latency | GPU Latency | Notes |
|-----------|-------------|-------------|-------|
| Embedding generation | 50–100ms | 20–30ms | `thenlper/gte-base`, 768-dim |
| ChromaDB retrieval | 20–50ms | 20–50ms | Cosine HNSW index |
| Llama 3 generation | 1500–2500ms | 500–1500ms | Full natural language explanation |
| **Total RAG Pipeline** | **~2.1s** | **~0.7s** | End-to-end |

> GPU benchmarks based on NVIDIA RTX 3050. Ollama auto-detects CUDA on Windows.

---

## 🗄️ Database Schema

### SQLite Tables

- **`users`** — User accounts and onboarding state
- **`user_preferences`** — JSON-serialized genre/theme/setting preferences
- **`user_interactions`** — Timestamped like/dislike/view events
- **`watchlist`** — Persistent per-user watchlist

```sql
CREATE TABLE watchlist (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    anime_id    INTEGER NOT NULL,
    title       TEXT NOT NULL,
    added_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ChromaDB Collection

| Property | Value |
|----------|-------|
| Collection name | `anime` |
| Distance metric | Cosine |
| Embedding model | `thenlper/gte-base` |
| Dimensions | 768 |
| Documents | 163 anime titles |
| Metadata fields | title, genres, themes, synopsis, rating, episodes, type |

---

## 🧪 Testing

```bash
cd backend

# Run RAG pipeline tests
python -m pytest tests/test_rag_pipeline.py -v

# Health check the running API
curl http://localhost:8000/health
```

Test coverage includes:
- ✅ 10 diverse semantic queries
- ✅ Response latency benchmarking (< 3s target)
- ✅ Similarity score validation
- ✅ ChromaDB retrieval accuracy

---

## 🎛️ Configuration

All configuration is managed via `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_MODEL` | `thenlper/gte-base` | HuggingFace embedding model |
| `OLLAMA_API_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3` | LLM model name |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |

---

## 🐛 Troubleshooting

<details>
<summary><strong>ChromaDB is empty — no recommendations appear</strong></summary>

Run the data loader:
```bash
cd backend/data
python load_anime_only.py
```
</details>

<details>
<summary><strong>Ollama not reachable / LLM responses missing</strong></summary>

Make sure Ollama is running and the model is pulled:
```bash
ollama serve
ollama pull llama3
```
</details>

<details>
<summary><strong>Recommendations timing out</strong></summary>

The default LLM timeout is 50 seconds. If on slow hardware, increase it in `backend/services/llm_service.py`:
```python
self.timeout_seconds = 90  # increase as needed
```
</details>

<details>
<summary><strong>Port already in use</strong></summary>

```bash
# macOS / Linux
lsof -ti:8000 | xargs kill -9   # Backend
lsof -ti:5173 | xargs kill -9   # Frontend

# Windows PowerShell
netstat -ano | findstr :8000    # Find PID
taskkill /PID <pid> /F
```
</details>

<details>
<summary><strong>CORS errors in browser console</strong></summary>

Ensure `backend/.env` has `FRONTEND_URL=http://localhost:5173` and restart the backend server.
</details>

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ using FastAPI, React, ChromaDB, and Ollama</p>
  <p><strong>AniSense</strong> — Because finding your next favourite anime shouldn't feel like a chore.</p>
</div>
