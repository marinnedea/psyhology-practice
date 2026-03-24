import { requireAuth } from "@/lib/auth-helpers";
import { getSettings } from "@/lib/settings";
import DashboardNav, { type NavEntry } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings] = await Promise.all([requireAuth(), getSettings()]);
  const ticketingEnabled = settings.ticketing_enabled === "1";

  const adminNav: NavEntry[] = [
    { type: "item", href: "/admin", label: "Overview" },
    {
      type: "group", group: "Pages",
      items: [
        { href: "/admin/homepage",      label: "Homepage" },
        { href: "/admin/services",      label: "Services" },
        { href: "/admin/about",         label: "About" },
        { href: "/admin/contact-page",  label: "Contact" },
        { href: "/admin/organisations", label: "Organisations" },
      ],
    },
    { type: "item", href: "/admin/testimonials", label: "Testimonials" },
    {
      type: "group", group: "Blog",
      items: [
        { href: "/admin/blog",            label: "Posts" },
        { href: "/admin/blog-categories", label: "Categories" },
      ],
    },
    { type: "item", href: "/admin/legal",  label: "Legal Pages" },
    { type: "item", href: "/admin/users",  label: "Users" },
    {
      type: "group", group: "Inbox",
      items: [
        { href: "/admin/newsletter", label: "Newsletter" },
        { href: "/admin/contact",    label: "Messages" },
        ...(ticketingEnabled ? [{ href: "/admin/tickets", label: "Tickets" }] : []),
      ],
    },
    {
      type: "group", group: "Settings",
      items: [
        { href: "/admin/settings", label: "Site Settings" },
      ],
    },
  ];

  const psychologistNav: NavEntry[] = [
    { type: "item", href: "/psychologist",              label: "Overview" },
    { type: "item", href: "/psychologist/profile",      label: "My Profile" },
    { type: "item", href: "/psychologist/availability", label: "Availability" },
    { type: "item", href: "/psychologist/appointments", label: "Appointments" },
    { type: "item", href: "/psychologist/blog",         label: "My Blog Posts" },
    ...(ticketingEnabled ? [{ type: "item" as const, href: "/psychologist/support", label: "Support" }] : []),
  ];

  const clientNav: NavEntry[] = [
    { type: "item", href: "/client",              label: "Overview" },
    { type: "item", href: "/client/profile",      label: "My Profile" },
    { type: "item", href: "/client/appointments", label: "My Appointments" },
    ...(ticketingEnabled ? [{ type: "item" as const, href: "/client/support", label: "Support" }] : []),
  ];

  const navByRole: Record<string, NavEntry[]> = {
    ADMIN: adminNav,
    PSYCHOLOGIST: psychologistNav,
    CLIENT: clientNav,
  };

  const entries = navByRole[user.role as string] ?? clientNav;

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-56 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 p-4 hidden md:flex flex-col gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Signed in as</p>
          <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{user.name}</p>
          <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded">
            {user.role}
          </span>
        </div>
        <DashboardNav entries={entries} />
      </aside>
      <div className="flex-1 p-6 bg-white dark:bg-slate-800">{children}</div>
    </div>
  );
}
