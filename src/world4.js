// World generator v2: real street network (from map extraction) + POI detail
function SYO_world4(LINES0, RAILPTS, OPT){
// propagate street names to unnamed lines that continue a named street (nearly straight through a junction)
const propagate=(LS)=>{LS=LS.map(l=>({nm:l.nm,cls:l.cls,pts:l.pts}));
 const dirAt=(L,end)=>{const P=L.pts,n=P.length;let a,b;if(end===0){a=P[0];let k=1;while(k<n-1&&Math.hypot(P[k][0]-a[0],P[k][1]-a[1])<15)k++;b=P[k]}else{a=P[n-1];let k=n-2;while(k>0&&Math.hypot(P[k][0]-a[0],P[k][1]-a[1])<15)k--;b=P[k]}
  const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [dx/l,dy/l]}; // pointing away from the end, into the line
 const E=[];LS.forEach((L,li)=>{[0,1].forEach(end=>{const p=end===0?L.pts[0]:L.pts[L.pts.length-1];E.push({li,end,x:p[0],y:p[1],d:dirAt(L,end)})})});
 let changed=true,it=0,total=0;
 while(changed&&it<30){changed=false;it++;
  for(const e of E){const L=LS[e.li];if(L.nm)continue;
   let best=null,bc=-1;for(const f of E){if(f.li===e.li)continue;if(Math.abs(f.x-e.x)>9||Math.abs(f.y-e.y)>9)continue;if(Math.hypot(f.x-e.x,f.y-e.y)>9)continue;
    const c=-(e.d[0]*f.d[0]+e.d[1]*f.d[1]);if(c>bc){bc=c;best=f}}
   if(best&&bc>Math.cos(22*Math.PI/180)&&LS[best.li].nm){
    // make sure no other named line is an equally straight continuation with a different name
    L.nm=LS[best.li].nm;changed=true;total++}}}
 return {LS,total}};
const PR=propagate(LINES0);const LINES=PR.LS;
OPT=OPT||{};const BMAX=OPT.BMAX||9400, TMAX=OPT.TMAX||8500;
const HW={0:5.0,1:5.6,2:6.6,3:7.6,4:10.5,5:12};const PARKW=2.4;
const ll=(a,b)=>[(b+73.5010)*84300,(a-40.8160)*111200];
const POI=[
['The Local Table','r',[40.8114335,-73.5059065],10,8,7],['George White Restaurant','r',[40.827438,-73.502541],12,9,7],
['Nice Day Chinese','r',[40.8097993,-73.5037097],8,7,6],["Chris & Tony's",'r',[40.8099778,-73.5032019],11,9,8],
['The Paratha House','r',[40.8115919,-73.4969434],8,7,6],['Hilltop Kitchen & Bar','r',[40.8097117,-73.5108661],11,9,7],
["Flora's Pizza Cafe",'r',[40.8125895,-73.4941852],8,7,6],['Americano Pizza Shop','r',[40.8276175,-73.5025706],8,7,6],
["Phil's Pizzeria",'r',[40.8113591,-73.5056789],8,7,6],["Lia's Pizzeria",'r',[40.8119932,-73.4961753],8,7,6],
['Cafe Testarossa','r',[40.8110535,-73.4977222],8,7,6],["Mario's Pizzeria",'r',[40.8099122,-73.5037903],8,7,6],
['Arata Sushi','r',{w:[-54,1081.5]},8,7,6],['Rare650 Steak & Sushi','r',{w:[500,-563.3]},11,9,7],
['Syosset High School','s',[40.829484,-73.4840492],60,32,13],['South Woods Middle School','s',[40.8321,-73.4864],45,28,12],
['H.B. Thompson Middle School','s',[40.8046,-73.4922],45,28,12],['Village Elementary School','s',[40.8210576,-73.4970268],35,22,10],
['Berry Hill Elementary','s',[40.8332465,-73.4935751],35,22,10],['A.P. Willits Elementary','s',[40.803099,-73.4948587],35,22,10],
['South Grove Elementary','s',[40.7996108,-73.5056823],35,22,10],['Greentrees Country Day School','s',{w:[12,-29]},18,12,8],
['LI School for the Gifted','s',{w:[1479,795.7]},25,16,10],['Syosset Public Library','m',[40.7987333,-73.5020748],22,15,10],
['Post Office','m',[40.8240437,-73.5039398],15,11,8],['Syosset LIRR Station','m',[40.824707,-73.500969],6,6,3.4],
['Fire Dept HQ','m',[40.8262174,-73.499627],13,11,9],['Fire Dept Station 3','m',[40.7994282,-73.5024209],12,10,8],
['Syosset Hospital','m',[40.8114,-73.5088],32,22,20],['MercyFirst','m',[40.8218,-73.4884],24,16,11],
['CVS','m',{w:[16.5,1214]},15,12,7],['Marshalls & HomeGoods','m',{w:[355.5,-436.5]},40,25,9],['Iceworks Rink','m',{w:[-525.6,559.8]},32,22,12]];
let seed=20261014;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const R=(a,b)=>a+(b-a)*rnd();const pick=a=>a[(rnd()*a.length)|0];
const names=[...new Set(LINES.map(l=>l.nm).filter(n=>n))].sort();
const lines=LINES.map(l=>({nm:l.nm,cls:l.cls,hw:HW[l.cls],pts:l.pts,nid:l.nm?names.indexOf(l.nm)+1:0}));
const mkSegs=(pts,hw,cls,li)=>{const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<0.5)continue;out.push({a,b,ux:dx/len,uy:dy/len,len,hw,cls,li,si:i,mx:(a[0]+b[0])/2,my:(a[1]+b[1])/2})}return out};
const segs=[];lines.forEach((L,li)=>segs.push(...mkSegs(L.pts,L.hw,L.cls,li)));
const railSegs=mkSegs(RAILPTS,3.4,-1,-1);
const all=segs.concat(railSegs);
// spatial hash for segments
const GH=60,hash=new Map();const hk=(i,j)=>i*100003+j;
all.forEach((s,idx)=>{const x0=Math.min(s.a[0],s.b[0])-30,x1=Math.max(s.a[0],s.b[0])+30,y0=Math.min(s.a[1],s.b[1])-30,y1=Math.max(s.a[1],s.b[1])+30;
 for(let i=Math.floor(x0/GH);i<=Math.floor(x1/GH);i++)for(let j=Math.floor(y0/GH);j<=Math.floor(y1/GH);j++){const k=hk(i,j);if(!hash.has(k))hash.set(k,[]);hash.get(k).push(idx)}});
