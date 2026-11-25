import { Money } from "@/components/shared/Money";
import { Separator } from "@/components/ui/separator";
import type { Totals } from "@/lib/pricing";

type SummaryProps = {
  totals: Totals;
  taxPercent: number;
};

export function Summary({ totals, taxPercent }: SummaryProps) {
  const showTax = taxPercent > 0 || totals.tax > 0;

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-muted/40 p-3.5 text-sm">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span>Subtotal</span>
        <Money amount={totals.subtotal} className="font-semibold text-foreground" />
      </div>

      {totals.discount > 0 ? (
        <div className="flex items-center justify-between gap-2 text-destructive">
          <span>Diskon</span>
          <Money amount={totals.discount} negative className="font-semibold" />
        </div>
      ) : null}

      {showTax ? (
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>Pajak ({taxPercent}%)</span>
          <Money amount={totals.tax} className="font-semibold text-foreground" />
        </div>
      ) : null}

      <Separator className="my-1 bg-border" />

      <div className="flex items-center justify-between gap-2 text-base font-extrabold text-foreground">
        <span>Total</span>
        <Money amount={totals.total} className="text-lg font-extrabold" />
      </div>
    </div>
  );
}
