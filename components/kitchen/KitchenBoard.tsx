"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, BellOff, ChefHat, WifiOff } from "lucide-react";
import { ConnectionBadge } from "@/components/kitchen/ConnectionBadge";
import { KitchenTabs } from "@/components/kitchen/KitchenTabs";
import { OrderCard } from "@/components/kitchen/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKitchenOrders, type KitchenTab } from "@/hooks/useKitchenOrders";
import { useWakeLock } from "@/hooks/useWakeLock";
import { cn } from "@/lib/utils";

type KitchenBoardProps = {
  storeName: string;
};

export function KitchenBoard({ storeName }: KitchenBoardProps) {
  const [tab, setTab] = useState<KitchenTab>("active");
  const [now, setNow] = useState(() => new Date());

  useWakeLock(true);

  const {
    orders,
    activeCount,
    loading,
    error,
    connectionStatus,
    updatingIds,
    soundEnabled,
    toggleSound,
    refresh,
    advanceStatus,
  } = useKitchenOrders(tab);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Logo_cemal_cemul.png"
              alt={`Logo ${storeName}`}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-contain"
            />
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              Dapur {storeName}
            </h1>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={soundEnabled ? "secondary" : "outline"}
            onClick={toggleSound}
            aria-label={soundEnabled ? "Matikan bunyi notifikasi" : "Aktifkan bunyi notifikasi"}
            aria-pressed={soundEnabled}
            className={cn(
              "min-h-11 gap-2 rounded-xl px-3 font-bold",
              soundEnabled ? "" : "border-border bg-card text-foreground"
            )}
          >
            {soundEnabled ? (
              <Bell className="size-4" aria-hidden="true" />
            ) : (
              <BellOff className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {soundEnabled ? "Bunyi aktif" : "Aktifkan bunyi"}
            </span>
          </Button>
          <RoleSwitcher />
        </div>
      </header>

      {connectionStatus === "disconnected" ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive"
        >
          <WifiOff className="size-4 shrink-0" aria-hidden="true" />
          <span>Koneksi terputus. Mencoba menyambung ulang…</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <KitchenTabs tab={tab} activeCount={activeCount} onTabChange={setTab} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Belum ada pesanan."
          description={
            tab === "active"
              ? "Pesanan baru dari kasir akan muncul otomatis di sini."
              : "Belum ada pesanan yang selesai hari ini."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              now={now}
              updating={updatingIds.includes(order.id)}
              onAdvance={advanceStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
