
import os

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/restaurants",
    tags=["restaurants"],
)


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


@router.post("", status_code=201)
async def create_restaurant(
    payload: CreateRestaurantRequest,
    authorization: str | None = Header(default=None),
):
    if not authorization or not authorization.startswith(
        "Bearer "
    ):
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

    supabase_url = os.environ["SUPABASE_URL"].rstrip("/")
    public_key = os.environ["SUPABASE_PUBLISHABLE_KEY"]

    url = (
        f"{supabase_url}/rest/v1/rpc/create_restaurant"
    )

    headers = {
        "apikey": public_key,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    body = {
        "p_restaurant_name": payload.restaurant_name,
        "p_branch_name": payload.branch_name,
        "p_currency_code": payload.currency_code,
        "p_timezone": payload.timezone,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                url,
                json=body,
                headers=headers,
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable",
        )

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=401,
            detail="Invalid session or insufficient permissions",
        )

    if response.status_code >= 400:
        # Do not expose raw database errors to clients.
        raise HTTPException(
            status_code=400,
            detail="Unable to create restaurant",
        )

    tenant_id = response.json()

    return {
        "restaurant_id": tenant_id,
        "message": "Restaurant created successfully",
    }