const nearSegs=(x,y)=>hash.get(hk(Math.floor(x/GH),Math.floor(y/GH)))||[];
const sd=(x,y,s)=>{const t=Math.max(0,Math.min(s.len,(x-s.a[0])*s.ux+(y-s.a[1])*s.uy));const qx=s.a[0]+s.ux*t,qy=s.a[1]+s.uy*t;return [Math.hypot(x-qx,y-qy),qx,qy]};
const roadClear=(x,y,m)=>{for(const i of nearSegs(x,y)){const s=all[i];if(sd(x,y,s)[0]<s.hw+m)return false}return true};
// ---------- POIs ----------
const P=POI.map(([nm,cat,pos,a,b,h])=>{const c=Array.isArray(pos)?ll(pos[0],pos[1]):pos.w.slice();return {nm,cat,x:c[0],y:c[1],a,b,h,ux:1,uy:0}});
for(let it=0;it<60;it++){
 for(const p of P){
  let best=null,bd=1e9;for(const s of segs){if(Math.abs(s.mx-p.x)>s.len/2+200||Math.abs(s.my-p.y)>s.len/2+200)continue;const d=sd(p.x,p.y,s)[0]-s.hw;if(d<bd){bd=d;best=s}}
  if(!best)continue; p.ux=best.ux;p.uy=best.uy;const c=p.ux,sn=p.uy;let mx=0,my=0;
  for(const i of new Set([].concat(...[-1,0,1].map(di=>[-1,0,1].map(dj=>nearSegs(p.x+di*GH,p.y+dj*GH))).flat()))){const s=all[i];
   for(const u of [-1,-0.5,0,0.5,1])for(const w of [-1,0,1]){const qx=p.x+u*p.a*c-w*p.b*sn,qy=p.y+u*p.a*sn+w*p.b*c;const d=sd(qx,qy,s);const need=s.hw+3;if(d[0]<need){let nx=qx-d[1],ny=qy-d[2],nl=Math.hypot(nx,ny);if(nl<0.01){nx=-s.uy;ny=s.ux;nl=1;if((p.x-s.mx)*nx+(p.y-s.my)*ny<0){nx=-nx;ny=-ny}}const k=(need-d[0])*0.35/nl;mx+=nx*k;my+=ny*k}}}
  p.x+=mx;p.y+=my;
 }
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const A=P[i],B=P[j];const r=0.72*(Math.hypot(A.a,A.b)+Math.hypot(B.a,B.b))+3;const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||0.01;if(d<r){const k=(r-d)/2/d;A.x-=dx*k;A.y-=dy*k;B.x+=dx*k;B.y+=dy*k}}
}
const frontOf=(p)=>{let best=null,bd=1e9;for(const s of segs){if(Math.abs(s.mx-p.x)>s.len/2+250||Math.abs(s.my-p.y)>s.len/2+250)continue;const d=sd(p.x,p.y,s);if(d[0]-s.hw<bd){bd=d[0]-s.hw;best=d}}const vx=best[1]-p.x,vy=best[2]-p.y;const c=p.ux,sn=p.uy;const ns=[[sn,-c],[c,sn],[-sn,c],[-c,-sn]];let k=1,bv=-1e9;ns.forEach((n,i)=>{const d=n[0]*vx+n[1]*vy;if(d>bv){bv=d;k=i+1}});return k};
// distinctive main-building looks
const poiLook=(p)=>{const n=p.nm;
 if(p.cat==='r'){const pal=[[176,64,52],[214,196,160],[120,62,48],[232,222,200],[150,40,40],[200,120,70]];const h=[...n].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);return {col:pal[h%pal.length],roof:[60,60,64],q:0}}
 if(p.cat==='s')return {col:[168,84,64],roof:[78,78,82],q:0};
 if(/LIRR/.test(n))return {col:[222,156,88],roof:[62,64,68],q:0};
 if(/Post Office/.test(n))return {col:[160,78,62],roof:[70,70,74],q:0};
 if(/Fire Dept/.test(n))return {col:[190,44,38],roof:[60,60,60],q:0};
 if(/Library/.test(n))return {col:[226,214,188],roof:[64,110,92],q:3};
 if(/Hospital/.test(n))return {col:[236,236,232],roof:[120,120,124],q:0};
 if(/CVS/.test(n))return {col:[240,240,238],roof:[90,90,92],q:0};
 if(/Marshalls/.test(n))return {col:[214,198,170],roof:[90,90,92],q:0};
 if(/Iceworks/.test(n))return {col:[176,198,214],roof:[120,140,160],q:5};
 return {col:[150,120,170],roof:[80,80,84],q:0};};
