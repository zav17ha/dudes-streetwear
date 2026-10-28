import { requireRole } from "@/lib/session";
import { listUsers, usersWritable } from "@/lib/users";
import { TeamManager } from "@/components/admin/TeamManager";

export const metadata = { title: "Team" };

export default async function UsersPage() {
  const me = await requireRole("admin");
  const users = await listUsers();
  return (
    <>
      <p className="eyebrow text-ember">Access</p>
      <h1 className="mt-2 font-display text-5xl uppercase md:text-6xl">Team logins</h1>
      <p className="mt-3 max-w-xl text-sm text-bone/55">
        Create a login for anyone who helps run the store. Share the details in one tap, and reset or remove access at any time.
      </p>
      <TeamManager users={users} me={me.username} writable={usersWritable()} />
    </>
  );
}
