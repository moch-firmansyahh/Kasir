"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { ApiResponse, CategoryDTO } from "@/types/api";

type CategoryManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryDTO[];
  onChanged: () => void;
};

export function CategoryManager({
  open,
  onOpenChange,
  categories,
  onChanged,
}: CategoryManagerProps) {
  const isMobile = useIsMobile();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          sortOrder: categories.length + 1,
        }),
      });
      const json = (await res.json()) as ApiResponse<CategoryDTO>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gagal menambah kategori.");
        return;
      }
      setNewName("");
      toast.success(`Kategori "${json.data.name}" ditambahkan`);
      onChanged();
    } catch {
      toast.error("Gagal menambah kategori.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveRename(id: string) {
    const trimmed = editingName.trim();
    if (!trimmed || busyId) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = (await res.json()) as ApiResponse<CategoryDTO>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gagal mengubah kategori.");
        return;
      }
      setEditingId(null);
      toast.success("Kategori diperbarui");
      onChanged();
    } catch {
      toast.error("Gagal mengubah kategori.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(category: CategoryDTO) {
    if (busyId) return;
    setBusyId(category.id);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiResponse<{ id: string }>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gagal menghapus kategori.");
        return;
      }
      toast.success(`Kategori "${category.name}" dihapus`);
      onChanged();
    } catch {
      toast.error("Gagal menghapus kategori.");
    } finally {
      setBusyId(null);
    }
  }

  const body = (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value.slice(0, 50))}
          placeholder="Nama kategori baru..."
          aria-label="Nama kategori baru"
          className="h-11 rounded-xl"
        />
        <Button
          type="submit"
          disabled={!newName.trim() || creating}
          className="h-11 shrink-0 gap-1.5 rounded-xl px-4 font-bold"
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          <span>Tambah</span>
        </Button>
      </form>

      <div className="max-h-72 overflow-y-auto pr-1">
        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada kategori.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isBusy = busyId === cat.id;

              return (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
                >
                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-1.5">
                      <Input
                        value={editingName}
                        onChange={(e) =>
                          setEditingName(e.target.value.slice(0, 50))
                        }
                        aria-label={`Ubah nama ${cat.name}`}
                        className="h-9 rounded-lg"
                      />
                      <Button
                        type="button"
                        size="icon"
                        disabled={!editingName.trim() || isBusy}
                        onClick={() => handleSaveRename(cat.id)}
                        aria-label="Simpan nama kategori"
                        className="size-11 shrink-0 rounded-xl"
                      >
                        <Check className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(null)}
                        aria-label="Batal ubah kategori"
                        className="size-11 shrink-0 rounded-xl"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate text-sm font-bold text-foreground">
                        {cat.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditingName(cat.name);
                          }}
                          aria-label={`Edit kategori ${cat.name}`}
                          className="size-11 rounded-xl"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isBusy}
                              aria-label={`Hapus kategori ${cat.name}`}
                              className="size-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus kategori {cat.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Menu dalam kategori ini tidak ikut terhapus dan
                                akan menjadi tanpa kategori.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDelete(cat)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle className="font-display text-xl font-bold">
              Kelola Kategori
            </DrawerTitle>
            <DrawerDescription>
              Tambah, ubah nama, atau hapus kategori menu.
            </DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-10">
          <DialogTitle className="font-display text-xl font-bold">
            Kelola Kategori
          </DialogTitle>
          <DialogDescription>
            Tambah, ubah nama, atau hapus kategori menu.
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
