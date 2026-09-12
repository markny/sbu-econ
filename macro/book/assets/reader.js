(() => {
  const buttons = [...document.querySelectorAll('button[data-theme]')];
  const themes = new Set(buttons.map(button => button.dataset.theme));
  const key = 'macro-reader-theme';
  function setTheme(value) {
    const theme = themes.has(value) ? value : 'classic';
    document.documentElement.dataset.theme = theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
    try { localStorage.setItem(key, theme); } catch { /* Reading also works without storage. */ }
  }
  let saved = 'classic';
  try { saved = localStorage.getItem(key) || saved; } catch { /* Use the default. */ }
  setTheme(saved);
  buttons.forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
})();
