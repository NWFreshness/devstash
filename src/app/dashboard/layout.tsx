import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemTypeCounts } from "@/lib/db/items";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [itemTypes, collections] = await Promise.all([
    getItemTypeCounts(),
    getSidebarCollections(),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar itemTypes={itemTypes} collections={collections} />
      <SidebarInset>
        <TopBar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
