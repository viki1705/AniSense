"""GPU performance testing and benchmarking"""
import sys
import time
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from services import gpu_utils, embedding_service
import pytest


class TestGPUDetection:
    """Test GPU detection functionality"""

    def test_cuda_detection(self):
        """Test CUDA detection works"""
        gpu_info = gpu_utils.detect_cuda_available()
        assert isinstance(gpu_info, dict)
        assert 'available' in gpu_info
        assert 'device' in gpu_info
        assert gpu_info['device'] in ('cuda', 'cpu') or gpu_info['available'] == False
        print(f"[TEST] GPU Detection: {gpu_info['device'].upper() if gpu_info['available'] else 'CPU'}")

    def test_optimal_device(self):
        """Test optimal device selection"""
        device = gpu_utils.get_optimal_device()
        assert device in ('cuda', 'cpu')
        print(f"[TEST] Optimal Device: {device.upper()}")

    def test_batch_size(self):
        """Test batch size selection"""
        device = gpu_utils.get_optimal_device()
        batch_size = gpu_utils.get_optimal_batch_size(device)
        assert isinstance(batch_size, int)
        assert batch_size > 0
        expected_size = 64 if device == 'cuda' else 32
        assert batch_size == expected_size
        print(f"[TEST] Batch Size ({device.upper()}): {batch_size}")

    def test_device_info(self):
        """Test device info retrieval"""
        info = gpu_utils.get_device_info()
        assert 'device' in info
        assert 'batch_size' in info
        print(f"[TEST] Device Info: {info}")


class TestEmbeddings:
    """Test embedding generation with GPU"""

    def test_single_embedding(self):
        """Test single text embedding"""
        text = "This is a test for embedding generation"
        embedding = embedding_service.embed_text(text)
        assert isinstance(embedding, list)
        assert len(embedding) == 768  # gte-base produces 768-dim vectors
        print(f"[TEST] Single Embedding: ✓ (768 dimensions)")

    def test_batch_embedding_small(self):
        """Test batch embedding with small batch"""
        texts = ["Test 1", "Test 2", "Test 3", "Test 4", "Test 5"]
        embeddings = embedding_service.embed_batch(texts)
        assert isinstance(embeddings, list)
        assert len(embeddings) == len(texts)
        for emb in embeddings:
            assert len(emb) == 768
        print(f"[TEST] Batch Embedding (5 texts): ✓")

    def test_batch_embedding_medium(self):
        """Test batch embedding with medium batch"""
        texts = [f"Sample text number {i}" for i in range(32)]
        embeddings = embedding_service.embed_batch(texts)
        assert len(embeddings) == 32
        print(f"[TEST] Batch Embedding (32 texts): ✓")

    def test_embedding_empty(self):
        """Test embedding with empty input"""
        embeddings = embedding_service.embed_batch([])
        assert embeddings == []
        print(f"[TEST] Empty Batch: ✓")


class TestPerformance:
    """Performance benchmarks"""

    def test_embedding_single_speed(self):
        """Benchmark single embedding speed"""
        text = "dark fantasy anime with complex characters and magical systems"
        device = embedding_service.device

        # Warm up
        embedding_service.embed_text(text)

        # Benchmark
        num_iterations = 10
        start = time.time()
        for _ in range(num_iterations):
            embedding_service.embed_text(text)
        elapsed = time.time() - start

        avg_time = (elapsed / num_iterations) * 1000  # ms
        print(f"[BENCH] Single Embedding ({device.upper()}): {avg_time:.2f}ms")

        # Reasonable expectations
        if device == 'cuda':
            assert avg_time < 50, f"GPU single embedding too slow: {avg_time}ms"
        else:
            assert avg_time < 200, f"CPU single embedding too slow: {avg_time}ms"

    def test_embedding_batch_speed(self):
        """Benchmark batch embedding speed"""
        texts = [f"Anime recommendation text {i}" for i in range(32)]
        device = embedding_service.device

        # Warm up
        embedding_service.embed_batch(texts)

        # Benchmark
        num_iterations = 3
        start = time.time()
        for _ in range(num_iterations):
            embedding_service.embed_batch(texts)
        elapsed = time.time() - start

        avg_time = (elapsed / num_iterations) * 1000  # ms
        print(f"[BENCH] Batch Embedding 32 ({device.upper()}): {avg_time:.2f}ms")

        # Reasonable expectations
        if device == 'cuda':
            assert avg_time < 500, f"GPU batch embedding too slow: {avg_time}ms"
        else:
            assert avg_time < 2000, f"CPU batch embedding too slow: {avg_time}ms"

    def test_embedding_batch_100_speed(self):
        """Benchmark larger batch embedding speed"""
        texts = [f"Anime text {i}" for i in range(100)]
        device = embedding_service.device

        # Warm up
        embedding_service.embed_batch(texts[:10])

        # Benchmark
        start = time.time()
        embeddings = embedding_service.embed_batch(texts)
        elapsed = time.time() - start

        avg_time = elapsed * 1000  # ms
        print(f"[BENCH] Batch Embedding 100 ({device.upper()}): {avg_time:.2f}ms ({elapsed:.2f}s)")

        # Reasonable expectations
        if device == 'cuda':
            assert avg_time < 1500, f"GPU batch 100 embedding too slow: {avg_time}ms"
        else:
            assert elapsed < 10, f"CPU batch 100 embedding too slow: {elapsed}s"


class TestErrorHandling:
    """Test error handling and recovery"""

    def test_embedding_with_empty_strings(self):
        """Test handling of empty strings in batch"""
        texts = ["Valid text", "", "Another valid text", "   ", None]
        # Filter None before passing
        texts = [t for t in texts if t is not None]
        embeddings = embedding_service.embed_batch(texts)
        # Should handle gracefully
        assert len(embeddings) > 0
        print(f"[TEST] Empty Strings Handling: ✓")

    def test_cpu_fallback(self):
        """Test CPU fallback works"""
        # This test just verifies CPU mode works
        device = gpu_utils.get_optimal_device()
        batch_size = gpu_utils.get_optimal_batch_size(device)
        assert batch_size > 0
        print(f"[TEST] CPU Fallback Available: ✓ (Device: {device.upper()})")


def print_benchmark_summary():
    """Print benchmark summary"""
    device_info = gpu_utils.get_device_info()
    print("\n" + "="*60)
    print("GPU/CPU BENCHMARK SUMMARY")
    print("="*60)
    print(f"Device: {device_info['device'].upper()}")
    print(f"Batch Size: {device_info['batch_size']}")
    if device_info['available']:
        print(f"GPU: {device_info['device_name']}")
        print(f"Memory: {device_info['memory_gb']}GB")
    print("="*60 + "\n")


if __name__ == "__main__":
    print_benchmark_summary()

    # Run tests
    pytest.main([__file__, "-v", "-s"])
