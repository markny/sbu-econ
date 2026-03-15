(function () {
  const MARKETS = [
    "coffee",
    "apartments",
    "movie tickets",
    "wheat",
    "bicycles",
    "orange juice",
    "college sweatshirts",
    "ice cream",
    "textbooks",
    "laptops"
  ];

  function createEvent({
    id,
    category,
    affectedCurve,
    shiftDirection,
    priceEffect,
    quantityEffect,
    explanation,
    alternatePrompts
  }) {
    return {
      id,
      category,
      affectedCurve,
      shiftDirection,
      priceEffect,
      quantityEffect,
      explanation,
      alternatePrompts
    };
  }

  const DEMAND_EVENTS = [
    createEvent({
      id: "demand-substitutes-rise",
      category: "price of substitutes",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "When a substitute becomes more expensive, some consumers switch toward this good, so demand increases.",
      alternatePrompts: [
        "The price of a substitute for {market} rises.",
        "A competing product becomes more expensive than {market}.",
        "Consumers see the substitute for {market} get pricier.",
        "A close substitute for {market} now costs more."
      ]
    }),
    createEvent({
      id: "demand-substitutes-fall",
      category: "price of substitutes",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "When a substitute becomes cheaper, some buyers switch away from this good, so demand decreases.",
      alternatePrompts: [
        "The price of a substitute for {market} falls.",
        "A competing product becomes cheaper than {market}.",
        "Consumers see the substitute for {market} get less expensive.",
        "A close substitute for {market} now costs less."
      ]
    }),
    createEvent({
      id: "demand-complements-fall",
      category: "price of complements",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "A cheaper complement makes it more attractive to buy this good too, so demand increases.",
      alternatePrompts: [
        "The price of a complement to {market} falls.",
        "A product commonly used with {market} becomes cheaper.",
        "The complement that goes with {market} now costs less.",
        "Buying the related good used with {market} is now less expensive."
      ]
    }),
    createEvent({
      id: "demand-complements-rise",
      category: "price of complements",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "A more expensive complement makes this good less attractive to buy, so demand decreases.",
      alternatePrompts: [
        "The price of a complement to {market} rises.",
        "A product commonly used with {market} becomes more expensive.",
        "The complement that goes with {market} now costs more.",
        "Buying the related good used with {market} is now more expensive."
      ]
    }),
    createEvent({
      id: "demand-normal-income-rise",
      category: "income for a normal good",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "For a normal good, higher income increases consumers' willingness and ability to buy it.",
      alternatePrompts: [
        "Consumer income rises, and {market} is a normal good.",
        "Households earn more income, and {market} is a normal good.",
        "Buyers have higher incomes and treat {market} as a normal good.",
        "Income increases for consumers in a market where {market} is a normal good."
      ]
    }),
    createEvent({
      id: "demand-normal-income-fall",
      category: "income for a normal good",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "For a normal good, lower income reduces consumers' willingness and ability to buy it.",
      alternatePrompts: [
        "Consumer income falls, and {market} is a normal good.",
        "Households earn less income, and {market} is a normal good.",
        "Buyers have lower incomes and treat {market} as a normal good.",
        "Income decreases for consumers in a market where {market} is a normal good."
      ]
    }),
    createEvent({
      id: "demand-inferior-income-rise",
      category: "income for an inferior good",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "For an inferior good, higher income causes some consumers to switch toward better alternatives, so demand falls.",
      alternatePrompts: [
        "Consumer income rises, and {market} is an inferior good.",
        "Households earn more income, and {market} is an inferior good.",
        "Buyers have higher incomes and treat {market} as an inferior good.",
        "Income increases for consumers in a market where {market} is an inferior good."
      ]
    }),
    createEvent({
      id: "demand-inferior-income-fall",
      category: "income for an inferior good",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "For an inferior good, lower income leads some consumers to buy more of it, so demand rises.",
      alternatePrompts: [
        "Consumer income falls, and {market} is an inferior good.",
        "Households earn less income, and {market} is an inferior good.",
        "Buyers have lower incomes and treat {market} as an inferior good.",
        "Income decreases for consumers in a market where {market} is an inferior good."
      ]
    }),
    createEvent({
      id: "demand-tastes-improve",
      category: "tastes and preferences",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "When a good becomes more fashionable or desirable, demand increases.",
      alternatePrompts: [
        "{market} becomes more popular with consumers.",
        "Tastes shift in favor of {market}.",
        "Consumers begin to prefer {market} more strongly.",
        "{market} becomes more fashionable and desirable."
      ]
    }),
    createEvent({
      id: "demand-tastes-weaken",
      category: "tastes and preferences",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "When a good becomes less fashionable or desirable, demand decreases.",
      alternatePrompts: [
        "{market} becomes less popular with consumers.",
        "Tastes shift away from {market}.",
        "Consumers begin to prefer {market} less strongly.",
        "{market} becomes less fashionable and less desirable."
      ]
    }),
    createEvent({
      id: "demand-expected-price-rise",
      category: "expectations of future prices",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "If buyers expect a higher future price, some buy now instead, so current demand rises.",
      alternatePrompts: [
        "Consumers expect the price of {market} to rise in the future.",
        "Buyers think {market} will be more expensive next month.",
        "Consumers expect future prices for {market} to be higher.",
        "People anticipate a future increase in the price of {market}."
      ]
    }),
    createEvent({
      id: "demand-expected-price-fall",
      category: "expectations of future prices",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "If buyers expect a lower future price, some wait to buy later, so current demand falls.",
      alternatePrompts: [
        "Consumers expect the price of {market} to fall in the future.",
        "Buyers think {market} will be cheaper next month.",
        "Consumers expect future prices for {market} to be lower.",
        "People anticipate a future decrease in the price of {market}."
      ]
    }),
    createEvent({
      id: "demand-expected-income-rise",
      category: "expectations of future income",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "If consumers expect higher future income, they may spend more now, increasing current demand.",
      alternatePrompts: [
        "Consumers expect their future income to increase, so they buy more {market} now.",
        "Buyers expect to earn more income soon and increase current purchases of {market}.",
        "Households anticipate higher future income and demand more {market} today.",
        "People expect stronger future income and increase current demand for {market}."
      ]
    }),
    createEvent({
      id: "demand-expected-income-fall",
      category: "expectations of future income",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "If consumers expect lower future income, they may cut back now, decreasing current demand.",
      alternatePrompts: [
        "Consumers expect their future income to decrease, so they buy less {market} now.",
        "Buyers expect to earn less income soon and reduce current purchases of {market}.",
        "Households anticipate lower future income and demand less {market} today.",
        "People expect weaker future income and reduce current demand for {market}."
      ]
    }),
    createEvent({
      id: "demand-market-size-rise",
      category: "market size",
      affectedCurve: "demand",
      shiftDirection: "right",
      priceEffect: "increase",
      quantityEffect: "increase",
      explanation: "A larger market brings in more buyers, so demand increases.",
      alternatePrompts: [
        "Population in the market for {market} increases.",
        "More consumers enter the market for {market}.",
        "The number of buyers in the market for {market} grows.",
        "Market size increases for {market}."
      ]
    }),
    createEvent({
      id: "demand-market-size-fall",
      category: "market size",
      affectedCurve: "demand",
      shiftDirection: "left",
      priceEffect: "decrease",
      quantityEffect: "decrease",
      explanation: "A smaller market means fewer buyers, so demand decreases.",
      alternatePrompts: [
        "Population in the market for {market} decreases.",
        "Fewer consumers remain in the market for {market}.",
        "The number of buyers in the market for {market} shrinks.",
        "Market size decreases for {market}."
      ]
    })
  ];

  const SUPPLY_EVENTS = [
    createEvent({
      id: "supply-input-prices-rise",
      category: "input prices",
      affectedCurve: "supply",
      shiftDirection: "left",
      priceEffect: "increase",
      quantityEffect: "decrease",
      explanation: "Higher input prices raise production costs, so firms supply less at every price.",
      alternatePrompts: [
        "Input prices rise for firms producing {market}.",
        "The cost of raw materials used to make {market} increases.",
        "Production inputs become more expensive for firms in the {market} market.",
        "Firms making {market} face higher input costs."
      ]
    }),
    createEvent({
      id: "supply-input-prices-fall",
      category: "input prices",
      affectedCurve: "supply",
      shiftDirection: "right",
      priceEffect: "decrease",
      quantityEffect: "increase",
      explanation: "Lower input prices reduce production costs, so firms supply more at every price.",
      alternatePrompts: [
        "Input prices fall for firms producing {market}.",
        "The cost of raw materials used to make {market} decreases.",
        "Production inputs become less expensive for firms in the {market} market.",
        "Firms making {market} face lower input costs."
      ]
    }),
    createEvent({
      id: "supply-technology-improves",
      category: "technology",
      affectedCurve: "supply",
      shiftDirection: "right",
      priceEffect: "decrease",
      quantityEffect: "increase",
      explanation: "Better technology makes production more efficient, which increases supply.",
      alternatePrompts: [
        "Technology improves in the market for {market}.",
        "Firms discover a more efficient way to produce {market}.",
        "New technology lowers the cost of making {market}.",
        "Production of {market} becomes more efficient."
      ]
    }),
    createEvent({
      id: "supply-technology-worsens",
      category: "technology",
      affectedCurve: "supply",
      shiftDirection: "left",
      priceEffect: "increase",
      quantityEffect: "decrease",
      explanation: "Worse technology or less efficient production raises costs, which decreases supply.",
      alternatePrompts: [
        "Technology worsens in the market for {market}.",
        "Firms lose an efficient production method for {market}.",
        "Producing {market} becomes less efficient.",
        "A production setback makes {market} harder to produce efficiently."
      ]
    }),
    createEvent({
      id: "supply-expected-price-rise",
      category: "expectations of future prices",
      affectedCurve: "supply",
      shiftDirection: "left",
      priceEffect: "increase",
      quantityEffect: "decrease",
      explanation: "If firms expect higher future prices, they may hold back output now, reducing current supply.",
      alternatePrompts: [
        "Firms expect the future price of {market} to rise.",
        "Sellers think {market} will be more valuable later, so they hold some back now.",
        "Producers expect higher future prices for {market}.",
        "Firms believe they can sell {market} for more in the future."
      ]
    }),
    createEvent({
      id: "supply-expected-price-fall",
      category: "expectations of future prices",
      affectedCurve: "supply",
      shiftDirection: "right",
      priceEffect: "decrease",
      quantityEffect: "increase",
      explanation: "If firms expect lower future prices, they may sell more now, increasing current supply.",
      alternatePrompts: [
        "Firms expect the future price of {market} to fall.",
        "Sellers think {market} will be worth less later, so they sell more now.",
        "Producers expect lower future prices for {market}.",
        "Firms believe they should move more {market} onto the market today."
      ]
    }),
    createEvent({
      id: "supply-market-size-rise",
      category: "market size / number of firms",
      affectedCurve: "supply",
      shiftDirection: "right",
      priceEffect: "decrease",
      quantityEffect: "increase",
      explanation: "When more firms enter the market, total market supply increases.",
      alternatePrompts: [
        "More firms enter the market for {market}.",
        "The number of sellers in the market for {market} increases.",
        "Market size expands on the seller side for {market}.",
        "New firms begin producing and selling {market}."
      ]
    }),
    createEvent({
      id: "supply-market-size-fall",
      category: "market size / number of firms",
      affectedCurve: "supply",
      shiftDirection: "left",
      priceEffect: "increase",
      quantityEffect: "decrease",
      explanation: "When firms leave the market, total market supply decreases.",
      alternatePrompts: [
        "Firms leave the market for {market}.",
        "The number of sellers in the market for {market} decreases.",
        "Market size shrinks on the seller side for {market}.",
        "Several producers stop making and selling {market}."
      ]
    })
  ];

  const ONE_EVENT_DIAGRAMS = {
    "demand-right": {
      src: "./assets/diagrams/demand_increase.svg",
      title: "Demand Increase",
      description: "Demand shifts right. Equilibrium price and quantity both increase."
    },
    "demand-left": {
      src: "./assets/diagrams/demand_decrease.svg",
      title: "Demand Decrease",
      description: "Demand shifts left. Equilibrium price and quantity both decrease."
    },
    "supply-right": {
      src: "./assets/diagrams/supply_increase.svg",
      title: "Supply Increase",
      description: "Supply shifts right. Equilibrium price decreases and quantity increases."
    },
    "supply-left": {
      src: "./assets/diagrams/supply_decrease.svg",
      title: "Supply Decrease",
      description: "Supply shifts left. Equilibrium price increases and quantity decreases."
    }
  };

  const appState = {
    problem: null,
    solution: null,
    whyVisible: false
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
    answerActions: document.getElementById("answerActions"),
    whyToggleBtn: document.getElementById("whyToggleBtn"),
    similarProblemBtn: document.getElementById("similarProblemBtn"),
    whyPanel: document.getElementById("whyPanel"),
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

  function sample(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function sampleFiltered(list, predicate) {
    const filtered = list.filter(predicate);
    return filtered.length > 0 ? sample(filtered) : sample(list);
  }

  function fillTemplate(text, market) {
    return text.replaceAll("{market}", market);
  }

  function instantiateEvent(base, market) {
    const prompt = fillTemplate(sample(base.alternatePrompts), market);

    return {
      id: `${base.id}-${Math.random().toString(36).slice(2, 8)}`,
      market,
      category: base.category,
      affectedCurve: base.affectedCurve,
      shiftDirection: base.shiftDirection,
      priceEffect: base.priceEffect,
      quantityEffect: base.quantityEffect,
      explanation: fillTemplate(base.explanation, market),
      alternatePrompts: base.alternatePrompts.map((item) => fillTemplate(item, market)),
      prompt
    };
  }

  function createOneEventProblem() {
    const market = sample(MARKETS);
    const type = Math.random() < 0.5 ? "demand" : "supply";
    const base = type === "demand" ? sample(DEMAND_EVENTS) : sample(SUPPLY_EVENTS);

    return {
      mode: "one",
      market,
      event: instantiateEvent(base, market)
    };
  }

  function createTwoEventProblem() {
    const market = sample(MARKETS);

    return {
      mode: "two",
      market,
      demandEvent: instantiateEvent(sample(DEMAND_EVENTS), market),
      supplyEvent: instantiateEvent(sample(SUPPLY_EVENTS), market)
    };
  }

  function createOneEventProblemLike(problem) {
    const market = sample(MARKETS);
    const sourceEvent = problem && problem.event;
    const base = sourceEvent
      ? (sourceEvent.affectedCurve === "demand"
          ? sampleFiltered(DEMAND_EVENTS, function (item) { return item.category === sourceEvent.category; })
          : sampleFiltered(SUPPLY_EVENTS, function (item) { return item.category === sourceEvent.category; }))
      : (Math.random() < 0.5 ? sample(DEMAND_EVENTS) : sample(SUPPLY_EVENTS));

    return {
      mode: "one",
      market,
      event: instantiateEvent(base, market)
    };
  }

  function createTwoEventProblemLike(problem) {
    const market = sample(MARKETS);
    const demandBase = problem && problem.demandEvent
      ? sampleFiltered(DEMAND_EVENTS, function (item) { return item.category === problem.demandEvent.category; })
      : sample(DEMAND_EVENTS);
    const supplyBase = problem && problem.supplyEvent
      ? sampleFiltered(SUPPLY_EVENTS, function (item) { return item.category === problem.supplyEvent.category; })
      : sample(SUPPLY_EVENTS);

    return {
      mode: "two",
      market,
      demandEvent: instantiateEvent(demandBase, market),
      supplyEvent: instantiateEvent(supplyBase, market)
    };
  }

  function solveOneEvent(problem) {
    const event = problem.event;
    return {
      correctAnswers: {
        curve: event.affectedCurve,
        shift: event.shiftDirection,
        price: event.priceEffect,
        quantity: event.quantityEffect
      },
      diagramKey: `${event.affectedCurve}-${event.shiftDirection}`,
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
        rule: "Demand up and supply up both push quantity upward, so quantity definitely increases. Price is ambiguous because demand pushes price up while supply pushes price down."
      };
    }

    if (demandShift === "left" && supplyShift === "left") {
      return {
        price: "ambiguous",
        quantity: "decrease",
        rule: "Demand down and supply down both push quantity downward, so quantity definitely decreases. Price is ambiguous because demand pushes price down while supply pushes price up."
      };
    }

    if (demandShift === "right" && supplyShift === "left") {
      return {
        price: "increase",
        quantity: "ambiguous",
        rule: "Demand up and supply down both push price upward, so price definitely increases. Quantity is ambiguous because one shift pushes quantity up and the other pushes quantity down."
      };
    }

    return {
      price: "decrease",
      quantity: "ambiguous",
      rule: "Demand down and supply up both push price downward, so price definitely decreases. Quantity is ambiguous because one shift pushes quantity down and the other pushes quantity up."
    };
  }

  function solveTwoEvent(problem) {
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

  function getOneEventDiagram(key) {
    return ONE_EVENT_DIAGRAMS[key];
  }

  function getTwoEventDiagrams(problem) {
    return [
      getOneEventDiagram(`demand-${problem.demandEvent.shiftDirection}`),
      getOneEventDiagram(`supply-${problem.supplyEvent.shiftDirection}`)
    ];
  }

  function compareAnswers(expected, submitted) {
    const entries = Object.entries(expected);
    const missing = entries.filter(function ([key]) {
      return !submitted[key];
    });

    if (missing.length > 0) {
      return {
        score: 0,
        total: entries.length,
        status: "warning",
        summary: "Complete every prediction before checking your work.",
        details: []
      };
    }

    const details = entries.map(function ([key, value]) {
      return {
        key,
        expected: value,
        received: submitted[key],
        correct: submitted[key] === value
      };
    });

    const correct = details.filter(function (item) {
      return item.correct;
    }).length;

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

    options.forEach(function (item) {
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
      .filter(function (item) {
        return !item.correct;
      })
      .map(function (item) {
        return `<li><strong>${LABELS[item.key]}:</strong> correct answer is ${prettyValue(item.expected)}.</li>`;
      })
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

    diagrams.forEach(function (diagram, index) {
      const card = document.createElement("article");
      card.className = "diagram-card";
      const heading =
        problem.mode === "one" ? diagram.title : index === 0 ? "Demand Event" : "Supply Event";

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


  function buildWhyMarkup(problem, solution) {
    if (problem.mode === "one") {
      return `
        <p>${problem.event.prompt}</p>
        <p>→ ${solution.correctAnswers.curve} shifts ${solution.correctAnswers.shift}</p>
        <p>→ equilibrium price ${solution.correctAnswers.price}s</p>
        <p>→ equilibrium quantity ${solution.correctAnswers.quantity}s</p>
      `;
    }

    return `
      <p>Event 1: demand shifts ${problem.demandEvent.shiftDirection}</p>
      <p>Event 2: supply shifts ${problem.supplyEvent.shiftDirection}</p>
      <p>Price: ${solution.combined.price === "ambiguous" ? "one effect pushes price up and the other pushes it down" : `both effects push price ${solution.combined.price}`}</p>
      <p>→ price is ${prettyValue(solution.correctAnswers.combinedPrice).toLowerCase()}</p>
      <p>Quantity: ${solution.combined.quantity === "ambiguous" ? "one effect pushes quantity up and the other pushes it down" : `both effects push quantity ${solution.combined.quantity}`}</p>
      <p>→ quantity is ${prettyValue(solution.correctAnswers.combinedQuantity).toLowerCase()}</p>
    `;
  }

  function hideWhyPanel() {
    appState.whyVisible = false;
    elements.whyPanel.classList.add("hidden");
    elements.whyToggleBtn.textContent = "Show why";
  }

  function showFollowupControls() {
    elements.answerActions.classList.remove("hidden");
    hideWhyPanel();
  }

  function toggleWhyPanel() {
    if (!appState.problem || !appState.solution) {
      return;
    }

    if (appState.whyVisible) {
      hideWhyPanel();
      return;
    }

    elements.whyPanel.innerHTML = buildWhyMarkup(appState.problem, appState.solution);
    elements.whyPanel.classList.remove("hidden");
    elements.whyToggleBtn.textContent = "Hide why";
    appState.whyVisible = true;
  }

  function generateSimilarProblem() {
    if (!appState.problem) {
      return;
    }

    appState.problem = appState.problem.mode === "one"
      ? createOneEventProblemLike(appState.problem)
      : createTwoEventProblemLike(appState.problem);
    appState.solution = appState.problem.mode === "one" ? solveOneEvent(appState.problem) : solveTwoEvent(appState.problem);

    renderInputs(appState.problem.mode);
    renderScenario(appState.problem);
    elements.answerSection.classList.add("hidden");
    elements.answerContent.innerHTML = "";
    elements.answerActions.classList.add("hidden");
    hideWhyPanel();
    elements.feedbackPanel.className = "feedback-panel hidden";
    elements.feedbackPanel.innerHTML = "";
    elements.diagramArea.className = "diagram-grid empty";
    elements.diagramArea.innerHTML = '<p class="placeholder">Use Show Answer or Check My Work to reveal the matching diagram.</p>';
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
    showFollowupControls();
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
    elements.answerActions.classList.add("hidden");
    hideWhyPanel();
    elements.feedbackPanel.className = "feedback-panel hidden";
    elements.feedbackPanel.innerHTML = "";
    elements.diagramArea.className = "diagram-grid empty";
    elements.diagramArea.innerHTML =
      '<p class="placeholder">Use Show Answer or Check My Work to reveal the matching diagram.</p>';
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
    elements.answerActions.classList.add("hidden");
    hideWhyPanel();
    elements.diagramArea.className = "diagram-grid empty";
    elements.diagramArea.innerHTML =
      '<p class="placeholder">The matching diagram will appear here after you generate a problem.</p>';
  }

  function toggleStudyPanel() {
    elements.studyPanel.classList.toggle("hidden");
  }

  elements.modeSelect.addEventListener("change", resetApp);
  elements.newProblemBtn.addEventListener("click", generateProblem);
  elements.showAnswerBtn.addEventListener("click", showAnswer);
  elements.whyToggleBtn.addEventListener("click", toggleWhyPanel);
  elements.similarProblemBtn.addEventListener("click", generateSimilarProblem);
  elements.studyToggleBtn.addEventListener("click", toggleStudyPanel);
  elements.resetBtn.addEventListener("click", resetApp);

  elements.answerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!appState.solution) {
      return;
    }

    renderFeedback(compareAnswers(appState.solution.correctAnswers, collectAnswers()));
    showAnswer();
  });

  renderInputs(getCurrentMode());
})();
