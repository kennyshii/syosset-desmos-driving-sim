const fs=require('fs');const W=require('./world5.js');const FONT=require('./font.js');const LG=require('./logos.js');
const lines=JSON.parse(fs.readFileSync(__dirname+'/../data/osm_lines.json'));const rail=JSON.parse(fs.readFileSync(__dirname+'/../data/osm_rail.json'));
const osmp=JSON.parse(fs.readFileSync(__dirname+'/../data/osm_pois.json'));
const LOGOS=LG.build(LG.keys);
const w=W(lines,rail,osmp,LOGOS,{HMAX:8800,TMAX:6000,CARMAX:+(process.env.CARMAX||3000)});
const r1=v=>Math.round(v*10)/10,r3=v=>Math.round(v*1000)/1000;
const OFF=2600,QM=52001;
const enc=(x,y)=>Math.round((x+OFF)*10)*QM+Math.round((y+OFF)*10);
const seg=[];
w.lane.forEach((o,i)=>seg.push({ax:o.ax,ay:o.ay,bx:o.bx,by:o.by,k:o.k,n:o.n,fs:o.fs,fe:o.fe,src:i}));
w.railSegs.forEach(r=>{const dx=r.bx-r.ax,dy=r.by-r.ay,L=Math.hypot(dx,dy),n=Math.max(1,Math.ceil(L/60));for(let j=0;j<n;j++)seg.push({ax:r.ax+dx*j/n,ay:r.ay+dy*j/n,bx:r.ax+dx*(j+1)/n,by:r.ay+dy*(j+1)/n,k:6,n:0,fs:0,fe:0})});
w.lots.forEach(c=>{const a=[(c[0][0]+c[3][0])/2,(c[0][1]+c[3][1])/2],b=[(c[1][0]+c[2][0])/2,(c[1][1]+c[2][1])/2];const q=Math.hypot(c[0][0]-c[3][0],c[0][1]-c[3][1])/2;seg.push({ax:a[0],ay:a[1],bx:b[0],by:b[1],k:7,n:Math.min(63,Math.round(q*2)),fs:0,fe:0})});
w.lines.forEach(L=>{if(L.cls<3)return;const NS=L.pts.length-1;for(let i=0;i<NS;i++){const a=L.pts[i],b=L.pts[i+1];if(Math.hypot(b[0]-a[0],b[1]-a[1])<0.5)continue;seg.push({ax:a[0],ay:a[1],bx:b[0],by:b[1],k:8,n:L.cls,fs:i==0?1:0,fe:i==NS-1?1:0})}});
const G=100;const mid=o=>[(o.ax+o.bx)/2,(o.ay+o.by)/2];
const body=seg.filter(o=>o.k!==8),farS=seg.filter(o=>o.k===8);
const xs=body.map(o=>mid(o)[0]),ys=body.map(o=>mid(o)[1]);
const x0=Math.floor(Math.min(...xs))-1,y0=Math.floor(Math.min(...ys))-1;
const NX=Math.floor((Math.max(...xs)-x0)/G)+1,NY=Math.floor((Math.max(...ys)-y0)/G)+1;
const cellOf=(x,y)=>Math.floor((y-y0)/G)*NX+Math.floor((x-x0)/G);
body.forEach(o=>{const m=mid(o);o.cell=cellOf(m[0],m[1])});
body.sort((a,b)=>a.cell-b.cell);
const S=farS.concat(body);const HEAD=farS.length;
const C=[];{let pos=0;for(let k=0;k<=NX*NY;k++){while(pos<body.length&&body[pos].cell<k)pos++;C.push(HEAD+pos)}}
S.forEach((o,i)=>o.idx=i);
const laneIdx=new Map();S.forEach(o=>{if(o.src!==undefined)laneIdx.set(o.src,o.idx)});
S.forEach(o=>{if(o.n>1023||o.k>15)throw 'lane field overflow';});
const LA=S.map(o=>enc(o.ax,o.ay)),LB=S.map(o=>enc(o.bx,o.by)*65536+(o.n*64+o.fs*32+o.fe*16+o.k));
if(Math.max(...LB)>=2**53)throw 'LB overflow';
const pieces=new Map();w.lane.forEach((o,i)=>{const k=o.li+':'+o.si;if(!pieces.has(k))pieces.set(k,[]);pieces.get(k).push(i)});
const host=(h)=>{const L=pieces.get(h.li+':'+h.si);let best=L[0];for(const i of L){const o=w.lane[i];if(h.t>=o.t0-1e-6)best=i}const o=w.lane[best];let tr=h.t-o.t0;
 return {pi:laneIdx.get(best),tr}};
