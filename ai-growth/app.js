(function () {
  'use strict';
  const M = window.AIGrowth, state = { ...M.defaults };
  const $ = id => document.getElementById(id);
  const n = (value, places = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: places }).format(Math.abs(value) < 1e-8 ? 0 : value);
  const pct = value => n(value) + '%';
  const signed = value => (value > 0.049 ? '+' : value < -0.049 ? '−' : '') + pct(Math.abs(value) < 0.05 ? 0 : Math.abs(value));
  const pp = value => (value > 0.049 ? '+' : value < -0.049 ? '−' : '') + n(Math.abs(value) < 0.05 ? 0 : Math.abs(value)) + ' pp';
  const text = (id, value) => { $(id).textContent = value; };
  const direction = value => Math.abs(value) < 0.05 ? 'unchanged' : value > 0 ? 'higher' : 'lower';
  const controls = {
    'initial-capital': 'initialCapital', 'final-capital': 'finalCapital', productivity: 'gain',
    'ordinary-growth': 'ordinaryGrowth', 'ai-growth': 'aiGrowth', years: 'years',
    'labor-efficiency': 'laborEfficiency', 'capital-efficiency': 'capitalEfficiency', sigma: 'sigma'
  };
  let announcement;

  function syncControls() {
    // A very small final labor share can require more than the usual slider range.
    $('productivity').max = Math.max(500, Math.ceil(state.gain / 100) * 100);
    for (const [id, key] of Object.entries(controls)) {
      $(id).value = state[key];
      let label = pct(state[key]);
      if (key === 'gain') label = signed(state[key]);
      if (key === 'years') label = n(state[key], 0);
      if (key === 'sigma') label = state[key].toFixed(2);
      if (key.endsWith('Efficiency')) label = state[key].toFixed(2) + '×';
      text(id + '-value', label);
      $(id).setAttribute('aria-valuetext', label);
    }
    text('initial-labor', 'Labor initially receives ' + pct(100 - state.initialCapital) + '.');
    text('final-labor', 'Labor now receives ' + pct(100 - state.finalCapital) + '.');
  }

  function bars(prefix, after) {
    const max = Math.max(100, after.output);
    for (const [id, total, share] of [[prefix + 'before-bar', 100, 1 - state.initialCapital / 100], [prefix + 'after-bar', after.output, after.laborShare]]) {
      const bar = $(id);
      bar.style.width = (100 * total / max) + '%';
      bar.querySelector('.labor-part').style.width = (100 * share) + '%';
      bar.querySelector('.capital-part').style.width = (100 * (1 - share)) + '%';
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', 'Output ' + n(total) + '; labor income ' + n(total * share) + '; capital income ' + n(total * (1 - share)) + '.');
    }
  }

  function table(id, after, averages = false) {
    const initialLabor = 100 - state.initialCapital;
    const rows = [
      ['Total output', '100', n(after.output), signed(after.output - 100)],
      ['Labor income', n(initialLabor), n(after.laborIncome), signed(100 * (after.laborIncome / initialLabor - 1))],
      ['Capital income', n(state.initialCapital), n(after.capitalIncome), signed(100 * (after.capitalIncome / state.initialCapital - 1))],
      ['Labor share', pct(initialLabor), pct(after.laborShare * 100), pp(after.laborShare * 100 - initialLabor)],
      ['Capital share', pct(state.initialCapital), pct(after.capitalShare * 100), pp(after.capitalShare * 100 - state.initialCapital)]
    ];
    if (averages) rows.push(
      ['Output per worker (Y/L)', '1.00', n(after.outputPerWorker, 3), signed(100 * (after.outputPerWorker - 1))],
      ['Output per unit of capital (Y/K)', '1.00', n(after.outputPerCapital, 3), signed(100 * (after.outputPerCapital - 1))],
      ['Real wage / MPL', n(initialLabor / 100, 3), n(after.wage, 3), signed(after.wageIndex - 100)],
      ['Real rental / MPK', n(state.initialCapital / 100, 3), n(after.rent, 3), signed(after.rentIndex - 100)]
    );
    $(id).replaceChildren(...rows.map(row => {
      const tr = document.createElement('tr');
      row.forEach((value, i) => { const cell = document.createElement(i ? 'td' : 'th'); if (!i) cell.scope = 'row'; cell.textContent = value; tr.append(cell); });
      return tr;
    }));
  }

  function graphFrame(width, height, xMin, xMax, yMax, xLabel, yLabel) {
    const left = 66, right = width - 24, top = 30, bottom = height - 58;
    const x = v => left + (v - xMin) / (xMax - xMin) * (right - left);
    const y = v => bottom - v / yMax * (bottom - top);
    const tick = value => new Intl.NumberFormat('en-US', { notation: Math.abs(value) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value);
    const bits = [`<text x="${left}" y="16">${yLabel}</text>`];
    for (let i = 0; i <= 4; i++) {
      const value = yMax * i / 4, yy = y(value);
      bits.push(`<line x1="${left}" x2="${right}" y1="${yy}" y2="${yy}" stroke="#e0e7ec"/><text x="${left - 10}" y="${yy + 5}" text-anchor="end">${tick(value)}</text>`);
      const xv = xMin + (xMax - xMin) * i / 4, xx = x(xv);
      bits.push(`<text x="${xx}" y="${bottom + 24}" text-anchor="middle">${tick(xv)}</text>`);
    }
    bits.push(`<line x1="${left}" x2="${right}" y1="${bottom}" y2="${bottom}" stroke="#8698a6"/><text x="${(left + right) / 2}" y="${height - 8}" text-anchor="middle">${xLabel}</text>`);
    return { x, y, bits, left, right, top, bottom };
  }

  function thresholdChart(result) {
    const min = Math.max(-99, Math.min(-50, result.requiredGain - 10, state.gain - 10));
    const max = Math.max(150, state.gain * 1.15, result.requiredGain * 1.15);
    const wageAt = g => M.accounting(state.initialCapital, state.finalCapital, g).wageIndex;
    const ceiling = Math.max(150, Math.ceil(wageAt(max) / 50) * 50);
    const width = Math.max(500, $('threshold-chart').clientWidth || 700);
    $('threshold-chart').setAttribute('viewBox', `0 0 ${width} 300`);
    const { x, y, bits, left, right, top, bottom } = graphFrame(width, 300, min, max, ceiling, 'Productivity change (%)', 'Worker compensation · before = 100');
    bits.push(`<line x1="${left}" x2="${right}" y1="${y(100)}" y2="${y(100)}" stroke="#647585" stroke-width="2" stroke-dasharray="7 5"/>`);
    bits.push(`<line x1="${x(result.requiredGain)}" x2="${x(result.requiredGain)}" y1="${top}" y2="${bottom}" stroke="#a04b0b" stroke-width="1.5" stroke-dasharray="3 5"/>`);
    bits.push(`<path d="M ${x(min)} ${y(wageAt(min))} L ${x(max)} ${y(wageAt(max))}" fill="none" stroke="#086ac0" stroke-width="3"/>`);
    bits.push(`<circle cx="${x(state.gain)}" cy="${y(result.wageIndex)}" r="6" fill="#a04b0b" stroke="white" stroke-width="2"/>`);
    $('threshold-drawing').innerHTML = bits.join('');
    text('threshold-desc', 'At the chosen income share, productivity must change by ' + signed(result.requiredGain) + ' to preserve compensation. Your scenario changes productivity by ' + signed(state.gain) + ' and worker compensation by ' + signed(result.wageIndex - 100) + '.');
  }

  function renderTime() {
    const result = M.timeSummary(state);
    text('time-today', signed(result.wageIndex - 100));
    text('time-today-note', 'Worker compensation after ' + state.years + (state.years === 1 ? ' year' : ' years'));
    text('time-comparison', signed(result.versusWithoutAI));
    text('time-required', pct(result.requiredGrowth));
    text('time-required-note', 'Per year over ' + state.years + (state.years === 1 ? ' year' : ' years'));
    const compare = value => Math.abs(value) < 0.05 ? 'the same as' : pct(Math.abs(value)) + (value > 0 ? ' higher than' : ' lower than');
    text('time-takeaway', 'At year ' + state.years + ', worker compensation with AI is ' + compare(result.wageIndex - 100) + ' today and ' + compare(result.versusWithoutAI) + ' it would be without AI. The no-AI path reaches an index of ' + n(result.withoutAI) + '; the AI path reaches ' + n(result.wageIndex) + '.');
    const points = Array.from({ length: 121 }, (_, i) => M.timePoint(state, state.years * i / 120));
    const max = Math.max(125, ...points.flatMap(p => [p.wageIndex, p.withoutAI]));
    const width = Math.max(500, $('time-chart').clientWidth || 900);
    $('time-chart').setAttribute('viewBox', `0 0 ${width} 340`);
    const { x, y, bits, left, right } = graphFrame(width, 340, 0, state.years, max * 1.08, 'Years from now', 'Worker compensation · today = 100');
    const path = key => points.map((p, i) => (i ? 'L' : 'M') + ' ' + x(p.t) + ' ' + y(p[key])).join(' ');
    bits.push(`<line x1="${left}" x2="${right}" y1="${y(100)}" y2="${y(100)}" stroke="#a04b0b" stroke-width="1.5" stroke-dasharray="2 4"/>`);
    bits.push(`<path d="${path('withoutAI')}" stroke="#647585" stroke-width="2.5" stroke-dasharray="7 5" fill="none"/><path d="${path('wageIndex')}" stroke="#086ac0" stroke-width="3" fill="none"/>`);
    $('time-drawing').innerHTML = bits.join('');
    text('time-desc', $('time-takeaway').textContent + ' The horizontal dotted line marks today’s compensation.');
  }

  function renderCES() {
    const result = M.ces(state), shareChange = result.capitalShare * 100 - state.initialCapital;
    text('ces-wage', signed(result.wageIndex - 100));
    text('ces-rent', signed(result.rentIndex - 100));
    text('ces-output', n(result.output));
    text('ces-total', n(result.output));
    let explanation;
    if (Math.abs(state.sigma - 1) < 1e-8) {
      text('sigma-note', 'σ = 1: the Cobb–Douglas case. Income shares stay fixed.');
      explanation = 'At σ = 1, technology changes output and payments but leaves income shares unchanged.';
    } else {
      text('sigma-note', state.sigma > 1 ? 'σ > 1: inputs substitute more readily than in Cobb–Douglas.' : 'σ < 1: inputs are stronger complements than in Cobb–Douglas.');
      if (Math.abs(state.laborEfficiency - state.capitalEfficiency) < 1e-8) explanation = 'Equal proportional efficiency gains keep the income shares unchanged, whatever the substitution setting.';
      else if (state.sigma > 1) explanation = 'With σ > 1 and physical inputs fixed, the factor with the larger efficiency gain receives a larger income share.';
      else explanation = 'With σ < 1 and physical inputs fixed, the factor with the larger efficiency gain receives a smaller income share: the less-improved input becomes relatively scarce.';
    }
    const shareText = Math.abs(shareChange) < 0.05 ? 'Capital’s share stays at ' : 'Capital’s share moves from ' + pct(state.initialCapital) + ' to ';
    text('ces-takeaway', shareText + pct(result.capitalShare * 100) + '. ' + explanation + ' Worker compensation is ' + direction(result.wageIndex - 100) + '; capital rental income per unit is ' + direction(result.rentIndex - 100) + '.');
    bars('ces-', result);
    table('ces-table', result, true);
  }

  function render(announce = false) {
    syncControls();
    const result = M.accounting(state.initialCapital, state.finalCapital, state.gain), change = result.wageIndex - 100;
    text('wage-change', signed(change)); text('rent-change', signed(result.rentIndex - 100));
    text('output-value', n(result.output)); text('after-total', n(result.output)); text('threshold', signed(result.requiredGain));
    const same = Math.abs(change) < 0.05;
    const takeaway = same ? 'Workers just break even.' : 'Worker compensation is ' + pct(Math.abs(change)) + (change > 0 ? ' higher.' : ' lower.');
    text('takeaway', takeaway);
    $('verdict').dataset.direction = change < -0.05 ? 'negative' : 'positive';
    const labor0 = 100 - state.initialCapital, labor1 = 100 - state.finalCapital;
    text('explanation', 'Labor receives ' + pct(labor1) + ' of ' + n(result.output) + ' units of output, or ' + n(result.laborIncome) + ' units of income. Before, it received ' + pct(labor0) + ' of 100, or ' + n(labor0) + '. ' + (same ? 'The change in productivity exactly offsets the change in labor’s share.' : 'The productivity change needed to preserve the original compensation is ' + signed(result.requiredGain) + '.'));
    bars('', result); table('income-table', result); thresholdChart(result); renderTime(); renderCES();
    if (announce) { clearTimeout(announcement); announcement = setTimeout(() => { text('live-summary', takeaway + ' Capital rental income changes by ' + signed(result.rentIndex - 100) + '.'); }, 220); }
  }

  for (const [id, key] of Object.entries(controls)) $(id).addEventListener('input', event => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    state[key] = Math.min(Number(event.target.max), Math.max(Number(event.target.min), value));
    render(false);
    clearTimeout(announcement);
    const summaryId = ['laborEfficiency', 'capitalEfficiency', 'sigma'].includes(key) ? 'ces-takeaway' : ['ordinaryGrowth', 'aiGrowth', 'years'].includes(key) ? 'time-takeaway' : 'explanation';
    announcement = setTimeout(() => text('live-summary', $(summaryId).textContent), 220);
  });
  $('break-even').addEventListener('click', () => { state.gain = M.accounting(state.initialCapital, state.finalCapital, state.gain).requiredGain; render(true); });
  document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    const example = button.dataset.example;
    if (example === 'reset') Object.assign(state, M.defaults);
    else Object.assign(state, { initialCapital: 40, finalCapital: example === 'shared' ? 40 : 60, gain: example === 'modest' ? 20 : 100 });
    render(true);
  }));
  const cesExamples = {
    equal: { laborEfficiency: 2, capitalEfficiency: 2, sigma: 2 },
    capital: { laborEfficiency: 1.5, capitalEfficiency: 4, sigma: 2 },
    complements: { laborEfficiency: 1.5, capitalEfficiency: 4, sigma: 0.5 },
    cobb: { laborEfficiency: 1.5, capitalEfficiency: 4, sigma: 1 },
    reset: { laborEfficiency: 1, capitalEfficiency: 1, sigma: 1 }
  };
  document.querySelectorAll('[data-ces]').forEach(button => button.addEventListener('click', () => { Object.assign(state, cesExamples[button.dataset.ces]); render(); text('live-summary', $('ces-takeaway').textContent); }));
  $('time-view').addEventListener('toggle', () => { if ($('time-view').open) renderTime(); });
  let resizing;
  window.addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(() => render(), 100); });
  render();
})();
