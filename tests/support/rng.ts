/**
 * Deterministic RNG stubs for vitest specs that exercise AI or reducer code
 * whose default path uses Math.random.
 */

/**
 * Mulberry32 — tiny deterministic PRNG. Same (seed) always yields the same
 * infinite stream of numbers in [0, 1). Suitable for both unit-level
 * determinism checks and property-style sweeps across seeds.
 */
export const seededRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Constant-valued RNG. Useful for asserting a specific branch of a fallback. */
export const fixedRng =
  (value: number): (() => number) =>
  () =>
    value;
