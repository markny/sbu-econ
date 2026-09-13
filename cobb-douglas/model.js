/* Pure model shared by the page and numerical checks. */
(function(root){
  'use strict';
  const baseline=Object.freeze({K:100,L:100,A:1,alpha:0.5,P:1});
  const limits=Object.freeze({K:[1,200],L:[1,200],A:[0.25,2],alpha:[0.1,0.9],P:[0.5,3]});
  const scenarios=Object.freeze({reset:{},plague:{L:50},immigration:{L:150},earthquake:{K:50},technology:{A:1.25},inflation:{P:2}});
  function validate(s){
    for(const key of Object.keys(limits)){const v=s[key];if(!Number.isFinite(v)||v<limits[key][0]||v>limits[key][1])throw new RangeError('Invalid '+key);}
    return s;
  }
  function calculate(s){
    validate(s);
    const Y=s.A*Math.pow(s.K,s.alpha)*Math.pow(s.L,1-s.alpha);
    const wage=(1-s.alpha)*Y/s.L,rent=s.alpha*Y/s.K;
    return {Y,wage,rent,laborIncome:wage*s.L,capitalIncome:rent*s.K,laborShare:1-s.alpha,capitalShare:s.alpha,nominalWage:s.P*wage,nominalRent:s.P*rent};
  }
  function scenario(name){if(!Object.hasOwn(scenarios,name))throw new RangeError('Unknown example');return {...baseline,...scenarios[name]};}
  const api={baseline,limits,scenarios,validate,calculate,scenario};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CobbDouglas=api;
})(globalThis);
