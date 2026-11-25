"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const KASIR_NAV_ITEMS: NavItem[] = [
  {
    href: "/kasir",
    label: "Kasir",
    shortLabel: "Kasir",
    icon: ShoppingBag,
  },
  {
    href: "/kasir/menu",
    label: "Kelola Menu",
    shortLabel: "Menu",
    icon: UtensilsCrossed,
  },
  {
    href: "/kasir/riwayat",
    label: "Riwayat",
    shortLabel: "Riwayat",
    icon: History,
  },
  {
    href: "/kasir/pengaturan",
    label: "Pengaturan",
    shortLabel: "Setelan",
    icon: Settings,
  },
];

type KasirShellProps = {
  storeName: string;
  children: React.ReactNode;
};

export function KasirShell({ storeName, children }: KasirShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActiveRoute(href: string) {
    if (href === "/kasir") {
      return pathname === "/kasir";
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background sm:flex-row">
      {/* Desktop & tablet collapsible sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 transition-[width] duration-200 sm:flex",
          collapsed ? "w-20" : "w-60"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="absolute top-1/2 -right-5 z-20 size-11 -translate-y-1/2 rounded-full border-sidebar-border bg-card text-sidebar-foreground shadow-sm hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-5" aria-hidden="true" />
          )}
        </Button>

        <div className="space-y-4 overflow-hidden">
          <div className="flex h-12 items-center">
            <Link
              href="/kasir"
              className="flex h-12 min-w-0 flex-1 items-center justify-start gap-2.5 overflow-hidden rounded-xl px-[3px] outline-none focus-visible:ring-3 focus-visible:ring-ring"
              aria-label={storeName}
              title={storeName}
            >
              <Image
                src="/Logo_cemal_cemul.png"
                alt={storeName}
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full object-contain"
              />
              <span
                aria-hidden={collapsed}
                className={cn(
                  "truncate whitespace-nowrap font-display text-xl font-extrabold text-sidebar-foreground transition-opacity duration-150",
                  collapsed ? "pointer-events-none opacity-0" : "opacity-100"
                )}
              >
                {storeName}
              </span>
            </Link>
          </div>

          <Separator className="bg-sidebar-border" />

          <nav aria-label="Navigasi Kasir" className="flex flex-col gap-1.5">
            {KASIR_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  aria-label={item.label}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center justify-start gap-3 overflow-hidden rounded-xl px-[13px] text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <span
                    aria-hidden={collapsed}
                    className={cn(
                      "whitespace-nowrap transition-opacity duration-150",
                      collapsed ? "pointer-events-none opacity-0" : "opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="overflow-hidden pt-4">
          <Separator className="mb-4 bg-sidebar-border" />
          <RoleSwitcher compact={collapsed} className="w-full" />
        </div>
      </aside>

      {/* Mobile (<640px) top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:hidden">
        <Link
          href="/kasir"
          className="flex items-center gap-2 font-display text-xl font-extrabold text-foreground"
        >
          <Image
            src="/Logo_cemal_cemul.png"
            alt={storeName}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-contain"
          />
          <span>{storeName}</span>
        </Link>
        <RoleSwitcher />
      </header>

      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-20 sm:pb-0">{children}</main>

      {/* Mobile (<640px) fixed bottom navigation */}
      <nav
        aria-label="Navigasi Kasir Bawah"
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-border bg-card px-1 py-1.5 sm:hidden"
      >
        {KASIR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                active
                  ? "bg-primary/20 text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
