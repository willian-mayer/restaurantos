# RestaurantOS — Sprint 1 starter

## Includes
- Supabase SQL migration for tenants, profiles, memberships, branches, tables, RLS and role helpers.
- FastAPI starter with Supabase JWT verification (asymmetric JWKS), tenant role checks and branch endpoints.
- Architecture and security notes in `docs/architecture.md`.

## Run
1. Create a Supabase project and apply `supabase/migrations/0001_core.sql` in the SQL editor.
2. Enable an asymmetric JWT signing key (RS256 or ES256) in Supabase Auth; this sample does not support legacy HS256 JWTs.
3. `cd apps/api && python -m venv .venv && source .venv/bin/activate` (Windows: `.venv\\Scripts\\activate`).
4. `pip install -r requirements.txt`.
5. Copy `.env.example` to `.env` and set your own Supabase values. **Never commit `.env`**.
6. `uvicorn app.main:app --reload`.
7. Open `http://localhost:8000/docs`.
8. With configured `.env`, run `pytest`.

## Provision first tenant
Tenant creation and owner membership must happen together in a privileged, authenticated onboarding transaction (not implemented in this starter). For a local prototype only, provision the first tenant and membership using Supabase SQL editor with a known auth.users UUID. Never accept arbitrary `user_id` or `role` from an unauthenticated client.

## Limitations
This is a foundation, **not a deployable payment/order system**. Onboarding, QR activation/session proof, audit trail, payment webhooks, idempotency, full API coverage, rate limits, end-to-end tests, and country-specific compliance are later deliverables. No public anonymous access is granted to database tables. The `automatic` QR setting is configuration only, not a security bypass.
