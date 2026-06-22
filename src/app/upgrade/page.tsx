import { UpgradePricing } from "@/components/billing/upgrade-pricing";

export default function UpgradePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Upgrade to Pro</h1>
        <p className="text-muted-foreground">
          Unlock unlimited items, file uploads, custom types, and AI features.
        </p>
      </div>
      <UpgradePricing />
    </div>
  );
}
