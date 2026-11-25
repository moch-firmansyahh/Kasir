"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  VariantEditor,
  type EditableVariant,
} from "@/components/menu-admin/VariantEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/useIsMobile";
import { compressImageFile } from "@/lib/image";
import { MAX_UPLOAD_BYTES } from "@/lib/validators";
import type { ApiResponse, CategoryDTO, MenuItemDTO } from "@/types/api";

const NO_CATEGORY = "__none__";

type MenuFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem: MenuItemDTO | null;
  categories: CategoryDTO[];
  onSaved: () => void;
};

export function MenuForm({
  open,
  onOpenChange,
  initialItem,
  categories,
  onSaved,
}: MenuFormProps) {
  const isMobile = useIsMobile();
  const isEdit = Boolean(initialItem);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialItem?.name ?? "");
  const [priceInput, setPriceInput] = useState(
    initialItem ? String(initialItem.price) : ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialItem?.categoryId ?? NO_CATEGORY
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialItem?.imageUrl ?? null
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialItem?.isActive ?? true
  );
  const [variantLabel, setVariantLabel] = useState<string>(
    initialItem?.variantLabel ?? "Varian"
  );
  const [variantPick, setVariantPick] = useState<number>(
    initialItem?.variantPick ?? 0
  );
  const [variants, setVariants] = useState<EditableVariant[]>(
    initialItem?.variants.map((v, idx) => ({
      name: v.name,
      sortOrder: v.sortOrder ?? idx,
    })) ?? []
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const price = priceInput.trim() ? Number.parseInt(priceInput.trim(), 10) : NaN;
  const variantInvalid = variantPick > 0 && variants.length < variantPick;
  const canSave =
    name.trim().length > 0 &&
    Number.isInteger(price) &&
    price >= 0 &&
    !variantInvalid &&
    !uploadingImage &&
    !saving;

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    setUploadingImage(true);
    try {
      const compressed = await compressImageFile(selected);
      if (compressed.size > MAX_UPLOAD_BYTES) {
        toast.error("Ukuran gambar maksimal 2 MB.");
        return;
      }

      const formData = new FormData();
      formData.append("file", compressed);
      if (initialItem?.id) {
        formData.append("menuId", initialItem.id);
      }

      const res = await fetch("/api/upload/menu-image", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as ApiResponse<{ imageUrl: string }>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gambar gagal diunggah.");
        return;
      }

      setImageUrl(json.data.imageUrl);
      toast.success("Gambar menu diunggah");
    } catch {
      toast.error("Gambar gagal diproses atau diunggah.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit() {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        price,
        categoryId: categoryId === NO_CATEGORY ? null : categoryId,
        imageUrl,
        isActive,
        variantLabel: variantLabel.trim() || "Varian",
        variantPick,
        variants: variants.map((v, idx) => ({
          name: v.name.trim(),
          sortOrder: idx,
        })),
      };

      const url = initialItem ? `/api/menu/${initialItem.id}` : "/api/menu";
      const method = initialItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiResponse<MenuItemDTO>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Gagal menyimpan menu.");
        return;
      }

      toast.success(
        isEdit ? `Menu "${json.data.name}" diperbarui` : `Menu "${json.data.name}" ditambahkan`
      );
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Gagal menyimpan menu.");
    } finally {
      setSaving(false);
    }
  }

  const formBody = (
    <ScrollArea className="max-h-[68vh] pr-3">
      <div className="space-y-4 pb-2">
        <div className="space-y-1.5">
          <Label htmlFor="menu-name" className="text-xs font-semibold">
            Nama menu
          </Label>
          <Input
            id="menu-name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            placeholder="Contoh: Mix Platter"
            maxLength={80}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="menu-price" className="text-xs font-semibold">
              Harga (Rp)
            </Label>
            <Input
              id="menu-price"
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="15000"
              className="h-11 rounded-xl tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="menu-category" className="text-xs font-semibold">
              Kategori (opsional)
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="menu-category" className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Tanpa kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground">
            Gambar menu (opsional)
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelected}
            className="hidden"
            aria-label="Pilih gambar menu"
          />
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={imageUrl}
                  alt={name || "Preview menu"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingImage || saving}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-11 gap-2 rounded-xl"
              >
                {uploadingImage ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="size-4" aria-hidden="true" />
                )}
                <span>
                  {uploadingImage
                    ? "Mengunggah..."
                    : imageUrl
                      ? "Ganti gambar"
                      : "Unggah gambar"}
                </span>
              </Button>
              {imageUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploadingImage || saving}
                  onClick={() => setImageUrl(null)}
                  className="min-h-11 gap-1.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span>Hapus gambar</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5">
          <div>
            <Label htmlFor="menu-active-switch" className="text-sm font-bold">
              Menu aktif di Kasir
            </Label>
            <p className="text-xs text-muted-foreground">
              Menu nonaktif disembunyikan dari layar kasir.
            </p>
          </div>
          <Switch
            id="menu-active-switch"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <VariantEditor
          variantLabel={variantLabel}
          variantPick={variantPick}
          variants={variants}
          onVariantLabelChange={setVariantLabel}
          onVariantPickChange={setVariantPick}
          onVariantsChange={setVariants}
        />
      </div>
    </ScrollArea>
  );

  const footerButton = (
    <Button
      type="button"
      size="lg"
      disabled={!canSave}
      onClick={handleSubmit}
      className="h-12 w-full gap-2 rounded-xl text-base font-bold"
    >
      {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      <span>{saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Menu"}</span>
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle className="font-display text-xl font-bold">
              {isEdit ? "Edit Menu" : "Tambah Menu"}
            </DrawerTitle>
            <DrawerDescription>
              Perubahan harga tidak memengaruhi riwayat pesanan lama.
            </DrawerDescription>
          </DrawerHeader>
          {formBody}
          <DrawerFooter className="px-0 pt-3">{footerButton}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {isEdit ? "Edit Menu" : "Tambah Menu"}
          </DialogTitle>
          <DialogDescription>
            Perubahan harga tidak memengaruhi riwayat pesanan lama.
          </DialogDescription>
        </DialogHeader>
        {formBody}
        <DialogFooter>{footerButton}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
