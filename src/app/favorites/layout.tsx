import { AppShell } from "@/components/dashboard/app-shell";

export const dynamic = "force-dynamic";

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
