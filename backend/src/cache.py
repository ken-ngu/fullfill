"""
Redis caching utilities for search results and medication data.

This module provides a simple caching layer to reduce database load and improve
response times for frequently accessed data.

Cache Strategy:
- Search results: 5 minute TTL (frequently changing user behavior)
- Medication details: 15 minute TTL (relatively static data)
- Top medications: 10 minute TTL (periodic updates)

All cache keys are namespaced to avoid collisions.
"""
import json
import logging
from typing import Optional, Any
from functools import wraps
from datetime import date, datetime
from decimal import Decimal

import redis
from src.config import settings

logger = logging.getLogger(__name__)

# Global Redis client (lazy initialized)
_redis_client: Optional[redis.Redis] = None


class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles date, datetime, and Decimal objects."""
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


def get_redis_client() -> Optional[redis.Redis]:
    """
    Get or create Redis client connection.

    Returns None if Redis is unavailable (graceful degradation).
    """
    global _redis_client

    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=True,  # Automatically decode bytes to strings
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=True,
                health_check_interval=30,
            )
            # Test connection
            _redis_client.ping()
            logger.info("Redis connection established")
        except (redis.ConnectionError, redis.TimeoutError) as e:
            logger.warning(f"Redis unavailable, caching disabled: {e}")
            _redis_client = None

    return _redis_client


def cache_get(key: str) -> Optional[dict]:
    """
    Get cached value by key.

    Returns None if key doesn't exist or Redis is unavailable.
    """
    client = get_redis_client()
    if client is None:
        return None

    try:
        data = client.get(key)
        if data:
            return json.loads(data)
    except (redis.RedisError, json.JSONDecodeError) as e:
        logger.warning(f"Cache get error for key '{key}': {e}")

    return None


def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    """
    Set cached value with TTL in seconds.

    Args:
        key: Cache key
        value: Value to cache (must be JSON serializable)
        ttl: Time-to-live in seconds (default: 300 = 5 minutes)

    Returns:
        True if successfully cached, False otherwise
    """
    client = get_redis_client()
    if client is None:
        return False

    try:
        serialized = json.dumps(value, cls=DateTimeEncoder)
        client.setex(key, ttl, serialized)
        return True
    except (redis.RedisError, TypeError, json.JSONDecodeError) as e:
        logger.warning(f"Cache set error for key '{key}': {e}")
        return False


def cache_delete(pattern: str) -> int:
    """
    Delete cache keys matching pattern.

    Args:
        pattern: Redis key pattern (e.g., "med:search:*")

    Returns:
        Number of keys deleted
    """
    client = get_redis_client()
    if client is None:
        return 0

    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
    except redis.RedisError as e:
        logger.warning(f"Cache delete error for pattern '{pattern}': {e}")

    return 0


def cache_clear() -> bool:
    """
    Clear ALL cache keys (use with caution).

    Returns:
        True if successful, False otherwise
    """
    client = get_redis_client()
    if client is None:
        return False

    try:
        client.flushdb()
        logger.info("Cache cleared")
        return True
    except redis.RedisError as e:
        logger.warning(f"Cache clear error: {e}")
        return False


def build_cache_key(*parts: str) -> str:
    """
    Build a namespaced cache key from parts.

    Example:
        build_cache_key("med", "search", "acne", "dermatology")
        -> "fullfill:med:search:acne:dermatology"
    """
    return f"fullfill:{':'.join(str(p) for p in parts)}"


# Cache TTL constants (in seconds)
CACHE_TTL_SEARCH = 300          # 5 minutes - search results
CACHE_TTL_MEDICATION = 900      # 15 minutes - medication details
CACHE_TTL_TOP = 600             # 10 minutes - top medications
CACHE_TTL_DIAGNOSIS = 900       # 15 minutes - diagnosis details


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results.

    Args:
        ttl: Time-to-live in seconds
        key_prefix: Prefix for cache key (e.g., "med:search")

    Usage:
        @cached(ttl=300, key_prefix="med:search")
        def search_medications(q: str, specialty: str):
            return expensive_database_query(q, specialty)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key from function name and arguments
            key_parts = [key_prefix or func.__name__]
            key_parts.extend(str(arg) for arg in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = build_cache_key(*key_parts)

            # Try cache first
            cached_result = cache_get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return cached_result

            # Cache miss - call function
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)

            # Cache the result
            cache_set(cache_key, result, ttl=ttl)

            return result

        return wrapper
    return decorator


def invalidate_medication_cache(medication_id: Optional[str] = None):
    """
    Invalidate medication-related cache entries.

    Args:
        medication_id: If provided, only invalidate caches for this medication.
                      If None, invalidate all medication caches.
    """
    if medication_id:
        # Invalidate specific medication
        pattern = build_cache_key("med", medication_id, "*")
        count = cache_delete(pattern)
        logger.info(f"Invalidated {count} cache entries for medication {medication_id}")
    else:
        # Invalidate all medication caches
        pattern = build_cache_key("med", "*")
        count = cache_delete(pattern)
        logger.info(f"Invalidated {count} medication cache entries")


def invalidate_diagnosis_cache(diagnosis_id: Optional[str] = None):
    """
    Invalidate diagnosis-related cache entries.

    Args:
        diagnosis_id: If provided, only invalidate caches for this diagnosis.
                     If None, invalidate all diagnosis caches.
    """
    if diagnosis_id:
        # Invalidate specific diagnosis
        pattern = build_cache_key("diag", diagnosis_id, "*")
        count = cache_delete(pattern)
        logger.info(f"Invalidated {count} cache entries for diagnosis {diagnosis_id}")
    else:
        # Invalidate all diagnosis caches
        pattern = build_cache_key("diag", "*")
        count = cache_delete(pattern)
        logger.info(f"Invalidated {count} diagnosis cache entries")


def get_cache_stats() -> dict:
    """
    Get cache statistics (for debugging/monitoring).

    Returns:
        Dictionary with cache stats or empty dict if Redis unavailable
    """
    client = get_redis_client()
    if client is None:
        return {"status": "unavailable"}

    try:
        info = client.info("stats")
        return {
            "status": "available",
            "total_keys": client.dbsize(),
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "hit_rate": (
                info.get("keyspace_hits", 0) /
                max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1)
            ) * 100
        }
    except redis.RedisError as e:
        logger.warning(f"Error getting cache stats: {e}")
        return {"status": "error", "error": str(e)}
