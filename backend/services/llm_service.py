from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from config import settings
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
import time
import threading
import hashlib
import requests
import json


class LLMService:
    """Service for LLM operations using Ollama and Llama3"""

    def __init__(self):
        """Initialize LLM service"""
        try:
            self.ollama_url = settings.ollama_base_url
            self.model = settings.ollama_model
            self.max_retries = 1
            self.timeout_seconds = 25  # Ollama takes 6-7s + buffer for overhead
            self.executor = ThreadPoolExecutor(max_workers=1)
            self.response_cache = {}
            self.cache_hits = 0

            # Recommendation prompt template - CONCISE FOR SPEED
            self.recommendation_template = """Anime: {context}
Query: {query}
One sentence why these match:"""

            # Franchise order template
            self.franchise_template = """For the anime franchise "{franchise_name}", please suggest the best watch order for these anime:

{anime_list}

Provide a numbered list with a brief explanation for the suggested order."""

            print(f"[INIT] LLMService initialized with model: {settings.ollama_model}")

            # Log Ollama GPU status
            self._check_ollama_gpu()

        except Exception as e:
            print(f"[WARN] Error initializing LLMService: {e}")
            self.ollama_url = None
            self.executor = None

    def _check_ollama_gpu(self) -> None:
        """Check and log Ollama GPU usage"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                # Ollama manages its own GPU - just log availability
                print(f"[INFO] Ollama is available at {self.ollama_url}")
                print(f"[INFO] Model: {self.model}")
                print(f"[INFO] Ollama manages GPU independently (check Ollama logs for GPU status)")
        except Exception as e:
            print(f"[WARN] Could not verify Ollama status: {e}")

    def _invoke_with_timeout(self, prompt: str, max_retries: int = 3) -> str:
        """Invoke LLM via direct HTTP call (bypasses LangChain overhead)"""
        last_error = None

        for attempt in range(1, max_retries + 1):
            try:
                print(f"[LLM] Attempt {attempt}/{max_retries}")
                start_time = time.time()

                # Direct HTTP call to Ollama (no LangChain overhead)
                response = requests.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "num_predict": 128,
                            "temperature": 0.7,
                            "top_k": 40,
                            "top_p": 0.9,
                            "num_thread": 8,
                        }
                    },
                    timeout=self.timeout_seconds
                )

                response.raise_for_status()
                result = response.json().get("response", "").strip()
                elapsed = time.time() - start_time
                print(f"[LLM] Response time: {elapsed:.2f}s (Model: {self.model})")
                return result

            except requests.Timeout:
                last_error = f"Timeout after {self.timeout_seconds}s"
                print(f"[WARN] LLM timeout on attempt {attempt}: {last_error}")
                if attempt < max_retries:
                    wait_time = 2 ** (attempt - 1)
                    print(f"[INFO] Retrying in {wait_time}s...")
                    time.sleep(wait_time)

            except Exception as e:
                last_error = str(e)
                print(f"[WARN] LLM error on attempt {attempt}: {last_error}")
                if attempt < max_retries:
                    wait_time = 2 ** (attempt - 1)
                    print(f"[INFO] Retrying in {wait_time}s...")
                    time.sleep(wait_time)

        # All retries failed
        raise TimeoutError(f"LLM failed after {max_retries} attempts: {last_error}")

    def generate_recommendations(
        self, query: str, retrieved_anime: List[Dict]
    ) -> str:
        """Generate recommendation explanation using LLM with caching"""
        if not self.ollama_url:
            return "No explanation available."

        try:
            # Create cache key from query
            cache_key = hashlib.md5(query.lower().encode()).hexdigest()

            # Check cache
            if cache_key in self.response_cache:
                self.cache_hits += 1
                print(f"[CACHE] Hit for query: {query[:30]}... (total hits: {self.cache_hits})")
                return self.response_cache[cache_key]

            # Format anime context - minimal format
            context = ", ".join([f"{a.get('title', 'Unknown')}" for a in retrieved_anime[:3]])

            # Build prompt
            prompt = self.recommendation_template.format(query=query, context=context)

            # Generate response with timeout
            response = self._invoke_with_timeout(prompt, max_retries=self.max_retries)
            result = response.strip()

            # Cache the result
            self.response_cache[cache_key] = result

            return result
        except TimeoutError as e:
            print(f"[ERROR] LLM timeout: {e}")
            return "I found relevant anime for your query, but the AI took too long to explain."
        except Exception as e:
            print(f"[ERROR] Error generating recommendations: {e}")
            return "I found relevant anime for your query."

    def generate_franchise_order(
        self, franchise_name: str, anime_list: List[Dict]
    ) -> str:
        """Generate watch order for franchise anime"""
        if not self.ollama_url:
            return "Unable to generate watch order at this time."

        try:
            # Format anime list
            anime_details = []
            for anime in anime_list[:10]:
                anime_details.append(
                    f"- {anime.get('title', 'Unknown')} "
                    f"({anime.get('episodes', 'Unknown')} episodes)"
                )
            anime_text = "\n".join(anime_details)

            # Build prompt
            prompt = self.franchise_template.format(
                franchise_name=franchise_name, anime_list=anime_text
            )

            # Generate response with timeout and retry
            response = self._invoke_with_timeout(prompt, max_retries=self.max_retries)
            return response.strip()
        except TimeoutError as e:
            print(f"[ERROR] LLM timeout: {e}")
            return "The AI took too long to suggest a watch order. Please try again."
        except Exception as e:
            print(f"[ERROR] Error generating franchise order: {e}")
            return "Unable to generate watch order at this time."


# Singleton instance
llm_service = LLMService()
