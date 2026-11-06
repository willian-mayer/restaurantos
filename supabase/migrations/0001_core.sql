-- RestaurantOS Sprint 1. Run in Supabase SQL editor as a privileged migration.
create extension if not exists pgcrypto;
create schema if not exists app_private;

create type public.membership_role as enum ('owner','admin','manager','waiter','kitchen','cashier','gate');
create type public.qr_activation_mode as enum ('automatic','staff_approval');
create type public.table_status as enum ('available','occupied','disabled');

create table public.tenants (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 2 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 created_at timestamptz not null default now()
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table public.tenant_memberships (
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role public.membership_role not null,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 primary key (tenant_id,user_id)
);
create table public.branches (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 name text not null check (length(trim(name)) > 0),
 timezone text not null default 'UTC',
 currency_code text not null default 'USD' check (currency_code ~ '^[A-Z]{3}$'),
 qr_mode public.qr_activation_mode not null default 'staff_approval',
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 unique (id, tenant_id)
);
create table public.restaurant_tables (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 branch_id uuid not null,
 label text not null check (length(trim(label)) > 0),
 capacity integer not null default 2 check (capacity between 1 and 100),
 status public.table_status not null default 'available',
 -- public QR references an opaque locator, never an authenticated session token
 qr_locator uuid not null unique default gen_random_uuid(),
 created_at timestamptz not null default now(),
 unique (branch_id,label),
 unique (id,branch_id),
 foreign key (branch_id,tenant_id) references public.branches(id,tenant_id) on delete cascade
);
create index memberships_user_idx on public.tenant_memberships(user_id,tenant_id) where is_active;
create index branches_tenant_idx on public.branches(tenant_id);
create index tables_branch_idx on public.restaurant_tables(branch_id);

-- SECURITY DEFINER helpers avoid recursive membership RLS evaluation.
create or replace function app_private.is_member(p_tenant uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.tenant_memberships m
 where m.tenant_id=p_tenant and m.user_id=(select auth.uid()) and m.is_active);
$$;
create or replace function app_private.has_role(p_tenant uuid, p_roles public.membership_role[])
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.tenant_memberships m
 where m.tenant_id=p_tenant and m.user_id=(select auth.uid())
 and m.is_active and m.role=any(p_roles));
$$;
revoke all on function app_private.is_member(uuid) from public;
revoke all on function app_private.has_role(uuid,public.membership_role[]) from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_member(uuid) to authenticated;
grant execute on function app_private.has_role(uuid,public.membership_role[]) to authenticated;

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.branches enable row level security;
alter table public.restaurant_tables enable row level security;

create policy tenants_read on public.tenants for select to authenticated
 using (app_private.is_member(id));
create policy profiles_self_read on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy profiles_self_insert on public.profiles for insert to authenticated with check (id=(select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated
 using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy memberships_read on public.tenant_memberships for select to authenticated
 using (user_id=(select auth.uid()) or app_private.has_role(tenant_id,array['owner','admin','manager']::public.membership_role[]));
create policy branches_read on public.branches for select to authenticated
 using (app_private.is_member(tenant_id));
create policy branches_insert on public.branches for insert to authenticated
 with check (app_private.has_role(tenant_id,array['owner','admin']::public.membership_role[]));
create policy branches_update on public.branches for update to authenticated
 using (app_private.has_role(tenant_id,array['owner','admin','manager']::public.membership_role[]))
 with check (app_private.has_role(tenant_id,array['owner','admin','manager']::public.membership_role[]));
create policy tables_read on public.restaurant_tables for select to authenticated
 using (app_private.is_member(tenant_id));
create policy tables_insert on public.restaurant_tables for insert to authenticated
 with check (app_private.has_role(tenant_id,array['owner','admin','manager']::public.membership_role[]));
create policy tables_update on public.restaurant_tables for update to authenticated
 using (app_private.has_role(tenant_id,array['owner','admin','manager']::public.membership_role[]))
 with check (app_private.has_role(tenant_id,array['owner','admin','manager']::public.membership_role[]));

-- Critical: tenant onboarding and membership/role changes are server-only.
-- No authenticated INSERT/UPDATE/DELETE policies on tenants or memberships.
-- Do not expose the service-role key to browsers. No anonymous table policies.
