from uuid import UUID
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from ..core.auth import current_user_id
from ..core.db import admin_client
from ..services.permissions import require_membership

router = APIRouter(prefix="/v1/tenants/{tenant_id}/branches", tags=["branches"])

class BranchCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    timezone: str = "UTC"
    currency_code: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    qr_mode: str = Field(default="staff_approval", pattern=r"^(automatic|staff_approval)$")

@router.get("")
def list_branches(tenant_id: UUID, user_id: UUID = Depends(current_user_id)):
    require_membership(user_id, tenant_id)
    return (admin_client().table("branches").select("*")
            .eq("tenant_id", str(tenant_id)).execute()).data

@router.post("", status_code=201)
def create_branch(tenant_id: UUID, body: BranchCreate,
                  user_id: UUID = Depends(current_user_id)):
    require_membership(user_id, tenant_id, {"owner", "admin"})
    payload = {**body.model_dump(), "tenant_id": str(tenant_id)}
    return (admin_client().table("branches").insert(payload).execute()).data[0]
