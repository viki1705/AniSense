from fastapi import APIRouter, HTTPException
from models import WatchlistAddRequest, WatchlistResponse, WatchlistItem
from models.database import WatchlistDB
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/watchlist")


@router.get("/")
async def get_watchlist() -> WatchlistResponse:
    """Get all watchlist items"""
    try:
        logger.info("[WATCHLIST] Fetching all items")
        items = WatchlistDB.get_all()
        watchlist_items = []

        for item in items:
            try:
                # Parse ISO format datetime string safely
                if isinstance(item["added_date"], str):
                    added_date = datetime.fromisoformat(item["added_date"])
                else:
                    added_date = item["added_date"]

                watchlist_items.append(
                    WatchlistItem(
                        id=item["id"],
                        anime_id=item["anime_id"],
                        title=item["title"],
                        added_date=added_date,
                    )
                )
            except (ValueError, TypeError) as e:
                logger.warning(f"[WATCHLIST] Failed to parse date for {item.get('title')}: {e}")
                # Use current time as fallback for corrupted dates
                watchlist_items.append(
                    WatchlistItem(
                        id=item["id"],
                        anime_id=item["anime_id"],
                        title=item["title"],
                        added_date=datetime.now(),
                    )
                )

        logger.info(f"[WATCHLIST] Found {len(watchlist_items)} items")
        return WatchlistResponse(items=watchlist_items, count=len(watchlist_items))
    except Exception as e:
        logger.error(f"[WATCHLIST] Error getting watchlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve watchlist")


@router.post("/add")
async def add_to_watchlist(request: WatchlistAddRequest) -> dict:
    """Add anime to watchlist"""
    try:
        if not request.anime_id or not request.title:
            raise HTTPException(
                status_code=400,
                detail="anime_id and title are required"
            )

        logger.info(f"[WATCHLIST] Adding: {request.title}")

        success = WatchlistDB.add_anime(request.anime_id, request.title)
        if not success:
            logger.warning(f"[WATCHLIST] Anime already in watchlist: {request.title}")
            raise HTTPException(
                status_code=409,
                detail="This anime is already in your watchlist"
            )

        logger.info(f"[WATCHLIST] Successfully added: {request.title}")
        return {"message": "Successfully added to watchlist", "anime_id": request.anime_id, "title": request.title}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[WATCHLIST] Error adding anime: {e}")
        raise HTTPException(status_code=500, detail="Failed to add anime to watchlist")


@router.delete("/{anime_id}")
async def remove_from_watchlist(anime_id: str) -> dict:
    """Remove anime from watchlist"""
    try:
        if not anime_id:
            raise HTTPException(
                status_code=400,
                detail="anime_id is required"
            )

        logger.info(f"[WATCHLIST] Removing anime_id: {anime_id}")

        success = WatchlistDB.remove_anime(anime_id)
        if not success:
            logger.warning(f"[WATCHLIST] Anime not found for removal: {anime_id}")
            raise HTTPException(
                status_code=404,
                detail="This anime is not in your watchlist"
            )

        logger.info(f"[WATCHLIST] Successfully removed: {anime_id}")
        return {"message": "Successfully removed from watchlist", "anime_id": anime_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[WATCHLIST] Error removing anime: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove anime from watchlist")


@router.get("/check/{anime_id}")
async def check_in_watchlist(anime_id: str) -> dict:
    """Check if anime is in watchlist"""
    try:
        if not anime_id:
            raise HTTPException(
                status_code=400,
                detail="anime_id is required"
            )

        logger.info(f"[WATCHLIST] Checking anime_id: {anime_id}")

        in_watchlist = WatchlistDB.check_exists(anime_id)
        return {
            "anime_id": anime_id,
            "in_watchlist": in_watchlist
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[WATCHLIST] Error checking anime: {e}")
        raise HTTPException(status_code=500, detail="Failed to check anime status")
