
import "server-only";

import { createClient } from "@/lib/supabase/server";

export type RestaurantRole =
  | "owner"
  | "admin"
  | "manager"
  | "waiter"
  | "kitchen"
  | "cashier"
  | "gate";

export type RestaurantContext = {
  tenantId: string;
  restaurantName: string;
  restaurantSlug: string;
  role: RestaurantRole;
};

type MembershipRow = {
  tenant_id: string;
  role: RestaurantRole;
  tenants: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function getRestaurantContexts(): Promise<
  RestaurantContext[]
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tenant_memberships")
    .select(
      `
        tenant_id,
        role,
        tenants (
          id,
          name,
          slug
        )
      `
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) {
    console.error(
      "Unable to load restaurant memberships:",
      error.code
    );

    throw new Error("Unable to load restaurant contexts");
  }

  const memberships = (data ?? []) as unknown as MembershipRow[];

  return memberships
    .filter((membership) => membership.tenants !== null)
    .map((membership) => ({
      tenantId: membership.tenant_id,
      restaurantName: membership.tenants!.name,
      restaurantSlug: membership.tenants!.slug,
      role: membership.role,
    }));
}

export async function getRestaurantContext(
  requestedTenantId?: string
): Promise<RestaurantContext | null> {
  const contexts = await getRestaurantContexts();

  if (requestedTenantId) {
    return (
      contexts.find(
        (context) => context.tenantId === requestedTenantId
      ) ?? null
    );
  }

  return contexts[0] ?? null;
}
