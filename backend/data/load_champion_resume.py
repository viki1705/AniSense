"""Load champion.csv dataset - Resumable and optimized for faster loading"""
import os
import sys
import csv
import json
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from services import embedding_service, rag_service
from config import settings

def load_champion_data_resume(start_entry=0, max_entries=2000, show_progress=True):
    """
    Load champion.csv into ChromaDB with resume capability

    Args:
        start_entry: Start from this entry number (0-indexed)
        max_entries: Load up to this many total entries (0 = all)
        show_progress: Show tqdm progress bar
    """

    # CSV file path
    csv_path = Path(__file__).parent.parent.parent / "champion.csv"

    if not csv_path.exists():
        print(f"[ERROR] CSV file not found: {csv_path}")
        return False

    print(f"[LOAD] Reading champion.csv from: {csv_path}")
    print(f"[LOAD] Target: {max_entries} total entries")
    print(f"[LOAD] Starting from entry: {start_entry}")

    documents = []
    metadatas = []
    ids = []
    entries_loaded = 0

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for idx, row in enumerate(reader):
                # Skip entries before start_entry
                if idx < start_entry:
                    continue

                # Stop if we've reached max_entries
                if max_entries > 0 and idx >= max_entries:
                    break

                try:
                    title = row.get('TITLE', '').strip()
                    anime_type = row.get('TYPE', 'anime').lower().strip()
                    genres_str = row.get('GENRES', '[]').strip()
                    themes_str = row.get('THEMES', '[]').strip()
                    synopsis = row.get('SYNOPSIS', '').strip()
                    picture_url = row.get('MAIN_PICTURE', '').strip()

                    if not title or not synopsis:
                        continue

                    # Parse JSON arrays
                    try:
                        genres = json.loads(genres_str)
                        if isinstance(genres, list):
                            genres = ", ".join(genres)
                    except:
                        genres = genres_str

                    try:
                        themes = json.loads(themes_str)
                        if isinstance(themes, list):
                            themes = ", ".join(themes)
                    except:
                        themes = themes_str

                    # Create document for embedding
                    document = f"{title}. Genres: {genres}. Themes: {themes}. Synopsis: {synopsis}"

                    # Metadata
                    metadata = {
                        "title": title,
                        "type": anime_type,
                        "genres": genres,
                        "themes": themes,
                        "synopsis": synopsis,
                        "main_picture": picture_url,
                    }

                    documents.append(document)
                    metadatas.append(metadata)
                    ids.append(f"champion_{idx}")
                    entries_loaded += 1

                    if (entries_loaded) % 100 == 0:
                        print(f"[LOAD] Parsed {entries_loaded} entries (CSV row {idx})...")

                except Exception as e:
                    print(f"[WARN] Error processing row {idx}: {e}")
                    continue

        if not documents:
            print("[ERROR] No valid documents found in CSV")
            return False

        print(f"[LOAD] Successfully parsed {len(documents)} new entries")

        # Generate embeddings in batches
        print(f"[EMBED] Generating embeddings for {len(documents)} documents...")
        batch_size = 32
        all_embeddings = []

        for batch_start in range(0, len(documents), batch_size):
            batch_end = min(batch_start + batch_size, len(documents))
            batch_docs = documents[batch_start:batch_end]

            try:
                batch_embeddings = embedding_service.embed_batch(batch_docs, show_progress=False)
                all_embeddings.extend(batch_embeddings)
                batch_num = batch_start // batch_size + 1
                total_batches = (len(documents) + batch_size - 1) // batch_size
                print(f"[EMBED] Batch {batch_num}/{total_batches} complete ({batch_end}/{len(documents)})")
            except Exception as e:
                print(f"[ERROR] Embedding generation failed for batch: {e}")
                return False

        print(f"[EMBED] Generated {len(all_embeddings)} embeddings")

        # Add to ChromaDB (append, don't clear if resuming)
        print("[ADD] Adding documents to ChromaDB...")
        add_batch_size = 100

        for batch_start in range(0, len(documents), add_batch_size):
            batch_end = min(batch_start + add_batch_size, len(documents))
            batch_docs = documents[batch_start:batch_end]
            batch_meta = metadatas[batch_start:batch_end]
            batch_ids = ids[batch_start:batch_end]
            batch_emb = all_embeddings[batch_start:batch_end]

            try:
                rag_service.add_documents(
                    documents=batch_docs,
                    metadatas=batch_meta,
                    ids=batch_ids,
                    embeddings=batch_emb
                )
                batch_num = batch_start // add_batch_size + 1
                total_batches = (len(documents) + add_batch_size - 1) // add_batch_size
                print(f"[ADD] Batch {batch_num}/{total_batches} complete ({batch_end}/{len(documents)})")
            except Exception as e:
                print(f"[ERROR] Failed to add batch: {e}")
                return False

        # Verify
        count = rag_service.get_collection_count()
        print(f"\n[OK] SUCCESS!")
        print(f"[OK] ChromaDB now contains {count} total documents")
        print(f"[OK] Just added: {entries_loaded} entries")

        return count > 0

    except Exception as e:
        print(f"[ERROR] Failed to load data: {e}")
        return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Load champion.csv entries into ChromaDB")
    parser.add_argument("--start", type=int, default=1152, help="Start from entry number (default: 1152)")
    parser.add_argument("--max", type=int, default=2000, help="Load up to this many entries total (default: 2000)")
    parser.add_argument("--full", action="store_true", help="Load entire dataset (all 22,267 entries)")

    args = parser.parse_args()

    if args.full:
        print("[LOAD] Loading ENTIRE dataset (22,267 entries)")
        max_entries = 22267
    else:
        max_entries = args.max

    success = load_champion_data_resume(start_entry=args.start, max_entries=max_entries)
    sys.exit(0 if success else 1)
