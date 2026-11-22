(() => {
  if (!CSS.supports('color', 'light-dark(white, black)')) return;

  const key = 'oversweep:theme';
  const root = document.documentElement;
  /** @type {HTMLSelectElement | null} */
  let select = null;

  /** @param {string | null} choice */
  const apply = (choice) => {
    if (choice === 'light' || choice === 'dark') root.dataset.theme = choice;
    else delete root.dataset.theme;
    if (select) select.value = root.dataset.theme ?? 'system';
  };

  const restore = () => {
    try {
      apply(localStorage.getItem(key));
    } catch {
      // Use the system palette when storage is unavailable.
    }
  };

  restore();
  window.addEventListener('pageshow', (event) => {
    // History traversal can restore form values after the document loads.
    if (event.persisted || performance.getEntriesByType('navigation').some(
      (entry) => /** @type {PerformanceNavigationTiming} */ (entry).type === 'back_forward',
    )) requestAnimationFrame(restore);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) restore();
  });

  document.addEventListener('DOMContentLoaded', () => {
    select = document.querySelector('[data-theme-preference]');
    if (!select) return;
    select.value = root.dataset.theme ?? 'system';
    select.hidden = false;
    select.addEventListener('change', (event) => {
      const choice = /** @type {HTMLSelectElement} */ (event.currentTarget).value;
      apply(choice);
      try {
        if (choice === 'system') localStorage.removeItem(key);
        else localStorage.setItem(key, choice);
      } catch {
        // Keep the choice in this document when it cannot be saved.
      }
    });
  });
})();
