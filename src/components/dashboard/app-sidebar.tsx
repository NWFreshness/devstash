"use client";

import Link from "next/link";
import { Box, ChevronDown, Folder, Settings, Star } from "lucide-react";

import { collections, currentUser, itemTypes } from "@/lib/mock-data";
import { iconByName } from "@/components/dashboard/type-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const favoriteCollections = collections.filter((c) => c.isFavorite);
const otherCollections = collections.filter((c) => !c.isFavorite);

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

export function AppSidebar() {
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
                    const Icon = iconByName[type.icon] ?? Folder;
                    return (
                      <SidebarMenuItem key={type.id}>
                        <SidebarMenuButton render={<Link href={`/items/${type.slug}`} />}>
                          <Icon />
                          <span>{type.name}</span>
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
                {favoriteCollections.length > 0 && (
                  <>
                    <div className="px-2 pt-1 pb-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50">
                      Favorites
                    </div>
                    <SidebarMenu>
                      {favoriteCollections.map((collection) => (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton>
                            <Folder />
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
                <div className="px-2 pt-3 pb-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50">
                  All Collections
                </div>
                <SidebarMenu>
                  {otherCollections.map((collection) => (
                    <SidebarMenuItem key={collection.id}>
                      <SidebarMenuButton>
                        <Folder />
                        <span>{collection.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{collection.itemCount}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Avatar>
            {currentUser.image && (
              <AvatarImage src={currentUser.image} alt={currentUser.name} />
            )}
            <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-sm font-medium">{currentUser.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {currentUser.email}
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
