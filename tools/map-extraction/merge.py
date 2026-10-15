import numpy as np, json, math, sys
sys.path.insert(0,'maps')
from labels import L as LABELS
from scipy import ndimage as ndi
from scipy.spatial import cKDTree

X0,Y0,RES = -2600,-2600,2.0
FR = {1:(40.829795,-73.513586),2:(40.829795,-73.489861),3:(40.820353,-73.513586),4:(40.820353,-73.489861),
      5:(40.810910,-73.513586),6:(40.810910,-73.489861),7:(40.801468,-73.513586),8:(40.801468,-73.489861)}
M = 156543.03392*np.cos(np.radians(40.816))/2**16
def ll(lat,lon): return ((lon+73.5010)*84300, (lat-40.8160)*111200)

polys=[np.array(p) for p in json.load(open('maps/ext_polys.json'))]
old=json.load(open('maps/old_world.json'))
oldL=[np.array(l['pts']) for l in old['lines']]
loc=np.load('maps/loc.npy'); maj=np.load('maps/maj.npy')
road=(loc|maj)
dt=ndi.distance_transform_edt(road)
majd=ndi.binary_dilation(maj,iterations=2)

def densify(P,step):
    out=[P[0]]
    for a,b in zip(P[:-1],P[1:]):
        L=np.hypot(*(b-a)); n=max(1,int(L//step))
        for k in range(1,n+1): out.append(a+(b-a)*k/n)
    return np.array(out)
def plen(P): return float(np.sum(np.hypot(*np.diff(P,axis=0).T))) if len(P)>1 else 0.0
oldpts=np.vstack([densify(P,2) for P in oldL]); oldT=cKDTree(oldpts)
rail=np.array(json.load(open('maps/rail.json'))); railT=cKDTree(densify(rail,2))
def cell(p): return (int((p[1]-Y0)/RES), int((p[0]-X0)/RES))

keep=[]
for P in polys:
    if len(P)<2: continue
    S=densify(P,3)
    d,_=oldT.query(S)
    if np.mean(d<14)>0.55: continue
    dr,_=railT.query(S)
    if np.mean(dr<9)>0.5: continue
    cj=np.array([cell(p) for p in S])
    ok=(cj[:,0]>=0)&(cj[:,0]<road.shape[0])&(cj[:,1]>=0)&(cj[:,1]<road.shape[1])
    if ok.sum()==0: continue
    if majd[cj[ok,0],cj[ok,1]].mean()>0.5: continue
    keep.append({'P':P,'w':float(np.median(dt[cj[ok,0],cj[ok,1]]))})
print('kept',len(keep),'km',round(sum(plen(k['P']) for k in keep)/1000,1))

def key(p): return (round(p[0]/3),round(p[1]/3))
def components(items):
    ends={}
    for i,k in enumerate(items):
        for e in (0,-1): ends.setdefault(key(k['P'][e]),[]).append(i)
    par=list(range(len(items)))
    def f(a):
        while par[a]!=a: par[a]=par[par[a]]; a=par[a]
        return a
    for lst in ends.values():
        for a in lst[1:]: par[f(a)]=f(lst[0])
    comp={}
    for i in range(len(items)): comp.setdefault(f(i),[]).append(i)
    return comp
good=set()
for c,idx in components(keep).items():
    tot=sum(plen(keep[i]['P']) for i in idx)
    touch=any(oldT.query(keep[i]['P'][e])[0]<25 for i in idx for e in (0,-1))
    if tot>=150 or (touch and tot>=60): good.update(idx)
keep=[keep[i] for i in sorted(good)]
print('after comp filter',len(keep),'km',round(sum(plen(k['P']) for k in keep)/1000,1))

def chain_merge(items):
    node={}
    for i,k in enumerate(items):
        node.setdefault(key(k['P'][0]),[]).append((i,0)); node.setdefault(key(k['P'][-1]),[]).append((i,1))
    used=[False]*len(items); res=[]
    def ok_join(A,B):
        va=A[-1]-A[-2]; vb=B[1]-B[0]
        return np.dot(va,vb)/(np.linalg.norm(va)*np.linalg.norm(vb)+1e-9)>0.3
    def extend(P,w,L,k,cur):
        while True:
            allt=node.get(k,[])
            lst=[t for t in allt if t[0]!=cur]
            if len(allt)!=2 or len(lst)!=1: break
            j,e=lst[0]
            if used[j]: break
            B=items[j]['P'] if e==0 else items[j]['P'][::-1]
            if len(P)<2 or len(B)<2 or not ok_join(P,B): break
            used[j]=True; lb=plen(B); w=(w*L+items[j]['w']*lb)/(L+lb+1e-9); L+=lb
            P=np.vstack([P,B[1:]]); cur=j; k=key(B[-1])
        return P,w,L
    for i,k in enumerate(items):
        if used[i]: continue
        used[i]=True; P=k['P']; w=k['w']; L=plen(P)
        P,w,L=extend(P,w,L,key(P[-1]),i)
        R,w,L=extend(P[::-1],w,L,key(P[0]),i)
        res.append({'P':R[::-1],'w':w})
    return res
keep=chain_merge(keep)
print('after chain merge',len(keep))
for k in keep:
    P=k['P'].copy()
    for e in (0,-1):
        d,ii=oldT.query(P[e])
        if d<16: P[e]=oldpts[ii]
    k['P']=P

lab=[]
for fr,lst in LABELS.items():
    cx,cy=ll(*FR[fr])
    for nm,px,py in lst: lab.append((nm, cx+(px-756)*M, cy-(py-385.5)*M))
names=[None]*len(keep); score=[1e9]*len(keep)
dp=[];di=[]
for i,k in enumerate(keep):
    D=densify(k['P'],2); dp.append(D); di.append(np.full(len(D),i))
dp=np.vstack(dp); di=np.concatenate(di); T=cKDTree(dp)
for nm,x,y in lab:
    d,ii=T.query([x,y]); bi=int(di[ii])
    if d<30 and d<score[bi]: names[bi]=nm; score[bi]=d
for it in range(4):
    endm={}
    for i,k in enumerate(keep):
        for e in (0,-1): endm.setdefault(key(k['P'][e]),[]).append((i,e))
    for lst in endm.values():
        for (i,e) in lst:
            if names[i]: continue
            for (j,e2) in lst:
                if j==i or not names[j]: continue
                A=keep[i]['P']; B=keep[j]['P']
                va=(A[1]-A[0]) if e==0 else (A[-1]-A[-2]); vb=(B[1]-B[0]) if e2==0 else (B[-1]-B[-2])
                c=abs(np.dot(va,vb))/(np.linalg.norm(va)*np.linalg.norm(vb)+1e-9)
                if c>0.85: names[i]=names[j]; break
res=[]
for i,k in enumerate(keep):
    w=k['w']; cls=2 if w>=3.2 else (1 if w>=2.0 else 0)
    res.append({'nm':names[i] or '','cls':cls,'pts':k['P'].round(1).tolist(),'w':round(w,2)})
json.dump(res,open('maps/new_lines.json','w'))
print('new lines',len(res),'named',sum(1 for o in res if o['nm']),'km',round(sum(plen(np.array(o['pts'])) for o in res)/1000,1),'cls',[sum(1 for o in res if o['cls']==c) for c in (0,1,2)])
print('unused labels', sorted(set(l[0] for l in lab)-set(n for n in names if n)))
