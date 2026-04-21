/**
 * Composition root. Wires input -> dispatch -> reduce -> render -> announce.
 * Intentionally empty in step 01-01: this is the scaffold stub that mounts
 * an empty #app div so the shell boots without error. Behaviour arrives
 * in subsequent steps via the Outside-In TDD loop.
 */
const mount = (): void => {
  const app = document.querySelector<HTMLElement>('#app');
  if (app === null) {
    // Don't throw across the adapter boundary; log and exit quietly.
    console.error('bootstrap: #app not found');
    return;
  }
  app.replaceChildren();
};

mount();
