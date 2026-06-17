import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, FolderOpen } from "lucide-react";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfileUser, getProfileStats } from "@/lib/db/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [profileUser, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!profileUser) redirect("/sign-in");

  const memberSince = profileUser.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });


  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      {/* User info */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-1">
          <UserAvatar name={profileUser.name} image={profileUser.image} className="size-14 text-lg" />
          <div>
            <p className="font-medium">{profileUser.name ?? "No name set"}</p>
            <p className="text-sm text-muted-foreground">{profileUser.email}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              Member since {memberSince}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1.5">
              <FileText className="size-4 text-muted-foreground" />
              <strong>{stats.totalItems}</strong> items
            </span>
            <span className="flex items-center gap-1.5">
              <FolderOpen className="size-4 text-muted-foreground" />
              <strong>{stats.totalCollections}</strong> collections
            </span>
          </div>
          <Separator />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {stats.typeCounts.map((t) => (
              <div
                key={t.slug}
                className="flex flex-col items-center rounded-lg border px-2 py-2 text-center"
              >
                <span className="text-lg font-semibold">{t.count}</span>
                <span className="text-xs text-muted-foreground capitalize">{t.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
