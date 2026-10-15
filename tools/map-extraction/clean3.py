import numpy as np, json, sys
sys.path.insert(0,'maps')
from labels import L as LABELS
from scipy.spatial import cKDTree
from scipy import ndimage as ndi

X0,Y0,RES=-2600,-2600,2.0
FR = {1:(40.829795,-73.513586),2:(40.829795,-73.489861),3:(40.820353,-73.513586),4:(40.820353,-73.489861),
      5:(40.810910,-73.513586),6:(40.810910,-73.489861),7:(40.801468,-73.513586),8:(40.801468,-73.489861)}
M = 156543.03392*np.cos(np.radians(40.816))/2**16
def ll(lat,lon): return ((lon+73.5010)*84300, (lat-40.8160)*111200)
def plen(P): return float(np.sum(np.hypot(*np.diff(P,axis=0).T))) if len(P)>1 else 0.0
def densify(P,step):
    out=[P[0]]
    for a,b in zip(P[:-1],P[1:]):
        L=np.hypot(*(b-a)); n=max(1,int(L//step))
        for k in range(1,n+1): out.append(a+(b-a)*k/n)
    return np.array(out)

polys=[np.array(p,float) for p in json.load(open('maps/ext_polys.json')) if len(p)>=2]
old=json.load(open('maps/old_world.json')); oldL=[np.array(l['pts']) for l in old['lines']]
oldpts=np.vstack([densify(P,2) for P in oldL]); oldT=cKDTree(oldpts)
rail=np.array(json.load(open('maps/rail.json'))); railT=cKDTree(densify(rail,2))
loc=np.load('maps/loc.npy'); maj=np.load('maps/maj.npy'); road=loc|maj
dt=ndi.distance_transform_edt(road); majd=ndi.binary_dilation(maj,iterations=2)
def cells(S):
    cj=np.stack([((S[:,1]-Y0)/RES).astype(int),((S[:,0]-X0)/RES).astype(int)],1)
    ok=(cj[:,0]>=0)&(cj[:,0]<road.shape[0])&(cj[:,1]>=0)&(cj[:,1]<road.shape[1])
    return cj[ok]

# 1) node clustering over ALL skeleton polylines (old+new together, before classification)
E=[p for p in polys if plen(p)>0]
endpts=np.array([P[i] for P in E for i in (0,-1)])
T=cKDTree(endpts)
pairs=T.query_pairs(7.0)
par=list(range(len(endpts)))
def f(a):
    while par[a]!=a: par[a]=par[par[a]]; a=par[a]
    return a
for a,b in pairs: par[f(a)]=f(b)
cl={}
for i in range(len(endpts)): cl.setdefault(f(i),[]).append(i)
cent={}
for c,idx in cl.items():
    m=endpts[idx].mean(0)
    for i in idx: cent[i]=(c,m)
edges=[]
for k,P in enumerate(E):
    a=cent[2*k]; b=cent[2*k+1]
    Q=P.copy(); Q[0]=a[1]; Q[-1]=b[1]
    if a[0]==b[0] and plen(P)<20: continue      # tiny piece inside a junction cluster
    edges.append({'a':a[0],'b':b[0],'P':Q})
print('edges after node clustering',len(edges))
# 2) merge collinear edge pairs at every node
def dirv(P,end):
    if end==0: v=P[min(3,len(P)-1)]-P[0]
    else: v=P[max(-4,-len(P))]-P[-1]
    n=np.linalg.norm(v); return v/(n+1e-9)
inc={}
for i,e in enumerate(edges):
    inc.setdefault(e['a'],[]).append((i,0)); inc.setdefault(e['b'],[]).append((i,1))
link={}
for node,lst in inc.items():
    cand=[]
    for x in range(len(lst)):
        for y in range(x+1,len(lst)):
            (i,ei),(j,ej)=lst[x],lst[y]
            if i==j: continue
            c=float(np.dot(dirv(edges[i]['P'],ei),dirv(edges[j]['P'],ej)))
            if c<-0.75: cand.append((c,lst[x],lst[y]))
    cand.sort(key=lambda t:t[0]); usedh=set()
    for c,p,q in cand:
        if p in usedh or q in usedh: continue
        link[p]=q; link[q]=p; usedh.add(p); usedh.add(q)
visited=[False]*len(edges); merged=[]
def walk(i,enter_end):
    # traverse edge i entering at enter_end; return list of oriented polylines
    pts=[]; cur=i; end=enter_end; global _brk
    _brk=[0]
    while True:
        visited[cur]=True
        P=edges[cur]['P'] if end==0 else edges[cur]['P'][::-1]
        pts.append(P if not pts else P[1:])
        _brk.append(sum(len(q) for q in pts)-1)
        out_end=1-end
        nxt=link.get((cur,out_end))
        if nxt is None or visited[nxt[0]]: break
        cur,end=nxt
    return np.vstack(pts)
for i in range(len(edges)):
    if visited[i]: continue
    # find chain start: go backwards from end 0
    cur,end=i,0; seen=set()
    while True:
        prv=link.get((cur,end))
        if prv is None or prv[0] in seen or prv[0]==i and len(seen)>0: break
        seen.add(cur); cur,end=prv[0],1-prv[1]
        if cur==i: break
    P=walk(cur,end)
    merged.append({'a':(round(P[0][0],1),round(P[0][1],1)),'b':(round(P[-1][0],1),round(P[-1][1],1)),'P':P,'brk':list(_brk)})
edges=merged
print('after collinear merge',len(edges))

# 3) classify: transfer old names/classes; drop rail and unmatched highways
oldD=[densify(P,2) for P in oldL]
oldIdx=np.concatenate([np.full(len(D),k) for k,D in enumerate(oldD)])
oldDir=np.vstack([np.vstack([np.diff(D,axis=0),np.diff(D,axis=0)[-1:]]) for D in oldD])
oldDir=oldDir/(np.linalg.norm(oldDir,axis=1,keepdims=True)+1e-9)
oT=cKDTree(np.vstack(oldD))
railD=densify(rail,2); rT=cKDTree(railD)
new=[]; railed=[]
for e in edges:
    P=e['P']; S=densify(P,3)
    if len(S)<2: continue
    dv=np.vstack([np.diff(S,axis=0),np.diff(S,axis=0)[-1:]]); dv=dv/(np.linalg.norm(dv,axis=1,keepdims=True)+1e-9)
    dr,ri=rT.query(S)
    rv=np.diff(railD,axis=0); rv=np.vstack([rv,rv[-1:]]); rv=rv/(np.linalg.norm(rv,axis=1,keepdims=True)+1e-9)
    par_r=np.abs(np.sum(dv*rv[ri],1))>0.9
    is_rail=np.mean((dr<28)&par_r)>0.5
    d,oi=oT.query(S)
    para=np.abs(np.sum(dv*oldDir[oi],1))>0.85
    cj0=cells(S); ismaj = len(cj0)>0 and majd[cj0[:,0],cj0[:,1]].mean()>0.5
    m=(d<(90 if ismaj else 45))&para
    nm=''; cls=None
    if m.mean()>0.5:
        ids,cnt=np.unique(oldIdx[oi[m]],return_counts=True); k=int(ids[np.argmax(cnt)])
        nm=old['lines'][k]['nm']; cls=old['lines'][k]['cls']
    if is_rail and cls is None:
        railed.append(P.tolist()); continue
    cj=cells(S)
    if len(cj)==0: continue
    mj=majd[cj[:,0],cj[:,1]].mean()
    if mj>0.5 and cls is None:
        c=S.mean(0)
        if c[1]<-1700 or np.hypot(c[0]-776,c[1]+406)<260 or np.hypot(c[0]-923,c[1]+1772)<300: continue
        cls=3
    w=float(np.median(dt[cj[:,0],cj[:,1]]))
    new.append({'P':P,'w':w,'a':e['a'],'b':e['b'],'brk':e['brk'],'nm0':nm,'cls0':cls})
json.dump(railed,open('maps/rail_edges.json','w'))
# remove isolated short bits (no connection to anything and short)
deg={}
for e in edges:
    deg[e['a']]=deg.get(e['a'],0)+1; deg[e['b']]=deg.get(e['b'],0)+1
res=[]
for e in new:
    L=plen(e['P'])
    da=deg[e['a']]; db=deg[e['b']]
    near_old=False
    if L<25: continue
    if da==1 and db==1 and L<120 and not near_old: continue
    res.append(e)
print('new edges',len(res),'km',round(sum(plen(e['P']) for e in res)/1000,1))
# 3b) bridge gaps between dangling ends that line up
def endinfo(P,end):
    if end==0: return P[0], -dirv(P,0)*-1 if False else (P[0]-P[min(4,len(P)-1)])/ (np.linalg.norm(P[0]-P[min(4,len(P)-1)])+1e-9)
    return P[-1], (P[-1]-P[max(-5,-len(P))])/(np.linalg.norm(P[-1]-P[max(-5,-len(P))])+1e-9)
degc={}
for e in res:
    for nd in (e['a'],e['b']): degc[nd]=degc.get(nd,0)+1
dang=[]
for i,e in enumerate(res):
    for end,nd in ((0,e['a']),(-1,e['b'])):
        if degc.get(nd,0)==1:
            p,v=endinfo(e['P'],end); dang.append((i,end,p,v))
used=set(); joins=0
for x in range(len(dang)):
    i,ei,p,v=dang[x]
    if (i,ei) in used: continue
    best=None
    for y in range(len(dang)):
        j,ej,q,w=dang[y]
        if j==i or (j,ej) in used: continue
        dq=q-p; L=np.hypot(*dq)
        if L<1 or L>45: continue
        u=dq/L
        if np.dot(u,v)>0.9 and np.dot(-u,w)>0.9 and np.dot(v,w)<-0.8:
            if best is None or L<best[0]: best=(L,y)
    if best:
        j,ej,q,w=dang[best[1]]
        used.add((i,ei)); used.add((j,ej)); joins+=1
        if ei==0: res[i]['P']=np.vstack([q,res[i]['P']]); res[i]['off']=res[i].get('off',0)+1
        else: res[i]['P']=np.vstack([res[i]['P'],q])
print('bridged gaps',joins)
# 4) snap dangling endpoints onto nearby lines (old or new) to form junctions
allD=[densify(P,2) for P in oldL]+[densify(e['P'],2) for e in res]
own=np.concatenate([np.full(len(D),-1) for D in allD[:len(oldL)]]+[np.full(len(D),i) for i,D in enumerate(allD[len(oldL):])])
allP=np.vstack(allD); AT=cKDTree(allP)
for i,e in enumerate(res):
    P=e['P'].copy()
    for end in (0,-1):
        nd=e['a'] if end==0 else e['b']
        if deg.get(nd,0)>1: continue
        ds,ii=AT.query(P[end],k=12)
        for d,j in zip(ds,ii):
            if own[j]==i: continue
            if d<14:
                if end==0: P=np.vstack([allP[j],P]); e['off']=1
                else: P=np.vstack([P,allP[j]])
            break
    e['P']=P
# 5) names per piece, then split chains at name changes
lab=[]
for fr,lst in LABELS.items():
    cx,cy=ll(*FR[fr])
    for nm,px,py in lst: lab.append((nm,cx+(px-756)*M,cy-(py-385.5)*M))
pieces=[]  # (line idx, piece idx, pts)
for i,e in enumerate(res):
    P=e['P']; off=e.get('off',0); br=[min(len(P)-1,x+off) for x in e['brk']]
    br[0]=0; br[-1]=len(P)-1
    br=sorted(set(br))
    e['br']=br
    for k in range(len(br)-1): pieces.append((i,k,P[br[k]:br[k+1]+1]))
dp=[];di=[]
for n,(i,k,Q) in enumerate(pieces):
    if len(Q)<2: Q=np.vstack([Q,Q])
    D=densify(Q,2); dp.append(D); di.append(np.full(len(D),n))
T=cKDTree(np.vstack(dp)); di=np.concatenate(di)
pn=[None]*len(pieces); ps=[1e9]*len(pieces)
for n,(i,k,Q) in enumerate(pieces):
    if res[i]['nm0']: pn[n]=res[i]['nm0']; ps[n]=-1
for nm,x,y in lab:
    d,j=T.query([x,y]); b=int(di[j])
    if d<30 and d<ps[b]: pn[b]=nm; ps[b]=d
# propagate within each line
byline={}
for n,(i,k,Q) in enumerate(pieces): byline.setdefault(i,[]).append(n)
out_lines=[]
def rdp(P,eps):
    if len(P)<3: return P
    a,b=P[0],P[-1]; ab=b-a; L=np.hypot(*ab)
    d=np.hypot(*(P-a).T) if L<1e-9 else np.abs(ab[0]*(P[:,1]-a[1])-ab[1]*(P[:,0]-a[0]))/L
    k=int(np.argmax(d))
    if d[k]>eps: return np.vstack([rdp(P[:k+1],eps)[:-1],rdp(P[k:],eps)])
    return np.vstack([a,b])
for i,lst in byline.items():
    nms=[pn[n] for n in lst]
    for it in range(len(nms)):
        for k in range(len(nms)):
            if nms[k] is None:
                if k>0 and nms[k-1]: nms[k]=nms[k-1]
                elif k+1<len(nms) and nms[k+1]: nms[k]=nms[k+1]
    # group runs
    k=0
    while k<len(lst):
        j=k
        while j+1<len(lst) and nms[j+1]==nms[k]: j+=1
        P=np.vstack([pieces[lst[k]][2]]+[pieces[lst[m]][2][1:] for m in range(k+1,j+1)])
        D=densify(P,2)
        if len(D)>8:
            k2=7; pad=np.vstack([np.repeat(D[:1],k2,0),D,np.repeat(D[-1:],k2,0)])
            ker=np.ones(2*k2+1)/(2*k2+1)
            Sx=np.convolve(pad[:,0],ker,'valid'); Sy=np.convolve(pad[:,1],ker,'valid')
            D2=np.stack([Sx,Sy],1); D2[0]=D[0]; D2[-1]=D[-1]
        else: D2=D
        out_lines.append((nms[k] or '', res[i]['w'], rdp(D2,1.5), res[i]['cls0']))
        k=j+1
out=[]
oldcls={l['nm']:l['cls'] for l in old['lines'] if l['nm']}
for nm,w,P,c0 in out_lines:
    if plen(P)<8: continue
    cls=2 if w>=3.2 else (1 if w>=2.0 else 0)
    if c0 is not None: cls=c0
    elif nm in oldcls: cls=oldcls[nm]
    out.append({'nm':nm,'cls':cls,'pts':P.round(1).tolist()})
names=[o['nm'] for o in out]
json.dump(out,open('maps/new_lines.json','w'))
lens=sorted(plen(np.array(o['pts'])) for o in out)
print('lines',len(out),'named',sum(1 for o in out if o['nm']),'km',round(sum(lens)/1000,1),'cls',[sum(1 for o in out if o['cls']==c) for c in (0,1,2)])
print('len q',[round(lens[int(q*len(lens))]) for q in (0.1,0.5,0.9)])
print('unused',sorted(set(l[0] for l in lab)-set(n for n in names if n)))
