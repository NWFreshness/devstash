"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">
          This password reset link is missing or invalid.
        </p>
        <Link href="/forgot-password" className="text-sm font-medium underline-offset-4 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const values = {
      token,
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/sign-in?reset=true");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Set new password"}
        </Button>
      </form>
    </div>
  );
}
