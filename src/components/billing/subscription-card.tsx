"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionCardProps {
  isPro: boolean;
  planRenewsAt: Date | null;
}

export function SubscriptionCard({ isPro, planRenewsAt }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  async function redirectTo(url: string) {
    window.location.href = url;
  }

  async function handleUpgrade(interval: "monthly" | "yearly") {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    if (data.url) redirectTo(data.url);
    else setLoading(false);
  }

  async function handleManage() {
    setLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) redirectTo(data.url);
    else setLoading(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <CardTitle>Subscription</CardTitle>
        <Badge variant={isPro ? "default" : "secondary"}>
          {isPro ? "Pro" : "Free"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPro ? (
          <>
            <p className="text-sm text-muted-foreground">
              {planRenewsAt
                ? `Renews ${new Date(planRenewsAt).toLocaleDateString()}`
                : "Active subscription"}
            </p>
            <Button onClick={handleManage} disabled={loading} variant="outline">
              Manage subscription
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Free plan: up to 50 items and 3 collections. Upgrade for unlimited
              items, file uploads, custom types, and AI features.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => handleUpgrade("monthly")} disabled={loading}>
                Upgrade — $8/mo
              </Button>
              <Button
                onClick={() => handleUpgrade("yearly")}
                disabled={loading}
                variant="outline"
              >
                $72/yr (save 25%)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
