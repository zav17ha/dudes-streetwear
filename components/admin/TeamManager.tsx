"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Crown, Eye, EyeOff, KeyRound, Loader2, RefreshCw, Shield, Trash2, UserPlus, X } from "lucide-react";
import type { PublicUser, Role } from "@/lib/users";
import { createUserAction, deleteUserAction, updateUserAction } from "@/app/admin/actions";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/format";

const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 12) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (v) => ALPHABET[v % ALPHABET.length]).join("");
}

function toUsername(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 32);
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const ROLES: { value: Role; label: string; text: string }[] = [
  { value: "editor", label: "Editor", text: "Can add & edit products" },
  { value: "admin", label: "Admin", text: "Products + manage team logins" },
];

type Credentials = { name: string; username: string; password: string; reset?: boolean };

/** One-time panel with the login details and quick ways to share them. */
function CredentialsPanel({ creds, onClose }: { creds: Credentials; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [loginUrl, setLoginUrl] = useState("/admin/login");
  useEffect(() => setLoginUrl(`${window.location.origin}/admin/login`), []);

  const text = [
    `Hey ${creds.name}! ${creds.reset ? "Your Dudes store password was reset." : "Here's your login for the Dudes store admin."}`,
    ``,
    `Login: ${loginUrl}`,
    `Username: ${creds.username}`,
    `Password: ${creds.password}`,
  ].join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      className="relative overflow-hidden border border-ember/40 bg-gradient-to-br from-ember/15 via-coal to-coal p-6"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-bone/50 hover:text-bone" aria-label="Close">
        <X className="h-5 w-5" />
      </button>
      <p className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ember">
        <Check className="h-4 w-4" /> {creds.reset ? "Password reset" : "Login created"}
      </p>
      <h3 className="mt-2 font-display text-3xl uppercase">Share these details with {creds.name}</h3>
      <p className="mt-1 text-sm text-bone/50">The password is only shown now. Send it before you close this.</p>

      <dl className="mt-5 grid gap-px bg-bone/10 font-mono text-sm sm:grid-cols-3">
        {[
          ["Login page", loginUrl],
          ["Username", creds.username],
          ["Password", creds.password],
        ].map(([k, v]) => (
          <div key={k} className="bg-ink p-4">
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-bone/40">{k}</dt>
            <dd className="mt-1 break-all text-bone">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-2 bg-bone px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy login details"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-whatsapp px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink"
        >
          <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export function TeamManager({ users, me, writable }: { users: PublicUser[]; me: string; writable: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState<Credentials | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [password, setPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(true);
  const [role, setRole] = useState<Role>("editor");

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createUserAction({ name, username, password, role });
      if (!res.ok) return setError(res.error);
      setCreds({ name: name || username, username, password });
      setName("");
      setUsername("");
      setUsernameTouched(false);
      setPassword(generatePassword());
      setRole("editor");
      router.refresh();
    });
  };

  const run = (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => {
    setBusy(key);
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else after?.();
      router.refresh();
      setBusy(null);
    });
  };

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <AnimatePresence>{creds && <CredentialsPanel creds={creds} onClose={() => setCreds(null)} />}</AnimatePresence>

        {error && <p className="border border-flame/40 bg-flame/10 p-4 text-sm text-flame">{error}</p>}

        <ul className="divide-y divide-bone/10 border border-bone/10">
          {users.map((u) => (
            <li key={u.username} className={cn("flex flex-wrap items-center gap-4 p-4 transition-opacity", busy?.endsWith(u.username) && "opacity-50")}>
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center font-display text-lg uppercase",
                  u.owner ? "bg-fire-x text-ink" : "bg-bone/10 text-bone",
                )}
              >
                {u.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{u.name}</span>
                  {u.owner ? (
                    <span className="flex items-center gap-1 bg-ember/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ember">
                      <Crown className="h-3 w-3" /> Owner
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]",
                        u.role === "admin" ? "bg-blood/20 text-flame" : "bg-bone/10 text-bone/60",
                      )}
                    >
                      {u.role === "admin" && <Shield className="h-3 w-3" />} {u.role}
                    </span>
                  )}
                  {u.username === me && <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-bone/40">(you)</span>}
                </p>
                <p className="font-mono text-xs text-bone/45">
                  @{u.username}
                  {!u.owner && <> · last login {timeAgo(u.lastLoginAt)}</>}
                </p>
              </div>

              {u.owner ? (
                <p className="max-w-[16rem] text-xs text-bone/35">Set with the ADMIN_USERNAME / ADMIN_PASSWORD environment variables.</p>
              ) : (
                <div className="flex items-center gap-1">
                  <select
                    value={u.role}
                    disabled={!writable || pending}
                    onChange={(e) => run(`role-${u.username}`, () => updateUserAction(u.username, { role: e.target.value as Role }))}
                    className="field w-auto py-1.5 pr-3 font-mono text-[0.68rem] uppercase"
                    aria-label={`Role for ${u.username}`}
                  >
                    <option value="editor" className="bg-coal">Editor</option>
                    <option value="admin" className="bg-coal">Admin</option>
                  </select>
                  <button
                    disabled={!writable || pending}
                    title="Reset password"
                    aria-label={`Reset password for ${u.username}`}
                    onClick={() => {
                      const pw = generatePassword();
                      run(`reset-${u.username}`, () => updateUserAction(u.username, { password: pw }), () =>
                        setCreds({ name: u.name, username: u.username, password: pw, reset: true }),
                      );
                    }}
                    className="grid h-9 w-9 place-items-center text-bone/50 hover:bg-bone/10 hover:text-bone disabled:opacity-30"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    disabled={!writable || pending || u.username === me}
                    title="Remove login"
                    aria-label={`Remove ${u.username}`}
                    onClick={() => {
                      if (confirm(`Remove ${u.name}'s login? They will be signed out immediately.`)) run(`del-${u.username}`, () => deleteUserAction(u.username));
                    }}
                    className="grid h-9 w-9 place-items-center text-bone/50 hover:bg-blood/20 hover:text-flame disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {users.length === 1 && <p className="text-sm text-bone/40">No team logins yet. Create one with the form.</p>}
      </div>

      <form onSubmit={create} className="h-fit border border-bone/10 bg-coal p-6 lg:col-span-2">
        <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
          <UserPlus className="h-5 w-5 text-ember" /> New login
        </h2>
        {!writable && (
          <p className="mt-4 border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
            Connect “Upstash for Redis” in Vercel → Storage to create team logins.
          </p>
        )}
        <fieldset disabled={!writable || pending} className="mt-5 grid gap-4 disabled:opacity-50">
          <label className="grid gap-2">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/55">Name</span>
            <input
              className="field"
              required
              value={name}
              placeholder="e.g. Kasun Perera"
              onChange={(e) => {
                setName(e.target.value);
                if (!usernameTouched) setUsername(toUsername(e.target.value));
              }}
            />
          </label>
          <label className="grid gap-2">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/55">Username</span>
            <input
              className="field font-mono"
              required
              value={username}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="kasun.perera"
              onChange={(e) => {
                setUsernameTouched(true);
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
              }}
            />
          </label>
          <div className="grid gap-2">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/55">Password</span>
            <div className="flex">
              <span className="relative flex-1">
                <input
                  className="field pr-11 font-mono"
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-bone/50 hover:text-bone"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="flex items-center gap-1.5 border border-l-0 border-bone/15 px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-bone/70 hover:text-bone"
                title="Generate a strong password"
              >
                <RefreshCw className="h-3.5 w-3.5" /> New
              </button>
            </div>
            <span className="text-xs text-bone/35">A strong password is generated for you. At least 8 characters.</span>
          </div>
          <div className="grid gap-2">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/55">Access</span>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "border p-3 text-left transition-colors",
                    role === r.value ? "border-ember bg-ember/10" : "border-bone/15 hover:border-bone/40",
                  )}
                >
                  <span className="block text-sm font-medium">{r.label}</span>
                  <span className="block text-xs text-bone/45">{r.text}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="bg-fire-x flex items-center justify-center gap-2 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
            {pending && !busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create login
          </button>
        </fieldset>
      </form>
    </div>
  );
}
