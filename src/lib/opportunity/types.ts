/**
 * Opportunity taxonomy from PROJECT_SPEC.md section 6. These strings are part of
 * the public URL (`/explore?type=...`) and the database enum, so keep them stable.
 */
export const OPPORTUNITY_TYPES = [
  'internship',
  'summer_school',
  'scholarship_bachelor',
  'scholarship_master',
  'scholarship_phd',
  'exchange',
  'fellowship',
  'research_program',
  'grant',
  'competition',
  'conference',
  'volunteering',
  'job_entry',
  'course',
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export function isOpportunityType(value: unknown): value is OpportunityType {
  return typeof value === 'string' && (OPPORTUNITY_TYPES as readonly string[]).includes(value);
}
