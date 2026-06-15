import { AppShell } from "@/components/dashboard/app-shell";

export const dynamic = "force-dynamic";

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
