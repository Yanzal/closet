/** Small date helpers for the calendar + trips (keys are 'YYYY-MM-DD'). */

export const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDaysKey(key: string, days: number): string {
  const d = fromKey(key);
  return toKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Calendar cells for a month: leading/trailing blanks (null) so each week has 7 entries. */
export function monthCells(year: number, month: number, mondayStart = false): (string | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sunday
  const lead = mondayStart ? (firstDow + 6) % 7 : firstDow;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Weekday short labels, ordered for the chosen week start. */
export function weekdayLabels(mondayStart = false): string[] {
  const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return mondayStart ? [...base.slice(1), base[0]] : base;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Inclusive list of day keys from start to end (capped to a year for safety). */
export function eachDayKey(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let d = fromKey(startKey);
  const end = fromKey(endKey);
  let guard = 0;
  while (d <= end && guard < 366) {
    out.push(toKey(d));
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    guard++;
  }
  return out;
}

export function fmtDayShort(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmtRange(startKey: string, endKey: string): string {
  const s = fromKey(startKey);
  const e = fromKey(endKey);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}
