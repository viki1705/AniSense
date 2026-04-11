import time
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from services.rag_service import rag_service
from services.llm_service import llm_service


def test_rag_pipeline():
    """Test RAG pipeline with various queries"""
    queries = [
        "dark fantasy anime",
        "psychological thriller",
        "slice of life comedy",
        "action adventure shounen",
        "sci-fi mecha",
        "supernatural school drama",
        "romance with time travel",
        "historical adventure",
        "musical comedy",
        "post-apocalyptic world",
    ]

    print("[TEST] RAG Pipeline Testing")
    print("=" * 60)

    retrieval_times = []
    generation_times = []
    total_times = []

    for i, query in enumerate(queries, 1):
        print(f"\n[QUERY {i}/10] {query}")

        start_retrieval = time.time()
        retrieved = rag_service.search(query, k=5)
        retrieval_time = time.time() - start_retrieval
        retrieval_times.append(retrieval_time)

        print(f"   [TIME] Retrieval: {retrieval_time*1000:.1f}ms")
        print(f"   [RESULTS] Retrieved {len(retrieved)} anime")

        if retrieved:
            for idx, anime in enumerate(retrieved[:3], 1):
                print(
                    f"      {idx}. {anime['title']} "
                    f"(similarity: {anime['similarity_score']:.3f})"
                )

        if retrieved:
            start_generation = time.time()
            explanation = llm_service.generate_recommendations(query, retrieved)
            generation_time = time.time() - start_generation
            generation_times.append(generation_time)

            print(f"   [TIME] Generation: {generation_time*1000:.1f}ms")
            print(f"   [EXPLANATION] {explanation[:100]}...")

            total_time = retrieval_time + generation_time
            total_times.append(total_time)
            print(f"   [TOTAL] {total_time*1000:.1f}ms")

            if total_time < 3:
                print("   [OK] Under 3 second target")
            else:
                print(f"   [WARN] Over 3 second target ({total_time:.2f}s)")

    print("\n" + "=" * 60)
    print("[SUMMARY] Statistics")
    print("=" * 60)

    if retrieval_times:
        print(
            f"Retrieval Time:"
            f"\n  Avg: {sum(retrieval_times)/len(retrieval_times)*1000:.1f}ms"
            f"\n  Min: {min(retrieval_times)*1000:.1f}ms"
            f"\n  Max: {max(retrieval_times)*1000:.1f}ms"
        )

    if generation_times:
        print(
            f"Generation Time:"
            f"\n  Avg: {sum(generation_times)/len(generation_times)*1000:.1f}ms"
            f"\n  Min: {min(generation_times)*1000:.1f}ms"
            f"\n  Max: {max(generation_times)*1000:.1f}ms"
        )

    if total_times:
        avg_total = sum(total_times) / len(total_times)
        print(
            f"Total Time (Retrieval + Generation):"
            f"\n  Avg: {avg_total*1000:.1f}ms ({avg_total:.2f}s)"
            f"\n  Min: {min(total_times)*1000:.1f}ms ({min(total_times):.2f}s)"
            f"\n  Max: {max(total_times)*1000:.1f}ms ({max(total_times):.2f}s)"
        )

        under_target = sum(1 for t in total_times if t < 3)
        print(f"\nQueries under 3 second target: {under_target}/{len(total_times)}")

    print("\n[SUCCESS] RAG Pipeline test complete")


if __name__ == "__main__":

    count = rag_service.get_collection_count()
    if count == 0:
        print("[ERROR] ChromaDB is empty. Run load_to_chromadb.py first")
        sys.exit(1)

    print(f"[OK] ChromaDB collection contains {count} documents")
    test_rag_pipeline()
