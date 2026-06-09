import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { name, email, image } = session.user;

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-6 p-6">
      <UserAvatar name={name} image={image} className="size-20 text-xl" />
      <div className="text-center">
        <h1 className="text-xl font-semibold">{name ?? "Your profile"}</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
        <ArrowLeft />
        Back to dashboard
      </Button>
    </div>
  );
}