const blocks=[],decor=[],lots=[];
P.forEach(p=>{const lk=poiLook(p);p.fk=frontOf(p);blocks.push({x:p.x,y:p.y,c:p.ux,s:p.uy,a:p.a,b:p.b,h:p.h,q:lk.q,col:lk.col,roof:lk.roof,v:1300,st:{r:2,s:3,m:4}[p.cat],fk:p.fk,z:0,nc:0})});
// decor helpers in the POI frame: front normal nf, tangent tf; half-depth along nf = dF, half-width along tf = wF
const frame=(p)=>{const c=p.ux,s=p.uy;const ns=[[s,-c],[c,s],[-s,c],[-c,-s]];const nf=ns[p.fk-1];const tf=[-nf[1],nf[0]];const alongA=(p.fk%2===0);return {nf,tf,dF:alongA?p.a:p.b,wF:alongA?p.b:p.a}};
const box=(p,F,du,dn,hw,hd,z0,z1,col,o={})=>{ // du along front, dn along normal (out of the front), hw half width along front, hd half depth along normal
 const x=p.x+F.tf[0]*du+F.nf[0]*dn,y=p.y+F.tf[1]*du+F.nf[1]*dn;
 // block axis (c,s) along tf -> a=hw along tf, b=hd along nf
 const d={x,y,c:F.tf[0],s:F.tf[1],a:hw,b:hd,h:z1,q:o.q||0,col,roof:o.roof||col,v:o.v||320,st:5,fk:1,z:z0,nc:o.nc===undefined?1:o.nc};
 if(o.road!==false&&!roadClear(x,y,Math.max(hw,hd)*0.7+1))return null;
 decor.push(d);return d;};
const lot=(p,F,du,dn,hw,hd)=>{const cx=p.x+F.tf[0]*du+F.nf[0]*dn,cy=p.y+F.tf[1]*du+F.nf[1]*dn;
 if(!roadClear(cx,cy,Math.max(hw,hd)*0.5))return;
 const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,w])=>[cx+F.tf[0]*u*hw+F.nf[0]*w*hd,cy+F.tf[1]*u*hw+F.nf[1]*w*hd]);lots.push(c)};
const flag=(p,F,du,dn)=>{box(p,F,du,dn,0.12,0.12,0,10,[220,220,224],{nc:0,v:260});box(p,F,du+0.85,dn,0.7,0.04,8.6,9.6,[178,34,52],{v:260,road:false});box(p,F,du+0.45,dn,0.3,0.05,9.1,9.6,[40,60,140],{v:260,road:false})};
const poiSigns=[];
const TXT_ADV=4.6,TXT_W=(s)=>TXT_ADV*s.length-1.4;
// sign board on a facade: centre (du,dn) in POI frame, half width bw, z centre zc, half height bh; text drawn on its front face
const signBoard=(p,F,du,dn,bw,bh,zc,col,text,o={})=>{const hd=o.hd||0.12;
 box(p,F,du,dn,bw,hd,zc-bh,zc+bh,col,{v:o.v||420,road:false,nc:o.nc===undefined?1:o.nc});
 const W=TXT_W(text),m=Math.min(bh*2*0.62/6,0.86*2*bw/W);
 const x=p.x+F.tf[0]*du+F.nf[0]*(dn+hd+0.04),y=p.y+F.tf[1]*du+F.nf[1]*(dn+hd+0.04);
 poiSigns.push({x,y,z:zc,tx:F.tf[0],ty:F.tf[1],nx:F.nf[0],ny:F.nf[1],m,text,poi:p.nm});};
