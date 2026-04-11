from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import recommend, franchise, watchlist, user_preferences
from services import rag_service, llm_service, embedding_service, gpu_utils
import requests

app = FastAPI(title="AniSense API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(recommend.router)
app.include_router(franchise.router)
app.include_router(watchlist.router)
app.include_router(user_preferences.router)


@app.on_event("startup")
async def startup_event():
    """Warm up services on startup"""
    print("[STARTUP] Initializing AniSense services...")

    # Check GPU
    device_info = gpu_utils.get_device_info()
    print(f"[STARTUP] Computing Device: {device_info['device'].upper()}")
    if device_info['available']:
        print(f"[STARTUP]   GPU: {device_info['device_name']}")
        print(f"[STARTUP]   Memory: {device_info['memory_gb']}GB")
        print(f"[STARTUP]   Compute Capability: {device_info['compute_capability']}")
    print(f"[STARTUP]   Batch Size: {device_info['batch_size']}")

    # Check ChromaDB
    collection_count = rag_service.get_collection_count()
    if collection_count == 0:
        print("[WARN] ChromaDB collection is empty. Run load_to_chromadb.py")
    else:
        print(f"[OK] ChromaDB collection: {collection_count} documents")

    # Check Ollama connectivity
    try:
        response = requests.get(
            f"{settings.ollama_base_url}/api/tags",
            timeout=5
        )
        if response.status_code == 200:
            print(f"[OK] Ollama available at {settings.ollama_base_url}")
        else:
            print("[WARN] Ollama responded but with unexpected status")
    except requests.RequestException as e:
        print(f"[WARN] Ollama not reachable: {e}")

    # Verify embedding model
    try:
        test_embedding = embedding_service.embed_text("test")
        if test_embedding:
            print(f"[OK] Embedding model loaded: {settings.embedding_model}")
        else:
            print("[WARN] Embedding model returned empty result")
    except Exception as e:
        print(f"[WARN] Embedding model error: {e}")

    print("[STARTUP] Initialization complete")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AniSense API v1.0"}


@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    health_status = {
        "status": "healthy",
        "services": {}
    }

    # Check ChromaDB
    try:
        collection_count = rag_service.get_collection_count()
        health_status["services"]["chromadb"] = {
            "status": "healthy" if collection_count > 0 else "degraded",
            "documents": collection_count
        }
    except Exception as e:
        health_status["services"]["chromadb"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    # Check Ollama
    try:
        response = requests.get(
            f"{settings.ollama_base_url}/api/tags",
            timeout=5
        )
        health_status["services"]["ollama"] = {
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "url": settings.ollama_base_url
        }
    except Exception as e:
        health_status["services"]["ollama"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    # Check Embeddings
    try:
        test_embedding = embedding_service.embed_text("health")
        health_status["services"]["embeddings"] = {
            "status": "healthy" if test_embedding else "unhealthy",
            "model": settings.embedding_model
        }
    except Exception as e:
        health_status["services"]["embeddings"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    # Set overall status based on critical services
    if health_status["services"]["chromadb"]["status"] == "unhealthy":
        health_status["status"] = "unhealthy"
    elif health_status["services"]["ollama"]["status"] == "unhealthy":
        health_status["status"] = "degraded"

    return health_status


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
