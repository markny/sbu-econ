const MODES = {
  demand: {
    title: "Price Elasticity of Demand",
    formulaLabel: "Price elasticity of demand",
    formula: "εd = %ΔQd / %ΔP",
    note: "Demand elasticity is negative because price and quantity demanded move in opposite directions. An own-price change causes movement along the demand curve, not a shift of demand.",
    summary: "Change any two values and solve for the third. For demand, the sign matters for direction, and the absolute value matters for elastic, unit elastic, or inelastic classification.",
    driverLabel: "%ΔP",
    responseLabel: "%ΔQd",
    elasticityLabel: "εd",
    driverName: "price",
    responseName: "quantity demanded",
    defaultPrice: 10,
    defaultQuantity: -15,
    defaultElasticity: -1.5
  },
  supply: {
    title: "Price Elasticity of Supply",
    formulaLabel: "Price elasticity of supply",
    formula: "εs = %ΔQs / %ΔP",
    note: "Supply elasticity is positive when price and quantity supplied move in the same direction. An own-price change causes movement along the supply curve, not a shift of supply. Longer runs are usually more elastic because sellers have more time to adjust.",
    summary: "Focus on responsiveness: in the short run firms may be less flexible, while in the long run entry, exit, and capacity changes can make supply more elastic.",
    driverLabel: "%ΔP",
    responseLabel: "%ΔQs",
    elasticityLabel: "εs",
    driverName: "price",
    responseName: "quantity supplied",
    defaultPrice: 10,
    defaultQuantity: 8,
    defaultElasticity: 0.8
  },
  income: {
    title: "Income Elasticity",
    formulaLabel: "Income elasticity",
    formula: "εI = %ΔQd / %ΔI",
    note: "Positive income elasticity means a normal good; negative income elasticity means an inferior good. An income change shifts demand rather than causing movement along a demand curve.",
    summary: "Use the sign of εI to classify normal and inferior goods. The size tells how responsive quantity demanded is to income changes.",
    driverLabel: "%ΔI",
    responseLabel: "%ΔQd",
    elasticityLabel: "εI",
    driverName: "income",
    responseName: "quantity demanded",
    defaultPrice: 10,
    defaultQuantity: 12,
    defaultElasticity: 1.2
  },
  cross: {
    title: "Cross-Price Elasticity",
    formulaLabel: "Cross-price elasticity",
    formula: "εxy = %ΔQx / %ΔPy",
    note: "Positive cross-price elasticity suggests substitutes; negative cross-price elasticity suggests complements. A change in the price of good y shifts demand for good x.",
    summary: "Use the sign of εxy to classify substitutes and complements. The size tells how closely related the goods are.",
    driverLabel: "%ΔPy",
    responseLabel: "%ΔQx",
    elasticityLabel: "εxy",
    driverName: "the price of good y",
    responseName: "quantity demanded of good x",
    defaultPrice: 10,
    defaultQuantity: 6,
    defaultElasticity: 0.6
  }
};

