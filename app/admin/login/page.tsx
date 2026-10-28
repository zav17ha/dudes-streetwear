import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/session";
import { adminConfigured } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-[-50%] h-[90%] bg-[radial-gradient(closest-side,rgba(150,120,240,0.12),transparent_75%)]" />
      <div className="relative w-full max-w-sm">
        <Logo variant="wordmark" className="mx-auto w-56" />
        <div className="mt-10 border border-bone/10 bg-coal/80 p-8 backdrop-blur">
          <h1 className="font-display text-3xl uppercase">Store admin</h1>
          <p className="mt-1 text-sm text-bone/50">Sign in to manage the Dudes store.</p>
          {!adminConfigured() && (
            <p className="mt-6 border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
              Set an <code>ADMIN_PASSWORD</code> environment variable (Vercel → Settings → Environment Variables), then redeploy.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
