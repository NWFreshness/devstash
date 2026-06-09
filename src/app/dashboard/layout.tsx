import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemTypeCounts } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Footer shows the authenticated user; data queries still use the demo user
  // (seeded data is owned by the demo user — per-user data is out of scope here).
  const [session, demoUser] = await Promise.all([auth(), getDemoUser()]);
  const userId = demoUser?.id ?? null;
  const [itemTypes, collections] = await Promise.all([
    getItemTypeCounts(userId),
    getSidebarCollections(userId),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={session?.user ?? null}
        itemTypes={itemTypes}
        collections={collections}
      />
      <SidebarInset>
        <TopBar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