const pal=[];const pidx=c=>{const k=c.map(Math.round).join(',');let i=pal.indexOf(k);if(i<0){pal.push(k);i=pal.length-1}return i};
w.resWall.forEach(pidx);w.comWall.forEach(pidx);w.resRoof.forEach(pidx);
const RES0=0,COM0=w.resWall.length,ROOF0=COM0+w.comWall.length;
const headAll=w.blocks.slice(0,w.nhead);
const GB=150;const hx=w.houses.map(o=>o.x).concat(headAll.map(o=>o.x)),hy=w.houses.map(o=>o.y).concat(headAll.map(o=>o.y));
const bx0=Math.floor(Math.min(...hx))-1,by0=Math.floor(Math.min(...hy))-1;const BNX=Math.floor((Math.max(...hx)-bx0)/GB)+1,BNY=Math.floor((Math.max(...hy)-by0)/GB)+1;
const cellB0=(x,y)=>Math.floor((y-by0)/GB)*BNX+Math.floor((x-bx0)/GB);
const headA=headAll.filter(o=>!o.g),headG=headAll.filter(o=>o.g).map(o=>({o,cell:cellB0(o.x,o.y)})).sort((a,b)=>a.cell-b.cell);
const head=headA.concat(headG.map(e=>e.o));const NA=headA.length;
const HDC=[];{let pos=0;for(let k=0;k<=BNX*BNY;k++){while(pos<headG.length&&headG[pos].cell<k)pos++;HDC.push(NA+pos)}}
const HB={x:[],y:[],th:[],a:[],b:[],h:[],q:[],ci:[],ri:[],v:[],st:[],fk:[],z:[],nc:[]};
head.forEach(o=>{HB.x.push(r1(o.x));HB.y.push(r1(o.y));HB.th.push(r3(Math.atan2(o.s,o.c)));HB.a.push(r1(o.a));HB.b.push(r1(o.b));HB.h.push(r1(o.h));HB.q.push(r1(o.q));
 HB.ci.push(pidx(o.col)+1);HB.ri.push(pidx(o.roof)+1);HB.v.push(o.v);HB.st.push(o.st);HB.fk.push(o.fk);HB.z.push(r1(o.z));HB.nc.push(o.nc)});
const H=w.houses.map(o=>({o,cell:Math.floor((o.y-by0)/GB)*BNX+Math.floor((o.x-bx0)/GB)})).sort((a,b)=>a.cell-b.cell);
const NHEAD=head.length;const BC=[];{let pos=0;for(let k=0;k<=BNX*BNY;k++){while(pos<H.length&&H[pos].cell<k)pos++;BC.push(NHEAD+pos)}}
let maxErr=0;
const H1=[],H2=[];H.forEach(({o})=>{const hh=host(o.host);const T=Math.round((hh.tr+20)*10);if(T<0||T>1023)throw 'T out '+T;
 H1.push(hh.pi*2048+(o.host.side==1?1:0)*1024+T);const vb=o.vbits;const off4=Math.round(o.host.off*4);
 H2.push(off4*1048576+vb.kc*262144+vb.La*32768+vb.Lb*4096+vb.Lh*512+vb.Lq*128+vb.ci*8+vb.ri);
 const L=S[hh.pi];const len=Math.hypot(L.bx-L.ax,L.by-L.ay),ux=(L.bx-L.ax)/len,uy=(L.by-L.ay)/len;const sg=o.host.side==1?1:-1;
 const t=T/10-20,x=L.ax+t*ux-sg*(off4/4)*uy,y=L.ay+t*uy+sg*(off4/4)*ux;maxErr=Math.max(maxErr,Math.hypot(x-o.x,y-o.y))});
