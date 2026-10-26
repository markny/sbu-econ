(function (root) {
  'use strict';
  function validate(p) {
    for (const name of ['s', 'delta', 'alpha']) if (!Number.isFinite(p[name])) throw new Error('Invalid ' + name);
    if (p.s < 0 || p.s > 1 || p.delta <= 0 || p.delta >= 1 || p.alpha <= 0 || p.alpha >= 1) throw new Error('Parameters outside model range');
    for (const name of ['n', 'g']) if (p[name] !== undefined && (!Number.isFinite(p[name]) || p[name] < 0)) throw new Error('Invalid ' + name);
  }
  const output = (k, alpha) => Math.pow(k, alpha);
  function steady(p) {
    validate(p);
    const b = p.delta + (p.n || 0) + (p.g || 0);
    const k = p.s === 0 ? 0 : Math.pow(p.s / b, 1 / (1 - p.alpha));
    const y = output(k, p.alpha), i = p.s * y;
    return { k, y, c: (1 - p.s) * y, i, depreciation: p.delta * k, breakEven: b * k, b };
  }
  function row(k, p, t, s = p.s) {
    const y = output(k, p.alpha), i = s * y, c = (1 - s) * y;
    const depreciation = p.delta * k, dilution = (p.n || 0) * k, efficiency = (p.g || 0) * k;
    const breakEven = depreciation + dilution + efficiency;
    const dk = i - breakEven;
    return { t, year: t + 1, k, y, i, c, s, depreciation, dilution, efficiency, breakEven, dk, nextK: Math.max(0, k + dk) };
  }
  // Chapter 8 follows the annual recurrence used in slide 27, without rounding intermediate values.
  function simulate(p, periods = 100) {
    validate(p);
    if (!Number.isFinite(p.k0) || p.k0 < 0) throw new Error('Invalid initial capital');
    if (!Number.isInteger(periods) || periods < 1 || periods > 1000) throw new Error('Invalid horizon');
    let k = p.k0;
    const rows = [];
    for (let t = 0; t <= periods; t++) { const r = row(k, p, t); rows.push(r); k = r.nextK; }
    return rows;
  }
  function golden(p) {
    validate(p);
    const b = p.delta + (p.n || 0) + (p.g || 0);
    const k = Math.pow(p.alpha / b, 1 / (1 - p.alpha));
    const y = output(k, p.alpha);
    return { k, y, c: y - b * k, s: p.alpha, mpk: p.alpha * Math.pow(k, p.alpha - 1), b };
  }
  function transition(p, targetS, event = 20, periods = 100) {
    if (targetS < 0 || targetS > 1 || !Number.isFinite(targetS)) throw new Error('Invalid target saving');
    const initial = steady(p);
    let k = initial.k;
    const rows = [];
    for (let t = 0; t <= periods; t++) {
      const r = row(k, p, t, t >= event ? targetS : p.s);
      rows.push(r); k = r.nextK;
    }
    return { initial, final: steady({ ...p, s: targetS }), rows, event };
  }
  // Chapter 9: continuous-time Mankiw equation, sampled at yearly dates.
  // Cobb–Douglas has a closed-form solution: u = k^(1-alpha), du/dt=(1-alpha)(s-bu).
  // This keeps the capital law and balanced-growth rates mutually consistent.
  function extended(p, periods = 100) {
    validate(p);
    if (!Number.isFinite(p.k0) || p.k0 < 0) throw new Error('Invalid initial capital');
    const b = p.delta + (p.n || 0) + (p.g || 0), power = 1 - p.alpha;
    const u0 = Math.pow(p.k0, power), uStar = p.s / b;
    const rows = [];
    for (let t = 0; t <= periods; t++) {
      const u = uStar + (u0 - uStar) * Math.exp(-power * b * t);
      const k = Math.pow(Math.max(0, u), 1 / power);
      const r = row(k, p, t), E = Math.exp((p.g || 0) * t), L = 100 * Math.exp((p.n || 0) * t);
      const workerY = r.y * E, totalY = workerY * L, K = k * E * L;
      rows.push({ ...r, E, L, workerY, totalY, K, workerGrowth: p.alpha * r.dk / (k || 1) + (p.g || 0) });
    }
    return rows;
  }
  function accounting({ outputGrowth, capitalGrowth, laborGrowth, alpha }) {
    for (const v of [outputGrowth, capitalGrowth, laborGrowth, alpha]) if (!Number.isFinite(v)) throw new Error('Invalid growth input');
    if (alpha <= 0 || alpha >= 1) throw new Error('Invalid capital share');
    const capital = alpha * capitalGrowth, labor = (1 - alpha) * laborGrowth;
    return { capital, labor, residual: outputGrowth - capital - labor, total: outputGrowth };
  }
  const api = { output, steady, row, simulate, golden, transition, extended, accounting };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Solow = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
