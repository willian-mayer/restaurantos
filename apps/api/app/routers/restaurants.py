
import logging
import os

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field


# --------------------------------------------------
# Logging
# --------------------------------------------------

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Router
# --------------------------------------------------

router = APIRouter(
    prefix="/restaurants",
    tags=["restaurants"],
)


# --------------------------------------------------
# Request Models
# --------------------------------------------------

class CreateRestaurantRequest(BaseModel):
    restaurant_name: str = Field(
        min_length=2,
        max_length=100,
    )

    branch_name: str = Field(
        default="Main Branch",
        min_length=2,
        max_length=100,
    )

    currency_code: str = Field(
        default="USD",
        pattern=r"^[A-Z]{3}$",
    )

    timezone: str = Field(
        default="UTC",
        min_length=1,
        max_length=100,
    )


# --------------------------------------------------
# Create Restaurant
# --------------------------------------------------

@router.post("", status_code=201)
async def create_restaurant(
    payload: CreateRestaurantRequest,
    authorization: str | None = Header(default=None),
):
    # ----------------------------------------------
    # 1. Validate authorization header
    # ----------------------------------------------

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    access_token = authorization[7:].strip()

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    # ----------------------------------------------
    # 2. Load Supabase configuration
    # ----------------------------------------------

    supabase_url = os.getenv("SUPABASE_URL")
    public_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

    if not supabase_url or not public_key:
        logger.error(
            "Supabase configuration is missing. "
            "Check SUPABASE_URL and "
            "SUPABASE_PUBLISHABLE_KEY."
        )

        raise HTTPException(
            status_code=503,
            detail="Supabase configuration is missing",
        )

    supabase_url = supabase_url.rstrip("/")

    # ----------------------------------------------
    # 3. Prepare Supabase RPC request
    # ----------------------------------------------

    url = (
        f"{supabase_url}/rest/v1/rpc/create_restaurant"
    )

    headers = {
        "apikey": public_key,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    body = {
        "p_restaurant_name": payload.restaurant_name.strip(),
        "p_branch_name": payload.branch_name.strip(),
        "p_currency_code": payload.currency_code,
        "p_timezone": payload.timezone,
    }

    logger.info(
        "Creating restaurant: %s",
        payload.restaurant_name,
    )

    # ----------------------------------------------
    # 4. Call Supabase RPC
    # ----------------------------------------------

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                url,
                json=body,
                headers=headers,
            )

    except httpx.TimeoutException as exc:
        logger.warning(
            "Supabase request timed out: %s",
            type(exc).__name__,
        )

        raise HTTPException(
            status_code=504,
            detail="Database request timed out",
        ) from exc

    except httpx.RequestError as exc:
        logger.error(
            "Unable to connect to Supabase. Error: %s",
            type(exc).__name__,
        )

        raise HTTPException(
            status_code=503,
            detail="Database service unavailable",
        ) from exc

    # ----------------------------------------------
    # 5. Handle Supabase response
    # ----------------------------------------------

    if response.status_code == 401:
        logger.warning(
            "Supabase rejected authentication: HTTP 401"
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session",
        )

    if response.status_code == 403:
        logger.warning(
            "Supabase denied permission: HTTP 403"
        )

        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions",
        )

    if response.status_code >= 400:
        # Log only the HTTP status and safe error code.
        # Do not log tokens or raw request headers.
        error_code = "unknown"

        try:
            error_payload = response.json()

            if isinstance(error_payload, dict):
                error_code = str(
                    error_payload.get("code", "unknown")
                )
        except ValueError:
            pass

        logger.error(
            "Supabase RPC failed. HTTP status: %s, "
            "error code: %s",
            response.status_code,
            error_code,
        )

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to create restaurant. "
                f"Database error code: {error_code}"
            ),
        )

    # ----------------------------------------------
    # 6. Parse successful response
    # ----------------------------------------------

    try:
        tenant_id = response.json()
    except ValueError as exc:
        logger.error(
            "Supabase returned an invalid JSON response"
        )

        raise HTTPException(
            status_code=502,
            detail="Invalid database response",
        ) from exc

    if not isinstance(tenant_id, str):
        logger.error(
            "Supabase returned an unexpected restaurant ID"
        )

        raise HTTPException(
            status_code=502,
            detail="Invalid restaurant ID",
        )

    # ----------------------------------------------
    # 7. Return success response
    # ----------------------------------------------

    logger.info(
        "Restaurant created successfully"
    )

    return {
        "restaurant_id": tenant_id,
        "message": "Restaurant created successfully",
    }
