"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { loadSettingsCache, saveSettingsCache } from "@/lib/offline/posCache";
import type { ApiResponse, SettingsDTO } from "@/types/api";

export default function KasirPengaturanPage() {
  const router = useRouter();
  const [initialCache] = useState(() => loadSettingsCache());
  const [storeName, setStoreName] = useState(
    () => initialCache?.storeName ?? "Cemal Cemul"
  );
  const [taxInput, setTaxInput] = useState(() =>
    initialCache ? String(initialCache.taxPercent) : "0"
  );
  const [loading, setLoading] = useState(() => !initialCache);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const json = (await res.json()) as ApiResponse<SettingsDTO>;
    if (!res.ok || json.error) {
      throw new Error(json.error?.message ?? "Gagal memuat pengaturan.");
    }
    saveSettingsCache(json.data);
    return json.data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then((data) => {
        if (cancelled) return;
        setStoreName(data.storeName);
        setTaxInput(String(data.taxPercent));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (!initialCache) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat pengaturan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialCache, loadSettings]);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const data = await loadSettings();
      setStoreName(data.storeName);
      setTaxInput(String(data.taxPercent));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat pengaturan."
      );
    } finally {
      setLoading(false);
    }
  }

  const parsedTax = Number(taxInput.replace(",", "."));
  const taxValid =
    taxInput.trim().length > 0 &&
    Number.isFinite(parsedTax) &&
    parsedTax >= 0 &&
    parsedTax <= 100 &&
    Math.round(parsedTax * 100) === parsedTax * 100;
  const canSave = storeName.trim().length > 0 && taxValid && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          taxPercent: parsedTax,
        }),
      });
      const json = (await res.json()) as ApiResponse<SettingsDTO>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gagal menyimpan pengaturan.");
        return;
      }

      saveSettingsCache(json.data);
      setStoreName(json.data.storeName);
      setTaxInput(String(json.data.taxPercent));
      toast.success("Pengaturan disimpan");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Pengaturan"
        subtitle="Atur nama toko dan persentase pajak global."
      />

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="settings-store-name" className="text-sm font-bold">
                  Nama toko
                </Label>
                <Input
                  id="settings-store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value.slice(0, 60))}
                  maxLength={60}
                  placeholder="Cemal Cemul"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-tax-percent" className="text-sm font-bold">
                  Persentase pajak (%)
                </Label>
                <Input
                  id="settings-tax-percent"
                  type="text"
                  inputMode="decimal"
                  value={taxInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9.,]/g, "");
                    setTaxInput(cleaned);
                  }}
                  placeholder="0"
                  aria-invalid={!taxValid}
                  className="h-11 rounded-xl tabular-nums"
                />
                {!taxValid ? (
                  <p className="text-xs font-semibold text-destructive">
                    Pajak harus antara 0–100 dengan maksimal 2 angka di belakang koma.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Perubahan pajak hanya berlaku untuk pesanan berikutnya dan
                    tidak mengubah riwayat pesanan lama.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!canSave}
                className="h-12 w-full gap-2 rounded-xl text-base font-bold sm:w-auto sm:px-6"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
