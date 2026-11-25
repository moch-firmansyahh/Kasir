"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { OrderDetail } from "@/components/history/OrderDetail";
import { OrderList } from "@/components/history/OrderList";
import { SearchBar } from "@/components/pos/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Money } from "@/components/shared/Money";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getWibDateString } from "@/lib/format";
import { loadHistoryCache, saveHistoryCache } from "@/lib/offline/posCache";
import { getSupabaseRealtimeClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ApiResponse, OrderDTO, OrderSummaryDTO } from "@/types/api";
import type { OrderStatus } from "@/types/db";

type DatePreset = "today" | "yesterday" | "range";
const PAGE_LIMIT = 50;

export default function KasirRiwayatPage() {
  const [{ todayYmd, yesterdayYmd }] = useState(() => ({
    todayYmd: getWibDateString(),
    yesterdayYmd: getWibDateString(new Date(Date.now() - 86_400_000)),
  }));

  const [preset, setPreset] = useState<DatePreset>("today");
  const [fromDate, setFromDate] = useState(todayYmd);
  const [toDate, setToDate] = useState(todayYmd);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const effectiveRange = useMemo(() => {
    if (preset === "today") return { from: todayYmd, to: todayYmd };
    if (preset === "yesterday") return { from: yesterdayYmd, to: yesterdayYmd };
    return { from: fromDate, to: toDate < fromDate ? fromDate : toDate };
  }, [fromDate, preset, toDate, todayYmd, yesterdayYmd]);

  const cacheKey = `${effectiveRange.from}|${effectiveRange.to}|${statusFilter}|${debouncedQuery}`;
  const [initialCache] = useState(() => loadHistoryCache(cacheKey));

  const [orders, setOrders] = useState<OrderDTO[]>(
    () => initialCache?.orders ?? []
  );
  const [summary, setSummary] = useState<OrderSummaryDTO>(
    () => initialCache?.summary ?? { count: 0, totalSales: 0 }
  );
  const [hasMore, setHasMore] = useState(() => initialCache?.hasMore ?? false);
  const [loading, setLoading] = useState(() => !initialCache);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchHistory = useCallback(
    async (offset: number) => {
      const params = new URLSearchParams({
        from: effectiveRange.from,
        to: effectiveRange.to,
        limit: String(PAGE_LIMIT),
        offset: String(offset),
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      }

      const res = await fetch(`/api/orders?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ApiResponse<{
        orders: OrderDTO[];
        summary: OrderSummaryDTO;
        hasMore: boolean;
      }>;
      if (!res.ok || json.error) {
        throw new Error(json.error?.message ?? "Gagal memuat riwayat pesanan.");
      }
      if (offset === 0) {
        saveHistoryCache(cacheKey, json.data);
      }
      return json.data;
    },
    [cacheKey, debouncedQuery, effectiveRange.from, effectiveRange.to, statusFilter]
  );

  useEffect(() => {
    let cancelled = false;
    const cached = loadHistoryCache(cacheKey);
    fetchHistory(0)
      .then((data) => {
        if (cancelled) return;
        setOrders(data.orders);
        setSummary(data.summary);
        setHasMore(data.hasMore);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (!cached) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat riwayat pesanan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, fetchHistory]);

  // Realtime updates so kitchen status changes reflect in Kasir Riwayat (FR-HIST-05)
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let supabase: ReturnType<typeof getSupabaseRealtimeClient> | null = null;
    try {
      supabase = getSupabaseRealtimeClient();
    } catch {
      return;
    }

    const channel = supabase
      .channel("kasir-history-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            void fetchHistory(0)
              .then((data) => {
                setOrders(data.orders);
                setSummary(data.summary);
                setHasMore(data.hasMore);
              })
              .catch(() => undefined);
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (supabase) void supabase.removeChannel(channel);
    };
  }, [fetchHistory]);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(0);
      setOrders(data.orders);
      setSummary(data.summary);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat riwayat pesanan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchHistory(orders.length);
      setOrders((prev) => [...prev, ...data.orders]);
      setHasMore(data.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Riwayat Pesanan"
        subtitle="Pantau status pesanan, rincian angka, dan bukti bayar."
      />

      {/* Filter tanggal & status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "today", label: "Hari ini" },
              { id: "yesterday", label: "Kemarin" },
              { id: "range", label: "Rentang" },
            ] as const
          ).map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={preset === item.id ? "default" : "outline"}
              onClick={() => {
                setLoading(true);
                setPreset(item.id);
              }}
              className={cn(
                "min-h-11 rounded-xl font-bold",
                preset === item.id ? "" : "bg-card"
              )}
            >
              {item.label}
            </Button>
          ))}

          {preset === "range" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={fromDate}
                max={todayYmd}
                onChange={(e) => {
                  setLoading(true);
                  setFromDate(e.target.value);
                }}
                aria-label="Tanggal mulai"
                className="h-11 w-40 rounded-xl bg-card"
              />
              <span className="text-xs font-bold text-muted-foreground">s/d</span>
              <Input
                type="date"
                value={toDate}
                min={fromDate}
                max={todayYmd}
                onChange={(e) => {
                  setLoading(true);
                  setToDate(e.target.value);
                }}
                aria-label="Tanggal akhir"
                className="h-11 w-40 rounded-xl bg-card"
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "all", label: "Semua" },
              { id: "baru", label: "Baru" },
              { id: "dimasak", label: "Dimasak" },
              { id: "selesai", label: "Selesai" },
            ] as const
          ).map((st) => (
            <Button
              key={st.id}
              type="button"
              size="sm"
              variant={statusFilter === st.id ? "secondary" : "outline"}
              onClick={() => {
                setLoading(true);
                setStatusFilter(st.id);
              }}
              className={cn(
                "min-h-10 rounded-xl font-bold",
                statusFilter === st.id ? "" : "bg-card"
              )}
            >
              {st.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Pencarian nama customer / nomor pesanan */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari nama customer atau #no..."
      />

      {/* Ringkasan penjualan (FR-HIST-07) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              Jumlah Pesanan
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums">
              {loading ? "..." : summary.count}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              Total Penjualan
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
              {loading ? "..." : <Money amount={summary.totalSales} />}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={History}
          title={
            debouncedQuery
              ? "Pesanan tidak ditemukan."
              : "Belum ada transaksi."
          }
        />
      ) : (
        <div className="space-y-4">
          <OrderList
            orders={orders}
            onSelect={(orderId) => {
              setDetailOrderId(orderId);
              setDetailOpen(true);
            }}
          />

          {hasMore ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={loadingMore}
                onClick={handleLoadMore}
                className="min-h-11 gap-2 rounded-xl px-6 font-bold"
              >
                {loadingMore ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                <span>
                  {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                </span>
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <OrderDetail
        orderId={detailOrderId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onProofUpdated={(orderId, proofUrl) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, paymentProofUrl: proofUrl } : o
            )
          );
        }}
      />
    </div>
  );
}
