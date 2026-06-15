import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemTypeCounts } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  // Sidebar footer shows the authenticated user fetched fresh from DB.
  // Item counts and collections still use the demo user's seeded data.
  const [session, demoUser] = await Promise.all([auth(), getDemoUser()]);
  const sessionUserId = session?.user?.id;
  const demoUserId = demoUser?.id ?? null;

  const [authUser, itemTypes, collections] = await Promise.all([
    sessionUserId
      ? prisma.user.findUnique({
          where: { id: sessionUserId },
          select: { name: true, email: true, image: true },
        })
      : null,
    getItemTypeCounts(demoUserId),
    getSidebarCollections(demoUserId),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={authUser ?? session?.user ?? null}
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
