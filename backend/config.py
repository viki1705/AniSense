from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from .env file"""

    # Ollama Configuration
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # ChromaDB Configuration
    chromadb_persist_dir: str = "./chroma_db"

    # Embedding Model
    embedding_model: str = "thenlper/gte-base"

    # RAG Configuration
    top_k: int = 5
    temperature: float = 0.7

    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:5173"

    # GPU Configuration
    device: str = "auto"  # "auto", "cuda", or "cpu"
    force_cpu: bool = False  # Force CPU only
    embedding_batch_size_gpu: int = 64  # Batch size for GPU
    embedding_batch_size_cpu: int = 32  # Batch size for CPU
    max_gpu_memory_gb: float = 2.0  # Max GPU memory to allocate

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

