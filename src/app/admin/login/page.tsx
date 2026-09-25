import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin, isDemoMode } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-maroon-deep p-10 text-bone lg:flex">
        <p className="label text-bone/60">Store admin</p>
        <p className="font-display text-[14vw] font-black uppercase leading-[0.8]">Drift</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="label text-maroon">Staff only</p>
          <h1 className="font-display mt-2 text-6xl font-black uppercase leading-[0.9]">Sign in</h1>
          {isDemoMode() ? (
            <p className="mt-8 border-l-2 border-maroon bg-blush/60 px-4 py-3 text-sm text-maroon">
              Admin isn&apos;t connected yet. Add the Supabase keys to the server environment to enable sign-in.
            </p>
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
}