const fitBW=(text,bh,maxBW)=>{const W=TXT_W(text);const m=bh*2*0.62/6;return Math.min(maxBW,(W*m/0.86)/2+0.4)};
P.forEach(p=>{const F=frame(p),n=p.nm;
 if(p.cat==='r'){
  const aw=[[200,40,40],[30,110,60],[40,70,150],[120,30,50]][(n.length)%4];
  box(p,F,0,F.dF+0.9,F.wF*0.85,0.9,2.35,2.75,aw,{v:260,road:false});         // awning
  const bc=/Pizz/.test(n)?[150,28,24]:[[24,70,44],[28,36,84],[34,30,30],[110,30,40]][n.length%4];
  signBoard(p,F,0,F.dF-0.25,F.wF*0.8,0.85,p.h+0.9,bc,n);                    // rooftop sign board with the name
 } else if(p.cat==='s'){
  box(p,F,0,F.dF+2.2,6,2.2,3.6,4.2,[222,218,206],{v:320,road:false});           // entrance canopy
  for(const u of [-5,-1.7,1.7,5])box(p,F,u,F.dF+4,0.22,0.22,0,3.6,[236,232,220],{v:220,road:false}); // columns
  box(p,F,F.wF*0.9,-F.dF*0.6,F.wF*0.35,F.dF*0.65,0,p.h*0.8,[160,80,62],{nc:0,v:600,road:false}); // wing
  flag(p,F,-F.wF*0.55,F.dF+12);
  box(p,F,F.wF*0.45,F.dF+8,5.6,1.25,0.2,3.2,[246,190,20],{nc:0,v:300});         // yellow school bus
  box(p,F,-F.wF*0.15,F.dF+16,2.2,0.35,0,1.7,[30,90,60],{nc:0,v:220});           // school sign
  const bh=0.7;signBoard(p,F,0,F.dF,fitBW(n,bh,F.wF*0.95),bh,Math.min(p.h-1.3,6.2),[26,72,50],n,{v:600});
  lot(p,F,F.wF+18,0,16,F.dF*0.9);
 } else {
  if(/LIRR/.test(n)){
   // platform & canopy along the rail
   let best=null,bd=1e9;for(const s of railSegs){const d=sd(p.x,p.y,s);if(d[0]<bd){bd=d[0];best={s,q:[d[1],d[2]]}}}
   if(best){const s=best.s;const side=Math.sign((p.x-best.q[0])*(-s.uy)+(p.y-best.q[1])*s.ux)||1;const nx=-s.uy*side,ny=s.ux*side;
    const cx=best.q[0]+nx*5.4,cy=best.q[1]+ny*5.4;
    decor.push({x:cx,y:cy,c:s.ux,s:s.uy,a:70,b:2.4,h:1.1,q:0,col:[176,176,172],roof:[176,176,172],v:500,st:5,fk:1,z:0,nc:0});
    decor.push({x:cx,y:cy,c:s.ux,s:s.uy,a:42,b:2.0,h:3.7,q:0.6,col:[44,84,64],roof:[44,84,64],v:400,st:5,fk:1,z:3.2,nc:1});
    for(const t of [-36,-18,0,18,36])decor.push({x:cx+s.ux*t,y:cy+s.uy*t,c:s.ux,s:s.uy,a:0.15,b:0.15,h:3.2,q:0,col:[40,60,50],roof:[40,60,50],v:250,st:5,fk:1,z:1.1,nc:1});
    const cx2=best.q[0]-nx*5.4,cy2=best.q[1]-ny*5.4;
    decor.push({x:cx2,y:cy2,c:s.ux,s:s.uy,a:60,b:2.4,h:1.1,q:0,col:[176,176,172],roof:[176,176,172],v:500,st:5,fk:1,z:0,nc:0});}
   // ---- station house (modelled on the new Syosset station building): glass pavilion, brick piers,
   //      deep dark gable-style roof with warm wood soffit, steel posts, bench, stained-glass sail sculpture
   const W=F.wF,Dd=F.dF;
   for(const u of [-1,1])for(const w of [-1,1])box(p,F,u*(W+0.05),w*(Dd+0.05),0.5,0.5,0,3.3,[148,64,46],{nc:0,v:500,road:false}); // brick piers
   for(const u of [-0.55,-0.18,0.18,0.55])box(p,F,u*W,Dd+0.04,0.06,0.06,0,3.2,[62,54,48],{v:160,road:false});      // window mullions
   box(p,F,0,Dd+0.05,W*0.95,0.05,2.1,2.2,[62,54,48],{v:160,road:false});                                             // transom bar
   box(p,F,0,0,W+2.1,Dd+2.7,3.0,3.42,[206,130,66],{v:700,road:false});                                              // warm wood soffit band
   box(p,F,0,0,W+2.3,Dd+2.9,3.42,3.72,[54,56,60],{q:3.3,roof:[64,66,70],v:1000,road:false});                       // big dark roof
   for(const u of [-1,1])for(const w of [-1,1])box(p,F,u*(W+1.9),w*(Dd+2.4),0.12,0.12,0,3.0,[66,68,72],{nc:0,v:300,road:false}); // steel posts
   signBoard(p,F,0,Dd+2.62,3.6,0.36,2.62,[24,24,26],'SYOSSET LIRR',{hd:0.06,v:500});                                // hanging station sign
   box(p,F,W*0.35,Dd+1.3,1.1,0.25,0,0.46,[120,78,46],{v:180,road:false});                                           // bench
   // stained-glass sail sculpture (front-left)
   const su=-(W+3.6),sn=Dd+4.2;
   box(p,F,su+0.7,sn,1.2,0.55,0,0.4,[176,170,162],{nc:0,v:300,road:false});                                         // stone planter base
   box(p,F,su,sn,0.07,0.07,0.4,8.2,[206,210,216],{nc:0,v:350,road:false});                                          // steel mast
   const SC=[[214,40,44],[42,104,222],[244,204,44],[242,132,40],[232,92,170],[236,236,232],[64,176,96],[214,40,44],[42,104,222]];
   for(let i=0;i<9;i++){const z0=0.55+0.83*i,wi=1.05*(1-i/9.5)+0.1;const du=su+0.09+wi+0.45*Math.sin(Math.PI*i/8.5);
    box(p,F,du,sn,wi,0.06,z0,z0+0.78,SC[i],{v:350,road:false})}
   lot(p,F,0,-F.dF-22,30,15);
  } else if(/Post Office/.test(n)){flag(p,F,F.wF*0.7,F.dF+7);box(p,F,-F.wF*0.6,F.dF+3,0.35,0.3,0,1.2,[30,64,150],{nc:0,v:200});lot(p,F,F.wF+12,0,10,F.dF);
   signBoard(p,F,0,F.dF,fitBW('U.S. POST OFFICE',0.55,F.wF*0.92),0.55,p.h-1.2,[28,46,104],'U.S. POST OFFICE');}
  else if(/Fire Dept/.test(n)){box(p,F,-F.wF*0.3,F.dF+5,1.3,4.4,0.3,3.3,[200,30,28],{nc:0,v:300});flag(p,F,F.wF*0.75,F.dF+6);
   box(p,F,F.wF*0.15,F.dF+0.08,F.wF*0.3,0.08,0.1,4.2,[90,90,96],{v:260,road:false});
   const t=/HQ/.test(n)?'SYOSSET FIRE DEPT':'FIRE DEPT STATION 3';signBoard(p,F,0,F.dF,fitBW(t,0.55,F.wF*0.95),0.55,Math.min(p.h-1.1,5.4),[34,34,38],t);}
  else if(/Library/.test(n)){box(p,F,0,F.dF+2.4,5.5,2.4,4.6,5.4,[232,224,204],{q:1.6,roof:[232,224,204],v:320,road:false});
   for(const u of [-4.6,-1.6,1.6,4.6])box(p,F,u,F.dF+4.2,0.3,0.3,0,4.6,[244,240,230],{v:220,road:false});lot(p,F,F.wF+14,0,12,F.dF);
   signBoard(p,F,0,F.dF+4.8,5.4,0.36,5.0,[30,74,56],'SYOSSET PUBLIC LIBRARY',{hd:0.08});}
  else if(/Hospital/.test(n)){box(p,F,0,F.dF+0.1,0.6,0.1,p.h-6,p.h-1,[210,30,30],{v:600,road:false});box(p,F,0,F.dF+0.12,2.5,0.1,p.h-4.1,p.h-2.9,[210,30,30],{v:600,road:false});
   box(p,F,0,F.dF+3,7,3,3.4,4,[200,200,206],{v:300,road:false});lot(p,F,-F.wF-20,0,16,F.dF);
   signBoard(p,F,0,F.dF+6.0,6.6,0.42,4.55,[26,52,110],'SYOSSET HOSPITAL',{hd:0.08});}
  else if(/CVS/.test(n)){lot(p,F,0,F.dF+14,F.wF,9);signBoard(p,F,0,F.dF,F.wF*0.8,0.9,p.h-1.3,[204,0,0],'CVS PHARMACY',{v:400});}
  else if(/Marshalls/.test(n)){signBoard(p,F,-F.wF*0.45,F.dF,F.wF*0.35,1.0,p.h-1.6,[40,40,44],'MARSHALLS',{v:500});signBoard(p,F,F.wF*0.45,F.dF,F.wF*0.35,1.0,p.h-1.6,[120,30,40],'HOMEGOODS',{v:500});lot(p,F,0,F.dF+28,F.wF,22);}
  else if(/Iceworks/.test(n)){signBoard(p,F,0,F.dF,F.wF*0.6,1.0,p.h-2,[40,110,190],'ICEWORKS',{v:500});lot(p,F,0,F.dF+24,F.wF,18);}
  else if(/MercyFirst/.test(n)){flag(p,F,F.wF*0.7,F.dF+9);signBoard(p,F,0,F.dF,fitBW('MERCYFIRST',0.6,F.wF*0.9),0.6,p.h-1.4,[40,60,120],'MERCYFIRST');}
 }
});
const placed=P.map(p=>({x:p.x,y:p.y,r:Math.hypot(p.a,p.b)*(p.cat==='s'?1.35:1.05)+(p.cat==='s'?22:12)}));
decor.forEach(d=>placed.push({x:d.x,y:d.y,r:Math.hypot(d.a,d.b)*0.8+1}));
lots.forEach(c=>{const cx=(c[0][0]+c[2][0])/2,cy=(c[0][1]+c[2][1])/2;placed.push({x:cx,y:cy,r:Math.hypot(c[0][0]-c[2][0],c[0][1]-c[2][1])/2})});
// placed spatial index
const PH=40,ph=new Map();const addPlaced=o=>{const i=Math.floor(o.x/PH),j=Math.floor(o.y/PH);const k=hk(i,j);if(!ph.has(k))ph.set(k,[]);ph.get(k).push(o)};
placed.forEach(addPlaced);
const clear=(x,y,r)=>{const i0=Math.floor(x/PH),j0=Math.floor(y/PH);for(let i=i0-2;i<=i0+2;i++)for(let j=j0-2;j<=j0+2;j++){const L=ph.get(hk(i,j));if(!L)continue;for(const o of L)if(Math.hypot(x-o.x,y-o.y)<r+o.r)return false}return true};
// ---------- houses / commercial ----------
const resWall=[[238,234,224],[224,212,188],[200,206,212],[236,226,198],[188,204,216],[206,190,168],[226,214,230],[208,220,198],[244,240,232],[214,196,176]];
const resRoof=[[72,72,78],[98,80,68],[62,66,82],[112,96,84],[88,88,90],[124,72,60],[70,84,76]];
const comWall=[[192,118,98],[212,192,160],[172,172,168],[204,176,140],[156,112,92],[226,216,196],[184,152,120],[160,170,182]];
const isCom=(s,y)=>{const nm=lines[s.li].nm;return s.cls==4||(nm=='Jackson Ave'&&y>520)||(nm=='Cold Spring Rd'&&y<1320)||(nm=='Berry Hill Rd'&&y<1400)||(nm=='Underhill Blvd'&&y>780)||(nm=='S Oyster Bay Rd'&&y>-760)};
const segsN=segs.slice().sort((p,q)=>Math.hypot(p.mx,p.my-250)-Math.hypot(q.mx,q.my-250));
const houses=[];
const RW=resWall.length,CW=comWall.length,RR=resRoof.length;
const LV={res:{a:[5,0.3143],b:[5,0.2286],h:[5,0.2],q:[2.4,0.4]},com:{a:[9,1],b:[8,0.5714],h:[4.5,0.643],q:[0,0]},est:{a:[8,0.5714],b:[7,0.4286],h:[6,0.3571],q:[2.4,0.4]}};
const lv=(k,L)=>k[0]+k[1]*L;
for(const s of segsN){if(s.cls==5)continue;
 for(const side of [-1,1]){let t=4+R(0,10);
  while(t<s.len-4){const px=s.a[0]+s.ux*t,py=s.a[1]+s.uy*t,com=isCom(s,py),est=s.cls==0;const K=com?LV.com:est?LV.est:LV.res;const kc=com?1:est?2:0;
   const La=(rnd()*8)|0,Lb=(rnd()*8)|0,Lh=(rnd()*8)|0,Lq=(rnd()*4)|0;
   const a=lv(K.a,La),b=lv(K.b,Lb),h=lv(K.h,Lh),q=com?0:lv(K.q,Lq);
   const sb=com?R(10,17):est?R(14,26):R(6.5,9.5);
   const off=Math.round((s.hw+sb+b)*4)/4;const tq=Math.round(t*10)/10;
   const nx=-s.uy*side,ny=s.ux*side,cx=s.a[0]+s.ux*tq+nx*off,cy=s.a[1]+s.uy*tq+ny*off,c=s.ux,sn=s.uy,r=Math.hypot(a,b);
   let ok=blocks.length+decor.length+houses.length<BMAX&&clear(cx,cy,r*0.85);
   if(ok){const cs=[[-1,-1],[1,-1],[1,1],[-1,1],[0,0],[0,1],[0,-1]].map(([u,w])=>[cx+u*a*c-w*b*sn,cy+u*a*sn+w*b*c]);
    for(const q2 of cs){if(!roadClear(q2[0],q2[1],2.5)){ok=false;break}}}
   if(ok){const ci=com?((rnd()*CW)|0):((rnd()*RW)|0),ri=(rnd()*RR)|0;
    const o={x:cx,y:cy,c,s:sn,a,b,h,q,col:com?comWall[ci]:resWall[ci],roof:resRoof[ri],v:com?190:130,st:com?1:0,fk:side==1?1:3,z:0,nc:0,
      host:{li:s.li,si:s.si,t:tq,side,off},vbits:{kc,La,Lb,Lh,Lq,ci,ri}};
    houses.push(o);const pl={x:cx,y:cy,r:r*0.85};placed.push(pl);addPlaced(pl)}
   t+=2*a+(com?R(5,12):est?R(30,70):R(12,20));
  }}}
