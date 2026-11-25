"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { CategoryManager } from "@/components/menu-admin/CategoryManager";
import { MenuForm } from "@/components/menu-admin/MenuForm";
import { MenuTable } from "@/components/menu-admin/MenuTable";
import { CategoryTabs } from "@/components/pos/CategoryTabs";
import { SearchBar } from "@/components/pos/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { loadMenuAdminCache, saveMenuAdminCache } from "@/lib/offline/posCache";
import type { ApiResponse, CategoryDTO, MenuItemDTO } from "@/types/api";

export default function KasirMenuPage() {
  const [initialCache] = useState(() => loadMenuAdminCache());
  const [categories, setCategories] = useState<CategoryDTO[]>(
    () => initialCache?.categories ?? []
  );
  const [items, setItems] = useState<MenuItemDTO[]>(
    () => initialCache?.items ?? []
  );
  const [loading, setLoading] = useState(() => !initialCache);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all"
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDTO | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const fetchMenu = useCallback(async () => {
    const res = await fetch("/api/menu?includeInactive=true", {
      cache: "no-store",
    });
    const json = (await res.json()) as ApiResponse<{
      categories: CategoryDTO[];
      items: MenuItemDTO[];
    }>;
    if (!res.ok || json.error) {
      throw new Error(json.error?.message ?? "Gagal memuat daftar menu.");
    }
    saveMenuAdminCache(json.data);
    return json.data;
  }, []);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchMenu();
      setCategories(data.categories);
      setItems(data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar menu."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchMenu]);

  useEffect(() => {
    let cancelled = false;
    fetchMenu()
      .then((data) => {
        if (cancelled) return;
        setCategories(data.categories);
        setItems(data.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (!initialCache) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat daftar menu."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchMenu, initialCache]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCat =
        selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
      const matchesQuery = !query || item.name.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [items, searchQuery, selectedCategoryId]);

  async function handleToggleActive(item: MenuItemDTO, nextActive: boolean) {
    setBusyId(item.id);
    setItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, isActive: nextActive } : m))
    );
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const json = (await res.json()) as ApiResponse<MenuItemDTO>;
      if (!res.ok || json.error) {
        setItems((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, isActive: item.isActive } : m
          )
        );
        toast.error(json.error?.message ?? "Gagal mengubah status menu.");
        return;
      }
      toast.success(
        nextActive
          ? `${item.name} diaktifkan`
          : `${item.name} dinonaktifkan`
      );
    } catch {
      setItems((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, isActive: item.isActive } : m
        )
      );
      toast.error("Gagal mengubah status menu.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: MenuItemDTO) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ id: string }>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gagal menghapus menu.");
        return;
      }
      setItems((prev) => prev.filter((m) => m.id !== item.id));
      toast.success(`Menu "${item.name}" dihapus`);
    } catch {
      toast.error("Gagal menghapus menu.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Kelola Menu"
        subtitle="Tambah, edit, atau aktif/nonaktifkan menu dan variannya."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryOpen(true)}
              className="min-h-11 gap-2 rounded-xl font-bold"
            >
              <FolderKanban className="size-4" aria-hidden="true" />
              <span>Kategori</span>
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setFormOpen(true);
              }}
              className="min-h-11 gap-2 rounded-xl font-bold"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>Tambah Menu</span>
            </Button>
          </>
        }
      />

      <div className="space-y-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {!loading && !error ? (
          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            void reload();
          }}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={
            items.length === 0
              ? "Belum ada menu. Tambahkan menu pertama Anda."
              : "Tidak ada menu yang cocok."
          }
          action={
            items.length === 0 ? (
              <Button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setFormOpen(true);
                }}
                className="min-h-11 gap-2 rounded-xl font-bold"
              >
                <Plus className="size-4" aria-hidden="true" />
                <span>Tambah Menu</span>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MenuTable
          items={filteredItems}
          busyId={busyId}
          onToggleActive={handleToggleActive}
          onEdit={(item) => {
            setEditingItem(item);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <MenuForm
        key={`${editingItem?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialItem={editingItem}
        categories={categories}
        onSaved={() => void reload()}
      />

      <CategoryManager
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        categories={categories}
        onChanged={() => void reload()}
      />
    </div>
  );
}
