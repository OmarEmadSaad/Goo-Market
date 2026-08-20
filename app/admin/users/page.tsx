import Image from "next/image";

import { EmptyState } from "@/components/ui/States";
import UserRoleActions from "./UserRoleActions";
import { getCurrentUser } from "@/lib/server/session";
import {
  DEFAULT_AVATAR,
  getDisplayName,
  getEmail,
  getRole,
  listUserEntries,
} from "@/lib/server/users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [entries, currentUser] = await Promise.all([
    listUserEntries(),
    getCurrentUser(),
  ]);

  const users = entries.map(({ record }) => ({
    id: String(record.id ?? ""),
    name: getDisplayName(record) || "Unnamed",
    email: getEmail(record) || "Not set",
    gender: String(record.gender ?? "Not set"),
    role: getRole(record),
    image: typeof record.image === "string" && record.image ? record.image : DEFAULT_AVATAR,
    cartItems: Array.isArray(record.cart) ? record.cart.length : 0,
  }));

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Users</h1>

      {users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--gm-border)]">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Registered users with their role and cart size
            </caption>
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th scope="col" className="p-3 font-medium">User</th>
                <th scope="col" className="p-3 font-medium">Email</th>
                <th scope="col" className="p-3 font-medium">Gender</th>
                <th scope="col" className="p-3 font-medium">Role</th>
                <th scope="col" className="p-3 font-medium">Cart</th>
                <th scope="col" className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--gm-border)]">
                  <th scope="row" className="p-3 font-medium">
                    <span className="flex items-center gap-3">
                      <Image
                        src={user.image}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      {user.name}
                      {user.id === currentUser?.id ? (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-normal text-green-800 dark:bg-green-500/20 dark:text-green-300">
                          You
                        </span>
                      ) : null}
                    </span>
                  </th>
                  <td className="p-3 break-all">{user.email}</td>
                  <td className="p-3">{user.gender}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3 tabular-nums">{user.cartItems}</td>
                  <td className="p-3">
                    <UserRoleActions
                      userId={user.id}
                      name={user.name}
                      role={user.role}
                      isSelf={user.id === currentUser?.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
