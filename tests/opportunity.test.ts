import { describe, expect, it } from 'vitest';

import { TONE_SURFACE, typeSurfaceClass, typeTone } from '@/lib/opportunity/type-color';
import { isOpportunityType, OPPORTUNITY_TYPES } from '@/lib/opportunity/types';

describe('OPPORTUNITY_TYPES', () => {
  it('contains the 14 taxonomy values without duplicates', () => {
    expect(OPPORTUNITY_TYPES).toHaveLength(14);
    expect(new Set(OPPORTUNITY_TYPES).size).toBe(OPPORTUNITY_TYPES.length);
  });

  it('uses snake_case slugs that are safe in a query string', () => {
    for (const type of OPPORTUNITY_TYPES) {
      expect(type).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });
});

describe('isOpportunityType', () => {
  it('accepts every known type', () => {
    for (const type of OPPORTUNITY_TYPES) {
      expect(isOpportunityType(type)).toBe(true);
    }
  });

  it('rejects unknown values such as empty strings, wrong casing and objects', () => {
    expect(isOpportunityType('')).toBe(false);
    expect(isOpportunityType('Internship')).toBe(false);
    expect(isOpportunityType('scholarship')).toBe(false);
    expect(isOpportunityType(null)).toBe(false);
    expect(isOpportunityType(undefined)).toBe(false);
    expect(isOpportunityType(42)).toBe(false);
    expect(isOpportunityType({ type: 'grant' })).toBe(false);
  });
});

describe('type colours', () => {
  it('gives every type a tone with a static surface class', () => {
    for (const type of OPPORTUNITY_TYPES) {
      const tone = typeTone(type);
      expect(TONE_SURFACE[tone]).toBeTypeOf('string');
      expect(typeSurfaceClass(type)).toBe(TONE_SURFACE[tone]);
    }
  });

  it('uses literal Tailwind classes so the scanner can find them', () => {
    for (const className of Object.values(TONE_SURFACE)) {
      expect(className).toMatch(/^bg-tag-[a-z]+-bg text-tag-[a-z]+-fg$/);
    }
  });

  it('keeps the type groups from DESIGN.md section 2.5', () => {
    expect(typeTone('internship')).toBe('orange');
    expect(typeTone('job_entry')).toBe('orange');
    expect(typeTone('scholarship_master')).toBe('teal');
    expect(typeTone('grant')).toBe('teal');
    expect(typeTone('summer_school')).toBe('sunflower');
    expect(typeTone('course')).toBe('sunflower');
    expect(typeTone('exchange')).toBe('plum');
    expect(typeTone('volunteering')).toBe('plum');
    expect(typeTone('research_program')).toBe('espresso');
    expect(typeTone('fellowship')).toBe('espresso');
    expect(typeTone('competition')).toBe('berry');
    expect(typeTone('conference')).toBe('berry');
  });
});
