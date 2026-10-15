// In-page builder v6: compact, host-anchored world data (window.__D2) applied to FINAL6-lineage state
window.__build9=function(S0,D,OPT){
 OPT=OPT||{}; var S=JSON.parse(JSON.stringify(S0)); var L=S.expressions.list; var log=[];
 function byPrefix(p){for(var i=0;i<L.length;i++){if((L[i].latex||'').indexOf(p)===0)return L[i];}return null;}
 function byId(id){for(var i=0;i<L.length;i++){if(L[i].id===id)return L[i];}return null;}
 function fmt(v){return (Math.round(v*1000)/1000).toString();}
 function lst(a){return '['+a.map(fmt).join(',')+']';}
 var FID='f23';
 function mk(id,latex,extra){var e={type:'expression',id:id,latex:latex,hidden:true,folderId:FID};if(extra)for(var k in extra)e[k]=extra[k];return e;}
 function insertBefore(ref,arr){var i=L.indexOf(ref);if(i<0)throw 'ref missing';L.splice.apply(L,[i,0].concat(arr));}
 function insertAfter(ref,arr){var i=L.indexOf(ref);if(i<0)throw 'ref missing';L.splice.apply(L,[i+1,0].concat(arr));}
 function remove(pred){S.expressions.list=L=L.filter(function(e){return !pred(e);});}
 function setLatex(prefix,latex){var e=byPrefix(prefix);if(!e)throw 'missing '+prefix;e.latex=latex;return e;}
 var tick=[];
 // grid ranges (cell expressions computed live; cumulative list csName defined by caller)
 var CB={b:[1,1100],t:[1100,600],s:[660000,2200]};
 function ranges(tag,g,px,py,rows,csName,head,shareC){
  var out=[], ct=shareC||tag, cx='c_{'+ct+'x}', cy='c_{'+ct+'y}', half=(rows-1)/2;
  if(!shareC){
   if(CB[tag]){var m=CB[tag][0],base=CB[tag][1];var code='\\operatorname{mod}(\\operatorname{floor}(c_{al}/'+m+'),'+base+')';
    out.push(mk('g8_'+tag+'cx',cx+'=\\operatorname{mod}('+code+','+g.NX+')'));
    out.push(mk('g8_'+tag+'cy',cy+'=\\operatorname{floor}('+code+'/'+g.NX+')-1'));}
   else{
    out.push(mk('g8_'+tag+'cx',cx+'=\\max(0,\\min('+(g.NX-1)+',\\operatorname{floor}(\\frac{'+px+'-('+g.x0+')}{'+g.G+'})))'));
    out.push(mk('g8_'+tag+'cy',cy+'=\\operatorname{floor}(\\frac{'+py+'-('+g.y0+')}{'+g.G+'})'));}}
  var k1='k_{'+tag+'1}',k2='k_{'+tag+'2}';
  out.push(mk('g8_'+tag+'k1',k1+'=\\max(0,'+cx+'-'+half+')'));out.push(mk('g8_'+tag+'k2',k2+'=\\min('+(g.NX-1)+','+cx+'+'+half+')'));
  var ds=[];for(var d=-half;d<=half;d++)ds.push(d);var R='('+cy+'+['+ds.join(',')+'])';
  var An='A_{g'+tag+'}',Bn='B_{g'+tag+'}';
  out.push(mk('g8_'+tag+'A',An+'=\\left\\{0\\le '+R+'\\le '+(g.NY-1)+':'+csName+'['+R+'\\cdot'+g.NX+'+'+k1+'+1]+1,'+(head+1)+'\\right\\}'));
  out.push(mk('g8_'+tag+'B',Bn+'=\\left\\{0\\le '+R+'\\le '+(g.NY-1)+':'+csName+'['+R+'\\cdot'+g.NX+'+'+k2+'+2],'+head+'\\right\\}'));
  var parts=[];for(var j=1;j<=rows;j++)parts.push('['+An+'['+j+']...'+Bn+'['+j+']]');
  return {exprs:out,parts:parts};
 }
 function cellCode(g,x,y){var cx=Math.max(0,Math.min(g.NX-1,Math.floor((x-g.x0)/g.G)));var cy=Math.max(-1,Math.min(g.NY,Math.floor((y-g.y0)/g.G)));return cx+g.NX*(cy+1);}
 function cellLatex(g){return '\\max(0,\\min('+(g.NX-1)+',\\operatorname{floor}(\\frac{p_x-('+g.x0+')}{'+g.G+'})))+'+g.NX+'(\\max(-1,\\min('+g.NY+',\\operatorname{floor}(\\frac{p_y-('+g.y0+')}{'+g.G+'})))+1)';}
 var LN=D.lane, N=LN.N, QM=D.QM, OFF=D.OFF;
 var ALc=cellCode(D.houses,D.start.x,D.start.y)+1100*cellCode(D.trees,D.start.x,D.start.y)+660000*cellCode(LN,D.start.x,D.start.y);
 var ALl='c_{al}\\to '+cellLatex(D.houses)+'+1100('+cellLatex(D.trees)+')+660000('+cellLatex(LN)+')';
 // =============== LANE BASE GEOMETRY ===============
 var sA=byPrefix('S_{ax}=[');
 var laneEx=[mk('g8_al','c_{al}='+ALc),
  mk('s6_LA','S_{LA}='+lst(LN.LA)), mk('s6_LB','S_{LB}='+lst(LN.LB)),
  mk('s6_ax','S_{ax}=\\frac{\\operatorname{floor}(S_{LA}/'+QM+')}{10}-'+OFF), mk('s6_ay','S_{ay}=\\frac{\\operatorname{mod}(S_{LA},'+QM+')}{10}-'+OFF),
  mk('s6_bx','S_{bx}=\\frac{\\operatorname{floor}(\\operatorname{floor}(S_{LB}/16384)/'+QM+')}{10}-'+OFF), mk('s6_by','S_{by}=\\frac{\\operatorname{mod}(\\operatorname{floor}(S_{LB}/16384),'+QM+')}{10}-'+OFF),
  mk('s6_k','S_k=\\operatorname{mod}(S_{LB},16)'),
  mk('s6_n','S_n=\\operatorname{floor}(\\operatorname{mod}(S_{LB},16384)/64)'), mk('s6_uhw','U_{hw}=[3,4,5.2,6.5,9.5,11,3.4]'),
  mk('s6_w','S_w=\\left\\{S_k=7:\\frac{S_n}{2},S_k=8:U_{hw}[S_n+1],U_{hw}[n_m(S_k,6)+1]\\right\\}'),
  mk('s6_ln','S_{ln}=\\sqrt{(S_{bx}-S_{ax})^2+(S_{by}-S_{ay})^2}+10^{-6}'),
  mk('s6_ux','S_{ux}=\\frac{S_{bx}-S_{ax}}{S_{ln}}'), mk('s6_uy','S_{uy}=\\frac{S_{by}-S_{ay}}{S_{ln}}'),
  mk('s6_cs','S_{cs}='+lst(LN.C))
 ];
 insertBefore(sA,laneEx);
 remove(function(e){var x=e.latex||'';if(/^s6_/.test(e.id))return false;return ['S_{ax}=[','S_{ay}=[','S_{bx}=[','S_{by}=[','S_w=[','S_n=[','S_k=[','S_{ux}=[','S_{uy}=['].some(function(p){return x.indexOf(p)===0;});});
 var Is=byPrefix('I_s=');
 var rs=ranges('s',LN,'p_x','p_y',3,'S_{cs}',0);
 insertBefore(Is,rs.exprs.concat([mk('g6_sI0','I_{s0}=\\operatorname{join}('+rs.parts.join(',')+')')]));
 Is.latex='I_s=I_{s0}[n_m(n_m(I_{s0},'+(N+1)+'-I_{s0})-0.5,5.5-S_k[I_{s0}])>0]';
 log.push('lane ok N='+N);
 // =============== BLOCKS ===============
 var HB=D.head, NH=D.NHEAD, HS=D.houses, NB=NH+HS.N;
 var pal=D.pal.map(function(s){return s.split(',').map(Number);});
 var anchorB=byPrefix('B_x=[');
 var LV=D.LV;
 var bx=[
  mk('h6_x','V_{hx}='+lst(HB.x)),mk('h6_y','V_{hy}='+lst(HB.y)),mk('h6_th','V_{th}='+lst(HB.th)),mk('h6_a','V_{ha}='+lst(HB.a)),mk('h6_b','V_{hb}='+lst(HB.b)),
  mk('h6_h','V_{hh}='+lst(HB.h)),mk('h6_q','V_{hq}='+lst(HB.q)),mk('h6_ci','V_{ci}='+lst(HB.ci)),mk('h6_ri','V_{ri}='+lst(HB.ri)),mk('h6_v','V_{hv}='+lst(HB.v)),
  mk('h6_st','V_{st}='+lst(HB.st)),mk('h6_fk','V_{fk}='+lst(HB.fk)),mk('h6_z','V_{hz}='+lst(HB.z)),mk('h6_nc','V_{nc}='+lst(HB.nc)),
  mk('o6_h1','O_{h1}='+lst(HS.H1)),mk('o6_h2','O_{h2}='+lst(HS.H2)),
  mk('o6_hp','O_{hp}=\\operatorname{floor}(O_{h1}/2048)+1'),mk('o6_hs','O_{hs}=2\\operatorname{mod}(\\operatorname{floor}(O_{h1}/1024),2)-1'),
  mk('o6_ht','O_{ht}=\\frac{\\operatorname{mod}(O_{h1},1024)}{10}-20'),mk('o6_ho','O_{ho}=\\frac{\\operatorname{floor}(O_{h2}/1048576)}{4}'),
  mk('o6_hv','O_{hv}=\\operatorname{mod}(O_{h2},1048576)'),mk('o6_kc','O_{kc}=\\operatorname{floor}(O_{hv}/262144)+1'),
  
  
  
  mk('o6_ua0','W_{a0}='+lst([LV.res.a[0],LV.com.a[0],LV.est.a[0]])),mk('o6_ua1','W_{a1}='+lst([LV.res.a[1],LV.com.a[1],LV.est.a[1]])),
  mk('o6_ub0','W_{b0}='+lst([LV.res.b[0],LV.com.b[0],LV.est.b[0]])),mk('o6_ub1','W_{b1}='+lst([LV.res.b[1],LV.com.b[1],LV.est.b[1]])),
  mk('o6_uh0','W_{h0}='+lst([LV.res.h[0],LV.com.h[0],LV.est.h[0]])),mk('o6_uh1','W_{h1}='+lst([LV.res.h[1],LV.com.h[1],LV.est.h[1]])),
  mk('o6_uq0','W_{q0}='+lst([LV.res.q[0],0,LV.est.q[0]])),mk('o6_uq1','W_{q1}='+lst([LV.res.q[1],0,LV.est.q[1]])),
  mk('o6_x','O_x=S_{ax}[O_{hp}]+O_{ht}S_{ux}[O_{hp}]-O_{hs}O_{ho}S_{uy}[O_{hp}]'),mk('o6_y','O_y=S_{ay}[O_{hp}]+O_{ht}S_{uy}[O_{hp}]+O_{hs}O_{ho}S_{ux}[O_{hp}]'),
  mk('b6_x','B_x=\\operatorname{join}(V_{hx},O_x)'),mk('b6_y','B_y=\\operatorname{join}(V_{hy},O_y)'),
  mk('b6_c','B_c=\\operatorname{join}(\\cos(V_{th}),S_{ux}[O_{hp}])'),mk('b6_s','B_s=\\operatorname{join}(\\sin(V_{th}),S_{uy}[O_{hp}])'),
  mk('b6_a','B_a=\\operatorname{join}(V_{ha},W_{a0}[O_{kc}]+W_{a1}[O_{kc}](\\operatorname{mod}(\\operatorname{floor}(O_{hv}/32768),8)))'),mk('b6_b','B_b=\\operatorname{join}(V_{hb},W_{b0}[O_{kc}]+W_{b1}[O_{kc}](\\operatorname{mod}(\\operatorname{floor}(O_{hv}/4096),8)))'),
  mk('b6_h','B_h=\\operatorname{join}(V_{hh},W_{h0}[O_{kc}]+W_{h1}[O_{kc}](\\operatorname{mod}(\\operatorname{floor}(O_{hv}/512),8)))'),mk('b6_q','B_q=\\operatorname{join}(V_{hq},W_{q0}[O_{kc}]+W_{q1}[O_{kc}](\\operatorname{mod}(\\operatorname{floor}(O_{hv}/128),4)))'),
  mk('b6_ci','B_{ci}=\\operatorname{join}(V_{ci},\\left\\{O_{kc}=2:'+(D.COM0+1)+','+(D.RES0+1)+'\\right\\}+(\\operatorname{mod}(\\operatorname{floor}(O_{hv}/8),16)))'),mk('b6_ri','B_{ri}=\\operatorname{join}(V_{ri},'+(D.ROOF0+1)+'+(\\operatorname{mod}(O_{hv},8)))'),
  mk('b6_pr','P_{pR}='+lst(pal.map(function(c){return c[0];}))),mk('b6_pg','P_{pG}='+lst(pal.map(function(c){return c[1];}))),mk('b6_pb','P_{pB}='+lst(pal.map(function(c){return c[2];}))),
  mk('b6_R','B_R=P_{pR}[B_{ci}]'),mk('b6_G','B_G=P_{pG}[B_{ci}]'),mk('b6_B','B_B=P_{pB}[B_{ci}]'),
  mk('b6_rr','B_{rr}=P_{pR}[B_{ri}]'),mk('b6_rg','B_{rg}=P_{pG}[B_{ri}]'),mk('b6_rb','B_{rb}=P_{pB}[B_{ri}]'),
  mk('b6_v','B_v=\\operatorname{join}(V_{hv},\\left\\{O_{kc}=2:150,130\\right\\})'),mk('b6_st','B_{st}=\\operatorname{join}(V_{st},\\left\\{O_{kc}=2:1,0\\right\\})'),
  mk('b6_fk','B_{fk}=\\operatorname{join}(V_{fk},2-O_{hs})'),mk('b6_z','B_z=\\operatorname{join}(V_{hz},0O_x)'),mk('b6_nc','B_{nc}=\\operatorname{join}(V_{nc},0O_x)'),
  mk('b6_cs','G_{cs}='+lst(HS.C))
 ];
 insertBefore(anchorB,bx);
 var bnames=['B_x','B_y','B_c','B_s','B_a','B_b','B_h','B_q','B_R','B_G','B_B','B_{rr}','B_{rg}','B_{rb}','B_v','B_{st}','B_{fk}'];
 remove(function(e){var x=e.latex||'';if(/^(b6_|h6_|o6_)/.test(e.id))return false;return bnames.some(function(n){return x.indexOf(n+'=[')===0;});});
 var oldIc=byId('gr_bIc');
 var rb=ranges('b',HS,'p_x','p_y',3,'G_{cs}',NH);
 insertBefore(oldIc,rb.exprs.concat([mk('g6_bI','I_c=\\operatorname{join}([1...'+NH+'],'+rb.parts.join(',')+')')]));
 remove(function(e){return /^gr_b(cs|cx|cy|k1|k2|a\d|b\d|Ic)$/.test(e.id);});
 var gfk=byPrefix('G_{fk}=');
 insertAfter(gfk,[mk('b6_gz','G_z=B_z[I_b]'),mk('b6_gnc','G_{nc}=B_{nc}[I_b]')]);
 setLatex('I_{cr}=','I_{cr}=[1...n_{bk}][n_m(n_m(n_m(1+\\frac{1.6}{G_a}-\\left|\\sigma_a\\right|,1+\\frac{1.6}{G_b}-\\left|\\sigma_b\\right|),\\mu_f),0.5-G_{nc})>0]');
 setLatex('I_{dt}=','I_{dt}=[1...n_{bk}][n_m(n_m(n_m(v_f-1,75-\\delta_b),n_x(Y_{5f},Y_{6f})-c_p),5.5-G_{st})>0]');
 var fz=byPrefix('F_{z0}='); fz.latex=fz.latex.replace('0\\mu_r[I_{wb}],0\\mu_r[I_{wa}]','G_z[I_{wb}],G_z[I_{wa}]'); if(fz.latex.indexOf('G_z[I_{wb}]')<0)throw 'F_z0';
 setLatex('L_x=[','L_x='+lst(D.poi.map(function(p){return p.x;})));
 setLatex('L_y=[','L_y='+lst(D.poi.map(function(p){return p.y;})));
 setLatex('L_h=[','L_h='+lst(D.poi.map(function(p){return p.h;})));
 log.push('blocks ok NB='+NB);
 // =============== TREES ===============
 var TR=D.trees, tA=byPrefix('T_x=[');
 insertBefore(tA,[mk('t6_1','O_{t1}='+lst(TR.T1)),mk('t6_2','O_{t2}='+lst(TR.T2)),
  mk('t6_p','O_{tp}=\\operatorname{floor}(O_{t1}/2048)+1'),mk('t6_s','O_{ts}=2\\operatorname{mod}(\\operatorname{floor}(O_{t1}/1024),2)-1'),
  mk('t6_t','O_{tt}=\\frac{\\operatorname{mod}(O_{t1},1024)}{10}-20'),mk('t6_o','O_{to}=\\frac{\\operatorname{floor}(O_{t2}/1024)}{4}'),
  mk('t6_x','T_x=S_{ax}[O_{tp}]+O_{tt}S_{ux}[O_{tp}]-O_{ts}O_{to}S_{uy}[O_{tp}]'),mk('t6_y','T_y=S_{ay}[O_{tp}]+O_{tt}S_{uy}[O_{tp}]+O_{ts}O_{to}S_{ux}[O_{tp}]'),
  mk('t6_tt','T_t=2.2+0.1714\\operatorname{mod}(\\operatorname{floor}(O_{t2}/128),8)'),mk('t6_tk','T_k=2.2+0.2429\\operatorname{mod}(\\operatorname{floor}(O_{t2}/16),8)'),
  mk('t6_tg','T_g=\\frac{\\operatorname{mod}(O_{t2},16)}{15}'),mk('t6_cs','T_{cs}='+lst(TR.C))]);
 remove(function(e){var x=e.latex||'';if(/^t6_/.test(e.id))return false;return ['T_x=[','T_y=[','T_t=[','T_k=[','T_g=['].some(function(p){return x.indexOf(p)===0;});});
 var oldTc=byId('gr_tIc'); var rt=ranges('t',TR,'p_x','p_y',3,'T_{cs}',0);
 insertBefore(oldTc,rt.exprs.concat([mk('g6_tI','I_{tc}=\\operatorname{join}('+rt.parts.join(',')+')')]));
 remove(function(e){return /^gr_t(cs|cx|cy|k1|k2|a\d|b\d|Ic)$/.test(e.id);});
 log.push('trees ok');
 // =============== ROADS (built per tick from lane segments) ===============
 var rAnchor=byId('rd_x1')||byId('rd_D1');
 var rr=ranges('r',LN,'p_x','p_y',5,'S_{cs}',0,'s');
 var NF=LN.HEAD;
 var ty={cR:[118,139,74,74,192,192,85,242,244,244,85],cG:[120,131,74,74,192,192,87,194,244,244,87],cB:[124,120,78,78,186,186,92,48,240,240,92],
  o1:[0,0,0,0,1,-1,0,0,1,-1,0],o2:[0,0,0.8,-0.8,1.7,-1.7,0,0,-0.5,0.5,0],q1:[1,0,0,0,0,0,1,0,0,0,1],q2:[0,3.4,0.08,0.08,1.1,1.1,0,0.14,0.1,0.1,0],rd:[200,200,200,200,130,130,200,200,160,160,400]};
 var road=[
  mk('r6_ucr','U_{cR}='+lst(ty.cR)),mk('r6_ucg','U_{cG}='+lst(ty.cG)),mk('r6_ucb','U_{cB}='+lst(ty.cB)),
  mk('r6_o1','U_{o1}='+lst(ty.o1)),mk('r6_o2','U_{o2}='+lst(ty.o2)),mk('r6_q1','U_{q1}='+lst(ty.q1)),mk('r6_q2','U_{q2}='+lst(ty.q2)),mk('r6_urd','U_{rd}='+lst(ty.rd)),
  mk('r6_rh','S_{rh}=\\frac{S_{ln}}{2}+S_w+3'),
  mk('r6_eax','S_{ex}=S_{ax}-(0.3+0.6S_w\\operatorname{mod}(\\operatorname{floor}(S_{LB}/32),2))S_{ux}'),mk('r6_eay','S_{ey}=S_{ay}-(0.3+0.6S_w\\operatorname{mod}(\\operatorname{floor}(S_{LB}/32),2))S_{uy}'),
  mk('r6_ebx','S_{fx}=S_{bx}+(0.3+0.6S_w\\operatorname{mod}(\\operatorname{floor}(S_{LB}/16),2))S_{ux}'),mk('r6_eby','S_{fy}=S_{by}+(0.3+0.6S_w\\operatorname{mod}(\\operatorname{floor}(S_{LB}/16),2))S_{uy}'),
  mk('r6_Fx','F_{mx}=S_{mx}[1...'+NF+']'),mk('r6_Fy','F_{my}=S_{my}[1...'+NF+']'),mk('r6_Fh','F_{rh}=S_{rh}[1...'+NF+']')
 ].concat(rr.exprs).concat([
  mk('r6_c0x','c_{rx0}='+LN.x0+'+'+LN.G+'(c_{sx}+0.5)'),mk('r6_c0y','c_{ry0}='+LN.y0+'+'+LN.G+'(c_{sy}+0.5)'),mk('r6_I0','I_{Rd}=\\operatorname{join}('+rr.parts.join(',')+')'),mk('r6_Ic','I_{Rc}=I_{Rd}[n_m(I_{Rd},'+(N+1)+'-I_{Rd})>0.5]'),
  mk('r6_Fc','F_c=[1...'+NF+'][(F_{mx}-c_{rx0})^2+(F_{my}-c_{ry0})^2<(650+F_{rh})^2]'),
  mk('r6_Kd','K_d=S_k[I_{Rc}]'),mk('r6_Zl','Z_{lt}=I_{Rc}[K_d=7]'),mk('r6_Zr','Z_{rl}=I_{Rc}[K_d=6]'),mk('r6_Zw','Z_{sw}=I_{Rc}[\\left|K_d-3.5\\right|<2]'),mk('r6_Ze','Z_{ed}=I_{Rc}[\\left|K_d-4\\right|<1.5]'),mk('r6_Za','Z_{an}=I_{Rc}[K_d<2.5]'),
  mk('r6_Qs','Q_s=\\operatorname{join}(Z_{lt},Z_{rl},Z_{rl},Z_{rl},Z_{sw},Z_{sw},Z_{an},F_c,Z_{sw},Z_{ed},Z_{ed})'),
  mk('r6_Qt','Q_t=\\operatorname{join}(1+0Z_{lt},2+0Z_{rl},3+0Z_{rl},4+0Z_{rl},5+0Z_{sw},6+0Z_{sw},7+0Z_{an},11+0F_c,8+0Z_{sw},9+0Z_{ed},10+0Z_{ed})'),
  mk('r6_Qw','Q_w=S_w[Q_s]'),mk('r6_Qp','Q_p=U_{o1}[Q_t]Q_w+U_{o2}[Q_t]+U_{q1}[Q_t]Q_w+U_{q2}[Q_t]'),mk('r6_Qm','Q_m=U_{o1}[Q_t]Q_w+U_{o2}[Q_t]-U_{q1}[Q_t]Q_w-U_{q2}[Q_t]'),
  mk('r6_Qux','Q_{ux}=S_{ux}[Q_s]'),mk('r6_Quy','Q_{uy}=S_{uy}[Q_s]'),
  mk('r6_Qax','Q_{ax}=S_{ex}[Q_s]'),mk('r6_Qay','Q_{ay}=S_{ey}[Q_s]'),mk('r6_Qbx','Q_{bx}=S_{fx}[Q_s]'),mk('r6_Qby','Q_{by}=S_{fy}[Q_s]'),
  mk('r6_X1','Q_{1x}=Q_{ax}-Q_pQ_{uy}'),mk('r6_Y1','Q_{1y}=Q_{ay}+Q_pQ_{ux}'),mk('r6_X2','Q_{2x}=Q_{bx}-Q_pQ_{uy}'),mk('r6_Y2','Q_{2y}=Q_{by}+Q_pQ_{ux}'),
  mk('r6_X3','Q_{3x}=Q_{bx}-Q_mQ_{uy}'),mk('r6_Y3','Q_{3y}=Q_{by}+Q_mQ_{ux}'),mk('r6_X4','Q_{4x}=Q_{ax}-Q_mQ_{uy}'),mk('r6_Y4','Q_{4y}=Q_{ay}+Q_mQ_{ux}'),
  mk('r6_Qmx','Q_{mx}=\\frac{Q_{ax}+Q_{bx}}{2}-\\frac{Q_p+Q_m}{2}Q_{uy}'),mk('r6_Qmy','Q_{my}=\\frac{Q_{ay}+Q_{by}}{2}+\\frac{Q_p+Q_m}{2}Q_{ux}'),
  mk('r6_Qhd','Q_{hd}=\\frac{\\sqrt{(Q_{bx}-Q_{ax})^2+(Q_{by}-Q_{ay})^2+(Q_p-Q_m)^2}}{2}+1'),mk('r6_Qr2','Q_{r2}=(U_{rd}[Q_t]+Q_{hd})^2'),
  mk('r6_IQ','I_Q=[1...\\operatorname{length}(Q_s)][n_m(n_m(Q_{r2}-(Q_{mx}-p_x)^2-(Q_{my}-p_y)^2,f_f(Q_{mx},Q_{my})+Q_{hd}-c_p),1.25(f_f(Q_{mx},Q_{my})+Q_{hd})+Q_{hd}-\\left|f_r(Q_{mx},Q_{my})\\right|)>0]'),
  mk('r6_QT','Q_{tt}=Q_t[I_Q]'),
  mk('r6_D1','D_{1}=f_r(Q_{1x}[I_Q],Q_{1y}[I_Q])'),mk('r6_D2','D_{2}=f_f(Q_{1x}[I_Q],Q_{1y}[I_Q])'),mk('r6_D3','D_{3}=f_r(Q_{2x}[I_Q],Q_{2y}[I_Q])'),mk('r6_D4','D_{4}=f_f(Q_{2x}[I_Q],Q_{2y}[I_Q])'),mk('r6_D5','D_{5}=f_r(Q_{3x}[I_Q],Q_{3y}[I_Q])'),mk('r6_D6','D_{6}=f_f(Q_{3x}[I_Q],Q_{3y}[I_Q])'),mk('r6_D7','D_{7}=f_r(Q_{4x}[I_Q],Q_{4y}[I_Q])'),mk('r6_D8','D_{8}=f_f(Q_{4x}[I_Q],Q_{4y}[I_Q])')
 ]);
 insertBefore(rAnchor,road);
 remove(function(e){return /^rd_/.test(e.id);});
 var poly=L.filter(function(e){return (e.latex||'').indexOf('\\operatorname{polygon}((\\frac{k_fK_r(D_{1}')===0;})[0];
 if(!poly)throw 'road polygon missing'; poly.colorLatex='\\operatorname{rgb}(U_{cR}[Q_{tt}],U_{cG}[Q_{tt}],U_{cB}[Q_{tt}])';
 log.push('roads ok');
 // =============== MINIMAP (lane segments, latched pose) ===============
 var mAnchor=byPrefix('m_{cx}=');
 var st=D.start;
 var PM=Math.round((st.x+2600)*10)*326774284+Math.round((st.y+2600)*10)*6284+Math.round(1000*(((st.h%(2*Math.PI))+2*Math.PI)%(2*Math.PI)));
 var mm=[mk('m8_pm','p_m='+PM),mk('m8_xm','x_m=\\frac{\\operatorname{floor}(p_m/326774284)}{10}-2600'),mk('m8_ym','y_m=\\frac{\\operatorname{mod}(\\operatorname{floor}(p_m/6284),52001)}{10}-2600'),mk('m8_hm','h_m=\\frac{\\operatorname{mod}(p_m,6284)}{1000}'),
  mk('m6_cm','c_m=\\cos(h_m)'),mk('m6_sm','s_m=\\sin(h_m)'),
  mk('m6_gr','g_r(x,y)=(x-x_m)c_m-(y-y_m)s_m'),mk('m6_gf','g_f(x,y)=(x-x_m)s_m+(y-y_m)c_m')];
 var rh=ranges('h',LN,'x_m','y_m',7,'S_{cs}',0);
 mm=mm.concat(rh.exprs).concat([
  mk('m6_I0','I_{h0}=\\operatorname{join}('+rh.parts.join(',')+')'),
  mk('m6_Ih','I_h=I_{h0}[n_m(n_m(I_{h0},'+(N+1)+'-I_{h0})-0.5,5.5-S_k[I_{h0}])>0]'),
  mk('m6_amr','A_{mr}=g_r(S_{ax}[I_h],S_{ay}[I_h])'),mk('m6_amf','A_{mf}=g_f(S_{ax}[I_h],S_{ay}[I_h])'),
  mk('m6_bmr','B_{mr}=g_r(S_{bx}[I_h],S_{by}[I_h])'),mk('m6_bmf','B_{mf}=g_f(S_{bx}[I_h],S_{by}[I_h])'),mk('m6_km','K_m=S_k[I_h]'),mk('m6_ng','n_{gm}=\\operatorname{length}(A_{mr})')]);
 insertBefore(mAnchor,mm);
 [['z_{dr}=','z_{dr}=B_{mr}-A_{mr}+10^{-6}'],['z_{df}=','z_{df}=B_{mf}-A_{mf}+10^{-6}'],['z_1=','z_1=\\frac{-233.3-A_{mr}}{z_{dr}}'],['z_2=','z_2=\\frac{233.3-A_{mr}}{z_{dr}}'],
  ['z_3=','z_3=\\frac{-158.3-A_{mf}}{z_{df}}'],['z_4=','z_4=\\frac{308.3-A_{mf}}{z_{df}}'],['z_{x0}=','z_{x0}=m_{cx}+\\sigma_m(A_{mr}+z_az_{dr})'],['z_{y0}=','z_{y0}=m_{cy}+\\sigma_m(A_{mf}+z_az_{df})'],
  ['z_{x1}=','z_{x1}=m_{cx}+\\sigma_m(A_{mr}+z_bz_{dr})'],['z_{y1}=','z_{y1}=m_{cy}+\\sigma_m(A_{mf}+z_bz_{df})'],
  ['J_{m1}=','J_{m1}=[1...n_{gm}][\\{z_a<z_b:\\{K_m\\le2:1,0\\},0\\}=1]'],['J_{m2}=','J_{m2}=[1...n_{gm}][\\{z_a<z_b:\\{K_m\\ge3:1,0\\},0\\}=1]'],
  ['M_x=','M_x=m_{cx}+\\sigma_mg_r(L_x,L_y)'],['M_y=','M_y=m_{cy}+\\sigma_mg_f(L_x,L_y)']].forEach(function(r){setLatex(r[0],r[1]);});
 setLatex('\\sigma_m=','\\sigma_m=0.0012');
 var nl=byId('e541'); if(nl) nl.latex='(1.6-0.25s_m,0.66+0.25c_m)';
 tick.push('p_m\\to\\left\\{(p_x-x_m)^2+(p_y-y_m)^2+400w_r(h-h_m)^2>30:\\operatorname{round}(10(p_x+2600))\\cdot326774284+\\operatorname{round}(10(p_y+2600))\\cdot6284+\\operatorname{mod}(\\operatorname{round}(1000\\operatorname{mod}(h,2\\pi)),6284),p_m\\right\\}');
 log.push('minimap ok');
 // =============== STREET NAMES ===============
 var oldLbl=L.filter(function(e){return /^\(0,0\.805\)/.test(e.latex||'');}); var proto=JSON.parse(JSON.stringify(oldLbl[0]));
 var minLen=OPT.minNameLen||150;
 var newL=[mk('n6_rl','n_{rl}=-1')]; var cnt=0;
 D.names.forEach(function(nm,i){ if((D.nameLen[i]||0)<minLen) return; var e=JSON.parse(JSON.stringify(proto)); e.id='n6_'+(i+1); e.latex='(0,0.805)\\{n_{rl}='+(i+1)+'\\}'; e.label=nm; newL.push(e); cnt++;});
 insertBefore(oldLbl[0],newL);
 remove(function(e){return /^\(0,0\.805\)\\\{n_\{rd\}/.test(e.latex||'');});
 tick.push('n_{rl}\\to n_{rd}');
 log.push('names '+cnt);
 // =============== START + TICKER ===============
 var t=S.expressions.ticker;
 t.handlerLatex=t.handlerLatex.replace('z_q>z_r:0.038','z_q>z_r:'+st.h).replace('z_q>z_r:-8.3','z_q>z_r:'+st.x).replace('z_q>z_r:-20','z_q>z_r:'+st.y);
 if(t.handlerLatex.indexOf(String(st.x))<0) throw 'ticker start';
 tick.push(ALl); t.handlerLatex+=','+tick.join(',');
 setLatex('p_x=','p_x='+st.x); setLatex('p_y=','p_y='+st.y); setLatex('h=','h='+st.h);
 log.push('ticker ok');
 return {S:S,log:log};
};
'patch9 loaded';
