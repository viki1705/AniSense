# AniSense Project - Complete Context Guide

**Status:** ✅ Fully Complete & Tested | **Last Updated:** April 15, 2026

---

## 🚀 Quick Start (New Machine Setup)

### Prerequisites
- Python 3.8+ with pip
- Node.js & npm
- Ollama running with Llama3 model
- Git (already cloned)

### Run All Services
```bash
# Terminal 1: Start Backend (port 8000)
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Start Frontend (port 5173)
cd frontend
npm install (if needed)
npm run dev

# Terminal 3: Start Ollama (if not running)
ollama serve

# Browser
http://localhost:5173
```

---

## 📐 Architecture Overview

### Backend (FastAPI)
- **Location:** `backend/main.py`
- **Port:** 8000
- **Framework:** FastAPI with async support
- **Key Services (Singletons):**
  - `EmbeddingService`: Generates embeddings using sentence-transformers (gte-base, 768-dim)
  - `RAGService`: Retrieval-Augmented Generation pipeline
  - `LLMService`: Ollama integration with Llama3 8B model
- **Database:**
  - SQLite (`backend/anisense.db`): Stores watchlist
  - ChromaDB (`backend/chroma_db/`): Vector embeddings for 163 anime
- **API Routers (8 total endpoints):**
  - `/recommend/query` - Get recommendations with RAG explanation
  - `/recommend/by-anime` - Find similar anime
  - `/franchise/search` - Get franchise info
  - `/watchlist/*` - Add/remove/get watchlist

### Frontend (React + Vite)
- **Location:** `frontend/src/App.jsx`
- **Port:** 5173
- **Stack:** React 18, Vite, Tailwind CSS
- **Pages:**
  - Home: Search & quick recommendations
  - Chat: RAG interface with streaming responses
  - Explore: Browse all anime with franchise graph
  - Watchlist: Persistent user watchlist
- **Components:**
  - `Navbar.jsx`: Navigation & branding
  - `SearchBar.jsx`: Query input
  - `RecommendationCard.jsx`: Anime display
  - `ChatInterface.jsx`: RAG chat UI
  - `FranchiseGraph.jsx`: Visual franchise relationships

### Data Flow
```
User Query
  ↓
Frontend (React) 
  ↓
Backend API (FastAPI)
  ↓
EmbeddingService (Query → 768-dim vector)
  ↓
ChromaDB (Cosine similarity search → top 5 anime)
  ↓
LLMService (Ollama/Llama3 → explanation)
  ↓
Frontend (Display + cache)
```

---

## 🔑 Key Configuration

### Backend Environment (`.env`)
```
EMBEDDING_MODEL=thenlper/gte-base
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3
FRONTEND_URL=http://localhost:5173
```

### CORS Configuration (`backend/main.py`, lines 13-18)
```python
CORSMiddleware(
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    max_age=3600
)
```
✅ **Status:** OPTIONS preflight requests working correctly

---

## 📊 Database Schema

