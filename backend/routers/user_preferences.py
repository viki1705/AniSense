"""User preferences and onboarding API endpoints"""
from fastapi import APIRouter, HTTPException
from models.schemas import (
    OnboardingStartRequest,
    OnboardingStepResponse,
    GenrePreferencesRequest,
    ThemePreferencesRequest,
    SampleAnimeRequest,
    UserSettingsRequest,
    CompleteOnboardingRequest,
    UserPreferencesResponse,
    InteractionRequest,
    PersonalizedRecommendationRequest,
    PersonalizedRecommendationResponse,
    UpdatePreferencesRequest,
)
from models.database import UserDB, UserPreferencesDB, UserInteractionsDB
from services.personalization_service import personalization_service
from services.rag_service import rag_service
import uuid

router = APIRouter(prefix="/api/users", tags=["user_preferences"])


@router.post("/onboarding/start")
async def start_onboarding(request: OnboardingStartRequest):
    """
    Initialize new user and start onboarding

    Request: { user_id, username }
    Response: { user_id, onboarding_token, step: 1 }
    """
    try:
        # Create user
        result = UserDB.create_user(request.user_id, request.username)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to create user"))

        return {
            "success": True,
            "user_id": request.user_id,
            "message": f"Welcome {request.username}! Starting onboarding...",
            "current_step": 1,
            "total_steps": 5,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/onboarding/genres")
async def save_genre_preferences(request: GenrePreferencesRequest):
    """
    Save user's favorite genres (Step 1)

    Request: { user_id, genres: ["Action", "Drama", ...] }
    Response: { success, next_step: 2 }
    """
    try:
        if len(request.genres) < 3 or len(request.genres) > 5:
            raise HTTPException(status_code=400, detail="Please select 3-5 genres")

        success = UserPreferencesDB.save_genres(request.user_id, request.genres)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save genres")

        return {
            "success": True,
            "selected_genres": request.genres,
            "message": "Genres saved! Moving to themes...",
            "current_step": 2,
            "total_steps": 5,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/onboarding/themes")
async def save_theme_preferences(request: ThemePreferencesRequest):
    """
    Save user's favorite themes/moods (Step 2)

    Request: { user_id, themes: ["Dark", "Emotional", ...] }
    Response: { success, next_step: 3 }
    """
    try:
        if len(request.themes) < 2 or len(request.themes) > 5:
            raise HTTPException(status_code=400, detail="Please select 2-5 themes")

        success = UserPreferencesDB.save_themes(request.user_id, request.themes)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save themes")

        return {
            "success": True,
            "selected_themes": request.themes,
            "message": "Themes saved! Now pick some anime you've watched...",
            "current_step": 3,
            "total_steps": 5,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/onboarding/sample-anime")
async def save_sample_anime(request: SampleAnimeRequest):
    """
    Save anime user has watched or knows (Step 3)

    Request: { user_id, anime_titles: ["Death Note", ...] }
    Response: { success, next_step: 4 }
    """
    try:
        if len(request.anime_titles) < 3 or len(request.anime_titles) > 5:
            raise HTTPException(status_code=400, detail="Please select 3-5 anime")

        # Convert titles to list of dicts
        anime_list = [{"title": title} for title in request.anime_titles]

        success = UserPreferencesDB.save_sample_anime(request.user_id, anime_list)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save sample anime")

        return {
            "success": True,
            "selected_anime": request.anime_titles,
            "message": "Great! Now let's set your preferences...",
            "current_step": 4,
            "total_steps": 5,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/onboarding/settings")
async def save_user_settings(request: UserSettingsRequest):
    """
    Save user settings (Step 4)

    Request: { user_id, min_rating, content_filters, ... }
    Response: { success, next_step: 5 }
    """
    try:
        settings = {
            "min_rating": request.min_rating,
            "max_episodes": request.max_episodes,
            "content_filters": request.content_filters,
            "preferred_type": request.preferred_type,
        }

        success = UserPreferencesDB.save_preferences(request.user_id, settings)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save settings")

        return {
            "success": True,
            "settings": settings,
            "message": "Settings saved! Ready to get your personalized recommendations...",
            "current_step": 5,
            "total_steps": 5,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/onboarding/complete")
async def complete_onboarding(request: CompleteOnboardingRequest):
    """
    Finalize onboarding and generate initial recommendations

    Request: { user_id }
    Response: { success, personalized_recommendations: [...], profile_summary: {...} }
    """
    try:
        # Mark onboarding complete
        success = UserDB.mark_onboarding_complete(request.user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to complete onboarding")

        # Generate personalized recommendations
        rec_result = personalization_service.get_personalized_recommendations(
            request.user_id, limit=10
        )

        genres = UserPreferencesDB.get_genres(request.user_id)
        themes = UserPreferencesDB.get_themes(request.user_id)
        sample_anime = UserPreferencesDB.get_sample_anime(request.user_id)

        return {
            "success": True,
            "message": "Onboarding complete! Here are your personalized recommendations.",
            "personalized_recommendations": rec_result["recommendations"],
            "explanation": rec_result["explanation"],
            "profile_summary": {
                "genres": genres,
                "themes": themes,
                "sample_anime": sample_anime,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preferences/{user_id}")
async def get_user_preferences(user_id: str):
    """
    Get all user preferences

    Response: { genres, themes, sample_anime, settings, onboarding_completed }
    """
    try:
        user = UserDB.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        genres = UserPreferencesDB.get_genres(user_id)
        themes = UserPreferencesDB.get_themes(user_id)
        sample_anime = UserPreferencesDB.get_sample_anime(user_id)
        settings = UserPreferencesDB.get_preferences(user_id)

        return {
            "user_id": user_id,
            "username": user["username"],
            "genres": genres,
            "themes": themes,
            "sample_anime": sample_anime,
            "settings": settings,
            "onboarding_completed": user["onboarding_completed"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences/{user_id}")
async def update_user_preferences(user_id: str, request: UpdatePreferencesRequest):
    """
    Update specific preferences

    Request: { genres?, themes?, settings? }
    Response: { success, updated_fields }
    """
    try:
        user = UserDB.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        updated_fields = []

        if request.genres:
            UserPreferencesDB.save_genres(user_id, request.genres)
            updated_fields.append("genres")

        if request.themes:
            UserPreferencesDB.save_themes(user_id, request.themes)
            updated_fields.append("themes")

        if request.settings:
            UserPreferencesDB.save_preferences(user_id, request.settings)
            updated_fields.append("settings")

        UserDB.update_last_active(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "updated_fields": updated_fields,
            "message": f"Updated {', '.join(updated_fields)}",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interactions")
async def record_interaction(request: InteractionRequest):
    """
    Track user interactions (likes, views, watchlist adds)

    Request: { user_id, anime_id, interaction_type }
    Response: { success }
    """
    try:
        user = UserDB.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        success = UserInteractionsDB.record_interaction(
            request.user_id, request.anime_id, request.interaction_type
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to record interaction")

        UserDB.update_last_active(request.user_id)

        return {"success": True, "message": f"Recorded {request.interaction_type} interaction"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/interactions/{user_id}")
async def get_user_interactions(user_id: str, limit: int = 50):
    """
    Get user interaction history

    Response: { interactions: [...] }
    """
    try:
        user = UserDB.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        interactions = UserInteractionsDB.get_user_interactions(user_id, limit)

        return {"user_id": user_id, "interactions": interactions, "count": len(interactions)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommendations/personalized")
async def get_personalized_recommendations(request: PersonalizedRecommendationRequest):
    """
    Get recommendations based on user preferences

    Request: { user_id, query?, limit? }
    Response: { recommendations: [...], explanation, based_on: {...} }
    """
    try:
        user = UserDB.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        result = personalization_service.get_personalized_recommendations(
            request.user_id, query=request.query, limit=request.limit
        )

        UserDB.update_last_active(request.user_id)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/autocomplete")
async def search_anime_autocomplete(q: str):
    """
    Search anime by title for onboarding autocomplete

    Query: q=search_term
    Response: { results: [...] }
    """
    try:
        if len(q) < 2:
            return {"results": [], "query": q}

        # Use RAG service to search
        results = rag_service.search(q, k=5)

        # Return minimal info for autocomplete
        autocomplete_results = [
            {"title": r.get("title"), "id": r.get("anime_id"), "genres": r.get("genres")}
            for r in results
        ]

        return {"results": autocomplete_results, "query": q, "count": len(autocomplete_results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
