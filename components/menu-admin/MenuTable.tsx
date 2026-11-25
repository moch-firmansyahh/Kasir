"use client";

import Image from "next/image";
import { Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { Money } from "@/components/shared/Money";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MenuItemDTO } from "@/types/api";

type MenuTableProps = {
  items: MenuItemDTO[];
  busyId: string | null;
  onToggleActive: (item: MenuItemDTO, nextActive: boolean) => void;
  onEdit: (item: MenuItemDTO) => void;
  onDelete: (item: MenuItemDTO) => void;
};

export function MenuTable({
  items,
  busyId,
  onToggleActive,
  onEdit,
  onDelete,
}: MenuTableProps) {
  return (
    <>
      {/* Desktop & tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-xs md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="h-12 px-4 pl-6">Menu</TableHead>
              <TableHead className="h-12 px-4">Kategori</TableHead>
              <TableHead className="h-12 px-4">Harga</TableHead>
              <TableHead className="h-12 px-4">Varian</TableHead>
              <TableHead className="h-12 px-4">Aktif</TableHead>
              <TableHead className="h-12 px-4 pr-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isBusy = busyId === item.id;
              return (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted/60">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <UtensilsCrossed className="size-4" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-foreground">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {item.categoryName ? (
                      <Badge variant="outline" className="bg-muted/40 font-semibold">
                        {item.categoryName}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Tanpa kategori
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Money amount={item.price} className="font-bold text-foreground" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {item.variantPick > 0 ? (
                      <Badge className="border-transparent bg-brand-yellow text-foreground font-bold">
                        Pilih {item.variantPick} ({item.variants.length})
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Tanpa varian
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Switch
                      checked={item.isActive}
                      disabled={isBusy}
                      aria-label={`Aktifkan ${item.name}`}
                      onCheckedChange={(checked) => onToggleActive(item, checked)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 pr-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isBusy}
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
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
                            aria-label={`Hapus ${item.name}`}
                            className="size-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus {item.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hapus {item.name}? Riwayat pesanan tidak terpengaruh.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => onDelete(item)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const isBusy = busyId === item.id;
          return (
            <Card key={item.id} className="rounded-2xl border-border bg-card shadow-xs">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted/60">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <UtensilsCrossed className="size-5" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-sm font-extrabold text-foreground">
                      <Money amount={item.price} />
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.categoryName ? (
                        <Badge variant="outline" className="text-xs">
                          {item.categoryName}
                        </Badge>
                      ) : null}
                      {item.variantPick > 0 ? (
                        <Badge className="border-transparent bg-brand-yellow text-xs font-bold text-foreground">
                          Pilih {item.variantPick}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isActive}
                      disabled={isBusy}
                      aria-label={`Aktifkan ${item.name}`}
                      onCheckedChange={(checked) => onToggleActive(item, checked)}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isBusy}
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      className="size-11 rounded-xl"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isBusy}
                          aria-label={`Hapus ${item.name}`}
                          className="size-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus {item.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hapus {item.name}? Riwayat pesanan tidak terpengaruh.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => onDelete(item)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