// ---------- trees ----------
const trees=[];
const tOk=(x,y)=>{if(!clear(x,y,1.2))return false;return roadClear(x,y,1.8)};
for(const s of segsN){if(s.cls==5)continue;
 for(const side of [-1,1]){let t=R(2,10);
  while(t<s.len-2){
   for(const off0 of [s.hw+2.9,s.hw+R(24,38),s.hw+R(40,60)]){if(rnd()<0.3&&trees.length<TMAX){
     const tq=Math.round((t+R(-1.5,1.5))*10)/10,off=Math.round((off0+R(-1.5,1.5))*4)/4;const nx=-s.uy*side,ny=s.ux*side;
     const x=s.a[0]+s.ux*tq+nx*off,y=s.a[1]+s.uy*tq+ny*off;
     const Lt=(rnd()*8)|0,Lk=(rnd()*8)|0,Lg=(rnd()*16)|0;
     if(tOk(x,y))trees.push({x,y,t:2.2+0.1714*Lt,k:2.2+0.2429*Lk,g:Lg/15,host:{li:s.li,si:s.si,t:tq,side,off},vbits:{Lt,Lk,Lg}})}}
   t+=R(14,24);}}}
// ---------- parked cars along the curb (parking lane) of residential & collector streets ----------
const cars=[];const CH=new Map();
const carNear=(x,y)=>{const i0=Math.floor(x/20),j0=Math.floor(y/20);for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++){const L=CH.get(hk(i,j));if(L)for(const o of L)if(Math.hypot(o.x-x,o.y-y)<5.3)return true}return false};
const addCar=o=>{const k=hk(Math.floor(o.x/20),Math.floor(o.y/20));if(!CH.has(k))CH.set(k,[]);CH.get(k).push(o);cars.push(o)};
const noPark=P.filter(p=>/Fire Dept|Hospital/.test(p.nm)).map(p=>({x:p.x,y:p.y,r:40}));
const carOK=(x,y,li)=>{for(const i of nearSegs(x,y)){const s2=all[i];if(s2.li===li&&s2.cls>=0)continue;if(sd(x,y,s2)[0]<s2.hw+1.2)return false}return true};
const CARMAX=OPT.CARMAX||3000,OCC=OPT.OCC||0.5;
for(const s of segsN){if(s.cls>2||cars.length>=CARMAX)continue;
 const off=s.hw-1.15;
 for(const side of [-1,1]){let t=3.0+R(0,3);
  while(t<s.len-3.0&&cars.length<CARMAX){
   if(rnd()<OCC){const tq=Math.round((t+R(-0.25,0.25))*10)/10;const nx=-s.uy*side,ny=s.ux*side;
    const cx=s.a[0]+s.ux*tq+nx*off,cy=s.a[1]+s.uy*tq+ny*off;
    let ok=!carNear(cx,cy)&&!noPark.some(q=>Math.hypot(q.x-cx,q.y-cy)<q.r);
    if(ok)for(const [u,w] of [[-2.4,-1],[2.4,-1],[-2.4,1],[2.4,1],[0,0]]){const qx=cx+s.ux*u+nx*w,qy=cy+s.uy*u+ny*w;if(!carOK(qx,qy,s.li)){ok=false;break}}
    if(ok)addCar({x:cx,y:cy,c:s.ux,s:s.uy,host:{li:s.li,si:s.si,t:tq,side},col:(rnd()*8)|0});}
   t+=6.0;}}}
