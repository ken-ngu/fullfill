"""
Cache management API endpoints.

Provides endpoints for monitoring cache statistics and clearing cache when needed.
"""
from fastapi import APIRouter, HTTPException
from src.cache import (
    get_cache_stats,
    cache_clear,
    invalidate_medication_cache,
    invalidate_diagnosis_cache,
)

router = APIRouter(prefix="/cache", tags=["cache"])


@router.get("/stats")
def get_stats():
    """
    Get cache statistics.

    Returns:
        - status: "available", "unavailable", or "error"
        - total_keys: Total number of cached keys
        - hits: Number of cache hits
        - misses: Number of cache misses
        - hit_rate: Cache hit rate percentage
    """
    return get_cache_stats()


@router.post("/clear")
def clear_cache():
    """
    Clear all cache entries.

    **Use with caution** - this will force all subsequent requests to hit the database
    until the cache is rebuilt.

    Returns:
        Success message or error
    """
    success = cache_clear()
    if success:
        return {"message": "Cache cleared successfully"}
    else:
        raise HTTPException(status_code=503, detail="Cache unavailable or error occurred")


@router.post("/invalidate/medications")
def invalidate_medications(medication_id: str = None):
    """
    Invalidate medication cache entries.

    Args:
        medication_id: Optional medication ID. If provided, only invalidate this medication.
                      If omitted, invalidate all medication caches.

    Returns:
        Success message with count of invalidated entries
    """
    invalidate_medication_cache(medication_id)
    target = medication_id if medication_id else "all medications"
    return {"message": f"Invalidated cache for {target}"}


@router.post("/invalidate/diagnoses")
def invalidate_diagnoses(diagnosis_id: str = None):
    """
    Invalidate diagnosis cache entries.

    Args:
        diagnosis_id: Optional diagnosis ID. If provided, only invalidate this diagnosis.
                     If omitted, invalidate all diagnosis caches.

    Returns:
        Success message with count of invalidated entries
    """
    invalidate_diagnosis_cache(diagnosis_id)
    target = diagnosis_id if diagnosis_id else "all diagnoses"
    return {"message": f"Invalidated cache for {target}"}
