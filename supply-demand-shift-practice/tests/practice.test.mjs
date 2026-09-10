import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
import { applyCourseContext } from '../js/course-context.js';
import {
  createOneEventProblem, createTwoEventProblem,
  createOneEventProblemLike, createTwoEventProblemLike,
  countQuestionVariations, eligibleMarkets,
} from '../js/scenarios.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

// A lightweight document double exercises the real entry module without a
// browser dependency. It is not a substitute for visual or accessibility QA.
function documentDouble() {
  function element() {
    const node = {
      className: '', children: [], listeners: {}, hidden: false,
      textContent: '', value: '', href: '', markup: '',
      append(...children) { this.children.push(...children); },
      addEventListener(name, handler) { this.listeners[name] = handler; },
      get innerHTML() { return this.markup; },
      set innerHTML(value) { this.markup = value; this.children = []; },
    };
    node.classList = {
      contains(value) { return node.className.split(' ').includes(value); },
      add(value) { if (!this.contains(value)) node.className += ` ${value}`; },
      remove(value) { node.className = node.className.split(' ').filter(v => v !== value).join(' '); },
      toggle(value) { this.contains(value) ? this.remove(value) : this.add(value); },
    };
    return node;
  }
  const nodes = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(match => [match[1], element()]));
  nodes.courseBackLink.href = '../micro/';
  nodes.courseBackLink.textContent = 'Back to Microeconomics';
  nodes.courseNote.hidden = true;
  nodes.modeSelect.value = 'one';
  nodes.studyPanel.className = 'card hidden';
  return { nodes, getElementById: id => nodes[id], createElement: element };
}

test('Sports navigation is opt-in; default, Micro, and unknown parameters stay Micro', () => {
  for (const search of ['', '?course=micro', '?course=unknown', '?return=https://example.com', '?course=https://example.com']) {
    const document = documentDouble();
    applyCourseContext(search, document);
    assert.equal(document.nodes.courseBackLink.href, '../micro/');
    assert.equal(document.nodes.courseBackLink.textContent, 'Back to Microeconomics');
    assert.equal(document.nodes.courseNote.hidden, true);
  }
  const document = documentDouble();
  applyCourseContext('?course=sports-econ', document);
  assert.equal(document.nodes.courseBackLink.href, '../sports-econ/');
  assert.equal(document.nodes.courseBackLink.textContent, 'Back to Sports Economics');
  assert.equal(document.nodes.courseNote.hidden, false);
  assert.match(document.nodes.courseNote.textContent, /Chapter 2/);
  assert.match(document.nodes.courseNote.textContent, /No calculations/);
  // A later visit without the query has no stored course preference.
  assert.equal(documentDouble().nodes.courseBackLink.href, '../micro/');
});

function eventKey(event) { return event.id.replace(/-[^-]*$/, ''); }
function checkEvent(event, market) {
  assert.equal(event.market, market);
  assert.ok(eligibleMarkets(event).includes(market), `${event.id}: ${market}`);
  for (const text of [event.prompt, event.explanation, ...event.alternatePrompts]) {
    assert.doesNotMatch(text, /\{market\}|undefined/);
  }
  if (event.category === 'weather or production shocks') {
    assert.ok(['coffee beans', 'wheat', 'rice'].includes(market));
  }
  if (event.category === 'expectations of future prices') {
    assert.ok(!['apartments', 'movie tickets', 'ice cream', 'orange juice'].includes(market));
  }
  if (event.category === 'income for an inferior good') assert.equal(market, 'rice');
  const right = event.shiftDirection === 'right';
  assert.equal(event.quantityEffect, right ? 'increase' : 'decrease');
  assert.equal(event.priceEffect, (event.affectedCurve === 'demand') === right ? 'increase' : 'decrease');
}

