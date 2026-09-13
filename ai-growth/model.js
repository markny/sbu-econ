/* Pure accounting and normalized CES models. All quantities and incomes are real. */
(function (root) {
  'use strict';
  const defaults = Object.freeze({ initialCapital: 40, finalCapital: 60, gain: 50, years: 10, ordinaryGrowth: 2, aiGrowth: 6, laborEfficiency: 1.5, capitalEfficiency: 4, sigma: 2 });
  function finite(x, name) {
    if (!Number.isFinite(x)) throw new RangeError(name + ' must be finite');
  }
  function share(x) {
    finite(x, 'Capital share');
    if (x <= 0 || x >= 100) throw new RangeError('Capital share must be between 0 and 100');
    return x / 100;
  }
  function accounting(initialCapital, finalCapital, gain) {
    const a0 = share(initialCapital), a1 = share(finalCapital);
    finite(gain, 'Productivity change');
    if (gain <= -100) throw new RangeError('Output must remain positive');
    const output = 100 * (1 + gain / 100);
    return { output, laborIncome: (1 - a1) * output, capitalIncome: a1 * output,
      laborShare: 1 - a1, capitalShare: a1,
      wageIndex: (1 - a1) / (1 - a0) * output, rentIndex: a1 / a0 * output,
      requiredGain: 100 * ((1 - a0) / (1 - a1) - 1) };
  }
  function timePoint(s, t) {
    share(s.initialCapital); share(s.finalCapital);
    for (const key of ['years', 'ordinaryGrowth', 'aiGrowth']) finite(s[key], key);
    finite(t, 'Time');
    if (s.years <= 0 || t < 0 || t > s.years || s.aiGrowth <= -100 || s.ordinaryGrowth <= -100) throw new RangeError('Invalid time path');
    const laborShare = 1 - (s.initialCapital + (s.finalCapital - s.initialCapital) * t / s.years) / 100;
    const initialLabor = 1 - s.initialCapital / 100;
    const output = 100 * Math.pow(1 + s.aiGrowth / 100, t);
    const withoutAI = 100 * Math.pow(1 + s.ordinaryGrowth / 100, t);
    return { t, output, laborShare, wageIndex: laborShare / initialLabor * output, withoutAI };
  }
  function timeSummary(s) {
    const end = timePoint(s, s.years);
    const ratio = (1 - s.initialCapital / 100) / (1 - s.finalCapital / 100);
    return { ...end, versusWithoutAI: 100 * (end.wageIndex / end.withoutAI - 1),
      requiredGrowth: 100 * ((1 + s.ordinaryGrowth / 100) * Math.pow(ratio, 1 / s.years) - 1) };
  }
  function ces({ initialCapital = 40, laborEfficiency = 1, capitalEfficiency = 1, sigma = 1, K = 100, L = 100 } = {}) {
    const a = share(initialCapital);
    for (const [name, value] of Object.entries({ laborEfficiency, capitalEfficiency, sigma, K, L })) {
      finite(value, name);
      if (value <= 0) throw new RangeError(name + ' must be positive');
    }
    const rho = (sigma - 1) / sigma;
    const logK = Math.log(capitalEfficiency * K / 100), logL = Math.log(laborEfficiency * L / 100);
    let logOutput, capitalShare;
    if (Math.abs(rho) < 1e-7) {
      // The continuous Cobb–Douglas limit avoids dividing by zero at sigma = 1.
      logOutput = a * logK + (1 - a) * logL;
      capitalShare = a;
    } else {
      const k = rho * logK, l = rho * logL, center = Math.max(k, l);
      const kTerm = a * Math.exp(k - center), lTerm = (1 - a) * Math.exp(l - center);
      logOutput = (center + Math.log(kTerm + lTerm)) / rho;
      capitalShare = kTerm / (kTerm + lTerm);
    }
    const output = 100 * Math.exp(logOutput), laborShare = 1 - capitalShare;
    const wage = laborShare * output / L, rent = capitalShare * output / K;
    return { output, capitalShare, laborShare, wage, rent,
      laborIncome: wage * L, capitalIncome: rent * K,
      wageIndex: wage / (1 - a) * 100, rentIndex: rent / a * 100,
      outputPerWorker: output / L, outputPerCapital: output / K };
  }
  const api = Object.freeze({ defaults, accounting, timePoint, timeSummary, ces });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AIGrowth = api;
})(globalThis);
