"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Cart, type PendingProofRetry } from "@/components/pos/Cart";
import { CartSheetResponsive } from "@/components/pos/CartSheetMobile";
import { CategoryTabs } from "@/components/pos/CategoryTabs";
import { MenuCard } from "@/components/pos/MenuCard";
import { OfflineQueueBar } from "@/components/pos/OfflineQueueBar";
import {
  OrderStatusDialog,
  type OrderFeedbackState,
} from "@/components/pos/OrderStatusDialog";
import { SearchBar } from "@/components/pos/SearchBar";
import { VariantDialog } from "@/components/pos/VariantDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { API_ERROR_CODES } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import {
  enqueueOrder,
  isRetryableNetworkStatus,
  listQueuedOrders,
  removeQueuedOrder,
  updateQueuedOrder,
  type QueuedOrderRecord,
} from "@/lib/offline/orderQueue";
import { loadPosCache, savePosCache } from "@/lib/offline/posCache";
import type {
  ApiResponse,
  CategoryDTO,
  CreateOrderInput,
  CreateOrderResult,
  MenuItemDTO,
  SettingsDTO,
} from "@/types/api";

function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function PosWorkspace() {
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    () => navigator.onLine,
    () => true
  );

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [queuedOrders, setQueuedOrders] = useState<QueuedOrderRecord[]>([]);
  const [flushingQueue, setFlushingQueue] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all"
  );
  const [variantItem, setVariantItem] = useState<MenuItemDTO | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryProof, setRetryProof] = useState<PendingProofRetry | null>(null);
  const [retryingProof, setRetryingProof] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<OrderFeedbackState | null>(
    null
  );

  const submittingRef = useRef(false);
  const flushingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cart = useCart(taxPercent);

  const fetchPosData = useCallback(async () => {
    const [menuRes, settingsRes] = await Promise.all([
      fetch("/api/menu?includeInactive=false", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
    ]);

    const menuJson = (await menuRes.json()) as ApiResponse<{
      categories: CategoryDTO[];
      items: MenuItemDTO[];
    }>;
    const settingsJson = (await settingsRes.json()) as ApiResponse<SettingsDTO>;

    if (!menuRes.ok || menuJson.error) {
      throw new Error(menuJson.error?.message ?? "Gagal memuat menu");
    }

    const nextData = {
      categories: menuJson.data.categories,
      items: menuJson.data.items,
      taxPercent:
        settingsRes.ok && !settingsJson.error
          ? settingsJson.data.taxPercent
          : 0,
    };
    savePosCache(nextData);
    return nextData;
  }, []);

  const refreshQueueState = useCallback(async () => {
    const all = await listQueuedOrders();
    setQueuedOrders(all);
    return all;
  }, []);

  const uploadProof = useCallback(
    async (orderId: string, file: File): Promise<boolean> => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/orders/${orderId}/proof`, {
          method: "POST",
          body: formData,
        });

        const json = (await res.json()) as ApiResponse<{ paymentProofUrl: string }>;
        return res.ok && !json.error;
      } catch {
        return false;
      }
    },
    []
  );

  const syncQueuedRecord = useCallback(
    async (record: QueuedOrderRecord): Promise<"sent" | "network_error" | "rejected"> => {
      await updateQueuedOrder(record.localId, {
        status: "syncing",
        lastError: null,
      });
      await refreshQueueState();

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record.payload),
        });

        if (isRetryableNetworkStatus(res.status)) {
          await updateQueuedOrder(record.localId, {
            status: "pending",
            lastError: "Koneksi server masih belum stabil.",
          });
          await refreshQueueState();
          return "network_error";
        }

        const json = (await res.json()) as ApiResponse<CreateOrderResult>;
        if (!res.ok || json.error) {
          const message =
            json.error?.message ?? "Pesanan antrean ditolak oleh server.";
          await updateQueuedOrder(record.localId, {
            status: "error",
            lastError: message,
          });
          await refreshQueueState();
          return "rejected";
        }

        const created = json.data;
        if (record.proofBlob) {
          const file = new File(
            [record.proofBlob],
            record.proofFileName ?? "proof.jpg",
            { type: record.proofBlob.type || "image/jpeg" }
          );
          const uploaded = await uploadProof(created.id, file);
          if (!uploaded) {
            toast.warning(
              `Pesanan #${created.orderNo} (${record.customerName}) terkirim, tetapi foto bukti gagal diunggah. Unggah ulang dari Riwayat.`
            );
          }
        }

        await removeQueuedOrder(record.localId);
        await refreshQueueState();
        toast.success(
          `Antrean offline #${created.orderNo} (${record.customerName}) dikirim ke dapur`
        );
        return "sent";
      } catch {
        await updateQueuedOrder(record.localId, {
          status: "pending",
          lastError: "Menunggu koneksi internet kembali stabil.",
        });
        await refreshQueueState();
        return "network_error";
      }
    },
    [refreshQueueState, uploadProof]
  );

  const flushOfflineQueue = useCallback(
    async (includeErrors = false) => {
      if (flushingRef.current) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      const all = await listQueuedOrders();
      const targets = all.filter((q) =>
        includeErrors
          ? q.status === "pending" || q.status === "error"
          : q.status === "pending"
      );
      if (targets.length === 0) return;

      flushingRef.current = true;
      setFlushingQueue(true);
      try {
        for (const record of targets) {
          const result = await syncQueuedRecord(record);
          if (result === "network_error") break;
        }
      } finally {
        flushingRef.current = false;
        setFlushingQueue(false);
        await refreshQueueState();
      }
    },
    [refreshQueueState, syncQueuedRecord]
  );

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosData();
      setCategories(data.categories);
      setItems(data.items);
      setTaxPercent(data.taxPercent);
    } catch (err) {
      const cached = loadPosCache();
      if (cached) {
        setCategories(cached.categories);
        setItems(cached.items);
        setTaxPercent(cached.taxPercent);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat menu");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchPosData]);

  useEffect(() => {
    let cancelled = false;
    let hasCachedData = false;

    async function initializePos() {
      await Promise.resolve();
      if (cancelled) return;

      const cached = loadPosCache();
      if (cached) {
        hasCachedData = true;
        setCategories(cached.categories);
        setItems(cached.items);
        setTaxPercent(cached.taxPercent);
        setLoading(false);
      }

      void listQueuedOrders().then((list) => {
        if (!cancelled) setQueuedOrders(list);
      });

      try {
        const data = await fetchPosData();
        if (cancelled) return;
        setCategories(data.categories);
        setItems(data.items);
        setTaxPercent(data.taxPercent);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (!hasCachedData) {
          setError(err instanceof Error ? err.message : "Gagal memuat menu");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initializePos();

    return () => {
      cancelled = true;
    };
  }, [fetchPosData]);

  useEffect(() => {
    if (!isOnline) return;
    const timer = setTimeout(() => {
      void flushOfflineQueue(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isOnline, flushOfflineQueue]);

  useEffect(() => {
    const hasPending = queuedOrders.some((q) => q.status === "pending");
    if (!hasPending || !isOnline) return;
    const timer = setInterval(() => {
      void flushOfflineQueue(false);
    }, 30_000);
    return () => clearInterval(timer);
  }, [queuedOrders, isOnline, flushOfflineQueue]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
      const matchesQuery =
        !query || item.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [items, searchQuery, selectedCategoryId]);

  function handleSelectMenu(item: MenuItemDTO) {
    if (item.variantPick > 0) {
      setVariantItem(item);
      setVariantDialogOpen(true);
      return;
    }

    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
    setSubmitError(null);
    toast.success(`${item.name} ditambahkan`);
  }

  function handleConfirmVariants(payload: {
    item: MenuItemDTO;
    variants: string[];
    note: string;
  }) {
    cart.addItem({
      menuItemId: payload.item.id,
      name: payload.item.name,
      price: payload.item.price,
      imageUrl: payload.item.imageUrl,
      variants: payload.variants,
      note: payload.note,
    });
    setSubmitError(null);
    toast.success(`${payload.item.name} ditambahkan`);
  }

  async function queueCurrentOrder(notice: string) {
    const customerName = cart.customerName.trim();
    const previewTotal = cart.totals.total;
    const itemCount = cart.itemCount;
    const attachedProof = proofFile;

    const payload: CreateOrderInput = {
      customerName,
      note: cart.orderNote.trim() || undefined,
      paymentMethod: cart.paymentMethod!,
      discount: cart.discount,
      items: cart.lines.map((line) => ({
        menuItemId: line.menuItemId,
        qty: line.qty,
        variants: line.variants,
        note: line.note,
      })),
    };

    try {
      await enqueueOrder({
        payload,
        previewTotal,
        itemCount,
        proofFile: attachedProof,
      });
      await refreshQueueState();
      cart.clearCart();
      setProofFile(null);
      setRetryProof(null);
      setMobileCartOpen(false);
      setOrderFeedback({
        kind: "queued",
        customerName,
        itemCount,
        previewTotal,
        paymentMethod: payload.paymentMethod,
      });
      toast.warning(notice);
    } catch {
      const message = "Koneksi terputus dan antrean lokal gagal menyimpan.";
      setSubmitError(message);
      toast.error(message);
    }
  }

  async function handleSubmitOrder() {
    if (submittingRef.current) return;
    const customerName = cart.customerName.trim();
    if (
      cart.lines.length === 0 ||
      !customerName ||
      !cart.paymentMethod ||
      cart.discountError
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    cart.clearInvalidMenuIds();

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        await queueCurrentOrder(
          `Mode offline: Pesanan ${customerName} masuk antrean & akan dikirim saat online.`
        );
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
      return;
    }

    const previewTotal = cart.totals.total;
    const attachedProof = proofFile;

    const payload: CreateOrderInput = {
      customerName,
      note: cart.orderNote.trim() || undefined,
      paymentMethod: cart.paymentMethod,
      discount: cart.discount,
      items: cart.lines.map((line) => ({
        menuItemId: line.menuItemId,
        qty: line.qty,
        variants: line.variants,
        note: line.note,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (isRetryableNetworkStatus(res.status)) {
        await queueCurrentOrder(
          `Koneksi tidak stabil (${res.status}). Pesanan ${customerName} disimpan ke antrean offline.`
        );
        return;
      }

      const json = (await res.json()) as ApiResponse<CreateOrderResult>;

      if (!res.ok || json.error) {
        const message =
          json.error?.message ?? "Pesanan gagal dibuat. Coba lagi.";
        setSubmitError(message);
        setOrderFeedback({
          kind: "error",
          message,
        });
        toast.error(message);

        const errorCode = json.error?.code;
        const details = json.error?.details as
          | { menuItemId?: string }
          | undefined;

        if (
          (errorCode === API_ERROR_CODES.MENU_INACTIVE ||
            errorCode === API_ERROR_CODES.MENU_NOT_FOUND) &&
          details?.menuItemId
        ) {
          cart.markInvalidMenuId(details.menuItemId);
          void handleRetry();
        }
        return;
      }

      const created = json.data;
      if (created.total !== previewTotal) {
        toast.info(
          `Total disesuaikan harga terbaru menjadi ${formatRupiah(created.total)}`
        );
      }

      const itemCountSnapshot = cart.itemCount;
      const paymentMethodSnapshot = cart.paymentMethod;

      cart.clearCart();
      setProofFile(null);

      if (attachedProof) {
        const uploaded = await uploadProof(created.id, attachedProof);
        if (!uploaded) {
          setRetryProof({
            orderId: created.id,
            orderNo: created.orderNo,
            file: attachedProof,
          });
          setMobileCartOpen(false);
          setOrderFeedback({
            kind: "partial_proof",
            orderNo: created.orderNo,
            customerName,
            itemCount: itemCountSnapshot,
            total: created.total,
            paymentMethod: paymentMethodSnapshot,
          });
          toast.warning(
            `Pesanan #${created.orderNo} tersimpan, tetapi foto gagal diunggah. Coba lagi dari Riwayat.`
          );
          return;
        }
      }

      setRetryProof(null);
      setMobileCartOpen(false);
      setOrderFeedback({
        kind: "success",
        orderNo: created.orderNo,
        customerName,
        itemCount: itemCountSnapshot,
        total: created.total,
        paymentMethod: paymentMethodSnapshot,
        hasProof: Boolean(attachedProof),
      });
      toast.success(`Pesanan #${created.orderNo} dikirim ke dapur`);
    } catch {
      await queueCurrentOrder(
        `Sinyal terputus. Pesanan ${customerName} disimpan di antrean offline.`
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleRetrySingleQueue(localId: string) {
    if (flushingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("Perangkat masih offline.");
      return;
    }
    const target = queuedOrders.find((q) => q.localId === localId);
    if (!target) return;

    flushingRef.current = true;
    setFlushingQueue(true);
    try {
      await syncQueuedRecord(target);
    } finally {
      flushingRef.current = false;
      setFlushingQueue(false);
      await refreshQueueState();
    }
  }

  async function handleRemoveSingleQueue(localId: string) {
    await removeQueuedOrder(localId);
    await refreshQueueState();
    toast.success("Antrean pesanan dihapus.");
  }

  async function handleRetryProof() {
    if (!retryProof || retryingProof) return;
    setRetryingProof(true);
    try {
      const uploaded = await uploadProof(retryProof.orderId, retryProof.file);
      if (uploaded) {
        toast.success(
          `Foto bukti Pesanan #${retryProof.orderNo} berhasil diunggah`
        );
        setOrderFeedback((prev) =>
          prev && prev.kind === "partial_proof"
            ? {
                kind: "success",
                orderNo: prev.orderNo,
                customerName: prev.customerName,
                itemCount: prev.itemCount,
                total: prev.total,
                paymentMethod: prev.paymentMethod,
                hasProof: true,
              }
            : prev
        );
        setRetryProof(null);
      } else {
        toast.error("Foto masih gagal diunggah. Coba lagi atau unggah dari Riwayat.");
      }
    } finally {
      setRetryingProof(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Menu Catalog Area */}
      <section className="flex-1 min-w-0 space-y-4 p-4 pb-36 sm:p-6 sm:pb-24 lg:pb-6">
        <div className="space-y-3">
          <OfflineQueueBar
            isOnline={isOnline}
            queuedOrders={queuedOrders}
            flushing={flushingQueue}
            onFlush={(includeErrors) => void flushOfflineQueue(includeErrors)}
            onRetryOne={(id) => void handleRetrySingleQueue(id)}
            onRemoveOne={(id) => void handleRemoveSingleQueue(id)}
          />
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
          />
          {!loading && !error ? (
            <CategoryTabs
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          ) : null}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-3"
              >
                <Skeleton className="aspect-4/3 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="size-11 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Belum ada menu. Tambahkan di Kelola Menu."
            action={
              <Button asChild className="min-h-11 rounded-xl font-bold">
                <Link href="/kasir/menu">Buka Kelola Menu</Link>
              </Button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Menu tidak ditemukan."
            description="Coba ubah kata kunci pencarian atau pilih kategori Semua."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onSelect={handleSelectMenu}
              />
            ))}
          </div>
        )}
      </section>

      {/* Desktop (>=1024px) sticky right cart panel */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-96 lg:shrink-0 lg:flex-col lg:border-l lg:border-border lg:bg-card/60 lg:p-5">
        <Cart
          cart={cart}
          taxPercent={taxPercent}
          proofFile={proofFile}
          onProofFileChange={setProofFile}
          submitting={submitting}
          submitError={submitError}
          onSubmitOrder={handleSubmitOrder}
          retryProof={retryProof}
          retryingProof={retryingProof}
          onRetryProof={handleRetryProof}
          onDismissRetryProof={() => setRetryProof(null)}
        />
      </aside>

      {/* Mobile (<640px) & Tablet (640-1023px) cart sheets */}
      <CartSheetResponsive
        open={mobileCartOpen}
        onOpenChange={setMobileCartOpen}
        cart={cart}
        taxPercent={taxPercent}
        proofFile={proofFile}
        onProofFileChange={setProofFile}
        submitting={submitting}
        submitError={submitError}
        onSubmitOrder={handleSubmitOrder}
        retryProof={retryProof}
        retryingProof={retryingProof}
        onRetryProof={handleRetryProof}
        onDismissRetryProof={() => setRetryProof(null)}
      />

      <VariantDialog
        key={variantItem?.id ?? "none"}
        item={variantItem}
        open={variantDialogOpen}
        onOpenChange={(open) => {
          setVariantDialogOpen(open);
          if (!open) setVariantItem(null);
        }}
        onConfirm={handleConfirmVariants}
      />

      <OrderStatusDialog
        feedback={orderFeedback}
        retryingProof={retryingProof}
        hasRetryProof={Boolean(retryProof)}
        onRetryProof={() => void handleRetryProof()}
        onClose={() => {
          setOrderFeedback(null);
          searchInputRef.current?.focus();
        }}
      />
    </div>
  );
}
