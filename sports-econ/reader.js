const storageKey = "sports-economics-reader-theme";
const buttons = [...document.querySelectorAll("button[data-reader-theme]")];
const validThemes = new Set(buttons.map((button) => button.dataset.readerTheme));

function setReaderTheme(theme) {
  const nextTheme = validThemes.has(theme) ? theme : "classic";
  document.documentElement.dataset.readerTheme = nextTheme;
  buttons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.readerTheme === nextTheme)
    );
  });
  window.localStorage.setItem(storageKey, nextTheme);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    setReaderTheme(button.dataset.readerTheme);
  });
});

setReaderTheme(window.localStorage.getItem(storageKey) || "classic");
