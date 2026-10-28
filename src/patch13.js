window.__build13=function(S0,D,OPT){
 OPT=OPT||{};
 var S=JSON.parse(JSON.stringify(S0)),L=S.expressions.list,log=[];
 var VERIFY=!!OPT.verify,mism=[];
 function byId(id){for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return null;}
 function byPrefix(p){for(var i=0;i<L.length;i++)if((L[i].latex||'').indexOf(p)===0)return L[i];return null;}
 function num(v){return Number.isInteger(v)?String(v):(Math.round(v*1000)/1000).toString();}
 function lst(a){return '['+a.map(num).join(',')+']';}
 function setId(id,latex){var e=byId(id);if(!e)throw 'missing '+id;if(VERIFY){if(e.latex!==latex)mism.push(id+'\n  have '+e.latex.slice(0,240)+'\n  want '+latex.slice(0,240));return e;}e.latex=latex;return e;}
 function subId(id,re,to){var e=byId(id);if(!e)throw 'missing '+id;var x=e.latex.replace(re,to);if(x===e.latex&&!VERIFY&&String(re)!==String(to))throw 'no change '+id+' '+re;if(!VERIFY)e.latex=x;return e;}
 function mk(id,latex,extra){var e={type:'expression',id:id,latex:latex,hidden:true,folderId:'f23'};if(extra)for(var k in extra)e[k]=extra[k];return e;}
 function insertAfter(ref,arr){var i=L.indexOf(ref);if(i<0)throw 'ref missing';L.splice.apply(L,[i+1,0].concat(arr));}
 function splitTop(s){var out=[],depth=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='{'||ch==='('||ch==='[')depth++;else if(ch==='}'||ch===')'||ch===']')depth--;if(ch===','&&depth===0){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out;}
 var NEWENC=!VERIFY;
 var LN=D.lane,HS=D.houses,TR=D.trees,N=LN.N,NH=D.NHEAD,QM=D.QM,OFF=D.OFF;
 var CB={b:[1,1100],t:[1100,600],s:[660000,NEWENC?2400:2200]};
 function cellCode(g,x,y){var cx=Math.max(0,Math.min(g.NX-1,Math.floor((x-g.x0)/g.G)));var cy=Math.max(-1,Math.min(g.NY,Math.floor((y-g.y0)/g.G)));return cx+g.NX*(cy+1);}
 function cellLatex(g){return '\\max(0,\\min('+(g.NX-1)+',\\operatorname{floor}(\\frac{p_x-('+g.x0+')}{'+g.G+'})))+'+g.NX+'(\\max(-1,\\min('+g.NY+',\\operatorname{floor}(\\frac{p_y-('+g.y0+')}{'+g.G+'})))+1)';}
 if(NEWENC&&(HS.NX*(HS.NY+2)>1100||TR.NX*(TR.NY+2)>600||LN.NX*(LN.NY+2)>2400))throw 'cell code overflow';
 function ranges(pfx,tag,g,rows,csName,head,shareC,hasCell){
  var ct=shareC||tag,cx='c_{'+ct+'x}',cy='c_{'+ct+'y}',half=(rows-1)/2,o={};
  if(hasCell==='cb'){var m=CB[tag][0],base=CB[tag][1];var code='\\operatorname{mod}(\\operatorname{floor}(c_{al}/'+m+'),'+base+')';
   o[pfx+tag+'cx']=cx+'=\\operatorname{mod}('+code+','+g.NX+')';o[pfx+tag+'cy']=cy+'=\\operatorname{floor}('+code+'/'+g.NX+')-1';}
  if(hasCell==='m'){o[pfx+tag+'cx']=cx+'=\\max(0,\\min('+(g.NX-1)+',\\operatorname{floor}(\\frac{x_m-('+g.x0+')}{'+g.G+'})))';o[pfx+tag+'cy']=cy+'=\\operatorname{floor}(\\frac{y_m-('+g.y0+')}{'+g.G+'})';}
  var k1='k_{'+tag+'1}',k2='k_{'+tag+'2}';
  o[pfx+tag+'k1']=k1+'=\\max(0,'+cx+'-'+half+')';o[pfx+tag+'k2']=k2+'=\\min('+(g.NX-1)+','+cx+'+'+half+')';
  var ds=[];for(var d=-half;d<=half;d++)ds.push(d);var R='('+cy+'+['+ds.join(',')+'])';
  o[pfx+tag+'A']='A_{g'+tag+'}=\\left\\{0\\le '+R+'\\le '+(g.NY-1)+':'+csName+'['+R+'\\cdot'+g.NX+'+'+k1+'+1]+1,'+(head+1)+'\\right\\}';
  o[pfx+tag+'B']='B_{g'+tag+'}=\\left\\{0\\le '+R+'\\le '+(g.NY-1)+':'+csName+'['+R+'\\cdot'+g.NX+'+'+k2+'+2],'+head+'\\right\\}';
  var parts=[];for(var j=1;j<=rows;j++)parts.push('[A_{g'+tag+'}['+j+']...B_{g'+tag+'}['+j+']]');
  return {o:o,parts:parts};
 }
 function applyRanges(r){for(var id in r.o)setId(id,r.o[id]);}
 var st=D.start;
 var ALc=cellCode(HS,st.x,st.y)+1100*cellCode(TR,st.x,st.y)+660000*cellCode(LN,st.x,st.y);
 var ALY=cellLatex(HS)+'+1100('+cellLatex(TR)+')+660000('+cellLatex(LN)+')';
 var PM=Math.round((st.x+2600)*10)*326774284+Math.round((st.y+2600)*10)*6284+Math.round(1000*(((st.h%(2*Math.PI))+2*Math.PI)%(2*Math.PI)));
 var CARCOL=[[238,238,236],[34,34,38],[178,182,188],[176,32,36],[36,72,150],[98,102,108],[40,84,60],[204,190,156],[52,60,72]];
 var pal=D.pal.map(function(s){return s.split(',').map(Number);}),NPAL=pal.length,palC=pal.concat(CARCOL);
 var base=NH+HS.N,NC=D.cars.N,SG=D.signs,NS=SG.N,PS=D.poiSigns,TX=D.text;
 if(!VERIFY){
  setId('s6_LA','S_{LA}='+lst(LN.LA));setId('s6_LB','S_{LB}='+lst(LN.LB));setId('s6_cs','S_{cs}='+lst(LN.C));
  setId('s6_bx','S_{bx}=\\frac{\\operatorname{floor}(\\operatorname{floor}(S_{LB}/65536)/'+QM+')}{10}-'+OFF);
  setId('s6_by','S_{by}=\\frac{\\operatorname{mod}(\\operatorname{floor}(S_{LB}/65536),'+QM+')}{10}-'+OFF);
  setId('s6_n','S_n=\\operatorname{floor}(\\operatorname{mod}(S_{LB},65536)/64)');
  setId('g8_al','c_{al}='+ALc);
  ['x','y','th','a','b','h','q','ci','ri','v','st','fk','z','nc'].forEach(function(k){var nm={x:'V_{hx}',y:'V_{hy}',th:'V_{th}',a:'V_{ha}',b:'V_{hb}',h:'V_{hh}',q:'V_{hq}',ci:'V_{ci}',ri:'V_{ri}',v:'V_{hv}',st:'V_{st}',fk:'V_{fk}',z:'V_{hz}',nc:'V_{nc}'}[k];setId('h6_'+k,nm+'='+lst(D.head[k]));});
  setId('o6_h1','O_{h1}='+lst(HS.H1));setId('o6_h2','O_{h2}='+lst(HS.H2));setId('b6_cs','G_{cs}='+lst(HS.C));
  setId('b6_pr','P_{pR}='+lst(palC.map(function(c){return c[0];})));setId('b6_pg','P_{pG}='+lst(palC.map(function(c){return c[1];})));setId('b6_pb','P_{pB}='+lst(palC.map(function(c){return c[2];})));
  subId('b6_ci',/\+O_\{cc\}\[I_\{cc\}\],\d+\+0I_\{cc\}\)$/,'+O_{cc}[I_{cc}],'+(NPAL+9)+'+0I_{cc})');subId('b6_ci',/,\d+\+O_\{cc\}/,','+(NPAL+1)+'+O_{cc}');
  subId('b6_ri',/,\d+\+O_\{cc\}\[I_\{cc\}\],\d+\+O_\{cc\}\[I_\{cc\}\]\)$/,','+(NPAL+1)+'+O_{cc}[I_{cc}],'+(NPAL+1)+'+O_{cc}[I_{cc}])');
  setId('t6_1','O_{t1}='+lst(TR.T1));setId('t6_2','O_{t2}='+lst(TR.T2));setId('t6_cs','T_{cs}='+lst(TR.C));
  setId('e298','L_x='+lst(D.poi.map(function(p){return p.x;})));setId('e299','L_y='+lst(D.poi.map(function(p){return p.y;})));
  setId('e300','L_h='+lst(D.poi.map(function(p){return p.h;})));
  setId('e301','L_k='+lst(D.poi.map(function(p){return p.kind==='food'?1:p.kind==='school'?2:3;})));
  setId('m8_pm','p_{m}='+PM);setId('e10_pcm','p_{cm}='+PM);
  setId('c10_cr','O_{cr}='+lst(D.cars.CR));setId('c10_gcc','G_{cc}='+lst(D.cars.C.map(function(c){return c+base;})));
  setId('t10_fp','F_{pp}='+lst(TX.FP));setId('t10_z3','Z_{3}='+lst(TX.Z3));setId('t10_zs','Z_{s}='+lst(TX.ZS));setId('t10_zn','Z_{n}='+lst(TX.ZN));
  setId('t10_q1','H_{q1}='+lst(SG.G1));setId('t10_q2','H_{q2}='+lst(SG.G2));setId('t10_qc','H_{qc}='+lst(SG.C));
  setId('t10_px','R_{px}='+lst(PS.x));setId('t10_py','R_{py}='+lst(PS.y));setId('t10_pz','R_{pz}='+lst(PS.z));setId('t10_pt','R_{pt}='+lst(PS.tx));setId('t10_pu','R_{pu}='+lst(PS.ty));
  setId('t10_pm','R_{pm}='+lst(PS.m));setId('t10_pi','R_{pi}='+lst(PS.id));
  setId('t10_psl','P_{sl}=[\\operatorname{floor}(s_{gp}/1000),\\operatorname{mod}(s_{gp},1000)]');
 }
 applyRanges(ranges('g8_','s',LN,3,'S_{cs}',0,null,'cb'));
 applyRanges(ranges('g8_','r',LN,5,'S_{cs}',0,'s'));
 applyRanges(ranges('g8_','h',LN,7,'S_{cs}',0,null,'m'));
 applyRanges(ranges('g8_','b',HS,3,'G_{cs}',NH,null,'cb'));
 applyRanges(ranges('g8_','t',TR,3,'T_{cs}',0,null,'cb'));
 applyRanges(ranges('g10_','cr',LN,3,'G_{cc}',base,'s'));
 applyRanges(ranges('g10_','q',HS,3,'H_{qc}',0,'b'));
 var rb=ranges('g8_','b',HS,3,'G_{cs}',NH,null,'cb');
 setId('g6_bI','I_{cg}=\\operatorname{join}([1...'+NH+'],'+rb.parts.join(',')+')');
 setId('c10_ihw','I_{hw}=I_{cg}[I_{cg}>'+NH+']-'+NH);
 setId('c10_icc','I_{cc}=I_{cq}[n_m(I_{cq}-'+base+','+(base+NC+1)+'-I_{cq})>0.5]-'+base);
 setId('e54','I_s=I_{s0}[n_m(n_m(I_{s0},'+(N+1)+'-I_{s0})-0.5,5.5-S_k[I_{s0}])>0]');
 setId('r6_Ic','I_{Rc}=I_{Rd}[n_m(I_{Rd},'+(N+1)+'-I_{Rd})>0.5]');
 setId('m6_Ih','I_h=I_{h0}[n_m(n_m(I_{h0},'+(N+1)+'-I_{h0})-0.5,5.5-S_k[I_{h0}])>0]');
 var NF=LN.HEAD;
 setId('r6_Fx','F_{mx}=S_{mx}[1...'+NF+']');setId('r6_Fy','F_{my}=S_{my}[1...'+NF+']');setId('r6_Fh','F_{rh}=S_{rh}[1...'+NF+']');
 setId('r6_Fc','F_c=[1...'+NF+'][(F_{mx}-c_{rx0})^2+(F_{my}-c_{ry0})^2<(650+F_{rh})^2]');
 setId('r6_c0x','c_{rx0}='+LN.x0+'+'+LN.G+'(c_{sx}+0.5)');setId('r6_c0y','c_{ry0}='+LN.y0+'+'+LN.G+'(c_{sy}+0.5)');
 setId('t10_i1','I_{q1}=I_{q0}[n_m(n_m(I_{q0},'+(NS+1)+'-I_{q0})-0.5,3400-(H_{qx}[I_{q0}]-x_m)^2-(H_{qy}[I_{q0}]-y_m)^2)>0]');
 subId('t10_pv',/^I_\{pv\}=\[1\.\.\.\d+\]/,'I_{pv}=[1...'+PS.N+']');
 var T=S.expressions.ticker,parts=splitTop(T.handlerLatex),seen={};
 parts=parts.map(function(a){
  if(a.indexOf('c_{al}\\to')>=0){seen.al=1;var want='\\left\\{\\left|'+ALY+'-c_{al}\\right|>0.5:c_{al}\\to '+ALY+'\\right\\}';
   if(VERIFY){var norm=function(s){return s.replace(/\s+/g,'');};if(norm(a)!==norm(want))mism.push('ticker c_al\n  have '+a.slice(0,300)+'\n  want '+want.slice(0,300));return a;}return want;}
  if(VERIFY)return a;
  if(a.indexOf('s_{gp}\\to')>=0){seen.gp=1;return a.split('100I_{p2}[1]').join('1000I_{p2}[1]');}
  if(/^v\\to/.test(a)||/^h\\to/.test(a)||/^p_x\\to/.test(a)||/^p_y\\to/.test(a)){
   var b=a.replace(/z_q>z_r:-?[\d.]+,/,function(m){seen[a.slice(0,3)]=1;var v=/^h\\to/.test(a)?st.h:/^p_x/.test(a)?st.x:/^p_y/.test(a)?st.y:0;return 'z_q>z_r:'+v+',';});return b;}
  return a;});
 if(!VERIFY){if(!seen.al||!seen.gp)throw 'ticker parts '+JSON.stringify(seen);}
 if(VERIFY){T.handlerLatex=T.handlerLatex;return {S:S,log:['verify'],mism:mism};}
 T.handlerLatex=parts.join(',');
 var ex=function(re){for(var i=0;i<L.length;i++)if(re.test(L[i].latex||''))return L[i];return null;};
 var hx=ex(/^h=-?[\d.]+$/);if(hx)hx.latex='h='+st.h;
 var px=ex(/^p_\{x\}=-?[\d.]+$/);if(px)px.latex='p_{x}='+st.x;var py=ex(/^p_\{y\}=-?[\d.]+$/);if(py)py.latex='p_{y}='+st.y;if(!px||!py||!hx)throw 'start vars';
 log.push('core ok');
 var ND=D.poi.length;
 ['e311','e312','lb_ypq','e533','e535','e537'].forEach(function(id){subId(id,/\[1\.\.\.33\]/g,'[1...'+ND+']');});
 L.forEach(function(e){if(e.clickableInfo&&e.clickableInfo.latex&&/d_\{st\}\\to\\operatorname\{mod\}\(d_\{st\}(-2)?,33\)\+1/.test(e.clickableInfo.latex))e.clickableInfo.latex=e.clickableInfo.latex.replace(',33)',','+ND+')');});
 var di=0;D.poi.forEach(function(p,i){if(p.nm==='Syosset LIRR Station')di=i+1;});setId('e12','d_{st}='+(di||1));byId('e12').slider={hardMin:true,hardMax:true,min:'1',max:String(ND),step:'1'};
 var COL={food:'#a12c23',school:'#1b53a1',civic:'#663696',gas:'#8a5a00',bank:'#1d4e72',car:'#3c4652',gym:'#2f5d50',fun:'#8a2848',hotel:'#2f5d50',store:'#2f5d50'};
 var EMO={food:'🍴',school:'🎓',civic:'🏛',gas:'⛽',bank:'🏦',car:'🚗',gym:'💪',fun:'🎳',hotel:'🏨',store:'🛍'};
 function replaceGroup(re,make){var first=-1,proto=null;for(var i=L.length-1;i>=0;i--){if(re.test(L[i].latex||'')){first=i;proto=proto||L[i];L.splice(i,1);}}if(first<0)throw 'group '+re;var arr=make(proto);L.splice.apply(L,[first,0].concat(arr));return arr.length;}
 var nL=replaceGroup(/^\(X_p\[\d+\],Y_\{pq\}\[\d+\]\)$/,function(proto){return D.poi.map(function(p,i){var e=JSON.parse(JSON.stringify(proto));e.id='p13_'+(i+1);e.latex='(X_p['+(i+1)+'],Y_{pq}['+(i+1)+'])';e.label=p.label||p.nm;e.labelSize='S_{lz}['+(i+1)+']';e.color=COL[p.kind]||COL.store;return e;});});
 var nD=replaceGroup(/^\(-1\.865,0\.845\)\\\{d_\{st\}=\d+\\\}$/,function(proto){return D.poi.map(function(p,i){var e=JSON.parse(JSON.stringify(proto));e.id='d13_'+(i+1);e.latex='(-1.865,0.845)\\{d_{st}='+(i+1)+'\\}';e.label=(EMO[p.kind]||EMO.store)+' '+(p.label||p.nm);return e;});});
 var nN=replaceGroup(/^\(0,0\.805\)\\\{n_\{rl\}=\d+\\\}$/,function(proto){var out=[];D.names.forEach(function(nm,i){if((D.nameLen[i]||0)<(OPT.minNameLen||350))return;var e=JSON.parse(JSON.stringify(proto));e.id='n13_'+(i+1);e.latex='(0,0.805)\\{n_{rl}='+(i+1)+'\\}';e.label=nm;out.push(e);});return out;});
 log.push('poi labels '+nL+' dest '+nD+' names '+nN);
 var sg=byId('n10_signs');if(!sg)throw 'n10_signs';
 insertAfter(sg,[{type:'text',id:'n13_shops',folderId:sg.folderId,text:'🏪 Real stores: the streets, store buildings and parking lots now come from OpenStreetMap. Drive along Jericho Tpke and Jackson Ave to see real storefronts with their logos: Chipotle, Starbucks, McDonald\'s, Dunkin\', Burger King, CVS, 7-Eleven, Shell, the banks and more. Use the destination arrows to drive to any of them.'},
  {type:'text',id:'n13_osm',folderId:sg.folderId,text:'🗺 Map data © OpenStreetMap contributors (openstreetmap.org/copyright), available under the Open Database License. Store logos belong to their owners; this is an unaffiliated hobby project.'}]);
 function nrm(n){return n.replace(/_\{([A-Za-z0-9])\}/,'_$1');}
 var defined={};L.forEach(function(e){var m=/^((?:\\[a-zA-Z]+|[A-Za-z])(?:_\{[^}]*\}|_[A-Za-z0-9])?)\s*(\(|=)/.exec(e.latex||'');if(m)defined[nrm(m[1])]=e.id;});
 function claim(names){names.forEach(function(n){var k=nrm(n);if(defined[k])throw 'identifier clash '+n+' ('+defined[k]+')';defined[k]='new';});}
 var NA=D.NA;
 claim(['H_{dc}','k_{hd1}','k_{hd2}','A_{ghd}','B_{ghd}','I_{hd0}','I_{hd}']);
 var rh=ranges('h13_','hd',HS,5,'H_{dc}',NA,'b');
 var hd=[mk('h13_dc','H_{dc}='+lst(D.HDC))];for(var id in rh.o)hd.push(mk(id,rh.o[id]));
 hd.push(mk('h13_I0','I_{hd0}=\\operatorname{join}([1...'+NA+'],'+rh.parts.join(',')+')'));
 hd.push(mk('h13_I','I_{hd}=I_{hd0}[I_{hd0}\\le '+NH+']'));
 insertAfter(byId('b6_cs'),hd);
 [['b6_x','V_{hx}'],['b6_y','V_{hy}'],['b6_a','V_{ha}'],['b6_b','V_{hb}'],['b6_h','V_{hh}'],['b6_q','V_{hq}'],['b6_ci','V_{ci}'],['b6_ri','V_{ri}'],['b6_v','V_{hv}'],['b6_st','V_{st}'],['b6_fk','V_{fk}'],['b6_z','V_{hz}'],['b6_nc','V_{nc}']].forEach(function(r){subId(r[0],new RegExp('join\\}\\('+r[1].replace(/[{}\\]/g,'\\$&')+','),'join}('+r[1]+'[I_{hd}],');});
 subId('b6_c',/\\cos\(V_\{th\}\)/,'\\cos(V_{th}[I_{hd}])');subId('b6_s',/\\sin\(V_\{th\}\)/,'\\sin(V_{th}[I_{hd}])');
 log.push('head grid NA='+NA+' NH='+NH);
 var LG=D.logo,NT=LG.NT,NL=LG.N;
 claim(['K_{lu}','K_{lw}','K_{la}','K_{lb}','K_{rr}','K_{rg}','K_{rb}','K_{vs}','K_{vn}','K_{ps}','K_{pn}','Q_{lx}','Q_{ly}','Q_{lz}','Q_{lt}','Q_{lu}','Q_{lm}','Q_{lk}','Q_{lp}','Q_{ld}','I_{lv}','I_{l3}','s_{gl}','q_{l1}','q_{l2}','q_{l3}','t_{l1}','t_{l2}','t_{l3}','V_{l1}','V_{l2}','V_{l3}','V_{la}','I_{lq}','X_{lw}','Y_{lw}','Z_{lw}','F_{lf}','X_{ls}','Y_{ls}','P_{l1}','P_{l2}','P_{l3}','P_{la}','A_{lp}','B_{lp}','C_{lr}','C_{lg}','C_{lb}','n_{lp}']);
 var lg=[mk('l13_u','K_{lu}='+lst(LG.U)),mk('l13_w','K_{lw}='+lst(LG.W)),mk('l13_a','K_{la}='+lst(LG.A)),mk('l13_b','K_{lb}='+lst(LG.B)),
  mk('l13_r','K_{rr}='+lst(LG.R)),mk('l13_g','K_{rg}='+lst(LG.G)),mk('l13_bl','K_{rb}='+lst(LG.Bl)),
  mk('l13_vs','K_{vs}='+lst(LG.VS)),mk('l13_vn','K_{vn}='+lst(LG.VN)),mk('l13_ps','K_{ps}='+lst(LG.PS)),mk('l13_pn','K_{pn}='+lst(LG.PN)),
  mk('l13_x','Q_{lx}='+lst(LG.x)),mk('l13_y','Q_{ly}='+lst(LG.y)),mk('l13_z','Q_{lz}='+lst(LG.z)),mk('l13_t','Q_{lt}='+lst(LG.tx)),mk('l13_tu','Q_{lu}='+lst(LG.ty)),mk('l13_m','Q_{lm}='+lst(LG.m)),mk('l13_k','Q_{lk}='+lst(LG.k)),mk('l13_pr','Q_{lp}='+lst(LG.p)),
  mk('l13_d','Q_{ld}=Q_{lp}((Q_{lx}-x_m)^2+(Q_{ly}-y_m)^2)'),
  mk('l13_v','I_{lv}=[1...'+NL+'][n_m(n_m(48400-Q_{ld},(x_m-Q_{lx})Q_{lu}-(y_m-Q_{ly})Q_{lt}-0.5),n_m(g_f(Q_{lx},Q_{ly})-6,1.4g_f(Q_{lx},Q_{ly})+25-\\left|g_r(Q_{lx},Q_{ly})\\right|))>0]'),
  mk('l13_3','I_{l3}=\\operatorname{sort}(I_{lv},Q_{ld}[I_{lv}])[[1,2,3]]'),
  mk('l13_s','s_{gl}=0'),
  mk('l13_q1','q_{l1}=\\operatorname{floor}(s_{gl}/1000000)'),mk('l13_q2','q_{l2}=\\operatorname{mod}(\\operatorname{floor}(s_{gl}/1000),1000)'),mk('l13_q3','q_{l3}=\\operatorname{mod}(s_{gl},1000)')];
 [1,2,3].forEach(function(j){lg.push(mk('l13_t'+j,'t_{l'+j+'}=\\left\\{q_{l'+j+'}>0:Q_{lk}[q_{l'+j+'}],'+(NT+1)+'\\right\\}'));
  lg.push(mk('l13_v'+j,'V_{l'+j+'}=[K_{vs}[t_{l'+j+'}]...K_{vs}[t_{l'+j+'}]+K_{vn}[t_{l'+j+'}]-1]'));
  lg.push(mk('l13_p'+j,'P_{l'+j+'}=[K_{ps}[t_{l'+j+'}]...K_{ps}[t_{l'+j+'}]+K_{pn}[t_{l'+j+'}]-1]'));});
 lg=lg.concat([mk('l13_va','V_{la}=\\operatorname{join}(V_{l1},V_{l2},V_{l3})'),
  mk('l13_iq','I_{lq}=\\operatorname{join}(q_{l1}+0V_{l1},q_{l2}+0V_{l2},q_{l3}+0V_{l3})'),
  mk('l13_xw','X_{lw}=Q_{lx}[I_{lq}]+Q_{lm}[I_{lq}]Q_{lt}[I_{lq}]K_{lu}[V_{la}]'),
  mk('l13_yw','Y_{lw}=Q_{ly}[I_{lq}]+Q_{lm}[I_{lq}]Q_{lu}[I_{lq}]K_{lu}[V_{la}]'),
  mk('l13_zw','Z_{lw}=Q_{lz}[I_{lq}]+Q_{lm}[I_{lq}]K_{lw}[V_{la}]'),
  mk('l13_ff','F_{lf}=f_f(X_{lw},Y_{lw})'),
  mk('l13_xs','X_{ls}=\\left\\{F_{lf}>1.2:\\frac{k_ff_r(X_{lw},Y_{lw})}{F_{lf}}\\right\\}'),
  mk('l13_ys','Y_{ls}=y_0+\\frac{k_f(Z_{lw}-e_y)}{F_{lf}}'),
  mk('l13_pa','P_{la}=\\operatorname{join}(P_{l1},P_{l2},P_{l3})'),
  mk('l13_A','A_{lp}=\\operatorname{join}(K_{la}[P_{l1}]-K_{vs}[t_{l1}]+1,K_{la}[P_{l2}]-K_{vs}[t_{l2}]+1+K_{vn}[t_{l1}],K_{la}[P_{l3}]-K_{vs}[t_{l3}]+1+K_{vn}[t_{l1}]+K_{vn}[t_{l2}])'),
  mk('l13_B','B_{lp}=\\operatorname{join}(K_{lb}[P_{l1}]-K_{vs}[t_{l1}]+1,K_{lb}[P_{l2}]-K_{vs}[t_{l2}]+1+K_{vn}[t_{l1}],K_{lb}[P_{l3}]-K_{vs}[t_{l3}]+1+K_{vn}[t_{l1}]+K_{vn}[t_{l2}])'),
  mk('l13_cr','C_{lr}=K_{rr}[P_{la}]'),mk('l13_cg','C_{lg}=K_{rg}[P_{la}]'),mk('l13_cb','C_{lb}=K_{rb}[P_{la}]'),
  mk('l13_n','n_{lp}=\\operatorname{length}(A_{lp})')]);
 insertAfter(byId('t10_Yeb')||byId('t10_psl'),lg);
 var vis={type:'expression',id:'l13_poly',folderId:'f23',hidden:false,color:'#c0392b',latex:'\\operatorname{polygon}(X_{ls}[A_{lp}[i]...B_{lp}[i]],Y_{ls}[A_{lp}[i]...B_{lp}[i]])\\operatorname{for}i=[1...n_{lp}]',colorLatex:'\\operatorname{rgb}(C_{lr},C_{lg},C_{lb})',fill:true,fillOpacity:'1',lines:false};
 insertAfter(byId('t10_text'),[vis]);
 var Y='\\left\\{I_{l3}[1]>0:1000000I_{l3}[1],0\\right\\}+\\left\\{I_{l3}[2]>0:1000I_{l3}[2],0\\right\\}+\\left\\{I_{l3}[3]>0:I_{l3}[3],0\\right\\}';
 T.handlerLatex+=',\\left\\{\\left|'+Y+'-s_{gl}\\right|>0.5:s_{gl}\\to '+Y+'\\right\\}';
 log.push('logos types '+NT+' instances '+NL+' verts '+LG.U.length);
 return {S:S,log:log};
};
'patch13 loaded';
