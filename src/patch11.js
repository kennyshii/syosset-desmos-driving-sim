window.__build11=function(S0){
 var S=JSON.parse(JSON.stringify(S0)), L=S.expressions.list, log=[];
 function at(id){for(var i=0;i<L.length;i++){if(L[i].id===id)return i;}throw 'missing '+id;}
 function get(id){return L[at(id)];}
 function mk(id,latex,extra){var e={type:'expression',id:id,latex:latex,color:'#000000',hidden:true};if(extra)for(var k in extra)e[k]=extra[k];return e;}
 function vis(id,latex,color,extra){var e=mk(id,latex,{hidden:false,color:color,fill:true,lines:false,fillOpacity:'1'});if(extra)for(var k in extra)e[k]=extra[k];return e;}
 function put(i,ref,arr){var f=get(ref).folderId;arr.forEach(function(e){if(e.folderId===undefined&&f)e.folderId=f;});L.splice.apply(L,[i,0].concat(arr));}
 function after(ref,arr){put(at(ref)+1,ref,arr);}
 function before(ref,arr){put(at(ref),ref,arr);}
 function drop(ids){ids.forEach(function(id){L.splice(at(id),1);});}
 function fmt(v){return String(+v.toFixed(4));}
 function lst(a){return '\\left['+a.map(fmt).join(',')+'\\right]';}
 function lerp(a,b,t){return a.map(function(v,k){return Math.round(v+(b[k]-v)*t);});}
 function col(c,k){return c.map(function(x){return x[k];});}

 var sky=[0,0.02,0.045,0.075,0.11,0.15,0.2,0.26,0.33,0.41,0.5,0.6,0.72,0.86,1.4];
 var skyCols=sky.slice(0,-1).map(function(_,i){return lerp([222,237,248],[92,156,222],Math.pow((sky[i]+sky[i+1])/2/0.95,0.6));});
 drop(['e104','e105','e106','e107']);
 get('e103').latex='\\operatorname{polygon}\\left(\\left(-3,y_0+\\chi_{a}\\left[i\\right]\\right),\\left(3,y_0+\\chi_{a}\\left[i\\right]\\right),\\left(3,y_0+\\chi_{b}\\left[i\\right]+0.012\\right),\\left(-3,y_0+\\chi_{b}\\left[i\\right]+0.012\\right)\\right)\\operatorname{for}i=\\left[1...'+(sky.length-1)+'\\right]';
 get('e103').colorLatex='\\operatorname{rgb}\\left(\\chi_{R},\\chi_{G},\\chi_{B}\\right)';
 before('e103',[mk('sy1','\\chi_{a}='+lst(sky.slice(0,-1))),mk('sy2','\\chi_{b}='+lst(sky.slice(1))),mk('sy3','\\chi_{R}='+lst(col(skyCols,0))),mk('sy4','\\chi_{G}='+lst(col(skyCols,1))),mk('sy5','\\chi_{B}='+lst(col(skyCols,2)))]);
 log.push('sky gradient');

 after('e125',[mk('hz1','h_3(x)=0.034+0.012\\sin(5t_h(x)+0.7)+0.008\\sin(13t_h(x)+2.4)+0.005\\sin(37t_h(x)+1.1)+0.003\\sin(83t_h(x))')]);
 after('e126',[vis('hz2','\\operatorname{polygon}(\\operatorname{join}((X_{hb},y_0+h_3(X_{hb})),(2.4,y_0-0.01),(-2.4,y_0-0.01)))','#7c9c80')]);
 get('e126').color='#a8c0c4';
 get('e127').color='#557d4c';
 log.push('horizon layers');

 var gb=[0,0.006,0.012,0.018,0.025,0.033,0.043,0.055,0.07,0.09];
 var gCols=gb.slice(0,-1).map(function(_,i){var d=2.32/((gb[i]+gb[i+1])/2);return lerp([126,171,87],[200,220,236],Math.min(0.8,d*d/40000));});
 drop(['e129']);
 get('e128').latex='\\operatorname{polygon}\\left(\\left(-3,y_0-\\eta_{a}\\left[i\\right]\\right),\\left(3,y_0-\\eta_{a}\\left[i\\right]\\right),\\left(3,y_0-\\eta_{b}\\left[i\\right]-0.006\\right),\\left(-3,y_0-\\eta_{b}\\left[i\\right]-0.006\\right)\\right)\\operatorname{for}i=\\left[1...'+(gb.length-1)+'\\right]';
 get('e128').colorLatex='\\operatorname{rgb}\\left(\\eta_{R},\\eta_{G},\\eta_{B}\\right)';
 before('e128',[mk('gr1','\\eta_{a}='+lst(gb.slice(0,-1))),mk('gr2','\\eta_{b}='+lst(gb.slice(1))),mk('gr3','\\eta_{R}='+lst(col(gCols,0))),mk('gr4','\\eta_{G}='+lst(col(gCols,1))),mk('gr5','\\eta_{B}='+lst(col(gCols,2)))]);
 get('e130').latex='\\operatorname{polygon}((-3,-1.5),(3,-1.5),(3,y_0-0.089),(-3,y_0-0.089))';
 log.push('ground haze');

 before('e159',[mk('rf1','\\phi_{r}=n_m\\left(0.75,\\frac{\\left(D_{2}+D_{4}+D_{6}+D_{8}\\right)^{2}}{640000}\\right)')]);
 get('e159').colorLatex='\\operatorname{rgb}\\left(U_{cR}\\left[Q_{tt}\\right]\\left(1-\\phi_{r}\\right)+200\\phi_{r},U_{cG}\\left[Q_{tt}\\right]\\left(1-\\phi_{r}\\right)+220\\phi_{r},U_{cB}\\left[Q_{tt}\\right]\\left(1-\\phi_{r}\\right)+236\\phi_{r}\\right)';
 log.push('road haze');

 after('e159',[
  mk('sh1','\\psi_{k}=I_{t}\\left[E_f>1.15E_k+3\\right]'),
  mk('sh2','\\psi_{s}=1.15E_k\\left[E_f>1.15E_k+3\\right]'),
  mk('sh3','\\psi_{x}=T_x\\left[\\psi_{k}\\right]+0.1513\\psi_{s}'),
  mk('sh4','\\psi_{y}=T_y\\left[\\psi_{k}\\right]+0.2591\\psi_{s}'),
  mk('sh5','\\psi_{f}=f_f\\left(\\psi_{x},\\psi_{y}\\right)'),
  mk('sh7','\\psi_{c}=\\left[1,0.7071,0,-0.7071,-1,-0.7071,0,0.7071\\right]'),
  mk('sh8','\\psi_{n}=\\left[0,0.7071,1,0.7071,0,-0.7071,-1,-0.7071\\right]'),
  vis('sh6','\\operatorname{polygon}\\left(\\frac{k_f\\left(f_r\\left(\\psi_{x}\\left[i\\right],\\psi_{y}\\left[i\\right]\\right)+\\psi_{s}\\left[i\\right]\\psi_{c}\\right)}{\\psi_{f}\\left[i\\right]},y_0-\\frac{k_fe_y}{\\psi_{f}\\left[i\\right]+\\psi_{s}\\left[i\\right]\\psi_{n}}\\right)\\operatorname{for}i=\\left[1...\\operatorname{length}\\left(\\psi_{f}\\right)\\right]','#203a1c',{fillOpacity:'0.34'})]);
 log.push('tree shadows');

 var hl={e226:'E_r-0.62E_k+0.28E_k\\sin\\left(b_{sn}\\right)',e227:'E_f-0.05',e228:'E_r+0.62E_k+0.28E_k\\sin\\left(b_{sn}\\right)',e229:'E_f-0.05',e230:'E_r',e231:'E_f',e232:'E_t+0.95E_k',e233:'E_t+2.02E_k',e234:'0E_r',e235:'1+0E_r',e236:'3+0E_r',e237:'0.8+0E_r',e238:'\\sqrt{E_r^2+E_f^2}-0.06',e239:'62+50E_g',e240:'120+50E_g',e241:'46+28E_g'};
 Object.keys(hl).forEach(function(id){var e=get(id);if(e.latex.slice(-1)!==')')throw 'join '+id;e.latex=e.latex.slice(0,-1)+','+hl[id]+')';});
 log.push('canopy highlights');

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
'patch11 loaded';
