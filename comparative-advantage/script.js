const PEOPLE_NAMES = [
  "Mia",
  "Carlos",
  "Ava",
  "Ethan",
  "Nora",
  "Leo",
  "Zoe",
  "Owen",
  "Sofia",
  "Lucas",
  "Aria",
  "Mateo"
];

const COUNTRY_NAMES = [
  "United States",
  "Japan",
  "Brazil",
  "Germany",
  "Canada",
  "India",
  "Mexico",
  "South Korea",
  "Italy",
  "Australia"
];

const GOODS = [
  ["burgers", "fries"],
  ["coffee", "muffins"],
  ["shirts", "shoes"],
  ["wheat", "cloth"],
  ["cars", "computers"],
  ["wine", "cheese"],
  ["bananas", "rice"],
  ["tables", "chairs"]
];

const EXAMPLE_PROBLEM = {
  mode: "people",
  names: ["Mia", "Carlos"],
  goods: ["coffee", "muffins"],
  production: {
    A: { good1: 8, good2: 16 },
    B: { good1: 12, good2: 12 }
  }
};

const appState = {
  problem: null,
  solution: null
};

const elements = {
  entityMode: document.getElementById("entityMode"),
  newProblemBtn: document.getElementById("newProblemBtn"),
  exampleBtn: document.getElementById("exampleBtn"),
  showAnswerBtn: document.getElementById("showAnswerBtn"),
  resetBtn: document.getElementById("resetBtn"),
  problemSummary: document.getElementById("problemSummary"),
  good1Header: document.getElementById("good1Header"),
  good2Header: document.getElementById("good2Header"),
  problemTableBody: document.getElementById("problemTableBody"),
  answerCard: document.getElementById("answerCard"),
  answerContent: document.getElementById("answerContent"),
  checkForm: document.getElementById("checkForm"),
  feedbackPanel: document.getElementById("feedbackPanel"),
  producerOneLabel: document.getElementById("producerOneLabel"),
  producerTwoLabel: document.getElementById("producerTwoLabel"),
  caGood1: document.getElementById("caGood1"),
  caGood2: document.getElementById("caGood2")
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function samplePair(list) {
  const copy = [...list];
  const firstIndex = randInt(0, copy.length - 1);
  const first = copy.splice(firstIndex, 1)[0];
  const second = copy[randInt(0, copy.length - 1)];
  return [first, second];
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

function simplifyFraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
}

function toFractionString(value, maxDenominator = 12) {
  if (!Number.isFinite(value)) {
    return "undefined";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  let best = null;

  for (let denominator = 1; denominator <= maxDenominator; denominator += 1) {
    const numerator = Math.round(value * denominator);
    const approximation = numerator / denominator;
    const error = Math.abs(value - approximation);

    if (!best || error < best.error) {
      best = { numerator, denominator, error };
    }
  }

  if (best && best.error < 0.02) {
    const reduced = simplifyFraction(best.numerator, best.denominator);
    return `${reduced.numerator}/${reduced.denominator}`;
  }

  return value.toFixed(value < 1 ? 2 : 1).replace(/\.0$/, "");
}

function decimalFromInput(raw) {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  if (value.includes("/")) {
    const [num, den] = value.split("/").map(Number);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
      return Number.NaN;
    }
    return num / den;
  }

  return Number(value);
}

function formatRatio(value) {
  const fraction = toFractionString(value);
  const decimal = value.toFixed(value < 1 ? 2 : 2).replace(/0+$/, "").replace(/\.$/, "");
  return fraction === decimal ? fraction : `${fraction} (${decimal})`;
}

function chooseTradeRatio(low, high) {
  const niceValues = [
    0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4
  ];

  const candidate = niceValues.find((value) => value > low && value < high);
  if (candidate !== undefined) {
    return candidate;
  }

  return Number(((low + high) / 2).toFixed(2));
}

function higherOutputWinner(valueA, valueB, nameA, nameB) {
  if (valueA === valueB) {
    return "Neither / Tie";
  }
  return valueA > valueB ? nameA : nameB;
}

function lowerCostWinner(valueA, valueB, nameA, nameB) {
  if (Math.abs(valueA - valueB) < 0.0001) {
    return "Neither / Tie";
  }
  return valueA < valueB ? nameA : nameB;
}

function buildProblem(mode) {
  const names = samplePair(mode === "countries" ? COUNTRY_NAMES : PEOPLE_NAMES);
  const goods = GOODS[randInt(0, GOODS.length - 1)];

  for (let attempt = 0; attempt < 400; attempt += 1) {
    const values = [randInt(3, 18), randInt(3, 18), randInt(3, 18), randInt(3, 18)];
    const [a1, a2, b1, b2] = values;

    if (a1 === b1 || a2 === b2) {
      continue;
    }

    const ocA1 = a2 / a1;
    const ocB1 = b2 / b1;
    const difference = Math.abs(ocA1 - ocB1);

    if (difference < 0.18) {
      continue;
    }

    const ocA2 = a1 / a2;
    const ocB2 = b1 / b2;
    const simpleEnough = [ocA1, ocB1, ocA2, ocB2].every((value) => {
      const display = toFractionString(value);
      return display.length <= 5 || /^\d(\.\d{1,2})?$/.test(display);
    });

    if (!simpleEnough) {
      continue;
    }

    return {
      mode,
      names,
      goods,
      production: {
        A: { good1: a1, good2: a2 },
        B: { good1: b1, good2: b2 }
      }
    };
  }

  return structuredClone(EXAMPLE_PROBLEM);
}

function calculateAdvantages(problem) {
  const { names, goods, production } = problem;
  const producerA = production.A;
  const producerB = production.B;

  const absoluteAdvantage = {
    good1: higherOutputWinner(producerA.good1, producerB.good1, names[0], names[1]),
    good2: higherOutputWinner(producerA.good2, producerB.good2, names[0], names[1])
  };

  const opportunityCosts = {
    A: {
      good1: producerA.good2 / producerA.good1,
      good2: producerA.good1 / producerA.good2
    },
    B: {
      good1: producerB.good2 / producerB.good1,
      good2: producerB.good1 / producerB.good2
    }
  };

  const comparativeAdvantage = {
    good1: lowerCostWinner(opportunityCosts.A.good1, opportunityCosts.B.good1, names[0], names[1]),
    good2: lowerCostWinner(opportunityCosts.A.good2, opportunityCosts.B.good2, names[0], names[1])
  };

  const specialization = {
    [names[0]]: comparativeAdvantage.good1 === "Neither / Tie" ? "no clear specialization" : comparativeAdvantage.good1 === names[0] ? goods[0] : goods[1],
    [names[1]]: comparativeAdvantage.good1 === "Neither / Tie" ? "no clear specialization" : comparativeAdvantage.good1 === names[1] ? goods[0] : goods[1]
  };

  const trade = calculateTradeDetails(problem, opportunityCosts, comparativeAdvantage);

  return {
    absoluteAdvantage,
    opportunityCosts,
    comparativeAdvantage,
    specialization,
    trade
  };
}

function calculateTradeDetails(problem, opportunityCosts, comparativeAdvantage) {
  const { names, goods } = problem;
  const lowCost = Math.min(opportunityCosts.A.good1, opportunityCosts.B.good1);
  const highCost = Math.max(opportunityCosts.A.good1, opportunityCosts.B.good1);
  const intervalExists = highCost - lowCost > 0.0001;

  if (!intervalExists) {
    return {
      ratio: null,
      ratioText: "No meaningful interval",
      explanation: `Both ${names[0]} and ${names[1]} face the same opportunity cost for ${goods[0]}. When opportunity costs are equal, comparative advantage is absent, so there is little or no special gain from trade based on specialization.`
    };
  }

  const ratio = chooseTradeRatio(lowCost, highCost);
  const exporter = comparativeAdvantage.good1;
  const importer = exporter === names[0] ? names[1] : names[0];
  const exporterKey = exporter === names[0] ? "A" : "B";
  const importerKey = exporterKey === "A" ? "B" : "A";

  const exporterCost = opportunityCosts[exporterKey].good1;
  const importerCost = opportunityCosts[importerKey].good1;

  return {
    ratio,
    ratioText: `1 ${goods[0]} trades for ${formatRatio(ratio)} ${goods[1]}`,
    explanation: `${exporter} has the comparative advantage in ${goods[0]} because its opportunity cost is lower: ${formatRatio(exporterCost)} ${goods[1]} for 1 ${goods[0]}, compared with ${formatRatio(importerCost)} for ${importer}. A trade price of ${formatRatio(ratio)} ${goods[1]} for 1 ${goods[0]} is plausible because it lies between those two opportunity costs. ${exporter} can export ${goods[0]} at a rate better than its own domestic trade-off, and ${importer} can import ${goods[0]} at a cost lower than producing it alone. That is why both sides can gain from trade at that rate.`
  };
}

function buildAnswerMarkup(problem, solution) {
  const [producerA, producerB] = problem.names;
  const [good1, good2] = problem.goods;

  return `
    <div class="answer-block">
      <h3>Absolute Advantage</h3>
      <p><strong>${good1}:</strong> ${solution.absoluteAdvantage.good1}</p>
      <p><strong>${good2}:</strong> ${solution.absoluteAdvantage.good2}</p>
      <p class="supporting-text">Absolute advantage means producing more output with the same resources.</p>
    </div>
    <div class="answer-block">
      <h3>Opportunity Costs</h3>
      <p class="equation">${producerA}: 1 ${good1} costs ${formatRatio(solution.opportunityCosts.A.good1)} ${good2}; 1 ${good2} costs ${formatRatio(solution.opportunityCosts.A.good2)} ${good1}</p>
      <p class="equation">${producerB}: 1 ${good1} costs ${formatRatio(solution.opportunityCosts.B.good1)} ${good2}; 1 ${good2} costs ${formatRatio(solution.opportunityCosts.B.good2)} ${good1}</p>
      <p class="supporting-text">To find opportunity cost, divide the other good by the good you are producing.</p>
    </div>
    <div class="answer-block">
      <h3>Comparative Advantage</h3>
      <p><strong>${good1}:</strong> ${solution.comparativeAdvantage.good1}</p>
      <p><strong>${good2}:</strong> ${solution.comparativeAdvantage.good2}</p>
      <p class="supporting-text">Comparative advantage goes to the producer with the lower opportunity cost.</p>
    </div>
    <div class="answer-block">
      <h3>Recommended Specialization</h3>
      <p>${producerA} should specialize in <strong>${solution.specialization[producerA]}</strong>.</p>
      <p>${producerB} should specialize in <strong>${solution.specialization[producerB]}</strong>.</p>
    </div>
    <div class="answer-block">
      <h3>Plausible Terms of Trade</h3>
      <p><strong>${solution.trade.ratioText}</strong></p>
      <p>${solution.trade.explanation}</p>
    </div>
  `;
}

function renderProblem(problem) {
  const [producerA, producerB] = problem.names;
  const [good1, good2] = problem.goods;

  elements.problemSummary.textContent = `${producerA} and ${producerB} can each produce ${good1} or ${good2} with the same amount of time or resources.`;
  elements.good1Header.textContent = good1;
  elements.good2Header.textContent = good2;

  elements.problemTableBody.innerHTML = `
    <tr>
      <td>${producerA}</td>
      <td>${problem.production.A.good1}</td>
      <td>${problem.production.A.good2}</td>
    </tr>
    <tr>
      <td>${producerB}</td>
      <td>${problem.production.B.good1}</td>
      <td>${problem.production.B.good2}</td>
    </tr>
  `;

  document.querySelectorAll(".good1-label").forEach((node) => {
    node.textContent = good1;
  });

  document.querySelectorAll(".good2-label").forEach((node) => {
    node.textContent = good2;
  });

  elements.producerOneLabel.textContent = producerA;
  elements.producerTwoLabel.textContent = producerB;

  const optionsMarkup = `
    <option value="">Choose one</option>
    <option value="${producerA}">${producerA}</option>
    <option value="${producerB}">${producerB}</option>
    <option value="Neither">Neither / Tie</option>
  `;

  elements.caGood1.innerHTML = optionsMarkup;
  elements.caGood2.innerHTML = optionsMarkup;
}

function renderAnswer(problem, solution) {
  elements.answerContent.innerHTML = buildAnswerMarkup(problem, solution);
  elements.answerCard.classList.remove("hidden");
}

function clearFeedback() {
  elements.feedbackPanel.innerHTML = "";
  elements.feedbackPanel.classList.add("hidden");
}

function resetForm() {
  elements.checkForm.reset();
  clearFeedback();
}

function loadProblem(problem) {
  appState.problem = problem;
  appState.solution = calculateAdvantages(problem);
  renderProblem(problem);
  elements.answerCard.classList.add("hidden");
  resetForm();
}

function buildFeedbackItem(type, text) {
  return `<div class="feedback-item ${type}">${text}</div>`;
}

function compareValue(studentValue, correctValue) {
  if (studentValue === null) {
    return "blank";
  }
  if (!Number.isFinite(studentValue)) {
    return "invalid";
  }
  return Math.abs(studentValue - correctValue) < 0.03 ? "correct" : "incorrect";
}

function checkStudentWork(event) {
  event.preventDefault();

  const { problem, solution } = appState;
  const [producerA, producerB] = problem.names;
  const [good1, good2] = problem.goods;

  const submissions = {
    ocAGood1: decimalFromInput(document.getElementById("ocAGood1").value),
    ocAGood2: decimalFromInput(document.getElementById("ocAGood2").value),
    ocBGood1: decimalFromInput(document.getElementById("ocBGood1").value),
    ocBGood2: decimalFromInput(document.getElementById("ocBGood2").value),
    caGood1: elements.caGood1.value,
    caGood2: elements.caGood2.value,
    tradeRatio: decimalFromInput(document.getElementById("tradeRatio").value)
  };

  const checks = [
    {
      label: `${producerA}'s opportunity cost of ${good1}`,
      result: compareValue(submissions.ocAGood1, solution.opportunityCosts.A.good1),
      correctText: `${formatRatio(solution.opportunityCosts.A.good1)} ${good2}`
    },
    {
      label: `${producerA}'s opportunity cost of ${good2}`,
      result: compareValue(submissions.ocAGood2, solution.opportunityCosts.A.good2),
      correctText: `${formatRatio(solution.opportunityCosts.A.good2)} ${good1}`
    },
    {
      label: `${producerB}'s opportunity cost of ${good1}`,
      result: compareValue(submissions.ocBGood1, solution.opportunityCosts.B.good1),
      correctText: `${formatRatio(solution.opportunityCosts.B.good1)} ${good2}`
    },
    {
      label: `${producerB}'s opportunity cost of ${good2}`,
      result: compareValue(submissions.ocBGood2, solution.opportunityCosts.B.good2),
      correctText: `${formatRatio(solution.opportunityCosts.B.good2)} ${good1}`
    }
  ];

  const caChecks = [
    {
      label: `Comparative advantage in ${good1}`,
      result: submissions.caGood1 === solution.comparativeAdvantage.good1 ? "correct" : submissions.caGood1 ? "incorrect" : "blank",
      correctText: solution.comparativeAdvantage.good1
    },
    {
      label: `Comparative advantage in ${good2}`,
      result: submissions.caGood2 === solution.comparativeAdvantage.good2 ? "correct" : submissions.caGood2 ? "incorrect" : "blank",
      correctText: solution.comparativeAdvantage.good2
    }
  ];

  let tradeResult = "blank";
  let tradeText = solution.trade.ratioText;
  if (solution.trade.ratio === null) {
    tradeResult = submissions.tradeRatio === null ? "correct" : "partial";
    tradeText = "No special terms of trade interval exists because the opportunity costs match.";
  } else if (submissions.tradeRatio !== null) {
    if (!Number.isFinite(submissions.tradeRatio)) {
      tradeResult = "invalid";
    } else {
      const low = Math.min(solution.opportunityCosts.A.good1, solution.opportunityCosts.B.good1);
      const high = Math.max(solution.opportunityCosts.A.good1, solution.opportunityCosts.B.good1);
      tradeResult = submissions.tradeRatio > low && submissions.tradeRatio < high ? "correct" : "incorrect";
    }
  }

  const allChecks = [...checks, ...caChecks];
  const correctCount = allChecks.filter((item) => item.result === "correct").length;
  const totalCount = allChecks.length;
  const feedback = [];

  checks.forEach((item) => {
    if (item.result === "correct") {
      feedback.push(buildFeedbackItem("correct", `${item.label}: correct.`));
    } else if (item.result === "blank") {
      feedback.push(buildFeedbackItem("partial", `${item.label}: left blank. The correct value is ${item.correctText}.`));
    } else if (item.result === "invalid") {
      feedback.push(buildFeedbackItem("incorrect", `${item.label}: that entry could not be read. Use a decimal like 0.5 or a fraction like 1/2. The correct value is ${item.correctText}.`));
    } else {
      feedback.push(buildFeedbackItem("incorrect", `${item.label}: not quite. The correct value is ${item.correctText}. Remember to divide the other good by the good you are giving up.`));
    }
  });

  caChecks.forEach((item) => {
    if (item.result === "correct") {
      feedback.push(buildFeedbackItem("correct", `${item.label}: correct.`));
    } else if (item.result === "blank") {
      feedback.push(buildFeedbackItem("partial", `${item.label}: left blank. The correct answer is ${item.correctText}.`));
    } else {
      feedback.push(buildFeedbackItem("incorrect", `${item.label}: incorrect. The producer with the lower opportunity cost is ${item.correctText}.`));
    }
  });

  if (tradeResult === "correct") {
    feedback.push(buildFeedbackItem("correct", `Trade ratio: plausible. ${tradeText}.`));
  } else if (tradeResult === "partial") {
    feedback.push(buildFeedbackItem("partial", `Trade ratio: not needed here because opportunity costs are equal, so gains from trade from comparative advantage are limited.`));
  } else if (tradeResult === "invalid") {
    feedback.push(buildFeedbackItem("incorrect", `Trade ratio: that entry could not be read. Use a decimal or simple fraction.`));
  } else if (tradeResult === "incorrect") {
    feedback.push(buildFeedbackItem("incorrect", `Trade ratio: not plausible for this problem. A workable price for 1 ${good1} must lie between the two opportunity costs, such as ${tradeText}.`));
  } else {
    feedback.push(buildFeedbackItem("partial", `Trade ratio: optional. One plausible answer is ${tradeText}.`));
  }

  const summary = `<div class="feedback-summary">You got ${correctCount} of ${totalCount} required checks fully correct.</div>`;
  const reminder = `<p class="supporting-text">Reminder: comparative advantage follows the lower opportunity cost, even if the other producer has absolute advantage in more goods.</p>`;
  elements.feedbackPanel.innerHTML = summary + feedback.join("") + reminder;
  elements.feedbackPanel.classList.remove("hidden");
}

function initializeEvents() {
  elements.newProblemBtn.addEventListener("click", () => {
    loadProblem(buildProblem(elements.entityMode.value));
  });

  elements.exampleBtn.addEventListener("click", () => {
    elements.entityMode.value = EXAMPLE_PROBLEM.mode;
    loadProblem(structuredClone(EXAMPLE_PROBLEM));
  });

  elements.showAnswerBtn.addEventListener("click", () => {
    renderAnswer(appState.problem, appState.solution);
  });

  elements.resetBtn.addEventListener("click", () => {
    elements.answerCard.classList.add("hidden");
    resetForm();
  });

  elements.checkForm.addEventListener("submit", checkStudentWork);
}

initializeEvents();
loadProblem(buildProblem(elements.entityMode.value));
