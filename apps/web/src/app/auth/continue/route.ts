
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const baseUrl = new URL(request.url).origin;

  if (authError || !user) {
    return NextResponse.redirect(
      new URL("/login", baseUrl)
    );
  }

  // Global platform administrator
  const { data: isAdmin, error: roleError } =
    await supabase.rpc("is_platform_admin");

  if (roleError) {
    console.error("Role check failed:", roleError.message);

    return new NextResponse(
      "Unable to verify account permissions",
      { status: 503 }
    );
  }

  if (isAdmin === true) {
    return NextResponse.redirect(
      new URL("/platform", baseUrl)
    );
  }

  // Restaurant membership
  const { data: membership, error: membershipError } =
    await supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

  if (membershipError) {
    console.error(
      "Membership check failed:",
      membershipError.message
    );

    return new NextResponse(
      "Unable to verify restaurant membership",
      { status: 503 }
    );
  }

  if (membership) {
    return NextResponse.redirect(
      new URL("/dashboard", baseUrl)
    );
  }

  return NextResponse.redirect(
    new URL("/onboarding", baseUrl)
  );
}
