// In-page builder v10: patch9 world + wide streets, parked cars, OBB collision, reverse gear, parking cam,
// street-name signs (stroke font), named facade signs.
window.__build10=function(S0,D,OPT){
 OPT=OPT||{};
 var r9=window.__build9(S0,D,{minNameLen:350}); var S=r9.S, L=S.expressions.list, log=r9.log;
 function byPrefix(p){for(var i=0;i<L.length;i++){if((L[i].latex||'').indexOf(p)===0)return L[i];}return null;}
 function byId(id){for(var i=0;i<L.length;i++){if(L[i].id===id)return L[i];}return null;}
 function fmt(v){return (Math.round(v*1000)/1000).toString();}
 function lst(a){return '['+a.map(fmt).join(',')+']';}
 var FID='f23';
 function mk(id,latex,extra){var e={type:'expression',id:id,latex:latex,hidden:true,folderId:FID};if(extra)for(var k in extra)e[k]=extra[k];return e;}
 function vis(id,latex,extra){var e=mk(id,latex,extra);e.hidden=false;return e;}
 function insertBefore(ref,arr){var i=L.indexOf(ref);if(i<0)throw 'ref missing';L.splice.apply(L,[i,0].concat(arr));}
 function insertAfter(ref,arr){var i=L.indexOf(ref);if(i<0)throw 'ref missing';L.splice.apply(L,[i+1,0].concat(arr));}
 function setLatex(prefix,latex){var e=byPrefix(prefix);if(!e)throw 'missing '+prefix;e.latex=latex;return e;}
 function rep(e,a,b){if(!e)throw 'rep: no expr for '+a;if(e.latex.indexOf(a)<0)throw 'rep: '+e.id+' lacks '+a;e.latex=e.latex.split(a).join(b);}
 function appendJoin(prefix,extra){var e=byPrefix(prefix);if(!e)throw 'appendJoin missing '+prefix;var x=e.latex;if(x.charAt(x.length-1)!==')')throw 'appendJoin form '+prefix;e.latex=x.slice(0,-1)+','+extra+')';}
 // identifier clash check
 function nrm(n){return n.replace(/_\{([A-Za-z0-9])\}/,'_$1');}
 var defined={};L.forEach(function(e){var m=/^((?:\\[a-zA-Z]+|[A-Za-z])(?:_\{[^}]*\}|_[A-Za-z0-9])?)\s*(\(|=)/.exec(e.latex||'');if(m)defined[nrm(m[1])]=e.id;});
 var mine=[];function claim(names){names.forEach(function(n){var k=nrm(n);if(defined[k])throw 'identifier clash '+n+' ('+defined[k]+')';mine.push(n);defined[k]='new';});}
 // ranges helper (same as patch9) sharing an existing cell code
 function ranges(tag,g,rows,csName,head,shareC){
  var out=[], cx='c_{'+shareC+'x}', cy='c_{'+shareC+'y}', half=(rows-1)/2;
  var k1='k_{'+tag+'1}',k2='k_{'+tag+'2}';claim([k1,k2,'A_{g'+tag+'}','B_{g'+tag+'}']);
  out.push(mk('g10_'+tag+'k1',k1+'=\\max(0,'+cx+'-'+half+')'));out.push(mk('g10_'+tag+'k2',k2+'=\\min('+(g.NX-1)+','+cx+'+'+half+')'));
  var ds=[];for(var d=-half;d<=half;d++)ds.push(d);var R='('+cy+'+['+ds.join(',')+'])';
  var An='A_{g'+tag+'}',Bn='B_{g'+tag+'}';
  out.push(mk('g10_'+tag+'A',An+'=\\left\\{0\\le '+R+'\\le '+(g.NY-1)+':'+csName+'['+R+'\\cdot'+g.NX+'+'+k1+'+1]+1,'+(head+1)+'\\right\\}'));
  out.push(mk('g10_'+tag+'B',Bn+'=\\left\\{0\\le '+R+'\\le '+(g.NY-1)+':'+csName+'['+R+'\\cdot'+g.NX+'+'+k2+'+2],'+head+'\\right\\}'));
  var parts=[];for(var j=1;j<=rows;j++)parts.push({a:An+'['+j+']',b:Bn+'['+j+']'});
  return {exprs:out,parts:parts};
 }
 var HS=D.houses, NH=D.NHEAD, NHO=HS.N, NC=D.cars.N, NPAL=D.pal.length, st=D.start;
 // =============== A. wider streets ===============
 setLatex('U_{hw}=','U_{hw}='+lst(D.HW.concat([3.4])));
 // =============== B. lane assist keeps out of the parking lane; steering works in reverse ===============
 claim(['r_{v}','w_{c}','p_{kw}']);
 var carState=byPrefix('h_s=')||byPrefix('v=');
 insertAfter(carState,[mk('g10_rv','r_{v}=0',{hidden:false,folderId:carState.folderId}),mk('g10_wc','w_{c}=0',{hidden:false,folderId:carState.folderId})]);
 var oa=byPrefix('\\omega_a=');rep(oa,'\\frac{0.8(e_l-0.5w_b)}{v+2}','\\frac{0.8(e_l-0.5(w_b-p_{kw}))}{\\left|v\\right|+2}');
 insertBefore(oa,[mk('g10_pkw','p_{kw}=\\left\\{K_s[m_b]\\le2:2.4,0\\right\\}')]);
 setLatex('w_{mx}=','w_{mx}=n_m(1.2,\\frac{8}{\\left|v\\right|+2.5})');
 setLatex('\\omega_0=','\\omega_0=\\left\\{s_e=0:\\left\\{a_l+1-r_{v}=2:\\left\\{d_b<w_b+25:\\omega_a,0\\right\\},0\\right\\},s_f\\operatorname{sign}(v)n_m(\\frac{n_m(\\left|v\\right|,9)}{l_w},\\frac{8}{\\left|v\\right|+2.5})\\right\\}');
 var cst=byPrefix('c_{st}=');rep(cst,'c_{st}=\\{s_e=0:0,','c_{st}=\\{r_{v}=1:0,\\left|v\\right|<3:0,s_e=0:0,');
 log.push('assist ok');
 // =============== C. parked cars (body + glass cabin), anchored to lane pieces ===============
 claim(['O_{cr}','O_{cp}','O_{cs}','O_{ct}','O_{cc}','O_{co}','O_{cx}','O_{cy}','G_{cc}']);
 var base=NH+NHO;
 var carEx=[mk('c10_cr','O_{cr}='+lst(D.cars.CR)),
  mk('c10_cp','O_{cp}=\\operatorname{floor}(O_{cr}/16384)+1'),mk('c10_cs','O_{cs}=2\\operatorname{mod}(\\operatorname{floor}(O_{cr}/8192),2)-1'),
  mk('c10_ct','O_{ct}=\\frac{\\operatorname{mod}(\\operatorname{floor}(O_{cr}/8),1024)}{10}-20'),mk('c10_cc','O_{cc}=\\operatorname{mod}(O_{cr},8)'),
  mk('c10_co','O_{co}=S_w[O_{cp}]-1.15'),
  mk('c10_cx','O_{cx}=S_{ax}[O_{cp}]+O_{ct}S_{ux}[O_{cp}]-O_{cs}O_{co}S_{uy}[O_{cp}]'),mk('c10_cy','O_{cy}=S_{ay}[O_{cp}]+O_{ct}S_{uy}[O_{cp}]+O_{cs}O_{co}S_{ux}[O_{cp}]'),
  mk('c10_gcc','G_{cc}='+lst(D.cars.C.map(function(c){return c+base;})))];
 insertBefore(byPrefix('B_x='),carEx);
 // Blocks become per-cell CANDIDATE lists (Desmos caps lists at 10,000 items): head + houses in the 3x3 window + cars in the window
 var CARCOL=[[238,238,236],[34,34,38],[178,182,188],[176,32,36],[36,72,150],[98,102,108],[40,84,60],[204,190,156],[52,60,72]];
 var pal=D.pal.map(function(s){return s.split(',').map(Number);}).concat(CARCOL);
 setLatex('P_{pR}=','P_{pR}='+lst(pal.map(function(c){return c[0];})));setLatex('P_{pG}=','P_{pG}='+lst(pal.map(function(c){return c[1];})));setLatex('P_{pB}=','P_{pB}='+lst(pal.map(function(c){return c[2];})));
 claim(['I_{cg}','I_{cq}','I_{cc}','I_{hw}']);
 var Ic=byPrefix('I_c=');if(!Ic)throw 'I_c';Ic.latex='I_{cg}='+Ic.latex.slice(4);
 var rc=ranges('cr',D.lane,3,'G_{cc}',base,'s');
 insertAfter(Ic,rc.exprs.concat([
  mk('c10_icq','I_{cq}=\\operatorname{join}('+rc.parts.map(function(p){return '['+p.a+'...'+p.b+']';}).join(',')+')'),
  mk('c10_icc','I_{cc}=I_{cq}[n_m(I_{cq}-'+base+','+(base+NC+1)+'-I_{cq})>0.5]-'+base),
  mk('c10_ihw','I_{hw}=I_{cg}[I_{cg}>'+NH+']-'+NH),
  mk('c10_ic','I_c=[1...\\operatorname{length}(B_x)]')]));
 function splitTopColon(s){var depth=0;for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='{'||ch==='('||ch==='[')depth++;else if(ch==='}'||ch===')'||ch===']')depth--;if(ch===':'&&depth===0)return [s.slice(0,i),s.slice(i+1)];}throw 'no colon';}
 function splitTop(s){var out=[],depth=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='{'||ch==='('||ch==='[')depth++;else if(ch==='}'||ch===')'||ch===']')depth--;if(ch===','&&depth===0){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out;}
 var CQ='I_{cc}',z0='0I_{cc}';
 var attrs=[['B_x=','O_{bx}','O_{cx}[I_{cc}]','O_{cx}[I_{cc}]'],['B_y=','O_{by}','O_{cy}[I_{cc}]','O_{cy}[I_{cc}]'],
  ['B_c=','O_{bc}','S_{ux}[O_{cp}[I_{cc}]]','S_{ux}[O_{cp}[I_{cc}]]'],['B_s=','O_{bs}','S_{uy}[O_{cp}[I_{cc}]]','S_{uy}[O_{cp}[I_{cc}]]'],
  ['B_a=','O_{ba}','2.25+'+z0,'1.2+'+z0],['B_b=','O_{bb}','0.88+'+z0,'0.8+'+z0],['B_h=','O_{bh}','0.74+'+z0,'1.32+'+z0],['B_q=','O_{bq}','0.14+'+z0,z0],
  ['B_{ci}=','O_{bi}',(NPAL+1)+'+O_{cc}[I_{cc}]',(NPAL+9)+'+'+z0],['B_{ri}=','O_{br}',(NPAL+1)+'+O_{cc}[I_{cc}]',(NPAL+1)+'+O_{cc}[I_{cc}]'],
  ['B_v=','O_{bv}','60+'+z0,'56+'+z0],['B_{st}=','O_{bt}','5+'+z0,'5+'+z0],['B_{fk}=','O_{bf}','1+'+z0,'1+'+z0],['B_z=','O_{bz}',z0,'0.74+'+z0],['B_{nc}=','O_{bn}',z0,z0]];
 claim(attrs.map(function(t){return t[1];}));
 attrs.forEach(function(t){var e=byPrefix(t[0]);if(!e)throw 'attr '+t[0];var x=e.latex.slice(t[0].length);var J='\\operatorname{join}(';
  if(x.indexOf(J)!==0||x.charAt(x.length-1)!==')')throw 'attr form '+t[0];var args=splitTop(x.slice(J.length,-1));if(args.length!==2)throw 'attr args '+t[0]+' '+args.length;
  insertBefore(e,[mk('c10_h'+t[1].replace(/[^a-z]/g,''),t[1]+'='+args[1])]);
  e.latex=t[0]+J+args[0]+','+t[1]+'[I_{hw}],'+t[2]+','+t[3]+')';});
 ['I_{rb}=','I_{ra}='].forEach(function(pf){var e=byPrefix(pf);var k=e.latex.indexOf('G_q[');if(k<0)throw 'roof filter '+pf;var m=/G_q\[(I_\{w[ab]\})\]-0\.1/.exec(e.latex);if(!m)throw 'roof pattern '+pf;
  e.latex=e.latex.replace(m[0],'n_m('+m[0]+',n_x(G_q['+m[1]+']-0.3,25-\\delta_b['+m[1]+']))');});
 log.push('cars ok NC='+NC);
 // =============== D. box-vs-box collision, front/back aware; gear-aware speed ===============
 claim(['C_{o1}','C_{o2}','C_{o3}','C_{o4}','\\kappa_a','\\kappa_b','d_{fc}','c_{fw}','c_{bk}','u_{v}','V_{g}','k_{v}']);
 var icr=byPrefix('I_{cr}=');
 claim(['I_{cn}']);
 var CN='I_{cn}';
 insertBefore(icr,[
  mk('d10_cn','I_{cn}=[1...n_{bk}][\\delta_b-G_a-G_b<3.5]'),
  mk('d10_o1','C_{o1}=0.95+\\left|\\alpha_r[I_{cn}]\\right|+\\left|\\beta_r[I_{cn}]\\right|-\\left|\\mu_r[I_{cn}]\\right|'),
  mk('d10_o2','C_{o2}=2.3+\\left|\\alpha_f[I_{cn}]\\right|+\\left|\\beta_f[I_{cn}]\\right|-\\left|\\mu_f[I_{cn}]+0.3\\right|'),
  mk('d10_o3','C_{o3}=G_a[I_{cn}]+\\frac{2.3\\left|\\alpha_f[I_{cn}]\\right|+0.95\\left|\\alpha_r[I_{cn}]\\right|-\\left|\\mu_r[I_{cn}]\\alpha_r[I_{cn}]+(\\mu_f[I_{cn}]+0.3)\\alpha_f[I_{cn}]\\right|}{G_a[I_{cn}]}'),
  mk('d10_o4','C_{o4}=G_b[I_{cn}]+\\frac{2.3\\left|\\beta_f[I_{cn}]\\right|+0.95\\left|\\beta_r[I_{cn}]\\right|-\\left|\\mu_r[I_{cn}]\\beta_r[I_{cn}]+(\\mu_f[I_{cn}]+0.3)\\beta_f[I_{cn}]\\right|}{G_b[I_{cn}]}')]);
 icr.latex='I_{cr}=I_{cn}[n_m(n_m(n_m(C_{o1},C_{o2}),n_m(C_{o3},C_{o4})),n_m(0.5-G_{nc}[I_{cn}],1.2-G_z[I_{cn}]))>0]';
 insertAfter(byPrefix('c_r='),[
  mk('d10_ka','\\kappa_a=n_x(-G_a[I_{cr}],n_m(G_a[I_{cr}],-\\frac{\\mu_r[I_{cr}]\\alpha_r[I_{cr}]+(\\mu_f[I_{cr}]+0.3)\\alpha_f[I_{cr}]}{G_a[I_{cr}]}))'),
  mk('d10_kb','\\kappa_b=n_x(-G_b[I_{cr}],n_m(G_b[I_{cr}],-\\frac{\\mu_r[I_{cr}]\\beta_r[I_{cr}]+(\\mu_f[I_{cr}]+0.3)\\beta_f[I_{cr}]}{G_b[I_{cr}]}))'),
  mk('d10_df','d_{fc}=\\mu_f[I_{cr}]+0.3+\\frac{\\kappa_a\\alpha_f[I_{cr}]}{G_a[I_{cr}]}+\\frac{\\kappa_b\\beta_f[I_{cr}]}{G_b[I_{cr}]}'),
  mk('d10_cf','c_{fw}=\\left\\{c_r=1:\\left\\{\\max(d_{fc})>0:1,0\\right\\},0\\right\\}'),
  mk('d10_cb','c_{bk}=\\left\\{c_r=1:\\left\\{\\min(d_{fc})\\le0:1,0\\right\\},0\\right\\}'),
  mk('d10_uv','u_{v}=(1-2r_{v})v'),mk('d10_vg','V_{g}=27-20r_{v}'),
  mk('d10_kv','k_{v}(x)=x-c_{fw}n_x(x,0)-c_{bk}n_m(x,0)')]);
 // ticker
 var T=S.expressions.ticker, H=T.handlerLatex;
 function splitTop(s){var out=[],depth=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='{'||ch==='('||ch==='[')depth++;else if(ch==='}'||ch===')'||ch===']')depth--;if(ch===','&&depth===0){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out;}
 var parts=splitTop(H);var dtf='\\frac{\\min(\\operatorname{dt},100)}{1000}';var seen={};
 parts=parts.map(function(a){
  if(a.indexOf('v\\to')===0){seen.v=1;return 'v\\to\\left\\{z_q>z_r:0,k_{v}((1-2r_{v})\\max(0,u_{v}+'+dtf+'(\\operatorname{sign}(g)n_x(-2,n_m(3.5,1.2(V_{g}g-u_{v})))-0.03u_{v}-0.15\\operatorname{sign}(u_{v})-8b-o_r(0.5u_{v}+0.8))))\\right\\}';}
  if(a.indexOf('p_x\\to')===0){seen.px=1;if(a.indexOf('v\\sin(h)')<0)throw 'px form';return a.replace('v\\sin(h)','k_{v}(v)\\sin(h)');}
  if(a.indexOf('p_y\\to')===0){seen.py=1;if(a.indexOf('v\\cos(h)')<0)throw 'py form';return a.replace('v\\cos(h)','k_{v}(v)\\cos(h)');}
  return a;});
 if(!(seen.v&&seen.px&&seen.py))throw 'ticker parts '+JSON.stringify(seen);
 T.handlerLatex=parts.join(',')+',p_{cm}\\to\\left\\{c_{am}=1:\\operatorname{round}(10(p_x+2600))\\cdot326774284+\\operatorname{round}(10(p_y+2600))\\cdot6284+\\operatorname{mod}(\\operatorname{round}(1000\\operatorname{mod}(h,2\\pi)),6284),p_{cm}\\right\\},s_{gq}\\to\\left\\{I_{q3}[1]>0:1000I_{q3}[1],0\\right\\}+\\left\\{I_{q3}[2]>0:I_{q3}[2],0\\right\\},s_{gp}\\to\\left\\{I_{p2}[1]>0:100I_{p2}[1],0\\right\\}+\\left\\{I_{p2}[2]>0:I_{p2}[2],0\\right\\}';
 // START OVER also returns to Drive
 L.forEach(function(e){if(e.clickableInfo&&e.clickableInfo.latex&&e.clickableInfo.latex.indexOf('z_q\\to z_q+1')===0)e.clickableInfo.latex+=',r_{v}\\to0';});
 // speed shown as magnitude
 setLatex('v_{mph}=','v_{mph}=\\operatorname{round}(2.237\\left|v\\right|)');
 L.forEach(function(e){if((e.latex||'').indexOf('a_v(2.237v)')>=0)e.latex=e.latex.split('a_v(2.237v)').join('a_v(2.237\\left|v\\right|)');});
 // bump messages
 var cr3=byId('cr3');if(!cr3)throw 'cr3';cr3.latex='(0,0.45)\\{c_{fw}=1\\}';cr3.label='💥 Bump! Shift to R (reverse) and back up';
 var cr3b=JSON.parse(JSON.stringify(cr3));cr3b.id='cr3b';cr3b.latex='(0,0.45)\\{c_{bk}=1\\}\\{c_{fw}=0\\}';cr3b.label='💥 Bump! Shift to D (drive) and pull forward';insertAfter(cr3,[cr3b]);
 log.push('collision+gear ok');
 // =============== gear + cam buttons on the dashboard ===============
 var lab=byId('e376');var btn=byId('e375');if(!lab||!btn)throw 'dash refs';
 function lbl(id,latex,text,size,click,color){var e=JSON.parse(JSON.stringify(lab));e.id=id;e.latex=latex;e.label=text;e.labelSize=size;e.color=color||'#ffffff';if(click)e.clickableInfo={enabled:true,latex:click};else delete e.clickableInfo;return e;}
 var gclick='r_{v}\\to\\left\\{\\left|v\\right|<1.5:1-r_{v},r_{v}\\right\\}', cclick='w_{c}\\to1-w_{c}';
 var gb=JSON.parse(JSON.stringify(btn));gb.id='gr_btn';gb.latex='\\operatorname{polygon}((-1.16,-0.832),(-0.96,-0.832),(-0.96,-0.722),(-1.16,-0.722))';
 gb.colorLatex='\\operatorname{rgb}(\\left\\{r_{v}=1:214,40\\right\\},\\left\\{r_{v}=1:104,118\\right\\},\\left\\{r_{v}=1:24,74\\right\\})';gb.clickableInfo={enabled:true,latex:gclick};
 var cb=JSON.parse(JSON.stringify(btn));cb.id='cam_btn';cb.latex='\\operatorname{polygon}((-1.16,-0.902),(-0.96,-0.902),(-0.96,-0.846),(-1.16,-0.846))';
 cb.colorLatex='\\operatorname{rgb}(\\left\\{w_{c}=1:40,70\\right\\},\\left\\{w_{c}=1:110,74\\right\\},\\left\\{w_{c}=1:190,84\\right\\})';cb.clickableInfo={enabled:true,latex:cclick};
 var dash=[gb,lbl('gr_l1','(-1.06,-0.743)','GEAR (stop to shift)','0.5',gclick),
  lbl('gr_l2','(-1.06,-0.79)\\{r_{v}=0\\}','D  ·  drive','0.85',gclick),lbl('gr_l3','(-1.06,-0.79)\\{r_{v}=1\\}','R  ·  reverse','0.85',gclick),
  cb,lbl('cam_l1','(-1.06,-0.874)\\{w_{c}=1\\}','PARK CAM: ON','0.55',cclick),lbl('cam_l2','(-1.06,-0.874)\\{w_{c}=0\\}','PARK CAM: AUTO','0.55',cclick)];
 insertAfter(lab,dash);
 // =============== E. parking cam (top-down, shows when in R or when PARK CAM is on) ===============
 claim(['c_{am}','I_{pc}','V_{ax}','V_{ay}','V_{bx}','V_{by}','V_{ar}','V_{af}','V_{br}','V_{bf}','V_{dx}','V_{dy}','V_{t1}','V_{t2}','V_{t3}','V_{t4}','V_{lo}','V_{hi}','I_{pe}','I_{pk}','I_{pq}',
  'V_{sx}','V_{sy}','V_{ex}','V_{ey}','V_{1x}','V_{1y}','V_{2x}','V_{2y}','V_{3x}','V_{3y}','V_{4x}','V_{4y}','c_{gd}','P_{ok}','\\sigma_c','q_{cx}','q_{cy}','h_{cm}','p_{cm}','x_{cq}','y_{cq}','h_{cq}','c_{hq}','s_{hq}','g_{cr}','g_{cf}']);
 var PMc=Math.round((st.x+2600)*10)*326774284+Math.round((st.y+2600)*10)*6284+Math.round(1000*(((st.h%(2*Math.PI))+2*Math.PI)%(2*Math.PI)));
 var CX=1.6,CY=0.64,HC=0.315,SC=fmt(HC/11);
 function pc(xe,ye){return 'n_x(-h_{cm},n_m(h_{cm},\\sigma_c g_{cr}('+xe+','+ye+')))';}
 function pcf(xe,ye){return 'n_x(-h_{cm},n_m(h_{cm},\\sigma_c(g_{cf}('+xe+','+ye+')+0.3)))';}
 var camH=[mk('e10_cam','c_{am}=\\left\\{r_{v}+w_{c}>0.5:1\\right\\}'),mk('e10_pcm','p_{cm}='+PMc),
  mk('e10_xcq','x_{cq}=\\frac{\\operatorname{floor}(p_{cm}/326774284)}{10}-2600'),mk('e10_ycq','y_{cq}=\\frac{\\operatorname{mod}(\\operatorname{floor}(p_{cm}/6284),52001)}{10}-2600'),mk('e10_hcq','h_{cq}=\\frac{\\operatorname{mod}(p_{cm},6284)}{1000}'),
  mk('e10_chq','c_{hq}=\\cos(h_{cq})'),mk('e10_shq','s_{hq}=\\sin(h_{cq})'),mk('e10_gcr','g_{cr}(x,y)=(x-x_{cq})c_{hq}-(y-y_{cq})s_{hq}'),mk('e10_gcf','g_{cf}(x,y)=(x-x_{cq})s_{hq}+(y-y_{cq})c_{hq}'),mk('e10_sc','\\sigma_c='+SC),mk('e10_cx','q_{cx}='+CX),mk('e10_cy','q_{cy}='+CY),mk('e10_hc','h_{cm}='+HC),
  mk('e10_ipc','I_{pc}=I_s[(S_{mx}[I_s]-x_{cq})^2+(S_{my}[I_s]-y_{cq})^2<(24+S_l[I_s])^2c_{am}]'),
  mk('e10_vax','V_{ax}=\\operatorname{join}(S_{ax}[I_{pc}]-S_w[I_{pc}]S_{uy}[I_{pc}],S_{ax}[I_{pc}]+S_w[I_{pc}]S_{uy}[I_{pc}])'),
  mk('e10_vay','V_{ay}=\\operatorname{join}(S_{ay}[I_{pc}]+S_w[I_{pc}]S_{ux}[I_{pc}],S_{ay}[I_{pc}]-S_w[I_{pc}]S_{ux}[I_{pc}])'),
  mk('e10_vbx','V_{bx}=\\operatorname{join}(S_{bx}[I_{pc}]-S_w[I_{pc}]S_{uy}[I_{pc}],S_{bx}[I_{pc}]+S_w[I_{pc}]S_{uy}[I_{pc}])'),
  mk('e10_vby','V_{by}=\\operatorname{join}(S_{by}[I_{pc}]+S_w[I_{pc}]S_{ux}[I_{pc}],S_{by}[I_{pc}]-S_w[I_{pc}]S_{ux}[I_{pc}])'),
  mk('e10_var','V_{ar}=\\sigma_cg_{cr}(V_{ax},V_{ay})'),mk('e10_vaf','V_{af}=\\sigma_c(g_{cf}(V_{ax},V_{ay})+0.3)'),
  mk('e10_vbr','V_{br}=\\sigma_cg_{cr}(V_{bx},V_{by})'),mk('e10_vbf','V_{bf}=\\sigma_c(g_{cf}(V_{bx},V_{by})+0.3)'),
  mk('e10_vdx','V_{dx}=V_{br}-V_{ar}+10^{-9}'),mk('e10_vdy','V_{dy}=V_{bf}-V_{af}+10^{-9}'),
  mk('e10_t1','V_{t1}=\\frac{-h_{cm}-V_{ar}}{V_{dx}}'),mk('e10_t2','V_{t2}=\\frac{h_{cm}-V_{ar}}{V_{dx}}'),mk('e10_t3','V_{t3}=\\frac{-h_{cm}-V_{af}}{V_{dy}}'),mk('e10_t4','V_{t4}=\\frac{h_{cm}-V_{af}}{V_{dy}}'),
  mk('e10_tlo','V_{lo}=n_x(0,n_x(n_m(V_{t1},V_{t2}),n_m(V_{t3},V_{t4})))'),mk('e10_thi','V_{hi}=n_m(1,n_m(n_x(V_{t1},V_{t2}),n_x(V_{t3},V_{t4})))'),
  mk('e10_ipe','I_{pe}=[1...\\operatorname{length}(V_{lo})][V_{lo}<V_{hi}]'),
  mk('e10_vsx','V_{sx}=q_{cx}+V_{ar}+V_{lo}V_{dx}'),mk('e10_vsy','V_{sy}=q_{cy}+V_{af}+V_{lo}V_{dy}'),mk('e10_vex','V_{ex}=q_{cx}+V_{ar}+V_{hi}V_{dx}'),mk('e10_vey','V_{ey}=q_{cy}+V_{af}+V_{hi}V_{dy}'),
  mk('e10_ipk','I_{pk}=I_c[(B_{cx}-x_{cq})^2+(B_{cy}-y_{cq})^2<484c_{am}]'),
  mk('e10_ipq','I_{pq}=I_{pk}[n_m(0.5-B_z[I_{pk}],n_m(11+B_a[I_{pk}]+B_b[I_{pk}]-\\left|g_{cr}(B_x[I_{pk}],B_y[I_{pk}])\\right|,11+B_a[I_{pk}]+B_b[I_{pk}]-\\left|g_{cf}(B_x[I_{pk}],B_y[I_{pk}])+0.3\\right|))>0]')];
 [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(uw,k){var u=uw[0],w=uw[1];
  var xe='B_x[I_{pq}]'+(u>0?'+':'-')+'B_a[I_{pq}]B_c[I_{pq}]'+(w>0?'-':'+')+'B_b[I_{pq}]B_s[I_{pq}]';
  var ye='B_y[I_{pq}]'+(u>0?'+':'-')+'B_a[I_{pq}]B_s[I_{pq}]'+(w>0?'+':'-')+'B_b[I_{pq}]B_c[I_{pq}]';
  camH.push(mk('e10_v'+(k+1)+'x','V_{'+(k+1)+'x}=q_{cx}+'+pc(xe,ye)));camH.push(mk('e10_v'+(k+1)+'y','V_{'+(k+1)+'y}=q_{cy}+'+pcf(xe,ye)));});
 camH.push(mk('e10_cgd','c_{gd}=\\frac{\\operatorname{round}(10(w_b-d_b-0.95))}{10}'));
 camH.push(mk('e10_pok','P_{ok}=\\left\\{\\left|v\\right|<0.05:\\left\\{c_r=0:\\left\\{p_{kw}>0:\\left\\{\\left|w_b-d_b-1.15\\right|<0.45:\\left\\{\\left|a_r\\right|<0.13:1,0\\right\\},0\\right\\},0\\right\\},0\\right\\},0\\right\\}'));
 insertAfter(byPrefix('k_{v}('),camH);
 var lastE=L[L.length-1];
 var camV=[
  vis('e10_bg','\\operatorname{polygon}(q_{cx}+h_{cm}\\cdot[-1,1,1,-1]c_{am},q_{cy}+h_{cm}\\cdot[-1,-1,1,1]c_{am})',{color:'#3d4046',fill:true,fillOpacity:'1',lines:false}),
  vis('e10_curb','\\operatorname{polygon}((V_{sx}[I_{pe}],V_{sy}[I_{pe}]),(V_{ex}[I_{pe}],V_{ey}[I_{pe}]))',{color:'#e6e6e0',fill:false,lines:true,lineWidth:'3'}),
  vis('e10_blk','\\operatorname{polygon}((V_{1x},V_{1y}),(V_{2x},V_{2y}),(V_{3x},V_{3y}),(V_{4x},V_{4y}))',{color:'#999999',colorLatex:'\\operatorname{rgb}(B_R[I_{pq}],B_G[I_{pq}],B_B[I_{pq}])',fill:true,fillOpacity:'1',lines:true,lineWidth:'1'}),
  vis('e10_me','\\operatorname{polygon}(q_{cx}+\\sigma_c\\cdot[-0.95,0.95,0.95,-0.95]c_{am},q_{cy}+\\sigma_c\\cdot[-2.3,-2.3,2.3,2.3]c_{am})',{color:'#f2a91c',fill:true,fillOpacity:'1',lines:true,lineWidth:'1.5'}),
  vis('e10_ws','\\operatorname{polygon}(q_{cx}+\\sigma_c\\cdot[-0.75,0.75,0.65,-0.65]c_{am},q_{cy}+\\sigma_c\\cdot[0.9,0.9,1.5,1.5]c_{am})',{color:'#33404f',fill:true,fillOpacity:'1',lines:false}),
  vis('e10_fr','(q_{cx}+0c_{am},q_{cy}+h_{cm}-0.03)',{color:'#ffffff',showLabel:true,label:'PARKING CAM · orange = you',pointSize:'0',labelSize:'0.6',labelOrientation:'center',suppressTextOutline:true}),
  vis('e10_gap','(q_{cx}+0c_{am},q_{cy}-h_{cm}+0.035)\\{p_{kw}>0\\}',{color:'#ffffff',showLabel:true,label:'gap to curb: ${c_{gd}} m',pointSize:'0',labelSize:'0.65',labelOrientation:'center',suppressTextOutline:true}),
  vis('e10_ok','(0,0.3)\\{P_{ok}=1\\}',{color:'#2f9e44',showLabel:true,label:'🅿️ PARKED! Nice parallel parking ✓',pointSize:'0',labelSize:'1.4',labelOrientation:'center'})];
 L.push.apply(L,camV);
 ['e534','e536','e538','e539','e541','e542'].forEach(function(id){var e=byId(id);if(e)e.latex+='\\left\\{r_{v}+w_{c}<0.5\\right\\}';});
 log.push('parking cam ok');
 // =============== F/G. stroke-font text: street signs + named facades ===============
 var TX=D.text, SG=D.signs, PS=D.poiSigns, GM=TX.GM;
 claim(['F_{pp}','Z_{3}','Z_{s}','Z_{n}','H_{q1}','H_{q2}','H_{qc}','H_{qx}','H_{qy}','H_{qa}','H_{qb}','I_{q0}','I_{q1}','I_{q2}','I_{q3}','H_{qf}','H_{qr}','H_{qd}',
  'T_{sr}','T_{sf}','T_{sg}','T_{sX}','N_{tq}','X_{tq}','Y_{tq}','S_{tq}','W_{tq}','h_{lq}','m_{sg}',
  'J_{ka}','J_{ca}','J_{pa}','n_{ea}','c_{ia}','c_{ea}','g_{ea}','x_{ta}','y_{ta}',
  'R_{px}','R_{py}','R_{pz}','R_{pt}','R_{pu}','R_{pm}','R_{pi}','R_{pd}','R_{pf}','R_{pr}','I_{pv}','I_{p2}',
  's_{gq}','s_{gp}','q_{sl}','P_{sl}','g_{eq}','I_{ta}','K_{ta}','G_{xb}','G_{yb}','g_{fq}','I_{tb}','X_{wc}','Y_{wc}','Z_{wc}','J_{kb}','J_{cb}','J_{pb}','G_{xa}','G_{ya}','X_{wb}','Y_{wb}','Q_{bl}','Q_{br}','Q_{bb}','Q_{bt}','Q_{pl}','Q_{pr}','Q_{pb}','Q_{pt}','i_{eb}','n_{eb}','c_{ib}','c_{eb}','g_{eb}','u_{eb}','X_{eb}','Y_{eb}','F_{eb}','x_{tb}','y_{tb}','X_{tx}','Y_{tx}']);
 var NS=SG.N, NSA=20*GM*4, NPB=30*GM*2;
 var rq=ranges('q',HS,3,'H_{qc}',0,'b');
 var txt=[mk('t10_fp','F_{pp}='+lst(TX.FP)),mk('t10_z3','Z_{3}='+lst(TX.Z3)),mk('t10_zs','Z_{s}='+lst(TX.ZS)),mk('t10_zn','Z_{n}='+lst(TX.ZN)),
  mk('t10_q1','H_{q1}='+lst(SG.G1)),mk('t10_q2','H_{q2}='+lst(SG.G2)),mk('t10_qc','H_{qc}='+lst(SG.C)),
  mk('t10_qx','H_{qx}=\\frac{\\operatorname{floor}(H_{q1}/'+D.QM+')}{10}-'+D.OFF),mk('t10_qy','H_{qy}=\\frac{\\operatorname{mod}(H_{q1},'+D.QM+')}{10}-'+D.OFF),
  mk('t10_qa','H_{qa}=\\operatorname{floor}(H_{q2}/512)'),mk('t10_qb','H_{qb}=\\operatorname{mod}(H_{q2},512)')].concat(rq.exprs).concat([
  mk('t10_i0','I_{q0}=\\operatorname{join}('+rq.parts.map(function(p){return '['+p.a+'...'+p.b+']';}).join(',')+')'),
  mk('t10_i1','I_{q1}=I_{q0}[n_m(n_m(I_{q0},'+(NS+1)+'-I_{q0})-0.5,3400-(H_{qx}[I_{q0}]-x_m)^2-(H_{qy}[I_{q0}]-y_m)^2)>0]'),
  mk('t10_qf','H_{qf}=g_f(H_{qx}[I_{q1}],H_{qy}[I_{q1}])'),mk('t10_qr','H_{qr}=g_r(H_{qx}[I_{q1}],H_{qy}[I_{q1}])'),
  mk('t10_i2','I_{q2}=I_{q1}[n_m(H_{qf}+2,1.3H_{qf}+10-\\left|H_{qr}\\right|)>0]'),
  mk('t10_qd','H_{qd}=(H_{qx}[I_{q2}]-x_m)^2+(H_{qy}[I_{q2}]-y_m)^2'),
  mk('t10_i3','I_{q3}=\\operatorname{sort}(I_{q2},H_{qd})[[1,2]]'),
  mk('t10_sgq','s_{gq}=0'),mk('t10_sgp','s_{gp}=0'),mk('t10_qsl','q_{sl}=[\\operatorname{floor}(s_{gq}/1000),\\operatorname{mod}(s_{gq},1000)]'),
  mk('t10_sr','T_{sr}=f_r(H_{qx}[q_{sl}],H_{qy}[q_{sl}])'),mk('t10_sf','T_{sf}=f_f(H_{qx}[q_{sl}],H_{qy}[q_{sl}])'),
  mk('t10_sg','T_{sg}=\\left\\{T_{sf}>1.5:\\frac{k_f}{T_{sf}}\\right\\}'),mk('t10_sX','T_{sX}=k_fT_{sr}/T_{sf}'),
  mk('t10_ms','m_{sg}=0.062'),
  mk('t10_nt','N_{tq}=[H_{qa}[q_{sl}[1]],H_{qb}[q_{sl}[1]],H_{qa}[q_{sl}[2]],H_{qb}[q_{sl}[2]]]'),
  mk('t10_xt','X_{tq}=T_{sX}[[1,1,2,2]]'),mk('t10_st','S_{tq}=T_{sg}[[1,1,2,2]]'),
  mk('t10_yt','Y_{tq}=y_0+k_f\\frac{[3.12,2.62,3.12,2.62]-e_y}{T_{sf}[[1,1,2,2]]}'),
  mk('t10_wt','W_{tq}=4.6Z_{n}[N_{tq}]-1.4'),mk('t10_hl','h_{lq}=\\frac{W_{tq}m_{sg}}{2}+0.22'),
  mk('t10_jk','J_{ka}=\\operatorname{floor}(\\frac{[1...'+NSA+']-1}{'+(20*GM)+'})+1'),mk('t10_jc','J_{ca}=\\operatorname{mod}(\\operatorname{floor}(\\frac{[1...'+NSA+']-1}{'+GM+'}),20)'),mk('t10_jp','J_{pa}=\\operatorname{mod}([1...'+NSA+']-1,'+GM+')+1'),
  mk('t10_ne','n_{ea}=N_{tq}[J_{ka}]'),mk('t10_ci','c_{ia}=Z_{s}[n_{ea}]+J_{ca}'),
  mk('t10_ce','c_{ea}=\\left\\{J_{ca}<Z_{n}[n_{ea}]:\\operatorname{mod}(\\operatorname{floor}(\\frac{Z_{3}[\\operatorname{floor}(c_{ia}/3)+1]}{[4096,64,1][\\operatorname{mod}(c_{ia},3)+1]}),64),0\\right\\}'),
  mk('t10_ge','g_{ea}=F_{pp}['+GM+'(c_{ea}-1)+J_{pa}]'),
  mk('t10_gxa','G_{xa}=\\left\\{g_{ea}\\ge0:m_{sg}(0.08\\operatorname{floor}(g_{ea}/100)+4.6J_{ca}-\\frac{W_{tq}[J_{ka}]}{2})\\right\\}'),mk('t10_gya','G_{ya}=m_{sg}(\\frac{\\operatorname{mod}(g_{ea},100)}{10}-3)'),
  mk('t10_geq','g_{eq}=\\operatorname{join}([-1],g_{ea}[1...'+(NSA-1)+'])'),mk('t10_ita','I_{ta}=[1...'+NSA+'][\\left\\{g_{ea}\\ge0:1,g_{eq}\\ge0:1,0\\right\\}=1]'),
  mk('t10_kta','K_{ta}=J_{ka}[I_{ta}]'),mk('t10_gxb','G_{xb}=G_{xa}[I_{ta}]'),mk('t10_gyb','G_{yb}=G_{ya}[I_{ta}]'),
  mk('t10_xa','x_{ta}=X_{tq}[K_{ta}]+S_{tq}[K_{ta}]G_{xb}'),mk('t10_ya','y_{ta}=Y_{tq}[K_{ta}]+S_{tq}[K_{ta}]G_{yb}'),
  // ---- facade name signs
  mk('t10_px','R_{px}='+lst(PS.x)),mk('t10_py','R_{py}='+lst(PS.y)),mk('t10_pz','R_{pz}='+lst(PS.z)),mk('t10_pt','R_{pt}='+lst(PS.tx)),mk('t10_pu','R_{pu}='+lst(PS.ty)),
  mk('t10_pm','R_{pm}='+lst(PS.m)),mk('t10_pi','R_{pi}='+lst(PS.id)),
  mk('t10_pd','R_{pd}=(R_{px}-x_m)^2+(R_{py}-y_m)^2'),mk('t10_pf','R_{pf}=g_f(R_{px},R_{py})'),mk('t10_pr','R_{pr}=g_r(R_{px},R_{py})'),
  mk('t10_pv','I_{pv}=[1...'+PS.N+'][n_m(n_m(22500-R_{pd},(x_m-R_{px})R_{pu}-(y_m-R_{py})R_{pt}-0.5),n_m(R_{pf}-2,1.4R_{pf}+18-\\left|R_{pr}\\right|))>0]'),
  mk('t10_p2','I_{p2}=\\operatorname{sort}(I_{pv},R_{pd}[I_{pv}])[[1,2]]'),
  mk('t10_kb','J_{kb}=\\operatorname{floor}(\\frac{[1...'+NPB+']-1}{'+(30*GM)+'})+1'),mk('t10_cb','J_{cb}=\\operatorname{mod}(\\operatorname{floor}(\\frac{[1...'+NPB+']-1}{'+GM+'}),30)'),mk('t10_pb','J_{pb}=\\operatorname{mod}([1...'+NPB+']-1,'+GM+')+1'),
  mk('t10_psl','P_{sl}=[\\operatorname{floor}(s_{gp}/100),\\operatorname{mod}(s_{gp},100)]'),mk('t10_ieb','i_{eb}=P_{sl}[J_{kb}]'),mk('t10_neb','n_{eb}=R_{pi}[i_{eb}]'),mk('t10_cib','c_{ib}=Z_{s}[n_{eb}]+J_{cb}'),
  mk('t10_ceb','c_{eb}=\\left\\{J_{cb}<Z_{n}[n_{eb}]:\\operatorname{mod}(\\operatorname{floor}(\\frac{Z_{3}[\\operatorname{floor}(c_{ib}/3)+1]}{[4096,64,1][\\operatorname{mod}(c_{ib},3)+1]}),64),0\\right\\}'),
  mk('t10_geb','g_{eb}=F_{pp}['+GM+'(c_{eb}-1)+J_{pb}]'),
  mk('t10_ueb','u_{eb}=R_{pm}[i_{eb}](0.08\\operatorname{floor}(g_{eb}/100)+4.6J_{cb}-\\frac{4.6Z_{n}[n_{eb}]-1.4}{2})'),
  mk('t10_xwb','X_{wb}=\\left\\{g_{eb}\\ge0:R_{px}[i_{eb}]+u_{eb}R_{pt}[i_{eb}]\\right\\}'),mk('t10_ywb','Y_{wb}=R_{py}[i_{eb}]+u_{eb}R_{pu}[i_{eb}]'),
  mk('t10_Yeb','Y_{eb}=R_{pz}[i_{eb}]+R_{pm}[i_{eb}](\\frac{\\operatorname{mod}(g_{eb},100)}{10}-3)'),
  mk('t10_gfq','g_{fq}=\\operatorname{join}([-1],g_{eb}[1...'+(NPB-1)+'])'),mk('t10_itb','I_{tb}=[1...'+NPB+'][\\left\\{g_{eb}\\ge0:1,g_{fq}\\ge0:1,0\\right\\}=1]'),
  mk('t10_xwc','X_{wc}=X_{wb}[I_{tb}]'),mk('t10_ywc','Y_{wc}=Y_{wb}[I_{tb}]'),mk('t10_zwc','Z_{wc}=Y_{eb}[I_{tb}]'),
  mk('t10_Xeb','X_{eb}=f_r(X_{wc},Y_{wc})'),
  mk('t10_Feb','F_{eb}=f_f(X_{wc},Y_{wc})'),
  mk('t10_xb','x_{tb}=\\left\\{F_{eb}>c_p:\\frac{k_fX_{eb}}{F_{eb}}\\right\\}'),
  mk('t10_yb','y_{tb}=y_0+\\frac{k_f(Z_{wc}-e_y)}{F_{eb}}'),
  mk('t10_qbl','Q_{bl}=X_{tq}-h_{lq}S_{tq}'),mk('t10_qbr','Q_{br}=X_{tq}+h_{lq}S_{tq}'),mk('t10_qbb','Q_{bb}=Y_{tq}-0.23S_{tq}'),mk('t10_qbt','Q_{bt}=Y_{tq}+0.23S_{tq}'),
  mk('t10_qpl','Q_{pl}=T_{sX}-0.07T_{sg}'),mk('t10_qpr','Q_{pr}=T_{sX}+0.07T_{sg}'),mk('t10_qpb','Q_{pb}=y_0-e_yT_{sg}'),mk('t10_qpt','Q_{pt}=y_0+(3.38-e_y)T_{sg}'),
  mk('t10_X','X_{tx}=\\operatorname{join}(x_{ta},x_{tb})'),mk('t10_Y','Y_{tx}=\\operatorname{join}(y_{ta},y_{tb})')]);
 var face=byId('e286');if(!face)throw 'faces';
 insertAfter(byPrefix('c_{gd}='),txt);
 var signV=[
  vis('t10_pole','\\operatorname{polygon}((Q_{pl},Q_{pb}),(Q_{pr},Q_{pb}),(Q_{pr},Q_{pt}),(Q_{pl},Q_{pt}))',{color:'#5b6066',fill:true,fillOpacity:'1',lines:false}),
  vis('t10_blade','\\operatorname{polygon}((Q_{bl},Q_{bb}),(Q_{br},Q_{bb}),(Q_{br},Q_{bt}),(Q_{bl},Q_{bt}))',{color:'#0b6b3a',fill:true,fillOpacity:'1',lines:true,lineWidth:'1.5'}),
  vis('t10_text','(X_{tx},Y_{tx})',{color:'#ffffff',points:false,lines:true,lineWidth:'2'})];
 insertAfter(face,signV);
 // =============== H. floating POI labels: hide when close (the facade sign takes over) ===============
 var ypq=byPrefix('Y_{pq}=');rep(ypq,'D_p<420:','70<D_p<420:');
 // =============== ticker latches become CONDITIONAL actions (an assignment re-triggers every dependent, even with an unchanged value)
 (function(){var T=S.expressions.ticker;var parts=splitTop(T.handlerLatex);var out=[];
  parts.forEach(function(a){var m;
   var simple=['c_{al}','n_{rl}','u_d','z_r','s_{gq}','s_{gp}'];
   for(var k=0;k<simple.length;k++){var X=simple[k];if(a.indexOf(X+'\\to')===0){var Y=a.slice((X+'\\to').length);out.push('\\left\\{\\left|'+Y+'-'+X+'\\right|>0.5:'+X+'\\to '+Y+'\\right\\}');return;}}
   if(a.indexOf('p_m\\to\\left\\{')===0&&/,p_m\\right\\}$/.test(a)){var body=a.slice('p_m\\to\\left\\{'.length,a.length-',p_m\\right\\}'.length);var c=splitTopColon(body);out.push('\\left\\{'+c[0]+':p_m\\to '+c[1]+'\\right\\}');return;}
   if(a.indexOf('p_{cm}\\to\\left\\{c_{am}=1:')===0&&/,p_{cm}\\right\\}$/.test(a)){var V=a.slice('p_{cm}\\to\\left\\{c_{am}=1:'.length,a.length-',p_{cm}\\right\\}'.length);out.push('\\left\\{c_{am}\\left|'+V+'-p_{cm}\\right|>0.5:p_{cm}\\to '+V+'\\right\\}');return;}
   out.push(a);});
  T.handlerLatex=out.join(',');})();
 (function(){var lastF1=-1;L.forEach(function(e,i){if(e.folderId==='f1')lastF1=i;});if(lastF1<0)return;
  L.splice(lastF1+1,0,{type:'text',id:'n10_park',folderId:'f1',text:'🅿️ PARALLEL PARKING PRACTICE: side streets are wider and have parked cars with open gaps. Pull up beside the car in front of a gap, tap GEAR to shift into R (reverse), press GAS gently and turn the knob to back in — the PARKING CAM (top-right) shows your car in orange, the parked cars and the curb. Turn LANE ASSIST off while parking. "PARKED!" appears when you are straight, stopped and close to the curb. If you bump a car, the message tells you which gear gets you out.'},
   {type:'text',id:'n10_signs',folderId:'f1',text:'🪧 Green street signs at the corners show the street names, and the buildings now carry their names on their signs (look for the new Syosset LIRR station house with the colorful glass sail sculpture). PARK CAM: tap it to keep the top-down camera on while driving forward.'});})();
 log.push('signs+text ok');
 return {S:S,log:log,mine:mine};
};
'patch10 loaded';
