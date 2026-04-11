from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from models import AnimeMetadata
from services import rag_service, llm_service

router = APIRouter(prefix="/api/franchise")


class FranchiseResponse(BaseModel):
    """Response model for franchise info"""

    franchise_name: str
    anime_list: List[AnimeMetadata]
    recommended_order: str


@router.get("/{franchise_name}")
async def get_franchise(franchise_name: str) -> FranchiseResponse:
    """Get franchise info and watch order"""
    try:
        # Search for franchise anime
        retrieved_anime = rag_service.search(franchise_name, k=10)

        if not retrieved_anime:
            raise HTTPException(
                status_code=404, detail=f"No anime found for franchise: {franchise_name}"
            )

        # Generate watch order
        recommended_order = llm_service.generate_franchise_order(
            franchise_name, retrieved_anime
        )

        anime_list = [AnimeMetadata(**anime) for anime in retrieved_anime]

        return FranchiseResponse(
            franchise_name=franchise_name,
            anime_list=anime_list,
            recommended_order=recommended_order,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_franchise: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/related/{anime_title}")
async def get_related_anime(anime_title: str) -> List[AnimeMetadata]:
    """Find similar anime to given title"""
    try:
        # Get the anime first
        anime = rag_service.get_by_title(anime_title)

        if not anime:
            raise HTTPException(status_code=404, detail=f"Anime not found: {anime_title}")

        # Search for similar anime using title and genres
        search_query = f"{anime_title} {anime.get('genres', '')}"
        related_anime = rag_service.search(search_query, k=6)

        # Filter out the original anime
        related_anime = [
            a for a in related_anime if a.get("title") != anime_title
        ][:5]

        if not related_anime:
            raise HTTPException(status_code=404, detail="No similar anime found")

        return [AnimeMetadata(**anime) for anime in related_anime]
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_related_anime: {e}")
        raise HTTPException(status_code=500, detail=str(e))
