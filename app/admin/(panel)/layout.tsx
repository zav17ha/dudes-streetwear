import Link from "next/link";
import { ExternalLink, LogOut, Plus, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { requireAdmin } from "@/lib/session";
import { storageMode } from "@/lib/store";
import { mediaMode } from "@/lib/media";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const storage = storageMode();
  const media = mediaMode();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-bone/10 bg-ink/95">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo variant="mark" className="h-8 w-auto" />
            <span className="font-display text-xl uppercase">
              Dudes <span className="text-bone/40">/ Admin</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] sm:gap-2">
            <Link href="/admin/products/new" className="bg-fire-x flex items-center gap-1.5 px-3 py-2 font-bold text-ink">
              <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New product</span>
            </Link>
            {me.role === "admin" && (
              <Link href="/admin/users" className="flex items-center gap-1.5 px-3 py-2 text-bone/60 hover:text-bone">
                <Users className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Team</span>
              </Link>
            )}
            <a href="/" target="_blank" className="flex items-center gap-1.5 px-3 py-2 text-bone/60 hover:text-bone">
              <ExternalLink className="h-3.5 w-3.5" /> <span className="hidden sm:inline">View store</span>
            </a>
            <span className="hidden border-l border-bone/10 pl-3 text-bone/40 normal-case tracking-normal lg:inline">
              Signed in as <span className="text-bone/80">{me.username}</span>
            </span>
            <form action={logout}>
              <button className="flex items-center gap-1.5 px-3 py-2 text-bone/60 hover:text-bone" aria-label="Log out">
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      {(storage !== "redis" || media !== "blob") && (
        <div className="container-x pt-6">
          <div className="border border-ember/30 bg-ember/[0.07] p-4 text-sm text-bone/80">
            {storage === "seed" && (
              <p>
                <strong className="text-ember">Database not connected — changes can&apos;t be saved.</strong> In Vercel, open your project →
                Storage → connect <em>Upstash for Redis</em>, then redeploy.
              </p>
            )}
            {storage === "file" && <p>Local development mode: products are saved to <code>.data/products.json</code>.</p>}
            {media === "none" && (
              <p className="mt-1">
                <strong className="text-ember">Image storage not connected — uploads won&apos;t work.</strong> In Vercel → Storage → create a
                Blob store and connect it to this project, then redeploy.
              </p>
            )}
            {media === "local" && <p className="mt-1">Local development mode: uploads are saved to <code>public/uploads</code>.</p>}
          </div>
        </div>
      )}

      <main className="container-x py-8 md:py-12">{children}</main>
    </>
  );
}
