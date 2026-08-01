/**
 * Which messages are showing today, worked out on the reader's own device.
 *
 * There is no scheduler behind this and no job running at midnight. That is
 * the point: a Cloud Function needs the Blaze plan, a cron needs somewhere to
 * run, and neither is worth taking on to show a teenager one tip a day. The
 * calendar day is a number every device can compute, so the day itself picks
 * the message -- everyone opening the app on the same date sees the same one,
 * without anything having been sent.
 *
 * `today` is always passed in rather than read from the clock here. Reading
 * the clock inside a render is impure, the React Compiler may call a render
 * twice, and a function that quietly depends on "now" cannot be tested.
 */
import type { NotificationDoc } from "@/content/schema";

/** Whole days since the epoch, in LOCAL time. */
export function dayNumber(date: Date): number {
  // Built from the local Y/M/D rather than from the timestamp, so a learner
  // in Casablanca and one in Paris both roll over at their own midnight
  // instead of at UTC's.
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local / 86_400_000);
}

/** Whole weeks since the epoch. Weeks change on the same boundary for all. */
export function weekNumber(date: Date): number {
  return Math.floor(dayNumber(date) / 7);
}

/** "YYYY-MM-DD" for a local date, which is how `date` schedules are written. */
export function isoDay(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/**
 * The messages visible on `today`.
 *
 * Dated messages are all of them that have arrived, newest first -- an
 * announcement does not stop being true tomorrow. The daily and weekly pools
 * contribute exactly ONE each, chosen by the date, which is what stops twenty
 * tips from arriving as twenty unread notifications on the first morning.
 */
export function visibleNotifications(
  all: NotificationDoc[],
  today: Date,
): NotificationDoc[] {
  const published = all.filter((n) => n.status === "published");
  const byOrder = [...published].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const out: NotificationDoc[] = [];

  const dated = byOrder
    .filter((n) => n.schedule.kind === "date" && n.schedule.date <= isoDay(today))
    .sort((a, b) => {
      const da = a.schedule.kind === "date" ? a.schedule.date : "";
      const db = b.schedule.kind === "date" ? b.schedule.date : "";
      return db.localeCompare(da); // newest announcement first
    });
  out.push(...dated);

  const daily = byOrder.filter((n) => n.schedule.kind === "daily");
  if (daily.length) out.push(daily[dayNumber(today) % daily.length]);

  const weekly = byOrder.filter((n) => n.schedule.kind === "weekly");
  if (weekly.length) out.push(weekly[weekNumber(today) % weekly.length]);

  return out;
}

/** Visible and not yet opened by this learner. */
export function unreadNotifications(
  visible: NotificationDoc[],
  readIds: ReadonlySet<string>,
): NotificationDoc[] {
  return visible.filter((n) => !readIds.has(n.id));
}
