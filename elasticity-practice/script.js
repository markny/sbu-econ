const MODES = {
  demand: {
    title: "Price Elasticity of Demand",
    formulaLabel: "Price elasticity of demand",
    formula: "epsilon_d = %Delta Qd / %Delta P",
    note: "Demand elasticity is usually negative because price and quantity demanded move in opposite directions.",
    summary: "Change any two values and solve for the third. For demand, the sign matters for direction, and the absolute value matters for elastic/unit/inelastic classification.",
    driverLabel: "%Delta P",
    responseLabel: "%Delta Qd",
    elasticityLabel: "epsilon_d",
    responseName: "quantity demanded",
    defaultPrice: 10,
    defaultQuantity: -15,
    defaultElasticity: -1.5
  },
  supply: {
    title: "Price Elasticity of Supply",
    formulaLabel: "Price elasticity of supply",
    formula: "epsilon_s = %Delta Qs / %Delta P",
    note: "Supply elasticity is positive when price and quantity supplied move in the same direction. Longer runs are usually more elastic because sellers have more time to adjust.",
    summary: "Focus on responsiveness: in the short run firms may be less flexible, while in the long run entry, exit, and capacity changes can make supply more elastic.",
    driverLabel: "%Delta P",
    responseLabel: "%Delta Qs",
    elasticityLabel: "epsilon_s",
    responseName: "quantity supplied",
    defaultPrice: 10,
    defaultQuantity: 8,
    defaultElasticity: 0.8
  },
  income: {
    title: "Income Elasticity",
    formulaLabel: "Income elasticity",
    formula: "epsilon_I = %Delta Qd / %Delta I",
    note: "Positive income elasticity means a normal good; negative income elasticity means an inferior good.",
    summary: "Use the sign of epsilon_I to classify normal and inferior goods. The size tells how responsive quantity demanded is to income changes.",
    driverLabel: "%Delta I",
    responseLabel: "%Delta Qd",
    elasticityLabel: "epsilon_I",
    responseName: "quantity demanded",
    defaultPrice: 10,
    defaultQuantity: 12,
    defaultElasticity: 1.2
  },
  cross: {
    title: "Cross-Price Elasticity",
    formulaLabel: "Cross-price elasticity",
    formula: "epsilon_xy = %Delta Qx / %Delta Py",
    note: "Positive cross-price elasticity suggests substitutes; negative cross-price elasticity suggests complements.",
    summary: "Use the sign of epsilon_xy to classify substitutes and complements. The size tells how closely related the goods are.",
    driverLabel: "%Delta Py",
    responseLabel: "%Delta Qx",
    elasticityLabel: "epsilon_xy",
    responseName: "quantity demanded of good x",
    defaultPrice: 10,
    defaultQuantity: 6,
    defaultElasticity: 0.6
  }
};

const PRACTICE = [
  {
    mode: "demand",
    prompt: "A 10% price increase causes quantity demanded to fall by 20%. What is epsilon_d?",
    answer: -2,
    explanation: "epsilon_d = -20 / 10 = -2. Demand is elastic because |epsilon_d| is greater than 1."
  },
  {
    mode: "demand",
    prompt: "epsilon_d is -0.5 and price rises by 8%. What is the predicted %Delta Qd?",
    answer: -4,
    explanation: "%Delta Qd = epsilon_d x %Delta P = -0.5 x 8 = -4%."
  },
  {
    mode: "supply",
    prompt: "A 12% price increase causes quantity supplied to rise by 18%. What is epsilon_s?",
    answer: 1.5,
    explanation: "epsilon_s = 18 / 12 = 1.5. Supply is elastic."
  },
  {
    mode: "income",
    prompt: "Income rises by 10% and quantity demanded falls by 5%. What is epsilon_I?",
    answer: -0.5,
    explanation: "epsilon_I = -5 / 10 = -0.5, so the good is inferior."
  },
  {
    mode: "cross",
    prompt: "The price of good y rises by 10%, and demand for good x rises by 15%. What is epsilon_xy?",
    answer: 1.5,
    explanation: "epsilon_xy = 15 / 10 = 1.5, so the goods are substitutes."
  },
  {
    mode: "cross",
    prompt: "The price of good y rises by 20%, and demand for good x falls by 10%. What is epsilon_xy?",
    answer: -0.5,
    explanation: "epsilon_xy = -10 / 20 = -0.5, so the goods are complements."
  }
];

const state = {
  mode: "demand",
  practiceIndex: 0
};

