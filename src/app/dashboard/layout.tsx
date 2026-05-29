import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
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
  const user = await getDemoUser();
  const userId = user?.id ?? null;
  const [itemTypes, collections] = await Promise.all([
    getItemTypeCounts(userId),
    getSidebarCollections(userId),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar user={user} itemTypes={itemTypes} collections={collections} />
      <SidebarInset>
        <TopBar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
