import { describe, expect, it } from 'vitest';

import {
  daysUntil,
  deadlineTone,
  SOON_THRESHOLD_DAYS,
  URGENT_THRESHOLD_DAYS,
  WARNING_THRESHOLD_DAYS,
} from '@/lib/opportunity/deadline';

describe('daysUntil', () => {
  it('counts whole days and ignores the time of day', () => {
    const deadline = new Date('2026-05-10T23:30:00Z');
    const today = new Date('2026-05-01T00:15:00Z');
    expect(daysUntil(deadline, today)).toBe(9);
  });

  it('returns 0 for a deadline later today', () => {
    expect(daysUntil(new Date('2026-05-01T20:00:00Z'), new Date('2026-05-01T06:00:00Z'))).toBe(0);
  });

  it('returns a negative number for a passed deadline', () => {
    expect(daysUntil(new Date('2026-04-28T12:00:00Z'), new Date('2026-05-01T12:00:00Z'))).toBe(-3);
  });
});

describe('deadlineTone', () => {
  it('has no tone without a fixed deadline', () => {
    expect(deadlineTone(null)).toBeNull();
  });

  it('marks passed deadlines as closed', () => {
    expect(deadlineTone(-1)).toBe('closed');
  });

  it('uses the urgent tone below the urgent threshold', () => {
    expect(deadlineTone(0)).toBe('urgent');
    expect(deadlineTone(URGENT_THRESHOLD_DAYS - 1)).toBe('urgent');
  });

  it('uses the soon tone up to the soon threshold', () => {
    expect(deadlineTone(URGENT_THRESHOLD_DAYS)).toBe('soon');
    expect(deadlineTone(SOON_THRESHOLD_DAYS)).toBe('soon');
  });

  it('uses the warning tone up to the warning threshold', () => {
    expect(deadlineTone(SOON_THRESHOLD_DAYS + 1)).toBe('warning');
    expect(deadlineTone(WARNING_THRESHOLD_DAYS)).toBe('warning');
  });

  it('uses the far tone beyond the warning threshold', () => {
    expect(deadlineTone(WARNING_THRESHOLD_DAYS + 1)).toBe('far');
    expect(deadlineTone(400)).toBe('far');
  });

  it('keeps the thresholds in the documented order', () => {
    expect(URGENT_THRESHOLD_DAYS).toBeLessThan(SOON_THRESHOLD_DAYS);
    expect(SOON_THRESHOLD_DAYS).toBeLessThan(WARNING_THRESHOLD_DAYS);
  });
});
