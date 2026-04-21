/**
 * dependency-cruiser configuration.
 * Enforces the three rule families required by ADR-0007:
 *   1. core-cannot-import-adapters  (architectural invariant)
 *   2. no-circular                  (maintainability guard on core)
 *   3. no-orphans                   (catch disconnected modules)
 */
module.exports = {
  forbidden: [
    {
      name: 'core-cannot-import-adapters',
      severity: 'error',
      comment: 'DESIGN constraint #2 — ports-and-adapters: core depends on nothing adapter-shaped.',
      from: { path: '^src/core/' },
      to: { path: '^src/adapters/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Cycles in the core degrade reasoning; reject outright.',
      from: { path: '^src/core/' },
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment:
        'Modules disconnected from the graph are dead code or a wiring bug. ' +
        'bootstrap.ts is the composition root (loaded by index.html) so it is exempt.',
      from: {
        orphan: true,
        pathNot:
          '(^|/)\\.(eslintrc|prettierrc)|\\.d\\.ts$|(^|/)(vite|vitest|playwright)\\.config\\.ts$|^src/adapters/bootstrap\\.ts$',
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['main', 'types'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
