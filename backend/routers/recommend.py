from fastapi import APIRouter, HTTPException
from datetime import datetime
from models import RecommendationRequest, RecommendationResponse, AnimeMetadata
from services import rag_service, llm_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.post("/recommend")
async def get_recommendations(request: RecommendationRequest) -> RecommendationResponse:
    """Get anime recommendations based on natural language query"""
    try:
        # Input validation
        if not request.query or not request.query.strip():
            raise HTTPException(
                status_code=400,
                detail="Query cannot be empty"
            )

        if request.max_results < 1 or request.max_results > 50:
            raise HTTPException(
                status_code=400,
                detail="max_results must be between 1 and 50"
            )

        query = request.query.strip()

        logger.info(f"[RECOMMEND] Query: {query[:50]}, Max results: {request.max_results}")

        # Search for similar anime
        retrieved_anime = rag_service.search(query, k=request.max_results)

        if not retrieved_anime:
            logger.warning(f"[RECOMMEND] No anime found for query: {query}")
            raise HTTPException(
                status_code=404,
                detail=f"No anime found matching '{query}'. Try different keywords like genres, themes, or character types."
            )

        # Format anime list
        anime_list = [AnimeMetadata(**anime) for anime in retrieved_anime]

        # Generate explanation using LLM (with timeout fallback)
        explanation = "No explanation available"
        try:
            explanation = llm_service.generate_recommendations(query, retrieved_anime)
            logger.info(f"[RECOMMEND] LLM generated explanation for: {query[:50]}")
        except Exception as llm_error:
            logger.warning(f"[RECOMMEND] LLM generation failed: {llm_error}")
            # Fallback explanation if LLM fails
            anime_titles = ", ".join([a.title for a in anime_list[:3]])
            explanation = f"Based on your search for '{query}', here are the top recommendations: {anime_titles}, and more. Each anime has been selected for its relevance to your query."

        return RecommendationResponse(
            query=query,
            retrieved_anime=anime_list,
            explanation=explanation,
            timestamp=datetime.now(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[RECOMMEND] Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your request. Please try again."
        )


@router.get("/search/{anime_title}")
async def search_anime(anime_title: str) -> AnimeMetadata:
    """Get specific anime by title"""
    try:
        if not anime_title or not anime_title.strip():
            raise HTTPException(
                status_code=400,
                detail="Anime title cannot be empty"
            )

        logger.info(f"[SEARCH] Looking for: {anime_title}")

        anime = rag_service.get_by_title(anime_title)

        if not anime:
            logger.warning(f"[SEARCH] Anime not found: {anime_title}")
            raise HTTPException(
                status_code=404,
                detail=f"Anime '{anime_title}' not found in database"
            )

        return AnimeMetadata(**anime)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SEARCH] Error searching for {anime_title}: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while searching for the anime."
        )