const GT=150;const tx=w.trees.map(o=>o.x),ty=w.trees.map(o=>o.y);
const tx0=Math.floor(Math.min(...tx))-1,ty0=Math.floor(Math.min(...ty))-1;const TNX=Math.floor((Math.max(...tx)-tx0)/GT)+1,TNY=Math.floor((Math.max(...ty)-ty0)/GT)+1;
const TT=w.trees.map(o=>({o,cell:Math.floor((o.y-ty0)/GT)*TNX+Math.floor((o.x-tx0)/GT)})).sort((a,b)=>a.cell-b.cell);
const TC=[];{let pos=0;for(let k=0;k<=TNX*TNY;k++){while(pos<TT.length&&TT[pos].cell<k)pos++;TC.push(pos)}}
const T1=[],T2=[];let tErr=0;TT.forEach(({o})=>{const hh=host(o.host);const T=Math.round((hh.tr+20)*10);if(T<0||T>1023)throw 'Tt out';
 T1.push(hh.pi*2048+(o.host.side==1?1:0)*1024+T);T2.push(Math.round(o.host.off*4)*1024+o.vbits.Lt*128+o.vbits.Lk*16+o.vbits.Lg);
 const L=S[hh.pi];const len=Math.hypot(L.bx-L.ax,L.by-L.ay),ux=(L.bx-L.ax)/len,uy=(L.by-L.ay)/len;const sg=o.host.side==1?1:-1;const t=T/10-20,off=Math.round(o.host.off*4)/4;
 tErr=Math.max(tErr,Math.hypot(L.ax+t*ux-sg*off*uy-o.x,L.ay+t*uy+sg*off*ux-o.y))});
const lenBy={};w.lines.forEach(L=>{let s=0;for(let i=0;i<L.pts.length-1;i++)s+=Math.hypot(L.pts[i+1][0]-L.pts[i][0],L.pts[i+1][1]-L.pts[i][1]);if(L.nm)lenBy[L.nm]=(lenBy[L.nm]||0)+s});
let st=null;{let bd=1e9;for(const o of w.lane){if(w.names[o.n-1]!=='Jackson Ave')continue;const dx=o.bx-o.ax,dy=o.by-o.ay,L2=dx*dx+dy*dy;const t=Math.max(0,Math.min(1,((-8.3-o.ax)*dx+(-20-o.ay)*dy)/L2));const px=o.ax+t*dx,py=o.ay+t*dy;const d=Math.hypot(-8.3-px,-20-py);if(d<bd){bd=d;st={px,py,dx,dy}}}
 let ux=st.dx,uy=st.dy;const L=Math.hypot(ux,uy);ux/=L;uy/=L;if(uy<0){ux=-ux;uy=-uy}st={x:r1(st.px+uy*2.6),y:r1(st.py-ux*2.6),h:r3(Math.atan2(ux,uy))};}
const out={OFF,QM,lane:{LA,LB,N:S.length,HEAD,G,x0,y0,NX,NY,C},
 head:HB,NHEAD,NA,HDC,houses:{H1,H2,N:H1.length,G:GB,x0:bx0,y0:by0,NX:BNX,NY:BNY,C:BC},
 trees:{T1,T2,N:T1.length,G:GT,x0:tx0,y0:ty0,NX:TNX,NY:TNY,C:TC},
 pal,RES0,COM0,ROOF0,LV:w.LV,names:w.names,nameLen:w.names.map(n=>Math.round(lenBy[n]||0)),
 poi:w.dest.map(p=>({nm:p.nm,label:p.label,x:r1(p.x),y:r1(p.y),h:r1(p.h),kind:p.kind})),start:st};

