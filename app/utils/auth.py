import secrets

from app.utils.cache import get_redis


REDIS_PREFIX = "finteam:key"


def _key(api_key: str) -> str:
    return f"{REDIS_PREFIX}:{api_key}"


def create_key(limit: int) -> str:
    """Generate a new API key and store it in Redis with a usage limit."""
    api_key = f"ft-{secrets.token_hex(12)}"
    r = get_redis()
    r.hset(_key(api_key), mapping={"limit": limit, "used": 0})
    return api_key


def validate_key(api_key: str) -> dict:
    """Check if a key is valid and return remaining uses.

    Returns:
        {"valid": True, "remaining": N} or {"valid": False, "remaining": 0}
    """
    r = get_redis()
    data = r.hgetall(_key(api_key))
    if not data:
        return {"valid": False, "remaining": 0}

    limit = int(data["limit"])
    used = int(data["used"])
    remaining = max(limit - used, 0)
    return {"valid": remaining > 0, "remaining": remaining}


def increment_usage(api_key: str) -> None:
    """Increment the usage counter for a key."""
    r = get_redis()
    r.hincrby(_key(api_key), "used", 1)


def list_keys() -> list[dict]:
    """List all API keys with their usage stats."""
    r = get_redis()
    keys = []
    for redis_key in r.scan_iter(f"{REDIS_PREFIX}:*"):
        api_key = redis_key.removeprefix(f"{REDIS_PREFIX}:")
        data = r.hgetall(redis_key)
        limit = int(data.get("limit", 0))
        used = int(data.get("used", 0))
        keys.append({
            "key": api_key,
            "limit": limit,
            "used": used,
            "remaining": max(limit - used, 0),
        })
    return keys


def revoke_key(api_key: str) -> bool:
    """Delete an API key. Returns True if the key existed."""
    r = get_redis()
    return r.delete(_key(api_key)) > 0
