# Architecture decisions

- **Shared database, shared schema:** tenant-scoped records, composite FKs for branch/table consistency, RLS for direct Supabase access.
- **Service-role API:** FastAPI uses a privileged Supabase client only after verifying the Supabase access JWT and checking tenant membership and roles. Service-role requests bypass RLS, so endpoint checks are mandatory. Do not expose service-role secrets to Next.js or browser bundles.
- **RLS:** users can read tenant records only when active members; branch/table writes are role-restricted. Tenant and membership mutations are intentionally unavailable to browser clients. The API must enforce immutable `tenant_id` and branch ownership on updates.
- **QR hybrid:** `branches.qr_mode` can be `automatic` or `staff_approval`. QR locators are public references, not authority to order. A later short-lived guest session capability must be issued after appropriate presence/approval checks, rate limiting and anti-replay controls.
- **Financial records:** use integer minor currency units, snapshot item prices and tax, idempotency keys, provider-confirmed webhook settlement, and atomic exit-pass redemption. Not implemented in Sprint 1.
- **JWT:** starter accepts asymmetric Supabase JWTs from JWKS only; configure RS256/ES256 signing. Validate token issuer/audience/expiry. Production should also consider key rotation, revocation/session invalidation requirements and upstream outages.
- **Deployment:** FastAPI private env secrets; Next.js only public Supabase publishable key. Add CI, migrations automation, logs, rate limits, and monitoring before production.
- **Next.js:** not included in this initial backend/database bundle; build the web workspace after contracts and onboarding endpoints are finalized.