const cellB=(x,y)=>Math.floor((y-by0)/GB)*BNX+Math.floor((x-bx0)/GB);
const cellL=(x,y)=>Math.max(0,Math.min(NX*NY-1,Math.floor((y-y0)/G)*NX+Math.floor((x-x0)/G)));
const CS=w.cars.map(o=>({o,cell:cellL(o.x,o.y)})).sort((a,b)=>a.cell-b.cell);
const CC=[];{let pos=0;for(let k=0;k<=NX*NY;k++){while(pos<CS.length&&CS[pos].cell<k)pos++;CC.push(pos)}}
let cErr=0;const CR=CS.map(({o})=>{const hh=host(o.host);const T=Math.round((hh.tr+20)*10);if(T<0||T>1023)throw 'car T';
 const L=S[hh.pi];const len=Math.hypot(L.bx-L.ax,L.by-L.ay),ux=(L.bx-L.ax)/len,uy=(L.by-L.ay)/len;const sg=o.host.side==1?1:-1;const off=w.HW[L.k]-1.15;const t=T/10-20;
 cErr=Math.max(cErr,Math.hypot(L.ax+t*ux-sg*off*uy-o.x,L.ay+t*uy+sg*off*ux-o.y));
 return hh.pi*16384+(o.host.side==1?1:0)*8192+T*8+o.col});
const SS=w.signs.map(o=>({o,cell:Math.max(0,Math.min(BNX*BNY-1,cellB(o.x,o.y)))})).sort((a,b)=>a.cell-b.cell);
const SCc=[];{let pos=0;for(let k=0;k<=BNX*BNY;k++){while(pos<SS.length&&SS[pos].cell<k)pos++;SCc.push(pos)}}
const SG1=SS.map(({o})=>enc(o.x,o.y)),SG2=SS.map(({o})=>o.a*512+o.b);
const glyphs=Object.keys(FONT.G).filter(k=>k!==' ');const code=ch=>ch===' '?0:glyphs.indexOf(ch)+1;
const GM=14;const FP=[];glyphs.forEach(k=>{const pts=[];FONT.G[k].forEach(st=>{st.forEach(p=>pts.push(p));pts.push(null)});if(pts.length>GM)throw 'glyph too long '+k+' '+pts.length;
 while(pts.length<GM)pts.push(null);pts.forEach(p=>FP.push(p?Math.round(p[0]*10)*100+Math.round(p[1]*10):-1))});
