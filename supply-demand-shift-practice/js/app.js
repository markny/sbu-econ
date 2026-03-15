import { createOneEventProblem, createTwoEventProblem } from "./scenarios.js";
import { compareAnswers, solveOneEvent, solveTwoEvent } from "./economics.js";
import { getOneEventDiagram, getTwoEventDiagrams } from "./diagrams.js";

const appState = {
  problem: null,
  solution: null
};

const elements = {
  modeSelect: document.getElementById("modeSelect"),
  newProblemBtn: document.getElementById("newProblemBtn"),
  showAnswerBtn: document.getElementById("showAnswerBtn"),
  studyToggleBtn: document.getElementById("studyToggleBtn"),
  resetBtn: document.getElementById("resetBtn"),
  studyPanel: document.getElementById("studyPanel"),
  problemLead: document.getElementById("problemLead"),
  scenarioPanel: document.getElementById("scenarioPanel"),
  inputsContainer: document.getElementById("inputsContainer"),
  answerForm: document.getElementById("answerForm"),
  feedbackPanel: document.getElementById("feedbackPanel"),
  answerSection: document.getElementById("answerSection"),
  answerContent: document.getElementById("answerContent"),
  diagramArea: document.getElementById("diagramArea")
};

const LABELS = {
  curve: "Which curve shifts?",
  shift: "Which direction does it shift?",
  price: "What happens to equilibrium price?",
  quantity: "What happens to equilibrium quantity?",
  combinedPrice: "Combined effect: equilibrium price",
  combinedQuantity: "Combined effect: equilibrium quantity"
};

const OPTIONS = {
  curve: [
    { value: "", label: "Select an answer" },
    { value: "demand", label: "Demand" },
    { value: "supply", label: "Supply" }
  ],
  shift: [
    { value: "", label: "Select an answer" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" }
  ],
  outcome: [
    { value: "", label: "Select an answer" },
    { value: "increase", label: "Increase" },
    { value: "decrease", label: "Decrease" },
    { value: "ambiguous", label: "Ambiguous" }
  ]
};

function getCurrentMode() {
  return elements.modeSelect.value;
}

function createSelectBlock(name, optionSet) {
  const wrapper = document.createElement("div");
  wrapper.className = "select-block";

  const label = document.createElement("label");
  label.htmlFor = name;
  label.textContent = LABELS[name];

  const select = document.createElement("select");
  select.id = name;
  select.name = name;

  const options =
    optionSet === "curve" ? OPTIONS.curve : optionSet === "shift" ? OPTIONS.shift : OPTIONS.outcome;

  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.append(option);
  });

  wrapper.append(label, select);
  return wrapper;
}

function renderInputs(mode) {
  elements.inputsContainer.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "prompt-grid";

  if (mode === "one") {
    grid.append(
      createSelectBlock("curve", "curve"),
      createSelectBlock("shift", "shift"),
      createSelectBlock("price", "outcome"),
      createSelectBlock("quantity", "outcome")
    );
  } else {
    grid.append(
      createSelectBlock("combinedPrice", "outcome"),
      createSelectBlock("combinedQuantity", "outcome")
    );
  }

  elements.inputsContainer.append(grid);
}

function renderScenario(problem) {
  elements.scenarioPanel.innerHTML = "";
  elements.scenarioPanel.classList.remove("empty");

  if (problem.mode === "one") {
    elements.problemLead.textContent = `Market: ${problem.market}. Analyze the event and predict the new equilibrium.`;

    const card = document.createElement("article");
    card.className = "event-card";
    card.innerHTML = `
      <p class="event-kicker">Single Market Event</p>
      <p>${problem.event.prompt}</p>
      <p class="subtle">Decide whether this changes demand or supply, which way the curve shifts, and what happens to equilibrium price and quantity.</p>
    `;
    elements.scenarioPanel.append(card);
    return;
  }

  elements.problemLead.textContent = `Market: ${problem.market}. Analyze each event separately first, then combine them.`;

  const list = document.createElement("div");
  list.className = "event-list";
  list.innerHTML = `
    <article class="event-card">
      <p class="event-kicker">Demand-Side Event</p>
      <p>${problem.demandEvent.prompt}</p>
    </article>
    <article class="event-card">
      <p class="event-kicker">Supply-Side Event</p>
      <p>${problem.supplyEvent.prompt}</p>
    </article>
    <div class="prompt-callout callout">
      <strong>How to think about it:</strong>
      <span>Look at the demand diagram and the supply diagram separately, then combine the directional effects on price and quantity.</span>
    </div>
  `;
  elements.scenarioPanel.append(list);
}