// ---------- street-name signs at intersections ----------
const ends=[];lines.forEach((L,li)=>{const a=L.pts[0],b=L.pts[L.pts.length-1];ends.push({x:a[0],y:a[1],li},{x:b[0],y:b[1],li})});
const nodes=[];for(const e of ends){let nd=null;for(const n of nodes)if(Math.abs(n.x-e.x)<10&&Math.abs(n.y-e.y)<10&&Math.hypot(n.x-e.x,n.y-e.y)<10){nd=n;break}
 if(!nd){nd={x:e.x,y:e.y,lis:new Set()};nodes.push(nd)}nd.lis.add(e.li)}
{const SG=segs;for(let i=0;i<SG.length;i++){const p=SG[i];if(!lines[p.li].nm)continue;for(const j of nearSegs(p.mx,p.my)){const q=all[j];if(q.li<=p.li||q.cls<0||!lines[q.li].nm)continue;
  const x1=p.a[0],y1=p.a[1],x2=p.b[0],y2=p.b[1],x3=q.a[0],y3=q.a[1],x4=q.b[0],y4=q.b[1];const d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);if(Math.abs(d)<1e-9)continue;
  const t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/d,u=-((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/d;if(t<0||t>1||u<0||u>1)continue;
  const x=x1+t*(x2-x1),y=y1+t*(y2-y1);if(nodes.some(n=>Math.hypot(n.x-x,n.y-y)<10))continue;nodes.push({x,y,lis:new Set([p.li,q.li])})}}}
const signs=[];
for(const nd of nodes){
 for(const i of nearSegs(nd.x,nd.y)){const s=all[i];if(s.li<0)continue;if(sd(nd.x,nd.y,s)[0]<s.hw+3)nd.lis.add(s.li)}
 const byName=new Map();for(const li of nd.lis){const L=lines[li];const key=L.nm||('#'+li);
  let best=null,bd=1e9;for(const s of segs){if(s.li!==li)continue;const d=sd(nd.x,nd.y,s)[0];if(d<bd){bd=d;best=s}}
  const cur=byName.get(key);if(!cur||L.cls>cur.cls)byName.set(key,{nm:L.nm,cls:L.cls,hw:L.hw,ux:best.ux,uy:best.uy})}
 const arr=[...byName.values()];if(arr.length<2)continue;const namedA=arr.filter(o=>o.nm).sort((p,q)=>q.cls-p.cls||p.nm.localeCompare(q.nm));if(!namedA.length)continue;
 const A=namedA[0];const rest=arr.filter(o=>o!==A);
 const B=rest.slice().sort((p,q)=>Math.abs(p.ux*A.ux+p.uy*A.uy)-Math.abs(q.ux*A.ux+q.uy*A.uy))[0];
 if(Math.abs(A.ux*B.ux+A.uy*B.uy)>0.9)continue;
 const B2=B.nm?B:(rest.filter(o=>o.nm&&o.nm!==A.nm)[0]||{nm:null});
 const nA=[-A.uy,A.ux];let pos=null;
 for(const sa of [1,-1])for(const sb of [1,-1]){if(pos)continue;for(const ex of [2.2,3.4,4.8]){const x=nd.x+sa*(B.hw+ex)*A.ux+sb*(A.hw+ex)*nA[0],y=nd.y+sa*(B.hw+ex)*A.uy+sb*(A.hw+ex)*nA[1];
   if(roadClear(x,y,1.3)&&clear(x,y,0.6)){pos=[x,y];break}}}
 if(!pos)continue;
 const ia=names.indexOf(A.nm)+1,ib=B2.nm?names.indexOf(B2.nm)+1:0;
 if(signs.some(o=>Math.hypot(o.x-pos[0],o.y-pos[1])<30&&((o.a===ia&&o.b===ib)||(o.a===ib&&o.b===ia))))continue;
 signs.push({x:pos[0],y:pos[1],a:ia,b:ib});
}
// ---------- road quads ----------
const r1=v=>Math.round(v*10)/10;
const far=[],near=[];
const quad=(ax,ay,bx,by,ux,uy,o,q,col,rad,ly,arr)=>{const nx=-uy,ny=ux;const len=Math.hypot(bx-ax,by-ay);
 arr.push({c:[[ax+(o+q)*nx,ay+(o+q)*ny],[bx+(o+q)*nx,by+(o+q)*ny],[bx+(o-q)*nx,by+(o-q)*ny],[ax+(o-q)*nx,ay+(o-q)*ny]],m:[(ax+bx)/2+o*nx,(ay+by)/2+o*ny],len,q,col,rad,ly})};
const pieceIter=(pts,hw,step,fn)=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<0.5)continue;const ux=dx/len,uy=dy/len,n=Math.max(1,Math.ceil(len/step));
 for(let j=0;j<n;j++){const t0=len*j/n-(j==0&&i==0?hw*0.6:0.3),t1=len*(j+1)/n+(j==n-1&&i==pts.length-2?hw*0.6:0.3);fn(a[0]+ux*t0,a[1]+uy*t0,a[0]+ux*t1,a[1]+uy*t1,ux,uy)}}};
