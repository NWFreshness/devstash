import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { ItemDrawerProvider } from "@/components/items/item-drawer";
import { auth } from "@/auth";
import { getCollectionsForSelect, getSidebarCollections, getSearchCollections } from "@/lib/db/collections";
import { getItemTypeCounts, getSearchItems } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { EditorPreferencesProvider } from "@/contexts/editor-preferences-context";
import { parseEditorPreferences } from "@/types/editor-preferences";

export async function AppShell({ children }: { children: React.ReactNode }) {
  // Sidebar footer shows the authenticated user fetched fresh from DB.
  // Item counts and collections still use the demo user's seeded data.
  const [session, demoUser] = await Promise.all([auth(), getDemoUser()]);
  const sessionUserId = session?.user?.id;
  const demoUserId = demoUser?.id ?? null;

  const [authUser, itemTypes, collections, collectionsForSelect, searchItems, searchCollections] =
    await Promise.all([
      sessionUserId
        ? prisma.user.findUnique({
            where: { id: sessionUserId },
            select: { name: true, email: true, image: true, editorPreferences: true },
          })
        : null,
      getItemTypeCounts(demoUserId),
      getSidebarCollections(demoUserId),
      getCollectionsForSelect(demoUserId),
      getSearchItems(demoUserId),
      getSearchCollections(demoUserId),
    ]);

  const editorPrefs = parseEditorPreferences(authUser?.editorPreferences);

  return (
    <SidebarProvider>
      <AppSidebar
        user={authUser ?? session?.user ?? null}
        itemTypes={itemTypes}
        collections={collections}
      />
      <SidebarInset>
        <EditorPreferencesProvider prefs={editorPrefs}>
          <ItemDrawerProvider collections={collectionsForSelect}>
            <TopBar
              collections={collectionsForSelect}
              searchItems={searchItems}
              searchCollections={searchCollections}
            />
            <main id="main-content" className="flex-1 overflow-auto p-6">{children}</main>
          </ItemDrawerProvider>
        </EditorPreferencesProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
