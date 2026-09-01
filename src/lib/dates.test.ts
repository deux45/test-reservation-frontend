import { describe, expect, it } from 'vitest';
import { formatRange, formatTime, isForeignTimeZone } from './dates';

/**
 * These tests only mean anything with TZ pinned to UTC (see vitest.config.ts).
 * The whole point is catching the case where the viewer's zone differs from
 * the resource's -- which is exactly what a machine-local timezone hides.
 */
describe('dates', () => {
  const utcInstant = '2026-09-15T10:00:00Z';

  it('renders an instant in the resource time zone, not the browser one', () => {
    expect(formatTime(utcInstant, 'UTC')).toBe('10:00');
    expect(formatTime(utcInstant, 'Europe/Madrid')).toBe('12:00'); // CEST, UTC+2
    expect(formatTime(utcInstant, 'America/Bogota')).toBe('05:00'); // UTC-5
  });

  it('renders a same-day range as times only', () => {
    expect(formatRange(utcInstant, '2026-09-15T11:00:00Z', 'UTC')).toBe('10:00 – 11:00');
  });

  it('renders a range that crosses midnight with both dates', () => {
    const range = formatRange('2026-09-15T23:00:00Z', '2026-09-16T01:00:00Z', 'UTC');
    expect(range).toBe('15 sep 2026, 23:00 – 16 sep 2026, 01:00');
  });

  it('survives the DST boundary in the resource zone', () => {
    // Last Sunday of October 2026: Madrid goes from CEST (+2) to CET (+1).
    expect(formatTime('2026-10-25T00:30:00Z', 'Europe/Madrid')).toBe('02:30');
    expect(formatTime('2026-10-25T01:30:00Z', 'Europe/Madrid')).toBe('02:30');
  });

  it('detects a resource in a different zone than the viewer', () => {
    expect(isForeignTimeZone('UTC')).toBe(false); // TZ is pinned to UTC
    expect(isForeignTimeZone('Asia/Tokyo')).toBe(true);
  });
});