// rails (near)
pieceIter(RAILPTS,3.4,50,(ax,ay,bx,by,ux,uy)=>{quad(ax,ay,bx,by,ux,uy,0,3.4,[139,131,120],200,0,near);quad(ax,ay,bx,by,ux,uy,0.8,0.08,[74,74,78],200,1,near);quad(ax,ay,bx,by,ux,uy,-0.8,0.08,[74,74,78],200,1,near)});
// parking lots (near, layer 0)
lots.forEach(c=>{const m=[(c[0][0]+c[2][0])/2,(c[0][1]+c[2][1])/2];near.push({c,m,len:Math.hypot(c[0][0]-c[1][0],c[0][1]-c[1][1]),q:Math.hypot(c[1][0]-c[2][0],c[1][1]-c[2][1])/2,col:[118,120,124],rad:200,ly:0})});
lines.forEach(L=>{const hw=L.hw,k=L.cls;
 if(k>=2)pieceIter(L.pts,hw,50,(ax,ay,bx,by,ux,uy)=>{quad(ax,ay,bx,by,ux,uy,hw+1.7,1.1,[192,192,186],130,2,near);quad(ax,ay,bx,by,ux,uy,-hw-1.7,1.1,[192,192,186],130,2,near)});
 if(k>=3)pieceIter(L.pts,hw,9999,(ax,ay,bx,by,ux,uy)=>quad(ax,ay,bx,by,ux,uy,0,hw,[85,87,92],400,3,far));
 else pieceIter(L.pts,hw,50,(ax,ay,bx,by,ux,uy)=>quad(ax,ay,bx,by,ux,uy,0,hw,[85,87,92],200,3,near));
 if(k>=2)pieceIter(L.pts,hw,50,(ax,ay,bx,by,ux,uy)=>quad(ax,ay,bx,by,ux,uy,0,0.14,[242,194,48],200,4,near));
 if(k>=3)pieceIter(L.pts,hw,50,(ax,ay,bx,by,ux,uy)=>{quad(ax,ay,bx,by,ux,uy,hw-0.5,0.1,[244,244,240],160,5,near);quad(ax,ay,bx,by,ux,uy,0.5-hw,0.1,[244,244,240],160,5,near)});
});
// ---------- lane-assist segments (<=60m) and minimap segments (<=150m, simplified) ----------
const lane=[];lines.forEach((L,li)=>{const NS=L.pts.length-1;for(let i=0;i<NS;i++){const a=L.pts[i],b=L.pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<0.5)continue;const n=Math.max(1,Math.ceil(len/60));
 for(let j=0;j<n;j++){lane.push({ax:a[0]+dx*j/n,ay:a[1]+dy*j/n,bx:a[0]+dx*(j+1)/n,by:a[1]+dy*(j+1)/n,w:L.hw,n:L.nid,k:L.cls,ux:dx/len,uy:dy/len,li,si:i,t0:len*j/n,t1:len*(j+1)/n,fs:(i==0&&j==0)?1:0,fe:(i==NS-1&&j==n-1)?1:0})}}});
