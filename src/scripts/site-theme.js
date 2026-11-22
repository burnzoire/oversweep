(() => {
  if (!CSS.supports('color', 'light-dark(white, black)')) return;

  const key = 'oversweep:theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  /** @type {HTMLButtonElement | null} */
  let button = null;

  const currentTheme = () => root.dataset.theme ?? (system.matches ? 'dark' : 'light');
  const updateButton = () => {
    if (!button) return;
    const theme = currentTheme();
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    button.dataset.currentTheme = theme;
    button.setAttribute('aria-label', label);
    button.title = label;
  };

  /** @param {string | null} choice */
  const apply = (choice) => {
    if (choice === 'light' || choice === 'dark') root.dataset.theme = choice;
    else delete root.dataset.theme;
    updateButton();
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
    // A restored page may have missed a preference change in another tab.
    if (event.persisted || performance.getEntriesByType('navigation').some(
      (entry) => /** @type {PerformanceNavigationTiming} */ (entry).type === 'back_forward',
    )) requestAnimationFrame(restore);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) restore();
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('[data-theme-preference]');
    if (!button) return;
    updateButton();
    button.hidden = false;
    system.addEventListener('change', updateButton);
    button.addEventListener('click', () => {
      const choice = currentTheme() === 'dark' ? 'light' : 'dark';
      apply(choice);
      try {
        localStorage.setItem(key, choice);
      } catch {
        // Keep the choice in this document when it cannot be saved.
      }
    });
  });
})();
