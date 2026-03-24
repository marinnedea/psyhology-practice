import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import ClientProfileForm from "./ClientProfileForm";

export default async function ClientProfilePage() {
  const user = await requireRole("CLIENT");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true },
  });

  if (!dbUser) {
    return (
      <div className="text-red-600 text-sm">User not found.</div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update your account information.
        </p>
      </div>
      <ClientProfileForm user={dbUser} />
    </div>
  );
}