const PRACTICE = [
  {
    mode: "demand",
    prompt: "A 10% price increase causes quantity demanded to fall by 20%. What is εd?",
    answer: -2,
    explanation: "εd = -20 / 10 = -2. Demand is elastic because |εd| is greater than 1."
  },
  {
    mode: "demand",
    prompt: "εd is -0.5 and price rises by 8%. What is the predicted %ΔQd?",
    answer: -4,
    explanation: "%ΔQd = εd × %ΔP = -0.5 × 8 = -4%."
  },
  {
    mode: "supply",
    prompt: "A 12% price increase causes quantity supplied to rise by 18%. What is εs?",
    answer: 1.5,
    explanation: "εs = 18 / 12 = 1.5. Supply is elastic."
  },
  {
    mode: "income",
    prompt: "Income rises by 10% and quantity demanded falls by 5%. What is εI?",
    answer: -0.5,
    explanation: "εI = -5 / 10 = -0.5, so the good is inferior."
  },
  {
    mode: "cross",
    prompt: "The price of good y rises by 10%, and demand for good x rises by 15%. What is εxy?",
    answer: 1.5,
    explanation: "εxy = 15 / 10 = 1.5, so the goods are substitutes."
  },
  {
    mode: "cross",
    prompt: "The price of good y rises by 20%, and demand for good x falls by 10%. What is εxy?",
    answer: -0.5,
    explanation: "εxy = -10 / 20 = -0.5, so the goods are complements."
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
  practicePrompt: document.getElementById("practicePrompt"),
  practiceForm: document.getElementById("practiceForm"),
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

function roundTwo(value) {
  return Math.round(value * 100) / 100;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "undefined";
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
  if (Math.abs(magnitude - 1) < Number.EPSILON * 10) return "Unit elastic";
  if (magnitude > 1) return "Elastic";
  return "Inelastic";
}

function setSolvedStyles() {
  const solved = el.solveFor.value;
  el.priceGroup.classList.toggle("is-solved", solved === "price");
  el.quantityGroup.classList.toggle("is-solved", solved === "quantity");
  el.elasticityGroup.classList.toggle("is-solved", solved === "elasticity");

  [
    ["price", el.priceChange, el.priceSlider],
    ["quantity", el.quantityChange, el.quantitySlider],
    ["elasticity", el.elasticityValue, el.elasticitySlider]
  ].forEach(([value, input, slider]) => {
    const isSolved = solved === value;
    input.readOnly = isSolved;
    input.setAttribute("aria-readonly", String(isSolved));
    slider.disabled = isSolved;
  });
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
    elasticity = driver === 0 ? Number.NaN : roundTwo(response / driver);
    el.elasticityValue.value = Number.isFinite(elasticity) ? elasticity : "";
    el.elasticitySlider.value = Number.isFinite(elasticity) ? Math.max(-4, Math.min(4, elasticity)) : 0;
  }

  if (solved === "price") {
    driver = elasticity === 0 ? Number.NaN : roundOne(response / elasticity);
    el.priceChange.value = Number.isFinite(driver) ? driver : "";
    el.priceSlider.value = Number.isFinite(driver) ? Math.max(-40, Math.min(40, driver)) : 0;
  }

  return { driver, response, elasticity };
}

function setBar(bar, value) {
  if (!Number.isFinite(value)) {
    bar.style.width = "0";
    bar.style.left = "50%";
    bar.style.right = "auto";
    return;
  }

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

function revenueDirection(price, elasticity) {
  const magnitude = Math.abs(elasticity);
  if (!Number.isFinite(price) || !Number.isFinite(magnitude)) {
    return "Total revenue cannot be classified from the current values.";
  }
  if (price === 0) {
    return "Total revenue is unchanged because price does not change.";
  }
  if (elasticity > 0) {
    return "The usual total revenue test does not apply because these values make price and quantity demanded move in the same direction.";
  }
  if (Math.abs(magnitude - 1) < Number.EPSILON * 10) {
    return "Total revenue is roughly unchanged because demand is unit elastic.";
  }

  const priceRises = price > 0;
  const demandIsElastic = magnitude > 1;
  const revenueRises = demandIsElastic ? !priceRises : priceRises;
  const responseSize = demandIsElastic ? "larger" : "smaller";
  return `Total revenue tends to ${revenueRises ? "rise" : "fall"} because quantity demanded changes by a ${responseSize} percentage than price.`;
}

function interpretation(mode, driver, response, elasticity) {
  const config = MODES[mode];
  if (!Number.isFinite(elasticity)) {
    return `Elasticity is undefined because the percent change in ${config.driverName} is zero.`;
  }
  if (!Number.isFinite(driver)) {
    return `The required percent change in ${config.driverName} is undefined because elasticity is zero.`;
  }

  const base = `A ${formatPercent(driver)} change in ${config.driverName} predicts a ${formatPercent(response)} change in ${config.responseName}.`;
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
  el.priceSlider.setAttribute("aria-label", `Adjust ${config.driverLabel}`);
  el.quantitySlider.setAttribute("aria-label", `Adjust ${config.responseLabel}`);
  el.elasticitySlider.setAttribute("aria-label", `Adjust ${config.elasticityLabel}`);
  el.driverBarLabel.textContent = config.driverLabel;
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
  if (isDemand) {
    el.revenueText.textContent = revenueDirection(values.driver, values.elasticity);
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
  el.tabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  choosePracticeForMode(mode);
  render();
}

function choosePracticeForMode(mode, chooseDifferent = false) {
  const indexes = PRACTICE.map((item, index) => ({ item, index })).filter(({ item }) => item.mode === mode);
  const candidates = chooseDifferent && indexes.length > 1
    ? indexes.filter(({ index }) => index !== state.practiceIndex)
    : indexes;
  const selected = candidates[Math.floor(Math.random() * candidates.length)] || { index: 0 };
  state.practiceIndex = selected.index;
  el.practicePrompt.textContent = PRACTICE[state.practiceIndex].prompt;
  el.newPractice.textContent = indexes.length > 1 ? "New" : "Reset";
  el.practiceAnswer.value = "";
  el.practiceFeedback.className = "feedback hidden";
  el.practiceFeedback.textContent = "";
}

function checkPracticeAnswer() {
  const current = PRACTICE[state.practiceIndex];
  if (el.practiceAnswer.value.trim() === "") {
    el.practiceFeedback.className = "feedback incorrect";
    el.practiceFeedback.textContent = "Enter an answer before checking.";
    return;
  }
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
el.practiceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkPracticeAnswer();
});
el.newPractice.addEventListener("click", () => {
  choosePracticeForMode(state.mode, true);
  el.practiceAnswer.focus();
});

setMode("demand");
