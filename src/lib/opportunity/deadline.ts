/**
 * Deadline urgency rules. Source: DESIGN.md section 2.4 and the decisions log in
 * PROJECT_SPEC.md section 18:
 *   under 3 days -> urgent (berry), 3-14 days -> soon (orange),
 *   15-30 days -> warning (sunflower), over 30 days -> far (brown).
 *
 * Pure functions: the card badge and the detail page countdown both use them.
 */

export const DEADLINE_TONES = ['closed', 'urgent', 'soon', 'warning', 'far'] as const;

export type DeadlineTone = (typeof DEADLINE_TONES)[number];

export const URGENT_THRESHOLD_DAYS = 3;
export const SOON_THRESHOLD_DAYS = 14;
export const WARNING_THRESHOLD_DAYS = 30;

/** Whole days between today and the deadline. Negative means it has passed. */
export function daysUntil(deadline: Date, today: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const deadlineStart = Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate(),
  );
  const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((deadlineStart - todayStart) / MS_PER_DAY);
}

/** `null` means "no fixed deadline" (rolling, recurring or unknown). */
export function deadlineTone(daysLeft: number | null): DeadlineTone | null {
  if (daysLeft === null) return null;
  if (daysLeft < 0) return 'closed';
  if (daysLeft < URGENT_THRESHOLD_DAYS) return 'urgent';
  if (daysLeft <= SOON_THRESHOLD_DAYS) return 'soon';
  if (daysLeft <= WARNING_THRESHOLD_DAYS) return 'warning';
  return 'far';
}
