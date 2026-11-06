from functools import lru_cache
from supabase import Client, create_client
from .config import get_settings

@lru_cache
def admin_client() -> Client:
    s = get_settings()
    # Service role bypasses RLS: never call this without explicit authorization checks.
    return create_client(s.supabase_url, s.supabase_service_role_key)
