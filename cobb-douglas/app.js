(() => {
  'use strict';
  const M=globalThis.CobbDouglas,base=M.calculate(M.baseline),$=id=>document.getElementById(id);
  let state={...M.baseline},axis='L',selected='reset',liveTimer;
  const controls={L:'labor',K:'capital',A:'technology',alpha:'alpha',P:'price'};
  const fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
  const change=(n,b)=>{const p=(n/b-1)*100;return Math.abs(p)<0.005?'unchanged':(p>0?'+':'−')+fmt(Math.abs(p),1)+'%';};
  const direction=(n,b)=>Math.abs(n-b)<1e-9?'unchanged':n>b?'higher':'lower';
  const svgNS='http://www.w3.org/2000/svg';
  function el(tag,attrs,text){const x=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);if(text!==undefined)x.textContent=text;return x;}
  function graph(r){
    const g=$('graph-drawing');g.replaceChildren();
    const left=60,right=696,top=27,bottom=286,width=right-left,height=bottom-top;
    const production=(s,x)=>s.A*Math.pow(axis==='K'?x:s.K,s.alpha)*Math.pow(axis==='L'?x:s.L,1-s.alpha);
    const max=Math.max(production(state,200),production(M.baseline,200));
    const yMax=Math.ceil(max/4/10)*10*4;
    const sx=x=>left+x/200*width,sy=y=>bottom-y/yMax*height;
    const defs=el('defs',{}),clip=el('clipPath',{id:'plot-area'});clip.append(el('rect',{x:left,y:top,width,height}));defs.append(clip);g.append(defs);
    for(let i=0;i<=4;i++){
      const y=i*yMax/4;g.append(el('line',{x1:left,y1:sy(y),x2:right,y2:sy(y),stroke:'#e1e8ed','stroke-width':1}));
      g.append(el('text',{x:left-11,y:sy(y)+5,'text-anchor':'end'},fmt(y,0)));
      const x=i*50;g.append(el('text',{x:sx(x),y:bottom+23,'text-anchor':'middle'},x));
    }
    g.append(el('text',{x:left,y:14},'Output, Y'));
    g.append(el('text',{x:(left+right)/2,y:333,'text-anchor':'middle'},axis==='L'?'Workers, L':'Land / capital, K'));
    const plot=el('g',{'clip-path':'url(#plot-area)'});
    function curve(s,color,dash){let d='';for(let i=0;i<=200;i++)d+=(i?'L':'M')+sx(i).toFixed(2)+','+sy(production(s,i)).toFixed(2);plot.append(el('path',{d,fill:'none',stroke:color,'stroke-width':3,...(dash?{'stroke-dasharray':'6 5'}:{})}));}
    curve(M.baseline,'#687b8b',true);curve(state,'#086ac0',false);
    const x=state[axis],slope=axis==='L'?r.wage:r.rent;
    plot.append(el('line',{x1:sx(x),y1:bottom,x2:sx(x),y2:sy(r.Y),stroke:'#086ac0','stroke-dasharray':'3 4','stroke-width':1}));
    // Limit the tangent to the plot and a short neighborhood of the current input.
    const dx=Math.min(28,(yMax*0.18)/slope),x1=Math.max(0,x-dx),x2=Math.min(200,x+dx);
    plot.append(el('line',{x1:sx(x1),y1:sy(r.Y+slope*(x1-x)),x2:sx(x2),y2:sy(r.Y+slope*(x2-x)),stroke:'#a04b0b','stroke-width':3}));
    plot.append(el('circle',{cx:sx(100),cy:sy(100),r:6,fill:'#fff',stroke:'#687b8b','stroke-width':2}));
    plot.append(el('circle',{cx:sx(x),cy:sy(r.Y),r:5,fill:'#086ac0',stroke:'#fff','stroke-width':1.5}));g.append(plot);
    $('slope-value').textContent=`${axis==='L'?'MPL':'MPK'} = ${fmt(slope,3)}`;
    const fixed=axis==='L'?`K = ${fmt(state.K,0)}`:`L = ${fmt(state.L,0)}`;
    $('held-fixed').textContent=`Holding ${fixed}, A = ${fmt(state.A)} and α = ${fmt(state.alpha)} fixed`;
    $('graph-title').textContent=axis==='L'?'Output as labor changes':'Output as land or capital changes';
    $('graph-desc').textContent=`${$('held-fixed').textContent}. Current output is ${fmt(r.Y)} at ${fmt(x,0)} units of ${axis==='L'?'labor':'capital'}. The tangent slope is ${fmt(slope,3)}. Original output was 100 at 100 units.`;
    $('graph-explanation').textContent=axis==='L'
      ?'The slope is MPL: extra output per unit of a small labor increase, holding land / capital fixed. A steeper slope means a higher real wage.'
      :'The slope is MPK: extra output per unit of a small capital increase, holding labor fixed. A steeper slope means a higher real rental price.';
  }
  function render(){
    const r=M.calculate(state);
    for(const [key,id] of Object.entries(controls)){$(id).value=state[key];$(id+'-value').textContent=fmt(state[key],key==='K'||key==='L'?0:2);}
    $('capital-per-worker').textContent=fmt(state.K/state.L);
    for(const [id,k,d] of [['output','Y',2],['wage','wage',3],['rent','rent',3]]){
      $(id+'-value').textContent=fmt(r[k],d);$(id+'-change').textContent=`Original: ${fmt(base[k],d)} · ${change(r[k],base[k])}`;
    }
    document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===selected)));
    $('labor-view').setAttribute('aria-pressed',String(axis==='L'));$('capital-view').setAttribute('aria-pressed',String(axis==='K'));
    graph(r);
    let title;
    const sameReal=['K','L','A','alpha'].every(k=>state[k]===M.baseline[k]);
    if(sameReal&&state.P!==1)title='The money amounts change. Purchasing power stays the same.';
    else if(sameReal)title='Start with 100 workers and 100 units of land.';
    else if(r.wage>base.wage&&r.laborIncome<base.laborIncome)title='Each worker earns more. Workers together receive less.';
    else if(r.wage<base.wage&&r.laborIncome>base.laborIncome)title='Each worker earns less. Workers together receive more.';
    else if(r.wage>base.wage&&r.rent>base.rent)title='Both workers and owners earn more per unit.';
    else if(r.wage<base.wage&&r.rent<base.rent)title='Both workers and owners earn less per unit.';
    else title=`Output is ${direction(r.Y,base.Y)}. Check who gains and who loses.`;
    $('takeaway').textContent=title;
    $('explanation').textContent=sameReal
      ?state.P===1?'Move a slider or try an example. Compare income per worker with total labor income below.':`The price level is ${fmt(state.P)} times its original value. Output, marginal products, real factor prices, and income shares are unchanged.`
      :`The real wage is ${direction(r.wage,base.wage)} (${change(r.wage,base.wage)}), and the real rental price is ${direction(r.rent,base.rent)} (${change(r.rent,base.rent)}). Output is ${fmt(r.Y)}. Labor receives ${fmt(r.laborIncome)} in total, shared across ${fmt(state.L,0)} workers.`;
    const maxY=Math.max(base.Y,r.Y);
    for(const [id,values] of [['before',base],['after',r]]){
      const bar=$(id+'-bar');bar.style.width=(values.Y/maxY*100)+'%';bar.children[0].style.width=values.laborShare*100+'%';bar.children[1].style.width=values.capitalShare*100+'%';$(id+'-total').textContent=fmt(values.Y);
    }
    const tbody=$('income-table');tbody.replaceChildren();
    for(const [name,key,share] of [['Total labor income (W/P) × L','laborIncome',false],['Total land / capital income (R/P) × K','capitalIncome',false],['Labor’s share of output','laborShare',true],['Land / capital’s share of output','capitalShare',true]]){
      const row=document.createElement('tr'),heading=document.createElement('th');heading.scope='row';heading.textContent=name;row.append(heading);
      const amount=v=>share?fmt(v*100,0)+'%':fmt(v);
      const delta=share?(Math.abs(r[key]-base[key])<1e-9?'unchanged':(r[key]>base[key]?'+':'−')+fmt(Math.abs(r[key]-base[key])*100,1)+' percentage points'):change(r[key],base[key]);
      for(const value of [amount(base[key]),amount(r[key]),delta]){const td=document.createElement('td');td.textContent=value;row.append(td);}tbody.append(row);
    }
    $('share-explanation').textContent=state.alpha===0.5?'With α fixed at 0.50, each group receives half the output. Changes in output change the income amounts, but not those shares.':`You changed α to ${fmt(state.alpha)}. Capital now receives ${fmt(r.capitalShare*100,0)}% of output and labor receives ${fmt(r.laborShare*100,0)}%. Holding this α fixed, changes in K, L, or A do not change these shares.`;
    $('wage-substitution').textContent=`Current real wage = ${fmt(1-state.alpha)} × ${fmt(r.Y)} ÷ ${fmt(state.L,0)} = ${fmt(r.wage,3)}`;
    $('rent-substitution').textContent=`Current real rent = ${fmt(state.alpha)} × ${fmt(r.Y)} ÷ ${fmt(state.K,0)} = ${fmt(r.rent,3)}`;
    $('share-math').textContent=`Total labor income = [(1 − α)Y/L] × L = (1 − α)Y. Dividing by Y gives labor’s share, 1 − α = ${fmt(r.laborShare*100,0)}%. The worker count cancels. Capital’s share is α = ${fmt(r.capitalShare*100,0)}%.`;
    for(const [id,k] of [['nominal-wage','nominalWage'],['nominal-rent','nominalRent'],['nominal-real-wage','wage'],['nominal-real-rent','rent']])$(id).textContent=fmt(r[k],3);
    clearTimeout(liveTimer);liveTimer=setTimeout(()=>{$('live-summary').textContent=`Output ${fmt(r.Y)}. Real wage ${fmt(r.wage,3)}. Real rent ${fmt(r.rent,3)}. Labor share ${fmt(r.laborShare*100,0)} percent.`;},250);
  }
  function apply(next){M.validate(next);state={...next};render();return {...state,...M.calculate(state)};}
  function choose(name){selected=name;axis=name==='earthquake'?'K':'L';if(name==='inflation')$('nominal-details').open=true;return apply(M.scenario(name));}
  for(const [key,id] of Object.entries(controls))$(id).addEventListener('input',e=>{selected=null;apply({...state,[key]:Number(e.target.value)});});
  document.querySelectorAll('[data-scenario]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.scenario)));
  $('labor-view').addEventListener('click',()=>{axis='L';render();});$('capital-view').addEventListener('click',()=>{axis='K';render();});
  render();
  globalThis.CobbDouglasPage={getState:()=>({...state,...M.calculate(state)}),setState:values=>{selected=null;return apply({...state,...values});},chooseScenario:choose};
  // Optional, page-scoped agent access uses the same examples and calculation path.
  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();
    const tools=[
      {name:'read_cobb_douglas_economy',title:'Read the economy',description:'Read the current inputs, output, real and nominal factor prices, and income shares.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new TypeError('Expected an empty object');return globalThis.CobbDouglasPage.getState();}},
      {name:'apply_cobb_douglas_example',title:'Apply an economic example',description:'Reset to the original economy and apply one of the visible examples. Updates the sliders, graph, and income comparison.',inputSchema:{type:'object',properties:{scenario:{type:'string',enum:Object.keys(M.scenarios)}},required:['scenario'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==1||!Object.hasOwn(M.scenarios,input.scenario))throw new TypeError('Choose a valid scenario');return choose(input.scenario);}}
    ];
    for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