const el = {
  tabs: document.querySelectorAll(".tab"),
  formulaLabel: document.getElementById("formulaLabel"),
  formulaText: document.getElementById("formulaText"),
  formulaNote: document.getElementById("formulaNote"),
  modeTitle: document.getElementById("modeTitle"),
  modeSummary: document.getElementById("modeSummary"),
  solveFor: document.getElementById("solveFor"),
  solveOptions: document.querySelectorAll("#solveFor option"),
  priceLabel: document.getElementById("priceLabel"),
  quantityLabel: document.getElementById("quantityLabel"),
  elasticityLabel: document.getElementById("elasticityLabel"),
  priceChange: document.getElementById("priceChange"),
  quantityChange: document.getElementById("quantityChange"),
  elasticityValue: document.getElementById("elasticityValue"),
  priceSlider: document.getElementById("priceSlider"),
  quantitySlider: document.getElementById("quantitySlider"),
  elasticitySlider: document.getElementById("elasticitySlider"),
  priceGroup: document.getElementById("priceGroup"),
  quantityGroup: document.getElementById("quantityGroup"),
  elasticityGroup: document.getElementById("elasticityGroup"),
  resultLead: document.getElementById("resultLead"),
  elasticityMetric: document.getElementById("elasticityMetric"),
  classificationMetric: document.getElementById("classificationMetric"),
  driverBarLabel: document.getElementById("driverBarLabel"),
  responseBarLabel: document.getElementById("responseBarLabel"),
  driverBarValue: document.getElementById("driverBarValue"),
  responseBarValue: document.getElementById("responseBarValue"),
  driverBar: document.getElementById("driverBar"),
  responseBar: document.getElementById("responseBar"),
  interpretationText: document.getElementById("interpretationText"),
  revenuePanel: document.getElementById("revenuePanel"),
  revenueText: document.getElementById("revenueText"),
  shortcutToggle: document.getElementById("shortcutToggle"),
  shortcutPanel: document.getElementById("shortcutPanel"),
  shortcutValue: document.getElementById("shortcutValue"),
  practicePrompt: document.getElementById("practicePrompt"),
  practiceAnswer: document.getElementById("practiceAnswer"),
  checkPractice: document.getElementById("checkPractice"),
  newPractice: document.getElementById("newPractice"),
  practiceFeedback: document.getElementById("practiceFeedback")
};

