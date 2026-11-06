from uuid import UUID
from fastapi import HTTPException
from ..core.db import admin_client


def require_membership(user_id: UUID, tenant_id: UUID, allowed_roles: set[str] | None = None) -> dict:
    response = (admin_client().table("tenant_memberships")
        .select("role,is_active")
        .eq("tenant_id", str(tenant_id))
        .eq("user_id", str(user_id))
        .limit(1).execute())
    membership = response.data[0] if response.data else None
    if not membership or not membership["is_active"]:
        raise HTTPException(status_code=403, detail="Tenant access denied")
    if allowed_roles and membership["role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient role")
    return membership