### Watchlist Table (SQLite)
```sql
CREATE TABLE watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anime_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### ChromaDB Collection
- **Name:** "anime"
- **Distance Metric:** Cosine
- **Embeddings:** 768-dimensional (gte-base)
- **Sample Records:** 163 anime with title, genres, rating, synopsis, episodes

---

## ⚡ Performance Metrics

| Component | Time | Status |
|-----------|------|--------|
| Retrieval (ChromaDB) | 20-50ms | ✅ Fast |
| LLM Generation (Llama3) | 1500-2500ms | ✅ Stable |
| Total RAG Pipeline | ~2.1s | ✅ Within target |

**Note:** Times may vary on RTX 3050 (should be faster than i7 CPU)

---

## 🐛 Known Issues & Solutions

### 1. LLM Timeout (CRITICAL FIX - APPLIED)
**Issue:** Responses timing out, returning fallback explanations
**Root Cause:** Default 10s timeout too short for full-precision Llama3
**Solution:** 
- File: `backend/services/llm_service.py` line 24
- Changed: `self.timeout_seconds = 10` → `self.timeout_seconds = 50`
- Status: ✅ VERIFIED - Full explanations now generated

### 2. CORS Preflight Errors (CRITICAL FIX - APPLIED)
**Issue:** OPTIONS requests returning 400 Bad Request
**Root Cause:** CORSMiddleware not configured for preflight
**Solution:**
- File: `backend/main.py` lines 13-18
- Changed: Explicit allow_methods including "OPTIONS"
- Status: ✅ VERIFIED - CORS working

### 3. ChromaDB Empty on Fresh Deploy
**Solution:** Run data loader
```bash
cd backend/data
python load_anime_only.py
```

### 4. Ollama Not Running
**Solution:** 
```bash
# In separate terminal
ollama serve
# Model will download on first use (4.7GB)
```

### 5. Port Conflicts
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📂 Directory Structure

```
IMS/
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Configuration
│   ├── anisense.db                  # SQLite watchlist DB
│   ├── chroma_db/                   # ChromaDB vector store
│   ├── services/
│   │   ├── embedding_service.py     # Embedding generation
│   │   ├── rag_service.py           # RAG pipeline
│   │   └── llm_service.py           # Ollama integration
│   ├── routers/
│   │   ├── recommend.py             # Recommendation endpoints
│   │   ├── franchise.py             # Franchise endpoints
│   │   └── watchlist.py             # Watchlist endpoints
│   ├── data/
│   │   ├── anime_clean.csv          # Anime dataset (163 records)
│   │   └── load_anime_only.py       # Data loader script
│   └── tests/
│       └── test_rag_pipeline.py     # RAG performance tests
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main React component
│   │   ├── index.css                # Tailwind styles
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Chat.jsx             # RAG chat interface
│   │   │   ├── Explore.jsx          # Anime browser
│   │   │   └── Watchlist.jsx        # User watchlist
│   │   └── components/
│   │       ├── Navbar.jsx           # Navigation
│   │       ├── SearchBar.jsx        # Search input
│   │       ├── RecommendationCard.jsx
│   │       ├── ChatInterface.jsx
│   │       └── FranchiseGraph.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── public/
│
└── PROJECT_CONTEXT.md               # (This file)
```

---

## 🧪 Testing

### Run RAG Pipeline Tests
```bash
cd backend
python -m pytest tests/test_rag_pipeline.py -v
```

### Test Coverage
- ✅ 10 diverse queries tested
- ✅ Performance benchmarking
- ✅ All queries return relevant results within 3-second target

---

## 🎨 Frontend Features

### Theme
- **Default:** Dark mode with glass morphism
- **Colors:** Custom Tailwind palette with anime-inspired gradients
- **Responsive:** Mobile-first design, works on all screen sizes

### Chat Features
- Real-time recommendations
- Explanation-based results
- Watchlist integration
- Franchise relationship visualization

---

## 📝 API Response Format

### Recommendations Endpoint
**Request:** `POST /recommend/query`
```json
{
  "query": "dark fantasy"
}
```

**Response:**
```json
{
  "query": "dark fantasy",
  "retrieved_anime": [
    {
      "title": "Berserk",
      "genres": ["Dark", "Fantasy"],
      "rating": 8.7,
      "synopsis": "...",
      "episodes": 24,
      "similarity_score": 0.92
    }
  ],
  "explanation": "I found Berserk as it...",
  "timestamp": "2026-04-15T10:30:00Z"
}
```

---

## 🔄 Development Workflow

### Making Changes
1. **Backend:** Changes auto-reload with `--reload` flag
2. **Frontend:** Vite auto-refreshes on save
3. **Database:** Changes persist to SQLite/ChromaDB

### Adding New Anime
```bash
# Edit backend/data/anime_clean.csv
# Then run:
python backend/data/load_anime_only.py
```

### Adding New Recommendations Criteria
1. Edit `backend/services/rag_service.py`
2. Modify retrieval logic or filter parameters
3. Automatically picked up by next request

---

## 🎯 Success Criteria (All Met)
- ✅ Response time < 3 seconds
- ✅ Frontend displays correctly
- ✅ Watchlist persistence working
- ✅ All pages navigate properly
- ✅ Dark theme matches spec
- ✅ RAG tests passing
- ✅ No console errors
- ✅ Responsive design
- ✅ CORS properly configured
- ✅ Project structure clean

---

## 💡 Tips for Using on Friend's Laptop (RTX 3050)

### GPU Acceleration
- RTX 3050 will significantly speed up:
  - Embedding generation (EmbeddingService)
  - ChromaDB similarity search
  - Ollama LLM inference (if configured with CUDA)
  
### Expected Performance Improvements
- Embedding: 50-100ms → 20-30ms
- LLM generation: 1500-2500ms → 500-1500ms
- Total latency: 2.1s → 0.7-1.2s

### Ollama GPU Setup (Optional)
```bash
# Ollama will auto-detect CUDA on Windows
# Just run: ollama serve
# Model will use GPU automatically
```

---

## 📞 Troubleshooting Checklist

- [ ] Backend running on port 8000?
- [ ] Frontend running on port 5173?
- [ ] Ollama serving on localhost:11434?
- [ ] ChromaDB populated with anime data?
- [ ] No console errors in browser DevTools?
- [ ] Can add/remove items from watchlist?
- [ ] All four pages accessible in navbar?

---

## 🔗 Quick References

- **Main Backend:** `backend/main.py`
- **Main Frontend:** `frontend/src/App.jsx`
- **Anime Data:** `backend/data/anime_clean.csv`
- **Vector DB:** `backend/chroma_db/`
- **Tests:** `backend/tests/test_rag_pipeline.py`
- **Config:** `backend/.env`

---

## 📅 Project Timeline

- **Created:** March 24, 2026
- **Last Working Commit:** April 6, 2026
- **LLM Timeout Fix:** April 5, 2026
- **CORS Fix:** April 6, 2026
- **Directory Cleanup:** April 6, 2026 (20+ files deleted, frontend moved to root)

---

## 🎓 Learning Notes

### RAG Pipeline Flow
1. User enters query
2. EmbeddingService converts to 768-dim vector
3. ChromaDB returns top 5 similar anime (cosine distance)
4. LLMService generates explanation using Ollama
5. Frontend displays results with watchlist option

### Why This Architecture?
- **Embeddings:** gte-base is optimized for semantic search
- **ChromaDB:** Fast, lightweight vector DB with persistence
- **Ollama:** Local LLM means no API costs, full privacy
- **FastAPI:** Async support for concurrent requests
- **React:** Modern, responsive UI with real-time updates

---

**For questions or new machine setup, refer back to this document. It contains everything needed to understand and continue development.**
