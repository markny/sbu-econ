const themeLink = document.querySelector("#theme-stylesheet");
const themeButtons = [...document.querySelectorAll("[data-theme]")];
const validThemes = new Set(themeButtons.map((button) => button.dataset.theme));

function setTheme(theme) {
  const nextTheme = validThemes.has(theme) ? theme : "classic";

  document.documentElement.dataset.theme = nextTheme;
  themeLink.href = `themes/${nextTheme}.css`;
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === nextTheme));
  });
  window.localStorage.setItem("micro-style-lab-theme", nextTheme);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});

setTheme(window.localStorage.getItem("micro-style-lab-theme") || "classic");