test('ordinary and similar-question generators keep every event compatible', () => {
  const random = Math.random;
  let seed = 20260910;
  Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  const events = new Map();
  const pairs = new Set();
  try {
    for (let i = 0; i < 10000; i++) {
      const one = createOneEventProblem();
      const similarOne = createOneEventProblemLike(one);
      assert.equal(similarOne.event.category, one.event.category);
      assert.equal(similarOne.event.affectedCurve, one.event.affectedCurve);
      for (const problem of [one, similarOne]) {
        checkEvent(problem.event, problem.market);
        events.set(eventKey(problem.event), problem.event);
      }
      const two = createTwoEventProblem();
      const similarTwo = createTwoEventProblemLike(two);
      assert.equal(similarTwo.demandEvent.category, two.demandEvent.category);
      assert.equal(similarTwo.supplyEvent.category, two.supplyEvent.category);
      for (const problem of [two, similarTwo]) {
        checkEvent(problem.demandEvent, problem.market);
        checkEvent(problem.supplyEvent, problem.market);
        events.set(eventKey(problem.demandEvent), problem.demandEvent);
        events.set(eventKey(problem.supplyEvent), problem.supplyEvent);
        pairs.add(`${eventKey(problem.demandEvent)}|${eventKey(problem.supplyEvent)}`);
      }
    }
  } finally { Math.random = random; }
  assert.equal(events.size, 28, 'all original event directions remain available');
  assert.equal(pairs.size, 16 * 12, 'every demand/supply pair has a compatible market');
  const counts = countQuestionVariations();
  assert.equal(counts.total, [...events.values()].reduce((sum, event) => sum + event.alternatePrompts.length * eligibleMarkets(event).length, 0));
  assert.equal(counts.total, counts.demand + counts.supply);
});

for (const course of ['micro', 'sports-econ']) {
  test(`real app entry initializes, checks answers, and resets for ${course}`, async () => {
    const document = documentDouble();
    const { nodes } = document;
    const previous = { document: globalThis.document, window: globalThis.window, FormData: globalThis.FormData, random: Math.random };
    let submitted = {};
    globalThis.document = document;
    globalThis.window = { location: { search: course === 'micro' ? '' : '?course=sports-econ' } };
    globalThis.FormData = class { entries() { return Object.entries(submitted); } };
    Math.random = () => 0;
    try {
      await import(`../js/main.js?test=${course}`);
      assert.equal(nodes.inputsContainer.children[0].children.length, 4);
      assert.equal(nodes.courseBackLink.href, course === 'micro' ? '../micro/' : '../sports-econ/');
      nodes.newProblemBtn.listeners.click();
      assert.match(nodes.problemLead.textContent, /Market: coffee beans/);
      assert.equal(nodes.scenarioPanel.children.length, 1);
      submitted = { curve: 'demand', shift: 'right', price: 'increase', quantity: 'increase' };
      nodes.answerForm.listeners.submit({ preventDefault() {} });
      assert.match(nodes.feedbackPanel.innerHTML, /Every prediction is correct/);
      assert.equal(nodes.diagramArea.children.length, 1);
      assert.match(nodes.diagramArea.children[0].innerHTML, /demand_increase.svg/);
      nodes.whyToggleBtn.listeners.click();
      assert.ok(nodes.whyPanel.innerHTML.length > 0);
      nodes.similarProblemBtn.listeners.click();
      assert.ok(nodes.answerSection.classList.contains('hidden'));
      nodes.studyToggleBtn.listeners.click();
      assert.ok(!nodes.studyPanel.classList.contains('hidden'));
      nodes.modeSelect.value = 'two';
      nodes.modeSelect.listeners.change();
      assert.equal(nodes.inputsContainer.children[0].children.length, 2);
      nodes.newProblemBtn.listeners.click();
      submitted = { combinedPrice: 'increase', combinedQuantity: 'ambiguous' };
      nodes.answerForm.listeners.submit({ preventDefault() {} });
      assert.match(nodes.feedbackPanel.innerHTML, /Every prediction is correct/);
      assert.equal(nodes.diagramArea.children.length, 2);
      nodes.similarProblemBtn.listeners.click();
      nodes.showAnswerBtn.listeners.click();
      assert.match(nodes.answerContent.innerHTML, /Ambiguous/);
      nodes.resetBtn.listeners.click();
      assert.match(nodes.scenarioPanel.innerHTML, /Your scenario will appear here/);
      assert.equal(nodes.courseBackLink.href, course === 'micro' ? '../micro/' : '../sports-econ/');
    } finally {
      globalThis.document = previous.document;
      globalThis.window = previous.window;
      globalThis.FormData = previous.FormData;
      Math.random = previous.random;
    }
  });
}

test('entrypoint, imports, styles, and all diagram assets exist', async () => {
  assert.match(html, /<script type="module" src="\.\/js\/main.js"><\/script>/);
  const main = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.match(main, /from "\.\/scenarios.js"/);
  assert.doesNotMatch(main, /const DEMAND_EVENTS|const SUPPLY_EVENTS/);
  for (const match of [...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g), ...main.matchAll(/src: "(\.\/[^"?#]+)"/g)]) {
    await access(new URL(`../${match[1]}`, import.meta.url));
  }
});
