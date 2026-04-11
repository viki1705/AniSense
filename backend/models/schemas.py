from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class AnimeMetadata(BaseModel):
    """Anime/Manga metadata model"""

    title: str
    genres: str
    synopsis: str
    anime_id: Optional[str] = None
    type: Optional[str] = None  # "anime" or "manga"
    rating: Optional[float] = None  # May not exist in dataset
    episodes: Optional[int] = None  # For backwards compatibility
    volumes: Optional[int] = None  # For manga
    chapters: Optional[int] = None  # For manga/anime chapters
    themes: Optional[str] = None  # Themes/tags
    main_picture: Optional[str] = None  # URL to poster image
    similarity_score: Optional[float] = None


class RecommendationRequest(BaseModel):
    """Request model for recommendations"""

    query: str
    max_results: int = 5


class RecommendationResponse(BaseModel):
    """Response model for recommendations"""

    query: str
    retrieved_anime: List[AnimeMetadata]
    explanation: str
    timestamp: datetime


class WatchlistAddRequest(BaseModel):
    """Request model for adding to watchlist"""

    anime_id: str
    title: str


class WatchlistItem(BaseModel):
    """Watchlist item model"""

    id: int
    anime_id: str
    title: str
    added_date: datetime


class WatchlistResponse(BaseModel):
    """Response model for watchlist"""

    items: List[WatchlistItem]
    count: int


# ============ ONBOARDING SCHEMAS ============


class OnboardingStartRequest(BaseModel):
    """Request to start onboarding"""

    user_id: str
    username: str


class GenrePreferencesRequest(BaseModel):
    """Save favorite genres"""

    user_id: str
    genres: List[str]


class ThemePreferencesRequest(BaseModel):
    """Save favorite themes/moods"""

    user_id: str
    themes: List[str]


class SampleAnimeRequest(BaseModel):
    """Save sample anime selections"""

    user_id: str
    anime_titles: List[str]


class UserSettingsRequest(BaseModel):
    """User preference settings"""

    user_id: str
    min_rating: float = 7.0
    max_episodes: Optional[int] = None
    content_filters: List[str] = []
    preferred_type: Optional[str] = None


class CompleteOnboardingRequest(BaseModel):
    """Complete onboarding request"""

    user_id: str


class OnboardingStepResponse(BaseModel):
    """Response after each onboarding step"""

    success: bool
    next_step: int
    message: str


class UserPreferencesResponse(BaseModel):
    """Get all user preferences"""

    user_id: str
    genres: List[str]
    themes: List[str]
    sample_anime: List[Dict]
    settings: Dict
    onboarding_completed: bool


class InteractionRequest(BaseModel):
    """Record user interaction"""

    user_id: str
    anime_id: str
    interaction_type: str  # "view", "like", "dislike", "watchlist_add"


class PersonalizedRecommendationRequest(BaseModel):
    """Get personalized recommendations"""

    user_id: str
    query: Optional[str] = None
    limit: int = 10


class PersonalizedRecommendationResponse(BaseModel):
    """Response with personalized recommendations"""

    user_id: str
    recommendations: List[AnimeMetadata]
    explanation: str
    based_on: Dict


class UpdatePreferencesRequest(BaseModel):
    """Update user preferences"""

    genres: Optional[List[str]] = None
    themes: Optional[List[str]] = None
    settings: Optional[Dict] = None
