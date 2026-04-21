/**
 * Scaffold smoke test so the `unit-and-property` gate has something to run
 * on an empty project. Replaced with real core tests starting at step 01-02.
 */
import { describe, it, expect } from 'vitest';

describe('scaffold', () => {
  it('has a working test runner', () => {
    expect(1 + 1).toBe(2);
  });
});
