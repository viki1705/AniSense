import chromadb
from config import settings
from services.embeddings import embedding_service
from typing import List, Dict, Optional


class RAGService:
    """Service for Retrieval-Augmented Generation using ChromaDB"""

    def __init__(self):
        """Initialize RAG service with ChromaDB"""
        self.client = chromadb.PersistentClient(path=settings.chromadb_persist_dir)
        self.collection_name = "anime"
        try:
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            print(f"[INIT] RAGService initialized with ChromaDB collection: {self.collection_name}")
        except Exception as e:
            print(f"[WARN] Error initializing ChromaDB collection: {e}")
            self.collection = None

    def search(self, query: str, k: int = settings.top_k) -> List[Dict]:
        """Search for similar anime using query embedding"""
        if not self.collection:
            return []

        try:
            # Embed the query
            query_embedding = embedding_service.embed_text(query)
            if not query_embedding:
                return []

            # Query ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=k,
                include=["documents", "metadatas", "distances"],
            )

            # Format results
            formatted_results = []
            if results and results["ids"]:
                for i, doc_id in enumerate(results["ids"][0]):
                    metadata = results["metadatas"][0][i]
                    distance = results["distances"][0][i]
                    similarity = 1 - distance  # Convert distance to similarity

                    formatted_results.append(
                        {
                            "anime_id": doc_id,
                            "title": metadata.get("title", ""),
                            "type": metadata.get("type", "anime"),
                            "genres": metadata.get("genres", ""),
                            "themes": metadata.get("themes", ""),
                            "main_picture": metadata.get("main_picture", ""),
                            "volumes": int(metadata.get("volumes", 0))
                            if metadata.get("volumes")
                            else None,
                            "chapters": int(metadata.get("chapters", 0))
                            if metadata.get("chapters")
                            else None,
                            "synopsis": metadata.get("synopsis", ""),
                            "similarity_score": round(similarity, 4),
                        }
                    )

            return formatted_results
        except Exception as e:
            print(f"[ERROR] Error searching ChromaDB: {e}")
            return []

    def get_by_title(self, title: str) -> Optional[Dict]:
        """Get anime by title"""
        if not self.collection:
            return None

        try:
            results = self.collection.get(
                where={"title": {"$eq": title}},
                include=["documents", "metadatas"],
            )

            if results and results["ids"]:
                metadata = results["metadatas"][0]
                return {
                    "anime_id": results["ids"][0],
                    "title": metadata.get("title", ""),
                    "type": metadata.get("type", "anime"),
                    "genres": metadata.get("genres", ""),
                    "themes": metadata.get("themes", ""),
                    "main_picture": metadata.get("main_picture", ""),
                    "volumes": int(metadata.get("volumes", 0))
                    if metadata.get("volumes")
                    else None,
                    "chapters": int(metadata.get("chapters", 0))
                    if metadata.get("chapters")
                    else None,
                    "synopsis": metadata.get("synopsis", ""),
                }
            return None
        except Exception as e:
            print(f"[ERROR] Error getting anime by title: {e}")
            return None

    def add_documents(
        self, documents: List[str], metadatas: List[Dict], ids: List[str], embeddings: List[List[float]]
    ) -> bool:
        """Add documents with pre-computed embeddings to ChromaDB"""
        if not self.collection:
            print("[ERROR] Collection not initialized")
            return False

        try:
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
            )
            print(f"[OK] Added {len(documents)} documents to ChromaDB")
            return True
        except Exception as e:
            print(f"[ERROR] Error adding documents to ChromaDB: {e}")
            return False

    def clear_collection(self) -> bool:
        """Clear all documents from the collection"""
        if not self.collection:
            print("[WARN] Collection not initialized, cannot clear")
            return False

        try:
            # Get all IDs and delete them
            all_ids = self.collection.get(include=[])["ids"]
            if all_ids:
                self.collection.delete(ids=all_ids)
                print(f"[OK] Cleared {len(all_ids)} documents from collection")
            return True
        except Exception as e:
            print(f"[ERROR] Error clearing collection: {e}")
            return False

    def get_collection_count(self) -> int:
        """Get total count of documents in collection"""
        if not self.collection:
            return 0
        try:
            return self.collection.count()
        except Exception as e:
            print(f"[WARN] Error getting collection count: {e}")
            return 0


# Singleton instance
rag_service = RAGService()
