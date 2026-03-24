import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import AdminUserActions from "@/components/dashboard/AdminUserActions";
import AdminCreateUserButton from "@/components/dashboard/AdminCreateUserButton";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  PSYCHOLOGIST: "bg-indigo-100 text-indigo-800",
  CLIENT: "bg-gray-100 text-gray-700",
};

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ role?: string; approved?: string; page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const roleFilter = params.role as "ADMIN" | "PSYCHOLOGIST" | "CLIENT" | undefined;
  const approvedFilter = params.approved;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: {
    role?: "ADMIN" | "PSYCHOLOGIST" | "CLIENT";
    isApproved?: boolean;
  } = {};

  if (roleFilter && ["ADMIN", "PSYCHOLOGIST", "CLIENT"].includes(roleFilter)) {
    where.role = roleFilter;
  }
  if (approvedFilter === "false") {
    where.isApproved = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { role: roleFilter, approved: approvedFilter, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    return `/admin/users?${qs.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage platform users, approvals, and access.
          </p>
        </div>
        <AdminCreateUserButton />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-gray-600 font-medium">Filter by role:</span>
        {(["", "ADMIN", "PSYCHOLOGIST", "CLIENT"] as const).map((r) => (
          <Link
            key={r || "ALL"}
            href={buildUrl({ role: r || undefined, page: "1" })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              (r === "" ? !roleFilter : roleFilter === r)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {r || "All"}
          </Link>
        ))}
        <span className="ml-4 text-sm text-gray-600 font-medium">Status:</span>
        <Link
          href={buildUrl({ approved: undefined, page: "1" })}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            !approvedFilter
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
        </Link>
        <Link
          href={buildUrl({ approved: "false", page: "1" })}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            approvedFilter === "false"
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Pending Approval
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total} users
          </p>
        </div>
        {users.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No users match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Approved</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-5 py-3 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          roleBadge[user.role] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.isApproved ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <AdminUserActions
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                        currentRole={user.role}
                        isApproved={user.isApproved}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
