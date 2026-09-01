import { TZDate } from '@date-fns/tz';
import { format, formatISO } from 'date-fns';
import { es as esLocale } from 'date-fns/locale';

/**
 * Every date the user sees is formatted here.
 *
 * The API speaks UTC. A resource has its own time zone. The browser has a
 * third. Scattering `toLocaleString()` across components is how a booking app
 * ends up showing three different times for the same reservation.
 */

/**
 * Turns a wall-clock date and time in a given zone into the UTC instant the
 * API expects.
 *
 * This is the direction that gets written wrong. `new Date('2026-09-15T10:00')`
 * interprets the string in the BROWSER's zone, so booking a Madrid room from a
 * laptop set to Bogotá would silently land six hours out. TZDate's component
 * constructor is explicit about which zone the wall clock belongs to.
 *
 * @param date `2026-09-15`, as an <input type="date"> produces it
 * @param time `10:00`, as an <input type="time"> produces it
 */
export function wallClockToUtc(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  const instant = new TZDate(
    year!,
    month! - 1, // TZDate takes a zero-based month, like Date
    day!,
    hours!,
    minutes!,
    0,
    0,
    timeZone,
  );

  return new Date(instant.getTime()).toISOString();
}

/** The viewer's own zone, used when a resource has none. */
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** `14:30` in the given zone. */
export function formatTime(value: Date | string, timeZone: string): string {
  return format(new TZDate(new Date(value), timeZone), 'HH:mm', { locale: esLocale });
}

/** `15 sep 2026` in the given zone. */
export function formatDate(value: Date | string, timeZone: string): string {
  return format(new TZDate(new Date(value), timeZone), 'd MMM yyyy', { locale: esLocale });
}

/** `15 sep 2026, 10:00` in the given zone. */
export function formatDateTime(value: Date | string, timeZone: string): string {
  return format(new TZDate(new Date(value), timeZone), 'd MMM yyyy, HH:mm', { locale: esLocale });
}

/**
 * `10:00 – 11:00`, or `15 sep 10:00 – 16 sep 09:00` when it crosses midnight.
 *
 * The end is exclusive, matching the API's `[start, end)`: a slot shown as
 * 10:00–11:00 leaves 11:00 free, and the UI must not imply otherwise.
 */
export function formatRange(start: Date | string, end: Date | string, timeZone: string): string {
  const from = new TZDate(new Date(start), timeZone);
  const to = new TZDate(new Date(end), timeZone);
  const sameDay = format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd');

  return sameDay
    ? `${format(from, 'HH:mm')} – ${format(to, 'HH:mm')}`
    : `${formatDateTime(from, timeZone)} – ${formatDateTime(to, timeZone)}`;
}

/** Serialises to the UTC ISO 8601 the API expects. */
export function toApiInstant(value: Date): string {
  return formatISO(value, { representation: 'complete' });
}

/** True when the resource's zone differs from the viewer's, so the UI can say so. */
export function isForeignTimeZone(timeZone: string): boolean {
  return timeZone !== browserTimeZone();
}