function prettyValue(value) {
  if (value === "increase") {
    return "Increase";
  }

  if (value === "decrease") {
    return "Decrease";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderFeedback(result) {
  elements.feedbackPanel.className = `feedback-panel ${result.status}`;
  elements.feedbackPanel.classList.remove("hidden");

  const listMarkup = result.details
    .filter((item) => !item.correct)
    .map(
      (item) =>
        `<li><strong>${LABELS[item.key]}:</strong> correct answer is ${prettyValue(item.expected)}.</li>`
    )
    .join("");

  elements.feedbackPanel.innerHTML = `
    <div><strong>${result.summary}</strong></div>
    ${
      listMarkup
        ? `<ul class="feedback-list">${listMarkup}</ul>`
        : `<p>Nice work. Your predictions line up with the model.</p>`
    }
  `;
}

function renderOneEventAnswer(problem, solution) {
  const diagram = getOneEventDiagram(solution.diagramKey);
  elements.answerContent.innerHTML = `
    <div class="tag-row">
      <span class="tag">Curve: ${prettyValue(solution.correctAnswers.curve)}</span>
      <span class="tag">Shift: ${prettyValue(solution.correctAnswers.shift)}</span>
      <span class="tag">Price: ${prettyValue(solution.correctAnswers.price)}</span>
      <span class="tag">Quantity: ${prettyValue(solution.correctAnswers.quantity)}</span>
    </div>
    <div class="answer-item">
      <strong>Correct reasoning</strong>
      <p>${solution.explanation[0]}</p>
      <p>${solution.explanation[1]}</p>
      <p>${solution.explanation[2]}</p>
      <p>${solution.explanation[3]}</p>
    </div>
    <p class="callout">Diagram match: ${diagram.description}</p>
  `;
}

function renderTwoEventAnswer(problem, solution) {
  elements.answerContent.innerHTML = `
    <div class="analysis-grid">
      <div class="analysis-block">
        <strong>Demand event by itself</strong>
        <p>${problem.demandEvent.prompt}</p>
        <p>Event 1 affects demand and shifts it ${problem.demandEvent.shiftDirection}.</p>
        <p>By itself, that means price ${solution.demandOnly.price}s and quantity ${solution.demandOnly.quantity}s.</p>
        <p>${problem.demandEvent.explanation}</p>
      </div>
      <div class="analysis-block">
        <strong>Supply event by itself</strong>
        <p>${problem.supplyEvent.prompt}</p>
        <p>Event 2 affects supply and shifts it ${problem.supplyEvent.shiftDirection}.</p>
        <p>By itself, that means price ${solution.supplyOnly.price}s and quantity ${solution.supplyOnly.quantity}s.</p>
        <p>${problem.supplyEvent.explanation}</p>
      </div>
      <div class="analysis-block">
        <strong>Combined effect</strong>
        <p>Equilibrium price: <strong>${prettyValue(solution.correctAnswers.combinedPrice)}</strong></p>
        <p>Equilibrium quantity: <strong>${prettyValue(solution.correctAnswers.combinedQuantity)}</strong></p>
        <p>${solution.combined.rule}</p>
      </div>
    </div>
    <div class="answer-item">
      <strong>Two-event reminder</strong>
      <p>${solution.reminders[0]}</p>
      <p>${solution.reminders[1]}</p>
      <p>${solution.reminders[2]}</p>
    </div>
  `;
}

function renderDiagrams(problem, solution) {
  elements.diagramArea.innerHTML = "";
  elements.diagramArea.classList.remove("empty");

  const diagrams =
    problem.mode === "one" ? [getOneEventDiagram(solution.diagramKey)] : getTwoEventDiagrams(problem);

  diagrams.forEach((diagram, index) => {
    const card = document.createElement("article");
    card.className = "diagram-card";
    const heading =
      problem.mode === "one"
        ? diagram.title
        : index === 0
          ? "Demand Event"
          : "Supply Event";

    card.innerHTML = `
      <div class="diagram-copy">
        <p class="diagram-title">${heading}</p>
        <p>${diagram.description}</p>
      </div>
      <img src="${diagram.src}" alt="${diagram.title}" />
    `;
    elements.diagramArea.append(card);
  });
}

function showAnswer() {
  if (!appState.problem || !appState.solution) {
    return;
  }

  if (appState.problem.mode === "one") {
    renderOneEventAnswer(appState.problem, appState.solution);
  } else {
    renderTwoEventAnswer(appState.problem, appState.solution);
  }

  renderDiagrams(appState.problem, appState.solution);
  elements.answerSection.classList.remove("hidden");
}

function collectAnswers() {
  const formData = new FormData(elements.answerForm);
  return Object.fromEntries(formData.entries());
}

function generateProblem() {
  const mode = getCurrentMode();
  appState.problem = mode === "one" ? createOneEventProblem() : createTwoEventProblem();
  appState.solution = mode === "one" ? solveOneEvent(appState.problem) : solveTwoEvent(appState.problem);

  renderInputs(mode);
  renderScenario(appState.problem);
  elements.answerSection.classList.add("hidden");
  elements.answerContent.innerHTML = "";
  elements.feedbackPanel.className = "feedback-panel hidden";
  elements.feedbackPanel.innerHTML = "";
  renderDiagrams(appState.problem, appState.solution);
}

function resetApp() {
  appState.problem = null;
  appState.solution = null;
  renderInputs(getCurrentMode());
  elements.problemLead.textContent = "Choose a mode and generate a practice problem.";
  elements.scenarioPanel.className = "scenario-panel empty";
  elements.scenarioPanel.innerHTML = '<p class="placeholder">Your scenario will appear here.</p>';
  elements.feedbackPanel.className = "feedback-panel hidden";
  elements.feedbackPanel.innerHTML = "";
  elements.answerSection.classList.add("hidden");
  elements.answerContent.innerHTML = "";
  elements.diagramArea.className = "diagram-grid empty";
  elements.diagramArea.innerHTML =
    '<p class="placeholder">The matching diagram will appear here after you generate a problem.</p>';
}

function toggleStudyPanel() {
  elements.studyPanel.classList.toggle("hidden");
}

elements.modeSelect.addEventListener("change", () => {
  resetApp();
});

elements.newProblemBtn.addEventListener("click", generateProblem);
elements.showAnswerBtn.addEventListener("click", showAnswer);
elements.studyToggleBtn.addEventListener("click", toggleStudyPanel);
elements.resetBtn.addEventListener("click", resetApp);

elements.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!appState.solution) {
    return;
  }

  const result = compareAnswers(appState.solution.correctAnswers, collectAnswers());
  renderFeedback(result);
});

renderInputs(getCurrentMode());
