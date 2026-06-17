"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Box,
  ChevronDown,
  Folder,
  FolderOpen,
  LogOut,
  Settings,
  Star,
  User,
} from "lucide-react";

import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollections } from "@/lib/db/collections";
import { iconByName } from "@/components/dashboard/type-icons";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AppSidebarProps {
  user: SidebarUser | null;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollections;
}

const PRO_TYPE_SLUGS = new Set(["file", "image"]);

type SidebarCollection = SidebarCollections["favorites"][number];

function CollectionList({
  label,
  collections,
  renderIcon,
  renderBadge,
}: {
  label: string;
  collections: SidebarCollection[];
  renderIcon: (collection: SidebarCollection) => React.ReactNode;
  renderBadge: (collection: SidebarCollection) => React.ReactNode;
}) {
  if (collections.length === 0) return null;
  return (
    <>
      <div className="px-2 pt-1 pb-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50">
        {label}
      </div>
      <SidebarMenu>
        {collections.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton render={<Link href={`/collections/${collection.id}`} />}>
              {renderIcon(collection)}
              <span>{collection.name}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>{renderBadge(collection)}</SidebarMenuBadge>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}

const chevron = (
  <ChevronDown className="ml-auto -rotate-90 transition-transform group-data-[panel-open]/clp:rotate-0" />
);

export function AppSidebar({ user, itemTypes, collections }: AppSidebarProps) {
  const { favorites, recents } = collections;
  const displayName = user?.name ?? user?.email ?? "";
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Box className="size-5" />
          </div>
          <span className="text-base font-semibold">DevStash</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel className="group/clp" render={<CollapsibleTrigger />}>
              Types
              {chevron}
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {itemTypes.map((type) => {
                    const Icon = iconByName[type.icon ?? ""] ?? Folder;
                    return (
                      <SidebarMenuItem key={type.id}>
                        <SidebarMenuButton render={<Link href={`/items/${type.slug}`} />}>
                          <Icon style={{ color: type.color ?? undefined }} />
                          <span className="capitalize">{type.name}</span>
                          {PRO_TYPE_SLUGS.has(type.slug) && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[0.6rem] font-semibold tracking-wide text-muted-foreground"
                            >
                              PRO
                            </Badge>
                          )}
                        </SidebarMenuButton>
                        <SidebarMenuBadge>{type.count}</SidebarMenuBadge>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel className="group/clp" render={<CollapsibleTrigger />}>
              Collections
              {chevron}
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <CollectionList
                  label="Favorites"
                  collections={favorites}
                  renderIcon={(c) => (
                    <Folder style={{ color: c.primaryColor ?? undefined }} />
                  )}
                  renderBadge={() => (
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  )}
                />
                <CollectionList
                  label="Recents"
                  collections={recents}
                  renderIcon={(c) => (
                    <span
                      aria-hidden
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: c.primaryColor ?? "var(--muted-foreground)",
                      }}
                    />
                  )}
                  renderBadge={(c) => c.itemCount}
                />
                <SidebarMenu className="mt-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/collections" />}
                      className="text-sidebar-foreground/70"
                    >
                      <FolderOpen />
                      <span>View all collections</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Link
            href="/profile"
            className="flex flex-1 items-center gap-2 overflow-hidden rounded-md p-1 hover:bg-sidebar-accent"
          >
            <UserAvatar name={displayName} image={user?.image} />
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Account menu">
                  <Settings />
                </Button>
              }
            />
            <DropdownMenuContent side="top" align="end">
              <DropdownMenuItem render={<Link href="/profile" />}>
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ redirectTo: "/sign-in" })}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
