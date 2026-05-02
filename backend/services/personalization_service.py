"""Personalization service for preference-based recommendations"""
from typing import List, Dict, Optional
from services.rag_service import rag_service
from services.llm_service import llm_service
from models.database import UserPreferencesDB, UserInteractionsDB
import json
import time
from datetime import datetime, timedelta
from collections import Counter


class PersonalizationService:
    """Intelligent recommendation engine using user preferences"""

    def __init__(self):
        """Initialize personalization engine"""
        self.rag_service = rag_service
        self.llm_service = llm_service

    def analyze_liked_anime(self, user_id: str) -> Dict:
        """
        Analyze user's liked anime to extract patterns

        Returns dictionary with:
        - top_genres: Most common genres in liked anime
        - top_themes: Most common themes
        - common_patterns: Extracted patterns
        """
        try:
            liked_anime_ids = UserInteractionsDB.get_liked_anime(user_id)
            if not liked_anime_ids:
                return {}

            # Collect all genre and theme patterns
            all_genres = []
            all_themes = []

            # Search for each liked anime in ChromaDB to get details
            for anime_id in liked_anime_ids[-10:]:  # Last 10 likes for efficiency
                results = self.rag_service.search(anime_id, k=1)
                if results:
                    anime = results[0]
                    if anime.get('genres'):
                        genres = [g.strip() for g in anime['genres'].split(',')]
                        all_genres.extend(genres)
                    if anime.get('themes'):
                        themes = [t.strip() for t in anime['themes'].split(',')]
                        all_themes.extend(themes)

            # Find most common patterns
            genre_counts = Counter(all_genres)
            theme_counts = Counter(all_themes)

            top_genres = [g for g, _ in genre_counts.most_common(3)]
            top_themes = [t for t, _ in theme_counts.most_common(2)]

            return {
                "top_genres": top_genres,
                "top_themes": top_themes,
                "total_likes": len(liked_anime_ids)
            }

        except Exception as e:
            print(f"Error analyzing liked anime: {e}")
            return {}

    def update_from_interactions(self, user_id: str) -> bool:
        """
        Learn from user interactions to refine preferences

        Algorithm:
        1. Get recent interactions (likes)
        2. Extract genres/themes from liked anime
        3. Identify patterns
        4. Update preference scoring
        5. Save updated preferences

        Returns True if update was successful
        """
        try:
            # Analyze patterns from likes
            patterns = self.analyze_liked_anime(user_id)
            if not patterns or not patterns.get('top_genres'):
                return False

            # Get current preferences
            current_genres = UserPreferencesDB.get_genres(user_id)
            current_themes = UserPreferencesDB.get_themes(user_id)

            # Merge patterns with current preferences
            # Keep existing preferences but boost those that appear in patterns
            new_genres = list(set(current_genres) | set(patterns.get('top_genres', [])))
            new_themes = list(set(current_themes) | set(patterns.get('top_themes', [])))

            # Limit to max 5
            if len(new_genres) > 5:
                # Prioritize genres that appear in patterns
                pattern_genres = patterns.get('top_genres', [])
                new_genres = pattern_genres + [g for g in current_genres if g not in pattern_genres]
                new_genres = new_genres[:5]

            if len(new_themes) > 5:
                pattern_themes = patterns.get('top_themes', [])
                new_themes = pattern_themes + [t for t in current_themes if t not in pattern_themes]
                new_themes = new_themes[:5]

            # Save updated preferences
            UserPreferencesDB.save_genres(user_id, new_genres)
            UserPreferencesDB.save_themes(user_id, new_themes)

            # Record learning in metadata
            UserPreferencesDB.update_preference(
                user_id,
                "last_learning_update",
                datetime.now().isoformat()
            )

            print(f"[LEARNING] Updated preferences for {user_id}: genres={new_genres}, themes={new_themes}")
            return True

        except Exception as e:
            print(f"Error updating from interactions: {e}")
            return False

    def build_user_profile_query(self, user_id: str) -> str:
        """
        Build search query from user preferences

        Combines genres, themes to create enhanced search query
        """
        genres = UserPreferencesDB.get_genres(user_id)
        themes = UserPreferencesDB.get_themes(user_id)

        parts = []

        if genres:
            genre_str = ", ".join(genres[:3])  # Top 3 genres
            parts.append(f"{genre_str} anime")

        if themes:
            theme_str = ", ".join(themes[:2])  # Top 2 themes
            parts.append(f"with {theme_str} atmosphere")

        query = " ".join(parts) if parts else "anime recommendations"
        return query

    def get_personalized_recommendations(
        self, user_id: str, query: Optional[str] = None, limit: int = 10, learn_from_interactions: bool = True
    ) -> Dict:
        """
        Get personalized recommendations for user

        Algorithm:
        1. Learn from recent interactions if enabled
        2. Load user preferences
        3. Build preference-based query
        4. Search ChromaDB
        5. Filter by user settings
        6. Apply preference boosting
        7. Remove disliked anime
        8. Return top N recommendations
        """
        try:
            start_time = time.time()

            # Learn from interactions (updates preferences based on likes)
            if learn_from_interactions:
                self.update_from_interactions(user_id)

            # Load user preferences (now includes learned patterns)
            genres = UserPreferencesDB.get_genres(user_id)
            themes = UserPreferencesDB.get_themes(user_id)
            sample_anime = UserPreferencesDB.get_sample_anime(user_id)
            settings = UserPreferencesDB.get_preferences(user_id)
            liked_anime = UserInteractionsDB.get_liked_anime(user_id)
            disliked_anime = UserInteractionsDB.get_disliked_anime(user_id)

            # Build query
            preference_query = self.build_user_profile_query(user_id)
            search_query = query if query else preference_query

            # Search ChromaDB
            search_results = self.rag_service.search(search_query, k=limit * 2)

            # Filter by user settings
            filtered_results = self.filter_by_user_settings(search_results, settings)

            # Apply preference boosting
            boosted_results = self.apply_preference_boosting(
                filtered_results,
                {
                    "genres": genres,
                    "themes": themes,
                    "sample_anime": sample_anime,
                    "liked_anime": liked_anime,
                },
            )

            # Remove disliked anime
            final_results = [
                r for r in boosted_results
                if not any(
                    disliker.lower() in r.get("anime_id", "").lower()
                    for disliker in disliked_anime
                )
            ]

            # Trim to requested limit
            final_results = final_results[:limit]

            # Generate explanation
            explanation = self.generate_personalized_explanation(
                user_id, genres, themes, final_results[:3]
            )

            elapsed = time.time() - start_time

            return {
                "user_id": user_id,
                "recommendations": final_results,
                "explanation": explanation,
                "based_on": {
                    "genres": genres,
                    "themes": themes,
                    "sample_anime_count": len(sample_anime),
                    "learned_from_interactions": learn_from_interactions,
                },
                "elapsed_time": f"{elapsed:.2f}s",
            }

        except Exception as e:
            print(f"Error getting personalized recommendations: {e}")
            return {
                "user_id": user_id,
                "recommendations": [],
                "explanation": f"Error generating recommendations: {str(e)}",
                "based_on": {},
                "error": str(e),
            }

    def apply_preference_boosting(
        self, results: List[Dict], user_preferences: Dict
    ) -> List[Dict]:
        """
        Boost similarity scores based on preference matching and generate explanations

        Boosting rules:
        - +15% if anime genre matches user's top genre
        - +10% if theme matches user's selected themes
        - +20% if similar to user's sample anime (if available)
        """
        boosted = []
        theme_keywords = {
            "Dark and Gritty": ["dark", "gritty", "mature"],
            "Uplifting and Hopeful": ["hope", "uplifting", "positive"],
            "Emotional and Deep": ["emotional", "deep", "dramatic"],
            "Action-Packed": ["action", "battle", "fight"],
            "Thought-Provoking": ["thought", "philosophical", "complex"],
            "Heartwarming": ["heartwarming", "warm", "friendship"],
            "Mysterious": ["mystery", "mysterious", "secret"],
            "Epic and Grand": ["epic", "grand", "adventure"],
            "Realistic": ["realistic", "realistic", "slice of life"],
            "Fantastical": ["fantasy", "magical", "fantastical"],
        }

        for anime in results:
            score = anime.get("similarity_score", 0.7)
            original_score = score
            reasons = []

            # Boost for matching genres
            anime_genres = anime.get("genres", "").lower()
            user_genres = user_preferences.get("genres", [])[:3]
            for user_genre in user_genres:
                if user_genre.lower() in anime_genres:
                    score += 0.15
                    reasons.append(f"You love {user_genre}")
                    break

            # Boost for matching themes
            anime_synopsis = anime.get("synopsis", "").lower()
            user_themes = user_preferences.get("themes", [])
            matched_theme = None
            for user_theme in user_themes:
                keywords = theme_keywords.get(user_theme, [])
                if any(kw in anime_synopsis for kw in keywords):
                    score += 0.10
                    matched_theme = user_theme
                    reasons.append(f"Fits your {user_theme} preference")
                    break

            # Boost for similar to sample anime (only if sample anime exists)
            sample_anime = user_preferences.get("sample_anime", [])
            if sample_anime:
                sample_titles = [a["title"].lower() for a in sample_anime]
                anime_title = anime.get("title", "").lower()
                if any(sample in anime_synopsis or sample in anime_genres for sample in sample_titles):
                    score += 0.20
                    reasons.append(f"Similar to anime you know")

            # Normalize score to 1.0
            score = min(score, 1.0)

            anime_copy = anime.copy()
            anime_copy["similarity_score"] = score
            anime_copy["boost_applied"] = score - original_score
            anime_copy["recommendation_reasons"] = reasons if reasons else ["Great match for you"]
            boosted.append(anime_copy)

        # Sort by boosted score
        return sorted(boosted, key=lambda x: x["similarity_score"], reverse=True)

    def filter_by_user_settings(self, results: List[Dict], settings: Dict) -> List[Dict]:
        """
        Apply user content filters

        Filters:
        - min_rating: Remove anime below threshold
        - max_episodes: Remove long series if preference set
        - content_filters: Remove based on tags
        - preferred_type: Filter by TV/Movie/OVA
        """
        filtered = []

        min_rating = settings.get("min_rating", 0) if isinstance(settings, dict) else 0
        max_episodes = settings.get("max_episodes") if isinstance(settings, dict) else None
        content_filters = settings.get("content_filters", []) if isinstance(settings, dict) else []
        preferred_type = settings.get("preferred_type") if isinstance(settings, dict) else None

        for anime in results:
            # Check rating
            if anime.get("rating", 0) < min_rating:
                continue

            # Check episodes
            if max_episodes and anime.get("episodes", 0) > max_episodes:
                continue

            # Check type preference
            if preferred_type and anime.get("type") != preferred_type:
                continue

            filtered.append(anime)

        return filtered

    def generate_personalized_explanation(
        self, user_id: str, genres: List[str], themes: List[str], top_results: List[Dict]
    ) -> str:
        """
        Generate natural language explanation for recommendations

        Uses LLM to create personalized explanation
        """
        try:
            if not genres:
                return "Here are some anime recommendations for you!"

            genre_str = ", ".join(genres[:3])
            theme_str = ", ".join(themes[:2]) if themes else "diverse stories"

            prompt = f"""Generate a friendly, one-sentence explanation for this anime recommendation.
The user loves: {genre_str}
They enjoy: {theme_str}
Focus on how these recommendations match their preferences.
Be concise and enthusiastic."""

            explanation = self.llm_service.generate(prompt, max_tokens=100)
            return explanation if explanation else f"Based on your love for {genre_str}..."

        except Exception as e:
            return f"Here are anime recommendations based on your preferences!"


# Create singleton
personalization_service = PersonalizationService()
