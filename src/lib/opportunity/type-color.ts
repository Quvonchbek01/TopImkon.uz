import { type OpportunityType } from './types';

/**
 * Tag colours per type group (DESIGN.md section 2.5). The names match the
 * `Badge` variants, and every colour pair is a themed token so both light and
 * dark mode keep AA contrast.
 */
export type TypeTone = 'orange' | 'teal' | 'sunflower' | 'plum' | 'espresso' | 'berry';

export const TYPE_TONE: Record<OpportunityType, TypeTone> = {
  internship: 'orange',
  job_entry: 'orange',
  scholarship_bachelor: 'teal',
  scholarship_master: 'teal',
  scholarship_phd: 'teal',
  grant: 'teal',
  summer_school: 'sunflower',
  course: 'sunflower',
  exchange: 'plum',
  volunteering: 'plum',
  research_program: 'espresso',
  fellowship: 'espresso',
  competition: 'berry',
  conference: 'berry',
};

/** Static classes (never build Tailwind class names dynamically). */
export const TONE_SURFACE: Record<TypeTone, string> = {
  orange: 'bg-tag-orange-bg text-tag-orange-fg',
  teal: 'bg-tag-teal-bg text-tag-teal-fg',
  sunflower: 'bg-tag-sunflower-bg text-tag-sunflower-fg',
  plum: 'bg-tag-plum-bg text-tag-plum-fg',
  espresso: 'bg-tag-espresso-bg text-tag-espresso-fg',
  berry: 'bg-tag-berry-bg text-tag-berry-fg',
};

export function typeTone(type: OpportunityType): TypeTone {
  return TYPE_TONE[type];
}

export function typeSurfaceClass(type: OpportunityType): string {
  return TONE_SURFACE[TYPE_TONE[type]];
}
