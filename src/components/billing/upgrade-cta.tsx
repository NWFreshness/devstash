import Link from "next/link";

interface UpgradeCtaProps {
  reason: string;
}

export function UpgradeCta({ reason }: UpgradeCtaProps) {
  return (
    <div className="rounded-md border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
      <p>{reason}</p>
      <Link href="/settings" className="mt-1 inline-block text-primary underline-offset-4 hover:underline">
        Upgrade to Pro
      </Link>
    </div>
  );
}
