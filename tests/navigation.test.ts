import { describe, expect, it } from 'vitest';

import { isActivePath } from '@/lib/navigation';

describe('isActivePath', () => {
  it('matches the exact route', () => {
    expect(isActivePath('/explore', '/explore')).toBe(true);
  });

  it('matches child routes', () => {
    expect(isActivePath('/explore/internships', '/explore')).toBe(true);
    expect(isActivePath('/opportunities/erasmus-2027', '/opportunities')).toBe(true);
  });

  it('does not match routes that only share a prefix', () => {
    expect(isActivePath('/explorex', '/explore')).toBe(false);
    expect(isActivePath('/saved-items', '/saved')).toBe(false);
  });

  it('only treats the home link as active on the root path', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('', '/')).toBe(true);
    expect(isActivePath('/explore', '/')).toBe(false);
  });

  it('treats the root link as inactive on child routes', () => {
    expect(isActivePath('/for-you', '/')).toBe(false);
  });
});
