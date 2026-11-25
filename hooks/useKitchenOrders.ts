"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getSupabaseRealtimeClient } from "@/lib/supabase/client";
import type { ApiResponse, KitchenOrderDTO } from "@/types/api";
import type { OrderStatus } from "@/types/db";

export type KitchenTab = "active" | "done";
export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

function playChime(audioCtx: AudioContext | null) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const notes = [660, 880];
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.14);
      gain.gain.setValueAtTime(0.001, now + index * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + index * 0.14);
      osc.stop(now + index * 0.14 + 0.26);
    });
  } catch {
    // Ignore Web Audio errors on restricted devices
  }
}

export function useKitchenOrders(tab: KitchenTab) {
  const [orders, setOrders] = useState<KitchenOrderDTO[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("reconnecting");
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const initializedActiveRef = useRef(false);
  const seenActiveIdsRef = useRef<Set<string>>(new Set());
  const updatingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const fetchTabOrders = useCallback(
    async (targetTab: KitchenTab): Promise<KitchenOrderDTO[]> => {
      const res = await fetch(`/api/kitchen/orders?tab=${targetTab}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ApiResponse<KitchenOrderDTO[]>;
      if (!res.ok || json.error) {
        throw new Error(json.error?.message ?? "Tidak dapat memuat pesanan");
      }
      return json.data;
    },
    []
  );

  const loadKitchenSnapshot = useCallback(
    async (currentTab: KitchenTab) => {
      const [tabData, activeData] = await Promise.all([
        fetchTabOrders(currentTab),
        currentTab === "active" ? Promise.resolve(null) : fetchTabOrders("active"),
      ]);
      const activeList = currentTab === "active" ? tabData : (activeData ?? []);
      return { tabData, activeList };
    },
    [fetchTabOrders]
  );

  const applyKitchenSnapshot = useCallback(
    (
      snapshot: { tabData: KitchenOrderDTO[]; activeList: KitchenOrderDTO[] },
      notifyNewOrders: boolean
    ) => {
      const { tabData, activeList } = snapshot;
      setActiveCount(activeList.length);

      const nextIds = new Set(activeList.map((o) => o.id));
      if (initializedActiveRef.current && notifyNewOrders) {
        const hasNewBaruOrder = activeList.some(
          (o) => o.status === "baru" && !seenActiveIdsRef.current.has(o.id)
        );
        if (hasNewBaruOrder && soundEnabledRef.current) {
          playChime(audioCtxRef.current);
        }
      }
      seenActiveIdsRef.current = nextIds;
      initializedActiveRef.current = true;

      setOrders(tabData);
      setError(null);
    },
    []
  );

  const syncKitchen = useCallback(
    async (currentTab: KitchenTab, notifyNewOrders: boolean) => {
      const snapshot = await loadKitchenSnapshot(currentTab);
      applyKitchenSnapshot(snapshot, notifyNewOrders);
    },
    [applyKitchenSnapshot, loadKitchenSnapshot]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await syncKitchen(tab, false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tidak dapat memuat pesanan"
      );
    } finally {
      setLoading(false);
    }
  }, [syncKitchen, tab]);

  // Initial fetch & tab-change fetch
  useEffect(() => {
    let cancelled = false;
    loadKitchenSnapshot(tab)
      .then((snapshot) => {
        if (cancelled) return;
        applyKitchenSnapshot(snapshot, false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Tidak dapat memuat pesanan"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyKitchenSnapshot, loadKitchenSnapshot, tab]);

  // Supabase Realtime subscription (trigger refetch only; payload ignored)
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let supabase: ReturnType<typeof getSupabaseRealtimeClient> | null = null;

    try {
      supabase = getSupabaseRealtimeClient();
    } catch {
      return;
    }

    const triggerRefetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void syncKitchen(tab, true).catch(() => undefined);
      }, 300);
    };

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          triggerRefetch();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
          void syncKitchen(tab, true).catch(() => undefined);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("disconnected");
        } else {
          setConnectionStatus("reconnecting");
        }
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [syncKitchen, tab]);

  // Fallback polling every 10s whenever Realtime is not connected
  useEffect(() => {
    if (connectionStatus === "connected") return;

    const interval = setInterval(() => {
      void syncKitchen(tab, true).catch(() => undefined);
    }, 10_000);

    return () => clearInterval(interval);
  }, [connectionStatus, syncKitchen, tab]);

  function toggleSound() {
    if (!soundEnabled) {
      try {
        if (!audioCtxRef.current && typeof window !== "undefined") {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          if (AudioCtx) {
            audioCtxRef.current = new AudioCtx();
          }
        }
        if (audioCtxRef.current?.state === "suspended") {
          void audioCtxRef.current.resume();
        }
        playChime(audioCtxRef.current);
      } catch {
        // Ignore if AudioContext cannot be started
      }
      setSoundEnabled(true);
      toast.success("Bunyi notifikasi dapur aktif");
    } else {
      setSoundEnabled(false);
    }
  }

  async function advanceStatus(orderId: string, nextStatus: OrderStatus) {
    if (updatingIdsRef.current.has(orderId)) return;

    updatingIdsRef.current.add(orderId);
    setUpdatingIds(Array.from(updatingIdsRef.current));

    const previousOrders = orders;
    const previousActiveCount = activeCount;

    // Optimistic UI update
    setOrders((current) => {
      if (tab === "active" && nextStatus === "selesai") {
        return current.filter((o) => o.id !== orderId);
      }
      return current.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      );
    });
    if (nextStatus === "selesai") {
      setActiveCount((c) => Math.max(0, c - 1));
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = (await res.json()) as ApiResponse<{
        id: string;
        status: OrderStatus;
      }>;

      if (!res.ok || json.error) {
        setOrders(previousOrders);
        setActiveCount(previousActiveCount);
        toast.error(json.error?.message ?? "Gagal memperbarui status pesanan.");
        return;
      }

      void syncKitchen(tab, false).catch(() => undefined);
    } catch {
      setOrders(previousOrders);
      setActiveCount(previousActiveCount);
      toast.error("Gagal memperbarui status pesanan.");
    } finally {
      updatingIdsRef.current.delete(orderId);
      setUpdatingIds(Array.from(updatingIdsRef.current));
    }
  }

  return {
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
  };
}
