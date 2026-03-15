const ONE_EVENT_DIAGRAMS = {
  "demand-right": {
    src: "./assets/diagrams/demand_increase.svg",
    title: "Demand Increase",
    description: "Demand shifts right from D0 to D1. Equilibrium price and quantity both rise."
  },
  "demand-left": {
    src: "./assets/diagrams/demand_decrease.svg",
    title: "Demand Decrease",
    description: "Demand shifts left from D0 to D1. Equilibrium price and quantity both fall."
  },
  "supply-right": {
    src: "./assets/diagrams/supply_increase.svg",
    title: "Supply Increase",
    description: "Supply shifts right from S0 to S1. Equilibrium price falls and quantity rises."
  },
  "supply-left": {
    src: "./assets/diagrams/supply_decrease.svg",
    title: "Supply Decrease",
    description: "Supply shifts left from S0 to S1. Equilibrium price rises and quantity falls."
  }
};

export function getOneEventDiagram(key) {
  return ONE_EVENT_DIAGRAMS[key];
}

export function getTwoEventDiagrams(problem) {
  return [
    getOneEventDiagram(`demand-${problem.demandEvent.shiftDirection}`),
    getOneEventDiagram(`supply-${problem.supplyEvent.shiftDirection}`)
  ];
}
