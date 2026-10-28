import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { findUser, type PublicUser } from "./users";

/** The signed-in admin user, or null. Also checks the account still exists. */
export async function getSession(): Promise<PublicUser | null> {
  const jar = await cookies();
  const username = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!username) return null;
  return findUser(username);
}

export async function isAdmin() {
  return Boolean(await getSession());
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireRole(role: "admin") {
  const user = await requireAdmin();
  if (user.role !== role) redirect("/admin");
  return user;
}
