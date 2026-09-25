import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/lib/supabase/server";
import { createAuthClient, isAuthConfigured } from "@/lib/supabase/auth";

export type Admin = {
  email: string;
  name: string;
  role: "owner" | "admin" | "staff";
  demo: boolean;
};

/**
 * Demo mode: before Supabase is connected, the admin runs on sample data
 * with no login, but ONLY in local development. In production it is locked.
 */
export function isDemoMode() {
  return !getDb() || !isAuthConfigured();
}

export const getAdmin = cache(async (): Promise<Admin | null> => {
  // Admin pages are always rendered per request, never prerendered at build time.
  await connection();

  if (isDemoMode()) {
    return process.env.NODE_ENV === "production"
      ? null
      : { email: "demo@drift.local", name: "Demo Admin", role: "owner", demo: true };
  }

  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: staff } = await getDb()!
    .from("staff")
    .select("email, full_name, role")
    .eq("email", user.email.toLowerCase())
    .maybeSingle<{ email: string; full_name: string | null; role: Admin["role"] }>();
  if (!staff) return null;

  return { email: staff.email, name: staff.full_name ?? staff.email, role: staff.role, demo: false };
});

/** Call at the top of every admin page and admin server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
