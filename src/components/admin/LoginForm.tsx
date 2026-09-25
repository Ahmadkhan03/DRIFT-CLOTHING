"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Email</span>
        <input name="email" type="email" required autoComplete="email" className="h-12 border border-line bg-paper px-3 text-sm outline-none focus:border-ink" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-12 border border-line bg-paper px-3 text-sm outline-none focus:border-ink"
        />
      </label>
      {state && !state.ok && <p className="border-l-2 border-maroon bg-blush/60 px-3 py-2 text-sm text-maroon">{state.message}</p>}
      <Button type="submit" variant="maroon" disabled={pending} className="mt-2 h-12">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
