"""
Gestion des refresh tokens via Redis.
- Access token  : JWT, durée courte (30 min)
- Refresh token : token opaque aléatoire stocké dans Redis, durée longue (30 jours)
"""
import secrets
import redis as redis_lib
from app.config import settings

REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60  # 30 jours en secondes

_client: redis_lib.Redis | None = None


def _get_redis() -> redis_lib.Redis:
    global _client
    if _client is None:
        _client = redis_lib.from_url(settings.redis_url, decode_responses=True)
    return _client


def create_refresh_token(user_id: str) -> str:
    """Génère un refresh token et le stocke dans Redis avec TTL de 30 jours."""
    token = secrets.token_urlsafe(32)
    _get_redis().setex(f"refresh:{token}", REFRESH_TOKEN_TTL, user_id)
    return token


def validate_refresh_token(token: str) -> str | None:
    """Retourne le user_id si le token est valide, None sinon."""
    return _get_redis().get(f"refresh:{token}")


def revoke_refresh_token(token: str) -> None:
    """Invalide un refresh token (logout)."""
    _get_redis().delete(f"refresh:{token}")