function numberFrom(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : 0;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function formatPercent(value) {
  const rounded = roundOne(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

function formatElasticity(value) {
  return Number.isFinite(value) ? value.toFixed(2).replace(/0$/, "").replace(/\.0$/, "") : "undefined";
}

function classifyElasticity(value, mode) {
  if (!Number.isFinite(value)) {
    return "Undefined";
  }

  if (mode === "income") {
    if (value > 0) return "Normal good";
    if (value < 0) return "Inferior good";
    return "Income neutral";
  }

  if (mode === "cross") {
    if (value > 0) return "Substitutes";
    if (value < 0) return "Complements";
    return "Unrelated";
  }

  const magnitude = Math.abs(value);
  if (Math.abs(magnitude - 1) < 0.05) return "Unit elastic";
  if (magnitude > 1) return "Elastic";
  return "Inelastic";
}

function setSolvedStyles() {
  const solved = el.solveFor.value;
  el.priceGroup.classList.toggle("is-solved", solved === "price");
  el.quantityGroup.classList.toggle("is-solved", solved === "quantity");
  el.elasticityGroup.classList.toggle("is-solved", solved === "elasticity");
}

function syncPair(input, slider, source) {
  if (source === input) {
    slider.value = input.value;
  } else {
    input.value = slider.value;
  }
}

function solveValues() {
  const solved = el.solveFor.value;
  let driver = numberFrom(el.priceChange);
  let response = numberFrom(el.quantityChange);
  let elasticity = numberFrom(el.elasticityValue);

  if (solved === "quantity") {
    response = roundOne(driver * elasticity);
    el.quantityChange.value = response;
    el.quantitySlider.value = Math.max(-60, Math.min(60, response));
  }

  if (solved === "elasticity") {
    elasticity = driver === 0 ? Number.NaN : response / driver;
    el.elasticityValue.value = Number.isFinite(elasticity) ? roundOne(elasticity) : "";
    el.elasticitySlider.value = Number.isFinite(elasticity) ? Math.max(-4, Math.min(4, elasticity)) : 0;
  }

  if (solved === "price") {
    driver = elasticity === 0 ? Number.NaN : response / elasticity;
    el.priceChange.value = Number.isFinite(driver) ? roundOne(driver) : "";
    el.priceSlider.value = Number.isFinite(driver) ? Math.max(-40, Math.min(40, driver)) : 0;
  }

  return { driver, response, elasticity };
}

function setBar(bar, value) {
  const width = Math.min(50, Math.abs(value) * 1.2);
  bar.style.width = `${width}%`;
  if (value >= 0) {
    bar.style.left = "50%";
    bar.style.right = "auto";
  } else {
    bar.style.left = "auto";
    bar.style.right = "50%";
  }
}

function revenueDirection(price, quantity) {
  const approx = price + quantity;
  if (Math.abs(approx) < 0.5) {
    return "Revenue is roughly unchanged because the price and quantity changes offset each other.";
  }
  if (approx > 0) {
    return "Revenue rises because the positive percent change is larger in this approximation.";
  }
  return "Revenue falls because the negative percent change is larger in this approximation.";
}

function interpretation(mode, driver, response, elasticity) {
  const config = MODES[mode];
  const base = `A ${formatPercent(driver)} change in ${config.driverLabel.replace("%Delta ", "")} predicts a ${formatPercent(response)} change in ${config.responseName}.`;
  const classification = classifyElasticity(elasticity, mode);

  if (mode === "demand" || mode === "supply") {
    return `${base} Since |${config.elasticityLabel}| is ${Math.abs(elasticity).toFixed(2)}, this is ${classification.toLowerCase()}.`;
  }

  if (mode === "income") {
    return `${base} Since ${config.elasticityLabel} is ${elasticity > 0 ? "positive" : elasticity < 0 ? "negative" : "zero"}, the good is classified as ${classification.toLowerCase()}.`;
  }

  return `${base} Since ${config.elasticityLabel} is ${elasticity > 0 ? "positive" : elasticity < 0 ? "negative" : "zero"}, the goods are classified as ${classification.toLowerCase()}.`;
}

function render() {
  const config = MODES[state.mode];
  const values = solveValues();
  const classification = classifyElasticity(values.elasticity, state.mode);

  el.modeTitle.textContent = config.title;
  el.modeSummary.textContent = config.summary;
  el.formulaLabel.textContent = config.formulaLabel;
  el.formulaText.textContent = config.formula;
  el.formulaNote.textContent = config.note;
  el.solveOptions.forEach((option) => {
    if (option.value === "price") option.textContent = config.driverLabel;
    if (option.value === "quantity") option.textContent = config.responseLabel;
    if (option.value === "elasticity") option.textContent = config.elasticityLabel;
  });
  el.priceLabel.textContent = config.driverLabel;
  el.quantityLabel.textContent = config.responseLabel;
  el.elasticityLabel.textContent = config.elasticityLabel;
  el.driverBarLabel.textContent = config.driverLabel.replace("%Delta ", "");
  el.responseBarLabel.textContent = config.responseName;
  el.driverBarValue.textContent = formatPercent(values.driver);
  el.responseBarValue.textContent = formatPercent(values.response);
  el.resultLead.textContent = `Predicted ${config.responseName} changes by ${formatPercent(values.response)}.`;
  el.elasticityMetric.textContent = `${config.elasticityLabel} = ${formatElasticity(values.elasticity)}`;
  el.classificationMetric.textContent = classification;
  el.interpretationText.textContent = interpretation(state.mode, values.driver, values.response, values.elasticity);

  setBar(el.driverBar, values.driver);
  setBar(el.responseBar, values.response);
  setSolvedStyles();

  const isDemand = state.mode === "demand";
  el.revenuePanel.classList.toggle("hidden", !isDemand);
  el.shortcutPanel.classList.toggle("hidden", !isDemand || el.shortcutPanel.dataset.open !== "true");
  if (isDemand) {
    el.revenueText.textContent = revenueDirection(values.driver, values.response);
    el.shortcutValue.textContent = formatPercent(values.driver + values.response);
  }
}

function setMode(mode) {
  state.mode = mode;
  const config = MODES[mode];
  el.priceChange.value = config.defaultPrice;
  el.priceSlider.value = config.defaultPrice;
  el.quantityChange.value = config.defaultQuantity;
  el.quantitySlider.value = config.defaultQuantity;
  el.elasticityValue.value = config.defaultElasticity;
  el.elasticitySlider.value = config.defaultElasticity;
  el.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.mode === mode));
  choosePracticeForMode(mode);
  render();
}

function choosePracticeForMode(mode) {
  const indexes = PRACTICE.map((item, index) => ({ item, index })).filter(({ item }) => item.mode === mode);
  const selected = indexes[Math.floor(Math.random() * indexes.length)] || { index: 0 };
  state.practiceIndex = selected.index;
  el.practicePrompt.textContent = PRACTICE[state.practiceIndex].prompt;
  el.practiceAnswer.value = "";
  el.practiceFeedback.className = "feedback hidden";
  el.practiceFeedback.textContent = "";
}

function checkPracticeAnswer() {
  const current = PRACTICE[state.practiceIndex];
  const answer = Number(el.practiceAnswer.value);
  const correct = Number.isFinite(answer) && Math.abs(answer - current.answer) <= 0.05;
  el.practiceFeedback.className = `feedback ${correct ? "correct" : "incorrect"}`;
  el.practiceFeedback.textContent = correct
    ? `Correct. ${current.explanation}`
    : `Not quite. ${current.explanation}`;
}

el.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

[
  [el.priceChange, el.priceSlider],
  [el.quantityChange, el.quantitySlider],
  [el.elasticityValue, el.elasticitySlider]
].forEach(([input, slider]) => {
  input.addEventListener("input", () => {
    syncPair(input, slider, input);
    render();
  });
  slider.addEventListener("input", () => {
    syncPair(input, slider, slider);
    render();
  });
});

el.solveFor.addEventListener("change", render);
el.shortcutToggle.addEventListener("click", () => {
  const isOpen = el.shortcutPanel.dataset.open === "true";
  el.shortcutPanel.dataset.open = isOpen ? "false" : "true";
  el.shortcutToggle.textContent = isOpen ? "Show TR shortcut" : "Hide TR shortcut";
  render();
});
el.checkPractice.addEventListener("click", checkPracticeAnswer);
el.newPractice.addEventListener("click", () => choosePracticeForMode(state.mode));

setMode("demand");