const ABBR={};
const texts=w.names.map(n=>(ABBR[n]||n).toUpperCase()).concat(w.poiSigns.map(s=>s.text.toUpperCase()));
texts.forEach(t=>{for(const ch of t)if(ch!==' '&&glyphs.indexOf(ch)<0)throw 'missing glyph '+ch+' in '+t});
const ZC=[],ZS=[],ZN=[];texts.forEach(t=>{ZS.push(ZC.length);ZN.push(t.length);for(const ch of t)ZC.push(code(ch))});
while(ZC.length%3)ZC.push(0);const Z3=[];for(let i=0;i<ZC.length;i+=3)Z3.push(ZC[i]*4096+ZC[i+1]*64+ZC[i+2]);
const maxStreet=Math.max(...texts.slice(0,w.names.length).map(t=>t.length)),maxPoi=Math.max(...texts.slice(w.names.length).map(t=>t.length));
if(maxStreet>20||maxPoi>30)throw 'text too long '+maxStreet+' '+maxPoi;
const PS=w.poiSigns.map((s,i)=>({x:r1(s.x*10)/10,y:r1(s.y*10)/10,z:r1(s.z*100)/100,tx:r3(s.tx),ty:r3(s.ty),m:r3(s.m*10)/10,id:w.names.length+i+1}));
out.cars={CR,N:CR.length,C:CC};out.signs={G1:SG1,G2:SG2,N:SG1.length,C:SCc};
out.text={FP,GM,NG:glyphs.length,Z3,ZS,ZN,maxStreet,maxPoi,NSTREET:w.names.length};
out.poiSigns={x:PS.map(o=>o.x),y:PS.map(o=>o.y),z:PS.map(o=>o.z),tx:PS.map(o=>o.tx),ty:PS.map(o=>o.ty),m:PS.map(o=>o.m),id:PS.map(o=>o.id),N:PS.length};
out.HW=[0,1,2,3,4,5].map(k=>w.HW[k]);
const KV=[],KW=[],KA=[],KB=[],KC=[],KVS=[],KVN=[],KPS=[],KPN=[];const KR=[],KG=[],KBl=[];
LOGOS.forEach(t=>{KVS.push(KV.length+1);KPS.push(KA.length+1);t.polys.forEach(p=>{KA.push(KV.length+1);p.pts.forEach(([u,v])=>{KV.push(u);KW.push(v)});KB.push(KV.length);KR.push(p.col[0]);KG.push(p.col[1]);KBl.push(p.col[2])});KVN.push(KV.length+1-KVS[KVS.length-1]);KPN.push(KA.length+1-KPS[KPS.length-1])});
KVS.push(KV.length+1);KPS.push(KA.length+1);KV.push(0);KW.push(0);KA.push(KV.length);KB.push(KV.length);KR.push(0);KG.push(0);KBl.push(0);KVN.push(1);KPN.push(1);
const LGI=w.logos.map(o=>({x:r1(o.x*10)/10,y:r1(o.y*10)/10,z:r1(o.z*100)/100,tx:r3(o.tx),ty:r3(o.ty),m:r3(o.m),k:o.k,p:o.pr}));
out.logo={U:KV,W:KW,A:KA,B:KB,R:KR,G:KG,Bl:KBl,VS:KVS,VN:KVN,PS:KPS,PN:KPN,NT:LOGOS.length,keys:LOGOS.map(t=>t.key),
 x:LGI.map(o=>o.x),y:LGI.map(o=>o.y),z:LGI.map(o=>o.z),tx:LGI.map(o=>o.tx),ty:LGI.map(o=>o.ty),m:LGI.map(o=>o.m),k:LGI.map(o=>o.k),p:LGI.map(o=>o.p),N:LGI.length};
out.CODE={hb:BNX*(BNY+2),tb:TNX*(TNY+2),sb:NX*(NY+2)};
fs.writeFileSync(process.env.OUT||(__dirname+'/../data/syo_data4.json'),JSON.stringify(out));
console.log('cars',CR.length,'carErr',cErr.toFixed(2),'signs',SG1.length,'glyphs',glyphs.length,'FP',FP.length,'Z3',Z3.length,'maxStreet',maxStreet,'maxPoi',maxPoi,'poiSigns',PS.length);

const nums=LA.length*2+H1.length*2+T1.length*2+C.length+BC.length+TC.length+head.length*14;
const big=[['LA',LA],['H1',H1],['T1',T1],['CR',CR],['Z3',Z3],['FP',FP],['HBx',HB.x],['KV',KV],['KA',KA],['SG1',SG1]].filter(([n,a])=>a.length>9990);if(big.length)throw 'list over limit '+big.map(b=>b[0]+':'+b[1].length);
console.log('absorbed',w.absorbed.join(', '));console.log('head',NHEAD,'always',NA,'logos',w.logos.length,'logoVerts',out.logo.U.length,'logoPolys',out.logo.A.length,'dest',w.dest.length,'names',w.names.length,'lots',w.lots.length,'pylons',w.pylons.length,'code',JSON.stringify(out.CODE));
console.log('KB',Math.round(fs.statSync(process.env.OUT||(__dirname+'/../data/syo_data4.json')).size/1024),'segs',S.length,'farHead',HEAD,'houses',H1.length,'head',NHEAD,'trees',T1.length,'literal numbers ~',nums);
console.log('grids lane',NX+'x'+NY,'houses',BNX+'x'+BNY,'trees',TNX+'x'+TNY,'decode err house',maxErr.toFixed(2),'tree',tErr.toFixed(2),'start',JSON.stringify(st),'pal',pal.length);
console.log('names>=150m',w.names.filter(n=>(lenBy[n]||0)>=150).length,'of',w.names.length);
