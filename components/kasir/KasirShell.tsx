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
          "hidden shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar transition-all duration-200 sm:flex",
          collapsed ? "w-20 p-3" : "w-60 p-4"
        )}
      >
        <div className="space-y-4">
          <div
            className={cn(
              "flex gap-2",
              collapsed
                ? "flex-col items-center"
                : "flex-row items-center justify-between"
            )}
          >
            <Link
              href="/kasir"
              className={cn(
                "flex min-w-0 items-center gap-2.5 rounded-xl py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring",
                collapsed ? "justify-center" : "flex-1"
              )}
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
              {collapsed ? null : (
                <span className="truncate font-display text-xl font-extrabold text-sidebar-foreground">
                  {storeName}
                </span>
              )}
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
              aria-expanded={!collapsed}
              title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
              className="size-11 shrink-0 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-5" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="size-5" aria-hidden="true" />
              )}
            </Button>
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
                  aria-label={item.label}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    collapsed ? "justify-center" : "justify-start",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  {collapsed ? null : <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4">
          <Separator className="mb-4 bg-sidebar-border" />
          {collapsed ? (
            <div className="flex justify-center">
              <RoleSwitcher compact />
            </div>
          ) : (
            <RoleSwitcher className="w-full justify-start" />
          )}
        </div>
      </aside>

      {/* Mobile (<640px) top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:hidden">
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
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-border bg-card/95 px-1 py-1.5 backdrop-blur sm:hidden"
      >
        {KASIR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
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
