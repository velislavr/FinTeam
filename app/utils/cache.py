import json
import hashlib
from functools import wraps
from typing import Any, Callable

import redis

from app.config import settings

_redis: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def _make_key(prefix: str, args: tuple, kwargs: dict) -> str:
    raw = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"finteam:{prefix}:{digest}"


def cached(prefix: str, ttl: int | None = None) -> Callable:
    """Cache decorator that stores results in Redis with a TTL.

    Usage:
        @cached("sentiment", ttl=300)
        def analyze(ticker: str) -> dict: ...
    """
    if ttl is None:
        ttl = settings.cache_ttl_seconds

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            r = get_redis()
            key = _make_key(prefix, args, kwargs)

            hit = r.get(key)
            if hit is not None:
                return json.loads(hit)

            result = func(*args, **kwargs)
            r.setex(key, ttl, json.dumps(result, default=str))
            return result

        return wrapper

    return decorator
