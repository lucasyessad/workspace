import * as React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** When true, uses ChevronLeft separator for RTL layouts (Arabic) */
  rtl?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, rtl = false, ...props }, ref) => {
    const Separator = rtl ? ChevronLeft : ChevronRight;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center gap-1.5 text-caption text-muted-foreground", className)}
        {...props}
      >
        <ol className={cn("flex items-center gap-1.5", rtl && "flex-row-reverse")}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <Separator className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                )}
                {isLast || !item.href ? (
                  <span
                    className={cn(
                      "truncate",
                      isLast && "font-semibold text-foreground"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="truncate transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
