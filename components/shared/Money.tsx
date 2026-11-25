import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

type MoneyProps = {
  amount: number;
  className?: string;
  negative?: boolean;
};

/**
 * Renders integer rupiah values with aligned tabular numerals.
 */
export function Money({ amount, className, negative = false }: MoneyProps) {
  const formatted = formatRupiah(Math.abs(amount));
  const prefix = negative && amount > 0 ? "-" : "";

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
    </span>
  );
}
