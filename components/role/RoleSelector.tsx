"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChefHat, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getRoleHomePath,
  getRoleLabel,
  setClientRoleCookie,
  type PosRole,
} from "@/lib/role";
import { cn } from "@/lib/utils";

type RoleSelectorProps = {
  savedRole: PosRole | null;
};

const ROLE_CARDS: {
  role: PosRole;
  title: string;
  description: string;
  icon: typeof ShoppingBag;
  iconBgClass: string;
}[] = [
  {
    role: "kasir",
    title: "Kasir",
    description:
      "Input pesanan, hitung total otomatis, pilih pembayaran, kelola menu, dan lihat riwayat.",
    icon: ShoppingBag,
    iconBgClass: "bg-primary/20 text-foreground",
  },
  {
    role: "dapur",
    title: "Dapur",
    description:
      "Pantau pesanan masuk secara realtime dan ubah status masak dari Baru hingga Selesai.",
    icon: ChefHat,
    iconBgClass: "bg-brand-teal/15 text-brand-teal",
  },
];

export function RoleSelector({ savedRole }: RoleSelectorProps) {
  const router = useRouter();
  const [navigatingRole, setNavigatingRole] = useState<PosRole | null>(null);

  function handleSelect(role: PosRole) {
    setNavigatingRole(role);
    setClientRoleCookie(role);
    router.push(getRoleHomePath(role));
    router.refresh();
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {savedRole ? (
        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="min-h-12 gap-2 rounded-2xl px-6 text-base font-bold shadow-sm"
          >
            <Link href={getRoleHomePath(savedRole)}>
              <span>Lanjut sebagai {getRoleLabel(savedRole)}</span>
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLE_CARDS.map((item) => {
          const Icon = item.icon;
          const isLoading = navigatingRole === item.role;

          return (
            <button
              key={item.role}
              type="button"
              onClick={() => handleSelect(item.role)}
              disabled={navigatingRole !== null}
              className="group text-left outline-none focus-visible:ring-3 focus-visible:ring-ring rounded-2xl disabled:opacity-70"
            >
              <Card
                className={cn(
                  "h-full rounded-2xl border border-border bg-card shadow-sm transition-all",
                  "group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-md",
                  "group-active:scale-[0.98]"
                )}
              >
                <CardContent className="flex min-h-44 flex-col justify-between gap-4 p-6">
                  <div
                    className={cn(
                      "flex size-14 items-center justify-center rounded-2xl",
                      item.iconBgClass
                    )}
                  >
                    <Icon className="size-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <span>{isLoading ? "Membuka..." : `Masuk ke ${item.title}`}</span>
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
