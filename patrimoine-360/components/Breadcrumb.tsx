"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-body-sm">
      <Link
        href="/"
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition p-1 rounded-md hover:bg-[var(--color-surface-hover)]"
        aria-label="Accueil"
      >
        <Home size={14} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-[var(--color-text-muted)]" aria-hidden="true" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--color-text-primary)] font-medium" aria-current={i === items.length - 1 ? "page" : undefined}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
