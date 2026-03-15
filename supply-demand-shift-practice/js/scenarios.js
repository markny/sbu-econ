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

export function createOneEventProblem() {
  const market = sample(MARKETS);
  const type = Math.random() < 0.5 ? "demand" : "supply";
  const base = type === "demand" ? sample(DEMAND_EVENTS) : sample(SUPPLY_EVENTS);

  return {
    mode: "one",
    market,
    event: instantiateEvent(base, market)
  };
}

export function createTwoEventProblem() {
  const market = sample(MARKETS);
  const demandEvent = instantiateEvent(sample(DEMAND_EVENTS), market);
  const supplyEvent = instantiateEvent(sample(SUPPLY_EVENTS), market);

  return {
    mode: "two",
    market,
    demandEvent,
    supplyEvent
  };
}

export function createOneEventProblemLike(problem) {
  const market = sample(MARKETS);
  const sourceEvent = problem?.event;
  const base = sourceEvent
    ? (sourceEvent.affectedCurve === "demand"
        ? sampleFiltered(DEMAND_EVENTS, (item) => item.category === sourceEvent.category)
        : sampleFiltered(SUPPLY_EVENTS, (item) => item.category === sourceEvent.category))
    : (Math.random() < 0.5 ? sample(DEMAND_EVENTS) : sample(SUPPLY_EVENTS));

  return {
    mode: "one",
    market,
    event: instantiateEvent(base, market)
  };
}

export function createTwoEventProblemLike(problem) {
  const market = sample(MARKETS);
  const demandBase = problem?.demandEvent
    ? sampleFiltered(DEMAND_EVENTS, (item) => item.category === problem.demandEvent.category)
    : sample(DEMAND_EVENTS);
  const supplyBase = problem?.supplyEvent
    ? sampleFiltered(SUPPLY_EVENTS, (item) => item.category === problem.supplyEvent.category)
    : sample(SUPPLY_EVENTS);

  return {
    mode: "two",
    market,
    demandEvent: instantiateEvent(demandBase, market),
    supplyEvent: instantiateEvent(supplyBase, market)
  };
}

export function countQuestionVariations() {
  const totalDemand = DEMAND_EVENTS.reduce(
    (sum, event) => sum + event.alternatePrompts.length * MARKETS.length,
    0
  );
  const totalSupply = SUPPLY_EVENTS.reduce(
    (sum, event) => sum + event.alternatePrompts.length * MARKETS.length,
    0
  );

  return {
    total: totalDemand + totalSupply,
    demand: totalDemand,
    supply: totalSupply
  };
}
