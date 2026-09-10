// A URL-only entry point keeps the Micro default unchanged, even on a device
// previously used for Sports Economics. Return destinations are allowlisted.
export function applyCourseContext(search, document) {
  if (new URLSearchParams(search).get("course") !== "sports-econ") return;

  const backLink = document.getElementById("courseBackLink");
  backLink.href = "../sports-econ/";
  backLink.textContent = "Back to Sports Economics";

  const note = document.getElementById("courseNote");
  note.textContent = "Sports Economics · Chapter 2 practice. These familiar markets use the competitive supply-and-demand model. Identify the changed determinant, shift the curve left or right, and predict equilibrium price and quantity. Start with One Event, then try Two Events. No calculations are required.";
  note.hidden = false;
}
