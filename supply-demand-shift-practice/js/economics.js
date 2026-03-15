export function solveOneEvent(problem) {
  const { event } = problem;
  const diagramKey = `${event.affectedCurve}-${event.shiftDirection}`;

  return {
    correctAnswers: {
      curve: event.affectedCurve,
      shift: event.shiftDirection,
      price: event.priceEffect,
      quantity: event.quantityEffect
    },
    diagramKey,
    explanation: [
      `This is a ${event.affectedCurve}-side event.`,
      `${event.affectedCurve.charAt(0).toUpperCase() + event.affectedCurve.slice(1)} shifts ${event.shiftDirection}.`,
      `Equilibrium price ${event.priceEffect}s and equilibrium quantity ${event.quantityEffect}s.`,
      event.explanation
    ]
  };
}

function getCombinedOutcome(demandShift, supplyShift) {
  if (demandShift === "right" && supplyShift === "right") {
    return {
      price: "ambiguous",
      quantity: "increase",
      certainVariable: "quantity",
      rule: "Both events push equilibrium quantity upward, but they push price in opposite directions."
    };
  }

  if (demandShift === "left" && supplyShift === "left") {
    return {
      price: "ambiguous",
      quantity: "decrease",
      certainVariable: "quantity",
      rule: "Both events push equilibrium quantity downward, but they push price in opposite directions."
    };
  }

  if (demandShift === "right" && supplyShift === "left") {
    return {
      price: "increase",
      quantity: "ambiguous",
      certainVariable: "price",
      rule: "Both events push equilibrium price upward, but they push quantity in opposite directions."
    };
  }

  return {
    price: "decrease",
    quantity: "ambiguous",
    certainVariable: "price",
    rule: "Both events push equilibrium price downward, but they push quantity in opposite directions."
  };
}

export function solveTwoEvent(problem) {
  const demandOnly = {
    price: problem.demandEvent.priceEffect,
    quantity: problem.demandEvent.quantityEffect
  };
  const supplyOnly = {
    price: problem.supplyEvent.priceEffect,
    quantity: problem.supplyEvent.quantityEffect
  };
  const combined = getCombinedOutcome(
    problem.demandEvent.shiftDirection,
    problem.supplyEvent.shiftDirection
  );

  return {
    correctAnswers: {
      combinedPrice: combined.price,
      combinedQuantity: combined.quantity
    },
    demandOnly,
    supplyOnly,
    combined,
    reminders: [
      "Analyze the demand event and supply event separately before combining them.",
      "If both events push the same variable in the same direction, that effect is reinforced.",
      "If the events push a variable in opposite directions, the final effect on that variable is ambiguous unless you know which shift is larger."
    ]
  };
}

export function compareAnswers(expected, submitted) {
  const entries = Object.entries(expected);
  const missing = entries.filter(([key]) => !submitted[key]);

  if (missing.length > 0) {
    return {
      score: 0,
      total: entries.length,
      status: "warning",
      summary: "Complete every prediction before checking your work.",
      details: []
    };
  }

  const details = entries.map(([key, value]) => ({
    key,
    expected: value,
    received: submitted[key],
    correct: submitted[key] === value
  }));

  const correct = details.filter((item) => item.correct).length;
  let status = "success";
  let summary = "Excellent. Every prediction is correct.";

  if (correct === 0) {
    status = "error";
    summary = "None of these predictions match yet, so use the explanation to rebuild the logic step by step.";
  } else if (correct < entries.length) {
    status = "warning";
    summary = `You have ${correct} of ${entries.length} correct. Check the misses and compare each shift carefully.`;
  }

  return {
    score: correct,
    total: entries.length,
    status,
    summary,
    details
  };
}
