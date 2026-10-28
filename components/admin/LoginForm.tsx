"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const [show, setShow] = useState(false);
  // Controlled so the username survives React's form reset after a failed attempt
  const [username, setUsername] = useState("");
  return (
    <form action={action} className="mt-6 grid gap-4">
      <label className="grid gap-2">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/50">Username</span>
        <input name="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false} className="field" />
      </label>
      <label className="grid gap-2">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/50">Password</span>
        <span className="relative">
          <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="field pr-12" />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-bone/50 hover:text-bone"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-bone/70 select-none">
        <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 accent-white" />
        Keep me signed in for 30 days
      </label>
      {state?.error && <p className="text-sm text-flame">{state.error}</p>}
      <button
        disabled={pending}
        className="bg-fire-x flex items-center justify-center gap-2 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-opacity disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
