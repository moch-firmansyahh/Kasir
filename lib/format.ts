const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  dateStyle: "medium",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Formats an integer rupiah amount into Indonesian display format (e.g. "Rp 15.000").
 */
export function formatRupiah(amount: number): string {
  const safeInt = Number.isFinite(amount) ? Math.round(amount) : 0;
  return rupiahFormatter.format(safeInt).replace(/\u00A0/g, " ");
}

/**
 * Formats an ISO UTC timestamp into WIB (Asia/Jakarta) date and time.
 */
export function formatWaktu(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/**
 * Formats an ISO UTC timestamp into WIB hour:minute string (e.g. "14.30" / "14:30").
 */
export function formatJamWIB(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/**
 * Formats relative elapsed time in Indonesian for kitchen and history cards.
 */
export function formatWaktuRelatif(iso: string, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - new Date(iso).getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Baru saja";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} mnt lalu`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Returns the UTC ISO timestamp corresponding to 00:00:00 WIB (Asia/Jakarta)
 * for the day containing `now`.
 */
export function getWibTodayStartIso(now: Date = new Date()): string {
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  const wibMidnightUtcMs =
    Date.UTC(
      wibNow.getUTCFullYear(),
      wibNow.getUTCMonth(),
      wibNow.getUTCDate()
    ) - WIB_OFFSET_MS;
  return new Date(wibMidnightUtcMs).toISOString();
}

/**
 * Returns YYYY-MM-DD string in WIB (Asia/Jakarta).
 */
export function getWibDateString(date: Date = new Date()): string {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const d = String(wib.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Converts inclusive YYYY-MM-DD WIB date range into [startIso, endExclusiveIso) UTC bounds.
 */
export function getWibDateRangeIso(
  fromYmd: string,
  toYmd: string
): { startIso: string; endExclusiveIso: string } | null {
  const matchFrom = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromYmd);
  const matchTo = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toYmd);
  if (!matchFrom || !matchTo) return null;

  const startMs =
    Date.UTC(
      Number(matchFrom[1]),
      Number(matchFrom[2]) - 1,
      Number(matchFrom[3])
    ) - WIB_OFFSET_MS;
  const endExclusiveMs =
    Date.UTC(
      Number(matchTo[1]),
      Number(matchTo[2]) - 1,
      Number(matchTo[3]) + 1
    ) - WIB_OFFSET_MS;

  if (Number.isNaN(startMs) || Number.isNaN(endExclusiveMs) || endExclusiveMs <= startMs) {
    return null;
  }

  return {
    startIso: new Date(startMs).toISOString(),
    endExclusiveIso: new Date(endExclusiveMs).toISOString(),
  };
}
