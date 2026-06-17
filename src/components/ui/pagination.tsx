"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const near = new Set(
    [1, current - 1, current, current + 1, total].filter(
      (n) => n >= 1 && n <= total,
    ),
  );
  const sorted = [...near].sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ariaLabel,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const base =
    "flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm transition-colors";

  if (disabled) {
    return (
      <span
        className={cn(base, "cursor-not-allowed text-muted-foreground/40")}
        aria-label={ariaLabel}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        base,
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (n: number) => `${basePath}?page=${n}`;

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Pagination"
    >
      <PageLink
        href={href(page - 1)}
        disabled={page <= 1}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="size-4" />
      </PageLink>

      {buildPageNumbers(page, totalPages).map((n, i) =>
        n === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 min-w-8 items-center justify-center px-2 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <PageLink key={n} href={href(n)} active={n === page}>
            {n}
          </PageLink>
        ),
      )}

      <PageLink
        href={href(page + 1)}
        disabled={page >= totalPages}
        ariaLabel="Next page"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}
