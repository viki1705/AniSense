from sentence_transformers import SentenceTransformer
from typing import List
from config import settings
from services import gpu_utils
from tqdm import tqdm


class EmbeddingService:
    """Service for generating embeddings using sentence-transformers with GPU acceleration"""

    def __init__(self, model_name: str = settings.embedding_model):
        """Initialize embedding service with GPU detection"""
        try:
            # Detect optimal device
            self.device = gpu_utils.get_optimal_device()
            self.gpu_available = gpu_utils.can_use_gpu()

            # Load model on detected device
            self.model = SentenceTransformer(model_name, device=self.device)
            self.model_name = model_name

            # Get optimal batch size for device
            self.batch_size = gpu_utils.get_optimal_batch_size(self.device)

            device_info = gpu_utils.get_device_info()
            print(f"[INIT] EmbeddingService initialized")
            print(f"[INIT]   Model: {model_name}")
            print(f"[INIT]   Device: {self.device.upper()}")
            if self.gpu_available:
                print(f"[INIT]   GPU: {device_info['device_name']}")
                print(f"[INIT]   Memory: {device_info['memory_gb']}GB")
            print(f"[INIT]   Batch size: {self.batch_size}")

        except Exception as e:
            print(f"[ERROR] Failed to initialize EmbeddingService: {e}")
            print(f"[WARN] Falling back to CPU")
            self.device = "cpu"
            self.gpu_available = False
            self.model = SentenceTransformer(model_name, device="cpu")
            self.model_name = model_name
            self.batch_size = 32

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for single text"""
        if not text or not text.strip():
            return []
        try:
            embedding = self.model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        except Exception as e:
            print(f"[ERROR] Error generating embedding: {e}")
            return []

    def embed_batch(self, texts: List[str], show_progress: bool = False) -> List[List[float]]:
        """Generate embeddings for multiple texts with GPU optimization"""
        if not texts:
            return []

        # Filter empty texts
        texts = [t for t in texts if t and t.strip()]
        if not texts:
            return []

        all_embeddings = []
        current_batch_size = self.batch_size

        # Process in batches with error recovery
        try:
            num_batches = (len(texts) + current_batch_size - 1) // current_batch_size

            if show_progress:
                batch_iterator = tqdm(
                    range(0, len(texts), current_batch_size),
                    total=num_batches,
                    desc="Embedding",
                    unit="batch"
                )
            else:
                batch_iterator = range(0, len(texts), current_batch_size)

            for batch_start in batch_iterator:
                batch_end = min(batch_start + current_batch_size, len(texts))
                batch_texts = texts[batch_start:batch_end]

                try:
                    batch_embeddings = self.model.encode(batch_texts, convert_to_tensor=False)
                    all_embeddings.extend(batch_embeddings.tolist())

                except RuntimeError as e:
                    # Handle CUDA Out of Memory
                    if "out of memory" in str(e).lower() and self.device == "cuda":
                        print(f"[WARN] CUDA OOM, reducing batch size from {current_batch_size} to {current_batch_size // 2}")
                        current_batch_size = max(4, current_batch_size // 2)

                        # Retry this batch with smaller size
                        for retry_start in range(batch_start, batch_end, current_batch_size):
                            retry_end = min(retry_start + current_batch_size, batch_end)
                            retry_texts = texts[retry_start:retry_end]

                            try:
                                retry_embeddings = self.model.encode(retry_texts, convert_to_tensor=False)
                                all_embeddings.extend(retry_embeddings.tolist())
                            except RuntimeError:
                                # Still failing on GPU, fall back to CPU
                                print(f"[WARN] Persistent GPU OOM, using CPU for remaining batches")
                                if self.device == "cuda":
                                    self.model.to("cpu")
                                    self.device = "cpu"
                                    retry_embeddings = self.model.encode(retry_texts, convert_to_tensor=False)
                                    all_embeddings.extend(retry_embeddings.tolist())
                    else:
                        raise

        except Exception as e:
            print(f"[ERROR] Error generating batch embeddings: {e}")
            # Return partial results if available
            if all_embeddings:
                print(f"[WARN] Partial results: {len(all_embeddings)}/{len(texts)} embeddings generated")

        return all_embeddings

    def compute_similarity(self, text1: str, text2: str) -> float:
        """Compute similarity between two texts"""
        try:
            embeddings = self.model.encode([text1, text2], convert_to_tensor=True)
            similarity = (
                embeddings[0] @ embeddings[1].T / (embeddings[0].norm() * embeddings[1].norm())
            )
            return float(similarity)
        except Exception as e:
            print(f"[ERROR] Error computing similarity: {e}")
            return 0.0


# Singleton instance
embedding_service = EmbeddingService()
