
import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data, error } = await supabase.rpc(
    "is_platform_admin"
  );

  if (error) {
    console.error(
      "Platform admin check failed:",
      error.message
    );

    return false;
  }

  return data === true;
}