const rdp=(P,eps)=>{if(P.length<3)return P;const a=P[0],b=P[P.length-1];const abx=b[0]-a[0],aby=b[1]-a[1],L=Math.hypot(abx,aby);let k=-1,dm=-1;for(let i=1;i<P.length-1;i++){const d=L<1e-9?Math.hypot(P[i][0]-a[0],P[i][1]-a[1]):Math.abs(abx*(P[i][1]-a[1])-aby*(P[i][0]-a[0]))/L;if(d>dm){dm=d;k=i}}if(dm>eps)return rdp(P.slice(0,k+1),eps).slice(0,-1).concat(rdp(P.slice(k),eps));return [a,b]};
const mini=[];lines.forEach(L=>{const Q=rdp(L.pts,5);for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<1)continue;const n=Math.max(1,Math.ceil(len/150));
 for(let j=0;j<n;j++)mini.push({ax:a[0]+dx*j/n,ay:a[1]+dy*j/n,bx:a[0]+dx*(j+1)/n,by:a[1]+dy*(j+1)/n,k:L.cls})}});
return {P,blocks:blocks.concat(decor,houses),npoi:P.length,ndecor:decor.length,houses,trees,far,near,lane,mini,names,lines,lots,railSegs:railSegs.map(r=>({ax:r.a[0],ay:r.a[1],bx:r.b[0],by:r.b[1]})),resWall,comWall,resRoof,LV,cars,signs,poiSigns,propagated:PR.total,linesOut:LINES,HW};
}
if(typeof module!=='undefined')module.exports=SYO_world4;
