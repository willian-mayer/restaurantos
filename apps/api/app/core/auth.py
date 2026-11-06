from typing import Annotated
from uuid import UUID
import jwt
from jwt import PyJWKClient
from fastapi import Depends, Header, HTTPException
from .config import Settings, get_settings

_jwks_clients: dict[str, PyJWKClient] = {}

def current_user_id(
    authorization: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        client = _jwks_clients.setdefault(
            settings.supabase_url,
            PyJWKClient(f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"),
        )
        key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token, key.key, algorithms=["RS256", "ES256"],
            issuer=settings.supabase_jwt_issuer,
            audience=settings.supabase_jwt_audience,
            options={"require": ["exp", "sub", "iss", "aud"]},
        )
        return UUID(payload["sub"])
    except (jwt.PyJWTError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid access token") from exc
