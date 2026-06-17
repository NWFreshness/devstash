import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileUser } from "@/lib/db/profile";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountSection } from "@/components/profile/delete-account-section";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const profileUser = await getProfileUser(session.user.id);
  if (!profileUser) redirect("/sign-in");

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
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Change password — email/password users only */}
      {profileUser.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <DeleteAccountSection />
        </CardContent>
      </Card>
    </div>
  );
}
