import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md rounded-2xl border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-foreground">
            <SearchX className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              Halaman tidak ditemukan
            </h1>
            <p className="text-sm text-muted-foreground">
              Alamat yang Anda buka tidak tersedia di aplikasi Cemal Cemul.
            </p>
          </div>
          <Button asChild className="min-h-11 gap-2 rounded-xl px-6 font-bold">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
