export function formatDateChip(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  return formatted.replace(",", "").toUpperCase();
}

/** Parses a "YYYY-MM-DD" (or datetime) string as a UTC calendar date. */
export function parseISODateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function daysSinceISO(iso: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((todayUTC().getTime() - parseISODateOnly(iso).getTime()) / msPerDay));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseISODateOnly(iso));
}

export function formatDayMonthUpper(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })
    .format(parseISODateOnly(iso))
    .toUpperCase();
}

/** "01 AUG → 20 AUG 2026" — matches the design's mono date-range styling. */
export function formatRangeLabelUpper(startIso: string, endIso: string): string {
  const year = parseISODateOnly(endIso).getUTCFullYear();
  return `${formatDayMonthUpper(startIso)} → ${formatDayMonthUpper(endIso)} ${year}`;
}

/** "CYCLE 01 JAN – 31 DEC 2026" — matches the balance card's cycle label. */
export function formatCycleLabel(startIso: string, endIso: string): string {
  const year = parseISODateOnly(endIso).getUTCFullYear();
  return `CYCLE ${formatDayMonthUpper(startIso)} – ${formatDayMonthUpper(endIso)} ${year}`;
}

/** "10 AUG · 09:00" — for audit-log timestamps ("YYYY-MM-DD HH:MM:SS"). */
export function formatDateTimeUpper(datetime: string): string {
  const [datePart, timePart] = datetime.split(" ");
  const dayMonth = formatDayMonthUpper(datePart);
  return timePart ? `${dayMonth} · ${timePart.slice(0, 5)}` : dayMonth;
}
