/* Self-contained, browser-local teaching interface. No external dependencies. */
(function () {
  'use strict';
  const M = window.Solow;
  const $ = id => document.getElementById(id);
  const text = (id, value) => { $(id).textContent = value; };
  const html = (id, value) => { $(id).innerHTML = value; };
  const fmt = (x, places = 3) => Number.isFinite(x) ? x.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places }) : '—';
  const short = x => Math.abs(x) >= 10000 ? (x / 1000).toFixed(0) + 'k' : Number(x.toPrecision(3)).toLocaleString('en-US');
  const pct = (x, places = 1) => Number(x.toFixed(places)).toLocaleString('en-US') + '%';
  const signed = (x, places = 3) => (x > 1e-10 ? '+' : '') + fmt(Math.abs(x) < 1e-10 ? 0 : x, places);
  const colors = { teal: '#087e79', blue: '#386aa5', rust: '#b25a36', gold: '#9b751c', gray: '#78858c', ink: '#17313b' };
  const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  let timer = null;
  const core = { s: .3, delta: .1, alpha: .5, k0: 4, time: 0, view: 'accumulation', series: 'output', all: false, scenario: 'slides' };
  const saving = { initial: .3, target: .5 };
  const tech = { s: .3, n: .01, g: .02, balanced: true };
  const account = { outputGrowth: 3, capitalGrowth: 4, laborGrowth: 1, alpha: .3 };
  let coreRows = [], activePanel = 'capital';
  function announce(s) { text('live-status', s); }
  function stop() { if (timer) clearInterval(timer); timer = null; text('core-play', 'Play'); $('core-play').setAttribute('aria-pressed', 'false'); }
  function activate(name, focus = false) {
    if (!['capital', 'saving', 'technology', 'accounting', 'study'].includes(name)) name = 'capital';
    stop(); activePanel = name;
    document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== 'panel-' + name; });
    document.querySelectorAll('[data-panel]').forEach(b => { if (b.dataset.panel === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    if(name==='capital') renderCore(); else if(name==='saving') renderSaving(); else if(name==='technology') renderTech(); else if(name==='accounting') renderAccount();
    if (focus) $('workspace').focus({ preventScroll: true });
  }
  function legend(items) { return items.map(([name, color, type = 'line']) => `<span><i class="${type} ${color}"></i>${name}</span>`).join(''); }
  function chartWidth(id,h) { const svg=$(id).closest('svg');const w=Math.max(310,Math.round(svg.getBoundingClientRect().width)||900);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);return w; }
  function ticks(max, count = 4) { return Array.from({ length: count + 1 }, (_, i) => max * i / count); }
  function frame({ w = 900, h = 360, xMax, yMax, yMin = 0, xLabel = '', yLabel = '', xTicks, yFormat = short, xFormat = short, left = 58, right = 25, top = 32, bottom = 46 }) {
    if (!(xMax > 0)) xMax = 1;
    if (!(yMax > yMin)) yMax = yMin + 1;
    const X = x => left + x / xMax * (w - left - right);
    const Y = y => h - bottom - (y - yMin) / (yMax - yMin) * (h - bottom - top);
    let svg = '';
    for (const y of ticks(yMax - yMin).map(d => d + yMin)) svg += `<line class="grid" x1="${left}" y1="${Y(y)}" x2="${w - right}" y2="${Y(y)}"/><text class="tick-text" x="${left - 9}" y="${Y(y) + 4}" text-anchor="end">${esc(yFormat(y))}</text>`;
    for (const x of xTicks || ticks(xMax)) svg += `<text class="tick-text" x="${X(x)}" y="${h - bottom + 21}" text-anchor="middle">${esc(xFormat(x))}</text>`;
    svg += `<line class="axis" x1="${left}" y1="${h - bottom}" x2="${w - right}" y2="${h - bottom}"/><text x="${left}" y="16">${esc(yLabel)}</text><text x="${w - right}" y="${h - 5}" text-anchor="end">${esc(xLabel)}</text>`;
    return { svg, X, Y, xMax, yMax, yMin, w, h, left, right, top, bottom };
  }
  function path(points, f, color, dashed = false, width = 2.7) {
    return `<path class="chart-line" d="${points.map(([x, y], i) => `${i ? 'L' : 'M'}${f.X(x).toFixed(2)},${f.Y(y).toFixed(2)}`).join(' ')}" stroke="${color}"${dashed ? ' stroke-dasharray="7 6"' : ''} style="stroke-width:${width}"/>`;
  }
  function dot(x, y, f, color, r = 4.5) { return `<circle cx="${f.X(x)}" cy="${f.Y(y)}" r="${r}" fill="${color}" stroke="${color === colors.ink ? '#fffefa' : 'white'}" stroke-width="1.5"/>`; }
  function cursor(t, f) { return `<line x1="${f.X(t)}" x2="${f.X(t)}" y1="${f.top}" y2="${f.h - f.bottom}" stroke="${colors.gray}" stroke-dasharray="3 5"/>`; }
  function solowDiagram(id, p, k, opts = {}) {
    const ss = M.steady(p), gr = opts.golden ? M.golden(p) : null;
    const xMax = Math.max(ss.k * 1.55, k * 1.25, gr ? gr.k * 1.7 : 0, 1);
    const b = p.delta + (p.n || 0) + (p.g || 0);
    const allocation = opts.allocation;
    const yMax = Math.max(b * xMax, (allocation || gr ? 1 : p.s) * M.output(xMax, p.alpha), .1) * 1.12;
    const h=opts.h||360,w=chartWidth(id,h);
    const f = frame({ w, xMax, yMax, h, xLabel: opts.xLabel || 'Capital per worker, k', yLabel: allocation || gr ? 'Output and investment per worker' : opts.yLabel || 'Investment and depreciation per worker' });
    let svg = f.svg;
    const xs = Array.from({ length: 181 }, (_, j) => xMax * j / 180);
    if (allocation || gr) svg += path(xs.map(x => [x, M.output(x, p.alpha)]), f, colors.blue);
    if (!gr) svg += path(xs.map(x => [x, p.s * M.output(x, p.alpha)]), f, colors.teal);
    svg += path([[0, 0], [xMax, b * xMax]], f, colors.rust);
    if (opts.noTech) svg += path([[0, 0], [xMax, (p.delta + p.n) * xMax]], f, colors.gray, true);
    const star = gr ? gr.k : ss.k;
    svg += `<line x1="${f.X(star)}" x2="${f.X(star)}" y1="${f.h - f.bottom}" y2="${f.top+48}" stroke="${colors.gray}" stroke-dasharray="3 5"/>`;
    svg += `<text class="annotation" x="${Math.min(f.w-f.right-108,Math.max(f.left+5,f.X(star)+8))}" y="${f.top+36}">${gr ? 'k*gold' : 'k*'} = ${short(star)}</text>`;
    svg += dot(star, b * star, f, colors.ink);
    if (gr) {
      svg += `<line x1="${f.X(star)}" x2="${f.X(star)}" y1="${f.Y(b * star)}" y2="${f.Y(gr.y)}" stroke="${colors.gold}" stroke-width="5"/>`;
      const xa = star * .45, xb = star * 1.55;
      svg += path([[xa, gr.y + b * (xa - star)], [xb, gr.y + b * (xb - star)]], f, colors.gold, true, 1.5);
      svg += `<text class="annotation" x="${f.X(star) + 12}" y="${f.Y((gr.y + b * star) / 2)}">c*gold = ${fmt(gr.c, 2)}</text>`;
    } else {
      const r = M.row(k, p, 0), upper = allocation ? r.y : r.i, lower = allocation ? r.i : r.breakEven;
      svg += `<line x1="${f.X(k)}" x2="${f.X(k)}" y1="${f.top}" y2="${f.h - f.bottom}" stroke="${colors.ink}" stroke-opacity=".25" stroke-dasharray="2 5"/>`;
      if(!opts.noTech) svg += `<text class="annotation" x="${Math.min(f.w-145,Math.max(f.left+5,f.X(k)+9))}" y="${f.top+14}">Selected k = ${short(k)}</text>`;
      svg += `<line x1="${f.X(k)}" x2="${f.X(k)}" y1="${f.Y(upper)}" y2="${f.Y(lower)}" stroke="${colors.gold}" stroke-width="5"/>`;
      svg += dot(k, upper, f, allocation ? colors.blue : colors.teal) + dot(k, lower, f, allocation ? colors.teal : colors.rust);
    }
    html(id, svg);
  }
  function timeChart(id, series, opts = {}) {
    const vals = series.flatMap(s => s.points.map(p => p[1])).filter(Number.isFinite);
    const min = opts.allowNegative ? Math.min(0, ...vals) : 0;
    const max = Math.max(...vals, opts.minMax || (opts.percent ? 1 : .01));
    const range = Math.max(max - min, .01);
    const h=opts.h||300,w=chartWidth(id,h);
    const f = frame({ w, h, xMax: opts.periods || 100, yMax: max + range * .12, yMin: min < 0 ? min - range * .12 : 0, xLabel: 'Year', yLabel: opts.yLabel || '', yFormat: opts.percent ? v => pct(v) : short, xFormat: v => String(v + 1), left: w < 500 ? 48 : 58 });
    let svg = f.svg;
    if (min < 0) svg += `<line x1="${f.left}" x2="${f.w - f.right}" y1="${f.Y(0)}" y2="${f.Y(0)}" stroke="${colors.gray}" stroke-dasharray="3 5"/>`;
    if (opts.event !== undefined) {
      svg += cursor(opts.event, f);
      svg += `<text class="annotation" x="${f.X(opts.event) + 7}" y="${f.top + 3}">s changes</text>`;
    }
    if (opts.selected !== undefined) svg += cursor(opts.selected, f);
    for (const s of series) {
      svg += path(s.points, f, s.color, s.dashed);
      if (opts.selected !== undefined) { const point = s.points.find(p => p[0] === opts.selected); if (point) svg += dot(point[0], point[1], f, s.color); }
    }
    html(id, svg);
  }
  function setCoreInputs() {
    $('core-s').value = core.s * 100; $('core-delta').value = core.delta * 100; $('core-k').value = core.k0; $('core-alpha').value = core.alpha;
  }
  function coreScenario(name) {
    stop(); Object.assign(core, { s: .3, delta: .1, alpha: .5, time: 0, k0: name === 'above' ? 16 : name === 'steady' ? 9 : name === 'loss' ? 4.5 : 4, scenario: name });
    setCoreInputs(); text('cell-explanation', 'Select any number in the table.'); renderCore();
  }
  function renderCore() {
    coreRows = M.simulate(core); const r = coreRows[core.time], ss = M.steady(core);
    $('core-time').value = core.time;
    text('core-year', r.year); text('core-time-value', r.year);
    text('core-s-value', pct(core.s * 100, 0)); text('core-delta-value', pct(core.delta * 100, 0)); text('core-k-value', fmt(core.k0, 2)); text('core-alpha-value', fmt(core.alpha, 2));
    html('core-function', Math.abs(core.alpha - .5) < 1e-9 ? '√k' : `k<sup>${fmt(core.alpha, 2)}</sup>`);
    text('core-start-note', core.scenario === 'loss' ? 'A one-time loss cuts capital from its old steady state of 9 to 4.5. Saving and technology are unchanged.' : core.scenario === 'above' ? 'Starting above k*: capital is wearing out faster than investment replaces it.' : core.scenario === 'steady' ? 'Start where investment and depreciation are equal.' : core.scenario === 'slides' ? 'The slide example starts with 4 units per worker.' : 'Changing these assumptions restarts the economy at year 1.');
    text('core-kstar', fmt(ss.k));
    text('core-target-note', `At k*, output is ${fmt(ss.y)} and consumption is ${fmt(ss.c)} per worker.`);
    for (const [id, key] of [['k','k'],['y','y'],['c','c'],['dk','dk']]) text(`core-${id}-now`, key === 'dk' ? signed(r[key]) : fmt(r[key]));
    const near = Math.abs(r.dk) < 1e-8;
    html('core-explanation', near ? `<p><strong>Investment just replaces worn-out capital.</strong> Both are ${fmt(r.i)} per worker. Δk = 0: the capital stock stays at ${fmt(r.k)}. Output and consumption stay constant too.</p>` : `<p><strong>${r.dk > 0 ? 'Investment exceeds depreciation. Capital grows.' : 'Depreciation exceeds investment. Capital shrinks.'}</strong> Investment is ${fmt(r.i)}; depreciation is ${fmt(r.depreciation)}. The difference is ${signed(r.dk)}, so next year’s capital is ${fmt(r.nextK)} per worker.${Math.abs(r.dk) < .005 ? ' The economy is close to its steady state; the remaining change is small, not exactly zero.' : ''}</p>`);
    document.querySelectorAll('[data-core]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.core === core.scenario)));
    const allocation = core.view === 'allocation';
    document.querySelectorAll('[data-core-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.coreView === core.view)));
    text('core-chart-heading', allocation ? 'Output, consumption, and investment' : 'Investment and depreciation');
    solowDiagram('core-diagram-drawing', core, r.k, { allocation });
    html('core-diagram-legend', allocation ? legend([['Output f(k)','blue'],['Investment sf(k)','teal'],['Depreciation δk','rust'],['Highlighted gap: consumption c','gold']]) : legend([['Investment sf(k)','teal'],['Depreciation δk','rust'],['Highlighted gap: change Δk','gold'],['Steady state','ink','dot']]));
    text('core-diagram-desc', `Year ${r.year}: capital per worker ${fmt(r.k)}, investment ${fmt(r.i)}, depreciation ${fmt(r.depreciation)}. Steady-state capital ${fmt(ss.k)}. ${allocation ? 'The gap from output to investment is consumption.' : 'The gap from investment to depreciation is the change in capital.'}`);
    html('core-gap', allocation ? `<b>Output ${fmt(r.y)} = consumption ${fmt(r.c)} + investment ${fmt(r.i)}.</b> Saving changes the split, given today’s capital.` : `<b>Δk = sf(k) − δk = ${fmt(r.i)} − ${fmt(r.depreciation)} = ${signed(r.dk)}.</b> The vertical gap becomes movement along the capital axis over time.`);
    const levelSeries = core.series === 'capital' ? [{ points: coreRows.map(d => [d.t,d.k]), color: colors.blue }] : [{ points: coreRows.map(d => [d.t,d.y]), color: colors.blue }, { points: coreRows.map(d => [d.t,d.c]), color: colors.teal }];
    timeChart('core-level-drawing', levelSeries, { w:440,h:250,selected:core.time,yLabel:core.series === 'capital' ? 'Capital per worker' : 'Annual output per worker' });
    html('core-level-legend', core.series === 'capital' ? legend([['Capital k','blue']]) : legend([['Output y','blue'],['Consumption c','teal']]));
    const growth = coreRows.map((d, j) => [d.t, d.y > 0 ? 100 * (M.output(d.nextK, core.alpha) / d.y - 1) : 0]);
    timeChart('core-growth-drawing', [{ points: growth, color: colors.blue }], { w:440,h:250,selected:core.time,percent:true,allowNegative:true,yLabel:'Change to next year (%)' });
    text('calculation-title', `How year ${r.year} becomes year ${r.year + 1}`);
    html('core-calculation', `<li><b>Produce:</b> y = f(k) = ${fmt(r.y)} from ${fmt(r.k)} units of capital.</li><li><b>Divide output:</b> i = sy = ${pct(core.s*100,0)} × ${fmt(r.y)} = ${fmt(r.i)}; c = (1−s)y = ${fmt(r.c)}.</li><li><b>Replace worn-out capital:</b> δk = ${pct(core.delta*100,0)} × ${fmt(r.k)} = ${fmt(r.depreciation)}.</li><li><b>Add what remains:</b> Δk = ${fmt(r.i)} − ${fmt(r.depreciation)} = ${signed(r.dk)}.</li><li><b>Begin the next year:</b> k + Δk = ${fmt(r.k)} ${r.dk < 0 ? '−' : '+'} ${fmt(Math.abs(r.dk))} = <b>${fmt(r.nextK)}</b>.</li>`);
    renderCoreTable(); $('core-back').disabled = core.time === 0; $('core-step').disabled = core.time === 100;
    if (core.time === 100) stop();
  }
  function renderCoreTable() {
    const milestones = new Set([0,1,2,3,4,9,24,49,99,100,core.time]);
    const selected = coreRows.filter((r,j) => core.all || milestones.has(j));
    const names = ['k','y','c','i','depreciation','dk'];
    $('core-table').closest('.table-scroll').classList.toggle('all-years',core.all);
    html('core-table', selected.map(r => `<tr class="${r.t === core.time ? 'selected' : ''}"><th scope="row"><button data-cell="year" data-time="${r.t}" aria-label="Select year ${r.year}"${r.t === core.time ? ' aria-current="true"' : ''}>${r.year}</button></th>${names.map(key => `<td><button data-cell="${key}" data-time="${r.t}" aria-label="Explain ${key === 'depreciation' ? 'δk' : key} in year ${r.year}">${fmt(r[key])}</button></td>`).join('')}</tr>`).join('') + (() => { const s = M.steady(core); return `<tr class="limit"><th scope="row">∞ (limit)</th>${[s.k,s.y,s.c,s.i,s.depreciation,0].map(v=>`<td>${fmt(v)}</td>`).join('')}</tr>`; })());
    text('core-table-toggle', core.all ? 'Show selected years' : 'Show every year'); $('core-table-toggle').setAttribute('aria-pressed', String(core.all));
  }
  function explainCell(key,t) {
    const r = coreRows[t], formula = {
      year:`Year ${r.year} begins with ${fmt(r.k)} units of capital per worker.`,
      k: t === 0 ? `k₁ = ${fmt(r.k)}: the starting capital you chose.` : `k in year ${r.year} = last year’s capital ${fmt(coreRows[t-1].k)} + last year’s change ${signed(coreRows[t-1].dk)} = ${fmt(r.k)}.`,
      y:`y = f(k) = ${fmt(r.k)} raised to ${fmt(core.alpha,2)} = ${fmt(r.y)}.`,
      c:`c = (1−s)y = ${fmt(1-core.s,2)} × ${fmt(r.y)} = ${fmt(r.c)}.`,
      i:`i = sy = ${fmt(core.s,2)} × ${fmt(r.y)} = ${fmt(r.i)}.`,
      depreciation:`δk = ${fmt(core.delta,2)} × ${fmt(r.k)} = ${fmt(r.depreciation)}. δ is a rate; δk is an amount.`,
      dk:`Δk = i − δk = ${fmt(r.i)} − ${fmt(r.depreciation)} = ${signed(r.dk)}. This is net capital accumulation, not the Solow residual.`
    };
    text('cell-explanation', formula[key]);
  }
  function renderSaving() {
    text('saving-initial-value', pct(saving.initial*100,0)); text('saving-target-value', pct(saving.target*100,0));
    const p = {s:saving.initial,delta:.1,alpha:.5}, tr = M.transition(p,saving.target), gr = M.golden(p);
    const points = Array.from({length:101},(_,j)=>[j,M.steady({...p,s:j/100}).c]);
    const f = frame({w:chartWidth('saving-curve-drawing',330),h:330,xMax:100,yMax:2.9,xLabel:'Saving rate, s (%)',yLabel:'Steady-state consumption per worker',xFormat:v=>pct(v,0)});
    let curve = f.svg + path(points,f,colors.teal) + cursor(50,f) + dot(50,gr.c,f,colors.gold,6) + dot(saving.target*100,tr.final.c,f,colors.ink,5);
    curve += `<text class="annotation" x="${f.X(50)}" y="${f.Y(gr.c)-15}" text-anchor="middle">Highest consumption: s = 50%</text>`;
    html('saving-curve-drawing',curve);
    const changed = saving.target - saving.initial, cChange = tr.final.c-tr.initial.c;
    let msg;
    if (Math.abs(changed)<1e-9) msg='The saving rate is unchanged. The economy stays at its original steady state.';
    else if (changed>0) msg=`<strong>Consumption falls immediately</strong> from ${fmt(tr.initial.c)} to ${fmt((1-saving.target)*tr.initial.y)} in year 21. Capital and output initially stay unchanged. As capital builds, consumption moves toward ${fmt(tr.final.c)}, ${cChange>1e-8?'higher than':cChange < -1e-8?'lower than':'the same as'} its original long-run level.`;
    else msg=`<strong>Consumption rises immediately</strong> from ${fmt(tr.initial.c)} to ${fmt((1-saving.target)*tr.initial.y)} in year 21. Less investment then reduces capital and output. Consumption moves toward ${fmt(tr.final.c)}, ${cChange>1e-8?'higher than':cChange < -1e-8?'lower than':'the same as'} its original long-run level.`;
    if (saving.initial>.5 && saving.target>=.5 && saving.target<saving.initial) msg+=' Reducing overaccumulation toward the Golden Rule raises consumption throughout this transition.';
    html('saving-explanation',`<p>${msg}</p>`);
    // Two points at the event date show the instantaneous consumption jump without a false capital jump.
    const transitionPoints = tr.rows.map(r=>[r.t,r.c]); transitionPoints.splice(20,0,[20,tr.initial.c]);
    timeChart('saving-transition-drawing',[
      {points:[[0,tr.initial.c],[100,tr.initial.c]],color:colors.gray,dashed:true},
      {points:[[20,tr.final.c],[100,tr.final.c]],color:colors.gold,dashed:true},
      {points:transitionPoints,color:colors.teal}
    ],{event:20,h:300,yLabel:'Consumption per worker'});
    html('saving-table', [['Saving rate s',pct(saving.initial*100,0),pct(saving.target*100,0)],['Capital k*',fmt(tr.initial.k),fmt(tr.final.k)],['Output y*',fmt(tr.initial.y),fmt(tr.final.y)],['Investment i*',fmt(tr.initial.i),fmt(tr.final.i)],['Consumption c*',fmt(tr.initial.c),fmt(tr.final.c)]].map(([label,a,b])=>`<tr><th scope="row">${label}</th><td>${a}</td><td>${b}</td></tr>`).join(''));
    solowDiagram('golden-gap-drawing',{s:.5,delta:.1,alpha:.5},25,{golden:true,h:310,xLabel:'Steady-state capital per worker, k*'});
  }
  function renderTech() {
    const p={s:tech.s,n:tech.n,g:tech.g,delta:.1,alpha:.5}; const ss=M.steady(p);
    const rows=M.extended({...p,k0:ss.k*(tech.balanced?1:.5)});
    const refP={...p,g:0};const ref=M.extended({...refP,k0:rows[0].k});
    text('tech-s-value',pct(tech.s*100,0));text('tech-n-value',pct(tech.n*100,2));text('tech-g-value',pct(tech.g*100,2));text('tech-kstar',fmt(ss.k));
    text('tech-worker-rate',pct(tech.g*100,2));text('tech-total-rate',pct((tech.g+tech.n)*100,2));
    html('tech-explanation',tech.g>0 ? `<p><strong>Output per worker keeps growing at ${pct(tech.g*100,2)} in the long run.</strong> ${tech.balanced?'Capital and output per effective worker are already constant.':'Initially, capital per effective worker also grows as the economy catches up. That extra source of growth fades.'} Labor efficiency keeps increasing, so a constant y translates into a growing Y/L = Ey. Total output also grows with the number of workers.</p>` : `<p><strong>No sustained growth in output per worker without technological progress.</strong> ${tech.balanced?'Capital and output per worker are constant on this path.':'The economy initially grows through capital deepening, but this growth fades as k approaches k*.'} ${tech.n>0?`Total GDP can still grow at ${pct(tech.n*100,2)} because the labor force is growing.`:'With a fixed labor force too, total GDP eventually stops growing.'}</p>`);
    timeChart('tech-time-drawing',[{points:ref.map(r=>[r.t,r.workerY]),color:colors.gray,dashed:true},{points:rows.map(r=>[r.t,r.workerY]),color:colors.teal}],{h:320,yLabel:'Output per actual worker, Y/L'});
    solowDiagram('tech-diagram-drawing',p,ss.k,{h:290,noTech:true,xLabel:'Capital per effective worker, k',yLabel:'Investment per effective worker'});
    html('tech-breakdown',`At k*: <b>sf(k*) = ${fmt(ss.i)}</b> = replacement δk* ${fmt(.1*ss.k)} + capital for new workers nk* ${fmt(tech.n*ss.k)} + capital for growing efficiency gk* ${fmt(tech.g*ss.k)}.`);
    html('tech-rates-table',[
      ['Capital per effective worker','k = K/(LE)','0%'],['Output per effective worker','y = Y/(LE)','0%'],['Capital per actual worker','K/L = Ek',pct(tech.g*100,2)+' = g'],['Output per actual worker','Y/L = Ey',pct(tech.g*100,2)+' = g'],['Total output','Y = yEL',pct((tech.n+tech.g)*100,2)+' = n + g']
    ].map(([a,b,c])=>`<tr><th scope="row">${a}</th><td class="math">${b}</td><td>${c}</td></tr>`).join(''));
  }
  function renderAccount() {
    for(const [id,key] of [['y','outputGrowth'],['k','capitalGrowth'],['l','laborGrowth']]) text(`account-${id}-value`,pct(account[key]));
    text('account-alpha-value',pct(account.alpha*100,0));
    const a=M.accounting(account);
    text('account-residual',signed(a.residual,2)+'%');
    text('account-verdict',Math.abs(a.residual)<1e-8?'Measured capital and labor growth account for all output growth in this example.':a.residual>0?`${pct(account.outputGrowth)} output growth exceeds the ${pct(a.capital+a.labor)} accounted for by measured inputs. The residual contributes ${fmt(a.residual,2)} percentage points.`:`Output grew less than the measured-input contributions predict. The residual subtracts ${fmt(-a.residual,2)} percentage points from output growth.`);
    const values=[a.capital,a.labor,a.residual,a.total]; const labels=['Capital: α × ΔK/K','Labor: (1−α) × ΔL/L','TFP: Solow residual','Total output growth'];
    const min=Math.min(0,...values),max=Math.max(0,...values),range=Math.max(max-min,1);const w=chartWidth('account-chart-drawing',300),xmin=min-range*.12,xmax=max+range*.15,left=w<550?80:215,right=65;
    const X=v=>left+(v-xmin)/(xmax-xmin)*(w-left-right);let svg='';
    for(let i=0;i<=4;i++){const v=xmin+(xmax-xmin)*i/4;svg+=`<line class="grid" x1="${X(v)}" x2="${X(v)}" y1="22" y2="250"/><text x="${X(v)}" y="277" text-anchor="middle">${Number(v.toFixed(1))}</text>`;}
    svg+=`<line x1="${X(0)}" x2="${X(0)}" y1="22" y2="250" stroke="${colors.ink}" stroke-opacity=".4"/>`;
    const cs=[colors.blue,colors.gold,colors.teal,colors.ink];
    values.forEach((v,i)=>{const y=35+i*56;svg+=`<text class="annotation" x="5" y="${y+20}">${w<550?['Capital','Labor','TFP','Total'][i]:labels[i]}</text><rect x="${Math.min(X(0),X(v))}" y="${y}" width="${Math.max(.7,Math.abs(X(v)-X(0)))}" height="30" rx="2" fill="${cs[i]}"/><text class="annotation" x="${v<0?X(v)-8:X(v)+8}" y="${y+20}" text-anchor="${v<0?'end':'start'}">${signed(v,2)}</text>`;});
    svg+=`<text x="${w-15}" y="298" text-anchor="end">Percentage points of output growth</text>`;html('account-chart-drawing',svg);
    html('account-working',`<p>Capital contribution: ${fmt(account.alpha,2)} × ${pct(account.capitalGrowth)} = <b>${fmt(a.capital,2)} percentage points</b></p><p>Labor contribution: ${fmt(1-account.alpha,2)} × ${pct(account.laborGrowth)} = <b>${fmt(a.labor,2)} percentage points</b></p><p>Residual: ${pct(account.outputGrowth)} − ${fmt(a.capital,2)} pp − ${fmt(a.labor,2)} pp = <b>${signed(a.residual,2)}%</b> TFP growth</p>`);
  }
  const questions=[
    {q:'An economy is at k*. What happens to investment?',options:['It falls to zero.','It replaces depreciation, even though net capital accumulation is zero.','It must keep exceeding depreciation.'],answer:1,why:'With fixed labor and technology, sf(k*) = δk*. Gross investment is positive; Δk is zero.'},
    {q:'The saving rate rises today. Capital is unchanged at that instant. What happens immediately?',options:['Output jumps upward.','Consumption rises because the economy will be richer.','Investment rises and consumption falls; output is initially unchanged.'],answer:2,why:'Today’s y is determined by today’s k. Raising s reallocates that output from c to i. Capital and output respond subsequently.'},
    {q:'Starting below the Golden Rule, saving rises to its Golden Rule value. What is the trade-off?',options:['Consumption falls initially but becomes higher in the long run.','Everyone consumes more at every date.','Capital rises but long-run consumption cannot change.'],answer:0,why:'Building additional capital requires some current output to be invested rather than consumed. The higher steady state eventually permits higher consumption.'},
    {q:'Why does capital-led growth slow down in the basic Solow model?',options:['The saving rate automatically falls as the economy grows.','MPK diminishes while replacement needs rise with the capital stock.','Capital stops producing output after one year.'],answer:1,why:'At a fixed saving rate, each additional unit of capital adds less output and therefore less investment. Depreciation is proportional to the full capital stock.'},
    {q:'With n > 0 and g = 0, what can grow in steady state?',options:['Output per worker must grow at n.','Capital per worker must grow at n.','Total GDP can grow at n while output per worker is constant.'],answer:2,why:'More workers can produce more total output without producing more per worker. Total GDP and living standards are different measures.'},
    {q:'With g > 0, k and y are constant in steady state. Why can living standards still rise?',options:['These are per effective worker; Y/L = Ey rises as E rises.','The star means the economy has reached maximum possible output.','Population growth raises y even when k is constant.'],answer:0,why:'Mankiw redefines k = K/(LE) and y = Y/(LE) in the technology model. A constant y does not mean constant output per actual worker.'},
    {q:'Output grows 3%, capital 4%, labor 1%, and α = 0.3. What is the residual?',options:['−2%, subtracting both raw input growth rates.','1.1%, after weighting input growth by income shares.','3%, because all growth is technology.'],answer:1,why:'Capital contributes 0.3 × 4 = 1.2 percentage points and labor contributes 0.7 × 1 = 0.7. The residual is 3 − 1.2 − 0.7 = 1.1%.'},
    {q:'Does a positive Solow residual prove that new inventions caused the measured growth?',options:['Yes; it directly counts inventions.','Yes; capital and labor never affect output growth.','No; it is growth not accounted for by measured inputs, with several possible explanations.'],answer:2,why:'Technology can contribute, but organization, utilization, input quality, and measurement problems can also enter the residual. Growth accounting alone does not identify a cause.'}
  ];
  function renderPractice(){ html('practice-questions',`<div class="practice-grid">${questions.map((q,j)=>`<article class="question"><h4>${j+1}. ${q.q}</h4><div class="answer-options" role="group" aria-label="Answers to question ${j+1}">${q.options.map((a,i)=>`<button data-question="${j}" data-answer="${i}" aria-pressed="false">${String.fromCharCode(65+i)}. ${a}</button>`).join('')}</div><p class="feedback" id="feedback-${j}" role="status"></p></article>`).join('')}</div>`); }
  document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.panel,true)));
  window.addEventListener('hashchange',()=>activate(location.hash.slice(1)));
  document.querySelectorAll('[data-core]').forEach(b=>b.addEventListener('click',()=>coreScenario(b.dataset.core)));
  $('core-reset').addEventListener('click',()=>{core.view='accumulation';core.series='output';core.all=false;$('core-series').value='output';coreScenario('slides');});
  for(const [id,key,scale] of [['core-s','s',100],['core-delta','delta',100],['core-k','k0',1],['core-alpha','alpha',1]]) $(id).addEventListener('input',()=>{stop();core[key]=Number($(id).value)/scale;core.time=0;core.scenario='custom';text('cell-explanation','Select any number in the table.');renderCore();});
  $('core-time').addEventListener('input',()=>{stop();core.time=Number($('core-time').value);renderCore();});
  $('core-step').addEventListener('click',()=>{stop();core.time=Math.min(100,core.time+1);renderCore();announce(`Year ${core.time+1}. Capital ${fmt(coreRows[core.time].k)}. ${$('core-explanation').textContent}`);});
  $('core-back').addEventListener('click',()=>{stop();core.time=Math.max(0,core.time-1);renderCore();});
  $('core-play').addEventListener('click',()=>{if(timer){stop();return;}if(core.time===100)core.time=0;text('core-play','Pause');$('core-play').setAttribute('aria-pressed','true');timer=setInterval(()=>{core.time=Math.min(100,core.time+1);renderCore();},650);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  document.querySelectorAll('[data-core-view]').forEach(b=>b.addEventListener('click',()=>{core.view=b.dataset.coreView;renderCore();}));
  $('core-series').addEventListener('change',()=>{core.series=$('core-series').value;renderCore();});
  $('core-table-toggle').addEventListener('click',()=>{core.all=!core.all;renderCoreTable();});
  $('core-table').addEventListener('click',e=>{const b=e.target.closest('[data-cell]');if(!b)return;const t=Number(b.dataset.time),key=b.dataset.cell;stop();core.time=t;renderCore();explainCell(key,t);});
  $('core-download').addEventListener('click',()=>{const ss=M.steady(core);const s='Year,k,y,c,i,delta_k,change_k\n'+coreRows.map(r=>[r.year,r.k,r.y,r.c,r.i,r.depreciation,r.dk].join(',')).join('\n')+`\nSteady state,${ss.k},${ss.y},${ss.c},${ss.i},${ss.depreciation},0\n`;const url=URL.createObjectURL(new Blob([s],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='solow-year-by-year.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Year-by-year CSV downloaded.');});
  for(const [id,key] of [['saving-initial','initial'],['saving-target','target']]) $(id).addEventListener('input',()=>{saving[key]=Number($(id).value)/100;renderSaving();});
  function setSaving(a,b){saving.initial=a;saving.target=b;$('saving-initial').value=a*100;$('saving-target').value=b*100;renderSaving();}
  document.querySelectorAll('[data-saving]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.saving;setSaving(...(n==='above'?[.8,.5]:n==='excess'?[.5,.8]:[.3,.5]));}));
  $('saving-golden').addEventListener('click',()=>setSaving(saving.initial,.5));
  for(const [id,key] of [['tech-s','s'],['tech-n','n'],['tech-g','g']]) $(id).addEventListener('input',()=>{tech[key]=Number($(id).value)/100;renderTech();});
  $('tech-balanced').addEventListener('change',()=>{tech.balanced=$('tech-balanced').checked;renderTech();});
  document.querySelectorAll('[data-tech]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.tech;Object.assign(tech,{s:n==='saving'?.6:.3,n:.01,g:n==='population'?0:.02,balanced:n!=='catchup'});$('tech-s').value=tech.s*100;$('tech-n').value=tech.n*100;$('tech-g').value=tech.g*100;$('tech-balanced').checked=tech.balanced;renderTech();}));
  for(const [id,key,scale] of [['account-y','outputGrowth',1],['account-k','capitalGrowth',1],['account-l','laborGrowth',1],['account-alpha','alpha',100]]) $(id).addEventListener('input',()=>{account[key]=Number($(id).value)/scale;renderAccount();});
  document.querySelectorAll('[data-account]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.account;Object.assign(account,{outputGrowth:n==='inputs'?1.9:n==='productivity'?5:n==='negative'?1:3,capitalGrowth:n==='productivity'?2:4,laborGrowth:1,alpha:.3});for(const [id,key,scale] of [['account-y','outputGrowth',1],['account-k','capitalGrowth',1],['account-l','laborGrowth',1],['account-alpha','alpha',100]])$(id).value=account[key]*scale;renderAccount();}));
  $('practice-questions').addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(!b)return;const j=Number(b.dataset.question),a=Number(b.dataset.answer),q=questions[j];document.querySelectorAll(`[data-question="${j}"]`).forEach(x=>{x.classList.remove('correct','incorrect');x.setAttribute('aria-pressed',String(x===b));});b.classList.add(a===q.answer?'correct':'incorrect');text('feedback-'+j,(a===q.answer?'Correct. ':'Try again. ')+q.why);});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(activePanel==='capital')renderCore();else if(activePanel==='saving')renderSaving();else if(activePanel==='technology')renderTech();else if(activePanel==='accounting')renderAccount();},100);});
  setCoreInputs(); renderCore(); renderSaving(); renderTech(); renderAccount(); renderPractice(); activate(location.hash.slice(1));
})();
