"use client";

import Link from "next/link";
import { Box, ChevronDown, Folder, FolderOpen, Settings, Star } from "lucide-react";

import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollections } from "@/lib/db/collections";
import type { DemoUser } from "@/lib/db/user";
import { iconByName } from "@/components/dashboard/type-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface AppSidebarProps {
  user: DemoUser | null;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollections;
}

const PRO_TYPE_SLUGS = new Set(["file", "image"]);

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
                {favorites.length > 0 && (
                  <>
                    <div className="px-2 pt-1 pb-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50">
                      Favorites
                    </div>
                    <SidebarMenu>
                      {favorites.map((collection) => (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton>
                            <Folder
                              style={{ color: collection.primaryColor ?? undefined }}
                            />
                            <span>{collection.name}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge>
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          </SidebarMenuBadge>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </>
                )}
                {recents.length > 0 && (
                  <>
                    <div className="px-2 pt-3 pb-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50">
                      Recents
                    </div>
                    <SidebarMenu>
                      {recents.map((collection) => (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton>
                            <span
                              aria-hidden
                              className="inline-block size-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  collection.primaryColor ?? "var(--muted-foreground)",
                              }}
                            />
                            <span>{collection.name}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge>{collection.itemCount}</SidebarMenuBadge>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </>
                )}
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
          <Avatar>
            {user?.image && <AvatarImage src={user.image} alt={displayName} />}
            <AvatarFallback>{displayName ? initials(displayName) : "?"}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <Settings />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
