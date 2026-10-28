window.__build12=function(S0){
 var S=JSON.parse(JSON.stringify(S0)), L=S.expressions.list, log=[];
 function at(id){for(var i=0;i<L.length;i++){if(L[i].id===id)return i;}throw 'missing '+id;}
 function get(id){return L[at(id)];}
 function mk(id,latex){return {type:'expression',id:id,latex:latex,color:'#000000',hidden:true};}
 function after(ref,e){var f=get(ref).folderId;if(f)e.folderId=f;L.splice(at(ref)+1,0,e);}
 function val(name){for(var i=0;i<L.length;i++){var x=L[i].latex||'';if(x.indexOf(name+'=')===0)return +x.slice(name.length+1);}throw 'missing '+name;}
 function r6(x){return String(+x.toFixed(6));}
 var h0=val('h'), hm=(val('p_{m}')%6284)/1000, b0=3.67-h0-2*Math.PI*Math.round((3.67-h0)/(2*Math.PI));
 after('e37',mk('rd1','R_{d}(x)=\\frac{\\operatorname{round}\\left(10^{6}x\\right)}{10^{6}}'));
 get('e32').latex='c_h='+r6(Math.cos(h0));
 get('e33').latex='s_h='+r6(Math.sin(h0));
 get('m6_cm').latex='c_m='+r6(Math.cos(hm));
 get('m6_sm').latex='s_m='+r6(Math.sin(hm));
 get('e109').latex='x_{sn}='+(Math.cos(b0)>0.25?r6(1.6*Math.tan(b0)):'99');
 after('e109',mk('sn2','\\nu_{s}='+r6(Math.sin(b0))));
 L.forEach(function(e){if(e.latex&&e.latex.indexOf('b_{sn}')>=0&&e.id!=='e108'&&e.id!=='e109')e.latex=e.latex.split('\\sin\\left(b_{sn}\\right)').join('\\nu_{s}');});
 L.splice(at('e108'),1);
 get('e86').latex='m_b=\\operatorname{sort}\\left(\\left[1...\\operatorname{length}\\left(q_c\\right)\\right],q_c\\right)\\left[1\\right]';
 log.push('trig and nearest-road lookup moved out of per-tick code');
 var tk=S.expressions.ticker, out=[], d=0, cur='';
 for(var i=0;i<tk.handlerLatex.length;i++){var c=tk.handlerLatex[i];if('{(['.indexOf(c)>=0)d++;if('})]'.indexOf(c)>=0)d--;if(c===','&&d===0){out.push(cur);cur='';}else cur+=c;}
 out.push(cur);
 out=out.map(function(a){var m=a.match(/^(v|h|p_x|p_y)\\to([\s\S]*)$/);return m?m[1]+'\\to R_{d}\\left('+m[2]+'\\right)':a;});
 out.push('c_h\\to R_{d}\\left(\\cos\\left(h\\right)\\right)','s_h\\to R_{d}\\left(\\sin\\left(h\\right)\\right)',
  'x_{sn}\\to R_{d}\\left(\\left\\{\\left(-0.863611115\\cos\\left(h\\right)+-0.504158548\\sin\\left(h\\right)\\right)>0.25:\\frac{k_f\\left(-0.504158548\\cos\\left(h\\right)--0.863611115\\sin\\left(h\\right)\\right)}{\\left(-0.863611115\\cos\\left(h\\right)+-0.504158548\\sin\\left(h\\right)\\right)},99\\right\\}\\right)','\\nu_{s}\\to R_{d}\\left(\\left(-0.504158548\\cos\\left(h\\right)--0.863611115\\sin\\left(h\\right)\\right)\\right)',
  '\\left\\{\\left|c_m-R_{d}\\left(\\cos\\left(h_m\\right)\\right)\\right|>10^{-7}:c_m\\to R_{d}\\left(\\cos\\left(h_m\\right)\\right)\\right\\}',
  '\\left\\{\\left|s_m-R_{d}\\left(\\sin\\left(h_m\\right)\\right)\\right|>10^{-7}:s_m\\to R_{d}\\left(\\sin\\left(h_m\\right)\\right)\\right\\}');
 tk.handlerLatex=out.join(',');
 log.push('car state rounded to 6 decimals each tick');
 var TOK=/\\[a-zA-Z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?|[A-Za-z](?:_\{[^}]*\}|_[A-Za-z0-9])?/g;
 var DEF=/^\s*(\\[a-zA-Z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?|[A-Za-z](?:_\{[^}]*\}|_[A-Za-z0-9])?)\s*(\([^)]*\))?\s*=/;
 var ACT=/(\\?[A-Za-z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?)\\to/g;
 var quiet=['u_d','z_r','p_m','n_rl','c_al','p_cm','s_gq','s_gp'];
 function norm(n){return n.replace(/[{}]/g,'');}
 function esc(s){return s.replace(/[\\{}()[\]^$.|?*+]/g,function(c){return '\\'+c;});}
 function names(t,re){var out=[],m;re.lastIndex=0;while((m=re.exec(t)))out.push(norm(m[1]||m[0]));return out;}
 function fold(){
  var tk=S.expressions.ticker.handlerLatex, acts=[tk].concat(L.map(function(e){return (e.clickableInfo&&e.clickableInfo.latex)||'';})).join(' ');
  var assigned=new Set(names(acts,ACT)), dyn=new Set(names(tk,ACT).filter(function(n){return quiet.indexOf(n)<0;}).concat(['dt']));
  var info=L.filter(function(e){return e.type==='expression';}).map(function(e){
   var m=(e.latex||'').match(DEF), params=m&&m[2]?m[2].slice(1,-1).split(',').map(function(p){return norm(p.trim());}):[], name=m?norm(m[1]):null;
   var used=names((e.latex||'')+' '+(e.colorLatex||''),TOK).filter(function(t){return params.indexOf(t)<0&&t!==name;});
   return {e:e,name:name,fn:!!(m&&m[2]),used:used};});
  for(var grew=true;grew;){grew=false;info.forEach(function(x){if(x.name&&!dyn.has(x.name)&&x.used.some(function(u){return dyn.has(u);})){dyn.add(x.name);grew=true;}});}
  var text=L.map(function(e){return (e.latex||'')+' '+(e.colorLatex||'')+' '+(e.label||'');}).join(' ')+' '+acts;
  for(var i=0;i<info.length;i++){
   var x=info[i];
   if(!x.name||x.name.indexOf('_')<0||x.fn||!x.e.hidden||x.e.slider||assigned.has(x.name)||!dyn.has(x.name)||x.e.latex.length>260)continue;
   var body=x.e.latex.slice(x.e.latex.indexOf('=')+1);
   if(/^\\left\[/.test(body))continue;
   var raw=x.e.latex.slice(0,x.e.latex.indexOf('=')).trim(), re=new RegExp(esc(raw),'g');
   if((text.match(re)||[]).length!==2||re.test(acts))continue;
   re.lastIndex=0;
   var target=L.filter(function(e){return e!==x.e&&((e.latex||'')+(e.colorLatex||'')).match(re);})[0];
   if(!target||(target.latex||'').length+(target.colorLatex||'').length+x.e.latex.length>2400)continue;
   var wrapped='\\left('+body+'\\right)';
   ['latex','colorLatex'].forEach(function(k){if(target[k])target[k]=target[k].replace(re,function(){return wrapped;});});
   L.splice(L.indexOf(x.e),1);
   return true;
  }
  return false;
 }
 var n=0;while(fold())n++;
 log.push('folded '+n+' single-use helpers');
 return {S:S,log:log};
};
'patch12 loaded';
