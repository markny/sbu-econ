const themeLink = document.querySelector("#theme-stylesheet");
const themeButtons = [...document.querySelectorAll("[data-theme]")];
const mobileMenu = document.querySelector(".mobile-reader-menu");
const validThemes = new Set(themeButtons.map((button) => button.dataset.theme));
const storageKey = "law-econ-reader-theme";

function storedTheme() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function rememberTheme(theme) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // The selected style still applies when browser storage is unavailable.
  }
}

function setTheme(theme) {
  if (!themeLink || themeButtons.length === 0) return;

  const nextTheme = validThemes.has(theme) ? theme : "classic";
  document.documentElement.dataset.theme = nextTheme;
  themeLink.href = `../../assets/themes/${nextTheme}.css`;
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === nextTheme));
  });
  rememberTheme(nextTheme);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => mobileMenu.removeAttribute("open"));
});

setTheme(storedTheme() || "classic");
